const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getCategories,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  createProductRules,
  updateProductRules,
  productIdRules,
  listProductsRules,
  createReviewRules,
} = require('../validators/productValidator');

const router = express.Router();

router.get('/', listProductsRules, validate, getProducts);
router.get('/categories', getCategories);
router.get('/:id', productIdRules, validate, getProductById);
router.post('/:id/reviews', protect, createReviewRules, validate, createProductReview);

router.post('/', protect, admin, createProductRules, validate, createProduct);
router.put('/:id', protect, admin, updateProductRules, validate, updateProduct);
router.delete('/:id', protect, admin, productIdRules, validate, deleteProduct);

module.exports = router;
