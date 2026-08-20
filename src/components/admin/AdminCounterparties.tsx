import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';
import { User, UserRole } from '../../types';
import {
  Building2,
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  FileCheck,
  Boxes,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const COMMODITY_OPTIONS = [
  'Metal Scrap',
  'HMS 1&2 (80:20)',
  'Shredded Steel 211',
  'Copper Millberry (99.99%)',
  'Aluminum Tense / TT',
  'Stainless Steel 304/316',
  'Lead Scrap',
  'Paper Waste / OCC',
  'HDPE / Plastic Scrap',
];

export const AdminCounterparties: React.FC = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'suppliers' | 'buyers'>('suppliers');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deletingItem, setDeletingItem] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Add / Edit Form State
  const [formData, setFormData] = useState({
    role: 'SUPPLIER' as UserRole,
    name: '',
    companyName: '',
    email: '',
    phone: '',
    country: 'Qatar',
    city: 'Doha',
    address: '',
    businessRegNumber: '',
    taxVatNumber: '',
    commodityCategories: ['Metal Scrap'],
    status: 'ACTIVE',
  });

  const loadCounterparties = async () => {
    try {
      setLoading(true);
      const [sups, buys] = await Promise.all([api.getSuppliers(), api.getBuyers()]);
      setSuppliers(sups);
      setBuyers(buys);
    } catch (err) {
      console.error('Failed to load counterparties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCounterparties();
  }, []);

  const openAddModal = () => {
    setFormData({
      role: activeTab === 'suppliers' ? 'SUPPLIER' : 'BUYER',
      name: '',
      companyName: '',
      email: '',
      phone: '',
      country: activeTab === 'suppliers' ? 'Qatar' : 'India',
      city: activeTab === 'suppliers' ? 'Doha' : 'Mumbai',
      address: '',
      businessRegNumber: '',
      taxVatNumber: '',
      commodityCategories: ['Metal Scrap'],
      status: 'ACTIVE',
    });
    setShowAddModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({
      role: item.role,
      name: item.name,
      companyName: item.companyName || '',
      email: item.email,
      phone: item.phone || '',
      country: item.country || '',
      city: item.city || '',
      address: item.address || '',
      businessRegNumber: item.businessRegNumber || '',
      taxVatNumber: item.taxVatNumber || '',
      commodityCategories: item.commodityCategories || ['Metal Scrap'],
      status: item.status || 'ACTIVE',
    });
  };

  const handleCreateCounterparty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.companyName) {
      alert('Please fill in Name, Company, and Email.');
      return;
    }
    setActionLoading(true);
    try {
      await api.createCounterparty(formData);
      setShowAddModal(false);
      setNotification(`New ${formData.role.toLowerCase()} "${formData.companyName}" added successfully.`);
      setTimeout(() => setNotification(null), 4000);
      await loadCounterparties();
    } catch (err: any) {
      alert(err.message || 'Failed to create counterparty.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCounterparty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setActionLoading(true);
    try {
      await api.updateCounterparty(editingItem.id, formData);
      setEditingItem(null);
      setNotification(`Updated details for "${formData.companyName}".`);
      setTimeout(() => setNotification(null), 4000);
      await loadCounterparties();
    } catch (err: any) {
      alert(err.message || 'Failed to update counterparty.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCounterparty = async () => {
    if (!deletingItem) return;
    setActionLoading(true);
    try {
      await api.deleteCounterparty(deletingItem.id);
      setDeletingItem(null);
      setNotification(`Counterparty "${deletingItem.companyName || deletingItem.name}" deleted.`);
      setTimeout(() => setNotification(null), 4000);
      await loadCounterparties();
    } catch (err: any) {
      alert(err.message || 'Failed to delete counterparty.');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleCategory = (cat: string) => {
    if (formData.commodityCategories.includes(cat)) {
      if (formData.commodityCategories.length > 1) {
        setFormData({
          ...formData,
          commodityCategories: formData.commodityCategories.filter((c) => c !== cat),
        });
      }
    } else {
      setFormData({
        ...formData,
        commodityCategories: [...formData.commodityCategories, cat],
      });
    }
  };

  const list = activeTab === 'suppliers' ? suppliers : buyers;

  const filtered = list.filter((item) => {
    const s = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(s) ||
      item.companyName?.toLowerCase().includes(s) ||
      item.country?.toLowerCase().includes(s) ||
      item.email?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Verified Counterparties Directory &amp; Management
          </h1>
          <p className="text-xs text-slate-500">
            Add, update, verify KYC credentials, or remove industrial scrap suppliers and international steel buyers.
          </p>
        </div>

        {/* Actions & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'suppliers'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Suppliers ({suppliers.length})
            </button>
            <button
              onClick={() => setActiveTab('buyers')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'buyers'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Buyers ({buyers.length})
            </button>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add {activeTab === 'suppliers' ? 'Supplier' : 'Buyer'}
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {notification}
        </div>
      )}

      {/* Search Box */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder={`Search ${activeTab === 'suppliers' ? 'supplier' : 'buyer'} company, contact, country, email...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-800 dark:text-slate-200 font-medium"
        />
      </div>

      {/* Counterparties Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-all group"
          >
            <div>
              <div className="flex items-start justify-between">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base ${
                    activeTab === 'suppliers'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  }`}
                >
                  {item.companyName?.[0] || item.name[0]}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}>
                    {item.status}
                  </span>
                  <button
                    onClick={() => openEditModal(item)}
                    title="Edit Counterparty"
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingItem(item)}
                    title="Delete Counterparty"
                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                  {item.companyName}
                </h3>
                <div className="text-xs text-slate-500 font-medium">Contact: {item.name}</div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {item.city}, {item.country}
                </div>
              </div>

              <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2.5">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate font-mono text-[11px]">{item.email}</span>
                </div>
                {item.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{item.phone}</span>
                  </div>
                )}
                {item.businessRegNumber && (
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <FileCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Reg / Tax: {item.businessRegNumber}</span>
                  </div>
                )}
              </div>

              {/* Volume Metrics */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                {activeTab === 'suppliers' ? (
                  <>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Active Listings</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {item.activeListingsCount || 0} Lots
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Total Listed Volume</span>
                      <strong className="text-purple-700 dark:text-purple-400 font-bold">
                        {item.totalMTListed?.toLocaleString() || 0} MT
                      </strong>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Active Demands</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {item.activeRequirementsCount || 0} Demands
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Completed Deals</span>
                      <strong className="text-blue-700 dark:text-blue-400 font-bold">
                        {item.completedDealsCount || 0} Deals
                      </strong>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap gap-1">
                {item.commodityCategories?.map((c: string) => (
                  <span
                    key={c}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || editingItem) && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingItem ? `Edit ${editingItem.role} Details` : `Add New ${formData.role}`}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingItem ? handleUpdateCounterparty : handleCreateCounterparty} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Role
                  </label>
                  <select
                    disabled={!!editingItem}
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold text-slate-900 dark:text-white"
                  >
                    <option value="SUPPLIER">SUPPLIER (Metal / Paper Yard)</option>
                    <option value="BUYER">BUYER (Steel Mill / Foundry)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Account Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="ACTIVE">ACTIVE (Verified KYC)</option>
                    <option value="PENDING">PENDING REVIEW</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Company / Mill Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Qatar National Metals W.L.L."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Person Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Tariq Al-Mansoor"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address (Login Username) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@company.com"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Direct Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+974 5512 3456"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Qatar, UAE, India, Turkey..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    City / Port Area
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Doha, Mumbai, Dubai..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Commercial Registration / Tax Number
                  </label>
                  <input
                    type="text"
                    value={formData.businessRegNumber}
                    onChange={(e) => setFormData({ ...formData, businessRegNumber: e.target.value })}
                    placeholder="CR # 89412-QTR or GSTIN # 27AAAC..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Handled Commodity Categories
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMODITY_OPTIONS.map((cat) => {
                    const isSelected = formData.commodityCategories.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold shadow-md cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Counterparty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Counterparty Record?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{deletingItem.companyName || deletingItem.name}</strong> ({deletingItem.email})? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteCounterparty}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                {actionLoading ? 'Deleting...' : 'Delete Counterparty'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
