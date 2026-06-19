const express = require('express');
const {
  createOrder,
  createOrderFromCart,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderToPaid,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  createOrderRules,
  createOrderFromCartRules,
  orderIdRules,
  updateOrderStatusRules,
  listOrdersRules,
} = require('../validators/orderValidator');

const router = express.Router();

router.use(protect);

router.post('/', createOrderRules, validate, createOrder);
router.post('/from-cart', createOrderFromCartRules, validate, createOrderFromCart);
router.get('/my', getMyOrders);
router.get('/', admin, listOrdersRules, validate, getAllOrders);
router.get('/:id', orderIdRules, validate, getOrderById);
router.put('/:id/pay', orderIdRules, validate, updateOrderToPaid);
router.put('/:id/status', admin, updateOrderStatusRules, validate, updateOrderStatus);

module.exports = router;
