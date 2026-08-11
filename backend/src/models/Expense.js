const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  category: {
    type: String,
    enum: ['ingredients', 'gas', 'staff', 'rent', 'utilities', 'maintenance', 'other'],
    default: 'other',
  },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = { Expense };
