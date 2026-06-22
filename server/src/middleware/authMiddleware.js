const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const User = require('../models/User');
const { jwtSecret } = require('../config/env');

const extractToken = (req) => {
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

const protect = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);

  if (!token) {
    throw new AppError('Not authorized, no token provided', 401);
  }

  let decoded;

  try {
    decoded = jwt.verify(token, jwtSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token expired, please log in again', 401);
    }
    throw new AppError('Not authorized, invalid token', 401);
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError('Not authorized, user no longer exists', 401);
  }

  req.user = user;
  next();
});

module.exports = { protect, extractToken };
