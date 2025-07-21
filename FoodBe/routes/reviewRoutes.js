const express = require('express');
const router = express.Router();
const { 
  createReview, 
  getReviewsByItem, 
  getAverageRating, 
  checkCanReview, 
  getUserReview, 
  updateReview, 
  deleteReview 
} = require('../controller/reviewController');
const { checkAccessToken } = require('../middleware/JWTAction');

router.use(checkAccessToken);

router.post('/', createReview); // Tạo review mới
router.get('/check/:itemId', checkCanReview); // Kiểm tra có thể review hay không
router.get('/user/:itemId', getUserReview); // Lấy review của user hiện tại
router.get('/average/:itemId', getAverageRating); // Lấy rating trung bình
router.put('/:itemId', updateReview); // Cập nhật review
router.delete('/:itemId', deleteReview); // Xóa review
router.get('/:itemId', getReviewsByItem); // Lấy review theo itemId

module.exports = router; 