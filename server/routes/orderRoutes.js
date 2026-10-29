const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  returnOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All order routes require authenticated user

router.post('/', placeOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.post('/:id/cancel', cancelOrder);
router.post('/:id/return', returnOrder);

module.exports = router;
