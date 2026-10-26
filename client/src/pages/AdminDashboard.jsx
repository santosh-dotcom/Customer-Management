import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Alert from '../components/Alert';
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit,
  Power,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  Check,
  Shield,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Stats state
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0,
    recentSignups: 0,
  });

  // Customers table state
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tableLoading, setTableLoading] = useState(false);

  // Modals state
  const [viewCustomer, setViewCustomer] = useState(null);
  const [editCustomer, setEditCustomer] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
  });

  const [alert, setAlert] = useState({ type: '', message: '' });
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch admin stats', err);
    }
  };

  // Fetch Customers with Search, Filter & Pagination
  const fetchCustomers = useCallback(async () => {
    setTableLoading(true);
    try {
      const params = {
        page,
        limit,
        search: search.trim(),
        status: statusFilter,
      };
      const res = await api.get('/admin/customers', { params });
      setCustomers(res.data.data.customers);
      setTotalPages(res.data.data.pages);
      setTotalCount(res.data.data.total);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load customers list.',
      });
    } finally {
      setTableLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Activate / Deactivate Customer
  const handleToggleStatus = async (customer) => {
    setActionLoading(true);
    const newStatus = customer.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await api.patch(`/admin/customers/${customer._id}/status`, {
        status: newStatus,
      });
      setAlert({
        type: 'success',
        message: res.data.message || `Customer marked as ${newStatus}`,
      });
      fetchCustomers();
      fetchStats();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update customer status.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (cust) => {
    setEditCustomer(cust);
    setEditFormData({
      name: cust.name || '',
      email: cust.email || '',
      phone: cust.phone || '',
      address: cust.address || '',
      status: cust.status || 'active',
    });
  };

  // Save Customer Edits
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editCustomer) return;

    setActionLoading(true);
    try {
      const res = await api.put(`/admin/customers/${editCustomer._id}`, editFormData);
      setAlert({
        type: 'success',
        message: res.data.message || 'Customer updated successfully!',
      });
      setEditCustomer(null);
      fetchCustomers();
      fetchStats();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save customer updates.',
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Super Admin Dashboard
                </h1>
                <p className="text-xs text-slate-400">
                  Logged in as <strong className="text-amber-400">{user?.name}</strong> ({user?.email})
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                fetchStats();
                fetchCustomers();
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Global Alert Notification */}
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: '', message: '' })}
        />

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Customers */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Total Customers
                </p>
                <h3 className="text-3xl font-extrabold text-white mt-1">
                  {stats.totalCustomers}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">All registered customer accounts</p>
          </div>

          {/* Active Customers */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Active Customers
                </p>
                <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">
                  {stats.activeCustomers}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">Accounts with active login status</p>
          </div>

          {/* Inactive Customers */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Deactivated
                </p>
                <h3 className="text-3xl font-extrabold text-rose-400 mt-1">
                  {stats.inactiveCustomers}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                <UserX className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">Suspended or inactive customers</p>
          </div>

          {/* Recent Registrations */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  New (Last 7 Days)
                </p>
                <h3 className="text-3xl font-extrabold text-amber-400 mt-1">
                  {stats.recentSignups}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <UserPlus className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">Recent onboarding momentum</p>
          </div>
        </div>

        {/* Customer Management Section */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-5 border-b border-slate-700/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Customer Directory</h2>
              <p className="text-xs text-slate-400">
                Search, filter, inspect, edit, and toggle account statuses
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Input */}
              <div className="relative min-w-[240px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1); // Reset to page 1 on search
                  }}
                  placeholder="Search name, email, phone..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-700 bg-slate-900/80 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-1.5 bg-slate-900/80 border border-slate-700 px-2 py-1 rounded-xl">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-800 text-slate-200">
                    All Statuses
                  </option>
                  <option value="active" className="bg-slate-800 text-slate-200">
                    Active Only
                  </option>
                  <option value="inactive" className="bg-slate-800 text-slate-200">
                    Inactive Only
                  </option>
                </select>
              </div>

              {/* Page size limit */}
              <div className="flex items-center space-x-1 bg-slate-900/80 border border-slate-700 px-2 py-1 rounded-xl">
                <span className="text-[11px] text-slate-400">Show:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value={5} className="bg-slate-800 text-slate-200">
                    5
                  </option>
                  <option value={10} className="bg-slate-800 text-slate-200">
                    10
                  </option>
                  <option value={20} className="bg-slate-800 text-slate-200">
                    20
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Customer Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/70 border-b border-slate-700/80 text-slate-400 uppercase font-semibold tracking-wider">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 hidden md:table-cell">Address</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {tableLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading customer records...</span>
                      </div>
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No customer accounts found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-800/40 transition">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-amber-300 font-bold text-xs flex-shrink-0">
                            {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div>
                            <p className="font-semibold text-white leading-tight">{c.name}</p>
                            <span className="text-[10px] text-slate-400">{c.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {c.phone || 'N/A'}
                      </td>

                      {/* Address */}
                      <td className="py-3.5 px-4 text-slate-400 hidden md:table-cell max-w-[200px] truncate" title={c.address}>
                        {c.address || 'N/A'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            c.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          ● {c.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-4 text-slate-400 hidden sm:table-cell">
                        {formatDate(c.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center space-x-1.5">
                          {/* View Button */}
                          <button
                            onClick={() => setViewCustomer(c)}
                            title="View Customer Details"
                            className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => openEditModal(c)}
                            title="Edit Customer"
                            className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Activate / Deactivate Toggle */}
                          <button
                            onClick={() => handleToggleStatus(c)}
                            disabled={actionLoading}
                            title={
                              c.status === 'active'
                                ? 'Deactivate Customer'
                                : 'Activate Customer'
                            }
                            className={`p-1.5 rounded-lg border transition ${
                              c.status === 'active'
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-700/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-400">
            <div>
              Showing <span className="text-white font-medium">{customers.length}</span> of{' '}
              <span className="text-white font-medium">{totalCount}</span> registered customers
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <span className="px-2 font-medium text-slate-300">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page >= totalPages}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* View Customer Details Modal */}
        {viewCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
              <button
                onClick={() => setViewCustomer(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg border border-amber-500/30">
                  {viewCustomer.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{viewCustomer.name}</h3>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mt-0.5 ${
                      viewCustomer.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    ● {viewCustomer.status?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700 flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">Email Address</span>
                    <span className="text-white font-medium">{viewCustomer.email}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700 flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">Contact Phone</span>
                    <span className="text-white font-medium">{viewCustomer.phone}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700 flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">Complete Address</span>
                    <span className="text-white font-medium">{viewCustomer.address}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-500 block">Created At</span>
                    <span className="text-white font-medium">
                      {formatDate(viewCustomer.created_at)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-500 block">Last Updated</span>
                    <span className="text-white font-medium">
                      {formatDate(viewCustomer.updated_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setViewCustomer(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-xl transition"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Customer Modal */}
        {editCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
              <button
                onClick={() => setEditCustomer(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-white mb-1">Edit Customer Information</h3>
              <p className="text-xs text-slate-400 mb-5">
                Update customer identity, contact information, or status.
              </p>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={editFormData.email}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, email: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.phone}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Account Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="active">Active (Permitted to log in)</option>
                    <option value="inactive">Inactive (Access suspended)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Complete Address
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={editFormData.address}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, address: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:border-amber-400 resize-none"
                  ></textarea>
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditCustomer(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 bg-slate-700 hover:bg-slate-600 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition shadow-md disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{actionLoading ? 'Saving...' : 'Save Customer Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
