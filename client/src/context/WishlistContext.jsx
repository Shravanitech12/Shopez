import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);
const GUEST_WISHLIST_KEY = 'shopez_guest_wishlist';

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const res = await api.get('/wishlist');
        if (res.success && res.data?.wishlist) {
          setWishlist(res.data.wishlist);
        }
      } catch (err) {
        console.error('Error fetching wishlist:', err);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const stored = localStorage.getItem(GUEST_WISHLIST_KEY);
        if (stored) {
          setWishlist(JSON.parse(stored));
        } else {
          setWishlist([]);
        }
      } catch (err) {
        console.error('Error loading guest wishlist:', err);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = (productId) => {
    if (!productId) return false;
    return wishlist.some((item) => (item._id || item) === productId);
  };

  const toggleWishlist = async (product) => {
    const productId = product._id;
    const exists = isInWishlist(productId);

    if (isAuthenticated) {
      try {
        if (exists) {
          const res = await api.delete(`/wishlist/${productId}`);
          if (res.success) {
            setWishlist((prev) => prev.filter((it) => (it._id || it) !== productId));
            showToast('Removed from wishlist', 'info');
          }
        } else {
          const res = await api.post(`/wishlist/${productId}`);
          if (res.success) {
            setWishlist((prev) => [...prev, product]);
            showToast('Saved to wishlist!', 'success');
          }
        }
      } catch (err) {
        showToast(err.message || 'Wishlist operation failed', 'error');
      }
    } else {
      // Guest wishlist
      let updated;
      if (exists) {
        updated = wishlist.filter((it) => (it._id || it) !== productId);
        showToast('Removed from wishlist', 'info');
      } else {
        updated = [...wishlist, product];
        showToast('Saved to wishlist!', 'success');
      }
      setWishlist(updated);
      localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(updated));
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        fetchWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
