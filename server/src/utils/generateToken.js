const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: jwtExpiresIn });

const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken(user);

  const response = {
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    },
  };

  if (message) {
    response.message = message;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  generateToken,
  sendTokenResponse,
};
