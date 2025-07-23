const express = require('express');
const router = express.Router();
const { createOrder, getOrdersByUser  , cancelOrder,
    finishOrder } = require('../controller/orderController');
const { checkAccessToken } = require('../middleware/JWTAction');

router.use(checkAccessToken);

router.post('/', createOrder); // Tạo đơn hàng mới
router.get('/', getOrdersByUser); // Lấy danh sách đơn hàng của user
router.patch('/:id/cancel', cancelOrder);
router.patch('/:id/finish', finishOrder);

module.exports = router; 