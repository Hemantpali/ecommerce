const { body, param } = require('express-validator');

const addToCartRules = [
  body('product').isMongoId().withMessage('Valid product ID is required'),
  body('qty').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

const updateCartItemRules = [
  param('productId').isMongoId().withMessage('Invalid product ID'),
  body('qty').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

const productIdParamRules = [
  param('productId').isMongoId().withMessage('Invalid product ID'),
];

module.exports = {
  addToCartRules,
  updateCartItemRules,
  productIdParamRules,
};
