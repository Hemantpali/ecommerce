const { body, param, query } = require('express-validator');
const { ORDER_STATUSES } = require('../constants/orderStatuses');

const orderItemRules = [
  body('orderItems')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('orderItems.*.product')
    .isMongoId()
    .withMessage('Each order item must have a valid product ID'),
  body('orderItems.*.qty')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
];

const createOrderRules = [
  ...orderItemRules,
  body('shippingAddress.address').trim().notEmpty().withMessage('Address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.postalCode').trim().notEmpty().withMessage('Postal code is required'),
  body('shippingAddress.country').trim().notEmpty().withMessage('Country is required'),
  body('paymentMethod').trim().notEmpty().withMessage('Payment method is required'),
  body('itemsPrice').optional().isFloat({ min: 0 }),
  body('taxPrice').optional().isFloat({ min: 0 }),
  body('shippingPrice').optional().isFloat({ min: 0 }),
  body('totalPrice').optional().isFloat({ min: 0 }),
  body('couponCode').optional().trim().notEmpty(),
];

const orderIdRules = [param('id').isMongoId().withMessage('Invalid order ID')];

const verifyRazorpayPaymentRules = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('razorpayOrderId').trim().notEmpty().withMessage('Razorpay order ID is required'),
  body('razorpayPaymentId').trim().notEmpty().withMessage('Razorpay payment ID is required'),
  body('razorpaySignature').trim().notEmpty().withMessage('Razorpay signature is required'),
];

const updateOrderStatusRules = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(ORDER_STATUSES)
    .withMessage('Invalid order status'),
];

const listOrdersRules = [
  query('status')
    .optional()
    .isIn(ORDER_STATUSES)
    .withMessage('Invalid status filter'),
];

const createOrderFromCartRules = [
  body('shippingAddress.address').trim().notEmpty().withMessage('Address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.postalCode').trim().notEmpty().withMessage('Postal code is required'),
  body('shippingAddress.country').trim().notEmpty().withMessage('Country is required'),
  body('paymentMethod').trim().notEmpty().withMessage('Payment method is required'),
  body('taxPrice').optional().isFloat({ min: 0 }),
  body('shippingPrice').optional().isFloat({ min: 0 }),
  body('couponCode').optional().trim().notEmpty(),
];

module.exports = {
  createOrderRules,
  orderIdRules,
  updateOrderStatusRules,
  listOrdersRules,
  createOrderFromCartRules,
  verifyRazorpayPaymentRules,
};
