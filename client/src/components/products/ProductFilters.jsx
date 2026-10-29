import React from 'react';
import { Filter, RotateCcw, X } from 'lucide-react';

const ProductFilters = ({
  categories = [],
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
  minDiscount,
  onDiscountChange,
  selectedSize,
  onSizeChange,
  selectedGender,
  onGenderChange,
  onClearFilters,
  onCloseMobile,
}) => {
  const commonSizes = ['S', 'M', 'L', 'XL', 'XXL', '7', '8', '9', '10', '11', '40mm', '44mm'];
  const genders = ['All', 'Men', 'Women', 'Unisex'];
  const discountOptions = [
    { label: 'Any discount', value: '' },
    { label: '10% or more', value: '10' },
    { label: '20% or more', value: '20' },
    { label: '30% or more', value: '30' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-600" />
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Filters</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-600 transition"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
          Categories
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => onCategoryChange('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
              selectedCategory === 'all' || !selectedCategory
                ? 'bg-brand-50 text-brand-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => onCategoryChange(cat.slug)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                selectedCategory === cat.slug
                  ? 'bg-brand-50 text-brand-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="truncate">{cat.name}</span>
              {cat.productCount !== undefined && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  {cat.productCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
          Price Range ($)
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => onPriceChange({ ...priceRange, min: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
          />
          <span className="text-slate-400 text-xs">-</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => onPriceChange({ ...priceRange, max: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Gender */}
      <div className="pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
          Target Audience
        </h4>
        <div className="grid grid-cols-2 gap-1.5">
          {genders.map((g) => (
            <button
              key={g}
              onClick={() => onGenderChange(g)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                selectedGender === g
                  ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Minimum Discount */}
      <div className="pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
          Discount Offers
        </h4>
        <div className="space-y-1.5">
          {discountOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none"
            >
              <input
                type="radio"
                name="discount"
                checked={minDiscount === opt.value}
                onChange={() => onDiscountChange(opt.value)}
                className="w-4 h-4 text-brand-600 focus:ring-brand-500 border-slate-300"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
          Size
        </h4>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onSizeChange('all')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition ${
              selectedSize === 'all' || !selectedSize
                ? 'bg-slate-900 text-white border-slate-900'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All
          </button>
          {commonSizes.map((s) => (
            <button
              key={s}
              onClick={() => onSizeChange(s)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition ${
                selectedSize === s
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
