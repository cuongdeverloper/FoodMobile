# 🍽️ OrderFood App

A **mobile food ordering application** built with **React Native (Expo)** for frontend and **Node.js + Express + MongoDB** for backend. The app allows users to **browse food menus, manage their cart, place orders**, and handle authentication – all in a modern, intuitive UI.

> 🔮 **Coming Soon: AI-Powered Recommendation System**  
> We plan to integrate **AI-based food recommendation** using user behavior, location, and order history to suggest meals you'll love.

---

## 🧠 Introduction

OrderFood is a full-stack mobile app where users can:
- Register or log in securely
- Browse categorized food menus
- Add items to a cart and place orders
- View past orders and manage their profile
- Track restaurants on map based on location

This project is ideal for learning mobile development with a backend and setting up for AI-powered personalization in the future.

---

## 🤖 Future AI Features (Coming Soon)

- 🍱 **Smart Meal Recommendations**: Using Machine Learning to analyze user preferences & ordering patterns
- 🧠 **NLP-Based Search**: Let users search dishes using natural language (e.g., "low-carb breakfast")
- 📍 **Location-aware Suggestions**: Recommend trending dishes nearby
- 🔊 **Voice Ordering** (with Speech-to-Text integration)

---

## 🧰 Tech Stack

### Frontend (Mobile - Expo)
- React Native v19
- Expo SDK 53 (`expo-router`, `expo-location`, `expo-image-picker`, `expo-constants`)
- React Navigation (Stack + Drawer + Tabs)
- Axios
- Formik & Yup
- AsyncStorage
- Ant Design UI
- Toasts, Modals, Carousel

### Backend (API - Node.js)
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing
- CORS, dotenv for configs

---

## 📦 Project Structure

Start Backend:
cd FoodBe
npm install
npm start

Start Frontend:
cd FoodFe
npm install
npm start
