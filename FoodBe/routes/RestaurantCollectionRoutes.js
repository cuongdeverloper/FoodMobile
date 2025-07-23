const express = require("express");
const Restaurant = require("../models/collections/Restaurant");
const Menu = require("../models/collections/Menu");
const MenuItem = require("../models/collections/MenuItem");
const {
  getTopRatedOnly5Stars,
  getNewcomerRestaurants,
  getTopFreeShipRestaurants,
  fetchRestaurantById,
} = require("../controller/restaurantController");
const { getMenuItemById, getMenuItemDetail } = require("../controller/menuItemController");
const router = express.Router();

// Create
router.post("/restaurant", async (req, res) => {
  try {
    const restaurant = new Restaurant(req.body);
    const result = await restaurant.save();
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Read all
router.get("/restaurant", async (req, res) => {
  try {
    const data = await Restaurant.find();

    res.status(201).json({
      statusCode: 201,
      message: "Tat ca quan",
      data: data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read by ID
router.get("/restaurant/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    res.json(restaurant);
  } catch (err) {
    res.status(404).json({ error: "Not found" });
  }
});

// Update
router.put("/restaurant/:id", async (req, res) => {
  try {
    const updated = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete
router.delete("/restaurant/:id", async (req, res) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/menu", async (req, res) => {
  try {
    const menu = new Menu(req.body);
    const result = await menu.save();
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all menus or by restaurant
router.get("/menu", async (req, res) => {
  try {
    const { restaurantId } = req.query;
    const query = restaurantId ? { restaurant: restaurantId } : {};
    const data = await Menu.find(query).populate("restaurant");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get by ID
router.get("/menu/:id", async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id).populate("restaurant");
    res.json(menu);
  } catch (err) {
    res.status(404).json({ error: "Not found" });
  }
});

// Update
router.put("/menu/:id", async (req, res) => {
  try {
    const updated = await Menu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete
router.delete("/menu/:id", async (req, res) => {
  try {
    await Menu.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/menuItem/", async (req, res) => {
  try {
    const item = new MenuItem(req.body);
    const result = await item.save();
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Read all or by menu ID
router.get("/menuItem/", async (req, res) => {
  try {
    const { menuId } = req.query;
    const query = menuId ? { menu: menuId } : {};
    const data = await MenuItem.find(query).populate("menu");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get by ID
router.get("/menuItem/:id", async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate("menu");

    if (!item) {
      return sendApiResponse(res, 404, 1, "Menu item not found", null);
    }
    sendApiResponse(res, 200, 0, "Menu item fetched successfully", item);
  } catch (err) {
    sendApiResponse(
      res,
      400,
      1,
      "Invalid menu item ID or database error: " + err.message,
      null
    );
  }
});

// Update
router.put("/menuItem/:id", async (req, res) => {
  try {
    const updated = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete
router.delete("/menuItem/:id", async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.get("/menu-items/:id", getMenuItemDetail);
router.get("/top-rating", getTopRatedOnly5Stars);
router.get("/newcomer", getNewcomerRestaurants);
router.get("/top-freeship", getTopFreeShipRestaurants);

router.get("/:id", fetchRestaurantById);
module.exports = router;
