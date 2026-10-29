import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Percent,
  CheckCircle2,
  Mail,
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';

const Home = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [bannersRes, categoriesRes, featuredRes, newRes] = await Promise.all([
          api.get('/banners'),
          api.get('/categories'),
          api.get('/products/featured'),
          api.get('/products?sort=newest&limit=4'),
        ]);

        if (bannersRes.success) setBanners(bannersRes.data.banners || []);
        if (categoriesRes.success) setCategories(categoriesRes.data.categories || []);
        if (featuredRes.success) setFeaturedProducts(featuredRes.data.products || []);
        if (newRes.success) setNewArrivals(newRes.data.products || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Banner auto-rotation
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      showToast('Thank you for subscribing to SHOPEZ VIP updates!', 'success');
      setNewsletterEmail('');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading SHOPEZ storefront..." />;
  }

  const currentBanner = banners[currentBannerIndex];

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO BANNER CAROUSEL */}
      {currentBanner && (
        <section className="relative bg-slate-900 overflow-hidden">
          <div className="relative min-h-[480px] sm:min-h-[580px] lg:min-h-[620px] flex items-center">
            {/* Background Image with Dark Vignette */}
            <div className="absolute inset-0">
              <img
                src={currentBanner.image}
                alt={currentBanner.title}
                className="w-full h-full object-cover object-center transform scale-100 transition-all duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
            </div>

            {/* Banner Content */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
              <div className="max-w-xl space-y-6">
                {currentBanner.badge && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-brand-600 text-white shadow-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    {currentBanner.badge}
                  </span>
                )}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                  {currentBanner.title}
                </h1>
                {currentBanner.subtitle && (
                  <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                    {currentBanner.subtitle}
                  </p>
                )}
                <div className="pt-2 flex items-center gap-4">
                  <Link
                    to={currentBanner.link || '/products'}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-bold text-base transition-all transform hover:-translate-y-0.5 shadow-lg shadow-brand-600/30"
                  >
                    {currentBanner.buttonText || 'Shop Now'}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/products"
                    className="hidden sm:inline-flex items-center px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-semibold text-base backdrop-blur-md transition"
                  >
                    View All Deals
                  </Link>
                </div>
              </div>
            </div>

            {/* Banner Navigation Controls */}
            {banners.length > 1 && (
              <div className="absolute bottom-6 right-6 sm:right-12 z-20 flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentBannerIndex(
                      (prev) => (prev - 1 + banners.length) % banners.length
                    )
                  }
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white flex items-center justify-center transition"
                  aria-label="Previous banner"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-1.5 px-2">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentBannerIndex(i)}
                      className={`h-2 rounded-full transition-all ${
                        currentBannerIndex === i ? 'w-6 bg-brand-500' : 'w-2 bg-white/40'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() =>
                    setCurrentBannerIndex((prev) => (prev + 1) % banners.length)
                  }
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white flex items-center justify-center transition"
                  aria-label="Next banner"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 2. FEATURED CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
              Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Categories
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700 transition"
          >
            Browse all categories
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/products?category=${category.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-slate-100 border border-slate-200/80 shadow-xs hover:shadow-cardHover transition-all flex flex-col justify-end p-4"
            >
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="relative z-10">
                <h3 className="font-bold text-white text-base leading-tight group-hover:text-brand-300 transition">
                  {category.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1 font-medium">
                  {category.productCount !== undefined
                    ? `${category.productCount} items`
                    : 'Shop Now'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. TRENDING & FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
                Handpicked Deals
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Trending Products
              </h2>
            </div>
          </div>
          <Link
            to="/products?isFeatured=true"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700 transition"
          >
            Explore all featured
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. PROMOTIONAL CALLOUT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 text-white overflow-hidden p-8 sm:p-12 lg:p-16 shadow-xl">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md uppercase tracking-wider">
              <Percent className="w-3.5 h-3.5 text-amber-300" />
              Special Autumn Promotion
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Enjoy Free Shipping on Orders Exceeding $500
            </h2>
            <p className="text-sm sm:text-base text-brand-100 leading-relaxed font-normal">
              Plus, receive an automatic seasonal discount applied directly during checkout. Discover refined craftsmanship across our newest electronics and fashion lines.
            </p>
            <div className="pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-brand-900 rounded-xl font-bold text-sm hover:bg-brand-50 transition shadow-lg"
              >
                Shop Qualifying Items
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Decorative circles */}
          <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/3 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute right-10 bottom-0 translate-y-1/3 w-64 h-64 rounded-full bg-brand-400/20 blur-2xl" />
        </div>
      </section>

      {/* 5. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
              Fresh Off The Rack
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/products?sort=newest"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700 transition"
          >
            View all new drops
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. NEWSLETTER SUBSCRIPTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100 rounded-3xl p-8 sm:p-12 border border-slate-200/80 text-center max-w-3xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-md shadow-brand-500/20">
            <Mail className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Join the SHOPEZ Inner Circle
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Subscribe to our weekly curated dispatch for private drop notifications, exclusive vouchers, and style guides.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="pt-2 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-600"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-slate-900 hover:bg-brand-600 text-white rounded-xl text-sm font-bold transition shadow-sm"
            >
              Subscribe
            </button>
          </form>

          <p className="text-[11px] text-slate-400">
            No spam, ever. Unsubscribe with one click anytime.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
