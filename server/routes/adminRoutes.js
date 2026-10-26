const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getCustomers,
  getCustomerById,
  updateCustomer,
  toggleCustomerStatus,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { adminEditCustomerValidationRules } = require('../middleware/validatorMiddleware');

// All routes here require Super Admin authentication
router.use(protect);
router.use(adminOnly);

router.get('/stats', getDashboardStats);
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerById);
router.put('/customers/:id', adminEditCustomerValidationRules, updateCustomer);
router.patch('/customers/:id/status', toggleCustomerStatus);

module.exports = router;
