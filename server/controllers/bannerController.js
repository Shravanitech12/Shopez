const Banner = require('../models/Banner');

// @desc    Get active banners for homepage
// @route   GET /api/banners
// @access  Public
const getBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });
    res.status(200).json({
      success: true,
      data: { banners },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all banners (Admin)
// @route   GET /api/banners/all
// @access  Private/Admin
const getAllBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ displayOrder: 1, createdAt: -1 });
    res.status(200).json({
      success: true,
      data: { banners },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a banner
// @route   POST /api/banners
// @access  Private/Admin
const createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, image, link, buttonText, badge, displayOrder, isActive } = req.body;

    if (!title || !image) {
      return res.status(400).json({
        success: false,
        message: 'Banner title and image URL are required.',
      });
    }

    const banner = await Banner.create({
      title,
      subtitle: subtitle || '',
      image,
      link: link || '/products',
      buttonText: buttonText || 'Shop Now',
      badge: badge || '',
      displayOrder: Number(displayOrder) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: { banner },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a banner
// @route   PATCH /api/banners/:id
// @access  Private/Admin
const updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    Object.assign(banner, req.body);
    const updatedBanner = await banner.save();

    res.status(200).json({
      success: true,
      message: 'Banner updated successfully',
      data: { banner: updatedBanner },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    await Banner.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Banner deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
