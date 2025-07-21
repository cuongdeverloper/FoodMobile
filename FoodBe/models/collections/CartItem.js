// === 1. MODELS ===
// models/CartItem.js
const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
  title: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  basePrice: { type: Number, required: true },
  options: [
    {
      title: String,
      additionalPrice: Number,
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("CartItem", cartItemSchema);