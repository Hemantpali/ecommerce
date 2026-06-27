const express = require('express');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { wishlistProductIdRules } = require('../validators/wishlistValidator');

const router = express.Router();

router.use(protect);

router.get('/', getWishlist);
router.post('/:productId', wishlistProductIdRules, validate, addToWishlist);
router.delete('/:productId', wishlistProductIdRules, validate, removeFromWishlist);

module.exports = router;
