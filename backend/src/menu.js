const express = require('express');
const router = express.Router();
const { MenuCategory, MenuItem } = require('./models/MenuItem');
const { requireAuth } = require('./auth');

// ═══════════════════════════════════════════════════════════
// SETUP — seeds the real Cheesy Crust menu (from the physical menu card)
// Visit once: http://localhost:5000/api/menu/setup
// ═══════════════════════════════════════════════════════════
router.get('/setup', async (req, res) => {
  try {
    const existing = await MenuCategory.countDocuments();
    if (existing > 0) {
      return res.json({ message: 'Setup already done — categories exist.' });
    }

    const pizzaSizes = ['S', 'M', 'L', 'XL'];
    const mkPizzaVariants = (prices) => pizzaSizes.map((s, i) => ({ label: s, price: prices[i] }));

    const catDefs = [
      { name: 'Pizza', slug: 'pizza', display_order: 1 },
      { name: 'Chef Special', slug: 'chef-special', display_order: 2 },
      { name: "Pasta's", slug: 'pastas', display_order: 3 },
      { name: 'Spine Roll', slug: 'spine-roll', display_order: 4 },
      { name: 'Extra Topping', slug: 'extra-topping', display_order: 5 },
      { name: 'Jalebi', slug: 'jalebi', display_order: 6 },
      { name: 'Drinks', slug: 'drinks', display_order: 7 },
    ];
    const cats = {};
    for (const c of catDefs) cats[c.slug] = await MenuCategory.create(c);

    const items = [
      // Pizza — S/M/L/XL, all same price ladder on the card
      ...['Chicken Special Pizza', 'Chicken Tikka Pizza', 'Chicken Fajita Pizza', 'Chicken Supreme Pizza',
          'Chicken Euro Pizza', 'Bon Fire Pizza', 'Peri Peri Pizza', 'Cheese Lover Pizza']
        .map((name, i) => ({
          category_id: cats.pizza._id, name, display_order: i,
          variants: mkPizzaVariants([499, 899, 1299, 1699]),
        })),

      // Chef Special — M/L/XL (most items), Square Pizza is M/L only
      { category_id: cats['chef-special']._id, name: 'Malai Boti Pizza', display_order: 0,
        variants: [{ label: 'M', price: 949 }, { label: 'L', price: 1349 }, { label: 'XL', price: 1749 }] },
      { category_id: cats['chef-special']._id, name: 'Behari Pizza', display_order: 1,
        variants: [{ label: 'M', price: 1099 }, { label: 'L', price: 1499 }, { label: 'XL', price: 2099 }] },
      { category_id: cats['chef-special']._id, name: 'Kabab Stuffer Pizza', display_order: 2,
        variants: [{ label: 'M', price: 1099 }, { label: 'L', price: 1499 }, { label: 'XL', price: 2099 }] },
      { category_id: cats['chef-special']._id, name: 'Chicken Cheese Stuffer', display_order: 3,
        variants: [{ label: 'M', price: 1099 }, { label: 'L', price: 1499 }, { label: 'XL', price: 2099 }] },
      { category_id: cats['chef-special']._id, name: 'Crown Crust', display_order: 4,
        variants: [{ label: 'M', price: 1099 }, { label: 'L', price: 1499 }, { label: 'XL', price: 2099 }] },
      { category_id: cats['chef-special']._id, name: 'Square Pizza', display_order: 5,
        variants: [{ label: 'M', price: 1199 }, { label: 'L', price: 1599 }] },

      // Pasta's — F1/F2 (two portion sizes on the card)
      ...[['Chef Special Pasta', 399, 599], ['Flaming Pasta', 399, 599], ['Creamy Pasta', 399, 599], ['Crunchy Pasta', 499, 699]]
        .map(([name, f1, f2], i) => ({
          category_id: cats.pastas._id, name, display_order: i,
          variants: [{ label: 'F1', price: f1 }, { label: 'F2', price: f2 }],
        })),

      // Spine Roll — single price
      ...[['Stuffed Chicken Roll', 599], ['Bhari Roll', 599], ['Chilli Milli Roll', 599]]
        .map(([name, price], i) => ({
          category_id: cats['spine-roll']._id, name, display_order: i,
          variants: [{ label: 'Regular', price }],
        })),

      // Extra Topping — sold as add-ons, size = amount of topping
      { category_id: cats['extra-topping']._id, name: 'Extra Topping', display_order: 0,
        variants: [{ label: 'Small', price: 100 }, { label: 'Medium', price: 120 }, { label: 'Large', price: 180 }, { label: 'Extra Large', price: 280 }] },

      // Jalebi & snacks — mostly per-kg, a few single-price items
      { category_id: cats.jalebi._id, name: 'Jalebi', display_order: 0, variants: [{ label: '1kg', price: 700 }] },
      { category_id: cats.jalebi._id, name: 'Touch Jalebi', display_order: 1, variants: [{ label: '1kg', price: 1200 }] },
      { category_id: cats.jalebi._id, name: 'Jalebi Sugar Free', display_order: 2, variants: [{ label: '1kg', price: 1400 }] },
      { category_id: cats.jalebi._id, name: 'Andrasay', display_order: 3, variants: [{ label: '1kg', price: 700 }] },
      { category_id: cats.jalebi._id, name: 'Somosa', display_order: 4, variants: [{ label: 'Piece', price: 60 }] },
      { category_id: cats.jalebi._id, name: 'Chicken Somosa', display_order: 5, variants: [{ label: 'Piece', price: 30 }] },
      { category_id: cats.jalebi._id, name: 'Chicken Roll', display_order: 6, variants: [{ label: 'Piece', price: 60 }] },
      { category_id: cats.jalebi._id, name: 'Pokoray', display_order: 7, variants: [{ label: '1kg', price: 600 }] },
      { category_id: cats.jalebi._id, name: 'Nimak Paray', display_order: 8, variants: [{ label: '1kg', price: 600 }] },

      // Drinks
      { category_id: cats.drinks._id, name: 'Soft Drink', display_order: 0, variants: [{ label: '345ml', price: 70 }, { label: '0.5 Ltr', price: 100 }, { label: '1.5 Ltr', price: 200 }] },
      { category_id: cats.drinks._id, name: 'Mineral Water', display_order: 1, variants: [{ label: '0.5 Ltr', price: 50 }, { label: '1.5 Ltr', price: 100 }] },
    ];

    await MenuItem.insertMany(items);
    res.json({ message: `✅ Setup complete: ${catDefs.length} categories, ${items.length} items created.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/menu — public, grouped by category, only active/available
router.get('/', async (req, res) => {
  try {
    const categories = await MenuCategory.find({ is_active: true }).sort({ display_order: 1 });
    const items = await MenuItem.find({ is_available: true }).sort({ display_order: 1 });
    const grouped = categories.map(cat => ({
      category: cat,
      // strip `cost` (admin-only) and stock internals before sending to customers
      items: items
        .filter(i => String(i.category_id) === String(cat._id))
        .map(i => {
          const obj = i.toObject();
          obj.variants = obj.variants.map(({ label, price }) => ({ label, price }));
          return obj;
        }),
    }));
    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/menu/admin — all items regardless of availability, for admin table
router.get('/admin', requireAuth, async (req, res) => {
  try {
    const categories = await MenuCategory.find().sort({ display_order: 1 });
    const items = await MenuItem.find().sort({ display_order: 1 });
    res.json({ categories, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/menu/categories — admin
router.post('/categories', requireAuth, async (req, res) => {
  try {
    const cat = await MenuCategory.create(req.body);
    res.status(201).json(cat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/menu/items — admin
router.post('/items', requireAuth, async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/menu/items/:id — admin (edit price, availability, etc)
router.put('/items/:id', requireAuth, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/menu/items/:id — admin
router.delete('/items/:id', requireAuth, async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
