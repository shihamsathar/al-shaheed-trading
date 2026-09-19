import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ScrapListing } from '../../types';
import {
  X,
  DollarSign,
  Building2,
  TrendingUp,
  Globe,
  Lock,
  UserCheck,
  ShieldCheck,
  Calculator,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Users,
} from 'lucide-react';

interface AdminPublishModalProps {
  isOpen: boolean;
  listing: ScrapListing | null;
  onClose: () => void;
  onSuccess: (updatedListing: ScrapListing) => void;
}

const COMMON_BUYER_SUGGESTIONS = [
  'Qatar Steel Industries (Mesaieed)',
  'Doha Steel Works & Re-Rolling',
  'Emirates Steel Arkan (Abu Dhabi)',
  'Al Jazeera Steel Products Co',
  'Gulf Extrusions LLC',
  'Jindal Steel & Power (Oman / India)',
  'Tata Steel BSL (Mumbai / Nhava Sheva)',
  'National Steel Mill (Chattogram)',
  'Habas Sinai (Aliaga, Turkey)',
  'General Open Marketplace (All Verified Buyers)',
];

export const AdminPublishModal: React.FC<AdminPublishModalProps> = ({
  isOpen,
  listing,
  onClose,
  onSuccess,
}) => {
  const [registeredBuyers, setRegisteredBuyers] = useState<any[]>([]);
  const [adminProfit, setAdminProfit] = useState<number>(25);
  const [buyerName, setBuyerName] = useState<string>('');
  const [targetBuyerId, setTargetBuyerId] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [customPriceMode, setCustomPriceMode] = useState<boolean>(false);
  const [customPublishedPrice, setCustomPublishedPrice] = useState<number>(0);

  useEffect(() => {
    if (isOpen && listing) {
      const baseCost = listing.supplierPricePerUnit || listing.pricePerUnit || 300;
      const existingProfit = listing.adminProfitPerUnit !== undefined ? listing.adminProfitPerUnit : 25;
      setAdminProfit(existingProfit);
      setCustomPublishedPrice(baseCost + existingProfit);
      setBuyerName(listing.targetBuyerName || listing.buyerName || '');
      setTargetBuyerId(listing.targetBuyerId || '');
      setAdminNotes(listing.adminNotes || '');

      // Load registered buyers from server
      api.getBuyers().then((buyers) => {
        if (Array.isArray(buyers)) {
          setRegisteredBuyers(buyers);
        }
      }).catch(() => {});
    }
  }, [isOpen, listing]);

  if (!isOpen || !listing) return null;

  const supplierCost = listing.supplierPricePerUnit || listing.pricePerUnit;
  const currentPublishedPrice = customPriceMode
    ? customPublishedPrice
    : supplierCost + adminProfit;
  const effectiveProfitPerMT = currentPublishedPrice - supplierCost;
  const totalProjectedProfit = effectiveProfitPerMT * listing.quantity;
  const totalSupplierGross = supplierCost * listing.quantity;
  const totalBuyerGross = currentPublishedPrice * listing.quantity;
  const marginPercentage = supplierCost > 0 ? ((effectiveProfitPerMT / supplierCost) * 100).toFixed(1) : '0.0';

  const handleProfitChange = (val: number) => {
    setAdminProfit(val);
    setCustomPublishedPrice(supplierCost + val);
    setCustomPriceMode(false);
  };

  const handleCustomPriceChange = (val: number) => {
    setCustomPublishedPrice(val);
    setAdminProfit(Math.max(0, val - supplierCost));
    setCustomPriceMode(true);
  };

  const handleSelectBuyer = (name: string, id: string = '') => {
    setBuyerName(name);
    setTargetBuyerId(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        isPublished: true,
        adminProfitPerUnit: effectiveProfitPerMT,
        publishedPricePerUnit: currentPublishedPrice,
        targetBuyerName: buyerName.trim() || 'General Marketplace',
        buyerName: buyerName.trim() || 'General Marketplace',
        targetBuyerId: targetBuyerId || undefined,
        adminNotes,
      };

      const res = await api.publishListing(listing.id, true, payload);
      if (res && res.listing) {
        onSuccess(res.listing);
      } else {
        onSuccess({ ...listing, ...payload, isPublished: true, pricePerUnit: currentPublishedPrice });
      }
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to publish listing with profit.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {listing.isPublished ? 'Edit Commercial Spread & Buyer Name' : 'Publish Scrap Lot with Admin Profit'}
              </h2>
              <p className="text-xs text-slate-500">
                Configure broker margin and target buyer before publishing to buyer feeds.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Material Lot Snapshot */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                {listing.commodityCategory}
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {listing.materialName} ({listing.grade})
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {listing.quantity.toLocaleString()} {listing.quantityUnit} &bull; Origin: {listing.countryOfOrigin} &bull; Loading: {listing.portOfShipping}
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Supplier Asking Cost
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                ${supplierCost.toLocaleString()} <span className="text-xs font-normal text-slate-500">USD/{listing.quantityUnit}</span>
              </span>
            </div>
          </div>

          {/* Section 1: Admin Profit Margin Engine */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                Step 1: Set Admin Profit / Mark-Up per {listing.quantityUnit}
              </label>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                +{marginPercentage}% margin
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  Admin Profit Margin ($ / {listing.quantityUnit})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 font-black text-sm">
                    +$
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={adminProfit}
                    onChange={(e) => handleProfitChange(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-hidden focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  Published Price to Buyer ($ / {listing.quantityUnit})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    min={supplierCost}
                    step="1"
                    value={currentPublishedPrice}
                    onChange={(e) => handleCustomPriceChange(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-hidden focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Quick Profit Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium">Quick Spreads:</span>
              {[10, 15, 25, 35, 50, 75].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleProfitChange(amt)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    adminProfit === amt
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  +${amt}
                </button>
              ))}
            </div>

            {/* Live Accrual Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border border-emerald-500/30 grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  Supplier Payout
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                  ${totalSupplierGross.toLocaleString()}
                </span>
              </div>
              <div className="border-x border-emerald-500/20 px-2">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold block">
                  Admin Profit (Yours)
                </span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  +${totalProjectedProfit.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  Buyer Invoiced
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                  ${totalBuyerGross.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Buyer Name Designation */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-blue-500" />
                Step 2: Assign or Show Buyer Name
              </label>
              <span className="text-[11px] text-slate-400">
                Visible on your Admin dashboard
              </span>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">
                Target / Connected Buyer Company Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => {
                    setBuyerName(e.target.value);
                    setTargetBuyerId('');
                  }}
                  placeholder="e.g. Qatar Steel Industries or Doha Steel Works"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium text-sm focus:outline-hidden focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Registered Buyers in DB */}
            {registeredBuyers.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1.5 flex items-center gap-1">
                  <Users className="w-3 h-3 text-blue-500" />
                  Select from Registered Buyers in Platform:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {registeredBuyers.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSelectBuyer(b.companyName || b.name, b.id)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer text-left ${
                        buyerName === (b.companyName || b.name)
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                      }`}
                    >
                      {b.companyName || b.name} ({b.country || 'Verified'})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Suggestions */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                Suggested Industrial Counterparties:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_BUYER_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSelectBuyer(suggestion)}
                    className={`px-2.5 py-1 text-[11px] rounded-lg border transition-all cursor-pointer ${
                      buyerName === suggestion
                        ? 'bg-blue-600 text-white border-blue-600 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Optional Admin Trade Notes */}
          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-1">
              Internal Admin Notes (Private to Admin)
            </label>
            <input
              type="text"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. 100% LC at sight confirmed by QNB; targeted dispatch next week"
              className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Summary Confirmation Banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                Publishing to Buyer <strong>"{buyerName || 'General Marketplace'}"</strong> with profit of <strong>+${effectiveProfitPerMT}/MT</strong> (${totalProjectedProfit.toLocaleString()} total).
              </span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !buyerName.trim()}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                'Processing Publication...'
              ) : listing.isPublished ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save Profit &amp; Buyer
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Approve &amp; Publish with Profit (+${effectiveProfitPerMT}/MT)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
