import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { BuyerRequirement } from '../../types';
import {
  TrendingUp,
  Search,
  Ship,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Package,
} from 'lucide-react';

export const SupplierDemandFeed: React.FC = () => {
  const [demands, setDemands] = useState<BuyerRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDemand, setSelectedDemand] = useState<BuyerRequirement | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const [offerForm, setOfferForm] = useState({
    offeredPrice: 340,
    availableQuantityMT: 200,
    loadingPort: 'Hamad Port (Doha)',
    notes: 'Material is ready in yard for immediate stuffing upon LC confirmation.',
  });

  const loadDemands = async () => {
    try {
      setLoading(true);
      const data = await api.getRequirements();
      setDemands(data);
    } catch (err) {
      console.error('Failed to load demands:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDemands();
  }, []);

  const handleOpenOfferModal = (req: BuyerRequirement) => {
    setSelectedDemand(req);
    setOfferForm({
      offeredPrice: req.targetPricePerUnit,
      availableQuantityMT: req.requiredQuantity,
      loadingPort: 'Hamad Port (Doha)',
      notes: 'Available for prompt shipment with standard SGS inspection.',
    });
    setIsOfferModalOpen(true);
  };

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('Offer successfully submitted to Al Shaheed Trading Desk! The admin desk will review and match your supply.');
    setIsOfferModalOpen(false);
  };

  const filtered = demands.filter((d) =>
    d.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.commodityCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.destinationPort.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Live Global Buyer Demands &amp; Inquiries
          </h1>
          <p className="text-xs text-slate-500">
            Verified international buyers with open purchasing quotas mediated by Al Shaheed.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter demand by commodity, grade, or destination port..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-800 dark:text-slate-200"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((d) => (
          <div
            key={d.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between hover:border-blue-500/40 transition-all"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                  {d.commodityCategory}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold">
                  Verified Quota
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {d.materialName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{d.grade}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Required Volume</span>
                  <strong className="text-slate-800 dark:text-slate-200">{d.requiredQuantity} {d.quantityUnit}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Target Budget</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    ${d.targetPricePerUnit}/{d.quantityUnit}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Destination</span>
                  <strong className="text-slate-800 dark:text-slate-200 line-clamp-1">{d.destinationPort}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Incoterms</span>
                  <strong className="text-slate-800 dark:text-slate-200">{d.incoterms}</strong>
                </div>
              </div>

              <div className="mt-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-500">
                Payment: <strong>{d.paymentTerms}</strong>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleOpenOfferModal(d)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                Submit Supply Offer &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Submit Supply Offer */}
      <Modal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        title={`Submit Supply Offer to Al Shaheed Desk`}
        subtitle={`Target Demand: ${selectedDemand?.materialName} (${selectedDemand?.requiredQuantity} MT)`}
        maxWidth="md"
      >
        <form onSubmit={handleOfferSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Offer Price ($ USD / MT) *
              </label>
              <input
                type="number"
                required
                value={offerForm.offeredPrice}
                onChange={(e) => setOfferForm({ ...offerForm, offeredPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-emerald-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Quantity Available (MT) *
              </label>
              <input
                type="number"
                required
                value={offerForm.availableQuantityMT}
                onChange={(e) => setOfferForm({ ...offerForm, availableQuantityMT: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Loading Port
            </label>
            <input
              type="text"
              value={offerForm.loadingPort}
              onChange={(e) => setOfferForm({ ...offerForm, loadingPort: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Supplier Notes &amp; Lead Time
            </label>
            <textarea
              rows={2}
              value={offerForm.notes}
              onChange={(e) => setOfferForm({ ...offerForm, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOfferModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
            >
              Submit Offer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
