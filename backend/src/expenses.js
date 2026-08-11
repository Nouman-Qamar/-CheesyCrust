const express = require('express');
const router = express.Router();
const { Expense } = require('./models/Expense');
const { requireAuth } = require('./auth');

// GET /api/expenses?from=&to= — admin
router.get('/', requireAuth, async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = {};
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(`${from}T00:00:00`);
      if (to) filter.date.$lte = new Date(`${to}T23:59:59.999`);
    }
    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/expenses — admin
router.post('/', requireAuth, async (req, res) => {
  try {
    const { date, category, description, amount } = req.body;
    if (!description || !amount) {
      return res.status(400).json({ error: 'Description and amount are required' });
    }
    const expense = await Expense.create({ date: date || Date.now(), category, description, amount });
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/expenses/:id — admin
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
