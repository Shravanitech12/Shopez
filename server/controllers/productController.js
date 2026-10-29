const Product = require('../models/Product');
const Category = require('../models/Category');
const { calculateFinalPrice } = require('../services/pricingService');

// @desc    Get all active products with search, filtering, sorting & pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      minDiscount,
      size,
      gender,
      sort,
      isFeatured,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isActive: true };

    // Text search
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    // Category filter (handles both category ObjectId and slug)
    if (category && category !== 'all') {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const cat = await Category.findOne({ slug: category });
        if (cat) {
          query.category = cat._id;
        }
      }
    }

    // Price filtering (applied to finalPrice)
    if (minPrice || maxPrice) {
      query.finalPrice = {};
      if (minPrice) query.finalPrice.$gte = Number(minPrice);
      if (maxPrice) query.finalPrice.$lte = Number(maxPrice);
    }

    // Discount filter
    if (minDiscount) {
      query.discount = { $gte: Number(minDiscount) };
    }

    // Size filter
    if (size && size !== 'all') {
      query.sizes = size;
    }

    // Gender filter
    if (gender && gender !== 'All') {
      query.gender = { $in: [gender, 'Unisex', 'All'] };
    }

    // Featured filter
    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    // Sorting options
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'price-asc') {
      sortOption = { finalPrice: 1 };
    } else if (sort === 'price-desc') {
      sortOption = { finalPrice: -1 };
    } else if (sort === 'discount-desc') {
      sortOption = { discount: -1 };
    } else if (sort === 'popular') {
      sortOption = { 'ratings.count': -1, 'ratings.average': -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageLimit;

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(pageLimit);

    res.status(200).json({
      success: true,
      data: {
        products,
        page: pageNum,
        pages: Math.ceil(totalProducts / pageLimit) || 1,
        totalProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true })
      .populate('category', 'name slug')
      .limit(8)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        products,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug description');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // If inactive and not requested by admin, deny
    if (!product.isActive && (!req.user || req.user.userType !== 'admin')) {
      return res.status(404).json({
        success: false,
        message: 'This product is currently unavailable',
      });
    }

    // Fetch up to 4 related products from same category
    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isActive: true,
    })
      .limit(4)
      .select('title mainImg price discount finalPrice ratings sizes');

    res.status(200).json({
      success: true,
      data: {
        product,
        relatedProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      mainImg,
      images,
      carousel,
      category,
      sizes,
      gender,
      price,
      discount,
      stock,
      isFeatured,
      isActive,
    } = req.body;

    if (!title || !description || !mainImg || !category || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, mainImg, category, price, and stock.',
      });
    }

    const calculatedFinal = calculateFinalPrice(price, discount);

    const product = await Product.create({
      title,
      description,
      mainImg,
      images: Array.isArray(images) ? images : [],
      carousel: Array.isArray(carousel) ? carousel : [],
      category,
      sizes: Array.isArray(sizes) ? sizes : [],
      gender: gender || 'Unisex',
      price: Number(price),
      discount: Number(discount) || 0,
      finalPrice: calculatedFinal,
      stock: Number(stock),
      isFeatured: Boolean(isFeatured),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing product
// @route   PATCH /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const updates = req.body;

    // If price or discount modified, recompute finalPrice
    if (updates.price !== undefined || updates.discount !== undefined) {
      const price = updates.price !== undefined ? updates.price : product.price;
      const discount = updates.discount !== undefined ? updates.discount : product.discount;
      updates.finalPrice = calculateFinalPrice(price, discount);
    }

    Object.assign(product, updates);
    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product: updatedProduct,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
