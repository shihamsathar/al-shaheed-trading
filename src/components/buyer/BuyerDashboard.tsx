import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';
import { TRADE_PHOTOS } from '../../constants/photos';
import {
  Boxes,
  PlusCircle,
  TrendingUp,
  ShoppingBag,
  Ship,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  FileSearch,
  CheckCircle2,
} from 'lucide-react';

interface BuyerDashboardProps {
  onNavigate: (tab: string) => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [myRequirements, setMyRequirements] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBuyerData() {
      try {
        setLoading(true);
        const [lists, reqs, txns] = await Promise.all([
          api.getListings({ status: 'AVAILABLE' }),
          api.getRequirements(),
          api.getTransactions(),
        ]);
        setListings(lists);
        setMyRequirements(reqs.filter((r) => r.buyerId === user?.id || !r.buyerId));
        setTransactions(txns.filter((t) => t.buyerId === user?.id || !t.buyerId));
      } catch (err) {
        console.error('Failed to load buyer dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBuyerData();
  }, [user]);

  const totalAvailableSupplyMT = listings.reduce((acc, l) => acc + (l.quantity || 0), 0);

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-xs font-semibold tracking-wider font-mono">
          LOADING BUYER PROCUREMENT INVENTORY...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* High-End Hero Banner with Maritime Container Logistics Photography */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-blue-500/20 bg-slate-950">
        {/* Photo Layer */}
        <div className="absolute inset-0 z-0">
          <img
            src={TRADE_PHOTOS.CONTAINER_LOGISTICS}
            alt="International Container Freight Port"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-30 filter brightness-90 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30 mb-4 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Verified Steel Mill &amp; Importer Procurement Desk</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {user?.companyName || user?.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
              Explore verified containerized scrap metals, post mill procurement RFQs, and manage confirmed LC at sight shipments.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => onNavigate('buyer-requirements')}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-black text-xs shadow-xl shadow-blue-950/60 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Buying Demand</span>
            </button>

            <button
              onClick={() => onNavigate('buyer-marketplace')}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs border border-blue-500/30 backdrop-blur-md transition-all cursor-pointer"
            >
              <Boxes className="w-4 h-4 text-blue-400" />
              <span>Browse Marketplace ({listings.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Buyer KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-blue-900/30 shadow-lg flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Available Supply Volume
          </span>
          <div className="text-3xl font-black text-white font-mono mt-2">
            {totalAvailableSupplyMT.toLocaleString()} <span className="text-base font-normal text-slate-400">MT</span>
          </div>
          <div className="text-xs text-blue-400 font-mono mt-1">
            Across {listings.length} verified supplier lots
          </div>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            My Active RFQ Demands
          </span>
          <div className="text-3xl font-black text-white font-mono mt-2">
            {myRequirements.length} <span className="text-base font-normal text-slate-400">Demands</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Actively matched by AI Engine
          </div>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Orders &amp; Contracts
          </span>
          <div className="text-3xl font-black text-white font-mono mt-2">
            {transactions.length} <span className="text-base font-normal text-slate-400">Shipments</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            LC at sight verified
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-950/80 to-slate-900 p-6 rounded-2xl border border-blue-500/30 shadow-lg flex flex-col justify-between">
          <span className="text-xs font-bold text-blue-300 uppercase tracking-wider block">
            Inspection Protocol
          </span>
          <div className="text-xl font-bold text-white mt-2 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
            SGS / BV Quality Assured
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Radioactivity &amp; moisture pre-screened
          </div>
        </div>
      </div>

      {/* Featured Scrap Lots Grid with Photography */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Boxes className="w-4 h-4 text-blue-400" />
            Verified Scrap Lots Ready For Immediate CIF/CFR Dispatch
          </h2>
          <button
            onClick={() => onNavigate('buyer-marketplace')}
            className="text-xs font-bold text-blue-400 hover:underline"
          >
            View All Marketplace Lots &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.slice(0, 6).map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate('buyer-marketplace')}
              className="group bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 hover:border-blue-500/40 transition-all overflow-hidden shadow-lg cursor-pointer flex flex-col justify-between"
            >
              <div className="h-44 overflow-hidden relative bg-slate-800">
                <img
                  src={item.photos?.[0] || TRADE_PHOTOS.HMS_STEEL_SCRAP}
                  alt={item.materialName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-950/80 text-white backdrop-blur-md border border-slate-700">
                    {item.commodityCategory}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="text-xs font-black px-2.5 py-1 rounded-md bg-blue-600 text-white shadow-md">
                    ${item.pricePerUnit} USD / {item.quantityUnit || 'MT'}
                  </span>
                </div>
              </div>

              <div className="p-4.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                    {item.materialName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                  <span className="font-mono">{item.quantity} MT ({item.numberOfContainers || 20} FCL)</span>
                  <span className="text-blue-400 font-semibold">{item.portOfShipping}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
