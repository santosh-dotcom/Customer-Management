const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  customerLogin,
  adminLogin,
} = require('../controllers/authController');
const {
  registerValidationRules,
  loginValidationRules,
} = require('../middleware/validatorMiddleware');

// Public auth routes
router.post('/register', registerValidationRules, registerCustomer);
router.post('/customer/login', loginValidationRules, customerLogin);
router.post('/admin/login', loginValidationRules, adminLogin);

module.exports = router;
