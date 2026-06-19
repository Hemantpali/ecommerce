const crypto = require('crypto');
const AppError = require('./AppError');
const { razorpayKeyId, razorpayKeySecret } = require('../config/env');

const ensureRazorpayConfigured = () => {
  if (!razorpayKeyId || !razorpayKeySecret) {
    throw new AppError('Razorpay is not configured', 500);
  }
};

const toPaise = (amount) => Math.round(Number(amount) * 100);

const createRazorpayOrder = async ({ amount, currency = 'INR', receipt, notes }) => {
  ensureRazorpayConfigured();

  const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: toPaise(amount),
      currency,
      receipt,
      notes,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new AppError(data.error?.description || 'Failed to create Razorpay order', response.status);
  }

  return data;
};

const verifyRazorpaySignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  ensureRazorpayConfigured();

  const expectedSignature = crypto
    .createHmac('sha256', razorpayKeySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(razorpaySignature);

  return (
    expectedBuffer.length === receivedBuffer.length
    && crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpaySignature,
  razorpayKeyId,
};
