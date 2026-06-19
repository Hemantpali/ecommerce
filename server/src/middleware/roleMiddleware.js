const AppError = require('../utils/AppError');
const { ADMIN } = require('../constants/roles');

/**
 * Restrict route access to specific roles.
 * Must be used after the protect middleware.
 *
 * @example authorize('admin')
 * @example authorize('admin', 'user')
 */
const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Not authorized', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`Role '${req.user.role}' is not authorized to access this resource`, 403)
      );
    }

    next();
  };

const admin = authorize(ADMIN);

module.exports = { authorize, admin };
