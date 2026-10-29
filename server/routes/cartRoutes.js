const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  syncCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All cart routes require verified authentication

router.get('/', getCart);
router.post('/items', addToCart);
router.patch('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeCartItem);
router.delete('/', clearCart);
router.post('/sync', syncCart);

module.exports = router;
