const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

const populateWishlist = (user) => user.populate('wishlist');

const getWishlist = asyncHandler(async (req, res) => {
  const user = await populateWishlist(req.user);
  sendSuccess(res, user.wishlist || []);
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const exists = req.user.wishlist.some((item) => item.toString() === productId);
  if (!exists) {
    req.user.wishlist.push(productId);
    await req.user.save();
  }

  const user = await populateWishlist(req.user);
  sendSuccess(res, user.wishlist, 'Product added to wishlist');
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  req.user.wishlist = req.user.wishlist.filter((item) => item.toString() !== productId);
  await req.user.save();

  const user = await populateWishlist(req.user);
  sendSuccess(res, user.wishlist, 'Product removed from wishlist');
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
