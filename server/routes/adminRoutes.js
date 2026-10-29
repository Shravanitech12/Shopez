const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  getAdminUsers,
  toggleUserStatus,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly); // Protected for administrators only

router.get('/dashboard/stats', getDashboardStats);
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrderById);
router.patch('/orders/:id/status', updateOrderStatus);
router.get('/users', getAdminUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);

module.exports = router;
