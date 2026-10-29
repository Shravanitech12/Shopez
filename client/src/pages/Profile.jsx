import React, { useState } from 'react';
import { User, Phone, MapPin, Lock, Plus, Trash2, CheckCircle2, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/common/ConfirmationModal';

const Profile = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const { showToast } = useToast();

  // Basic Info Form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    address: user?.address || '',
    pincode: user?.pincode || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // New Address Modal / Form
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    mobile: '',
    isDefault: false,
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    await updateProfile(profileForm);
    setSavingProfile(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }

    setChangingPassword(true);
    const res = await changePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword
    );
    setChangingPassword(false);
    if (res.success) {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    }
  };

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (
      !newAddr.fullName ||
      !newAddr.street ||
      !newAddr.city ||
      !newAddr.state ||
      !newAddr.pincode ||
      !newAddr.mobile
    ) {
      showToast('Please fill all address fields', 'warning');
      return;
    }

    const currentAddresses = user?.savedAddresses || [];
    const updated = [...currentAddresses, newAddr];

    const res = await updateProfile({ savedAddresses: updated });
    if (res.success) {
      setAddressModalOpen(false);
      setNewAddr({
        fullName: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        mobile: '',
        isDefault: false,
      });
    }
  };

  const handleDeleteAddress = async (indexToDelete) => {
    const currentAddresses = user?.savedAddresses || [];
    const updated = currentAddresses.filter((_, idx) => idx !== indexToDelete);
    await updateProfile({ savedAddresses: updated });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Account Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your personal profile, delivery locations, and login credentials
          </p>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Info Form */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <User className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-600 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email (read-only)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Username (read-only)
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.username || ''}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={profileForm.mobile}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, mobile: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-600 font-medium"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Default Address
                </label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, address: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-600"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={profileForm.pincode}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, pincode: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="py-3 px-6 bg-slate-900 hover:bg-brand-600 text-white font-bold rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Lock className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900">Change Password</h3>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                New Password (min 6 characters)
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passwordForm.confirmNewPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmNewPassword: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-600"
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="py-3 px-6 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {changingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Saved Addresses Manager */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900">Saved Shipping Addresses</h3>
          </div>
          <button
            onClick={() => setAddressModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 text-xs font-bold transition"
          >
            <Plus className="w-4 h-4" />
            Add New Address
          </button>
        </div>

        {(!user?.savedAddresses || user.savedAddresses.length === 0) ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            You do not have any saved delivery addresses yet. Add one for quick 1-click checkout!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {user.savedAddresses.map((addr, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between text-xs space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{addr.fullName}</span>
                    {addr.isDefault && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 leading-relaxed">{addr.street}</p>
                  <p className="text-slate-600">
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-slate-500 mt-1">Phone: {addr.mobile}</p>
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-slate-200">
                  <button
                    onClick={() => handleDeleteAddress(idx)}
                    className="text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Shipping Address</h3>

            <form onSubmit={handleAddNewAddress} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={newAddr.fullName}
                    onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={newAddr.mobile}
                    onChange={(e) => setNewAddr({ ...newAddr, mobile: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PIN / Zip</label>
                  <input
                    type="text"
                    required
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
