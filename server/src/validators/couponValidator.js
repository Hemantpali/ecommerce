const { body, param } = require('express-validator');

const createCouponRules = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Coupon code is required')
    .isLength({ max: 20 })
    .withMessage('Coupon code cannot exceed 20 characters'),
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Coupon type is required')
    .isIn(['percentage', 'fixed'])
    .withMessage('Coupon type must be percentage or fixed'),
  body('value')
    .isFloat({ min: 0.01 })
    .withMessage('Value must be at least 0.01'),
  body('minOrderAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order amount must be at least 0'),
  body('maxDiscount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum discount must be at least 0'),
  body('usageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit must be at least 1'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),
];

const updateCouponRules = [
  param('id').isMongoId().withMessage('Invalid coupon ID'),
  body('code')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Coupon code cannot be empty')
    .isLength({ max: 20 })
    .withMessage('Coupon code cannot exceed 20 characters'),
  body('type')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Coupon type cannot be empty')
    .isIn(['percentage', 'fixed'])
    .withMessage('Coupon type must be percentage or fixed'),
  body('value')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Value must be at least 0.01'),
  body('minOrderAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order amount must be at least 0'),
  body('maxDiscount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum discount must be at least 0'),
  body('usageLimit')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Usage limit must be at least 1'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('expiresAt')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),
];

const couponIdRules = [param('id').isMongoId().withMessage('Invalid coupon ID')];

const validateCouponRules = [
  body('code').trim().notEmpty().withMessage('Coupon code is required'),
  body('orderAmount')
    .isFloat({ min: 0 })
    .withMessage('Order amount must be at least 0'),
];

module.exports = {
  createCouponRules,
  updateCouponRules,
  couponIdRules,
  validateCouponRules,
};
