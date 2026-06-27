const express = require('express');
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const uploadRoutes = require('./uploadRoutes');
const wishlistRoutes = require('./wishlistRoutes');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/uploads', uploadRoutes);
router.use('/wishlist', wishlistRoutes);

module.exports = router;
