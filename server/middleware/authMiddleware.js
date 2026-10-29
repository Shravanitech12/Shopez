const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1. Check HTTP-only cookie first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Fallback to Authorization Header (Bearer token)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'shopez_default_secret_fallback_key';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Session invalid or expired. Please log in again.',
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.userType === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied: Administrator privileges required.',
  });
};

const optionalAuth = async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || 'shopez_default_secret_fallback_key';
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select('-password');
    if (user && user.isActive) {
      req.user = user;
    }
  } catch (err) {
    // silently continue as guest
  }
  next();
};

module.exports = { protect, adminOnly, optionalAuth };
