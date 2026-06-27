const { param } = require('express-validator');

const wishlistProductIdRules = [param('productId').isMongoId().withMessage('Invalid product ID')];

module.exports = { wishlistProductIdRules };
