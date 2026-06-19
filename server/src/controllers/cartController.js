const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');
const {
  getOrCreateCart,
  populateCart,
  formatCart,
  clearUserCart,
} = require('../utils/cartHelpers');

const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const populated = await populateCart(cart);
  sendSuccess(res, formatCart(populated));
});

const addToCart = asyncHandler(async (req, res) => {
  const { product: productId, qty = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (product.countInStock < qty) {
    throw new AppError(`Only ${product.countInStock} items available in stock`, 400);
  }

  const cart = await getOrCreateCart(req.user._id);
  const existingIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingIndex > -1) {
    const newQty = cart.items[existingIndex].qty + qty;
    if (newQty > product.countInStock) {
      throw new AppError(`Cannot add more than ${product.countInStock} items`, 400);
    }
    cart.items[existingIndex].qty = newQty;
  } else {
    cart.items.push({ product: productId, qty });
  }

  await cart.save();
  const populated = await populateCart(cart);
  sendSuccess(res, formatCart(populated), 'Item added to cart');
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { qty } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (qty > product.countInStock) {
    throw new AppError(`Only ${product.countInStock} items available in stock`, 400);
  }

  const cart = await getOrCreateCart(req.user._id);
  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    throw new AppError('Item not found in cart', 404);
  }

  cart.items[itemIndex].qty = qty;
  await cart.save();

  const populated = await populateCart(cart);
  sendSuccess(res, formatCart(populated), 'Cart updated');
});

const removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await getOrCreateCart(req.user._id);
  const initialLength = cart.items.length;

  cart.items = cart.items.filter((item) => item.product.toString() !== productId);

  if (cart.items.length === initialLength) {
    throw new AppError('Item not found in cart', 404);
  }

  await cart.save();
  const populated = await populateCart(cart);
  sendSuccess(res, formatCart(populated), 'Item removed from cart');
});

const clearCart = asyncHandler(async (req, res) => {
  await clearUserCart(req.user._id);
  sendSuccess(res, { items: [], subtotal: 0, itemCount: 0 }, 'Cart cleared');
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
