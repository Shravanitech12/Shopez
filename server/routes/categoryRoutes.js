const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, adminOnly, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, getCategories);
router.get('/:slug', getCategoryBySlug);

// Admin routes
router.post('/', protect, adminOnly, createCategory);
router.patch('/:id', protect, adminOnly, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;
