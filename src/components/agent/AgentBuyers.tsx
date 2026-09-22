import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { User } from '../../types';
import {
  Users,
  Building2,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Boxes,
  Send,
  Download,
  Filter
} from 'lucide-react';

interface BuyerEntryRow {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  destinationPort: string;
  typicalVolume: string;
  preferredIncoterms: string;
  commodityCategories: string[];
}

const DEFAULT_BUYER_ROW: BuyerEntryRow = {
  name: '',
  companyName: '',
  email: '',
  phone: '+974 5500 0000',
  country: 'India',
  city: 'Mumbai',
  destinationPort: 'Nhava Sheva Port, India',
  typicalVolume: '500 MT/month',
  preferredIncoterms: 'CIF',
  commodityCategories: ['Metal Scrap'],
};

const SAMPLE_AGENT_BUYERS: BuyerEntryRow[] = [
  {
    name: 'Rajesh Agarwal',
    companyName: 'Agarwal Smelting & Ingot Mills',
    email: 'rajesh.agarwal@agarwalsmelting.in',
    phone: '+91 98300 11223',
    country: 'India',
    city: 'Kolkata',
    destinationPort: 'Haldia Port, India',
    typicalVolume: '1,200 MT/month',
    preferredIncoterms: 'CIF',
    commodityCategories: ['Metal Scrap', 'HMS 1&2 (80:20)'],
  },
  {
    name: 'Mohammad Al-Humaidi',
    companyName: 'Gulf Rebar Industries W.L.L.',
    email: 'm.humaidi@gulfrebar.bh',
    phone: '+973 1788 4400',
    country: 'Bahrain',
    city: 'Manama',
    destinationPort: 'Khalifa Bin Salman Port, Bahrain',
    typicalVolume: '800 MT/month',
    preferredIncoterms: 'FOB',
    commodityCategories: ['Metal Scrap', 'Shredded Steel 211'],
  },
  {
    name: 'Karthik Ramanathan',
    companyName: 'Chennai Copper & Wire Works',
    email: 'karthik@chennaicopper.com',
    phone: '+91 94440 98765',
    country: 'India',
    city: 'Chennai',
    destinationPort: 'Chennai Port, India',
    typicalVolume: '300 MT/month',
    preferredIncoterms: 'CIF',
    commodityCategories: ['Copper Millberry (99.99%)', 'Metal Scrap'],
  },
];

export const AgentBuyers: React.FC = () => {
  const [buyers, setBuyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalMode, setModalMode] = useState<'single' | 'bulk'>('single');
  const [bulkRows, setBulkRows] = useState<BuyerEntryRow[]>([{ ...DEFAULT_BUYER_ROW }]);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ success: boolean; text: string } | null>(null);

  const loadBuyers = async () => {
    try {
      setLoading(true);
      const data = await api.agentGetBuyers();
      setBuyers(data);
    } catch (err) {
      console.error('Failed to load buyers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuyers();
  }, []);

  const handleOpenAdd = (mode: 'single' | 'bulk') => {
    setModalMode(mode);
    setBulkRows(
      mode === 'bulk'
        ? [
            { ...DEFAULT_BUYER_ROW, name: 'Aditya Steel Mills', companyName: 'Aditya Steels Ltd' },
            { ...DEFAULT_BUYER_ROW, name: 'Sunil Mehta', companyName: 'Mehta Casting Works', city: 'Ahmedabad' },
          ]
        : [{ ...DEFAULT_BUYER_ROW }]
    );
    setShowAddModal(true);
    setNotification(null);
  };

  const handleAddBulkRow = () => {
    setBulkRows([...bulkRows, { ...DEFAULT_BUYER_ROW }]);
  };

  const handleRemoveBulkRow = (index: number) => {
    if (bulkRows.length <= 1) return;
    setBulkRows(bulkRows.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (index: number, field: keyof BuyerEntryRow, val: any) => {
    const updated = [...bulkRows];
    updated[index] = { ...updated[index], [field]: val };
    setBulkRows(updated);
  };

  const handleLoadSampleBuyers = () => {
    setBulkRows([...SAMPLE_AGENT_BUYERS]);
    setModalMode('bulk');
  };

  const handleSaveBuyers = async () => {
    const invalid = bulkRows.find((r) => !r.name.trim());
    if (invalid) {
      setNotification({
        success: false,
        text: 'Please enter a contact or company name for each buyer.',
      });
      return;
    }

    setSubmitting(true);
    setNotification(null);

    try {
      const res = await api.agentAddBuyers(bulkRows);
      setNotification({
        success: true,
        text: `Successfully registered ${res.count} buyer client(s) to your agency portfolio!`,
      });
      await loadBuyers();
      setTimeout(() => {
        setShowAddModal(false);
      }, 1500);
    } catch (err: any) {
      setNotification({
        success: false,
        text: err.message || 'Failed to save buyer clients.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter buyers
  const filteredBuyers = buyers.filter((b) => {
    const matchesSearch =
      (b.name && b.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.companyName && b.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.city && b.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.country && b.country.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCountry = countryFilter === 'ALL' || b.country === countryFilter;
    return matchesSearch && matchesCountry;
  });

  const uniqueCountries = Array.from(new Set(buyers.map((b) => b.country).filter(Boolean)));

  return (
    <div id="agent-buyers-workspace" className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Agent Procurement Network
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            My Registered Buyers &amp; Clients
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            You have authorization to register and onboard any amount of buyer counterparties. Manage their scrap requirements, introduce assigned scrap lots, and submit purchase bids directly through the terminal.
          </p>
        </div>

        {/* Add Controls */}
        <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
          <button
            id="agent-add-single-buyer-btn"
            type="button"
            onClick={() => handleOpenAdd('single')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Buyer</span>
          </button>

          <button
            id="agent-add-bulk-buyers-btn"
            type="button"
            onClick={() => handleOpenAdd('bulk')}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bulk Add Any Amount of Buyers</span>
          </button>
        </div>
      </div>

      {/* Metric Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">Total Registered Buyers</span>
          <strong className="text-xl font-bold text-white mt-1 block">{buyers.length}</strong>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">My Direct Clients</span>
          <strong className="text-xl font-bold text-amber-400 mt-1 block">
            {buyers.filter((b) => b.isMyClient || b.assignedAgentId).length}
          </strong>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">Target Regional Corridors</span>
          <strong className="text-xl font-bold text-emerald-400 mt-1 block">
            {uniqueCountries.length} Countries
          </strong>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">Onboarding Limit</span>
          <strong className="text-xl font-bold text-sky-400 mt-1 block">Unlimited</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search buyers by contact name, company, country, or destination port..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-hidden"
          >
            <option value="ALL">All Countries</option>
            {uniqueCountries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Buyers Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">
          Loading buyer client portfolio...
        </div>
      ) : filteredBuyers.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-950/60 text-amber-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Buyers Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You can add any amount of buyers to your client portfolio. Use the button below to add your first buyer or bulk import multiple buyers at once.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => handleOpenAdd('bulk')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl"
            >
              + Bulk Add Buyers Now
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBuyers.map((buyer) => (
            <div
              key={buyer.id}
              className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 shadow-sm flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{buyer.companyName || buyer.name}</span>
                      {buyer.isMyClient && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-950 border border-amber-500/40 text-amber-400 text-[10px] font-bold">
                          My Client
                        </span>
                      )}
                    </h3>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Rep: {buyer.name}
                    </span>
                  </div>
                  <Badge status={buyer.status || 'ACTIVE'} size="sm" />
                </div>

                <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span>
                      {buyer.city ? `${buyer.city}, ` : ''}{buyer.country || 'Global'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="font-mono text-[11px] truncate">{buyer.email}</span>
                  </div>

                  {buyer.phone && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="font-mono text-[11px]">{buyer.phone}</span>
                    </div>
                  )}

                  {buyer.destinationPort && (
                    <div className="pt-1.5 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                      <span>Destination Port:</span>
                      <strong className="text-slate-200">{buyer.destinationPort}</strong>
                    </div>
                  )}

                  {buyer.typicalVolume && (
                    <div className="text-[11px] text-slate-400 flex justify-between">
                      <span>Purchasing Volume:</span>
                      <strong className="text-emerald-400">{buyer.typicalVolume}</strong>
                    </div>
                  )}
                </div>

                {buyer.commodityCategories && buyer.commodityCategories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {buyer.commodityCategories.map((c: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-semibold"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[10px]">ID: {buyer.id}</span>
                <span className="text-[10px] font-mono text-emerald-400">Verified Importer</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Buyer(s) */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={modalMode === 'bulk' ? 'Bulk Add Any Amount of Buyers' : 'Register New Buyer Counterparty'}
        subtitle="Agent authorization: Onboard buyer clients with institutional import demands"
        maxWidth={modalMode === 'bulk' ? '5xl' : '2xl'}
      >
        <div className="space-y-6">
          {/* Header Action / Presets */}
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-amber-300 block">
                {modalMode === 'bulk'
                  ? 'Add Multiple Buyers at a Time'
                  : 'Single Buyer Client Registration'}
              </span>
              <p className="text-xs text-slate-300 mt-0.5">
                All registered buyers are linked to your Agent profile. You can pitch scrap lots directly to them.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLoadSampleBuyers}
              className="px-3 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer flex-shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load 3 Regional Steel Mill Buyers</span>
            </button>
          </div>

          {/* Feedback */}
          {notification && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in ${
                notification.success
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
              }`}
            >
              {notification.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              )}
              <span className="font-semibold">{notification.text}</span>
            </div>
          )}

          {/* Rows Builder */}
          <div className="space-y-4 max-h-[55vh] overflow-y-auto custom-scrollbar pr-1">
            {bulkRows.map((row, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    Buyer #{idx + 1}
                  </span>

                  {bulkRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBulkRow(idx)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                      Contact Person Name *
                    </label>
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => handleUpdateRow(idx, 'name', e.target.value)}
                      placeholder="e.g. Rajesh Agarwal"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                      Buyer Company Name
                    </label>
                    <input
                      type="text"
                      value={row.companyName}
                      onChange={(e) => handleUpdateRow(idx, 'companyName', e.target.value)}
                      placeholder="e.g. Agarwal Smelting Works"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={row.email}
                      onChange={(e) => handleUpdateRow(idx, 'email', e.target.value)}
                      placeholder="trade@company.com"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                      Phone / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={row.phone}
                      onChange={(e) => handleUpdateRow(idx, 'phone', e.target.value)}
                      placeholder="+91 98300 00000"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                      Country &amp; City
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={row.country}
                        onChange={(e) => handleUpdateRow(idx, 'country', e.target.value)}
                        placeholder="Country"
                        className="w-1/2 px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:outline-hidden"
                      />
                      <input
                        type="text"
                        value={row.city}
                        onChange={(e) => handleUpdateRow(idx, 'city', e.target.value)}
                        placeholder="City"
                        className="w-1/2 px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                      Destination Discharge Port
                    </label>
                    <input
                      type="text"
                      value={row.destinationPort}
                      onChange={(e) => handleUpdateRow(idx, 'destinationPort', e.target.value)}
                      placeholder="e.g. Nhava Sheva / Haldia"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                      Monthly Scrap Demand Volume
                    </label>
                    <input
                      type="text"
                      value={row.typicalVolume}
                      onChange={(e) => handleUpdateRow(idx, 'typicalVolume', e.target.value)}
                      placeholder="e.g. 500 MT/month"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                      Preferred Incoterms
                    </label>
                    <select
                      value={row.preferredIncoterms}
                      onChange={(e) => handleUpdateRow(idx, 'preferredIncoterms', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:outline-hidden"
                    >
                      <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                      <option value="CFR">CFR (Cost and Freight)</option>
                      <option value="FOB">FOB (Free on Board)</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Another Row Button */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleAddBulkRow}
              className="px-3.5 py-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-600/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Another Buyer Row</span>
            </button>

            <span className="text-xs text-slate-400 font-mono">
              Ready to submit: {bulkRows.length} Buyer(s)
            </span>
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveBuyers}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {submitting
                  ? 'Saving Buyers...'
                  : `Save & Register ${bulkRows.length} Buyer(s)`}
              </span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
