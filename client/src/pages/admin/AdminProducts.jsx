import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  Check,
  X,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import api from '../../services/api';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useToast } from '../../context/ToastContext';

const AdminProducts = () => {
  const { showToast } = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    discount: '0',
    stock: '',
    sizes: 'S, M, L, XL',
    gender: 'Unisex',
    mainImg: '',
    isFeatured: false,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch categories
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

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedCategory) params.set('category', selectedCategory);
      params.set('page', page);
      params.set('limit', 10);

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
  }, [search, selectedCategory, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      category: categories[0]?._id || '',
      price: '',
      discount: '0',
      stock: '20',
      sizes: 'S, M, L, XL',
      gender: 'Unisex',
      mainImg: '',
      isFeatured: false,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      title: p.title,
      description: p.description,
      category: p.category?._id || p.category,
      price: p.price.toString(),
      discount: (p.discount || 0).toString(),
      stock: p.stock.toString(),
      sizes: (p.sizes || []).join(', '),
      gender: p.gender || 'Unisex',
      mainImg: p.mainImg,
      isFeatured: Boolean(p.isFeatured),
      isActive: Boolean(p.isActive),
    });
    setModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      setUploadingImage(true);
      const res = await api.post('/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.success && res.data?.url) {
        setFormData((prev) => ({ ...prev, mainImg: res.data.url }));
        showToast('Image uploaded successfully', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.price || !formData.mainImg) {
      showToast('Please fill all mandatory fields (Title, Category, Price, Main Image)', 'warning');
      return;
    }

    try {
      setSaving(true);
      const parsedSizes = formData.sizes
        ? formData.sizes.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: Number(formData.price),
        discount: Number(formData.discount) || 0,
        stock: Number(formData.stock) || 0,
        sizes: parsedSizes,
        gender: formData.gender,
        mainImg: formData.mainImg,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
      };

      if (editingProduct) {
        await api.patch(`/products/${editingProduct._id}`, payload);
        showToast('Product updated successfully', 'success');
      } else {
        await api.post('/products', payload);
        showToast('New product created successfully', 'success');
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      showToast(err.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      setDeleting(true);
      await api.delete(`/products/${productToDelete._id}`);
      showToast(`Product "${productToDelete.title}" deleted`, 'success');
      setDeleteModalOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (err) {
      showToast(err.message || 'Failed to delete product', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Product Catalog Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, update prices, discounts, inventory levels, and active status ({totalProducts} total)
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search products by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-600 font-medium"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12">
            <LoadingSpinner message="Fetching products..." />
          </div>
        ) : products.length === 0 ? (
          <p className="text-xs text-slate-500 py-12 text-center">
            No products match the specified query.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Final Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.mainImg}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-slate-900 truncate" title={p.title}>
                            {p.title}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {p.gender} {p.isFeatured && '• Featured'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-600">
                      {p.category?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">${p.price.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      {p.discount > 0 ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                          {p.discount}% OFF
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-black text-brand-700">
                      ${(p.finalPrice || p.price).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-bold ${
                          p.stock <= 5 ? 'text-rose-600' : 'text-slate-700'
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          p.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {p.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setProductToDelete(p);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-slate-100 transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-100">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Edit Product Details' : 'Create New Product'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Product Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Classic Wool Blend Overcoat"
                  className="w-full px-3.5 py-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Comprehensive description of material, cut, features..."
                  className="w-full px-3.5 py-2.5 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Target Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                    <option value="All">All</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Base Price ($) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Stock Units <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Sizes (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.sizes}
                  onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                  placeholder="S, M, L, XL or 8, 9, 10 or 40mm, 44mm"
                  className="w-full px-3.5 py-2.5 border rounded-xl"
                />
              </div>

              {/* Main Image URL and File Upload */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Main Image URL or Upload <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.mainImg}
                    onChange={(e) => setFormData({ ...formData, mainImg: e.target.value })}
                    placeholder="https://images.unsplash.com/... or /uploads/..."
                    className="flex-1 px-3.5 py-2.5 border rounded-xl font-mono text-xs"
                  />
                  <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer flex items-center gap-1 font-bold">
                    <Upload className="w-4 h-4" />
                    <span>{uploadingImage ? 'Uploading...' : 'Browse'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
                {formData.mainImg && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 mt-2">
                    <img src={formData.mainImg} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-600"
                  />
                  <span className="font-bold text-slate-700">Feature on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-600"
                  />
                  <span className="font-bold text-slate-700">Active (Visible to Shoppers)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${productToDelete?.title}" from the store catalog?`}
        confirmText="Confirm Delete"
        isDanger={true}
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalOpen(false);
          setProductToDelete(null);
        }}
      />
    </div>
  );
};

export default AdminProducts;
