const { createJWT, createRefreshToken, verifyAccessToken } = require("../middleware/JWTAction");
const user = require("../models/user");
const bcrypt = require('bcryptjs');

const apiLogin = async (req, res) => {
  try {
    const { userLogin, password } = req.body;

    if (!userLogin || !password) {
      return res.status(400).json({
        errorCode: 1,
        message: 'userLogin and password are required'
      });
    }

const userLoginTrimmed = userLogin.trim();
const passwordTrimmed = password.trim();

const userRecord = await user.findOne({ userLogin: userLoginTrimmed });
    if (!userRecord) {
      return res.status(200).json({
        errorCode: 2,
        message: 'UserLogin does not exist'
      });
    }


    const isPasswordValid = await bcrypt.compare(passwordTrimmed, userRecord.password);
    console.log(password,userRecord.password)
    
    if (!isPasswordValid) {
      return res.status(200).json({
        errorCode: 3,
        message: 'Invalid password'
      });
    }

    const payload = {
      id:userRecord._id,
      userLogin: userRecord.userLogin,
      username: userRecord.username,
    };

    const accessToken = createJWT(payload);
    const refreshToken = createRefreshToken(payload);

    if (!accessToken || !refreshToken) {
      return res.status(500).json({
        errorCode: 4,
        message: 'Failed to create tokens'
      });
    }  

    return res.status(200).json({
      errorCode: 0,
      message: 'Login successful',
      data: {
        id: userRecord._id,
        access_token: accessToken,
        refresh_token: refreshToken,
        username: userRecord.username,
        userLogin: userRecord.userLogin,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      errorCode: 5,
      message: 'An error occurred during login'
    });
  }
};

const getUserInfoFromToken = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];

    // 1. Kiểm tra token tồn tại và đúng định dạng Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'fail',
        message: 'Authorization token missing or invalid',
        user: null
      });
    }

    const token = authHeader.split(' ')[1];

    // 2. Xác thực access token
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({
        status: 'fail',
        message: 'Access token is invalid or expired',
        user: null
      });
    }

    // 3. Tìm user theo ID trong token
    const userInfor = await user.findById(decoded.id).select('-password'); // không trả về password

    if (!userInfor) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
        user: null
      });
    }

    // 4. Trả về thông tin user
    return res.status(200).json({
      status: 'success',
      message: 'User information retrieved successfully',
      user: userInfor
    });

  } catch (error) {
    console.error('Error in getUserInfoFromToken:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      user: null
    });
  }
};

module.exports = {
    apiLogin,getUserInfoFromToken
}