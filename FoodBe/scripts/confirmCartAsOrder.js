const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/user');
const CartItem = require('../models/collections/CartItem');
const Order = require('../models/collections/Order');

dotenv.config();

const TEST_USERLOGIN = 'testuser01';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Lấy user test
    const user = await User.findOne({ userLogin: TEST_USERLOGIN });
    if (!user) throw new Error('Không tìm thấy user test');

    // Lấy cart items
    const cartItems = await CartItem.find({ userId: user._id });
    if (cartItems.length === 0) throw new Error('Giỏ hàng trống');

    // Tạo đơn hàng
    const order = await Order.create({
      userId: user._id,
      items: cartItems.map(item => ({
        itemId: item.itemId,
        title: item.title,
        quantity: item.quantity,
        basePrice: item.basePrice,
        options: item.options,
      })),
      total: cartItems.reduce((sum, item) => sum + (item.basePrice + (item.options?.reduce((s, o) => s + (o.additionalPrice || 0), 0) || 0)) * item.quantity, 0),
      address: user.address || '123 Test St',
      phone: user.phone || '0123456789',
      status: 'pending',
    });
    console.log('✅ Đã tạo đơn hàng:', order._id);

    // Xóa cart
    await CartItem.deleteMany({ userId: user._id });
    console.log('🧹 Đã xóa giỏ hàng sau khi xác nhận đơn.');
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
};

run(); 