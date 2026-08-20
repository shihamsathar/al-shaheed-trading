import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';
import { TRADE_PHOTOS } from '../../constants/photos';
import {
  Boxes,
  Users,
  Building2,
  Layers,
  ArrowLeftRight,
  TrendingUp,
  DollarSign,
  PlusCircle,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Ship,
  Award,
  Globe2,
  Filter,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [summary, setSummary] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [sum, matchData, txns] = await Promise.all([
          api.getAnalyticsSummary(),
          api.getMatches(),
          api.getTransactions(),
        ]);
        setSummary(sum);
        setMatches(matchData.slice(0, 4));
        setTransactions(txns.slice(0, 5));
      } catch (err) {
        console.error('Error loading admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-xs font-semibold tracking-wider font-mono">
          SYNCING ENTERPRISE COMMODITIES MATCHING DESK...
        </p>
      </div>
    );
  }

  const activeSupplyMT = summary?.totalAvailableMT || 8420;
  const activeDemandMT = summary?.totalDemandMT || 6400;
  const grossMargin = summary?.totalGrossMargin || 184200;
  const totalSales = summary?.totalSalesValue || 945000;
  const totalSuppliers = summary?.totalSuppliers || 128;
  const totalBuyers = summary?.totalBuyers || 242;

  // Visual Category Highlights with Curated Photography
  const categories = [
    {
      name: 'Ferrous Metal Scrap',
      grade: 'HMS 1&2, Shredded 211, PNS',
      volume: '5,800 MT',
      img: TRADE_PHOTOS.HMS_STEEL_SCRAP,
      badge: 'High Liquidity',
    },
    {
      name: 'Copper & Non-Ferrous',
      grade: 'Millberry 99.9%, Berry, Birch',
      volume: '940 MT',
      img: TRADE_PHOTOS.COPPER_MILLBERRY,
      badge: 'Premium Margin',
    },
    {
      name: 'Paper Waste OCC 11',
      grade: 'Double/Single Wall Bales',
      volume: '1,680 MT',
      img: TRADE_PHOTOS.OCC_PAPER_WASTE,
      badge: 'Containerized',
    },
    {
      name: 'Aluminium Scrap',
      grade: 'UBC, Tense, Taint Tabor',
      volume: '850 MT',
      img: TRADE_PHOTOS.ALUMINIUM_SCRAP,
      badge: 'Fast Clearance',
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* High-End Cinematic Hero Banner with Maritime Photography */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/20 bg-slate-950">
        {/* Background Image Layer with Atmospheric Gradients */}
        <div className="absolute inset-0 z-0">
          <img
            src={TRADE_PHOTOS.PORT_TERMINAL_TWILIGHT}
            alt="Doha Port Terminal"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-35 filter brightness-90 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 mb-4 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Al Shaheed Managed Desk &bull; Executive Sovereign Operations</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Global Commodities &amp; Scrap Command
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
              Institutional aggregation of international scrap supply, automated blind AI buyer matching, and end-to-end containerized trade settlement.
            </p>
          </div>

          {/* Quick Action Buttons & Volume Snapshot */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-emerald-500/30 flex items-center justify-between gap-6">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Managed Volume</p>
                <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  {(activeSupplyMT + activeDemandMT).toLocaleString()} <span className="text-xs font-normal text-slate-300">MT</span>
                </p>
              </div>
              <div className="text-right pl-4 border-l border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Corridors</p>
                <p className="text-sm font-bold text-white font-mono">GCC &bull; IN &bull; BD &bull; TR</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                id="admin-btn-open-workspace"
                onClick={() => onNavigate('admin-matching')}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-xs shadow-xl shadow-emerald-950/60 transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>AI Matching Hub ({matches.length})</span>
              </button>

              <button
                id="admin-btn-view-marketplace"
                onClick={() => onNavigate('admin-marketplace')}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs border border-emerald-500/30 backdrop-blur-md transition-all cursor-pointer"
              >
                <Boxes className="w-4 h-4 text-emerald-400" />
                <span>Marketplace</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Commodity Categories Strip with Realistic Photography */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-400" />
              Primary Commodity Desks
            </h2>
            <p className="text-xs text-slate-400">Live tonnage aggregated across certified GCC and international supply yards</p>
          </div>
          <button
            onClick={() => onNavigate('admin-marketplace')}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            Explore All Lots <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate('admin-marketplace')}
              className="group relative rounded-2xl overflow-hidden border border-emerald-500/20 bg-slate-900/90 hover:border-emerald-400/60 transition-all cursor-pointer shadow-lg hover:shadow-emerald-950/40 flex flex-col justify-end min-h-[160px] p-4"
            >
              {/* Photo Background */}
              <div className="absolute inset-0 z-0">
                <img
                  src={cat.img}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-40 filter brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />
              </div>

              {/* Card Meta */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
                    {cat.badge}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{cat.volume}</span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-300 truncate mt-0.5">{cat.grade}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Spacious KPI Bento Grid */}
      <div className="grid grid-cols-12 gap-5">
        {/* KPI Tile 1: Active Supply */}
        <div
          onClick={() => onNavigate('admin-marketplace')}
          className="col-span-12 sm:col-span-6 lg:col-span-3 bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-emerald-900/30 hover:border-emerald-500/50 shadow-lg hover:shadow-emerald-950/30 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Available Supply
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Boxes className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-black text-white font-mono">
              {activeSupplyMT.toLocaleString()}{' '}
              <span className="text-sm font-normal text-slate-400">MT</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {summary?.activeListingsCount || 18} certified scrap lots
            </p>
          </div>
          <div className="text-[10px] text-emerald-300 bg-emerald-950/60 self-start px-2.5 py-1 rounded-md font-bold border border-emerald-500/30 uppercase tracking-tight">
            +12.4% MoM GROWTH
          </div>
        </div>

        {/* KPI Tile 2: Buyer Demand */}
        <div
          onClick={() => onNavigate('admin-matching')}
          className="col-span-12 sm:col-span-6 lg:col-span-3 bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-blue-900/30 hover:border-blue-500/50 shadow-lg hover:shadow-blue-950/30 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Mill &amp; Buyer Demand
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-black text-white font-mono">
              {activeDemandMT.toLocaleString()}{' '}
              <span className="text-sm font-normal text-slate-400">MT</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {summary?.activeDemandsCount || 42} active procurement RFQs
            </p>
          </div>
          <div className="text-[10px] text-blue-300 bg-blue-950/60 self-start px-2.5 py-1 rounded-md font-bold border border-blue-500/30 uppercase tracking-tight">
            42 OPEN REQUIREMENTS
          </div>
        </div>

        {/* KPI Tile 3: Projected Margin */}
        <div
          onClick={() => onNavigate('admin-transactions')}
          className="col-span-12 sm:col-span-6 lg:col-span-3 bg-gradient-to-br from-emerald-900/80 via-emerald-950 to-slate-900 p-6 rounded-2xl border border-emerald-500/40 shadow-xl shadow-emerald-950/40 hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-emerald-300 text-xs font-bold uppercase tracking-wider">
              Gross Trade Margin
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-emerald-300" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-black text-white font-mono">
              ${grossMargin.toLocaleString()}
            </div>
            <p className="text-xs text-emerald-200/80 mt-1">
              From ${totalSales.toLocaleString()} gross trades
            </p>
          </div>
          <div className="text-[10px] bg-emerald-500 text-slate-950 self-start px-2.5 py-1 rounded-md font-extrabold tracking-wider uppercase">
            REAL-TIME ACCRUAL
          </div>
        </div>

        {/* KPI Tile 4: Verified Network Counterparties */}
        <div
          onClick={() => onNavigate('admin-counterparties')}
          className="col-span-12 sm:col-span-6 lg:col-span-3 bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-800 hover:border-slate-700 shadow-lg transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Verified Partners
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-slate-300" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-black text-white font-mono">
              {(totalSuppliers + totalBuyers).toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {totalSuppliers} Suppliers &bull; {totalBuyers} Buyers
            </p>
          </div>
          <div className="text-[10px] text-slate-300 bg-slate-800 self-start px-2.5 py-1 rounded-md font-bold uppercase tracking-tight">
            GLOBAL ACCREDITED
          </div>
        </div>

        {/* Bento Tile 5: Matching Engine Workspace */}
        <div className="col-span-12 lg:col-span-8 bg-slate-900/90 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-emerald-900/30 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap justify-between items-center gap-3 mb-5 pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Automated AI Matching Engine
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">ISRI specification, port feasibility, and target price pairing</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-mono px-3 py-1 rounded-full font-bold">
                  AI AUTOMATIC MATCHING ACTIVE
                </span>
                <button
                  onClick={() => onNavigate('admin-matching')}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  Workspace <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-3.5">
              {matches.map((m) => (
                <div
                  key={m.id}
                  className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 hover:border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-2xl shadow-xs border border-slate-800 shrink-0">
                      {m.listing.commodityCategory === 'Metal Scrap' ? '🏗️' : m.listing.commodityCategory === 'Paper Waste' ? '📦' : '🧱'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {m.listing.materialName}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">
                        {m.listing.quantity} MT &bull; {m.listing.portOfShipping} &rarr; {m.requirement.destinationPort}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    <div className="text-right px-2">
                      <div className="text-sm font-black text-emerald-400 font-mono">
                        {m.overallScore}% Fit
                      </div>
                      <div className="w-28 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                          style={{ width: `${m.overallScore}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('admin-matching')}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap shadow-md shadow-emerald-950/50 cursor-pointer"
                    >
                      CREATE DEAL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Blind Counterparty Mediation &bull; Margin Locking Protocol</span>
            <button
              onClick={() => onNavigate('admin-matching')}
              className="text-emerald-400 font-bold hover:underline"
            >
              Open Full Matching Workspace &rarr;
            </button>
          </div>
        </div>

        {/* Bento Tile 6: Agent Rankings Leaderboard */}
        <div className="col-span-12 lg:col-span-4 bg-slate-900/90 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Top Broker Ranking
              </h3>
              <button
                onClick={() => onNavigate('admin-agents')}
                className="text-xs font-bold text-amber-400 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black text-xs border border-amber-500/30">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">Khalid Mansoor</p>
                  <p className="text-[11px] text-slate-400 font-mono">GCC Scrap Lead &bull; $15.0k Earned</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-md">
                  Top Seller
                </span>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80">
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center font-black text-xs">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">Sanjay Patel</p>
                  <p className="text-[11px] text-slate-400 font-mono">South Asia Desk &bull; $12.4k Earned</p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80">
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center font-black text-xs">
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">Selim Erdogan</p>
                  <p className="text-[11px] text-slate-400 font-mono">Med &amp; Levant &bull; $9.8k Earned</p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4">
            <div className="text-center p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Default Fixed Brokerage Metric
              </p>
              <p className="text-lg font-black text-white font-mono mt-0.5">
                $15.00 <span className="text-xs font-normal text-slate-400">USD / MT</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bento Tile 7: Recent Managed Transactions Ledger */}
        <div className="col-span-12 bg-slate-900/90 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
                Live Managed Deal Transactions
              </h3>
              <p className="text-xs text-slate-400">Real-time status of contracts, LC issuances, and BL shipments</p>
            </div>
            <button
              onClick={() => onNavigate('admin-transactions')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              Open Full Ledger ({transactions.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Deal Code</th>
                  <th className="pb-3 font-semibold">Commodity &amp; Volume</th>
                  <th className="pb-3 font-semibold">Corridor (Origin &rarr; Destination)</th>
                  <th className="pb-3 font-semibold">Transacted Value</th>
                  <th className="pb-3 font-semibold">Gross Margin</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {transactions.slice(0, 5).map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => onNavigate('admin-transactions')}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 font-mono font-bold text-emerald-400">
                      {t.dealCode}
                    </td>
                    <td className="py-3.5 text-white font-medium">
                      {t.materialName} ({t.quantity} MT)
                    </td>
                    <td className="py-3.5 text-slate-300 font-mono text-[11px]">
                      {t.portOfShipping} &rarr; {t.destinationPort}
                    </td>
                    <td className="py-3.5 font-mono font-bold text-white">
                      ${t.totalSalesValue?.toLocaleString()} USD
                    </td>
                    <td className="py-3.5 font-mono text-emerald-400 font-bold">
                      +${t.totalGrossMargin?.toLocaleString()} USD
                    </td>
                    <td className="py-3.5 text-right">
                      <Badge status={t.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
