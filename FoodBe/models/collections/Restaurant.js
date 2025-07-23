const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: String,
  address: String,
  email: String,
  rating: { type: Number, default: 0 },
  image: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
