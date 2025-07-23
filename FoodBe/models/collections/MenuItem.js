const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  title: String,
  description: String,
  additionalPrice: Number,
}, { _id: false });

const menuItemSchema = new mongoose.Schema({
  menu: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
  title: { type: String, required: true },
  basePrice: { type: Number, required: true },
  image: String,
  options: [optionSchema],
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
