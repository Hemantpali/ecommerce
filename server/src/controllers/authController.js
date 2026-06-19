const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');
const { sendTokenResponse } = require('../utils/generateToken');

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User already exists with this email', 400);
  }

  const user = await User.create({ name, email, password });
  sendTokenResponse(user, 201, res, 'Registration successful');
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  sendTokenResponse(user, 200, res, 'Login successful');
});

const getProfile = asyncHandler(async (req, res) => {
  sendSuccess(res, req.user, 'Profile fetched successfully');
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (req.body.email && req.body.email !== user.email) {
    const emailTaken = await User.findOne({ email: req.body.email });
    if (emailTaken) {
      throw new AppError('Email is already in use', 400);
    }
  }

  user.name = req.body.name ?? user.name;
  user.email = req.body.email ?? user.email;

  const updatedUser = await user.save();
  sendSuccess(res, updatedUser, 'Profile updated successfully');
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password changed successfully');
});

const getAllUsers = asyncHandler(async (_req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  sendSuccess(res, users);
});

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
};
