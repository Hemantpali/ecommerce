const express = require('express');
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');
const authLimiter = require('../middleware/authLimiter');
const validate = require('../middleware/validateMiddleware');
const {
  registerRules,
  loginRules,
  updateProfileRules,
  changePasswordRules,
} = require('../validators/authValidator');

const router = express.Router();

router.post('/register', authLimiter, registerRules, validate, registerUser);
router.post('/login', authLimiter, loginRules, validate, loginUser);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfileRules, validate, updateProfile);
router.put('/change-password', protect, changePasswordRules, validate, changePassword);

router.get('/users', protect, admin, getAllUsers);

module.exports = router;
