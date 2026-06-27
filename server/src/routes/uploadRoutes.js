const express = require('express');
const { uploadProductImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');
const { uploadImage } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/products', protect, admin, uploadImage.single('image'), uploadProductImage);

module.exports = router;
