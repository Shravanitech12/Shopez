const User = require('../models/User');
const { generateToken, clearTokenCookie } = require('../utils/generateToken');

// @desc    Register a new customer account
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, username, email, password, mobile, address, pincode } = req.body;

    if (!name || !username || !email || !password || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, username, email, password, and mobile.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check existing email
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Check existing username
    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'This username is already taken. Please choose another.',
      });
    }

    // Public registration ALWAYS creates 'customer' (never allows admin privilege escalation)
    const user = await User.create({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      mobile,
      address: address || '',
      pincode: pincode || '',
      userType: 'customer',
      isActive: true,
    });

    const token = generateToken(res, user._id, user.userType);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { identifier, email, username, password } = req.body;
    const loginIdentifier = (identifier || email || username || '').trim().toLowerCase();

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your email/username and password.',
      });
    }

    // Find user by either email or username, explicitly selecting password
    const user = await User.findOne({
      $or: [{ email: loginIdentifier }, { username: loginIdentifier }],
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/username and password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact customer support.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/username and password.',
      });
    }

    const token = generateToken(res, user._id, user.userType);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log out current user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  clearTokenCookie(res);
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};

// @desc    Update user profile & addresses
// @route   PATCH /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, mobile, address, pincode, savedAddresses } = req.body;

    if (name) user.name = name;
    if (mobile) user.mobile = mobile;
    if (address !== undefined) user.address = address;
    if (pincode !== undefined) user.pincode = pincode;
    if (Array.isArray(savedAddresses)) user.savedAddresses = savedAddresses;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PATCH /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are both required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
};
