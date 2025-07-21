const user = require("../models/user");
const bcrypt = require('bcryptjs');
const getAllUsers = async (req, res) => {
  const users = await user.find();
  res.json(users);
};

// POST /api/users
const createUser = async (req, res) => {
  const newUser = new user(req.body);
  await newUser.save();
  res.status(201).json(newUser);
};

const registerUser = async (req, res) => {
  const { username, userLogin, password } = req.body;

  // Kiểm tra thiếu trường và trả về thông báo (không lỗi HTTP)
  if (!username || !userLogin || !password) {
    return res.json({
      errorCode: 1,
      message: 'Vui lòng nhập đầy đủ thông tin'
    });
  }

  try {
    const userExists = await user.findOne({ userLogin });
    if (userExists) {
      return res.json({
        errorCode: 1,
        message: 'Tài khoản đã tồn tại'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new user({
      username,
      userLogin,
      password: hashedPassword
    });

    await newUser.save();

    return res.status(201).json({
      errorCode: 0,
      message: 'Đăng ký thành công',
      user: {
        id: newUser._id,
        username: newUser.username,
        userLogin: newUser.userLogin
      }
    });
  } catch (error) {
    // Trả về lỗi hệ thống nếu có
    return res.status(500).json({
      errorCode: -1,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT middleware
    const { username, address, phone, avatar, gender } = req.body;

    // Validate input
    if (!username && !address && !phone && !avatar && !gender) {
      return res.status(400).json({
        message: 'At least one field must be provided for update',
        status: 'fail'
      });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (username) updateData.username = username.trim();
    if (address) updateData.address = address.trim();
    if (phone) updateData.phone = phone.trim();
    if (avatar) updateData.avatar = avatar.trim();
    if (gender && ['male', 'female', 'other'].includes(gender)) {
      updateData.gender = gender;
    }

    const updatedUser = await user.findByIdAndUpdate(
      userId,
      updateData,
      { 
        new: true, 
        runValidators: true,
        select: '-password' // Exclude password from response
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: 'User not found',
        status: 'fail'
      });
    }

    res.json({
      message: 'Profile updated successfully',
      status: 'success',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        status: 'fail',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      message: 'Failed to update profile',
      status: 'fail',
      error: error.message
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT middleware
    
    const userProfile = await user.findById(userId).select('-password');
    
    if (!userProfile) {
      return res.status(404).json({
        message: 'User not found',
        status: 'fail'
      });
    }

    res.json({
      message: 'Profile retrieved successfully',
      status: 'success',
      user: userProfile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Failed to retrieve profile',
      status: 'fail',
      error: error.message
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT middleware
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Current password and new password are required',
        status: 'fail'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters long',
        status: 'fail'
      });
    }

    // Get user with password
    const userProfile = await user.findById(userId);
    
    if (!userProfile) {
      return res.status(404).json({
        message: 'User not found',
        status: 'fail'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userProfile.password);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: 'Current password is incorrect',
        status: 'fail'
      });
    }

    // Check if new password is same as current
    const isNewPasswordSame = await bcrypt.compare(newPassword, userProfile.password);
    
    if (isNewPasswordSame) {
      return res.status(400).json({
        message: 'New password must be different from current password',
        status: 'fail'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await user.findByIdAndUpdate(userId, {
      password: hashedNewPassword
    });

    res.json({
      message: 'Password changed successfully',
      status: 'success'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      message: 'Failed to change password',
      status: 'fail',
      error: error.message
    });
  }
};

const getAddresses = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT middleware
    
    const userProfile = await user.findById(userId);
    
    if (!userProfile) {
      return res.status(404).json({
        message: 'User not found',
        status: 'fail'
      });
    }

    // Return addresses from user profile or empty array
    const addresses = userProfile.addresses || [];

    res.json({
      message: 'Addresses retrieved successfully',
      status: 'success',
      addresses: addresses
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      message: 'Failed to retrieve addresses',
      status: 'fail',
      error: error.message
    });
  }
};

const updateAddresses = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT middleware
    const { addresses } = req.body;

    // Validate input
    if (!Array.isArray(addresses)) {
      return res.status(400).json({
        message: 'Addresses must be an array',
        status: 'fail'
      });
    }

    // Validate each address
    for (const addr of addresses) {
      if (!addr.name || !addr.address || !addr.phone) {
        return res.status(400).json({
          message: 'Each address must have name, address, and phone',
          status: 'fail'
        });
      }
    }

    // Update user with addresses
    const updatedUser = await user.findByIdAndUpdate(
      userId,
      { addresses: addresses },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: 'User not found',
        status: 'fail'
      });
    }

    res.json({
      message: 'Addresses updated successfully',
      status: 'success',
      addresses: updatedUser.addresses
    });
  } catch (error) {
    console.error('Update addresses error:', error);
    res.status(500).json({
      message: 'Failed to update addresses',
      status: 'fail',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  registerUser,
  updateUserProfile,
  getUserProfile,
  changePassword,
  getAddresses,
  updateAddresses
};
