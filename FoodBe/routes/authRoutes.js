const express = require('express');
const router = express.Router();
const { apiLogin, getUserInfoFromToken } = require('../controller/authController');

router.post('/login', apiLogin);
router.get('/userInformation', getUserInfoFromToken);

module.exports = router;
