import React, { useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { COMMODITY_CATEGORIES, INCOTERMS, PORTS_OF_SHIPPING } from '../../constants/tradeData';
import { PhotoUploader } from '../common/PhotoUploader';
import {
  PlusCircle,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  Ship,
  DollarSign,
  Package,
} from 'lucide-react';

interface SupplierAddListingProps {
  onNavigate: (tab: string) => void;
}

export const SupplierAddListing: React.FC<SupplierAddListingProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [form, setForm] = useState({
    materialName: '',
    commodityCategory: 'Metal Scrap',
    scrapType: 'Ferrous Scrap',
    grade: 'ISRI 200-206 (Heavy Melting Steel 1&2 80:20)',
    quantity: 250,
    quantityUnit: 'MT',
    numberOfContainers: 10,
    pricePerUnit: 345,
    currency: 'USD',
    countryOfOrigin: user?.country || 'Qatar',
    loadingLocation: 'Industrial Area Depot, Street 24',
    portOfShipping: 'Hamad Port (Doha)',
    destinationPort: '',
    packaging: 'Loose in 20ft Dry Cargo Container (Approx 25-28 MT)',
    qualitySpecification: 'Free from mud, radioactive matter, closed containers and combustibles. SGS Inspected.',
    inspectionAvailable: true,
    minOrderQuantity: 25,
    paymentTerms: '100% LC at Sight (Irrevocable & Confirmed)',
    incoterms: 'CFR',
    photos: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    ],
    description: 'Clean industrial scrap sourced from structural demolition and oilfield dismantling. Ready for prompt stuffing and export shipping.',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createListing(form);
      setSuccess(true);
      setTimeout(() => {
        onNavigate('supplier-listings');
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to list scrap material');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          List New Industrial Scrap Material Lot
        </h1>
        <p className="text-xs text-slate-500">
          Upload scrap lots with high-resolution photos, ISRI grades, loading port, and commercial parameters.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <strong className="block text-sm font-bold">Scrap Material Successfully Listed!</strong>
            <span className="text-xs">
              Al Shaheed trading desk has notified active buyers and matching agents. Redirecting to your inventory...
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Material Identification */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Package className="w-4 h-4 text-emerald-600" />
            1. Material Classification &amp; Grade
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Commodity Category *
              </label>
              <select
                value={form.commodityCategory}
                onChange={(e) => setForm({ ...form, commodityCategory: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
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
                Commercial Material Title *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. HMS 1&2 (80:20) Heavy Melting Steel Scrap"
                value={form.materialName}
                onChange={(e) => setForm({ ...form, materialName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                ISRI Specification / Grade *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. ISRI 200-206 / OCC Grade 11"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Scrap Sub-Type / Origin Description
              </label>
              <input
                type="text"
                value={form.scrapType}
                onChange={(e) => setForm({ ...form, scrapType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Volume & Commercial Pricing */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            2. Volume, Asking Price &amp; Containerization
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Available Total Quantity (MT) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={form.quantity}
                onChange={(e) => {
                  const qty = Number(e.target.value);
                  setForm({
                    ...form,
                    quantity: qty,
                    numberOfContainers: Math.ceil(qty / 25),
                  });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Asking Price ($ USD / MT) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={form.pricePerUnit}
                onChange={(e) => setForm({ ...form, pricePerUnit: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-emerald-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Estimated Container Count (20ft)
              </label>
              <input
                type="number"
                value={form.numberOfContainers}
                onChange={(e) => setForm({ ...form, numberOfContainers: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Port of Shipping & Logistics */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Ship className="w-4 h-4 text-emerald-600" />
            3. Port of Shipping &amp; Logistics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Port of Shipping *
              </label>
              <select
                value={form.portOfShipping}
                onChange={(e) => setForm({ ...form, portOfShipping: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              >
                {PORTS_OF_SHIPPING.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Incoterms Offered *
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
                Payment Terms Preferred
              </label>
              <input
                type="text"
                value={form.paymentTerms}
                onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Packaging &amp; Stuffing Specification
            </label>
            <input
              type="text"
              value={form.packaging}
              onChange={(e) => setForm({ ...form, packaging: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>
        </div>

        {/* Section 4: Material Photo Uploads (Multi-Image) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <PhotoUploader
            photos={form.photos}
            onChange={(newPhotos) => setForm({ ...form, photos: newPhotos })}
            label="4. Material & Scrap Lot Photos"
            subtitle="Take high-res photos using your phone camera, upload from desktop, drag & drop, or choose from Al Shaheed scrap presets"
            required={true}
            maxPhotos={10}
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => onNavigate('supplier-listings')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 font-semibold text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {submitting ? 'Submitting to Al Shaheed...' : 'Publish Scrap Lot to Marketplace'}
          </button>
        </div>
      </form>
    </div>
  );
};
