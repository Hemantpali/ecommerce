const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  addToCartRules,
  updateCartItemRules,
  productIdParamRules,
} = require('../validators/cartValidator');

const router = express.Router();

router.use(protect);

router.get('/', getCart);
router.post('/items', addToCartRules, validate, addToCart);
router.put('/items/:productId', updateCartItemRules, validate, updateCartItem);
router.delete('/items/:productId', productIdParamRules, validate, removeCartItem);
router.delete('/', clearCart);

module.exports = router;
