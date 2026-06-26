const Coupon = require('../models/Coupon');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

const getCoupons = asyncHandler(async (_req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  sendSuccess(res, coupons);
});

const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    throw new AppError('Coupon not found', 404);
  }

  sendSuccess(res, coupon);
});

const createCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;

  const existing = await Coupon.findOne({ code: code.toUpperCase() });

  if (existing) {
    throw new AppError('A coupon with this code already exists', 400);
  }

  const coupon = await Coupon.create({
    ...req.body,
    user: req.user._id,
  });

  sendCreated(res, coupon, 'Coupon created successfully');
});

const updateCoupon = asyncHandler(async (req, res) => {
  let coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    throw new AppError('Coupon not found', 404);
  }

  if (req.body.code) {
    const existing = await Coupon.findOne({
      code: req.body.code.toUpperCase(),
      _id: { $ne: req.params.id },
    });

    if (existing) {
      throw new AppError('A coupon with this code already exists', 400);
    }
  }

  coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, coupon, 'Coupon updated successfully');
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    throw new AppError('Coupon not found', 404);
  }

  await coupon.deleteOne();
  sendSuccess(res, null, 'Coupon deleted successfully');
});

const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    throw new AppError('Invalid coupon code', 400);
  }

  if (!coupon.isActive) {
    throw new AppError('This coupon is no longer active', 400);
  }

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    throw new AppError('This coupon has expired', 400);
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError('This coupon has reached its usage limit', 400);
  }

  if (orderAmount < coupon.minOrderAmount) {
    throw new AppError(
      `Minimum order amount of ₹${coupon.minOrderAmount.toLocaleString('en-IN')} required for this coupon`,
      400
    );
  }

  let discountAmount = 0;

  if (coupon.type === 'fixed') {
    discountAmount = coupon.value;
  } else {
    discountAmount = (orderAmount * coupon.value) / 100;

    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  }

  if (discountAmount > orderAmount) {
    discountAmount = orderAmount;
  }

  sendSuccess(res, {
    coupon: {
      _id: coupon._id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      maxDiscount: coupon.maxDiscount,
    },
    discountAmount,
    totalAfterDiscount: orderAmount - discountAmount,
  });
});

module.exports = {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
};
