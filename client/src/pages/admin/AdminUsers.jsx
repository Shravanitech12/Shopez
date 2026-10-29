import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, ShieldCheck, UserX, UserCheck, Calendar } from 'lucide-react';
import api from '../../services/api';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useToast } from '../../context/ToastContext';

const AdminUsers = () => {
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  // Status toggle confirmation
  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);
  const [toggling, setToggling] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', page);
      params.set('limit', 12);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.success && res.data) {
        setUsers(res.data.users || []);
        setTotalPages(res.data.pages || 1);
        setTotalUsers(res.data.totalUsers || 0);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleConfirm = async () => {
    if (!userToToggle) return;
    try {
      setToggling(true);
      const res = await api.patch(`/admin/users/${userToToggle._id}/toggle-status`);
      if (res.success) {
        showToast(res.message, 'success');
        setToggleModalOpen(false);
        setUserToToggle(null);
        fetchUsers();
      }
    } catch (err) {
      showToast(err.message || 'Failed to modify user status', 'error');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Registered Customers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review customer profiles, purchase activity, and account access permissions ({totalUsers} total)
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search by name, email, username or mobile..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12">
            <LoadingSpinner message="Fetching customers..." />
          </div>
        ) : users.length === 0 ? (
          <p className="text-xs text-slate-500 py-12 text-center">
            No customers match the search criteria.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Default Address</th>
                  <th className="py-3.5 px-4">Orders Placed</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Joined</th>
                  <th className="py-3.5 px-4 text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 font-bold flex items-center justify-center uppercase">
                          {u.name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-400">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-slate-800">{u.email}</p>
                      <p className="text-[11px] text-slate-400">{u.mobile}</p>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                      {u.address ? `${u.address} (${u.pincode})` : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {u.orderCount || 0} order{u.orderCount !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setUserToToggle(u);
                          setToggleModalOpen(true);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 ml-auto ${
                          u.isActive
                            ? 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                            : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {u.isActive ? (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            Activate
                          </>
                        )}
                      </button>
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

      {/* Account Status Toggle Modal */}
      <ConfirmationModal
        isOpen={toggleModalOpen}
        title={userToToggle?.isActive ? 'Deactivate Customer Account' : 'Activate Customer Account'}
        message={`Are you sure you want to ${
          userToToggle?.isActive ? 'deactivate' : 'activate'
        } account for "${userToToggle?.name}"? ${
          userToToggle?.isActive ? 'They will be prevented from logging in.' : 'They will regain store access.'
        }`}
        confirmText={userToToggle?.isActive ? 'Deactivate Account' : 'Activate Account'}
        isDanger={userToToggle?.isActive}
        loading={toggling}
        onConfirm={handleToggleConfirm}
        onCancel={() => {
          setToggleModalOpen(false);
          setUserToToggle(null);
        }}
      />
    </div>
  );
};

export default AdminUsers;
