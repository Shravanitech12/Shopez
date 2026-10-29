const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @desc    Upload product or banner image
// @route   POST /api/upload
// @access  Private/Admin
router.post('/', protect, adminOnly, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded or file format not supported',
    });
  }

  // Construct accessible URL path
  const filePath = `/uploads/${req.file.filename}`;

  res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    data: {
      url: filePath,
      filename: req.file.filename,
      size: req.file.size,
    },
  });
});

module.exports = router;
