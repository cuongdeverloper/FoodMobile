const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const MenuItem = require('../models/collections/MenuItem');
const CartItem = require('../models/collections/CartItem');

dotenv.config();

const TEST_USERNAME = 'testuser';
const TEST_USERLOGIN = 'testuser01';
const TEST_PASSWORD = '123456';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Xóa user và cart cũ nếu có
    await User.deleteOne({ userLogin: TEST_USERLOGIN });
    console.log('🧹 Đã xóa user cũ (nếu có)');

    // Tạo user mới
    const user = await User.create({ 
      username: TEST_USERNAME, 
      userLogin: TEST_USERLOGIN, 
      password: TEST_PASSWORD,
      address: '123 Test St',
      phone: '0123456789'
    });
    console.log('👤 Đã tạo user:', user.username, user._id);

    // Lấy 2 sản phẩm bất kỳ
    const menuItems = await MenuItem.find({}).limit(2);
    if (menuItems.length < 2) throw new Error('Không đủ MenuItem để test');
    console.log('🍔 Chọn 2 sản phẩm:', menuItems.map(i => i.title));

    // Xóa cart cũ của user
    await CartItem.deleteMany({ userId: user._id });

    // Thêm vào cart
    for (const item of menuItems) {
      await CartItem.create({
        userId: user._id,
        itemId: item._id,
        title: item.title,
        quantity: 1,
        basePrice: item.basePrice,
        options: item.options && item.options.length > 0 ? [item.options[0]] : [],
      });
    }
    console.log('🛒 Đã thêm 2 sản phẩm vào giỏ hàng cho user test.');
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
};

run(); 