import React, { useState, useEffect } from 'react';
import { Image, Plus, Edit2, Trash2, X, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useToast } from '../../context/ToastContext';

const AdminBanners = () => {
  const { showToast } = useToast();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    link: '/products',
    buttonText: 'Shop Now',
    badge: 'NEW SEASON',
    displayOrder: 1,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get('/banners/all');
      if (res.success && res.data) {
        setBanners(res.data.banners || []);
      }
    } catch (err) {
      console.error('Failed to load banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenAddModal = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      image: '',
      link: '/products',
      buttonText: 'Shop Now',
      badge: 'LIMITED DEAL',
      displayOrder: banners.length + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (b) => {
    setEditingBanner(b);
    setFormData({
      title: b.title,
      subtitle: b.subtitle || '',
      image: b.image,
      link: b.link || '/products',
      buttonText: b.buttonText || 'Shop Now',
      badge: b.badge || '',
      displayOrder: b.displayOrder || 1,
      isActive: Boolean(b.isActive),
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.image) {
      showToast('Banner title and image URL are mandatory.', 'warning');
      return;
    }

    try {
      setSaving(true);
      if (editingBanner) {
        await api.patch(`/banners/${editingBanner._id}`, formData);
        showToast('Banner updated successfully', 'success');
      } else {
        await api.post('/banners', formData);
        showToast('Banner created successfully', 'success');
      }
      setModalOpen(false);
      fetchBanners();
    } catch (err) {
      showToast(err.message || 'Failed to save banner', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!bannerToDelete) return;
    try {
      setDeleting(true);
      await api.delete(`/banners/${bannerToDelete._id}`);
      showToast('Banner deleted successfully', 'success');
      setDeleteModalOpen(false);
      setBannerToDelete(null);
      fetchBanners();
    } catch (err) {
      showToast(err.message || 'Failed to delete banner', 'error');
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
            Promotional Banner Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure homepage hero banners, sale announcements, and promotional campaign artwork
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Promotional Banner
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching banners..." />
      ) : banners.length === 0 ? (
        <p className="text-xs text-slate-500 py-12 text-center bg-white rounded-3xl border border-slate-200">
          No promotional banners found. Create one to display on the storefront homepage.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div
              key={banner._id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      banner.isActive
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {banner.isActive ? 'Active' : 'Draft'}
                  </span>
                  {banner.badge && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-600 text-white">
                      {banner.badge}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">
                    {banner.title}
                  </h4>
                  {banner.subtitle && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {banner.subtitle}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    Order: <strong>#{banner.displayOrder}</strong>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(banner)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition"
                      title="Edit Banner"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setBannerToDelete(banner);
                        setDeleteModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-slate-100 transition"
                      title="Delete Banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Banner Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingBanner ? 'Edit Banner' : 'Create Banner'}
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
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Winter Capsule Collection"
                  className="w-full px-3.5 py-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Subtitle
                </label>
                <textarea
                  rows={2}
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Short engaging caption..."
                  className="w-full px-3.5 py-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Image URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 border rounded-xl font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Link Target
                  </label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="/products?category=mens-fashion"
                    className="w-full px-3.5 py-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="Shop Now"
                    className="w-full px-3.5 py-2.5 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. NEW SEASON"
                    className="w-full px-3.5 py-2.5 border rounded-xl uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, displayOrder: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border rounded-xl"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-600"
                />
                <span className="font-bold text-slate-700">Active (Visible on Homepage Carousel)</span>
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
                  {saving ? 'Saving...' : editingBanner ? 'Save Changes' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Banner"
        message={`Are you sure you want to delete banner "${bannerToDelete?.title}"?`}
        confirmText="Confirm Delete"
        isDanger={true}
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalOpen(false);
          setBannerToDelete(null);
        }}
      />
    </div>
  );
};

export default AdminBanners;
