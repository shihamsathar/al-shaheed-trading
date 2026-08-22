import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { COMMODITY_CATEGORIES, INCOTERMS, DESTINATION_PORTS } from '../../constants/tradeData';
import { PhotoUploader } from '../common/PhotoUploader';
import { BuyerRequirement } from '../../types';
import {
  TrendingUp,
  Plus,
  Ship,
  DollarSign,
  Package,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export const BuyerMyRequirements: React.FC = () => {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [form, setForm] = useState({
    materialName: '',
    commodityCategory: 'Metal Scrap',
    grade: 'ISRI 200-206 (HMS 1&2)',
    requiredQuantity: 500,
    quantityUnit: 'MT',
    targetPricePerUnit: 370,
    currency: 'USD',
    destinationCountry: user?.country || 'India',
    destinationPort: 'Nhava Sheva Port, Mumbai',
    incoterms: 'CFR',
    paymentTerms: '100% Irrevocable LC at Sight',
    urgency: 'HIGH',
    photos: [] as string[],
    notes: 'Looking for prompt shipment. SGS inspection required before loading.',
  });

  const loadReqs = async () => {
    try {
      setLoading(true);
      const data = await api.getRequirements();
      const myReqs = data.filter((r) => r.buyerId === user?.id || !r.buyerId);
      setRequirements(myReqs);
    } catch (err) {
      console.error('Failed to load requirements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReqs();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createRequirement(form);
      setIsCreateModalOpen(false);
      await loadReqs();
      alert('Requirement posted! Al Shaheed matching desk is scanning inventory for matching scrap lots.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            My Buying Demands &amp; Scrap Quotas
          </h1>
          <p className="text-xs text-slate-500">
            Publish your purchasing quotas. Al Shaheed matching algorithm pairs your specifications directly with available scrap.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Post New Buying Demand
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading requirements...</div>
      ) : requirements.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No active buying demands</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Post your required scrap grade, tonnage, target budget, and discharge port to receive matching supply offers.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl"
          >
            Post Buying Demand
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between hover:border-blue-500/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                    {req.commodityCategory}
                  </span>
                  <Badge status={req.status} size="sm" />
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {req.materialName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{req.grade}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Required Volume</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {req.requiredQuantity} {req.quantityUnit}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Target Budget</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      ${req.targetPricePerUnit}/{req.quantityUnit}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Destination Port</span>
                    <strong className="text-slate-800 dark:text-slate-200 line-clamp-1">{req.destinationPort}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Incoterms</span>
                    <strong className="text-slate-800 dark:text-slate-200">{req.incoterms}</strong>
                  </div>
                </div>

                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-600 dark:text-slate-400">
                  Payment: <strong>{req.paymentTerms}</strong>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                Posted: {new Date(req.createdAt).toLocaleDateString()} &bull; Matched by Al Shaheed Desk
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Buying Demand */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Post New Buying Demand Specification"
        subtitle="Al Shaheed matching engine will automatically scan available lots and notify trade agents"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Commodity Category *
              </label>
              <select
                value={form.commodityCategory}
                onChange={(e) => setForm({ ...form, commodityCategory: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              >
                {COMMODITY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Material Title / Requirement *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. HMS 1&2 Heavy Melting Steel Scrap"
                value={form.materialName}
                onChange={(e) => setForm({ ...form, materialName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Required Grade / Specification *
              </label>
              <input
                required
                type="text"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Total Volume Required (MT) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={form.requiredQuantity}
                onChange={(e) => setForm({ ...form, requiredQuantity: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Budget ($/MT) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={form.targetPricePerUnit}
                onChange={(e) => setForm({ ...form, targetPricePerUnit: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-emerald-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Destination Port *
              </label>
              <select
                value={form.destinationPort}
                onChange={(e) => setForm({ ...form, destinationPort: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              >
                {DESTINATION_PORTS.map((dp) => (
                  <option key={dp} value={dp}>
                    {dp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Incoterms Preferred
              </label>
              <select
                value={form.incoterms}
                onChange={(e) => setForm({ ...form, incoterms: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              >
                {INCOTERMS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payment Terms
              </label>
              <input
                type="text"
                value={form.paymentTerms}
                onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
            <PhotoUploader
              photos={form.photos}
              onChange={(newPhotos) => setForm({ ...form, photos: newPhotos })}
              label="Reference Sample / Quality Photos (Optional)"
              subtitle="Add benchmark scrap grade photos from camera, desktop, or library"
              maxPhotos={6}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Commercial Notes &amp; Quality Tolerance
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
            >
              Publish Buying Demand
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
