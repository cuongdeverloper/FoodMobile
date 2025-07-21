const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  title: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);
