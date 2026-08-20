import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { COMMODITY_CATEGORIES, INCOTERMS, PORTS_OF_SHIPPING } from '../../constants/tradeData';
import {
  Boxes,
  Search,
  Filter,
  Plus,
  Eye,
  ArrowLeftRight,
  Users,
  CheckCircle2,
  AlertCircle,
  Building2,
  DollarSign,
  MapPin,
  Ship,
  Image as ImageIcon,
  Check,
  Tag,
} from 'lucide-react';

export const AdminMarketplace: React.FC = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAssignAgentModalOpen, setIsAssignAgentModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isCreateListingModalOpen, setIsCreateListingModalOpen] = useState(false);

  // Form states
  const [agentForm, setAgentForm] = useState({
    agentId: '',
    quantityMT: 0,
    agentRatePerTon: 15,
    targetSalesPrice: 0,
    commercialTerms: '',
  });

  const [statusForm, setStatusForm] = useState({
    status: 'AVAILABLE',
    adminNotes: '',
  });

  const [newListingForm, setNewListingForm] = useState({
    materialName: '',
    commodityCategory: 'Metal Scrap',
    grade: '',
    quantity: 100,
    pricePerUnit: 350,
    currency: 'USD',
    countryOfOrigin: 'Qatar',
    portOfShipping: 'Hamad Port (Doha)',
    destinationPort: 'Nhava Sheva (JNPT Mumbai)',
    packaging: 'Loose in 20ft Dry Cargo Container (Approx 25-28 MT)',
    incoterms: 'CFR',
    paymentTerms: '100% LC at Sight (Irrevocable & Confirmed)',
    photos: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    ],
    description: '',
    supplierCompanyName: 'Al Shaheed Yard Supply',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [list, agts] = await Promise.all([
        api.getListings({ category: selectedCategory, status: selectedStatus, search: searchTerm }),
        api.getAgents(),
      ]);
      setListings(list);
      setAgents(agts);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedStatus, searchTerm]);

  // Open Agent Modal
  const handleOpenAssignAgent = (listing: any) => {
    setSelectedListing(listing);
    setAgentForm({
      agentId: agents[0]?.id || '',
      quantityMT: listing.quantity,
      agentRatePerTon: listing.agentRatePerTon || 15,
      targetSalesPrice: listing.pricePerUnit + 25,
      commercialTerms: 'Exclusive commercial terms. Target sales window 14 days.',
    });
    setIsAssignAgentModalOpen(true);
  };

  const handleAssignAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing || !agentForm.agentId) return;
    try {
      await api.assignMaterialToAgent({
        listingId: selectedListing.id,
        agentId: agentForm.agentId,
        quantityMT: Number(agentForm.quantityMT),
        agentRatePerTon: Number(agentForm.agentRatePerTon),
        targetSalesPrice: Number(agentForm.targetSalesPrice),
        commercialTerms: agentForm.commercialTerms,
      });
      setIsAssignAgentModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Open Status Modal
  const handleOpenStatusModal = (listing: any) => {
    setSelectedListing(listing);
    setStatusForm({
      status: listing.status,
      adminNotes: listing.adminNotes || '',
    });
    setIsStatusModalOpen(true);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;
    try {
      await api.updateListingStatus(selectedListing.id, statusForm.status, statusForm.adminNotes);
      setIsStatusModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Create Listing Submit
  const handleCreateListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createListing(newListingForm);
      setIsCreateListingModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Scrap Materials Marketplace
          </h1>
          <p className="text-xs text-slate-500">
            Manage global inventory, review supplier listings, assign sales agents, and update statuses.
          </p>
        </div>

        <button
          id="admin-create-listing-btn"
          onClick={() => setIsCreateListingModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Scrap Material
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="marketplace-search-input"
              type="text"
              placeholder="Search material, grade, port, country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Filter */}
          <select
            id="marketplace-category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="">All Categories</option>
            {COMMODITY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            id="marketplace-status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">AVAILABLE (Green)</option>
            <option value="SOLD">SOLD (Red)</option>
            <option value="RESERVED">RESERVED (Blue)</option>
            <option value="PENDING">PENDING</option>
          </select>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {/* Grid Mode */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-emerald-500/40 transition-all group"
            >
              <div>
                {/* Photo & Status Overlay */}
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
                  {item.photos?.length > 1 && (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-white font-semibold">
                      +{item.photos.length - 1} photos
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                      {item.commodityCategory}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      {item.materialName}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{item.grade}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Volume:</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {item.quantity.toLocaleString()} {item.quantityUnit}
                      </strong>{' '}
                      <span className="text-[10px] text-slate-500">
                        ({item.numberOfContainers || Math.ceil(item.quantity / 25)} Cont.)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Port of Loading:</span>
                      <strong className="text-slate-800 dark:text-slate-200 line-clamp-1">
                        {item.portOfShipping}
                      </strong>
                    </div>
                  </div>

                  {/* Confidential Supplier Info (Admin Privilege) */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-[11px]">
                    <div className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      Confidential Supplier (Admin Only):
                    </div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {item.supplierCompanyName}
                    </div>
                    <div className="text-slate-500 truncate">{item.supplierEmail} &bull; {item.supplierPhone}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-3 pt-3">
                <button
                  onClick={() => {
                    setSelectedListing(item);
                    setIsDetailModalOpen(true);
                  }}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1"
                  title="View full specs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Specs
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenAssignAgent(item)}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 text-xs font-bold flex items-center gap-1"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Agent ($/MT)
                  </button>

                  <button
                    onClick={() => handleOpenStatusModal(item)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    Status
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table Mode */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3">Category &amp; Grade</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Price / MT</th>
                <th className="px-4 py-3">Origin / Port</th>
                <th className="px-4 py-3">Supplier (Confidential)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {listings.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                    {item.materialName}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                      {item.commodityCategory}
                    </span>
                    <div className="text-[11px] text-slate-500">{item.grade}</div>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                    {item.quantity.toLocaleString()} {item.quantityUnit}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                    ${item.pricePerUnit}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                    {item.portOfShipping} ({item.countryOfOrigin})
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-purple-700 dark:text-purple-400">
                      {item.supplierCompanyName}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge status={item.status} size="sm" />
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => handleOpenAssignAgent(item)}
                      className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-bold text-[11px]"
                    >
                      Assign Agent
                    </button>
                    <button
                      onClick={() => handleOpenStatusModal(item)}
                      className="px-2 py-1 bg-slate-800 text-white rounded-lg font-bold text-[11px]"
                    >
                      Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Full Specs & Confidential Supplier Details */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedListing?.materialName || 'Scrap Material Specifications'}
        subtitle={`Lot ID: ${selectedListing?.id} • Category: ${selectedListing?.commodityCategory}`}
        maxWidth="4xl"
      >
        {selectedListing && (
          <div className="space-y-6">
            {/* Image Gallery */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {selectedListing.photos?.map((imgUrl: string, idx: number) => (
                <div key={idx} className="h-44 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <img src={imgUrl} alt={`Photo ${idx + 1}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Quantity</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedListing.quantity} {selectedListing.quantityUnit}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Unit Price</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  ${selectedListing.pricePerUnit}/{selectedListing.quantityUnit}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Loading Port</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedListing.portOfShipping}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Incoterms</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedListing.incoterms}
                </span>
              </div>
            </div>

            {/* Additional details */}
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <strong>Grade Specification:</strong> {selectedListing.grade}
              </div>
              <div>
                <strong>Packaging:</strong> {selectedListing.packaging}
              </div>
              <div>
                <strong>Payment Terms:</strong> {selectedListing.paymentTerms}
              </div>
              <div>
                <strong>Quality / Inspection:</strong> {selectedListing.qualitySpecification}
              </div>
              {selectedListing.description && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <strong>Description:</strong> {selectedListing.description}
                </div>
              )}
            </div>

            {/* Confidential Counterparty Panel */}
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-xs">
              <div className="font-bold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-purple-600" />
                Confidential Supplier Records (Admin Eyes Only):
              </div>
              <div className="grid grid-cols-2 gap-3 text-purple-950 dark:text-purple-200">
                <div>
                  <strong>Company:</strong> {selectedListing.supplierCompanyName}
                </div>
                <div>
                  <strong>Contact Person:</strong> {selectedListing.supplierContactName}
                </div>
                <div>
                  <strong>Email:</strong> {selectedListing.supplierEmail}
                </div>
                <div>
                  <strong>Phone:</strong> {selectedListing.supplierPhone}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Assign Material to Sales Agent ($/MT Calculation) */}
      <Modal
        isOpen={isAssignAgentModalOpen}
        onClose={() => setIsAssignAgentModalOpen(false)}
        title="Assign Scrap Material to Sales Agent"
        subtitle={`Assign commercial terms for ${selectedListing?.materialName} (${selectedListing?.quantity} MT)`}
        maxWidth="lg"
      >
        <form onSubmit={handleAssignAgentSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Certified Sales Agent *
            </label>
            <select
              required
              value={agentForm.agentId}
              onChange={(e) => setAgentForm({ ...agentForm, agentId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            >
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name} ({ag.country} - {ag.tradingRegion || 'Middle East/Asia'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Quantity to Assign (MT) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={agentForm.quantityMT}
                onChange={(e) => setAgentForm({ ...agentForm, quantityMT: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Agent Rate / Commission ($/MT) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={agentForm.agentRatePerTon}
                onChange={(e) => setAgentForm({ ...agentForm, agentRatePerTon: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Target Approved Sales Price ($/MT)
            </label>
            <input
              type="number"
              value={agentForm.targetSalesPrice}
              onChange={(e) => setAgentForm({ ...agentForm, targetSalesPrice: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          {/* Automated Agent Payout Calculation Box */}
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <div className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Automated Agent Compensation Summary
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-slate-600 dark:text-slate-400">
                Formula: {agentForm.quantityMT} MT &times; ${agentForm.agentRatePerTon}/MT =
              </span>
              <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
                ${(agentForm.quantityMT * agentForm.agentRatePerTon).toLocaleString()} USD
              </span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Commercial Terms &amp; Instructions
            </label>
            <textarea
              rows={2}
              value={agentForm.commercialTerms}
              onChange={(e) => setAgentForm({ ...agentForm, commercialTerms: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              placeholder="e.g. Target buyer destination Indian sub-continent or Far East..."
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAssignAgentModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Status Update */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Scrap Listing Status"
        subtitle={`Listing: ${selectedListing?.materialName}`}
        maxWidth="md"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Lifecycle Status *
            </label>
            <div className="space-y-2">
              {[
                { id: 'AVAILABLE', label: 'AVAILABLE (Active on Marketplace)', badge: 'bg-emerald-100 text-emerald-800' },
                { id: 'RESERVED', label: 'RESERVED (In Active Deal Mediation)', badge: 'bg-blue-100 text-blue-800' },
                { id: 'SOLD', label: 'SOLD (Mark in Red / Contract Closed)', badge: 'bg-rose-100 text-rose-800' },
                { id: 'PENDING_REVIEW', label: 'PENDING_REVIEW (Awaiting SGS specs)', badge: 'bg-amber-100 text-amber-800' },
                { id: 'EXPIRED', label: 'EXPIRED / ARCHIVED', badge: 'bg-slate-100 text-slate-800' },
              ].map((s) => (
                <label
                  key={s.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    statusForm.status === s.id
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status_choice"
                      checked={statusForm.status === s.id}
                      onChange={() => setStatusForm({ ...statusForm, status: s.id })}
                      className="text-emerald-600"
                    />
                    <span className="font-bold text-slate-800 dark:text-slate-200">{s.label}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${s.badge}`}>
                    {s.id}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Admin Notes / Status Reason
            </label>
            <textarea
              rows={2}
              value={statusForm.adminNotes}
              onChange={(e) => setStatusForm({ ...statusForm, adminNotes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              placeholder="e.g. Sold under contract AST-2026-902..."
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold"
            >
              Update Status
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add New Scrap Listing */}
      <Modal
        isOpen={isCreateListingModalOpen}
        onClose={() => setIsCreateListingModalOpen(false)}
        title="List New Scrap Material"
        subtitle="Add industrial scrap material lot with images, specifications, and port parameters"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateListingSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Material Name *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. HMS 1&2 (80:20) Heavy Melting Steel"
                value={newListingForm.materialName}
                onChange={(e) => setNewListingForm({ ...newListingForm, materialName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Commodity Category *
              </label>
              <select
                value={newListingForm.commodityCategory}
                onChange={(e) => setNewListingForm({ ...newListingForm, commodityCategory: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              >
                {COMMODITY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                ISRI Grade / Spec *
              </label>
              <input
                type="text"
                placeholder="e.g. ISRI 200-206"
                value={newListingForm.grade}
                onChange={(e) => setNewListingForm({ ...newListingForm, grade: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Available Quantity (MT) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={newListingForm.quantity}
                onChange={(e) => setNewListingForm({ ...newListingForm, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Unit Asking Price ($/MT) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={newListingForm.pricePerUnit}
                onChange={(e) => setNewListingForm({ ...newListingForm, pricePerUnit: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Port of Shipping *
              </label>
              <select
                value={newListingForm.portOfShipping}
                onChange={(e) => setNewListingForm({ ...newListingForm, portOfShipping: e.target.value })}
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
                Incoterms *
              </label>
              <select
                value={newListingForm.incoterms}
                onChange={(e) => setNewListingForm({ ...newListingForm, incoterms: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              >
                {INCOTERMS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Material Photo URL * (At least 1 required)
            </label>
            <input
              type="url"
              required
              value={newListingForm.photos[0]}
              onChange={(e) => setNewListingForm({ ...newListingForm, photos: [e.target.value] })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-[11px]"
              placeholder="https://..."
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateListingModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              Publish Listing
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
