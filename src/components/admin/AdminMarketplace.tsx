import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { PhotoUploader } from '../common/PhotoUploader';
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
  Calendar,
  Globe,
  Lock,
  Handshake,
  TrendingUp,
} from 'lucide-react';

export const AdminMarketplace: React.FC = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [approvalTab, setApprovalTab] = useState<'ALL' | 'PENDING' | 'PUBLISHED'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAssignAgentModalOpen, setIsAssignAgentModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isCreateListingModalOpen, setIsCreateListingModalOpen] = useState(false);
  const [isConnectBuyerModalOpen, setIsConnectBuyerModalOpen] = useState(false);

  // Form states
  const [connectForm, setConnectForm] = useState({
    requirementId: '',
    dealType: 'DIRECT_TRADING',
    quantity: 0,
    purchasePricePerUnit: 0,
    sellingPricePerUnit: 0,
    freightCost: 2500,
    inspectionCost: 750,
    agentId: '',
    agentRatePerTon: 15,
    incoterms: 'CFR',
  });

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
    quantity: 0,
    pricePerUnit: 0,
    currency: 'USD',
    countryOfOrigin: 'Qatar',
    portOfShipping: '',
    destinationPort: '',
    packaging: 'Loose in 20ft Dry Cargo Container (Approx 25-28 MT)',
    incoterms: 'CFR',
    paymentTerms: '100% LC at Sight (Irrevocable & Confirmed)',
    photos: [] as string[],
    description: '',
    supplierCompanyName: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [list, agts, reqs] = await Promise.all([
        api.getListings({ category: selectedCategory, status: selectedStatus, search: searchTerm }),
        api.getAgents(),
        api.getRequirements(),
      ]);
      setListings(list);
      setAgents(agts);
      setRequirements(reqs);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedStatus, searchTerm]);

  // Toggle Publication by Admin
  const handleTogglePublish = async (listing: any) => {
    try {
      const nextPublished = !listing.isPublished;
      await api.publishListing(listing.id, nextPublished);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Open Direct Connect Buyer Modal
  const handleOpenConnectBuyer = (listing: any) => {
    setSelectedListing(listing);
    const matchReq =
      requirements.find((r) => r.commodityCategory === listing.commodityCategory && r.status === 'ACTIVE') ||
      requirements[0];

    const targetPrice = matchReq ? matchReq.targetPricePerUnit : listing.pricePerUnit + 25;

    setConnectForm({
      requirementId: matchReq?.id || '',
      dealType: 'DIRECT_TRADING',
      quantity: listing.quantity,
      purchasePricePerUnit: listing.pricePerUnit,
      sellingPricePerUnit: targetPrice,
      freightCost: 2500,
      inspectionCost: 750,
      agentId: agents[0]?.id || '',
      agentRatePerTon: 15,
      incoterms: listing.incoterms || 'CFR',
    });
    setIsConnectBuyerModalOpen(true);
  };

  const handleConnectBuyerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;
    try {
      await api.createDealFromMatch({
        listingId: selectedListing.id,
        ...connectForm,
      });
      alert(
        `Success! Admin has officially connected Supplier (${selectedListing.supplierCompanyName}) with Buyer in a verified trade deal.`
      );
      setIsConnectBuyerModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

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

  const pendingCount = listings.filter((l) => !l.isPublished || l.status === 'PENDING_REVIEW').length;
  const publishedCount = listings.filter((l) => l.isPublished === true).length;

  const displayedListings = listings.filter((l) => {
    if (approvalTab === 'PENDING') {
      return !l.isPublished || l.status === 'PENDING_REVIEW';
    }
    if (approvalTab === 'PUBLISHED') {
      return l.isPublished === true;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 text-xs font-bold mb-2">
            <Lock className="w-3.5 h-3.5" />
            Admin Curated &amp; Gatekept Trading Marketplace
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Scrap Materials Marketplace
          </h1>
          <p className="text-xs text-slate-500">
            Supplier uploads &amp; photos reflect here first. Only Admin can publish lots to Buyer &amp; Agent dashboards or directly connect counterparties.
          </p>
        </div>

        <button
          id="admin-create-listing-btn"
          onClick={() => setIsCreateListingModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Scrap Material
        </button>
      </div>

      {/* Admin Gatekeeper Notice Banner */}
      {pendingCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Gatekeeper Moderation: {pendingCount} Supplier Scrap Lot(s) Awaiting Admin Review
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-0.5">
                New photos and lots uploaded by suppliers remain private to Admin. Click "Approve &amp; Publish" to show them on public Buyer &amp; Agent dashboards, or use "Connect Buyer" to execute a direct institutional deal.
              </p>
            </div>
          </div>
          <button
            onClick={() => setApprovalTab('PENDING')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 self-start sm:self-auto cursor-pointer transition-colors"
          >
            Review Pending ({pendingCount})
          </button>
        </div>
      )}

      {/* Approval Status Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setApprovalTab('ALL')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            approvalTab === 'ALL'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          All Lots ({listings.length})
        </button>
        <button
          onClick={() => setApprovalTab('PENDING')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            approvalTab === 'PENDING'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          Pending Admin Approval ({pendingCount})
        </button>
        <button
          onClick={() => setApprovalTab('PUBLISHED')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            approvalTab === 'PUBLISHED'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          Published on Marketplace ({publishedCount})
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
            <option value="PENDING_REVIEW">PENDING_REVIEW (Yellow)</option>
            <option value="MATCHED">MATCHED</option>
            <option value="SOLD">SOLD (Red)</option>
            <option value="RESERVED">RESERVED (Blue)</option>
          </select>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {displayedListings.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
          <Boxes className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Scrap Materials Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {approvalTab === 'PENDING'
              ? 'No lots currently pending review. All supplier uploads have been processed.'
              : 'Try changing search terms or filter criteria.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedListings.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-emerald-500/40 transition-all group"
            >
              <div>
                {/* Photo & Status Overlay */}
                <div className="relative h-44 bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center">
                  {item.photos?.[0] ? (
                    <img
                      src={item.photos[0]}
                      alt={item.materialName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4">
                      <Boxes className="w-8 h-8 text-slate-500" />
                      <span className="text-[11px] font-medium text-slate-500">No Photo Available</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    <Badge status={item.status} size="sm" />
                    {item.isPublished ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-600/90 text-white backdrop-blur-xs shadow-xs">
                        <Globe className="w-2.5 h-2.5" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/90 text-white backdrop-blur-xs shadow-xs">
                        <Lock className="w-2.5 h-2.5" /> Admin Only
                      </span>
                    )}
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

                  {/* Exact Dates Display (Admin Only Privilege) */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Posted by Supplier:
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'} {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    {item.availabilityDate && (
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Availability Window:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {item.availabilityDate} {item.validUntil ? `to ${item.validUntil}` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confidential Supplier Info (Admin Privilege) */}
                  <div className="p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800 text-[11px]">
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
              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-2 mt-3 pt-3">
                {/* 1-Click Publishing & Connecting Controls */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleTogglePublish(item)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      item.isPublished
                        ? 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                    }`}
                  >
                    {item.isPublished ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Globe className="w-3.5 h-3.5" />
                        Approve &amp; Publish
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenConnectBuyer(item)}
                    className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Handshake className="w-3.5 h-3.5" />
                    Connect Buyer
                  </button>
                </div>

                {/* Secondary Specs / Agent / Status buttons */}
                <div className="flex items-center justify-between gap-1.5 pt-1">
                  <button
                    onClick={() => {
                      setSelectedListing(item);
                      setIsDetailModalOpen(true);
                    }}
                    className="p-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="View full specs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Specs
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenAssignAgent(item)}
                      className="px-2 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Users className="w-3 h-3" />
                      Agent
                    </button>

                    <button
                      onClick={() => handleOpenStatusModal(item)}
                      className="px-2.5 py-1 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Status
                    </button>
                  </div>
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
                <th className="px-4 py-3">Posted Date</th>
                <th className="px-4 py-3">Publish State</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayedListings.map((item) => (
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
                  <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 py-3.5">
                    {item.isPublished ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <Globe className="w-2.5 h-2.5" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <Lock className="w-2.5 h-2.5" /> Pending Review
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge status={item.status} size="sm" />
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-1.5">
                    <button
                      onClick={() => handleTogglePublish(item)}
                      className={`px-2 py-1 rounded-lg font-bold text-[11px] cursor-pointer ${
                        item.isPublished
                          ? 'border border-slate-300 text-slate-600 hover:bg-slate-100'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {item.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleOpenConnectBuyer(item)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                    >
                      Connect
                    </button>
                    <button
                      onClick={() => handleOpenAssignAgent(item)}
                      className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-bold text-[11px] cursor-pointer"
                    >
                      Agent
                    </button>
                    <button
                      onClick={() => handleOpenStatusModal(item)}
                      className="px-2 py-1 bg-slate-800 text-white rounded-lg font-bold text-[11px] cursor-pointer"
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

          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
            <PhotoUploader
              photos={newListingForm.photos}
              onChange={(newPhotos) => setNewListingForm({ ...newListingForm, photos: newPhotos })}
              label="Material & Scrap Lot Photos"
              subtitle="Capture via mobile camera, upload from desktop, or pick scrap presets"
              required={true}
              maxPhotos={8}
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateListingModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
            >
              Publish Listing
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Connect Parties & Form Official Trade Deal */}
      <Modal
        isOpen={isConnectBuyerModalOpen}
        onClose={() => setIsConnectBuyerModalOpen(false)}
        title="Admin Counterparty Connection Desk"
        subtitle={`Match Supplier (${selectedListing?.supplierCompanyName || 'Supplier'}) with a qualified Buyer requirement to execute a transaction`}
        maxWidth="3xl"
      >
        {selectedListing && (
          <form onSubmit={handleConnectBuyerSubmit} className="space-y-4 text-xs">
            {/* Material & Supplier Context Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {selectedListing.commodityCategory} &bull; {selectedListing.grade}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedListing.materialName}
                </h4>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Available: <strong>{selectedListing.quantity} {selectedListing.quantityUnit}</strong> &bull; Base Price: <strong>${selectedListing.pricePerUnit}/MT</strong> &bull; Origin: {selectedListing.portOfShipping}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-[11px]">
                <div className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase">
                  Supplier Counterparty
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedListing.supplierCompanyName}
                </div>
                <div className="text-slate-500 text-[10px]">{selectedListing.supplierEmail}</div>
              </div>
            </div>

            {/* Target Buyer Requirement Selection */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Matching Buyer Requirement *
              </label>
              <select
                required
                value={connectForm.requirementId}
                onChange={(e) => {
                  const req = requirements.find((r) => r.id === e.target.value);
                  setConnectForm({
                    ...connectForm,
                    requirementId: e.target.value,
                    sellingPricePerUnit: req ? req.targetPricePerUnit : connectForm.sellingPricePerUnit,
                  });
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="">-- Choose Buyer Demand --</option>
                {requirements.map((req) => (
                  <option key={req.id} value={req.id}>
                    {req.buyerCompanyName} &bull; {req.materialGrade} &bull; Needed: {req.targetQuantity} {req.targetQuantityUnit} &bull; Target: ${req.targetPricePerUnit}/MT ({req.destinationPort})
                  </option>
                ))}
              </select>
              {requirements.length === 0 && (
                <p className="text-[11px] text-amber-600 mt-1">
                  No active buyer requirements found. You can still initiate the direct deal once a buyer requirement is registered.
                </p>
              )}
            </div>

            {/* Commercial Pricing Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deal Quantity (MT) *
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  max={selectedListing.quantity}
                  value={connectForm.quantity}
                  onChange={(e) => setConnectForm({ ...connectForm, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier Purchase ($/MT) *
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={connectForm.purchasePricePerUnit}
                  onChange={(e) => setConnectForm({ ...connectForm, purchasePricePerUnit: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Buyer Selling Price ($/MT) *
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={connectForm.sellingPricePerUnit}
                  onChange={(e) => setConnectForm({ ...connectForm, sellingPricePerUnit: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-blue-600 dark:text-blue-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Incoterms
                </label>
                <select
                  value={connectForm.incoterms}
                  onChange={(e) => setConnectForm({ ...connectForm, incoterms: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                >
                  <option value="CFR">CFR - Cost &amp; Freight</option>
                  <option value="CIF">CIF - Cost, Insurance &amp; Freight</option>
                  <option value="FOB">FOB - Free on Board</option>
                  <option value="DAP">DAP - Delivered at Place</option>
                </select>
              </div>
            </div>

            {/* Logistics & Agent Allocation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Est. Ocean Freight ($)
                </label>
                <input
                  type="number"
                  value={connectForm.freightCost}
                  onChange={(e) => setConnectForm({ ...connectForm, freightCost: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assign Local Agent (Optional)
                </label>
                <select
                  value={connectForm.agentId}
                  onChange={(e) => setConnectForm({ ...connectForm, agentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                >
                  <option value="">-- No Agent Assigned --</option>
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.fullName} ({ag.assignedRegion || 'Global'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Agent Rate ($/MT)
                </label>
                <input
                  type="number"
                  value={connectForm.agentRatePerTon}
                  onChange={(e) => setConnectForm({ ...connectForm, agentRatePerTon: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>
            </div>

            {/* Commercial Spread & Margin Calculator */}
            {(() => {
              const qty = Number(connectForm.quantity) || 0;
              const buyPrice = Number(connectForm.purchasePricePerUnit) || 0;
              const sellPrice = Number(connectForm.sellingPricePerUnit) || 0;
              const freight = Number(connectForm.freightCost) || 0;
              const inspection = Number(connectForm.inspectionCost) || 0;
              const agentFee = connectForm.agentId ? qty * (Number(connectForm.agentRatePerTon) || 0) : 0;

              const totalRevenue = qty * sellPrice;
              const totalCost = qty * buyPrice + freight + inspection + agentFee;
              const grossProfit = totalRevenue - totalCost;
              const marginPct = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';

              return (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    Deal Profitability &amp; Spread Analysis
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Gross Revenue:</span>
                      <strong className="text-slate-800 dark:text-slate-200 text-xs">${totalRevenue.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Total Landed Cost:</span>
                      <strong className="text-slate-800 dark:text-slate-200 text-xs">${totalCost.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Admin Gross Profit:</span>
                      <strong className={`text-xs ${grossProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                        ${grossProfit.toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Net Trading Margin:</span>
                      <strong className="text-xs text-emerald-700 dark:text-emerald-300">{marginPct}%</strong>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsConnectBuyerModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-blue-900/20 cursor-pointer"
              >
                <Handshake className="w-4 h-4" />
                Connect Parties &amp; Form Deal
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
