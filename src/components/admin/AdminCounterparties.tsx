import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
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
  KeyRound,
  Send,
  Copy,
  Check,
  Sparkles,
  Clock,
  ShieldAlert,
  RefreshCw,
  UserCheck,
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
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [registrationOtps, setRegistrationOtps] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'suppliers' | 'buyers' | 'otps'>('suppliers');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingOtps, setLoadingOtps] = useState(false);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIssueOtpModal, setShowIssueOtpModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deletingItem, setDeletingItem] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [copiedOtpId, setCopiedOtpId] = useState<string | null>(null);

  // Issue OTP Form State
  const [issueOtpForm, setIssueOtpForm] = useState({
    role: 'SUPPLIER' as UserRole,
    name: '',
    companyName: '',
    email: '',
    phone: '',
    country: 'Qatar',
  });
  const [issuedOtpData, setIssuedOtpData] = useState<any | null>(null);

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

  const loadRegistrationOtps = async () => {
    try {
      setLoadingOtps(true);
      const otps = await api.getAdminRegistrationOtps();
      setRegistrationOtps(otps || []);
    } catch (err) {
      console.error('Failed to load registration OTPs:', err);
    } finally {
      setLoadingOtps(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadCounterparties();
      loadRegistrationOtps();
    }
  }, [user?.role]);

  const handleIssueOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueOtpForm.phone || !issueOtpForm.name || !issueOtpForm.companyName) {
      alert('Please fill in Name, Company, and Mobile Number for SMS OTP dispatch.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.issueAdminRegistrationOtp(issueOtpForm);
      setIssuedOtpData(res.otp);
      setNotification(`Official OTP verification code dispatched via SMS to mobile number ${issueOtpForm.phone}`);
      setTimeout(() => setNotification(null), 5000);
      await loadRegistrationOtps();
    } catch (err: any) {
      alert(err.message || 'Failed to issue registration OTP.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendOtp = async (otpId: string, email: string) => {
    try {
      setActionLoading(true);
      const res = await api.resendAdminRegistrationOtp(otpId);
      const code = res.otp.otpCode || (res.otp as any).code || '';
      const targetPhone = res.otp.phone || email;
      setNotification(`Fresh OTP dispatched via SMS to mobile number ${targetPhone}: Code ${code}`);
      setTimeout(() => setNotification(null), 5000);
      await loadRegistrationOtps();
    } catch (err: any) {
      alert(err.message || 'Failed to resend OTP.');
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedOtpId(id);
    setTimeout(() => setCopiedOtpId(null), 2000);
  };

  const openAddModal = () => {
    setFormData({
      role: activeTab === 'buyers' ? 'BUYER' : 'SUPPLIER',
      name: '',
      companyName: '',
      email: '',
      phone: '',
      country: activeTab === 'buyers' ? 'India' : 'Qatar',
      city: activeTab === 'buyers' ? 'Mumbai' : 'Doha',
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

  const filteredOtps = registrationOtps.filter((item) => {
    const s = searchTerm.toLowerCase();
    const code = item.otpCode || (item as any).code || '';
    return (
      item.name?.toLowerCase().includes(s) ||
      item.companyName?.toLowerCase().includes(s) ||
      item.email?.toLowerCase().includes(s) ||
      item.phone?.toLowerCase().includes(s) ||
      item.role?.toLowerCase().includes(s) ||
      code.toLowerCase().includes(s)
    );
  });

  const pendingOtpsCount = registrationOtps.filter((o) => o.status === 'PENDING').length;
  const verifiedOtpsCount = registrationOtps.filter((o) => o.status === 'VERIFIED').length;
  const usedOtpsCount = registrationOtps.filter((o) => o.status === 'USED').length;

  if (user && user.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center bg-slate-900 border border-rose-900/50 rounded-2xl max-w-lg mx-auto my-12 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Access Restricted to Platform Admin</h2>
        <p className="text-xs text-slate-400">
          Counterparty directories and Admin OTP issuance are strictly reserved for Al Shaheed central trade administration.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Counterparties &amp; Registration Verification
          </h1>
          <p className="text-xs text-slate-500">
            Manage authorized suppliers, buyers, and issue admin OTP verification codes for new partner registrations.
          </p>
        </div>

        {/* Actions & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'suppliers'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Suppliers ({suppliers.length})
            </button>
            <button
              onClick={() => setActiveTab('buyers')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'buyers'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Buyers ({buyers.length})
            </button>
            <button
              onClick={() => setActiveTab('otps')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'otps'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Registration OTPs</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/40 text-white font-mono">
                {registrationOtps.length}
              </span>
            </button>
          </div>

          {activeTab === 'otps' ? (
            <button
              onClick={() => {
                setIssuedOtpData(null);
                setIssueOtpForm({
                  role: 'SUPPLIER',
                  name: '',
                  companyName: '',
                  email: '',
                  phone: '',
                  country: 'Qatar',
                });
                setShowIssueOtpModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              Issue Registration OTP
            </button>
          ) : (
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add {activeTab === 'suppliers' ? 'Supplier' : 'Buyer'}
            </button>
          )}
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {notification}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REGISTRATION OTPS & ADMIN PRE-APPROVAL DESK                       */}
      {/* ========================================================================= */}
      {activeTab === 'otps' ? (
        <div className="space-y-6">
          {/* Policy Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-950 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Admin Registration Pre-Verification Protocol
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Enforced
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Suppliers, buyers, and agents cannot create an account without verifying an Admin-issued 6-digit OTP. Admins can view incoming OTP requests or manually issue authorization codes below.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIssuedOtpData(null);
                setShowIssueOtpModal(true);
              }}
              className="shrink-0 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Issue New OTP</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total OTPs Issued</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                {registrationOtps.length}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">Awaiting Verification</p>
              <p className="text-2xl font-black text-amber-500 mt-1 font-mono">
                {pendingOtpsCount}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Pre-Approved / Verified</p>
              <p className="text-2xl font-black text-emerald-500 mt-1 font-mono">
                {verifiedOtpsCount}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">Accounts Created</p>
              <p className="text-2xl font-black text-blue-500 mt-1 font-mono">
                {usedOtpsCount}
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search OTP by company, recipient name, email, role, or 6-digit code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-800 dark:text-slate-200 font-medium"
              />
            </div>
            <button
              onClick={loadRegistrationOtps}
              disabled={loadingOtps}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Refresh list"
            >
              <RefreshCw className={`w-4 h-4 ${loadingOtps ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* OTP Cards Grid */}
          {filteredOtps.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Registration OTPs Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No active or pending partner registration requests match your criteria. When suppliers or buyers register on the login page, their OTP verification codes will appear here.
              </p>
              <button
                onClick={() => {
                  setIssuedOtpData(null);
                  setShowIssueOtpModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Issue Registration OTP</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredOtps.map((otp) => {
                const isPending = otp.status === 'PENDING';
                const isVerified = otp.status === 'VERIFIED';
                const isUsed = otp.status === 'USED';
                const isExpired = otp.status === 'EXPIRED';

                return (
                  <div
                    key={otp.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-all group relative overflow-hidden"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase ${
                            otp.role === 'SUPPLIER'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-400/30'
                              : otp.role === 'BUYER'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-400/30'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-400/30'
                          }`}
                        >
                          {otp.role}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isUsed
                              ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              : isVerified
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : isExpired
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {isUsed ? 'Account Created' : isVerified ? 'Verified' : isExpired ? 'Expired' : 'Awaiting Entry'}
                        </span>
                      </div>

                      {/* Recipient Details */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                          {otp.companyName || otp.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Contact: {otp.name}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{otp.email}</span>
                        </p>
                        {otp.phone ? (
                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span>Mobile (SMS Dispatched): {otp.phone}</span>
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400 italic flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>No mobile assigned</span>
                          </p>
                        )}
                      </div>

                      {/* OTP Box */}
                      <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-emerald-500/30 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Admin OTP Verification Code
                          </p>
                          <p className="text-xl font-black font-mono tracking-widest text-emerald-400 mt-0.5">
                            {otp.otpCode || (otp as any).code}
                          </p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(otp.otpCode || (otp as any).code, otp.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          title="Copy 6-digit code"
                        >
                          {copiedOtpId === otp.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Timestamps */}
                      <div className="mt-3 text-[11px] text-slate-400 space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>Issued: {new Date(otp.createdAt).toLocaleDateString()} {new Date(otp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {otp.expiresAt && (
                          <div className="text-[10px] text-slate-500">
                            Expires: {new Date(otp.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        {isUsed ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ready in portal
                          </span>
                        ) : (
                          <span>Share code with partner</span>
                        )}
                      </span>

                      {!isUsed && (
                        <button
                          onClick={() => handleResendOtp(otp.id, otp.email)}
                          disabled={actionLoading}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Resend</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* TAB 1 & 2: SUPPLIERS & BUYERS DIRECTORY                                   */
        /* ========================================================================= */
        <div className="space-y-6">
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

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{item.email}</span>
                    </div>
                    {item.phone && (
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.phone}</span>
                      </div>
                    )}
                  </div>

                  {item.commodityCategories && item.commodityCategories.length > 0 && (
                    <div className="mt-3 pt-2 flex flex-wrap gap-1">
                      {item.commodityCategories.map((c: string) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    CR: {item.businessRegNumber || 'Verified on file'}
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> KYC Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Issue Registration OTP Modal (Admin Central Desk) */}
      {showIssueOtpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Issue Partner Registration OTP
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Pre-approve and issue official 6-digit OTP verification code
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowIssueOtpModal(false);
                  setIssuedOtpData(null);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {issuedOtpData ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Registration OTP Generated Successfully!
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Share this 6-digit code with <strong className="text-slate-900 dark:text-white">{issuedOtpData.name}</strong> ({issuedOtpData.email}) to allow them to create their {issuedOtpData.role.toLowerCase()} account.
                  </p>

                  <div className="my-3 p-3.5 bg-slate-950 rounded-xl border border-emerald-500/40 flex items-center justify-between">
                    <span className="font-mono text-2xl font-black tracking-widest text-emerald-400">
                      {issuedOtpData.otpCode || issuedOtpData.code}
                    </span>
                    <button
                      onClick={() => copyToClipboard(issuedOtpData.otpCode || issuedOtpData.code, 'modal')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {copiedOtpId === 'modal' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Valid for 60 minutes. The partner can now enter this code on the registration page to set their password.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowIssueOtpModal(false);
                      setIssuedOtpData(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Done &amp; Close Desk
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleIssueOtpSubmit} className="space-y-3.5 text-xs">
                {/* Select Role */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[11px]">
                    Account Role To Pre-Approve <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['SUPPLIER', 'BUYER', 'AGENT'] as UserRole[]).map((r) => (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setIssueOtpForm({ ...issueOtpForm, role: r })}
                        className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                          issueOtpForm.role === r
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recipient Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Contact Person Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={issueOtpForm.name}
                      onChange={(e) => setIssueOtpForm({ ...issueOtpForm, name: e.target.value })}
                      placeholder="e.g. Nasser Al-Kuwari"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Company Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={issueOtpForm.companyName}
                      onChange={(e) => setIssueOtpForm({ ...issueOtpForm, companyName: e.target.value })}
                      placeholder="e.g. Gulf Scrap Yard W.L.L."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mobile Number (SMS OTP Dispatch) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={issueOtpForm.phone}
                      onChange={(e) => setIssueOtpForm({ ...issueOtpForm, phone: e.target.value })}
                      placeholder="e.g. +974 55123456"
                      className="w-full px-3 py-2 rounded-xl border border-emerald-500/50 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white"
                    />
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                      OTP is dispatched to this mobile number via SMS
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address (Documentation) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={issueOtpForm.email}
                      onChange={(e) => setIssueOtpForm({ ...issueOtpForm, email: e.target.value })}
                      placeholder="e.g. partner@firm.com"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={issueOtpForm.country}
                    onChange={(e) => setIssueOtpForm({ ...issueOtpForm, country: e.target.value })}
                    placeholder="Qatar, UAE, India..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-500 text-[11px] leading-relaxed">
                  <p>
                    Generating an OTP pre-approves this recipient in the system and dispatches the 6-digit code to their mobile number via SMS. The partner can immediately complete registration on the portal login page using their mobile number and code.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowIssueOtpModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    {actionLoading ? 'Issuing OTP...' : 'Issue 6-Digit OTP'}
                  </button>
                </div>
              </form>
            )}
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
