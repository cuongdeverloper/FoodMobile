const express = require("express");
const router = express.Router();
const { getCart, addToCart, removeFromCart, clearCart, updateQuantity } = require("../controller/cartController");
const { checkAccessToken } = require("../middleware/JWTAction");

router.use(checkAccessToken); // 🔒 bảo vệ toàn bộ cart routes

router.get("/", getCart);
router.post("/", addToCart);
router.delete("/:id", removeFromCart);
router.delete("/", clearCart);
router.put("/:id", updateQuantity); 

module.exports = router;