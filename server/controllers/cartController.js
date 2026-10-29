const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { calculateFinalPrice } = require('../services/pricingService');

// Helper to sanitize & refresh cart with latest product data
const refreshCart = async (cart) => {
  let modified = false;
  const refreshedItems = [];

  for (const item of cart.items) {
    const product = await Product.findById(item.productId);

    // If product deleted or deactivated, exclude it
    if (!product || !product.isActive) {
      modified = true;
      continue;
    }

    const currentFinal = calculateFinalPrice(product.price, product.discount);

    // Ensure item quantity does not exceed available stock
    let qty = item.quantity;
    if (product.stock < qty) {
      qty = Math.max(1, product.stock);
      modified = true;
    }

    refreshedItems.push({
      _id: item._id,
      productId: product._id,
      titleSnapshot: product.title,
      imageSnapshot: product.mainImg,
      priceSnapshot: product.price,
      discountSnapshot: product.discount || 0,
      finalPriceSnapshot: currentFinal,
      size: item.size || '',
      quantity: qty,
      stock: product.stock,
    });
  }

  if (modified || refreshedItems.length !== cart.items.length) {
    cart.items = refreshedItems;
    await cart.save();
  }

  // Calculate totals
  const subtotal = refreshedItems.reduce((acc, it) => acc + it.finalPriceSnapshot * it.quantity, 0);
  const originalSubtotal = refreshedItems.reduce((acc, it) => acc + it.priceSnapshot * it.quantity, 0);
  const discountAmount = originalSubtotal - subtotal;
  const shippingFee = subtotal >= 500 || subtotal === 0 ? 0 : 50;
  const taxAmount = subtotal === 0 ? 0 : Math.round(subtotal * 0.05);
  const totalAmount = subtotal === 0 ? 0 : subtotal + shippingFee + taxAmount;

  return {
    items: refreshedItems,
    subtotal,
    discountAmount,
    shippingFee,
    taxAmount,
    totalAmount,
    totalItems: refreshedItems.reduce((acc, it) => acc + it.quantity, 0),
  };
};

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    const cartData = await refreshCart(cart);

    res.status(200).json({
      success: true,
      data: {
        cart: cartData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, size, quantity = 1 } = req.body;
    const addQty = parseInt(quantity, 10);

    if (!productId || isNaN(addQty) || addQty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid productId and positive quantity are required.',
      });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unavailable.',
      });
    }

    // Size validation
    if (product.sizes && product.sizes.length > 0) {
      if (!size || !product.sizes.includes(size)) {
        return res.status(400).json({
          success: false,
          message: `Please select a valid size for ${product.title} (${product.sizes.join(', ')})`,
        });
      }
    }

    if (product.stock < 1) {
      return res.status(400).json({
        success: false,
        message: `Sorry, "${product.title}" is out of stock.`,
      });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    // Check if item already in cart with same product and size
    const existingIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId && (item.size || '') === (size || '')
    );

    const finalPrice = calculateFinalPrice(product.price, product.discount);

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + addQty;
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. You have ${cart.items[existingIndex].quantity} in cart and only ${product.stock} available in stock.`,
        });
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].finalPriceSnapshot = finalPrice;
      cart.items[existingIndex].priceSnapshot = product.price;
      cart.items[existingIndex].discountSnapshot = product.discount || 0;
    } else {
      if (addQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} item(s) available in stock.`,
        });
      }
      cart.items.push({
        productId: product._id,
        titleSnapshot: product.title,
        imageSnapshot: product.mainImg,
        priceSnapshot: product.price,
        discountSnapshot: product.discount || 0,
        finalPriceSnapshot: finalPrice,
        size: size || '',
        quantity: addQty,
      });
    }

    await cart.save();
    const cartData = await refreshCart(cart);

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: {
        cart: cartData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PATCH /api/cart/items/:itemId
// @access  Private
const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const newQty = parseInt(quantity, 10);

    if (isNaN(newQty) || newQty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1.',
      });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    const product = await Product.findById(item.productId);
    if (!product || !product.isActive) {
      cart.items.pull(itemId);
      await cart.save();
      const cartData = await refreshCart(cart);
      return res.status(400).json({
        success: false,
        message: 'Product is no longer available and was removed from your cart.',
        data: { cart: cartData },
      });
    }

    if (newQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items currently in stock for this product.`,
      });
    }

    item.quantity = newQty;
    await cart.save();
    const cartData = await refreshCart(cart);

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: { cart: cartData },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
const removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();
    const cartData = await refreshCart(cart);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: { cart: cartData },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { items: [] } },
      { new: true, upsert: true }
    );

    const cartData = await refreshCart(cart);

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: { cart: cartData },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync / merge guest cart into user cart after login
// @route   POST /api/cart/sync
// @access  Private
const syncCart = async (req, res, next) => {
  try {
    const { items = [] } = req.body;
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    for (const guestItem of items) {
      const product = await Product.findById(guestItem.productId);
      if (!product || !product.isActive || product.stock < 1) continue;

      const size = guestItem.size || '';
      const qty = Math.min(product.stock, parseInt(guestItem.quantity, 10) || 1);

      const existingIndex = cart.items.findIndex(
        (it) => it.productId.toString() === guestItem.productId && (it.size || '') === size
      );

      const finalPrice = calculateFinalPrice(product.price, product.discount);

      if (existingIndex > -1) {
        cart.items[existingIndex].quantity = Math.min(
          product.stock,
          cart.items[existingIndex].quantity + qty
        );
      } else {
        cart.items.push({
          productId: product._id,
          titleSnapshot: product.title,
          imageSnapshot: product.mainImg,
          priceSnapshot: product.price,
          discountSnapshot: product.discount || 0,
          finalPriceSnapshot: finalPrice,
          size,
          quantity: qty,
        });
      }
    }

    await cart.save();
    const cartData = await refreshCart(cart);

    res.status(200).json({
      success: true,
      message: 'Cart synchronized successfully',
      data: { cart: cartData },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  syncCart,
};
