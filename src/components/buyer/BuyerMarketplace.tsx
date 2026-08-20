import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { COMMODITY_CATEGORIES } from '../../constants/tradeData';
import {
  Boxes,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  Ship,
  DollarSign,
  Package,
  Calendar,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const BuyerMarketplace: React.FC = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Booking / Inquire Modal
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isInquireModalOpen, setIsInquireModalOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    requestedMT: 100,
    targetPrice: 0,
    destinationPort: 'Nhava Sheva Port, India',
    paymentTerms: '100% LC at Sight (Irrevocable)',
    notes: 'We require SGS inspection and prompt container stuffing.',
  });

  const loadMarketplace = async () => {
    try {
      setLoading(true);
      const data = await api.getListings();
      setListings(data);
    } catch (err) {
      console.error('Failed to load marketplace:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplace();
  }, []);

  const handleOpenInquire = (item: any) => {
    setSelectedItem(item);
    setInquiryForm({
      requestedMT: item.quantity,
      targetPrice: item.pricePerUnit,
      destinationPort: 'Nhava Sheva Port, India',
      paymentTerms: '100% LC at Sight (Irrevocable)',
      notes: 'Requesting CIF / CFR quotation for full lot booking.',
    });
    setIsInquireModalOpen(true);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('Purchase Booking Inquiry submitted directly to Al Shaheed Trading Desk! An executive trade manager will reach out with the Proforma & Commercial contract.');
    setIsInquireModalOpen(false);
  };

  const filtered = listings.filter((item) => {
    const matchSearch =
      item.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.commodityCategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = !selectedCategory || item.commodityCategory === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            International Scrap Commodities Marketplace
          </h1>
          <p className="text-xs text-slate-500">
            Browse verified Paper Waste, Ferrous Scrap, Metal Scrap, and Recyclable Materials available for ocean dispatch.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ISRI grade, commodity, scrap specification..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-semibold"
          >
            <option value="">All Commodity Categories</option>
            {COMMODITY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading scrap lots...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Boxes className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No matching scrap lots found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or category selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between hover:border-blue-500/50 hover:shadow-md transition-all group"
            >
              <div>
                {/* Photo & Badge */}
                <div className="relative h-48 bg-slate-100 dark:bg-slate-950 overflow-hidden">
                  <img
                    src={item.photos?.[0]}
                    alt={item.materialName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge status={item.status} size="sm" />
                  </div>
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-slate-950/85 backdrop-blur-xs text-white text-xs font-black">
                    ${item.pricePerUnit}/{item.quantityUnit}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                      {item.commodityCategory}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Al Shaheed Certified
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {item.materialName}
                  </h3>
                  <p className="text-xs text-slate-500">{item.grade}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-2.5">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Volume Available</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {item.quantity.toLocaleString()} {item.quantityUnit}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Loading Port</span>
                      <strong className="text-slate-800 dark:text-slate-200 line-clamp-1">
                        {item.portOfShipping}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Incoterms</span>
                      <strong className="text-slate-800 dark:text-slate-200">{item.incoterms}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Est. Containers</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {item.numberOfContainers || Math.ceil(item.quantity / 25)} x 20ft
                      </strong>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                    {item.qualitySpecification}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 mt-3 pt-3">
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setIsDetailModalOpen(true);
                  }}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  id={`book-lot-${item.id}`}
                  onClick={() => handleOpenInquire(item)}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Book / Inquire Lot &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Full Specs */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedItem?.materialName || 'Scrap Material Lot'}
        subtitle={`Category: ${selectedItem?.commodityCategory} • Grade: ${selectedItem?.grade}`}
        maxWidth="3xl"
      >
        {selectedItem && (
          <div className="space-y-4 text-xs">
            <div className="h-56 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950">
              <img
                src={selectedItem.photos?.[0]}
                alt={selectedItem.materialName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px]">Total Available Volume</span>
                <strong className="text-sm">{selectedItem.quantity} {selectedItem.quantityUnit}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Asking Price</span>
                <strong className="text-sm text-emerald-600 dark:text-emerald-400">
                  ${selectedItem.pricePerUnit}/{selectedItem.quantityUnit}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Port of Loading</span>
                <strong className="text-sm">{selectedItem.portOfShipping}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Incoterms</span>
                <strong className="text-sm">{selectedItem.incoterms}</strong>
              </div>
            </div>

            <div className="space-y-2 text-slate-700 dark:text-slate-300">
              <div><strong>Packaging:</strong> {selectedItem.packaging}</div>
              <div><strong>Payment Terms:</strong> {selectedItem.paymentTerms}</div>
              <div><strong>Quality Inspection:</strong> {selectedItem.qualitySpecification}</div>
              {selectedItem.description && (
                <div><strong>Description:</strong> {selectedItem.description}</div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleOpenInquire(selectedItem);
                }}
                className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl"
              >
                Inquire / Book This Scrap Lot &rarr;
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Book / Inquire */}
      <Modal
        isOpen={isInquireModalOpen}
        onClose={() => setIsInquireModalOpen(false)}
        title={`Inquire / Book Scrap Material`}
        subtitle={`Lot: ${selectedItem?.materialName} (${selectedItem?.quantity} MT @ $${selectedItem?.pricePerUnit}/MT)`}
        maxWidth="lg"
      >
        <form onSubmit={handleInquirySubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Requested Quantity (MT) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={inquiryForm.requestedMT}
                onChange={(e) => setInquiryForm({ ...inquiryForm, requestedMT: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Buying Price ($/MT) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={inquiryForm.targetPrice}
                onChange={(e) => setInquiryForm({ ...inquiryForm, targetPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Discharge Destination Port *
              </label>
              <input
                type="text"
                required
                value={inquiryForm.destinationPort}
                onChange={(e) => setInquiryForm({ ...inquiryForm, destinationPort: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payment Terms Preferred
              </label>
              <input
                type="text"
                value={inquiryForm.paymentTerms}
                onChange={(e) => setInquiryForm({ ...inquiryForm, paymentTerms: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Notes &amp; Delivery Schedule Requirements
            </label>
            <textarea
              rows={2}
              value={inquiryForm.notes}
              onChange={(e) => setInquiryForm({ ...inquiryForm, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsInquireModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
            >
              Submit Commercial Booking Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
