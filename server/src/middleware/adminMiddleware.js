const AppError = require('../utils/AppError');
const { admin } = require('./roleMiddleware');

/** @deprecated Use authorize from roleMiddleware instead */
module.exports = { admin };
