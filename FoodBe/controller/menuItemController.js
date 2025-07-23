const MenuItem = require("../models/collections/MenuItem");

// CREATE
const createMenuItem = async (data) => {
  const menuItem = new MenuItem(data);
  return await menuItem.save();
};

// READ
const getItemsByMenu = async (menuId) => {
  return await MenuItem.find({ menu: menuId });
};
const getMenuItemDetail = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Không tìm thấy món ăn" });
    }

    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    return res.status(400).json({ success: false, message: "Lỗi server", error: err.message });
  }
};

// UPDATE
const updateMenuItem = async (id, data) => {
  return await MenuItem.findByIdAndUpdate(id, data, { new: true });
};

// DELETE
const deleteMenuItem = async (id) => {
  return await MenuItem.findByIdAndDelete(id);
};

module.exports ={createMenuItem,getItemsByMenu,updateMenuItem,deleteMenuItem,getMenuItemDetail}