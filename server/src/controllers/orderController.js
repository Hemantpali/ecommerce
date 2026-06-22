const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');
const { clearUserCart, getOrCreateCart, populateCart } = require('../utils/cartHelpers');
const {
  createRazorpayOrder,
  razorpayKeyId,
  verifyRazorpaySignature,
} = require('../utils/razorpay');

const buildOrderItems = async (orderItemsInput) => {
  const orderItems = [];

  for (const item of orderItemsInput) {
    const product = await Product.findById(item.product);

    if (!product) {
      throw new AppError(`Product not found: ${item.product}`, 404);
    }

    if (product.countInStock < item.qty) {
      throw new AppError(`Insufficient stock for ${product.name}`, 400);
    }

    orderItems.push({
      name: product.name,
      qty: item.qty,
      image: product.image,
      price: product.price,
      product: product._id,
    });
  }

  return orderItems;
};

const calculatePrices = (orderItems, taxPrice = 0, shippingPrice = 0) => {
  const itemsPrice = orderItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const totalPrice = itemsPrice + Number(taxPrice) + Number(shippingPrice);

  return { itemsPrice, totalPrice };
};

const restoreOrderStock = async (orderItems) => {
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { countInStock: item.qty },
    });
  }
};

const deductOrderStock = async (orderItems) => {
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { countInStock: -item.qty },
    });
  }
};

const placeOrder = async (userId, body) => {
  const orderItems = await buildOrderItems(body.orderItems);
  const { itemsPrice, totalPrice } = calculatePrices(
    orderItems,
    body.taxPrice,
    body.shippingPrice
  );

  const order = await Order.create({
    user: userId,
    orderItems,
    shippingAddress: body.shippingAddress,
    paymentMethod: body.paymentMethod,
    itemsPrice,
    taxPrice: body.taxPrice || 0,
    shippingPrice: body.shippingPrice || 0,
    totalPrice,
  });

  await deductOrderStock(orderItems);
  await clearUserCart(userId);

  return order;
};

const createOrder = asyncHandler(async (req, res) => {
  const order = await placeOrder(req.user._id, req.body);
  sendCreated(res, order, 'Order placed successfully');
});

const createOrderFromCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const populated = await populateCart(cart);

  if (!populated.items.length) {
    throw new AppError('Your cart is empty', 400);
  }

  const order = await placeOrder(req.user._id, {
    ...req.body,
    orderItems: populated.items.map((item) => ({
      product: item.product._id,
      qty: item.qty,
    })),
  });

  sendCreated(res, order, 'Order placed successfully');
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select('-__v');

  sendSuccess(res, orders);
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name category');

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    throw new AppError('Not authorized to view this order', 403);
  }

  sendSuccess(res, order);
});

const getAllOrders = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .select('-__v');

  sendSuccess(res, orders);
});

const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to update this order', 403);
  }

  if (order.isPaid) {
    throw new AppError('Order is already paid', 400);
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.status = 'processing';

  const updatedOrder = await order.save();
  sendSuccess(res, updatedOrder, 'Order marked as paid');
});

const createRazorpayPaymentOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.user.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to pay this order', 403);
  }

  if (order.isPaid) {
    throw new AppError('Order is already paid', 400);
  }

  const razorpayOrder = await createRazorpayOrder({
    amount: order.totalPrice,
    receipt: `order_${order._id.toString().slice(-24)}`,
    notes: {
      appOrderId: order._id.toString(),
      userId: req.user._id.toString(),
    },
  });

  order.paymentResult = {
    razorpayOrderId: razorpayOrder.id,
  };
  await order.save();

  sendSuccess(res, {
    key: razorpayKeyId,
    razorpayOrder,
    order: {
      id: order._id,
      totalPrice: order.totalPrice,
      currency: razorpayOrder.currency,
    },
  });
});

const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.user.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to pay this order', 403);
  }

  if (order.isPaid) {
    throw new AppError('Order is already paid', 400);
  }

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (
    order.paymentResult?.razorpayOrderId
    && order.paymentResult.razorpayOrderId !== razorpayOrderId
  ) {
    throw new AppError('Razorpay order ID does not match this order', 400);
  }

  const isValid = verifyRazorpaySignature({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  if (!isValid) {
    throw new AppError('Invalid Razorpay payment signature', 400);
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.status = 'processing';
  order.paymentResult = {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  };

  const updatedOrder = await order.save();
  sendSuccess(res, updatedOrder, 'Payment verified successfully');
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const previousStatus = order.status;
  const newStatus = req.body.status;

  if (previousStatus === newStatus) {
    return sendSuccess(res, order, 'Order status unchanged');
  }

  if (newStatus === 'cancelled' && previousStatus !== 'cancelled') {
    await restoreOrderStock(order.orderItems);
    order.isDelivered = false;
    order.deliveredAt = undefined;
  }

  order.status = newStatus;

  if (newStatus === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  const updatedOrder = await order.save();
  sendSuccess(res, updatedOrder, 'Order status updated');
});

module.exports = {
  createOrder,
  createOrderFromCart,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderToPaid,
  createRazorpayPaymentOrder,
  verifyRazorpayPayment,
  updateOrderStatus,
};
