const { body, param, query } = require('express-validator');

const createProductRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 100 })
    .withMessage('Product name cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('brand').optional().trim(),
  body('image').optional().trim(),
  body('countInStock')
    .notEmpty()
    .withMessage('Stock count is required')
    .isInt({ min: 0 })
    .withMessage('Stock count must be a non-negative integer'),
];

const updateProductRules = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Product name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('brand').optional().trim(),
  body('image').optional().trim(),
  body('countInStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock count must be a non-negative integer'),
];

const productIdRules = [param('id').isMongoId().withMessage('Invalid product ID')];

const listProductsRules = [
  query('keyword').optional().trim().isLength({ max: 100 }).withMessage('Keyword too long'),
  query('category').optional().trim().isLength({ max: 50 }).withMessage('Category too long'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice must be a positive number'),
  query('sort').optional().isIn(['price_asc', 'price_desc', 'newest', 'rating']).withMessage('Invalid sort option'),
];

module.exports = {
  createProductRules,
  updateProductRules,
  productIdRules,
  listProductsRules,
};
