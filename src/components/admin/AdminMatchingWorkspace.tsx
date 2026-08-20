import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { MatchResult } from '../../types';
import {
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Ship,
  DollarSign,
  Package,
  Calendar,
  AlertCircle,
  Users,
  ChevronRight,
  TrendingUp,
  Award,
} from 'lucide-react';

export const AdminMatchingWorkspace: React.FC = () => {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [aiAnalysis, setAiAnalysis] = useState<{
    insight: string;
    confidence: number;
    recommendation: string;
  } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Deal creation modal
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [dealForm, setDealForm] = useState({
    dealType: 'DIRECT_TRADING',
    quantity: 0,
    purchasePricePerUnit: 0,
    sellingPricePerUnit: 0,
    freightCost: 2500,
    inspectionCost: 650,
    agentId: '',
    agentRatePerTon: 15,
    incoterms: 'CFR',
  });

  const loadMatches = async () => {
    try {
      setLoading(true);
      const [matchData, agentData] = await Promise.all([api.getMatches(), api.getAgents()]);
      setMatches(matchData);
      setAgents(agentData);
      if (matchData.length > 0) {
        setSelectedMatch(matchData[0]);
        triggerAiAnalysis(matchData[0].listingId, matchData[0].requirementId);
      }
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const triggerAiAnalysis = async (listingId: string, reqId: string) => {
    try {
      setLoadingAi(true);
      const result = await api.analyzeMatchAI(listingId, reqId);
      setAiAnalysis(result);
    } catch (err) {
      console.error('AI match analysis failed:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSelectMatch = (m: MatchResult) => {
    setSelectedMatch(m);
    triggerAiAnalysis(m.listingId, m.requirementId);
  };

  // Open deal modal
  const handleOpenDealModal = () => {
    if (!selectedMatch) return;
    const l = selectedMatch.listing;
    const r = selectedMatch.requirement;
    const dealQty = Math.min(l.quantity, r.requiredQuantity);
    const pPrice = l.pricePerUnit;
    const sPrice = r.targetPricePerUnit || pPrice + 25;

    setDealForm({
      dealType: 'DIRECT_TRADING',
      quantity: dealQty,
      purchasePricePerUnit: pPrice,
      sellingPricePerUnit: sPrice,
      freightCost: 2800,
      inspectionCost: 750,
      agentId: agents[0]?.id || '',
      agentRatePerTon: 15,
      incoterms: r.incoterms || l.incoterms || 'CFR',
    });
    setIsDealModalOpen(true);
  };

  const handleCreateDealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;

    try {
      await api.createDealFromMatch({
        listingId: selectedMatch.listingId,
        requirementId: selectedMatch.requirementId,
        ...dealForm,
      });
      alert('Deal successfully created and entered into transaction pipeline!');
      setIsDealModalOpen(false);
      await loadMatches();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Financial calculations for deal modal
  const totalPurchase = dealForm.quantity * dealForm.purchasePricePerUnit;
  const totalSales = dealForm.quantity * dealForm.sellingPricePerUnit;
  const totalAgentComm = dealForm.dealType === 'AGENT_TRADING' ? dealForm.quantity * dealForm.agentRatePerTon : 0;
  const grossMargin = totalSales - totalPurchase - Number(dealForm.freightCost) - Number(dealForm.inspectionCost);
  const netMargin = grossMargin - totalAgentComm;

  const filteredMatches = matches.filter((m) => {
    if (filterCategory === 'ALL') return true;
    return m.category === filterCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Automated Multi-Factor Matching Desk
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Trade Matching Workspace</h1>
          <p className="text-xs text-slate-300 mt-1">
            Split-screen commercial evaluation, AI arbitrage verification, and 1-click deal creation.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
          {[
            { id: 'ALL', label: `All (${matches.length})` },
            { id: 'EXCELLENT', label: `Excellent 90%+ (${matches.filter((m) => m.category === 'EXCELLENT').length})` },
            { id: 'STRONG', label: `Strong 75-89% (${matches.filter((m) => m.category === 'STRONG').length})` },
            { id: 'POSSIBLE', label: `Possible (${matches.filter((m) => m.category === 'POSSIBLE').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterCategory === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3" />
          Analyzing supply and demand pairing vectors...
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <Layers className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No active matches found</h3>
          <p className="text-xs text-slate-500 mt-1">
            New matches will automatically appear as suppliers list scrap and buyers submit demands.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Match Candidates List (4 Cols) */}
          <div className="lg:col-span-4 space-y-3 max-h-[85vh] overflow-y-auto pr-1">
            {filteredMatches.map((m) => {
              const isSelected = selectedMatch?.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => handleSelectMatch(m)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-400/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                        {m.listing.commodityCategory}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {m.listing.materialName}
                      </h4>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-extrabold shrink-0 ${
                        m.overallScore >= 90
                          ? 'bg-emerald-100 text-emerald-800'
                          : m.overallScore >= 75
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {m.overallScore}%
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-2">
                    <div>
                      Supply: <strong className="text-slate-800 dark:text-slate-200">{m.listing.quantity} MT</strong>
                    </div>
                    <div>
                      Demand: <strong className="text-slate-800 dark:text-slate-200">{m.requirement.requiredQuantity} MT</strong>
                    </div>
                    <div>
                      Ask: <strong>${m.listing.pricePerUnit}</strong>
                    </div>
                    <div>
                      Target: <strong>${m.requirement.targetPricePerUnit}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Split-Screen Comparison & AI Engine (8 Cols) */}
          {selectedMatch && (
            <div className="lg:col-span-8 space-y-6">
              {/* Top Match Score & Action Ribbon */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex flex-col items-center justify-center font-black shadow-md shadow-emerald-950/20">
                    <span className="text-xl leading-none">{selectedMatch.overallScore}%</span>
                    <span className="text-[9px] uppercase font-bold tracking-tight mt-0.5">Match</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Commercial Alignment: {selectedMatch.category}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Multi-factor logistics, grade, pricing, and container sizing validated.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="create-deal-from-match-btn"
                    onClick={handleOpenDealModal}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Create Transaction Deal
                  </button>
                </div>
              </div>

              {/* Gemini AI Commercial Trade Insight Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950 text-white border border-emerald-800/40 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      Gemini Commercial Trading Analyst Insight
                    </span>
                  </div>
                  {aiAnalysis?.confidence && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                      {aiAnalysis.confidence}% Confidence
                    </span>
                  )}
                </div>

                {loadingAi ? (
                  <p className="text-xs text-slate-400 italic">Analyzing trade margins and shipping routes...</p>
                ) : (
                  <div className="space-y-1.5 text-xs text-slate-200">
                    <p className="leading-relaxed">{aiAnalysis?.insight}</p>
                    <p className="text-emerald-300 font-semibold flex items-center gap-1 mt-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Recommended Desk Action: {aiAnalysis?.recommendation}
                    </p>
                  </div>
                )}
              </div>

              {/* Split Screen Panels: Supplier vs Buyer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Panel: Supplier Listing */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      Supplier Supply Side
                    </span>
                    <Badge status={selectedMatch.listing.status} size="sm" />
                  </div>

                  <div className="h-36 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950">
                    <img
                      src={selectedMatch.listing.photos?.[0]}
                      alt="Scrap Lot"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {selectedMatch.listing.materialName}
                    </div>
                    <div className="text-slate-500">Grade: {selectedMatch.listing.grade}</div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Quantity</span>
                        <strong>{selectedMatch.listing.quantity} MT</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Asking Price</span>
                        <strong className="text-emerald-600 dark:text-emerald-400">
                          ${selectedMatch.listing.pricePerUnit}/MT
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Loading Port</span>
                        <strong>{selectedMatch.listing.portOfShipping}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Incoterms</span>
                        <strong>{selectedMatch.listing.incoterms}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Supplier Confidential Notice */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                    Supplier: <strong className="text-purple-700 dark:text-purple-400">{selectedMatch.listing.supplierCompanyName}</strong> ({selectedMatch.listing.supplierCountry})
                  </div>
                </div>

                {/* Right Panel: Buyer Requirement */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Buyer Demand Side
                    </span>
                    <Badge status={selectedMatch.requirement.status} size="sm" />
                  </div>

                  <div className="h-36 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 p-4 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                      Target Destination
                    </span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {selectedMatch.requirement.destinationPort}
                    </div>
                    <div className="text-xs text-slate-500">
                      Country: {selectedMatch.requirement.destinationCountry}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {selectedMatch.requirement.materialName}
                    </div>
                    <div className="text-slate-500">Grade Required: {selectedMatch.requirement.grade}</div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Required Volume</span>
                        <strong>{selectedMatch.requirement.requiredQuantity} MT</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Target Budget</span>
                        <strong className="text-blue-600 dark:text-blue-400">
                          ${selectedMatch.requirement.targetPricePerUnit}/MT
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Destination Port</span>
                        <strong className="line-clamp-1">{selectedMatch.requirement.destinationPort}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Payment Terms</span>
                        <strong className="line-clamp-1">{selectedMatch.requirement.paymentTerms}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Buyer Confidential Notice */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                    Buyer: <strong className="text-blue-700 dark:text-blue-400">{selectedMatch.requirement.buyerCompanyName}</strong> ({selectedMatch.requirement.buyerCountry})
                  </div>
                </div>
              </div>

              {/* Match Factors Breakdown Score Grid */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Algorithmic Score Breakdown
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Commodity Match', score: selectedMatch.breakdown.commodity },
                    { label: 'Grade & Quality', score: selectedMatch.breakdown.grade },
                    { label: 'Quantity Scale', score: selectedMatch.breakdown.quantity },
                    { label: 'Price Viability', score: selectedMatch.breakdown.price },
                    { label: 'Destination Logistics', score: selectedMatch.breakdown.destination },
                    { label: 'Delivery Window', score: selectedMatch.breakdown.delivery },
                    { label: 'Packaging Specs', score: selectedMatch.breakdown.packaging },
                    { label: 'Incoterms Align', score: selectedMatch.breakdown.incoterms },
                  ].map((factor, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600 dark:text-slate-400">{factor.label}</span>
                        <span
                          className={
                            factor.score >= 90
                              ? 'text-emerald-600 font-black'
                              : factor.score >= 70
                              ? 'text-blue-600 font-bold'
                              : 'text-amber-600 font-bold'
                          }
                        >
                          {factor.score}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            factor.score >= 90 ? 'bg-emerald-500' : factor.score >= 70 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${factor.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Create Transaction Deal */}
      <Modal
        isOpen={isDealModalOpen}
        onClose={() => setIsDealModalOpen(false)}
        title="Execute Commercial Deal Transaction"
        subtitle={`Deal Initiation: ${selectedMatch?.listing.materialName}`}
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateDealSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Deal Structure *
              </label>
              <select
                value={dealForm.dealType}
                onChange={(e) => setDealForm({ ...dealForm, dealType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              >
                <option value="DIRECT_TRADING">Direct Principal Trading (Al Shaheed Acts as Principal)</option>
                <option value="AGENT_TRADING">Agent Brokerage Trading ($/MT Commission)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Transaction Volume (MT) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={dealForm.quantity}
                onChange={(e) => setDealForm({ ...dealForm, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Purchase Price from Supplier ($/MT) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={dealForm.purchasePricePerUnit}
                onChange={(e) => setDealForm({ ...dealForm, purchasePricePerUnit: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Selling Price to Buyer ($/MT) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={dealForm.sellingPricePerUnit}
                onChange={(e) => setDealForm({ ...dealForm, sellingPricePerUnit: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-emerald-600"
              />
            </div>
          </div>

          {dealForm.dealType === 'AGENT_TRADING' && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-amber-900 dark:text-amber-300 mb-1">
                    Assign Certified Agent
                  </label>
                  <select
                    value={dealForm.agentId}
                    onChange={(e) => setDealForm({ ...dealForm, agentId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white dark:bg-slate-900"
                  >
                    {agents.map((ag) => (
                      <option key={ag.id} value={ag.id}>
                        {ag.name} ({ag.country})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-amber-900 dark:text-amber-300 mb-1">
                    Agent Commission ($/MT)
                  </label>
                  <input
                    type="number"
                    value={dealForm.agentRatePerTon}
                    onChange={(e) => setDealForm({ ...dealForm, agentRatePerTon: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white dark:bg-slate-900 font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Real-time Commercial Arbitrage & Margin Calculator */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              Commercial Deal Economics &amp; Gross Margin Projection
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div>
                <span className="text-slate-400 block text-[10px]">Total Purchase Value</span>
                <strong className="text-sm font-black">${totalPurchase.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Total Sales Value</span>
                <strong className="text-sm font-black text-emerald-400">
                  ${totalSales.toLocaleString()}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Gross Arbitrage Spread</span>
                <strong className="text-sm font-black text-emerald-300">
                  +${grossMargin.toLocaleString()}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Net Company Margin</span>
                <strong className="text-sm font-black text-emerald-200">
                  +${netMargin.toLocaleString()}
                </strong>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsDealModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              Execute Deal &amp; Lock Terms
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
