const jwt = require('jsonwebtoken');

const generateToken = (res, userId, userType) => {
  const secret = process.env.JWT_SECRET || 'shopez_default_secret_fallback_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  const token = jwt.sign({ id: userId, userType }, secret, {
    expiresIn,
  });

  const isProduction = process.env.NODE_ENV === 'production';

  // Set HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });

  return token;
};

const clearTokenCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    expires: new Date(0),
    path: '/',
  });
};

module.exports = { generateToken, clearTokenCookie };
