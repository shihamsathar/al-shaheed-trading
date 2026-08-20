import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { SystemSettings } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Settings,
  Building2,
  DollarSign,
  ShieldCheck,
  Save,
  CheckCircle2,
  KeyRound,
  UserCheck,
  AlertCircle,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { user, refreshUserData } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  // Admin Credentials Management State
  const [adminUsername, setAdminUsername] = useState(user?.name || 'admin');
  const [adminEmail, setAdminEmail] = useState(user?.email || 'admin@alshaheedrecycling.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [credLoading, setCredLoading] = useState(false);
  const [credSuccess, setCredSuccess] = useState<string | null>(null);
  const [credError, setCredError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const data = await api.getSettings();
        setSettings(data);
        if (user) {
          setAdminUsername(user.name);
          setAdminEmail(user.email);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await api.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateAdminCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredError(null);
    setCredSuccess(null);

    if (!adminUsername.trim()) {
      setCredError('Admin username cannot be empty.');
      return;
    }

    if (adminPassword && adminPassword !== confirmPassword) {
      setCredError('New password and confirm password do not match.');
      return;
    }

    setCredLoading(true);
    try {
      const res = await api.updateAdminCredentials({
        username: adminUsername.trim(),
        email: adminEmail.trim(),
        password: adminPassword || undefined,
      });
      setCredSuccess(`Admin credentials updated successfully! You can now log in with username "${adminUsername}".`);
      setAdminPassword('');
      setConfirmPassword('');
      if (refreshUserData) {
        await refreshUserData();
      }
    } catch (err: any) {
      setCredError(err.message || 'Failed to update credentials.');
    } finally {
      setCredLoading(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-slate-500">Loading system parameters...</div>;
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            System Configuration &amp; Administration
          </h1>
          <p className="text-xs text-slate-500">
            Manage admin login credentials, corporate identity, default commission rates, and trading rules.
          </p>
        </div>

        {saved && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Settings Successfully Saved
          </div>
        )}
      </div>

      {/* Admin Login Credentials & Security Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-emerald-500/20 dark:border-emerald-500/30 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            Admin Login Credentials &amp; Custom Username
          </h3>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
            Current Login: {user?.name || 'admin'}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400">
          As the Primary Administrator, you have exclusive privilege to set any custom username of your choice (e.g. your name or handle). Partners and agents must use their registered email ID.
        </p>

        {credSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {credSuccess}
          </div>
        )}

        {credError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            {credError}
          </div>
        )}

        <form onSubmit={handleUpdateAdminCredentials} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Custom Admin Username <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="e.g. admin or alshaheed_ceo"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold text-slate-900 dark:text-white"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Used on the sign-in page to enter the admin desk</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Admin Notification Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@alshaheedrecycling.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Receives instant deal and counterpart alerts</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                New Admin Password (leave blank to keep current)
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={credLoading}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              {credLoading ? 'Saving...' : 'Update Admin Credentials'}
            </button>
          </div>
        </form>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Identity */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Building2 className="w-4 h-4 text-emerald-600" />
            Company Identity &amp; Contact Header
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Website
              </label>
              <input
                type="text"
                value={settings.companyWebsite}
                onChange={(e) => setSettings({ ...settings, companyWebsite: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Trading Email
              </label>
              <input
                type="email"
                value={settings.companyEmail}
                onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone Numbers
              </label>
              <input
                type="text"
                value={settings.companyPhone}
                onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
          </div>
        </div>

        {/* Commercial Trading & Agent Rules */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <DollarSign className="w-4 h-4 text-amber-600" />
            Commercial Agent &amp; Matching Engine Rules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Default Agent Commission ($/MT)
              </label>
              <input
                type="number"
                min={1}
                value={settings.defaultAgentCommissionPerTon}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultAgentCommissionPerTon: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-amber-600"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Calculated as MT &times; ($/MT)</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Minimum Match Score Threshold (%)
              </label>
              <input
                type="number"
                min={10}
                max={99}
                value={settings.matchingThresholdPercent}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    matchingThresholdPercent: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Threshold to display in match workspace</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Base Trading Currency
              </label>
              <input
                type="text"
                disabled
                value={settings.baseCurrency}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Standard global commodities currency</span>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.counterpartyDirectContactDisabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    counterpartyDirectContactDisabled: e.target.checked,
                  })
                }
                className="w-4 h-4 text-emerald-600 rounded"
              />
              Enforce strict counterparty identity masking (Suppliers &amp; Buyers cannot view each other)
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Configuration Changes
          </button>
        </div>
      </form>
    </div>
  );
};
