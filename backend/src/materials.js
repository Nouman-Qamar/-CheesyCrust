const express = require('express');
const router = express.Router();
const { RawMaterial } = require('./models/RawMaterial');
const { requireAuth } = require('./auth');

// GET /api/materials — admin, list all raw materials
router.get('/', requireAuth, async (req, res) => {
  try {
    const materials = await RawMaterial.find().sort({ name: 1 });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/materials — admin, add a new raw material
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, unit, quantity_on_hand, low_stock_threshold } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const material = await RawMaterial.create({
      name, unit, quantity_on_hand: quantity_on_hand || 0, low_stock_threshold: low_stock_threshold || 0,
    });
    res.status(201).json(material);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/materials/:id — admin, edit name/unit/threshold
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, unit, low_stock_threshold } = req.body;
    const material = await RawMaterial.findByIdAndUpdate(
      req.params.id,
      { ...(name && { name }), ...(unit && { unit }), ...(low_stock_threshold !== undefined && { low_stock_threshold }) },
      { new: true }
    );
    if (!material) return res.status(404).json({ error: 'Material not found' });
    res.json(material);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/materials/:id/purchase — admin, log a purchase (adds to quantity_on_hand)
router.post('/:id/purchase', requireAuth, async (req, res) => {
  try {
    const { quantity, cost, note } = req.body;
    if (!quantity || quantity <= 0) return res.status(400).json({ error: 'Quantity must be greater than 0' });

    const material = await RawMaterial.findById(req.params.id);
    if (!material) return res.status(404).json({ error: 'Material not found' });

    material.quantity_on_hand += Number(quantity);
    material.purchases.unshift({ quantity: Number(quantity), cost: Number(cost) || 0, note, date: new Date() });
    await material.save();
    res.json(material);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/materials/:id/use — admin, manually deduct (wastage, kitchen usage without a purchase)
router.post('/:id/use', requireAuth, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity <= 0) return res.status(400).json({ error: 'Quantity must be greater than 0' });

    const material = await RawMaterial.findById(req.params.id);
    if (!material) return res.status(404).json({ error: 'Material not found' });

    material.quantity_on_hand = Math.max(0, material.quantity_on_hand - Number(quantity));
    await material.save();
    res.json(material);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/materials/:id — admin
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await RawMaterial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Material deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
