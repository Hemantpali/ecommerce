const { Router } = require('express');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  createCouponRules,
  updateCouponRules,
  couponIdRules,
  validateCouponRules,
} = require('../validators/couponValidator');
const {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} = require('../controllers/couponController');

const router = Router();

router.post('/validate', protect, validateCouponRules, validate, validateCoupon);

router.use(protect, admin);

router.get('/', getCoupons);
router.get('/:id', couponIdRules, validate, getCouponById);
router.post('/', createCouponRules, validate, createCoupon);
router.put('/:id', updateCouponRules, validate, updateCoupon);
router.delete('/:id', couponIdRules, validate, deleteCoupon);

module.exports = router;
