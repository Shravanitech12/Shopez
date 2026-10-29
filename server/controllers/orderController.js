const Order = require('../models/Order');
const Product = require('../models/Product');
const { createOrder, restoreStockForOrder } = require('../services/orderService');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const placeOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, paymentDetails } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required.',
      });
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode ||
      !shippingAddress.mobile
    ) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required.',
      });
    }

    const validPaymentMethods = ['Cash on Delivery', 'Online Payment'];
    const chosenMethod = validPaymentMethods.includes(paymentMethod)
      ? paymentMethod
      : 'Cash on Delivery';

    const order = await createOrder({
      userId: req.user._id,
      items,
      shippingAddress,
      paymentMethod: chosenMethod,
      paymentDetails,
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageLimit;

    const totalOrders = await Order.countDocuments({ userId: req.user._id });
    const orders = await Order.find({ userId: req.user._id })
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

// @desc    Get order by ID (customer can only see their own, admin can see all)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email username mobile');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const isOwner = order.userId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.userType === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own orders.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (if pending or confirmed)
// @route   POST /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isOwner = order.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.userType === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only cancel your own orders.',
      });
    }

    // Cancellation check
    if (!['Pending', 'Confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in its current status (${order.status}). Only Pending or Confirmed orders can be cancelled.`,
      });
    }

    order.status = 'Cancelled';
    order.cancellationReason = req.body.reason || 'Cancelled by customer';
    await order.save();

    // Restore stock
    await restoreStockForOrder(order);

    res.status(200).json({
      success: true,
      message: 'Order has been successfully cancelled and inventory restored.',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request return for delivered order
// @route   POST /api/orders/:id/return
// @access  Private
const returnOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (order.status !== 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'Only delivered orders are eligible for return.',
      });
    }

    order.status = 'Returned';
    order.cancellationReason = req.body.reason || 'Return requested by customer';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Return request submitted successfully.',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  returnOrder,
};
