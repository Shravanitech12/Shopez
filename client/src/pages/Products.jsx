import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state initialized from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('minPrice') || '',
    max: searchParams.get('maxPrice') || '',
  });
  const [minDiscount, setMinDiscount] = useState(searchParams.get('minDiscount') || '');
  const [size, setSize] = useState(searchParams.get('size') || 'all');
  const [gender, setGender] = useState(searchParams.get('gender') || 'All');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Synchronize when URL searchParams change
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || 'all');
    setPriceRange({
      min: searchParams.get('minPrice') || '',
      max: searchParams.get('maxPrice') || '',
    });
    setMinDiscount(searchParams.get('minDiscount') || '');
    setSize(searchParams.get('size') || 'all');
    setGender(searchParams.get('gender') || 'All');
    setSort(searchParams.get('sort') || 'newest');
    setPage(parseInt(searchParams.get('page'), 10) || 1);
  }, [searchParams]);

  // Load categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.success) setCategories(res.data.categories || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch products based on current active query
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category && category !== 'all') params.set('category', category);
      if (priceRange.min) params.set('minPrice', priceRange.min);
      if (priceRange.max) params.set('maxPrice', priceRange.max);
      if (minDiscount) params.set('minDiscount', minDiscount);
      if (size && size !== 'all') params.set('size', size);
      if (gender && gender !== 'All') params.set('gender', gender);
      if (sort) params.set('sort', sort);
      params.set('page', page);
      params.set('limit', 12);

      const res = await api.get(`/products?${params.toString()}`);
      if (res.success && res.data) {
        setProducts(res.data.products || []);
        setTotalPages(res.data.pages || 1);
        setTotalProducts(res.data.totalProducts || 0);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }, [search, category, priceRange, minDiscount, size, gender, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Helper to update URL search params
  const updateUrlParams = (newParams) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === '' || v === 'all' || v === 'All' || v === null || v === undefined) {
        nextParams.delete(k);
      } else {
        nextParams.set(k, v);
      }
    });
    // Reset page to 1 whenever a filter other than page changes
    if (!newParams.page) {
      nextParams.delete('page');
      setPage(1);
    }
    setSearchParams(nextParams);
  };

  const handleCategoryChange = (catSlug) => {
    setCategory(catSlug);
    updateUrlParams({ category: catSlug });
  };

  const handlePriceChange = (newRange) => {
    setPriceRange(newRange);
    updateUrlParams({ minPrice: newRange.min, maxPrice: newRange.max });
  };

  const handleDiscountChange = (disc) => {
    setMinDiscount(disc);
    updateUrlParams({ minDiscount: disc });
  };

  const handleSizeChange = (sz) => {
    setSize(sz);
    updateUrlParams({ size: sz });
  };

  const handleGenderChange = (g) => {
    setGender(g);
    updateUrlParams({ gender: g });
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSort(newSort);
    updateUrlParams({ sort: newSort });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateUrlParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('all');
    setPriceRange({ min: '', max: '' });
    setMinDiscount('');
    setSize('all');
    setGender('All');
    setSort('newest');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Breadcrumb & Title */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {search ? `Search results for "${search}"` : 'All Products Catalog'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing {products.length} of {totalProducts} curated items
          </p>
        </div>

        {/* Controls: Mobile Filter Button & Sort Dropdown */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand-600" />
            Filters
          </button>

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sort}
              onChange={handleSortChange}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer py-1"
            >
              <option value="newest">Sort: Newest Arrivals</option>
              <option value="price-asc">Sort: Price Low to High</option>
              <option value="price-desc">Sort: Price High to Low</option>
              <option value="discount-desc">Sort: Highest Discount</option>
              <option value="popular">Sort: Customer Rating</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <div className="hidden md:block col-span-1 sticky top-28">
          <ProductFilters
            categories={categories}
            selectedCategory={category}
            onCategoryChange={handleCategoryChange}
            priceRange={priceRange}
            onPriceChange={handlePriceChange}
            minDiscount={minDiscount}
            onDiscountChange={handleDiscountChange}
            selectedSize={size}
            onSizeChange={handleSizeChange}
            selectedGender={gender}
            onGenderChange={handleGenderChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setMobileFilterOpen(false)}
            />
            <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-4 overflow-y-auto z-10">
              <ProductFilters
                categories={categories}
                selectedCategory={category}
                onCategoryChange={handleCategoryChange}
                priceRange={priceRange}
                onPriceChange={handlePriceChange}
                minDiscount={minDiscount}
                onDiscountChange={handleDiscountChange}
                selectedSize={size}
                onSizeChange={handleSizeChange}
                selectedGender={gender}
                onGenderChange={handleGenderChange}
                onClearFilters={handleClearFilters}
                onCloseMobile={() => setMobileFilterOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Products Grid Column */}
        <div className="col-span-1 md:col-span-3">
          {loading ? (
            <LoadingSpinner size="lg" message="Loading catalog..." fullScreen={false} />
          ) : products.length === 0 ? (
            <EmptyState
              title="No matching products found"
              description="We couldn't find any products matching your specific filters. Try clearing or relaxing some criteria."
              actionLabel="Reset All Filters"
              onAction={handleClearFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
