const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Banner image URL is required'],
    },
    link: {
      type: String,
      default: '/products',
      trim: true,
    },
    buttonText: {
      type: String,
      default: 'Shop Now',
    },
    badge: {
      type: String,
      default: '',
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

bannerSchema.index({ isActive: 1, displayOrder: 1 });

module.exports = mongoose.model('Banner', bannerSchema);
