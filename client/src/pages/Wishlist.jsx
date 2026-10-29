import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import PriceDisplay from '../components/products/PriceDisplay';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Wishlist = () => {
  const { wishlist, toggleWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading your saved items..." />;
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          description="Save the products you love by clicking the heart icon. They will be stored here for future shopping."
          actionLabel="Explore Trending Items"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Saved Wishlist
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {wishlist.length} item{wishlist.length > 1 ? 's' : ''} saved for later
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => {
          if (!product || !product._id) return null;

          return (
            <div
              key={product._id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-card transition flex flex-col justify-between overflow-hidden"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                <Link to={`/products/${product._id}`}>
                  <img
                    src={product.mainImg}
                    alt={product.title}
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <button
                  onClick={() => toggleWishlist(product)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white text-rose-500 hover:bg-rose-50 shadow-sm transition"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest block mb-1">
                    {product.category?.name || 'Catalog'}
                  </span>
                  <Link
                    to={`/products/${product._id}`}
                    className="text-sm font-bold text-slate-900 hover:text-brand-600 transition line-clamp-2"
                  >
                    {product.title}
                  </Link>
                </div>

                <div className="pt-3 border-t border-slate-100 mt-3 space-y-3">
                  <PriceDisplay
                    price={product.price}
                    discount={product.discount}
                    finalPrice={product.finalPrice}
                    size="sm"
                  />

                  <button
                    onClick={() => {
                      const size = product.sizes && product.sizes.length > 0 ? product.sizes[0] : '';
                      addToCart(product, size, 1);
                    }}
                    disabled={product.stock <= 0}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Move to Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;
