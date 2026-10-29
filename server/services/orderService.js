const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { generateOrderNumber } = require('../utils/orderNumber');
const { validateAndPriceItems } = require('./pricingService');

/**
 * Creates a new order, validates stock, decrements inventory, and empties cart
 */
const createOrder = async ({ userId, items, shippingAddress, paymentMethod, paymentDetails }) => {
  // 1. Validate items and recalculate server-side pricing
  const calculation = await validateAndPriceItems(items);

  // 2. Decrement stock for all items
  for (const item of calculation.items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.quantity },
    });
  }

  // 3. Create the order
  const orderNumber = generateOrderNumber();
  const orderStatus = paymentMethod === 'Online Payment' ? 'Confirmed' : 'Pending';
  const paymentStatus = paymentMethod === 'Online Payment' ? 'Paid' : 'Pending';

  const order = await Order.create({
    orderNumber,
    userId,
    items: calculation.items,
    shippingAddress,
    paymentMethod,
    paymentStatus,
    paymentDetails: paymentDetails || {},
    subtotal: calculation.subtotal,
    discountAmount: calculation.discountAmount,
    shippingFee: calculation.shippingFee,
    taxAmount: calculation.taxAmount,
    totalAmount: calculation.totalAmount,
    status: orderStatus,
  });

  // 4. Clear the user's cart
  await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

  return order;
};

/**
 * Restores product stock when an order is cancelled
 */
const restoreStockForOrder = async (order) => {
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: item.quantity },
    });
  }
};

module.exports = {
  createOrder,
  restoreStockForOrder,
};
