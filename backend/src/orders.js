const express = require('express');
const router = express.Router();
const { Order } = require('./models/Order');
const { MenuItem } = require('./models/MenuItem');
const { requireAuth } = require('./auth');

async function nextOrderNumber() {
  const count = await Order.countDocuments();
  const today = new Date();
  const stamp = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  return `GJ-${stamp}-${String(count + 1).padStart(4, '0')}`;
}

// POST /api/orders — public, customer places an order from the storefront
router.post('/', async (req, res) => {
  try {
    const { customer_name, customer_phone, delivery_address, notes, items, payment_type, delivery_fee } = req.body;

    if (!customer_name || !customer_phone || !delivery_address) {
      return res.status(400).json({ error: 'Name, phone and delivery address are required' });
    }
    if (!items || !items.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // re-price server-side from the DB — never trust prices sent from the client
    const builtItems = [];
    let subtotal = 0;
    for (const line of items) {
      const menuItem = await MenuItem.findById(line.menu_item_id);
      if (!menuItem || !menuItem.is_available) {
        return res.status(400).json({ error: `Item unavailable: ${line.name || line.menu_item_id}` });
      }
      const variant = menuItem.variants.find(v => v.label === line.variant_label);
      if (!variant) {
        return res.status(400).json({ error: `Invalid size for ${menuItem.name}` });
      }
      const qty = Math.max(1, Number(line.quantity) || 1);
      const line_total = variant.price * qty;
      subtotal += line_total;
      builtItems.push({
        menu_item_id: menuItem._id,
        name: menuItem.name,
        variant_label: variant.label,
        unit_price: variant.price,
        unit_cost: variant.cost || 0,
        quantity: qty,
        line_total,
      });
    }

    const fee = Number(delivery_fee) || 0;
    const order = await Order.create({
      order_number: await nextOrderNumber(),
      customer_name, customer_phone, delivery_address, notes,
      items: builtItems,
      subtotal,
      delivery_fee: fee,
      total_amount: subtotal + fee,
      payment_type: payment_type || 'cod',
    });

    res.status(201).json(order);
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id — public, track a single order (order confirmation page)
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders — admin, list orders (filter by status/search/date range)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, archived, search, from, to } = req.query;
    const filter = { archived: archived === 'true' };
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { customer_name: { $regex: search, $options: 'i' } },
        { customer_phone: { $regex: search, $options: 'i' } },
        { order_number: { $regex: search, $options: 'i' } },
      ];
    }
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(`${from}T00:00:00`);
      if (to) filter.createdAt.$lte = new Date(`${to}T23:59:59.999`);
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:id/paid — admin, mark cash/payment as collected (or reverse a mistake)
router.put('/:id/paid', requireAuth, async (req, res) => {
  try {
    const { is_paid } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { is_paid: !!is_paid }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/orders/:id/archive — admin, soft-delete/restore (mirrors HK Cables' "Reset Data" pattern)
router.put('/:id/archive', requireAuth, async (req, res) => {
  try {
    const { archived } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { archived: !!archived }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/orders/:id/status — admin, move order through the lifecycle
router.put('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
