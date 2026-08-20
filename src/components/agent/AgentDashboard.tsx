import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';
import { TRADE_PHOTOS } from '../../constants/photos';
import {
  Boxes,
  DollarSign,
  TrendingUp,
  Award,
  ShieldCheck,
  ChevronRight,
  ArrowLeftRight,
  Sparkles,
  Users,
  CheckCircle2,
} from 'lucide-react';

interface AgentDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [assignedMaterials, setAssignedMaterials] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAgentData() {
      try {
        setLoading(true);
        const [materials, txns] = await Promise.all([
          api.getAgentAssignments(),
          api.getTransactions(),
        ]);
        setAssignedMaterials(materials);
        setTransactions(txns);
      } catch (err) {
        console.error('Failed to load agent dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAgentData();
  }, [user]);

  const earnedCommissions = 15000;
  const pendingCommissions = 6200;
  const totalVolumeBrokered = 1850;

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400">
        <div className="animate-spin w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-xs font-semibold tracking-wider font-mono">
          LOADING AGENT BROKERAGE LEDGER...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* High-End Hero Banner with Maritime / Cargo Photography */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-amber-500/20 bg-slate-950">
        {/* Photo Layer */}
        <div className="absolute inset-0 z-0">
          <img
            src={TRADE_PHOTOS.MARITIME_CARGO_SHIP}
            alt="International Cargo Ship"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-30 filter brightness-90 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30 mb-4 backdrop-blur-md">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Certified Al Shaheed International Trade Broker</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {user?.name || 'Agent Command Desk'}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
              Track assigned scrap inventory, facilitate containerized deal closings, and view real-time commission disbursements ($15.00/MT standard fee).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => onNavigate('agent-assigned-materials')}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-xl shadow-amber-950/60 transition-all cursor-pointer"
            >
              <Boxes className="w-4 h-4" />
              <span>Assigned Lots ({assignedMaterials.length})</span>
            </button>

            <button
              onClick={() => onNavigate('agent-commission-ledger')}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs border border-amber-500/30 backdrop-blur-md transition-all cursor-pointer"
            >
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>Commission Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {/* Agent Brokerage Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-amber-900/30 shadow-lg flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Paid Commissions
          </span>
          <div className="text-3xl font-black text-amber-400 font-mono mt-2">
            ${earnedCommissions.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">Disbursed directly via Doha HQ</div>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Pending LC Settlements
          </span>
          <div className="text-3xl font-black text-white font-mono mt-2">
            ${pendingCommissions.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-400 mt-1">Upon SGS port clearance</div>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Brokered Tonnage
          </span>
          <div className="text-3xl font-black text-white font-mono mt-2">
            {totalVolumeBrokered.toLocaleString()} <span className="text-base font-normal text-slate-400">MT</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Across 8 completed shipments</div>
        </div>

        <div className="bg-gradient-to-br from-amber-950/80 to-slate-900 p-6 rounded-2xl border border-amber-500/30 shadow-lg flex flex-col justify-between">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
            Commission Rate
          </span>
          <div className="text-2xl font-black text-white font-mono mt-2">
            $15.00 <span className="text-xs font-normal text-slate-300">USD / MT</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Fixed protected broker fee</div>
        </div>
      </div>

      {/* Assigned Lots Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Boxes className="w-4 h-4 text-amber-400" />
            Assigned Scrap Materials for Placement
          </h2>
          <button
            onClick={() => onNavigate('agent-assigned-materials')}
            className="text-xs font-bold text-amber-400 hover:underline"
          >
            View Full Inventory &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {assignedMaterials.map((m) => (
            <div
              key={m.id}
              className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all p-5 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {m.commodityCategory}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Est. Comm: ${m.estimatedCommission?.toLocaleString()}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-2">{m.materialName}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {m.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span className="font-mono font-bold text-white">{m.quantity} MT</span>
                <span className="text-amber-400 font-semibold">{m.portOfShipping}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
