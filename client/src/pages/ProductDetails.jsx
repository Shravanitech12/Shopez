import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Share2,
} from 'lucide-react';
import api from '../services/api';
import PriceDisplay from '../components/products/PriceDisplay';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/products/${id}`);
        if (res.success && res.data?.product) {
          const p = res.data.product;
          setProduct(p);
          setSelectedImage(p.mainImg);
          // Auto select first size if only 1
          if (p.sizes && p.sizes.length === 1) {
            setSelectedSize(p.sizes[0]);
          } else {
            setSelectedSize('');
          }
          setQuantity(1);
          setRelatedProducts(res.data.relatedProducts || []);
        } else {
          setError('Product could not be found');
        }
      } catch (err) {
        setError(err.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading product details..." />;
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <ErrorMessage
          title="Product Not Found"
          message={error || 'The requested product is not available.'}
          onRetry={() => navigate('/products')}
        />
      </div>
    );
  }

  const allImages = [product.mainImg, ...(product.images || [])].filter(Boolean);
  const isFavorite = isInWishlist(product._id);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      showToast('Please select an available size first', 'warning');
      return;
    }
    setAddingToCart(true);
    await addToCart(product, selectedSize, quantity);
    setAddingToCart(false);
  };

  const handleBuyNow = async () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      showToast('Please select an available size first', 'warning');
      return;
    }
    setAddingToCart(true);
    const res = await addToCart(product, selectedSize, quantity);
    setAddingToCart(false);
    if (res.success) {
      navigate('/checkout');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!', 'info');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/" className="hover:text-brand-600 transition">
          Home
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-brand-600 transition">
          Shop
        </Link>
        <span>/</span>
        <Link
          to={`/products?category=${product.category?.slug}`}
          className="hover:text-brand-600 transition"
        >
          {product.category?.name}
        </Link>
        <span>/</span>
        <span className="text-slate-800 truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Gallery Column */}
        <div className="space-y-4">
          {/* Main Selected Image */}
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
            <img
              src={selectedImage}
              alt={product.title}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-md">
                Save {product.discount}%
              </span>
            )}
          </div>

          {/* Thumbnails Row */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === img
                      ? 'border-brand-600 ring-2 ring-brand-200 shadow-sm'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details & Buying Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-bold text-brand-600 uppercase tracking-widest text-[11px]">
                {product.category?.name}
              </span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 transition"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {product.title}
            </h1>

            {/* Rating and review counter */}
            <div className="flex items-center gap-3 mt-3 text-sm text-slate-600">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="font-bold text-slate-900">
                {product.ratings?.average ? product.ratings.average.toFixed(1) : '4.8'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">
                {product.ratings?.count || 45} Verified Ratings
              </span>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="p-4 bg-slate-100/70 rounded-2xl border border-slate-200/60">
            <PriceDisplay
              price={product.price}
              discount={product.discount}
              finalPrice={product.finalPrice}
              size="lg"
            />
            <p className="text-xs text-slate-500 mt-1">
              Inclusive of standard applicable taxes. Free shipping applied on orders over $500.
            </p>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Overview
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              {product.description}
            </p>
          </div>

          {/* Sizes Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Select Size <span className="text-rose-500">*</span>
                </label>
                {selectedSize && (
                  <span className="text-xs text-brand-700 font-semibold">
                    Selected: {selectedSize}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-[48px] h-11 px-4 rounded-xl text-xs font-bold transition border ${
                      selectedSize === s
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/20'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Stock Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Quantity
              </label>
              <div className="inline-flex items-center border border-slate-200 rounded-xl bg-white shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  -
                </button>
                <span className="w-12 text-center text-sm font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((prev) => Math.min(product.stock, prev + 1))
                  }
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Stock status badge */}
            <div className="text-left sm:text-right">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                  <AlertCircle className="w-4 h-4" />
                  Currently Out of Stock
                </span>
              ) : product.stock <= 5 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                  Only {product.stock} items left in stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  In Stock ({product.stock} available)
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons: Add to Cart, Buy Now, Wishlist */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
              className="flex-1 py-4 px-6 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-md shadow-slate-900/20"
            >
              <ShoppingCart className="w-5 h-5" />
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock || addingToCart}
              className="flex-1 py-4 px-6 rounded-2xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-500 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-md shadow-brand-600/30"
            >
              Buy Now
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              className={`p-4 rounded-2xl border transition flex items-center justify-center ${
                isFavorite
                  ? 'border-rose-200 bg-rose-50 text-rose-600'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title={isFavorite ? 'Remove from wishlist' : 'Save to wishlist'}
              aria-label="Wishlist"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Value Assurances Box */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>Complimentary express delivery over $500</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>30-Day effortless return guarantee</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>100% Genuine brand warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-slate-200">
          <div className="mb-6">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
              Similar Picks
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              You May Also Like
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
