const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/RestaurantCollectionRoutes');
const cartRoutes = require('./routes/cartRoute')
const orderRoutes = require('./routes/orderRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const promoRoutes = require("./routes/promoRoutes");
dotenv.config();
connectDB(); 

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/promos", promoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auths', authRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use("/api/cart", cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/uploads', express.static('uploads'));
const PORT = process.env.PORT || 8181;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
