const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }, // bcrypt hash
  role:     { type: String, default: 'admin' },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = { User };
