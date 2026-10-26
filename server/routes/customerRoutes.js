const express = require('express');
const router = express.Router();
const {
  getCustomerProfile,
  updateCustomerProfile,
  changeCustomerPassword,
} = require('../controllers/customerController');
const { protect, customerOnly } = require('../middleware/authMiddleware');
const {
  updateProfileValidationRules,
  changePasswordValidationRules,
} = require('../middleware/validatorMiddleware');

// All routes here require customer authentication
router.use(protect);
router.use(customerOnly);

router.get('/profile', getCustomerProfile);
router.put('/profile', updateProfileValidationRules, updateCustomerProfile);
router.put('/change-password', changePasswordValidationRules, changeCustomerPassword);

module.exports = router;
