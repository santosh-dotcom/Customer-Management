const User = require('../models/User');

// @desc    Get current customer's profile
// @route   GET /api/customer/profile
// @access  Private (Customer only)
const getCustomerProfile = async (req, res, next) => {
  try {
    // Only fetch customer's own record using the token ID
    const customer = await User.findById(req.user._id).select('-password');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found',
      });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update allowed profile info for logged-in customer
// @route   PUT /api/customer/profile
// @access  Private (Customer only)
const updateCustomerProfile = async (req, res, next) => {
  try {
    const customer = await User.findById(req.user._id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Allowed updatable fields: name, phone, address
    if (req.body.name) customer.name = req.body.name;
    if (req.body.phone) customer.phone = req.body.phone;
    if (req.body.address) customer.address = req.body.address;

    const updatedCustomer = await customer.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedCustomer._id,
        name: updatedCustomer.name,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        address: updatedCustomer.address,
        role: updatedCustomer.role,
        status: updatedCustomer.status,
        created_at: updatedCustomer.created_at,
        updated_at: updatedCustomer.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change customer's password
// @route   PUT /api/customer/change-password
// @access  Private (Customer only)
const changeCustomerPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const customer = await User.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Verify current password
    const isMatch = await customer.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match',
      });
    }

    customer.password = newPassword;
    await customer.save();

    res.json({
      success: true,
      message: 'Password changed successfully! Please keep your new password secure.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomerProfile,
  updateCustomerProfile,
  changeCustomerPassword,
};
