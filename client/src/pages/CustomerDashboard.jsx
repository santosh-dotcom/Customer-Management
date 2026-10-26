import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Alert from '../components/Alert';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Calendar,
  ShieldCheck,
  Edit3,
  Check,
  X,
  LogOut,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';

const CustomerDashboard = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'
  const [profileLoading, setProfileLoading] = useState(false);

  // Profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [alert, setAlert] = useState({ type: '', message: '' });
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch fresh profile on load
  useEffect(() => {
    const fetchLatestProfile = async () => {
      setProfileLoading(true);
      try {
        const res = await api.get('/customer/profile');
        updateUser(res.data.data);
        setProfileForm({
          name: res.data.data.name || '',
          phone: res.data.data.phone || '',
          address: res.data.data.address || '',
        });
      } catch (err) {
        setAlert({
          type: 'error',
          message: err.response?.data?.message || 'Failed to refresh profile information.',
        });
      } finally {
        setProfileLoading(false);
      }
    };

    fetchLatestProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!profileForm.name.trim()) {
      setAlert({ type: 'error', message: 'Name cannot be empty.' });
      return;
    }
    if (!profileForm.phone.trim()) {
      setAlert({ type: 'error', message: 'Phone cannot be empty.' });
      return;
    }
    if (!profileForm.address.trim()) {
      setAlert({ type: 'error', message: 'Address cannot be empty.' });
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.put('/customer/profile', profileForm);
      updateUser(res.data.data);
      setIsEditing(false);
      setAlert({ type: 'success', message: res.data.message || 'Profile updated successfully!' });
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!passwordForm.currentPassword) {
      setAlert({ type: 'error', message: 'Please enter your current password.' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setAlert({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setAlert({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.put('/customer/change-password', passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setAlert({ type: 'success', message: res.data.message });
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to change password.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-indigo-100">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-slate-900">{user?.name}</h1>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      user?.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    ● {user?.status === 'active' ? 'Active Account' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{user?.email}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Member since {formatDate(user?.created_at)}</span>
                  </span>
                  <span className="flex items-center space-x-1 text-indigo-600 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Customer</span>
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-2 self-start sm:self-center px-4 py-2 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: '', message: '' })}
        />

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 space-x-8">
          <button
            onClick={() => {
              setActiveTab('profile');
              setAlert({ type: '', message: '' });
            }}
            className={`pb-4 text-sm font-semibold border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Information</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('password');
              setAlert({ type: '', message: '' });
            }}
            className={`pb-4 text-sm font-semibold border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'password'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Security & Password</span>
          </button>
        </div>

        {/* Tab 1: Profile View / Edit */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Personal Profile</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  View and update your personal details
                </p>
              </div>

              {!isEditing ? (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setProfileForm({
                      name: user?.name || '',
                      phone: user?.phone || '',
                      address: user?.address || '',
                    });
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
            </div>

            {isEditing ? (
              /* Edit Form */
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, name: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Email (Readonly for customer safety) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address (Account Identifier)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Email cannot be altered directly for security reasons. Contact admin if required.
                  </p>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Residential / Billing Address
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={profileForm.address}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, address: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500"
                  ></textarea>
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="inline-flex items-center space-x-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Read-only View */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Full Name</span>
                  </span>
                  <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Address</span>
                  </span>
                  <p className="text-sm font-semibold text-slate-800">{user?.email}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Contact Phone</span>
                  </span>
                  <p className="text-sm font-semibold text-slate-800">{user?.phone}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Account Status</span>
                  </span>
                  <p className="text-sm font-semibold capitalize text-emerald-600">
                    {user?.status}
                  </p>
                </div>

                <div className="md:col-span-2 p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Registered Address</span>
                  </span>
                  <p className="text-sm font-semibold text-slate-800">{user?.address}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 max-w-2xl">
            <div className="mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ensure your account is using a long, random password to stay secure
              </p>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    placeholder="Enter current password"
                    className="w-full pl-9 pr-10 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, current: !prev.current }))
                    }
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password (Min. 6 characters)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    placeholder="Enter new password"
                    className="w-full pl-9 pr-10 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    required
                    value={passwordForm.confirmNewPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmNewPassword: e.target.value,
                      })
                    }
                    placeholder="Re-type new password"
                    className="w-full pl-9 pr-10 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
                    }
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
