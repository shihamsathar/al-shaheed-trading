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
  Ship,
  Package,
  Boxes,
  Percent,
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
  const [registeredAgents, setRegisteredAgents] = useState<any[]>([]);
  
  // 4 Cost Components + Final Selling Price
  const [materialCost, setMaterialCost] = useState<number>(300);
  const [exportCost, setExportCost] = useState<number>(20);
  const [agentCommission, setAgentCommission] = useState<number>(10);
  const [adminProfit, setAdminProfit] = useState<number>(25);
  const [sellingPrice, setSellingPrice] = useState<number>(355);

  // Counterparty: Buyer & Agent
  const [buyerName, setBuyerName] = useState<string>('');
  const [targetBuyerId, setTargetBuyerId] = useState<string>('');
  const [assignedAgentId, setAssignedAgentId] = useState<string>('');
  const [assignedAgentName, setAssignedAgentName] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && listing) {
      const mat = Number(listing.materialCostPerUnit ?? listing.supplierPricePerUnit ?? listing.pricePerUnit ?? 300);
      const exp = Number(listing.exportCostPerUnit ?? 20);
      const agt = Number(listing.agentCommissionPerUnit ?? listing.agentRatePerTon ?? 10);
      const prf = Number(listing.adminProfitPerUnit ?? 25);
      
      const calculatedSelling = mat + exp + agt + prf;
      const initialSelling = (listing.isPublished && listing.sellingPricePerUnit) 
        ? Number(listing.sellingPricePerUnit) 
        : (listing.isPublished && listing.pricePerUnit && listing.pricePerUnit > mat)
        ? Number(listing.pricePerUnit)
        : calculatedSelling;

      setMaterialCost(mat);
      setExportCost(exp);
      setAgentCommission(agt);
      setAdminProfit(prf);
      setSellingPrice(initialSelling);

      setBuyerName(listing.targetBuyerName || listing.buyerName || '');
      setTargetBuyerId(listing.targetBuyerId || '');
      setAssignedAgentId(listing.assignedAgentId || '');
      setAssignedAgentName(listing.assignedAgentName || '');
      setAdminNotes(listing.adminNotes || '');

      // Load registered buyers & agents from server
      api.getBuyers().then((buyers) => {
        if (Array.isArray(buyers)) {
          setRegisteredBuyers(buyers);
        }
      }).catch(() => {});

      api.getAgents().then((agents) => {
        if (Array.isArray(agents)) {
          setRegisteredAgents(agents);
        }
      }).catch(() => {});
    }
  }, [isOpen, listing]);

  if (!isOpen || !listing) return null;

  const quantity = listing.quantity || 1;
  const unit = listing.quantityUnit || 'MT';

  // Component handlers
  const handleMaterialChange = (val: number) => {
    const v = Math.max(0, val);
    setMaterialCost(v);
    setSellingPrice(v + exportCost + agentCommission + adminProfit);
  };

  const handleExportChange = (val: number) => {
    const v = Math.max(0, val);
    setExportCost(v);
    setSellingPrice(materialCost + v + agentCommission + adminProfit);
  };

  const handleAgentCommissionChange = (val: number) => {
    const v = Math.max(0, val);
    setAgentCommission(v);
    setSellingPrice(materialCost + exportCost + v + adminProfit);
  };

  const handleProfitChange = (val: number) => {
    const v = Math.max(0, val);
    setAdminProfit(v);
    setSellingPrice(materialCost + exportCost + agentCommission + v);
  };

  const handleSellingPriceChange = (val: number) => {
    const v = Math.max(0, val);
    setSellingPrice(v);
    const baseSum = materialCost + exportCost + agentCommission;
    setAdminProfit(Math.max(0, v - baseSum));
  };

  const handleSelectBuyer = (name: string, id: string = '') => {
    setBuyerName(name);
    setTargetBuyerId(id);
  };

  // Totals
  const totalMaterialCost = materialCost * quantity;
  const totalExportCost = exportCost * quantity;
  const totalAgentCommission = agentCommission * quantity;
  const totalAdminProfit = adminProfit * quantity;
  const totalSellingPrice = sellingPrice * quantity;

  const profitMarginPct = sellingPrice > 0 ? ((adminProfit / sellingPrice) * 100).toFixed(1) : '0.0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        isPublished: true,
        materialCostPerUnit: materialCost,
        exportCostPerUnit: exportCost,
        agentCommissionPerUnit: agentCommission,
        adminProfitPerUnit: adminProfit,
        sellingPricePerUnit: sellingPrice,
        publishedPricePerUnit: sellingPrice,
        targetBuyerName: buyerName.trim() || 'General Marketplace',
        buyerName: buyerName.trim() || 'General Marketplace',
        targetBuyerId: targetBuyerId || undefined,
        assignedAgentId: assignedAgentId || undefined,
        assignedAgentName: assignedAgentName || undefined,
        adminNotes,
      };

      const res = await api.publishListing(listing.id, true, payload);
      if (res && res.listing) {
        onSuccess(res.listing);
      } else {
        onSuccess({
          ...listing,
          ...payload,
          isPublished: true,
          supplierPricePerUnit: materialCost,
          pricePerUnit: sellingPrice,
        });
      }
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to publish listing with commercial terms.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {listing.isPublished ? 'Commercial Pricing & Counterparty Desk' : 'Publish Scrap Lot with Trade Pricing'}
              </h2>
              <p className="text-xs text-slate-500">
                Configure Material Cost, Export Logistics, Agent Fee, Admin Profit, and Selling Price.
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
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
                {quantity.toLocaleString()} {unit} &bull; Origin: {listing.countryOfOrigin} &bull; Port: {listing.portOfShipping}
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Supplier Confidential Yard
              </span>
              <span className="text-xs font-bold text-purple-700 dark:text-purple-400">
                {listing.supplierCompanyName || 'Qatar Scrap Supplier'}
              </span>
            </div>
          </div>

          {/* Section 1: Complete Commercial Costing Engine */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Calculator className="w-4 h-4 text-emerald-500" />
                Step 1: Commercial Cost Breakdown &amp; Selling Price ({listing.currency || 'USD'} / {unit})
              </label>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {profitMarginPct}% net margin
              </span>
            </div>

            {/* 4 Line-Item Cost Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Material Cost */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                  <Boxes className="w-3.5 h-3.5 text-blue-500" />
                  Material Cost
                </label>
                <div className="relative mb-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={materialCost}
                    onChange={(e) => handleMaterialChange(Number(e.target.value))}
                    className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>Supplier Cost:</span>
                  <span className="font-mono font-semibold">${totalMaterialCost.toLocaleString()}</span>
                </div>
              </div>

              {/* 2. Export Cost */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                  <Ship className="w-3.5 h-3.5 text-amber-500" />
                  Export Cost
                </label>
                <div className="relative mb-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={exportCost}
                    onChange={(e) => handleExportChange(Number(e.target.value))}
                    className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {[0, 15, 25, 40].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleExportChange(v)}
                      className={`text-[9px] px-1.5 py-0.5 rounded cursor-pointer ${
                        exportCost === v ? 'bg-amber-600 text-white font-bold' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      ${v}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Agent Commission */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                  <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                  Agent Commission
                </label>
                <div className="relative mb-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={agentCommission}
                    onChange={(e) => handleAgentCommissionChange(Number(e.target.value))}
                    className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-hidden focus:border-purple-500"
                  />
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {[0, 5, 10, 15].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleAgentCommissionChange(v)}
                      className={`text-[9px] px-1.5 py-0.5 rounded cursor-pointer ${
                        agentCommission === v ? 'bg-purple-600 text-white font-bold' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      ${v}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Admin Profit */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800">
                <label className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  Admin Profit
                </label>
                <div className="relative mb-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-mono font-bold text-xs">+$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={adminProfit}
                    onChange={(e) => handleProfitChange(Number(e.target.value))}
                    className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-mono font-black text-xs focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {[15, 25, 35, 50].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleProfitChange(v)}
                      className={`text-[9px] px-1.5 py-0.5 rounded cursor-pointer ${
                        adminProfit === v ? 'bg-emerald-600 text-white font-bold' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      +${v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selling Price Box (Sum of all 4) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                      Final Selling Price to Buyer
                    </span>
                    <span className="text-[11px] text-slate-300">
                      (Invoiced contract rate)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Formula: Material (${materialCost}) + Export (${exportCost}) + Agent (${agentCommission}) + Profit (${adminProfit})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-44">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-base">$</span>
                    <input
                      type="number"
                      min={materialCost}
                      step="1"
                      required
                      value={sellingPrice}
                      onChange={(e) => handleSellingPriceChange(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-black text-lg focus:outline-hidden focus:border-emerald-400 transition-colors"
                    />
                  </div>
                  <span className="text-xs text-slate-400 font-mono">USD/{unit}</span>
                </div>
              </div>
            </div>

            {/* Full Financial Waterfall Distribution Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Material Payout
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                  ${totalMaterialCost.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">(${materialCost}/MT)</span>
              </div>
              <div>
                <span className="text-[10px] text-amber-500 uppercase font-semibold block">
                  Export Freight
                </span>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 font-mono">
                  ${totalExportCost.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">(${exportCost}/MT)</span>
              </div>
              <div>
                <span className="text-[10px] text-purple-500 uppercase font-semibold block">
                  Agent Commission
                </span>
                <span className="text-xs font-bold text-purple-700 dark:text-purple-400 font-mono">
                  ${totalAgentCommission.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">(${agentCommission}/MT)</span>
              </div>
              <div className="border-x border-slate-200 dark:border-slate-800 px-1 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-black block">
                  Admin Net Profit
                </span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  +${totalAdminProfit.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-600 block font-mono">(+${adminProfit}/MT)</span>
              </div>
              <div>
                <span className="text-[10px] text-blue-500 uppercase font-bold block">
                  Total Buyer Invoice
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                  ${totalSellingPrice.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">(${sellingPrice}/MT)</span>
              </div>
            </div>
          </div>

          {/* Section 2: Simultaneous Counterparty Assignment (Buyer and Agent at a time) */}
          <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Users className="w-4 h-4 text-purple-500" />
                Step 2: Assign Buyer and Broker Agent at a Time
              </label>
              <span className="text-[11px] text-emerald-500 font-semibold">
                Simultaneous Counterparty Binding
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Assigned Broker Agent */}
              <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-800/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Assigned Sourcing / Broker Agent
                  </span>
                  <span className="text-[10px] font-mono text-purple-300">
                    Commission: ${agentCommission}/MT (${totalAgentCommission.toLocaleString()})
                  </span>
                </div>

                <select
                  value={assignedAgentId}
                  onChange={(e) => {
                    const selId = e.target.value;
                    setAssignedAgentId(selId);
                    const found = registeredAgents.find((a) => a.id === selId);
                    setAssignedAgentName(found ? found.name : '');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-hidden focus:border-purple-400"
                >
                  <option value="">-- Open to All Agents / Al Shaheed Desk --</option>
                  {registeredAgents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name} ({ag.companyName || 'Broker Agent'} • {ag.country || 'Qatar'})
                    </option>
                  ))}
                </select>

                {assignedAgentId && (
                  <div className="p-2 rounded-xl bg-purple-900/30 border border-purple-700/40 text-[11px] text-purple-200 flex items-center justify-between">
                    <span>Broker: <strong>{assignedAgentName}</strong></span>
                    <span className="font-mono text-emerald-400 font-bold">Auto-syncs to Agent desk</span>
                  </div>
                )}
              </div>

              {/* Right Column: Designated Buyer */}
              <div className="p-3.5 rounded-2xl bg-blue-950/20 border border-blue-800/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    Designated Buyer Company Name
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Target Importer
                  </span>
                </div>

                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => {
                    setBuyerName(e.target.value);
                    setTargetBuyerId('');
                  }}
                  placeholder="e.g. Qatar Steel Industries or Nhava Sheva Importer"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-hidden focus:border-blue-400"
                />

                {registeredBuyers.length > 0 && (
                  <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                    {registeredBuyers.slice(0, 4).map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleSelectBuyer(b.companyName || b.name, b.id)}
                        className={`px-2 py-0.5 text-[10px] rounded-md border transition-all cursor-pointer ${
                          buyerName === (b.companyName || b.name)
                            ? 'bg-blue-600 text-white border-blue-600 font-bold'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-blue-400'
                        }`}
                      >
                        {b.companyName || b.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Popular Buyer Suggestions */}
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
              placeholder="e.g. LC at sight approved; export container stuffing scheduled at Hamad Port"
              className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Summary Confirmation Banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                Selling to <strong>"{buyerName || 'General Marketplace'}"</strong> @ <strong>${sellingPrice}/MT</strong>. Net Admin Profit: <strong>+${adminProfit}/MT</strong> (${totalAdminProfit.toLocaleString()}).
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
                'Saving Pricing Terms...'
              ) : listing.isPublished ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Update Commercial Pricing &amp; Buyer
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Approve &amp; Publish with Pricing
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
