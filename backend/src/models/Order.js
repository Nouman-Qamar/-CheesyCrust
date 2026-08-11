const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menu_item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: String,            // snapshot — survives menu edits/deletes later
  variant_label: String,   // e.g. "Large", "1kg"
  unit_price: Number,
  unit_cost: { type: Number, default: 0 }, // snapshot of the variant's cost at order time, for profit reports
  quantity: Number,
  line_total: Number,
});

const orderSchema = new mongoose.Schema({
  order_number: { type: String, required: true, unique: true },

  // customer details — this is a public storefront, no account required
  customer_name: { type: String, required: true },
  customer_phone: { type: String, required: true },
  delivery_address: { type: String, required: true },
  notes: String, // "no onions", "call before arriving" etc

  items: [orderItemSchema],
  subtotal: Number,
  delivery_fee: { type: Number, default: 0 },
  total_amount: Number,

  payment_type: { type: String, enum: ['cod', 'easypaisa', 'jazzcash'], default: 'cod' },
  // Whether the money has actually been collected — separate from kitchen
  // status. A COD order can be "delivered" and still unpaid if the rider
  // hasn't handed over the cash yet; a shop owner needs to know that.
  is_paid: { type: Boolean, default: false },

  // order lifecycle, driven from the admin panel
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending',
  },

  archived: { type: Boolean, default: false },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

orderSchema.virtual('created_at').get(function () { return this.createdAt; });
orderSchema.virtual('updated_at').get(function () { return this.updatedAt; });

const Order = mongoose.model('Order', orderSchema);

module.exports = { Order };
