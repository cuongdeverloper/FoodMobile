const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, registerUser, updateUserProfile, getUserProfile, changePassword, getAddresses, updateAddresses } = require('../controller/userController');
const { checkAccessToken } = require('../middleware/JWTAction');

router.get('/', getAllUsers);
router.post('/', createUser);
router.post('/register', registerUser);
router.get('/profile', checkAccessToken, getUserProfile);
router.put('/profile', checkAccessToken, updateUserProfile);
router.put('/change-password', checkAccessToken, changePassword);
router.get('/addresses', checkAccessToken, getAddresses);
router.put('/addresses', checkAccessToken, updateAddresses);

module.exports = router;
