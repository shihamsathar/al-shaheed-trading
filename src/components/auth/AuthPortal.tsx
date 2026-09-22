/**
 * Al Shaheed Trading and Equipment Co.
 * Official Institutional Login Portal
 * 
 * Features:
 * - Official Al Shaheed Logo
 * - Direct User Name & Password login with anytime login/logout
 * - Self-Service Account Creation for:
 *     1. Supplier (Scrap Yard / Recycler)
 *     2. Buyer (Steel Mill / Smelter / Importer)
 *     3. Agent (Commission Broker)
 * - Forgot Password reset for all logins (Admin, Supplier, Buyer, Agent)
 * - Comprehensive error & validation feedback
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';
import {
  User as UserIcon,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Building2,
  Mail,
  Phone,
  Globe,
  ArrowLeft,
  UserPlus,
  KeyRound,
  Factory,
  Building,
  Briefcase,
} from 'lucide-react';
import { UserRole } from '../../types';

interface AuthPortalProps {
  onSuccess?: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot_password';

export const AuthPortal: React.FC<AuthPortalProps> = ({ onSuccess }) => {
  const { login, register, resetPassword } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');

  // --- LOGIN STATE ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // --- REGISTER STATE (SUPPLIER, BUYER, AGENT) ---
  const [regRole, setRegRole] = useState<'SUPPLIER' | 'BUYER' | 'AGENT'>('SUPPLIER');
  const [regUsername, setRegUsername] = useState('');
  const [regName, setRegName] = useState('');
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCountry, setRegCountry] = useState('Qatar');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // --- FORGOT PASSWORD STATE ---
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // --- UI FEEDBACK ---
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear messages when switching modes
  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);
  };

  // --- SUBMIT LOGIN ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError('Please enter your user name or email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(trimmedUsername, password);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Invalid user name or password. Please verify your credentials or reset your password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- SUBMIT REGISTER (SUPPLIER, BUYER, AGENT) ---
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanUsername = regUsername.trim();
    const cleanName = regName.trim();
    const cleanCompany = regCompanyName.trim();
    const cleanEmail = regEmail.trim();

    if (!cleanUsername) {
      setError('Please choose a user name for your login.');
      return;
    }
    if (!cleanName) {
      setError('Please enter your full name or contact person.');
      return;
    }
    if (!cleanCompany) {
      setError('Please enter your company or business firm name.');
      return;
    }
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!regPassword) {
      setError('Please enter a password.');
      return;
    }
    if (regPassword.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please verify both password fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        role: regRole,
        username: cleanUsername,
        name: cleanName,
        companyName: cleanCompany,
        email: cleanEmail,
        password: regPassword,
        phone: regPhone.trim(),
        country: regCountry.trim() || 'Qatar',
        commodityCategories: ['Metal Scrap', 'Industrial Recyclables & Equipment'],
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please check the details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- SUBMIT RESET PASSWORD ---
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const identifier = resetIdentifier.trim();
    if (!identifier) {
      setError('Please enter the user name or email address of the account.');
      return;
    }
    if (!resetNewPassword) {
      setError('Please enter a new password.');
      return;
    }
    if (resetNewPassword.length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setError('New passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword(identifier, resetNewPassword);
      setSuccessMsg(res.message || 'New password saved successfully! You can now log in.');
      setUsername(identifier);
      setPassword('');
      setMode('login');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please verify the user name or email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative selection:bg-emerald-500 selection:text-slate-950">
      {/* Subtle Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-950/40 via-slate-950 to-slate-950 pointer-events-none" />

      <div className={`w-full ${mode === 'register' ? 'max-w-xl' : 'max-w-md'} relative z-10 space-y-6 transition-all`}>
        {/* Al Shaheed Official Logo */}
        <div className="flex flex-col items-center text-center">
          <Logo variant="official" size="xl" />
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/95 backdrop-blur-xl border border-emerald-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/60">
          
          {/* Success Banner */}
          {successMsg && (
            <div
              id="auth-success-alert"
              className="mb-5 p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMsg}</div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div
              id="auth-error-alert"
              className="mb-5 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 1: LOGIN                                                             */}
          {/* ========================================================================= */}
          {mode === 'login' && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-lg font-black text-white tracking-wide">Institutional Login</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Sign in with your created user name and password
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* User Name Input */}
                <div>
                  <label
                    htmlFor="login-username"
                    className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2"
                  >
                    User Name or Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="login-username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      disabled={isSubmitting}
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="e.g. admin, supplier, buyer, or your username"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-bold text-slate-300 uppercase tracking-wider"
                    >
                      Password
                    </label>
                    <button
                      id="forgot-password-link"
                      type="button"
                      onClick={() => switchMode('forgot_password')}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors focus:outline-none cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      disabled={isSubmitting}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Enter Password"
                      className="w-full pl-10 pr-11 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <div className="pt-2">
                  <button
                    id="login-button"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 hover:shadow-emerald-900/80 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 text-slate-950" />
                        <span>Login</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Create Account Divider & Button */}
              <div className="mt-6 pt-5 border-t border-slate-800/80 text-center space-y-3">
                <p className="text-xs text-slate-400 font-medium">
                  Need an account for your trading firm?
                </p>
                <button
                  id="switch-to-create-account-button"
                  type="button"
                  onClick={() => switchMode('register')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-emerald-300 hover:text-emerald-200 border border-emerald-800/40 hover:border-emerald-700/60 font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Create Supplier, Buyer, or Agent Account</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 2: REGISTER (SUPPLIER, BUYER, AGENT)                                */}
          {/* ========================================================================= */}
          {mode === 'register' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-black text-white tracking-wide">Create Trading Account</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Register for your own dedicated portal login &amp; password
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-800/50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>

              {/* Role Selection Tabs */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Select Your Account Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Supplier */}
                  <button
                    id="register-role-supplier"
                    type="button"
                    onClick={() => setRegRole('SUPPLIER')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center ${
                      regRole === 'SUPPLIER'
                        ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow-md shadow-amber-950/50'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Factory className={`w-5 h-5 ${regRole === 'SUPPLIER' ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-black">Supplier</span>
                    <span className="text-[10px] text-slate-400 leading-tight hidden sm:inline">Scrap Seller / Yard</span>
                  </button>

                  {/* Buyer */}
                  <button
                    id="register-role-buyer"
                    type="button"
                    onClick={() => setRegRole('BUYER')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center ${
                      regRole === 'BUYER'
                        ? 'bg-blue-950/60 border-blue-500 text-blue-200 shadow-md shadow-blue-950/50'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Building className={`w-5 h-5 ${regRole === 'BUYER' ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-black">Buyer</span>
                    <span className="text-[10px] text-slate-400 leading-tight hidden sm:inline">Mill / Smelter</span>
                  </button>

                  {/* Agent */}
                  <button
                    id="register-role-agent"
                    type="button"
                    onClick={() => setRegRole('AGENT')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center ${
                      regRole === 'AGENT'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950/50'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Briefcase className={`w-5 h-5 ${regRole === 'AGENT' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-black">Agent</span>
                    <span className="text-[10px] text-slate-400 leading-tight hidden sm:inline">Broker / Mandate</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* User Name & Full Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="register-username"
                      className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"
                    >
                      User Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <UserIcon className="w-3.5 h-3.5" />
                      </div>
                      <input
                        id="register-username"
                        type="text"
                        required
                        disabled={isSubmitting}
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                        placeholder="e.g. nasser_yard"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="register-name"
                      className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"
                    >
                      Contact Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <UserIcon className="w-3.5 h-3.5" />
                      </div>
                      <input
                        id="register-name"
                        type="text"
                        required
                        disabled={isSubmitting}
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Nasser Al-Kuwari"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="register-company"
                      className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"
                    >
                      Company Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <input
                        id="register-company"
                        type="text"
                        required
                        disabled={isSubmitting}
                        value={regCompanyName}
                        onChange={(e) => setRegCompanyName(e.target.value)}
                        placeholder="e.g. Gulf Scrap Yard W.L.L."
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="register-email"
                      className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"
                    >
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <input
                        id="register-email"
                        type="email"
                        required
                        disabled={isSubmitting}
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="e.g. trader@company.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="register-password"
                      className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"
                    >
                      Password <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        id="register-password"
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        disabled={isSubmitting}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Create Password"
                        className="w-full pl-9 pr-9 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer"
                        aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="register-confirm-password"
                      className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"
                    >
                      Confirm Password <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        id="register-confirm-password"
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        disabled={isSubmitting}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter Password"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Country & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="register-country"
                      className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"
                    >
                      Country
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Globe className="w-3.5 h-3.5" />
                      </div>
                      <input
                        id="register-country"
                        type="text"
                        disabled={isSubmitting}
                        value={regCountry}
                        onChange={(e) => setRegCountry(e.target.value)}
                        placeholder="e.g. Qatar, UAE, India"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="register-phone"
                      className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"
                    >
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <input
                        id="register-phone"
                        type="text"
                        disabled={isSubmitting}
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="e.g. +974 55123456"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Register Button */}
                <div className="pt-2">
                  <button
                    id="register-submit-button"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-xs tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 hover:shadow-emerald-900/80 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 text-slate-950" />
                        <span>Create {regRole} Account &amp; Sign In</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Back to Login link */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-xs font-semibold text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  Already have an account? <span className="text-emerald-400 underline">Log In</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 3: FORGOT PASSWORD (FOR ALL LOGINS: ADMIN, SUPPLIER, BUYER, AGENT)   */}
          {/* ========================================================================= */}
          {mode === 'forgot_password' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-black text-white tracking-wide">Reset Password</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Create a new password for your login (Admin, Supplier, Buyer, or Agent)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-800/50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                {/* Account Identifier Input */}
                <div>
                  <label
                    htmlFor="reset-identifier"
                    className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2"
                  >
                    Account User Name or Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="reset-identifier"
                      type="text"
                      required
                      disabled={isSubmitting}
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      placeholder="e.g. admin, supplier, buyer, agent, or your user name"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label
                    htmlFor="reset-new-password"
                    className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      id="reset-new-password"
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      disabled={isSubmitting}
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-10 pr-11 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none cursor-pointer"
                      aria-label={showResetPassword ? 'Hide password' : 'Show password'}
                    >
                      {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label
                    htmlFor="reset-confirm-password"
                    className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="reset-confirm-password"
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      disabled={isSubmitting}
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Save New Password Button */}
                <div className="pt-2">
                  <button
                    id="reset-submit-button"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 hover:shadow-emerald-900/80 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4 text-slate-950" />
                        <span>Save New Password &amp; Continue</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Back to Login link */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-xs font-semibold text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  Remember your password? <span className="text-emerald-400 underline">Log In</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
