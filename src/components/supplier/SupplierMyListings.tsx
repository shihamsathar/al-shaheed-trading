import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  Boxes,
  Plus,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Ship,
  DollarSign,
  Package,
} from 'lucide-react';

interface SupplierMyListingsProps {
  onNavigate: (tab: string) => void;
}

export const SupplierMyListings: React.FC<SupplierMyListingsProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const loadMyListings = async () => {
    try {
      setLoading(true);
      const data = await api.getListings();
      // Filter for this supplier
      const filtered = data.filter((l) => l.supplierId === user?.id || !l.supplierId);
      setListings(filtered);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyListings();
  }, [user]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            My Scrap Material Inventory
          </h1>
          <p className="text-xs text-slate-500">
            View status of your listed scrap lots, photos, and trade inquiry counts.
          </p>
        </div>

        <button
          onClick={() => onNavigate('supplier-add-listing')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          List New Scrap Lot
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading your inventory...</div>
      ) : listings.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Boxes className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Scrap Lots Listed Yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Upload your paper waste, iron scrap, or recyclable materials to receive international buying inquiries.
          </p>
          <button
            onClick={() => onNavigate('supplier-add-listing')}
            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
          >
            Create Your First Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                {/* Photo & Badge */}
                <div className="relative h-44 bg-slate-100 dark:bg-slate-950 overflow-hidden">
                  <img
                    src={item.photos?.[0] || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'}
                    alt={item.materialName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge status={item.status} size="sm" />
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-xs text-white text-xs font-black">
                    ${item.pricePerUnit}/{item.quantityUnit}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                      {item.commodityCategory}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      {item.materialName}
                    </h3>
                    <p className="text-xs text-slate-500">{item.grade}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-2.5">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Volume</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {item.quantity.toLocaleString()} {item.quantityUnit}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Port</span>
                      <strong className="text-slate-800 dark:text-slate-200 line-clamp-1">
                        {item.portOfShipping}
                      </strong>
                    </div>
                  </div>

                  {item.adminNotes && (
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-600 dark:text-slate-400">
                      <strong>Trade Desk Note:</strong> {item.adminNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-3 pt-3">
                <button
                  onClick={() => {
                    setSelectedListing(item);
                    setIsDetailModalOpen(true);
                  }}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Full Lot Specs
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
        title={selectedListing?.materialName || 'Scrap Lot Specifications'}
        subtitle={`Category: ${selectedListing?.commodityCategory} • Grade: ${selectedListing?.grade}`}
        maxWidth="3xl"
      >
        {selectedListing && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px]">Total Quantity</span>
                <strong className="text-sm">{selectedListing.quantity} {selectedListing.quantityUnit}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Your Asking Price</span>
                <strong className="text-sm text-emerald-600 dark:text-emerald-400">
                  ${selectedListing.pricePerUnit}/{selectedListing.quantityUnit}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Port of Loading</span>
                <strong className="text-sm">{selectedListing.portOfShipping}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Incoterms</span>
                <strong className="text-sm">{selectedListing.incoterms}</strong>
              </div>
            </div>

            <div className="space-y-2 text-slate-700 dark:text-slate-300">
              <div><strong>Packaging:</strong> {selectedListing.packaging}</div>
              <div><strong>Payment Terms:</strong> {selectedListing.paymentTerms}</div>
              <div><strong>Quality Inspection:</strong> {selectedListing.qualitySpecification}</div>
              {selectedListing.description && (
                <div><strong>Description:</strong> {selectedListing.description}</div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
