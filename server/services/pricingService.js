const Product = require('../models/Product');

/**
 * Calculates selling price from original price and discount percentage
 */
const calculateFinalPrice = (price, discount = 0) => {
  const p = Number(price) || 0;
  const d = Math.max(0, Math.min(99, Number(discount) || 0));
  return Math.max(0, Math.round(p - (p * d) / 100));
};

/**
 * Validates cart/order items against database products, verifying stock and computing trusted totals
 */
const validateAndPriceItems = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('No items provided for pricing validation');
  }

  const validatedItems = [];
  let subtotal = 0;
  let totalDiscountSavings = 0;

  for (const item of items) {
    const productId = item.productId || item._id;
    const requestedQty = parseInt(item.quantity, 10);

    if (isNaN(requestedQty) || requestedQty < 1) {
      throw new Error(`Invalid quantity (${item.quantity}) for product`);
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error(`Product not found or has been removed from catalog`);
    }

    if (!product.isActive) {
      throw new Error(`Product "${product.title}" is currently unavailable for purchase`);
    }

    if (product.stock < requestedQty) {
      throw new Error(
        `Insufficient stock for "${product.title}". Requested: ${requestedQty}, Available: ${product.stock}`
      );
    }

    // Size validation if product defines sizes
    if (product.sizes && product.sizes.length > 0) {
      if (!item.size || !product.sizes.includes(item.size)) {
        throw new Error(`Please select a valid size for product "${product.title}"`);
      }
    }

    const finalPrice = calculateFinalPrice(product.price, product.discount);
    const lineTotal = finalPrice * requestedQty;
    const originalLineTotal = product.price * requestedQty;
    const savings = originalLineTotal - lineTotal;

    subtotal += lineTotal;
    totalDiscountSavings += savings;

    validatedItems.push({
      productId: product._id,
      title: product.title,
      image: product.mainImg,
      price: product.price,
      discount: product.discount || 0,
      finalPrice: finalPrice,
      size: item.size || '',
      quantity: requestedQty,
      lineTotal: lineTotal,
    });
  }

  // Free shipping above 500, else flat 50
  const shippingFee = subtotal >= 500 ? 0 : 50;
  // 5% estimated tax
  const taxAmount = Math.round(subtotal * 0.05);
  const totalAmount = subtotal + shippingFee + taxAmount;

  return {
    items: validatedItems,
    subtotal,
    discountAmount: totalDiscountSavings,
    shippingFee,
    taxAmount,
    totalAmount,
  };
};

module.exports = {
  calculateFinalPrice,
  validateAndPriceItems,
};
