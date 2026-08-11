const mongoose = require('mongoose');

// A category groups items on the menu: Pizza, Chef Special, Pasta, Spine Roll,
// Extra Topping, Jalebi, Drinks — mirrors the sections on the physical menu.
const menuCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },       // e.g. "Pizza", "Chef Special", "Jalebi"
  slug: { type: String, required: true, unique: true },
  display_order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

// One price variant per item, e.g. { label: "Medium", price: 899 } or
// { label: "700g", price: 700 } — same shape covers size-based (S/M/L/XL),
// weight-based (per kg), and single-price items (one variant only).
// `cost` is optional and admin-only (never sent to the storefront) —
// entering it enables real profit reporting (revenue - cost) instead of
// just revenue, which HK Cables' own invoice model never tracked.
const priceVariantSchema = new mongoose.Schema({
  label: { type: String, required: true },   // "S", "M", "L", "XL", "1kg", "Small", "F1", "F2" etc
  price: { type: Number, required: true },
  cost: { type: Number, default: 0 },
}, { _id: false });

const menuItemSchema = new mongoose.Schema({
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuCategory', required: true },
  name: { type: String, required: true },
  description: String,
  image_url: String,
  variants: { type: [priceVariantSchema], required: true }, // always at least 1
  is_available: { type: Boolean, default: true },           // "86'd for the day" toggle — still the manual sold-out switch
  is_featured: { type: Boolean, default: false },           // show on home page highlights
  display_order: { type: Number, default: 0 },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

menuItemSchema.virtual('starting_price').get(function () {
  if (!this.variants || !this.variants.length) return null;
  return Math.min(...this.variants.map(v => v.price));
});

const MenuCategory = mongoose.model('MenuCategory', menuCategorySchema);
const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = { MenuCategory, MenuItem };
