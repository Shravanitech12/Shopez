import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, Upload, X } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useToast } from '../../context/ToastContext';

const AdminCategories = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      if (res.success && res.data) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image: cat.image || '',
      isActive: Boolean(cat.isActive),
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Category name is required', 'warning');
      return;
    }

    try {
      setSaving(true);
      if (editingCategory) {
        await api.patch(`/categories/${editingCategory._id}`, formData);
        showToast('Category updated successfully', 'success');
      } else {
        await api.post('/categories', formData);
        showToast('Category created successfully', 'success');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      showToast(err.message || 'Failed to save category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/categories/${categoryToDelete._id}`);
      if (res.success) {
        showToast('Category deleted successfully', 'success');
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
        fetchCategories();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete category', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Category Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize catalog departments, slugs, promotional imagery and active visibility
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Categories Grid Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12">
            <LoadingSpinner message="Fetching categories..." />
          </div>
        ) : categories.length === 0 ? (
          <p className="text-xs text-slate-500 py-12 text-center">No categories created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Slug Identifier</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Products Linked</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {categories.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {c.image ? (
                          <img
                            src={c.image}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                            <Layers className="w-5 h-5" />
                          </div>
                        )}
                        <span className="font-bold text-slate-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{c.slug}</td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {c.description || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                        {c.productCount || 0} active items
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          c.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(c)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setCategoryToDelete(c);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-slate-100 transition"
                          title="Delete Category"
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
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Create Category'}
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
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Footwear & Shoes"
                  className="w-full px-3.5 py-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Slug (Optional - auto-generated if blank)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. footwear-shoes"
                  className="w-full px-3.5 py-2.5 border rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of category products..."
                  className="w-full px-3.5 py-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 border rounded-xl font-mono text-xs"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-600"
                />
                <span className="font-bold text-slate-700">Active (Visible in Store)</span>
              </label>

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
                  disabled={saving}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold"
                >
                  {saving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Category"
        message={`Are you sure you want to delete category "${categoryToDelete?.name}"? You will be blocked if products are still assigned to it.`}
        confirmText="Confirm Delete"
        isDanger={true}
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
      />
    </div>
  );
};

export default AdminCategories;
