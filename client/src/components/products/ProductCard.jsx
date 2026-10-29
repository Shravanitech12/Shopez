import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import PriceDisplay from './PriceDisplay';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState(
    product.sizes && product.sizes.length === 1 ? product.sizes[0] : ''
  );
  const [showSizePicker, setShowSizePicker] = useState(false);

  const isFavorite = isInWishlist(product._id);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has sizes and none selected, open picker
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setShowSizePicker(true);
      return;
    }

    await addToCart(product, selectedSize || '', 1);
    setShowSizePicker(false);
  };

  const handleSizeSelectAndAdd = async (size) => {
    setSelectedSize(size);
    await addToCart(product, size, 1);
    setShowSizePicker(false);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-cardHover transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image & Badges Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <Link to={`/products/${product._id}`} className="block w-full h-full">
          <img
            src={product.mainImg}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.discount > 0 && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white shadow-sm">
              -{product.discount}%
            </span>
          )}
          {product.isFeatured && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900 text-white shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition shadow-sm ${
            isFavorite
              ? 'bg-rose-500 text-white hover:bg-rose-600'
              : 'bg-white/90 text-slate-700 hover:text-rose-500 hover:bg-white'
          }`}
          aria-label="Toggle Wishlist"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Out of Stock Overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-4">
            <span className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-sm tracking-wide shadow-md">
              Sold Out
            </span>
          </div>
        )}

        {/* Quick Size Picker Modal / Overlay */}
        {showSizePicker && product.sizes && product.sizes.length > 0 && (
          <div
            className="absolute inset-0 bg-white/95 backdrop-blur-sm p-4 flex flex-col justify-center items-center gap-2 z-20 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Select a Size:
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center max-w-[180px]">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSizeSelectAndAdd(s)}
                  className="px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg hover:bg-brand-600 hover:text-white hover:border-brand-600 transition"
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSizePicker(false)}
              className="text-[11px] text-slate-400 hover:text-slate-600 mt-2 underline"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Gender */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-semibold text-brand-600 uppercase tracking-wider text-[11px]">
              {product.category?.name || 'General'}
            </span>
            {product.gender && product.gender !== 'All' && (
              <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                {product.gender}
              </span>
            )}
          </div>

          {/* Title */}
          <Link
            to={`/products/${product._id}`}
            className="block text-sm font-bold text-slate-900 hover:text-brand-600 transition line-clamp-2 leading-snug mb-2"
            title={product.title}
          >
            {product.title}
          </Link>

          {/* Ratings */}
          <div className="flex items-center gap-1.5 mb-3 text-xs text-slate-500">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-bold text-slate-700">
              {product.ratings?.average ? product.ratings.average.toFixed(1) : '4.8'}
            </span>
            <span className="text-slate-400">
              ({product.ratings?.count || 45})
            </span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <PriceDisplay
            price={product.price}
            discount={product.discount}
            finalPrice={product.finalPrice}
            size="sm"
          />

          <button
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className="p-2.5 rounded-xl bg-slate-900 text-white hover:bg-brand-600 disabled:opacity-40 disabled:hover:bg-slate-900 transition flex items-center justify-center shadow-sm"
            title={product.stock <= 0 ? 'Out of stock' : 'Add to cart'}
            aria-label="Add to Cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
