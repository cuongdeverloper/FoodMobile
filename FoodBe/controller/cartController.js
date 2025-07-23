// === 2. CONTROLLERS ===
// controllers/cartController.js
const CartItem = require("../models/collections/CartItem");
const MenuItem = require("../models/collections/MenuItem");

const getCart = async (req, res) => {
  try {
    const cart = await CartItem.find({ userId: req.user.id })
      .populate({
        path: 'itemId',
        select: 'image title' // Select 'image' and 'title' (title is good for redundancy/cross-check)
      });
    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const addToCart = async (req, res) => {
  try {
    const { itemId, title, quantity, basePrice, options } = req.body;

    // Kiểm tra nếu món đã có trong giỏ → tăng số lượng
    const existingItem = await CartItem.findOne({ userId: req.user._id, itemId });
    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
      return res.status(200).json({ success: true, data: existingItem });
    }

    const newItem = new CartItem({
      userId: req.user.id,
      itemId,
      title,
      quantity,
      basePrice,
      options,
    });
    const saved = await newItem.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const itemId = req.params.id;
    await CartItem.findOneAndDelete({ userId: req.user.id, _id: itemId });
    res.status(200).json({ success: true, message: "Removed" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const clearCart = async (req, res) => {
  try {
    await CartItem.deleteMany({ userId: req.user.id });
    res.status(200).json({ success: true, message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const updateQuantity = async (req, res) => {
    try {
      const { quantity } = req.body;
      if (quantity < 1) {
        return res.status(400).json({ success: false, message: "Số lượng không hợp lệ" });
      }
  
      const updated = await CartItem.findOneAndUpdate(
        { userId: req.user.id, _id: req.params.id },
        { $set: { quantity } },
        { new: true }
      );
  
      if (!updated) {
        return res.status(404).json({ success: false, message: "Không tìm thấy mục giỏ hàng" });
      }
  
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

module.exports = { getCart, addToCart, removeFromCart, clearCart, updateQuantity };
