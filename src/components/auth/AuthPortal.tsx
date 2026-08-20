/**
 * Al Shaheed Trading and Equipment Co.
 * Enterprise Authentication & Registration Portal
 * Bright, high-contrast, modern trading desk access
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';
import {
  ShieldCheck,
  Building2,
  User as UserIcon,
  Mail,
  Lock,
  Phone,
  Globe,
  MapPin,
  Layers,
  Boxes,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  Briefcase,
  Truck,
  AlertCircle,
} from 'lucide-react';
import {
  COUNTRIES_LIST,
  GLOBAL_PORTS,
  INCOTERMS,
  PAYMENT_TERMS_OPTIONS,
  COMPANY_INFO,
} from '../../constants/tradeData';
import { UserRole } from '../../types';

interface AuthPortalProps {
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
  onSuccess?: () => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({
  initialMode = 'login',
  initialRole = 'ADMIN',
  onSuccess,
}) => {
  const { login, register, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- LOGIN FORM STATE ---
  const [loginEmail, setLoginEmail] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin123');

  // --- REGISTRATION FORM STATES ---
  // Supplier Registration State
  const [supplierForm, setSupplierForm] = useState({
    companyName: '',
    businessRegNumber: '',
    taxVatNumber: '',
    contactName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: 'Qatar',
    city: 'Doha',
    address: 'Industrial Area, Street 810, Yard 45',
    commodityCategories: ['Metal Scrap'],
    typicalVolume: '500 - 2,500 MT / Month',
    preferredIncoterms: 'FOB',
    loadingPort: 'Hamad Port (Doha)',
    agreedToTerms: true,
  });

  // Buyer Registration State
  const [buyerForm, setBuyerForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: 'India',
    city: 'Mumbai',
    taxVatNumber: '',
    commodityCategories: ['Metal Scrap'],
    typicalVolume: '1,000 - 5,000 MT / Month',
    destinationPort: 'Nhava Sheva (JNPT Mumbai)',
    preferredPaymentTerms: '100% LC at Sight (Irrevocable & Confirmed)',
    preferredIncoterms: 'CIF',
    agreedToTerms: true,
  });

  // Agent Registration State
  const [agentForm, setAgentForm] = useState({
    fullName: '',
    agencyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: 'Qatar',
    city: 'Doha',
    commodityCategories: ['Metal Scrap', 'Paper Waste'],
    tradingRegion: 'GCC & South Asia Trade Corridors',
    languages: 'Arabic, English, Hindi',
    experienceYears: 5,
    agreedToTerms: true,
  });

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(loginEmail, loginPassword);
      setSuccessMsg('Authentication verified! Loading trading dashboard...');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your username/email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Supplier Registration
  const handleSupplierRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!supplierForm.companyName || !supplierForm.contactName || !supplierForm.email || !supplierForm.password) {
      setError('Please fill in all required company, contact, and credential fields.');
      return;
    }
    if (supplierForm.password !== supplierForm.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (!supplierForm.agreedToTerms) {
      setError('You must agree to Al Shaheed commercial terms and ISRI scrap standards.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        role: 'SUPPLIER',
        name: supplierForm.contactName,
        companyName: supplierForm.companyName,
        email: supplierForm.email,
        password: supplierForm.password,
        phone: supplierForm.phone,
        country: supplierForm.country,
        city: supplierForm.city,
        address: supplierForm.address,
        businessRegNumber: supplierForm.businessRegNumber,
        taxVatNumber: supplierForm.taxVatNumber,
        commodityCategories: supplierForm.commodityCategories,
        typicalVolume: supplierForm.typicalVolume,
        preferredIncoterms: supplierForm.preferredIncoterms,
        loadingPort: supplierForm.loadingPort,
      });
      setSuccessMsg('Supplier registration verified! Entering Al Shaheed trading desk...');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Buyer Registration
  const handleBuyerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!buyerForm.companyName || !buyerForm.contactName || !buyerForm.email || !buyerForm.password) {
      setError('Please fill in all required mill/company, contact, and credential fields.');
      return;
    }
    if (buyerForm.password !== buyerForm.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (!buyerForm.agreedToTerms) {
      setError('You must agree to Al Shaheed procurement and inspection terms.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        role: 'BUYER',
        name: buyerForm.contactName,
        companyName: buyerForm.companyName,
        email: buyerForm.email,
        password: buyerForm.password,
        phone: buyerForm.phone,
        country: buyerForm.country,
        city: buyerForm.city,
        taxVatNumber: buyerForm.taxVatNumber,
        commodityCategories: buyerForm.commodityCategories,
        typicalVolume: buyerForm.typicalVolume,
        destinationPort: buyerForm.destinationPort,
        preferredPaymentTerms: buyerForm.preferredPaymentTerms,
        preferredIncoterms: buyerForm.preferredIncoterms,
      });
      setSuccessMsg('Buyer account verified! Accessing global marketplace...');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Agent Registration
  const handleAgentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agentForm.fullName || !agentForm.email || !agentForm.password) {
      setError('Please fill in all required agent name, email, and password fields.');
      return;
    }
    if (agentForm.password !== agentForm.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (!agentForm.agreedToTerms) {
      setError('You must agree to the Al Shaheed Non-Circumvention & Intermediary Broker Agreement.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        role: 'AGENT',
        name: agentForm.fullName,
        companyName: agentForm.agencyName || `${agentForm.fullName} Brokerage`,
        email: agentForm.email,
        password: agentForm.password,
        phone: agentForm.phone,
        country: agentForm.country,
        city: agentForm.city,
        commodityCategories: agentForm.commodityCategories,
        tradingRegion: agentForm.tradingRegion,
        languages: agentForm.languages.split(',').map((s) => s.trim()),
        experienceYears: Number(agentForm.experienceYears),
      });
      setSuccessMsg('Agent credential verified! Opening commission and assignments ledger...');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCategory = (
    category: string,
    currentList: string[],
    setter: (newList: string[]) => void
  ) => {
    if (currentList.includes(category)) {
      if (currentList.length > 1) {
        setter(currentList.filter((c) => c !== category));
      }
    } else {
      setter([...currentList, category]);
    }
  };

  return (
    <div id="auth-portal-root" className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 text-slate-900 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Enterprise Security Header Bar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo size="md" />

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 font-mono bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Doha Desk: +974 30437712</span>
            </div>

            <div className="flex items-center bg-slate-100 border border-slate-200 p-1 rounded-xl">
              <button
                id="auth-mode-login-tab"
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  mode === 'login'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
              <button
                id="auth-mode-register-tab"
                type="button"
                onClick={() => {
                  setMode('register');
                  setSelectedRole('SUPPLIER');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  mode === 'register'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Register Partner / Agent
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col justify-center">
        {/* Banner Alert messages */}
        {error && (
          <div
            id="auth-error-banner"
            className="max-w-md w-full mx-auto mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 shadow-xs animate-in fade-in"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-rose-900">Authentication Alert</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div
            id="auth-success-banner"
            className="max-w-md w-full mx-auto mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-3 shadow-xs animate-in fade-in"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="font-bold text-emerald-900">{successMsg}</p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 1: CLEAN, BRIGHT SIGN IN / LOGIN VIEW */}
        {/* ========================================================================= */}
        {mode === 'login' && (
          <div className="max-w-md w-full mx-auto">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-7 sm:p-9 shadow-xl shadow-slate-200/60 relative">
              {/* Header inside Card */}
              <div className="text-center mb-6">
                <Logo variant="official" size="lg" className="mb-3" />
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  Institutional Trading Portal
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Sign In to Desk
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your credentials to access the Al Shaheed trading desk.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Username or Email Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Username or Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="login-email-input"
                      type="text"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. admin or yourname@company.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-300 focus:border-emerald-600 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Default: admin123
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="login-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-11 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-300 focus:border-emerald-600 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
                    <input
                      id="remember-device-checkbox"
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>Remember this device</span>
                  </label>
                  <span className="text-slate-400 font-medium">Qatar Desk HQ</span>
                </div>

                {/* Submit Sign In Button */}
                <div className="pt-2">
                  <button
                    id="submit-login-btn"
                    type="submit"
                    disabled={isSubmitting || authLoading}
                    className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Signing In...
                      </span>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Switch to Registration */}
                <div className="pt-4 text-center border-t border-slate-100 text-xs text-slate-500">
                  <span>Need an institutional partner account? </span>
                  <button
                    id="switch-to-register-link"
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setSelectedRole('SUPPLIER');
                    }}
                    className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline cursor-pointer"
                  >
                    Register as Supplier, Buyer, or Agent &rarr;
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: BRIGHT REGISTRATION VIEW (SUPPLIER, BUYER, AGENT) */}
        {/* ========================================================================= */}
        {mode === 'register' && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
                Institutional Onboarding
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
                Register as an Al Shaheed Trading Partner
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Select your entity category below to join our verified scrap trading and brokerage network.
              </p>
            </div>

            {/* Registration Role Sub-tabs */}
            <div className="flex justify-center">
              <div className="inline-flex p-1.5 bg-white border border-slate-200 rounded-2xl shadow-xs max-w-full overflow-x-auto gap-1">
                <button
                  id="tab-register-supplier"
                  type="button"
                  onClick={() => setSelectedRole('SUPPLIER')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                    selectedRole === 'SUPPLIER'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>1. Scrap Supplier (Generator / Yard)</span>
                </button>

                <button
                  id="tab-register-buyer"
                  type="button"
                  onClick={() => setSelectedRole('BUYER')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                    selectedRole === 'BUYER'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>2. Scrap Buyer (Steel Mill / Foundry)</span>
                </button>

                <button
                  id="tab-register-agent"
                  type="button"
                  onClick={() => setSelectedRole('AGENT')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                    selectedRole === 'AGENT'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>3. Brokerage Agent (Representative)</span>
                </button>
              </div>
            </div>

            {/* Registration Forms Container */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 max-w-4xl mx-auto">
              {/* ------------------------------------------------------------- */}
              {/* SUB-FORM A: SUPPLIER REGISTRATION */}
              {/* ------------------------------------------------------------- */}
              {selectedRole === 'SUPPLIER' && (
                <form id="supplier-register-form" onSubmit={handleSupplierRegister} className="space-y-6">
                  <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-emerald-600" />
                        Scrap Supplier &amp; Yard Registration
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Register to list industrial ferrous, non-ferrous, and paper scrap inventory for automated global buyer matching.
                      </p>
                    </div>
                    <span className="text-xs font-mono px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                      SUPPLIER
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Company / Scrap Yard Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Gulf Metal Recovery & Smelting W.L.L."
                        value={supplierForm.companyName}
                        onChange={(e) => setSupplierForm({ ...supplierForm, companyName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Authorized Contact Representative Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tariq Al-Mansoor"
                        value={supplierForm.contactName}
                        onChange={(e) => setSupplierForm({ ...supplierForm, contactName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Commercial Registration (CR) / License No.
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. CR-QA-882910"
                        value={supplierForm.businessRegNumber}
                        onChange={(e) => setSupplierForm({ ...supplierForm, businessRegNumber: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Tax Identification / VAT Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. TIN-994821"
                        value={supplierForm.taxVatNumber}
                        onChange={(e) => setSupplierForm({ ...supplierForm, taxVatNumber: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Official Business Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="supplier@gulfmetal.com"
                        value={supplierForm.email}
                        onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Direct Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+974 44558899"
                        value={supplierForm.phone}
                        onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Country *
                      </label>
                      <select
                        value={supplierForm.country}
                        onChange={(e) => setSupplierForm({ ...supplierForm, country: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      >
                        {COUNTRIES_LIST.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        City / Industrial Zone *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Doha / Industrial Area Zone 57"
                        value={supplierForm.city}
                        onChange={(e) => setSupplierForm({ ...supplierForm, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Primary Loading / Export Port
                      </label>
                      <select
                        value={supplierForm.loadingPort}
                        onChange={(e) => setSupplierForm({ ...supplierForm, loadingPort: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      >
                        {GLOBAL_PORTS.map((p) => (
                          <option key={p.port} value={p.port}>
                            {p.country}: {p.port}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Estimated Monthly Generation / Capacity
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 500 - 3,000 MT / month"
                        value={supplierForm.typicalVolume}
                        onChange={(e) => setSupplierForm({ ...supplierForm, typicalVolume: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Create Password *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={supplierForm.password}
                        onChange={(e) => setSupplierForm({ ...supplierForm, password: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={supplierForm.confirmPassword}
                        onChange={(e) => setSupplierForm({ ...supplierForm, confirmPassword: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Supply Categories Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Scrap Categories Available for Export / Supply (Select all that apply)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Metal Scrap',
                        'Paper Waste',
                        'Industrial Recyclables & Equipment',
                        'Plastic Recyclables',
                        'Machinery & Heavy Equipment',
                      ].map((cat) => {
                        const isSelected = supplierForm.commodityCategories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() =>
                              toggleCategory(cat, supplierForm.commodityCategories, (newList) =>
                                setSupplierForm({ ...supplierForm, commodityCategories: newList })
                              )
                            }
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Terms agreement */}
                  <label className="flex items-start gap-3 text-xs text-slate-600 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={supplierForm.agreedToTerms}
                      onChange={(e) => setSupplierForm({ ...supplierForm, agreedToTerms: e.target.checked })}
                      className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>
                      I certify that our scrap material adheres to standard ISRI specifications and accept Al Shaheed Trading &amp; Equipment Co. trading facilitation guidelines.
                    </span>
                  </label>

                  <div className="pt-2">
                    <button
                      id="submit-supplier-register-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      {isSubmitting ? 'Registering Supplier...' : 'Complete Supplier Registration & Access Desk'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SUB-FORM B: BUYER / MILL REGISTRATION */}
              {/* ------------------------------------------------------------- */}
              {selectedRole === 'BUYER' && (
                <form id="buyer-register-form" onSubmit={handleBuyerRegister} className="space-y-6">
                  <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-emerald-600" />
                        Scrap Buyer &amp; Recycling Mill Registration
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Register to post scrap procurement requirements, review verified cargo listings, and access secure international maritime shipments.
                      </p>
                    </div>
                    <span className="text-xs font-mono px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                      BUYER
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Company / Steel Mill Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Bharat Steelworks & Smelting Industries"
                        value={buyerForm.companyName}
                        onChange={(e) => setBuyerForm({ ...buyerForm, companyName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Procurement Officer / Trader Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rajesh Sharma"
                        value={buyerForm.contactName}
                        onChange={(e) => setBuyerForm({ ...buyerForm, contactName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Corporate Purchasing Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="procurement@bharatsteel.com"
                        value={buyerForm.email}
                        onChange={(e) => setBuyerForm({ ...buyerForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Direct Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 22 66778899"
                        value={buyerForm.phone}
                        onChange={(e) => setBuyerForm({ ...buyerForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Destination Country *
                      </label>
                      <select
                        value={buyerForm.country}
                        onChange={(e) => setBuyerForm({ ...buyerForm, country: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      >
                        {COUNTRIES_LIST.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Discharge Port Destination *
                      </label>
                      <select
                        value={buyerForm.destinationPort}
                        onChange={(e) => setBuyerForm({ ...buyerForm, destinationPort: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      >
                        {GLOBAL_PORTS.map((p) => (
                          <option key={p.port} value={p.port}>
                            {p.country}: {p.port}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Preferred Payment Mechanism
                      </label>
                      <select
                        value={buyerForm.preferredPaymentTerms}
                        onChange={(e) => setBuyerForm({ ...buyerForm, preferredPaymentTerms: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      >
                        {PAYMENT_TERMS_OPTIONS.map((term) => (
                          <option key={term} value={term}>
                            {term}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Estimated Monthly Demand Volume
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1,000 - 5,000 MT / month"
                        value={buyerForm.typicalVolume}
                        onChange={(e) => setBuyerForm({ ...buyerForm, typicalVolume: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Create Password *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={buyerForm.password}
                        onChange={(e) => setBuyerForm({ ...buyerForm, password: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={buyerForm.confirmPassword}
                        onChange={(e) => setBuyerForm({ ...buyerForm, confirmPassword: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Demand Categories Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Required Scrap Categories (Select all that apply)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Metal Scrap',
                        'Paper Waste',
                        'Industrial Recyclables & Equipment',
                        'Plastic Recyclables',
                        'Machinery & Heavy Equipment',
                      ].map((cat) => {
                        const isSelected = buyerForm.commodityCategories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() =>
                              toggleCategory(cat, buyerForm.commodityCategories, (newList) =>
                                setBuyerForm({ ...buyerForm, commodityCategories: newList })
                              )
                            }
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Terms agreement */}
                  <label className="flex items-start gap-3 text-xs text-slate-600 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={buyerForm.agreedToTerms}
                      onChange={(e) => setBuyerForm({ ...buyerForm, agreedToTerms: e.target.checked })}
                      className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>
                      I confirm authorization to execute procurement contracts and agree to SGS / Bureau Veritas international pre-shipment inspection protocols.
                    </span>
                  </label>

                  <div className="pt-2">
                    <button
                      id="submit-buyer-register-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      {isSubmitting ? 'Registering Buyer Account...' : 'Complete Buyer Registration & Access Marketplace'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SUB-FORM C: AGENT REGISTRATION */}
              {/* ------------------------------------------------------------- */}
              {selectedRole === 'AGENT' && (
                <form id="agent-register-form" onSubmit={handleAgentRegister} className="space-y-6">
                  <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-emerald-600" />
                        Brokerage Agent &amp; Trade Representative Registration
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Join Al Shaheed Trading desk as an authorized sales broker to receive assigned cargo lots and earn guaranteed commission per metric ton.
                      </p>
                    </div>
                    <span className="text-xs font-mono px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                      AGENT
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Full Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Khalid Mansoor Al-Nuaimi"
                        value={agentForm.fullName}
                        onChange={(e) => setAgentForm({ ...agentForm, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Brokerage Firm / Agency Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Al-Nuaimi Global Commodities Advisory"
                        value={agentForm.agencyName}
                        onChange={(e) => setAgentForm({ ...agentForm, agencyName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Direct Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="khalid.agent@alshaheedrecycling.com"
                        value={agentForm.email}
                        onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Mobile / WhatsApp Contact *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+974 33445566"
                        value={agentForm.phone}
                        onChange={(e) => setAgentForm({ ...agentForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Country of Operation *
                      </label>
                      <select
                        value={agentForm.country}
                        onChange={(e) => setAgentForm({ ...agentForm, country: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      >
                        {COUNTRIES_LIST.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        City / Base
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Doha / Dubai"
                        value={agentForm.city}
                        onChange={(e) => setAgentForm({ ...agentForm, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Geographic Trade Corridors Covered
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. GCC, India, Pakistan, Turkey, SE Asia"
                        value={agentForm.tradingRegion}
                        onChange={(e) => setAgentForm({ ...agentForm, tradingRegion: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Scrap Brokerage Experience (Years)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={40}
                        value={agentForm.experienceYears}
                        onChange={(e) => setAgentForm({ ...agentForm, experienceYears: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Create Password *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={agentForm.password}
                        onChange={(e) => setAgentForm({ ...agentForm, password: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={agentForm.confirmPassword}
                        onChange={(e) => setAgentForm({ ...agentForm, confirmPassword: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Commodity Specialization */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Commodity Brokerage Specialization
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Metal Scrap',
                        'Paper Waste',
                        'Industrial Recyclables & Equipment',
                        'Plastic Recyclables',
                        'Machinery & Heavy Equipment',
                      ].map((cat) => {
                        const isSelected = agentForm.commodityCategories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() =>
                              toggleCategory(cat, agentForm.commodityCategories, (newList) =>
                                setAgentForm({ ...agentForm, commodityCategories: newList })
                              )
                            }
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Terms agreement */}
                  <label className="flex items-start gap-3 text-xs text-slate-600 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={agentForm.agreedToTerms}
                      onChange={(e) => setAgentForm({ ...agentForm, agreedToTerms: e.target.checked })}
                      className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>
                      I agree to the Al Shaheed Intermediary Broker Agreement and International Non-Circumvention / Non-Disclosure (NCND) terms.
                    </span>
                  </label>

                  <div className="pt-2">
                    <button
                      id="submit-agent-register-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      {isSubmitting ? 'Registering Agent...' : 'Complete Agent Registration & Access Ledger'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer Credentials */}
      <footer className="border-t border-slate-200 bg-white/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>&copy; {new Date().getFullYear()} {COMPANY_INFO.name}. State of Qatar.</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <span>Doha Industrial Area</span>
            <span>&bull;</span>
            <span>ISRI Scrap Standards</span>
            <span>&bull;</span>
            <span>Direct Mediation Desk</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
