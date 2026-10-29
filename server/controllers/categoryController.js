const Category = require('../models/Category');
const Product = require('../models/Product');

// Helper to make slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// @desc    Get all categories with active product count
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const isAdmin = req.user && req.user.userType === 'admin';
    const filter = isAdmin ? {} : { isActive: true };

    const categories = await Category.find(filter).sort({ name: 1 }).lean();

    // Attach product counts
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({
          category: cat._id,
          isActive: true,
        });
        return {
          ...cat,
          productCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        categories: categoriesWithCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const productCount = await Product.countDocuments({
      category: category._id,
      isActive: true,
    });

    res.status(200).json({
      success: true,
      data: {
        category: {
          ...category.toObject(),
          productCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, image, isActive } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const categorySlug = slug && slug.trim() !== '' ? slugify(slug) : slugify(name);

    const existingSlug = await Category.findOne({ slug: categorySlug });
    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: `Category slug "${categorySlug}" is already taken. Please choose another name or slug.`,
      });
    }

    const category = await Category.create({
      name: name.trim(),
      slug: categorySlug,
      description: description || '',
      image: image || '',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        category,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a category
// @route   PATCH /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const { name, slug, description, image, isActive } = req.body;

    if (name) category.name = name.trim();
    if (slug) category.slug = slugify(slug);
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = Boolean(isActive);

    const updatedCategory = await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: {
        category: updatedCategory,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a category safely
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Safety check: ensure no active products are using this category
    const associatedProductCount = await Product.countDocuments({
      category: category._id,
    });

    if (associatedProductCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category "${category.name}". It is currently assigned to ${associatedProductCount} product(s). Please reassign or delete these products first.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
