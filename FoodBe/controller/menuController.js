const Menu = require("../models/collections/Menu");

// CREATE
const createMenu = async (data) => {
  const menu = new Menu(data);
  return await menu.save();
};

// READ
const getMenusByRestaurant = async (restaurantId) => {
  return await Menu.find({ restaurant: restaurantId });
};

// UPDATE
const updateMenu = async (id, data) => {
  return await Menu.findByIdAndUpdate(id, data, { new: true });
};

// DELETE
const deleteMenu = async (id) => {
  return await Menu.findByIdAndDelete(id);
};
module.exports = {createMenu,getMenusByRestaurant,updateMenu,deleteMenu}
