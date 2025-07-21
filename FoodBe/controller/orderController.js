const Order = require('../models/collections/Order');
const CartItem = require('../models/collections/CartItem');

// Tạo đơn hàng mới
const createOrder = async (req, res) => {
  try {
    const { address, phone, items, total, promoCode, discount, name } = req.body;
    const userId = req.user.id;
    if (!address || !phone || !items || !total) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin đơn hàng' });
    }
    // Tạo đơn hàng
    const order = await Order.create({
      userId,
      name,
      items,
      total,
      address,
      phone,
      promoCode,
      discount,
      status: 'pending',
    });
    // Xóa cart sau khi đặt hàng
    await CartItem.deleteMany({ userId });
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Lấy danh sách đơn hàng của user
const getOrdersByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId }).populate('items.itemId').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ message: 'Order already completed or cancelled' });
    }
    order.status = 'cancelled';
    await order.save();
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const finishOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ message: 'Order already completed or cancelled' });
    }
    order.status = 'delivered';
    await order.save();
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = { createOrder, getOrdersByUser, finishOrder, cancelOrder }; 