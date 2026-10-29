const express = require('express');
const router = express.Router();
const {
  getBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} = require('../controllers/bannerController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getBanners);
router.get('/all', protect, adminOnly, getAllBanners);
router.post('/', protect, adminOnly, createBanner);
router.patch('/:id', protect, adminOnly, updateBanner);
router.delete('/:id', protect, adminOnly, deleteBanner);

module.exports = router;
