const express = require('express');
const router = express.Router();
const { addFavorite, removeFavorite, getFavorites } = require('../controller/favoriteController');
const { checkAccessToken } = require('../middleware/JWTAction');

router.use(checkAccessToken);

router.post('/', addFavorite); // Thêm món vào favorite
router.delete('/:id', removeFavorite); // Xóa món khỏi favorite
router.get('/', getFavorites); // Lấy danh sách favorite của user

module.exports = router; 