const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');

// @desc    Get dashboard metrics & analytics for charts
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalCustomers = await User.countDocuments({ userType: 'customer' });
    const totalOrders = await Order.countDocuments();

    // Total revenue from paid orders
    const revenueAggregation = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    const pendingOrders = await Order.countDocuments({ status: 'Pending' });

    // Recent 5 orders
    const recentOrders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    // Orders grouped by status for Recharts pie/bar chart
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Monthly sales revenue for the past 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const salesTimeline = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          paymentStatus: { $in: ['Paid', 'Pending'] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedTimeline = salesTimeline.map((item) => ({
      name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue,
      orders: item.orders,
    }));

    // Top categories with product counts
    const categoryStats = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products',
        },
      },
      {
        $project: {
          name: 1,
          slug: 1,
          productCount: { $size: '$products' },
        },
      },
      { $sort: { productCount: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalProducts,
          totalCategories,
          totalCustomers,
          totalOrders,
          totalRevenue,
          pendingOrders,
        },
        recentOrders,
        ordersByStatus: ordersByStatus.map((s) => ({ name: s._id, value: s.count })),
        salesTimeline: formattedTimeline,
        categoryStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders with filter and pagination
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAdminOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { orderNumber: searchRegex },
        { 'shippingAddress.fullName': searchRegex },
        { 'shippingAddress.mobile': searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageLimit;

    const totalOrders = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('userId', 'name email username mobile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    res.status(200).json({
      success: true,
      data: {
        orders,
        page: pageNum,
        pages: Math.ceil(totalOrders / pageLimit) || 1,
        totalOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details (Admin)
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
const getAdminOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email username mobile');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status and tracking
// @route   PATCH /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (status) {
      order.status = status;
      if (status === 'Delivered') {
        order.deliveryDate = new Date();
        order.paymentStatus = 'Paid';
      }
    }

    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber;
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: { order: updatedOrder },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get registered customers
// @route   GET /api/admin/users
// @access  Private/Admin
const getAdminUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 15 } = req.query;
    const query = { userType: 'customer' };

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { username: searchRegex }, { mobile: searchRegex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageLimit;

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .lean();

    // Attach total orders placed by each customer
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const orderCount = await Order.countDocuments({ userId: u._id });
        return { ...u, orderCount };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        users: usersWithStats,
        page: pageNum,
        pages: Math.ceil(totalUsers / pageLimit) || 1,
        totalUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle customer active/inactive status
// @route   PATCH /api/admin/users/:id/toggle-status
// @access  Private/Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    // Prevent modifying own privileges
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot alter your own administrative account status.',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}.`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  getAdminUsers,
  toggleUserStatus,
};
