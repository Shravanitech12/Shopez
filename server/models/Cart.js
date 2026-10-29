const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    titleSnapshot: {
      type: String,
      required: true,
    },
    imageSnapshot: {
      type: String,
      required: true,
    },
    priceSnapshot: {
      type: Number,
      required: true,
      min: 0,
    },
    discountSnapshot: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalPriceSnapshot: {
      type: Number,
      required: true,
      min: 0,
    },
    size: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

// userId has unique: true index already
module.exports = mongoose.model('Cart', cartSchema);
