const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [200, 'Product title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    mainImg: {
      type: String,
      required: [true, 'Main product image is required'],
    },
    images: {
      type: [String],
      default: [],
    },
    carousel: {
      type: [String],
      default: [],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    sizes: {
      type: [String],
      default: [],
    },
    gender: {
      type: String,
      enum: ['Men', 'Women', 'Unisex', 'Kids', 'All'],
      default: 'Unisex',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount percentage cannot be negative'],
      max: [99, 'Discount percentage cannot exceed 99%'],
    },
    finalPrice: {
      type: Number,
      default: 0,
      min: [0, 'Final price cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    ratings: {
      average: { type: Number, default: 4.5, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save calculate finalPrice
productSchema.pre('save', function (next) {
  const disc = Number(this.discount) || 0;
  const base = Number(this.price) || 0;
  this.finalPrice = Math.max(0, Math.round(base - (base * disc) / 100));
  next();
});

productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ gender: 1 });
productSchema.index({ price: 1 });
productSchema.index({ finalPrice: 1 });
productSchema.index({ discount: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
