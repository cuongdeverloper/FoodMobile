const Menu = require("../models/collections/Menu");
const MenuItem = require("../models/collections/MenuItem");
const Restaurant = require("../models/collections/Restaurant");

// CREATE
const createRestaurant = async (data) => {
  const restaurant = new Restaurant(data);
  return await restaurant.save();
};

// READ
const getAllRestaurants = async () => {
  return await Restaurant.find();
};

const getRestaurantById = async (id) => {
  return await Restaurant.findById(id);
};

// UPDATE
const updateRestaurant = async (id, data) => {
  return await Restaurant.findByIdAndUpdate(id, data, { new: true });
};

// DELETE
const deleteRestaurant = async (id) => {
  return await Restaurant.findByIdAndDelete(id);
};


const getTopRatedOnly5Stars = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({
      rating: 5
    }).sort({ updatedAt: -1 }); 

    res.status(201).json({
      statusCode: 201,
      message: "Top Quán Rating 5*",
      data: restaurants
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: "Lỗi khi lấy danh sách quán rating 5*",
      error: err.message
    });
  }
};

const getNewcomerRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({})
      .sort({ createdAt: -1 }) 
      .limit(10); 

    res.status(201).json({
      statusCode: 201,
      message: "Quán Mới Lên Sàn",
      data: restaurants
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: "Lỗi khi lấy danh sách quán mới",
      error: err.message
    });
  }
};
const getTopFreeShipRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({
      isActive: true,
      rating: { $gte: 4.5 } // rating cao
    })
      .sort({ rating: -1 }) // cao nhất lên đầu
      .limit(10);

    res.status(201).json({
      statusCode: 201,
      message: "Ăn Thỏa Thích, Freeship 0Đ",
      data: restaurants
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: "Lỗi khi lấy danh sách quán freeship",
      error: err.message
    });
  }
};

const fetchRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm restaurant theo ID
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({
        statusCode: 404,
        message: 'Restaurant not found',
      });
    }

    // Tìm tất cả các menu của restaurant đó
    const menus = await Menu.find({ restaurant: id });

    // Với mỗi menu, gán thêm các menuItems tương ứng
    const menusWithItems = await Promise.all(
      menus.map(async (menu) => {
        const items = await MenuItem.find({ menu: menu._id });
        return {
          ...menu.toObject(),
          menuItems: items,
        };
      })
    );

    return res.status(200).json({
      statusCode: 200,
      message: 'Fetched restaurant successfully',
      data: {
        restaurant,
        menus: menusWithItems,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
};

module.exports = {getAllRestaurants,getRestaurantById,
  updateRestaurant,deleteRestaurant,
  getTopRatedOnly5Stars,getNewcomerRestaurants,getTopFreeShipRestaurants,fetchRestaurantById}