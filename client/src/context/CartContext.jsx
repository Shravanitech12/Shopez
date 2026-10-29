import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

const GUEST_CART_STORAGE_KEY = 'shopez_guest_cart';

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    discountAmount: 0,
    shippingFee: 0,
    taxAmount: 0,
    totalAmount: 0,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(false);

  // Recalculate guest cart totals
  const computeGuestCartSummary = (items) => {
    const subtotal = items.reduce((acc, it) => acc + it.finalPriceSnapshot * it.quantity, 0);
    const originalSubtotal = items.reduce((acc, it) => acc + it.priceSnapshot * it.quantity, 0);
    const discountAmount = originalSubtotal - subtotal;
    const shippingFee = subtotal >= 500 || subtotal === 0 ? 0 : 50;
    const taxAmount = subtotal === 0 ? 0 : Math.round(subtotal * 0.05);
    const totalAmount = subtotal === 0 ? 0 : subtotal + shippingFee + taxAmount;
    const totalItems = items.reduce((acc, it) => acc + it.quantity, 0);

    return {
      items,
      subtotal,
      discountAmount,
      shippingFee,
      taxAmount,
      totalAmount,
      totalItems,
    };
  };

  // Fetch cart from backend if authenticated, or load from localStorage if guest
  const fetchCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const res = await api.get('/cart');
        if (res.success && res.data?.cart) {
          setCart(res.data.cart);
        }
      } catch (err) {
        console.error('Failed to fetch cart:', err);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const stored = localStorage.getItem(GUEST_CART_STORAGE_KEY);
        if (stored) {
          const parsedItems = JSON.parse(stored);
          setCart(computeGuestCartSummary(parsedItems));
        } else {
          setCart({
            items: [],
            subtotal: 0,
            discountAmount: 0,
            shippingFee: 0,
            taxAmount: 0,
            totalAmount: 0,
            totalItems: 0,
          });
        }
      } catch (err) {
        console.error('Error loading guest cart:', err);
      }
    }
  }, [isAuthenticated]);

  // Sync guest cart when logging in
  useEffect(() => {
    const syncGuestCartOnLogin = async () => {
      if (isAuthenticated) {
        try {
          const stored = localStorage.getItem(GUEST_CART_STORAGE_KEY);
          if (stored) {
            const guestItems = JSON.parse(stored);
            if (guestItems.length > 0) {
              await api.post('/cart/sync', { items: guestItems });
              localStorage.removeItem(GUEST_CART_STORAGE_KEY);
            }
          }
        } catch (err) {
          console.error('Error syncing guest cart:', err);
        }
        await fetchCart();
      } else {
        await fetchCart();
      }
    };

    syncGuestCartOnLogin();
  }, [isAuthenticated, fetchCart]);

  // Add to cart
  const addToCart = async (product, size = '', quantity = 1) => {
    const qty = parseInt(quantity, 10) || 1;

    // Validate size if required
    if (product.sizes && product.sizes.length > 0 && !size) {
      showToast('Please select a size first', 'warning');
      return { success: false, message: 'Please select a size' };
    }

    if (isAuthenticated) {
      try {
        setLoading(true);
        const res = await api.post('/cart/items', {
          productId: product._id,
          size,
          quantity: qty,
        });
        if (res.success && res.data?.cart) {
          setCart(res.data.cart);
          showToast(`"${product.title}" added to cart!`, 'success');
          return { success: true };
        }
        return { success: false, message: res.message };
      } catch (err) {
        showToast(err.message || 'Could not add item to cart', 'error');
        return { success: false, message: err.message };
      } finally {
        setLoading(false);
      }
    } else {
      // Guest cart handling
      const currentItems = [...cart.items];
      const existingIdx = currentItems.findIndex(
        (it) => it.productId === product._id && (it.size || '') === (size || '')
      );

      const finalPrice = product.finalPrice || Math.round(product.price - (product.price * (product.discount || 0)) / 100);

      if (existingIdx > -1) {
        const newQty = currentItems[existingIdx].quantity + qty;
        if (newQty > product.stock) {
          showToast(`Only ${product.stock} available in stock`, 'warning');
          return { success: false };
        }
        currentItems[existingIdx].quantity = newQty;
      } else {
        if (qty > product.stock) {
          showToast(`Only ${product.stock} available in stock`, 'warning');
          return { success: false };
        }
        currentItems.push({
          _id: 'guest_' + Date.now() + Math.random().toString(36).substring(2, 6),
          productId: product._id,
          titleSnapshot: product.title,
          imageSnapshot: product.mainImg,
          priceSnapshot: product.price,
          discountSnapshot: product.discount || 0,
          finalPriceSnapshot: finalPrice,
          size: size || '',
          quantity: qty,
          stock: product.stock,
        });
      }

      localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(currentItems));
      setCart(computeGuestCartSummary(currentItems));
      showToast(`"${product.title}" added to cart!`, 'success');
      return { success: true };
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId, newQuantity) => {
    const qty = parseInt(newQuantity, 10);
    if (isNaN(qty) || qty < 1) return;

    if (isAuthenticated) {
      try {
        const res = await api.patch(`/cart/items/${itemId}`, { quantity: qty });
        if (res.success && res.data?.cart) {
          setCart(res.data.cart);
        }
      } catch (err) {
        showToast(err.message || 'Error updating quantity', 'error');
      }
    } else {
      const updated = cart.items.map((it) =>
        it._id === itemId ? { ...it, quantity: Math.min(it.stock || 99, qty) } : it
      );
      localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(updated));
      setCart(computeGuestCartSummary(updated));
    }
  };

  // Remove item
  const removeFromCart = async (itemId) => {
    if (isAuthenticated) {
      try {
        const res = await api.delete(`/cart/items/${itemId}`);
        if (res.success && res.data?.cart) {
          setCart(res.data.cart);
          showToast('Item removed from cart', 'info');
        }
      } catch (err) {
        showToast(err.message || 'Error removing item', 'error');
      }
    } else {
      const updated = cart.items.filter((it) => it._id !== itemId);
      localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(updated));
      setCart(computeGuestCartSummary(updated));
      showToast('Item removed from cart', 'info');
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        const res = await api.delete('/cart');
        if (res.success && res.data?.cart) {
          setCart(res.data.cart);
        }
      } catch (err) {
        console.error('Failed to clear cart:', err);
      }
    } else {
      localStorage.removeItem(GUEST_CART_STORAGE_KEY);
      setCart({
        items: [],
        subtotal: 0,
        discountAmount: 0,
        shippingFee: 0,
        taxAmount: 0,
        totalAmount: 0,
        totalItems: 0,
      });
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        items: cart.items,
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
        discountAmount: cart.discountAmount,
        shippingFee: cart.shippingFee,
        taxAmount: cart.taxAmount,
        totalAmount: cart.totalAmount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
