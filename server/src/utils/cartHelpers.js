const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  return cart;
};

const populateCart = (cart) =>
  Cart.findById(cart._id).populate({
    path: 'items.product',
    select: 'name price image countInStock category brand',
  });

const formatCart = (cart) => {
  const items = cart.items
    .filter((item) => item.product)
    .map((item) => ({
      _id: item.product._id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      countInStock: item.product.countInStock,
      category: item.product.category,
      brand: item.product.brand,
      qty: item.qty,
      lineTotal: item.product.price * item.qty,
    }));

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  return {
    _id: cart._id,
    items,
    subtotal,
    itemCount,
  };
};

const clearUserCart = async (userId) => {
  await Cart.findOneAndUpdate({ user: userId }, { items: [] });
};

module.exports = {
  getOrCreateCart,
  populateCart,
  formatCart,
  clearUserCart,
};
