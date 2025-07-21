const PromoCode = require("../models/collections/PromoCode");

// GET /api/promos/:code
exports.validatePromoCode = async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const promo = await PromoCode.findOne({ code });

    if (!promo || !promo.isActive || promo.expiresAt < new Date()) {
      return res.status(404).json({ message: "Mã khuyến mãi không hợp lệ hoặc đã hết hạn." });
    }

    return res.status(200).json({ code: promo.code, discount: promo.discount });
  } catch (error) {
    console.error("Lỗi khi kiểm tra mã khuyến mãi:", error);
    return res.status(500).json({ message: "Lỗi server." });
  }
};

// (Optional) POST /api/promos (admin only)
exports.createPromoCode = async (req, res) => {
  try {
    const { code, discount, expiresAt } = req.body;

    const promo = new PromoCode({ code, discount, expiresAt });
    await promo.save();

    return res.status(201).json({ message: "Tạo mã thành công", data: promo });
  } catch (error) {
    console.error("Lỗi khi tạo mã:", error);
    return res.status(500).json({ message: "Lỗi server." });
  }
};
