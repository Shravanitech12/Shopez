const express = require('express');
const router = express.Router();
const {
  getProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, adminOnly, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', optionalAuth, getProductById);

// Admin-only management routes
router.post('/', protect, adminOnly, createProduct);
router.patch('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
