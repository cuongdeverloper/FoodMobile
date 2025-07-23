const Review = require('../models/collections/Review');
const Order = require('../models/collections/Order');
const mongoose = require('mongoose');

// Tạo review mới (1 user chỉ 1 review cho 1 món)
const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId, rating, comment } = req.body;
    
    if (!itemId || !rating) {
      return res.status(400).json({ success: false, message: 'Thiếu itemId hoặc rating' });
    }

    // Kiểm tra rating hợp lệ
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating phải từ 1 đến 5' });
    }

    // Kiểm tra comment không quá dài
    if (comment && comment.length > 500) {
      return res.status(400).json({ success: false, message: 'Comment không được quá 500 ký tự' });
    }

    // Kiểm tra đã review chưa
    const existed = await Review.findOne({ userId, itemId });
    if (existed) {
      return res.status(400).json({ success: false, message: 'Bạn đã review món này rồi' });
    }

    // Kiểm tra người dùng đã mua hàng chưa
    const hasPurchased = await Order.findOne({
      userId,
      'items.itemId': itemId,
      status: { $in: ['delivered', 'completed'] } // Chỉ cho phép review sau khi đã nhận hàng
    });

    if (!hasPurchased) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bạn phải mua và nhận hàng trước khi có thể review' 
      });
    }

    const review = await Review.create({ userId, itemId, rating, comment });
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Lấy tất cả review của 1 món ăn
const getReviewsByItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { page = 1, limit = 10 } = req.query; // Thêm phân trang
    
    // Kiểm tra itemId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ success: false, message: 'ItemId không hợp lệ' });
    }

    const skip = (page - 1) * limit;
    
    const reviews = await Review.find({ itemId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Review.countDocuments({ itemId });
    
    res.status(200).json({ 
      success: true, 
      data: reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
        hasNextPage: skip + reviews.length < total,
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Lấy rating trung bình của 1 món ăn
const getAverageRating = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    // Kiểm tra itemId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ success: false, message: 'ItemId không hợp lệ' });
    }

    const result = await Review.aggregate([
      { $match: { itemId: new mongoose.Types.ObjectId(itemId) } },
      { $group: { _id: '$itemId', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    
    if (result.length === 0) {
      return res.status(200).json({ success: true, avg: 0, count: 0 });
    }
    
    res.status(200).json({ 
      success: true, 
      avg: Math.round(result[0].avg * 10) / 10, // Làm tròn đến 1 chữ số thập phân
      count: result[0].count 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Kiểm tra xem người dùng có thể review món ăn hay không
const checkCanReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    
    // Kiểm tra itemId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ success: false, message: 'ItemId không hợp lệ' });
    }

    // Kiểm tra đã review chưa
    const existed = await Review.findOne({ userId, itemId });
    if (existed) {
      return res.status(200).json({ 
        success: true, 
        canReview: false, 
        message: 'Bạn đã review món này rồi',
        existingReview: existed
      });
    }

    // Kiểm tra đã mua hàng chưa
    const hasPurchased = await Order.findOne({
      userId,
      'items.itemId': itemId,
      status: { $in: ['delivered', 'completed'] }
    });

    if (!hasPurchased) {
      return res.status(200).json({ 
        success: true, 
        canReview: false, 
        message: 'Bạn phải mua và nhận hàng trước khi có thể review' 
      });
    }

    res.status(200).json({ 
      success: true, 
      canReview: true, 
      message: 'Bạn có thể review món này' 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Lấy review của người dùng hiện tại cho một món ăn
const getUserReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    
    // Kiểm tra itemId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ success: false, message: 'ItemId không hợp lệ' });
    }

    const review = await Review.findOne({ userId, itemId });
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bạn chưa review món này' 
      });
    }

    res.status(200).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Cập nhật review của người dùng
const updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { rating, comment } = req.body;
    
    // Kiểm tra itemId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ success: false, message: 'ItemId không hợp lệ' });
    }

    // Kiểm tra rating hợp lệ
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ success: false, message: 'Rating phải từ 1 đến 5' });
    }

    // Kiểm tra comment không quá dài
    if (comment && comment.length > 500) {
      return res.status(400).json({ success: false, message: 'Comment không được quá 500 ký tự' });
    }

    const review = await Review.findOne({ userId, itemId });
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy review của bạn cho món này' 
      });
    }

    // Cập nhật review
    const updateData = {};
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;

    const updatedReview = await Review.findByIdAndUpdate(
      review._id,
      updateData,
      { new: true }
    );

    res.status(200).json({ success: true, data: updatedReview });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Xóa review của người dùng
const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    
    // Kiểm tra itemId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ success: false, message: 'ItemId không hợp lệ' });
    }

    const review = await Review.findOne({ userId, itemId });
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy review của bạn cho món này' 
      });
    }

    await Review.findByIdAndDelete(review._id);

    res.status(200).json({ 
      success: true, 
      message: 'Đã xóa review thành công' 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { 
  createReview, 
  getReviewsByItem, 
  getAverageRating, 
  checkCanReview, 
  getUserReview, 
  updateReview, 
  deleteReview 
}; 