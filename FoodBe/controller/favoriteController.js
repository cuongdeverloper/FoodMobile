const Favorite = require('../models/collections/Favorite');
const MenuItem = require('../models/collections/MenuItem');

// Thêm món vào favorite
const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId, restaurantId } = req.body;
    if (!itemId && !restaurantId) {
      return res.status(400).json({ success: false, message: 'Thiếu itemId hoặc restaurantId' });
    }
    
    const existed = await Favorite.findOne({ userId, ...(itemId ? { itemId } : { restaurantId }) });
    if (existed) return res.status(200).json({ success: true, data: existed });
    
    const fav = await Favorite.create({ userId, itemId, restaurantId });
    res.status(201).json({ success: true, data: fav });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Xóa món khỏi favorite
const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // id là itemId hoặc restaurantId
await Favorite.findOneAndDelete({
  userId,
  $or: [{ itemId: id }, { restaurantId: id }]
});
    res.status(200).json({ success: true, message: 'Đã xóa khỏi favorite' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Lấy danh sách favorite của user (kèm thông tin món ăn)
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await Favorite.find({ userId })
  .populate('itemId')
  .populate('restaurantId');
    res.status(200).json({ success: true, data: favorites });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { addFavorite, removeFavorite, getFavorites }; 