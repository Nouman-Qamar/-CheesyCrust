const mongoose = require('mongoose');

// One log line per purchase — keeps a history instead of just overwriting
// a single running total, so "kitna kharida tha aur kab" stays visible.
const purchaseSchema = new mongoose.Schema({
  quantity: { type: Number, required: true },   // in the material's unit (kg, liter, piece...)
  cost: { type: Number, default: 0 },           // total cost of this purchase (optional)
  date: { type: Date, default: Date.now },
  note: String, // e.g. supplier name
}, { _id: false });

const rawMaterialSchema = new mongoose.Schema({
  name: { type: String, required: true },   // "Flour", "Mozzarella Cheese", "Chicken", "Sugar"
  unit: {
    type: String,
    enum: ['kg', 'g', 'liter', 'ml', 'piece', 'dozen', 'packet', 'bag'],
    default: 'kg',
  },
  quantity_on_hand: { type: Number, default: 0 }, // current stock in `unit`
  low_stock_threshold: { type: Number, default: 0 }, // 0 = no alert
  purchases: [purchaseSchema], // history — most recent purchases logged here
}, { timestamps: true });

const RawMaterial = mongoose.model('RawMaterial', rawMaterialSchema);

module.exports = { RawMaterial };
