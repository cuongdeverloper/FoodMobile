const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  title: String,
  quantity: Number,
  basePrice: Number,
  options: [
    {
      title: String,
      additionalPrice: Number,
    },
  ],
  image: String,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, default: 'pending' }, // pending, delivering, delivered, cancelled
  promoCode: { type: String },
  discount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema); 