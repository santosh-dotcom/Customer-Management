const User = require('../models/User');

// @desc    Get dashboard metrics & counts
// @route   GET /api/admin/stats
// @access  Private (Super Admin only)
const getDashboardStats = async (req, res, next) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const activeCustomers = await User.countDocuments({ role: 'customer', status: 'active' });
    const inactiveCustomers = await User.countDocuments({ role: 'customer', status: 'inactive' });

    // New customers in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSignups = await User.countDocuments({
      role: 'customer',
      created_at: { $gte: sevenDaysAgo },
    });

    res.json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        inactiveCustomers,
        recentSignups,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get paginated and searchable list of customers
// @route   GET /api/admin/customers
// @access  Private (Super Admin only)
const getCustomers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search ? req.query.search.trim() : '';
    const status = req.query.status;

    // Filter by customer role
    const query = { role: 'customer' };

    // Search filter across name, email, and phone
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    // Optional status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    const total = await User.countDocuments(query);
    const customers = await User.find(query)
      .select('-password')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const pages = Math.ceil(total / limit) || 1;

    res.json({
      success: true,
      data: {
        customers,
        page,
        pages,
        total,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single customer details
// @route   GET /api/admin/customers/:id
// @access  Private (Super Admin only)
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: 'customer' }).select('-password');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
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

// @desc    Edit customer information
// @route   PUT /api/admin/customers/:id
// @access  Private (Super Admin only)
const updateCustomer = async (req, res, next) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: 'customer' });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    const { name, email, phone, address, status } = req.body;

    // If changing email, check uniqueness
    if (email && email.toLowerCase() !== customer.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'The email address is already in use by another account',
        });
      }
      customer.email = email.toLowerCase();
    }

    if (name) customer.name = name;
    if (phone) customer.phone = phone;
    if (address) customer.address = address;
    if (status) customer.status = status;

    const updatedCustomer = await customer.save();

    res.json({
      success: true,
      message: 'Customer details updated successfully',
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

// @desc    Activate or Deactivate customer
// @route   PATCH /api/admin/customers/:id/status
// @access  Private (Super Admin only)
const toggleCustomerStatus = async (req, res, next) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: 'customer' });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Toggle status or use explicitly passed status
    const newStatus = req.body.status
      ? req.body.status
      : customer.status === 'active'
      ? 'inactive'
      : 'active';

    customer.status = newStatus;
    await customer.save();

    res.json({
      success: true,
      message: `Customer successfully ${newStatus === 'active' ? 'activated' : 'deactivated'}`,
      data: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        status: customer.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getCustomers,
  getCustomerById,
  updateCustomer,
  toggleCustomerStatus,
};
