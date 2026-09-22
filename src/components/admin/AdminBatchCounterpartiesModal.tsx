import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import {
  Users,
  Building2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Send,
  UserCheck
} from 'lucide-react';

export interface BatchCounterpartyRow {
  role: 'BUYER' | 'AGENT';
  name: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  tradingRegion: string;
  commodityCategories: string[];
}

const DEFAULT_BUYER_ROW: BatchCounterpartyRow = {
  role: 'BUYER',
  name: '',
  companyName: '',
  email: '',
  phone: '+974 5500 0000',
  country: 'India',
  city: 'Mumbai',
  tradingRegion: 'South Asia & Global',
  commodityCategories: ['Metal Scrap'],
};

const DEFAULT_AGENT_ROW: BatchCounterpartyRow = {
  role: 'AGENT',
  name: '',
  companyName: '',
  email: '',
  phone: '+974 4488 0000',
  country: 'Qatar',
  city: 'Doha',
  tradingRegion: 'GCC & MENA Trade Corridors',
  commodityCategories: ['Metal Scrap'],
};

const SAMPLE_BATCH: BatchCounterpartyRow[] = [
  {
    role: 'BUYER',
    name: 'Vikram Singhania',
    companyName: 'Singhania Special Steels Pvt Ltd',
    email: 'vikram.singhania@singhaniasteel.in',
    phone: '+91 98200 44551',
    country: 'India',
    city: 'Mumbai',
    tradingRegion: 'West Coast India / Nhava Sheva',
    commodityCategories: ['Metal Scrap', 'HMS 1&2 (80:20)'],
  },
  {
    role: 'AGENT',
    name: 'Tariq Al-Mansoor',
    companyName: 'Al-Mansoor Gulf Commodity Brokerage',
    email: 'tariq.mansoor@almansoor-brokerage.qa',
    phone: '+974 5522 8899',
    country: 'Qatar',
    city: 'Doha',
    tradingRegion: 'GCC / Saudi Arabia / UAE',
    commodityCategories: ['Metal Scrap', 'Copper Millberry (99.99%)'],
  },
  {
    role: 'BUYER',
    name: 'Naveen Choudhury',
    companyName: 'Dhaka Metal Refining Mills Ltd',
    email: 'naveen.choudhury@dhakametals.com.bd',
    phone: '+880 1711 234567',
    country: 'Bangladesh',
    city: 'Chittagong',
    tradingRegion: 'Chittagong Port Trade Corridor',
    commodityCategories: ['Metal Scrap', 'Shredded Steel 211'],
  },
  {
    role: 'AGENT',
    name: 'Bilal Farooq',
    companyName: 'Farooq Global Scrap Agents',
    email: 'bilal.farooq@farooq-agents.pk',
    phone: '+92 300 8211990',
    country: 'Pakistan',
    city: 'Karachi',
    tradingRegion: 'Port Qasim & Middle East',
    commodityCategories: ['Metal Scrap', 'Aluminum Tense / TT'],
  },
];

export interface AdminBatchCounterpartiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminBatchCounterpartiesModal: React.FC<AdminBatchCounterpartiesModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [rows, setRows] = useState<BatchCounterpartyRow[]>([
    { ...DEFAULT_BUYER_ROW, name: 'Aditya Birla Metals', companyName: 'Birla Rolling Mills', email: 'procurement@birla-metals.in' },
    { ...DEFAULT_AGENT_ROW, name: 'Zaid Al-Kuwari', companyName: 'Kuwari Scrap Brokerage', email: 'zaid.kuwari@kuwari-brokerage.qa' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ success: boolean; text: string } | null>(null);

  if (!isOpen) return null;

  const handleAddRow = (role: 'BUYER' | 'AGENT') => {
    if (role === 'BUYER') {
      setRows([
        ...rows,
        {
          ...DEFAULT_BUYER_ROW,
          name: '',
          companyName: '',
          email: '',
        },
      ]);
    } else {
      setRows([
        ...rows,
        {
          ...DEFAULT_AGENT_ROW,
          name: '',
          companyName: '',
          email: '',
        },
      ]);
    }
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (index: number, field: keyof BatchCounterpartyRow, val: any) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: val };
    setRows(updated);
  };

  const handleLoadSampleBatch = () => {
    setRows([...SAMPLE_BATCH]);
  };

  const handlePostAll = async () => {
    // Validate rows
    const invalid = rows.find((r) => !r.name.trim() || !r.email.trim());
    if (invalid) {
      setResultMsg({
        success: false,
        text: 'Please make sure every row has at least a Name and Email address.',
      });
      return;
    }

    setSubmitting(true);
    setResultMsg(null);

    try {
      const res = await api.batchPostCounterparties(rows);
      setResultMsg({
        success: true,
        text: `Successfully posted ${res.count} counterparties (${rows.filter(r => r.role === 'BUYER').length} Buyers, ${rows.filter(r => r.role === 'AGENT').length} Agents) simultaneously!`,
      });
      onSuccess();
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setResultMsg({
        success: false,
        text: err.message || 'Failed to post batch counterparties.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const buyerCount = rows.filter((r) => r.role === 'BUYER').length;
  const agentCount = rows.filter((r) => r.role === 'AGENT').length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Post Buyers and Agents at a Time"
      subtitle="Batch register and onboard multiple Buyers and Agents simultaneously to Al Shaheed Desk"
      maxWidth="5xl"
    >
      <div className="space-y-6">
        {/* Banner with instant sample batch loader */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Simultaneous Counterparty Onboarding Engine
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Add any number of institutional Buyers and licensed Sourcing Agents in a single batch. All accounts are immediately provisioned, verified, and visible in their respective desks.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLoadSampleBatch}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Sample Mixed Batch</span>
          </button>
        </div>

        {/* Result notification */}
        {resultMsg && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in ${
              resultMsg.success
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
            }`}
          >
            {resultMsg.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <span className="font-semibold">{resultMsg.text}</span>
          </div>
        )}

        {/* Dynamic Rows Container */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
          {rows.map((row, idx) => {
            const isBuyer = row.role === 'BUYER';
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all ${
                  isBuyer
                    ? 'bg-blue-950/20 border-blue-900/40 hover:border-blue-700/60'
                    : 'bg-amber-950/20 border-amber-900/40 hover:border-amber-700/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">#{idx + 1}</span>

                    {/* Role Selector Toggle */}
                    <div className="flex rounded-lg overflow-hidden border border-slate-700">
                      <button
                        type="button"
                        onClick={() => handleUpdateRow(idx, 'role', 'BUYER')}
                        className={`px-3 py-1 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isBuyer
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Building2 className="w-3 h-3" />
                        <span>BUYER</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateRow(idx, 'role', 'AGENT')}
                        className={`px-3 py-1 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          !isBuyer
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Users className="w-3 h-3" />
                        <span>AGENT</span>
                      </button>
                    </div>

                    <span className="text-xs text-slate-400 font-medium ml-1">
                      {isBuyer ? 'Institutional Scrap Buyer / Importer' : 'Trade Broker & Sales Agent'}
                    </span>
                  </div>

                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Remove Row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Input Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                      {isBuyer ? 'Buyer Contact Person *' : 'Agent Broker Name *'}
                    </label>
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => handleUpdateRow(idx, 'name', e.target.value)}
                      placeholder={isBuyer ? 'e.g. Vikram Singhania' : 'e.g. Tariq Al-Mansoor'}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                      Company / Brokerage Name
                    </label>
                    <input
                      type="text"
                      value={row.companyName}
                      onChange={(e) => handleUpdateRow(idx, 'companyName', e.target.value)}
                      placeholder={isBuyer ? 'e.g. Singhania Steels' : 'e.g. Mansoor Brokerage'}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                      Official Email *
                    </label>
                    <input
                      type="email"
                      value={row.email}
                      onChange={(e) => handleUpdateRow(idx, 'email', e.target.value)}
                      placeholder="e.g. trade@company.com"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                      Phone / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={row.phone}
                      onChange={(e) => handleUpdateRow(idx, 'phone', e.target.value)}
                      placeholder="+974 5500 0000"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                      Country & City
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={row.country}
                        onChange={(e) => handleUpdateRow(idx, 'country', e.target.value)}
                        placeholder="Country"
                        className="w-1/2 px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-hidden"
                      />
                      <input
                        type="text"
                        value={row.city}
                        onChange={(e) => handleUpdateRow(idx, 'city', e.target.value)}
                        placeholder="City"
                        className="w-1/2 px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                      {isBuyer ? 'Primary Scrap Demands / Preferred Destination' : 'Brokerage Trading Region & Specialization'}
                    </label>
                    <input
                      type="text"
                      value={row.tradingRegion}
                      onChange={(e) => handleUpdateRow(idx, 'tradingRegion', e.target.value)}
                      placeholder={isBuyer ? 'e.g. HMS 1&2, Shredded 211 • Nhava Sheva Port' : 'e.g. GCC & MENA Corridors • Ferrous & Non-Ferrous'}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Row Adders */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => handleAddRow('BUYER')}
            className="px-3.5 py-2 rounded-xl bg-blue-950/50 hover:bg-blue-900/50 text-blue-300 border border-blue-600/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Buyer Row</span>
          </button>

          <button
            type="button"
            onClick={() => handleAddRow('AGENT')}
            className="px-3.5 py-2 rounded-xl bg-amber-950/50 hover:bg-amber-900/50 text-amber-300 border border-amber-600/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Agent Row</span>
          </button>
        </div>

        {/* Modal Footer Controls */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>Ready to post:</span>
            <span className="px-2.5 py-0.5 rounded-md bg-blue-950 border border-blue-500/30 text-blue-300 font-bold">
              {buyerCount} Buyers
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-amber-950 border border-amber-500/30 text-amber-300 font-bold">
              {agentCount} Agents
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              id="post-batch-counterparties-btn"
              type="button"
              onClick={handlePostAll}
              disabled={submitting || rows.length === 0}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>
                {submitting
                  ? 'Posting Counterparties...'
                  : `Post ${rows.length} Counterparties at a Time`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
