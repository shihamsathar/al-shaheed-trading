import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';
import { TRADE_PHOTOS } from '../../constants/photos';
import {
  Boxes,
  PlusCircle,
  TrendingUp,
  FileSearch,
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2,
  Ship,
  Sparkles,
  ChevronRight,
  MapPin,
  Calendar,
  Layers,
} from 'lucide-react';

interface SupplierDashboardProps {
  onNavigate: (tab: string) => void;
}

export const SupplierDashboard: React.FC<SupplierDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [demands, setDemands] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupplierData() {
      try {
        setLoading(true);
        const [lists, reqs, txns] = await Promise.all([
          api.getListings(),
          api.getRequirements(),
          api.getTransactions(),
        ]);
        setListings(lists);
        setDemands(reqs.slice(0, 4));
        setTransactions(txns);
      } catch (err) {
        console.error('Failed to load supplier dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSupplierData();
  }, []);

  const myListings = listings.filter((l) => l.supplierId === user?.id || !l.supplierId);
  const availableLots = myListings.filter((l) => l.status === 'AVAILABLE');
  const soldLots = myListings.filter((l) => l.status === 'SOLD');
  const totalListedMT = myListings.reduce((acc, l) => acc + (l.quantity || 0), 0);
  const totalSoldMT = soldLots.reduce((acc, l) => acc + (l.quantity || 0), 0);

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-xs font-semibold tracking-wider font-mono">
          LOADING SUPPLIER COMMODITY INVENTORY...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* High-End Hero Banner with Steel Smelting / Recycling Photography */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/20 bg-slate-950">
        {/* Photo Layer */}
        <div className="absolute inset-0 z-0">
          <img
            src={TRADE_PHOTOS.STEEL_MILL_SMELTING}
            alt="Scrap Metal Processing Facility"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-30 filter brightness-90 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 mb-4 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Industrial Scrap Supplier Desk</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {user?.companyName || user?.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
              Manage scrap inventory lots, monitor live container shipments from Hamad/Jebel Ali, and receive verified buyer purchase orders.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => onNavigate('supplier-add-listing')}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-xs shadow-xl shadow-emerald-950/60 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List New Scrap Lot</span>
            </button>

            <button
              onClick={() => onNavigate('supplier-listings')}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs border border-emerald-500/30 backdrop-blur-md transition-all cursor-pointer"
            >
              <Boxes className="w-4 h-4 text-emerald-400" />
              <span>View All Listings ({myListings.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Supplier KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-emerald-900/30 shadow-lg flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Available Inventory
          </span>
          <div className="text-3xl font-black text-white font-mono mt-2">
            {availableLots.length} <span className="text-base font-normal text-slate-400">Lots</span>
          </div>
          <div className="text-xs text-emerald-400 font-mono mt-1">
            {availableLots.reduce((acc, l) => acc + l.quantity, 0).toLocaleString()} MT ready to ship
          </div>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Completed Volume
          </span>
          <div className="text-3xl font-black text-white font-mono mt-2">
            {totalSoldMT.toLocaleString()} <span className="text-base font-normal text-slate-400">MT</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {soldLots.length} deals closed &amp; shipped
          </div>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Total Material Listed
          </span>
          <div className="text-3xl font-black text-white font-mono mt-2">
            {totalListedMT.toLocaleString()} <span className="text-base font-normal text-slate-400">MT</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Across {myListings.length} total lots
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-950/80 to-slate-900 p-6 rounded-2xl border border-emerald-500/30 shadow-lg flex flex-col justify-between">
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
            Verification Status
          </span>
          <div className="text-xl font-bold text-white mt-2 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ISRI Certified
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Full export clearance from Hamad Port
          </div>
        </div>
      </div>

      {/* Main Grid: My Active Listings & Live Market Demands */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Inventory Feed */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-400" />
              My Active Scrap Listings
            </h2>
            <button
              onClick={() => onNavigate('supplier-listings')}
              className="text-xs font-bold text-emerald-400 hover:underline"
            >
              View All &rarr;
            </button>
          </div>

          <div className="space-y-3.5">
            {availableLots.slice(0, 3).map((l) => (
              <div
                key={l.id}
                className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-4.5 hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                    <img
                      src={l.photos?.[0] || TRADE_PHOTOS.HMS_STEEL_SCRAP}
                      alt={l.materialName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      {l.commodityCategory}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">{l.materialName}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {l.quantity} MT &bull; ${l.pricePerUnit} USD/{l.quantityUnit || 'MT'} &bull; {l.incoterms}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Badge status={l.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Buyer Demands Feed */}
        <div className="lg:col-span-5 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-blue-400" />
                Global Buyer Demand Feed
              </h2>
              <span className="text-[10px] bg-blue-950 text-blue-300 px-2.5 py-0.5 rounded-full font-bold border border-blue-800">
                Live RFQs
              </span>
            </div>

            <div className="space-y-3">
              {demands.map((d) => (
                <div
                  key={d.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white">{d.materialName}</p>
                    <span className="text-xs font-mono font-bold text-emerald-400">{d.targetTonnage} MT</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Discharge Port: <span className="text-slate-200">{d.destinationPort}</span>
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                    <span>Target Price: ${d.targetPriceMax} / MT</span>
                    <span className="text-blue-400 font-semibold">{d.preferredIncoterms}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-center">
            <button
              onClick={() => onNavigate('supplier-demands')}
              className="text-xs font-bold text-emerald-400 hover:underline"
            >
              Open Full Demand Feed &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
