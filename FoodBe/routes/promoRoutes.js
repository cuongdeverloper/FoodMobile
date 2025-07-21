const express = require("express");
const router = express.Router();
const promoController = require("../controller/promoController");

// Kiểm tra mã hợp lệ
router.get("/:code", promoController.validatePromoCode);

// Tạo mã mới (nếu cần, hạn chế cho admin)
router.post("/", promoController.createPromoCode);

module.exports = router;
