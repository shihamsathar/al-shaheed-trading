import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { User, AgentAssignment } from '../../types';
import {
  Users,
  Search,
  DollarSign,
  Plus,
  Boxes,
  Award,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Calendar,
  Layers,
  Edit2,
  Trash2,
} from 'lucide-react';

export const AdminAgents: React.FC = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<AgentAssignment[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any | null>(null);
  const [deletingAgent, setDeletingAgent] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Agent Form State
  const [agentFormData, setAgentFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'Qatar',
    city: 'Doha',
    tradingRegion: 'GCC & MENA Trade Corridors',
    languages: ['Arabic', 'English', 'Hindi'],
    experienceYears: 4,
    status: 'ACTIVE',
  });

  const [assignForm, setAssignForm] = useState({
    listingId: '',
    quantityMT: 100,
    agentRatePerTon: 15,
    targetSalesPrice: 380,
    commercialTerms: 'Target buyer base: India/Pakistan/SE Asia. Full LC at sight.',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [agts, asgs, lists] = await Promise.all([
        api.getAgents(),
        api.getAgentAssignments(),
        api.getListings({ status: 'AVAILABLE' }),
      ]);
      setAgents(agts);
      setAssignments(asgs);
      setListings(lists);
      if (lists.length > 0) {
        setAssignForm((prev) => ({
          ...prev,
          listingId: lists[0].id,
          quantityMT: lists[0].quantity,
          targetSalesPrice: lists[0].pricePerUnit + 25,
        }));
      }
    } catch (err) {
      console.error('Failed to load agents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddAgentModal = () => {
    setAgentFormData({
      name: '',
      email: '',
      phone: '',
      country: 'Qatar',
      city: 'Doha',
      tradingRegion: 'GCC & South Asia Trade Corridors',
      languages: ['Arabic', 'English', 'Hindi'],
      experienceYears: 4,
      status: 'ACTIVE',
    });
    setShowAddModal(true);
  };

  const openEditAgentModal = (agent: any) => {
    setEditingAgent(agent);
    setAgentFormData({
      name: agent.name,
      email: agent.email,
      phone: agent.phone || '',
      country: agent.country || 'Qatar',
      city: agent.city || 'Doha',
      tradingRegion: agent.tradingRegion || 'GCC & MENA',
      languages: agent.languages || ['English', 'Arabic'],
      experienceYears: agent.experienceYears || 3,
      status: agent.status || 'ACTIVE',
    });
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentFormData.name || !agentFormData.email) {
      alert('Please fill in Name and Email.');
      return;
    }
    setActionLoading(true);
    try {
      await api.createAgent(agentFormData);
      setShowAddModal(false);
      setNotification(`New broker agent "${agentFormData.name}" onboarded successfully.`);
      setTimeout(() => setNotification(null), 4000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create agent.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgent) return;
    setActionLoading(true);
    try {
      await api.updateAgent(editingAgent.id, agentFormData);
      setEditingAgent(null);
      setNotification(`Agent "${agentFormData.name}" updated successfully.`);
      setTimeout(() => setNotification(null), 4000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update agent.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAgent = async () => {
    if (!deletingAgent) return;
    setActionLoading(true);
    try {
      await api.deleteAgent(deletingAgent.id);
      setDeletingAgent(null);
      setNotification(`Agent "${deletingAgent.name}" removed from registry.`);
      setTimeout(() => setNotification(null), 4000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete agent.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenAssignModal = (agent: any) => {
    setSelectedAgent(agent);
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent || !assignForm.listingId) return;

    try {
      await api.assignMaterialToAgent({
        agentId: selectedAgent.id,
        listingId: assignForm.listingId,
        quantityMT: Number(assignForm.quantityMT),
        agentRatePerTon: Number(assignForm.agentRatePerTon),
        targetSalesPrice: Number(assignForm.targetSalesPrice),
        commercialTerms: assignForm.commercialTerms,
      });
      alert('Material successfully assigned to Agent with authorized dollar-per-ton rate.');
      setIsAssignModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const totalCommissionsEarned = assignments
    .filter((a) => a.status === 'COMMERCIAL_CLOSED' || a.status === 'SOLD')
    .reduce((acc, a) => acc + a.calculatedAgentAmount, 0);

  const totalCommissionsPipeline = assignments.reduce((acc, a) => acc + a.calculatedAgentAmount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Commercial Agent Network &amp; Commissions
          </h1>
          <p className="text-xs text-slate-500">
            Certified sales agents, material assignment desk, and automated dollar-per-ton ($/MT) commission ledger.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={openAddAgentModal}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Broker Agent
          </button>
          <div className="p-2.5 px-4 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-right">
            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase block">
              Active Agent Pipeline
            </span>
            <span className="text-sm font-black text-amber-700 dark:text-amber-400">
              ${totalCommissionsPipeline.toLocaleString()} USD
            </span>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {notification}
        </div>
      )}

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between hover:border-amber-500/40 transition-all"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold flex items-center justify-center text-base">
                  {agent.name[0]}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    agent.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    {agent.status}
                  </span>
                  <button
                    onClick={() => openEditAgentModal(agent)}
                    title="Edit Agent"
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingAgent(agent)}
                    title="Remove Agent"
                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{agent.name}</h3>
                <div className="text-xs text-slate-500">{agent.companyName || 'Trade Agent'}</div>
                <div className="text-xs font-mono text-slate-400 mt-0.5 truncate">{agent.email}</div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {agent.city}, {agent.country} ({agent.tradingRegion || 'Middle East / Asia'})
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Assigned Volume</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {agent.totalMTAssigned?.toLocaleString() || 0} MT
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Potential Earnings</span>
                  <strong className="text-amber-700 dark:text-amber-400 font-bold">
                    ${agent.expectedEarned?.toLocaleString() || 0}
                  </strong>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                id={`assign-material-to-${agent.id}`}
                onClick={() => handleOpenAssignModal(agent)}
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Assign Scrap Material
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Material Assignments Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Boxes className="w-4 h-4 text-emerald-600" />
          Active Agent Material Assignments &amp; Compensation Ledger
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Material Assigned</th>
                <th className="px-4 py-3">Volume</th>
                <th className="px-4 py-3">Agent Rate ($/MT)</th>
                <th className="px-4 py-3">Calculated Expected Payout</th>
                <th className="px-4 py-3">Target Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assigned Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {assignments.map((asg) => (
                <tr key={asg.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                    {asg.agentName}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                    {asg.materialName}
                  </td>
                  <td className="px-4 py-3.5 font-semibold">
                    {asg.quantityMT} MT
                  </td>
                  <td className="px-4 py-3.5 font-bold text-amber-700 dark:text-amber-400">
                    ${asg.agentRatePerTon}/MT
                  </td>
                  <td className="px-4 py-3.5 font-black text-emerald-600 dark:text-emerald-400">
                    ${asg.calculatedAgentAmount.toLocaleString()} USD
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                    ${asg.targetSalesPrice}/MT
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge status={asg.status} size="sm" />
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                    {new Date(asg.assignedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Agent Modal */}
      {(showAddModal || editingAgent) && (
        <Modal
          isOpen={showAddModal || !!editingAgent}
          onClose={() => {
            setShowAddModal(false);
            setEditingAgent(null);
          }}
          title={editingAgent ? `Edit Agent: ${editingAgent.name}` : 'Onboard New Broker Agent'}
          subtitle="Configure agent profile, regional trade desk, and contact information"
          maxWidth="lg"
        >
          <form onSubmit={editingAgent ? handleUpdateAgent : handleCreateAgent} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={agentFormData.name}
                  onChange={(e) => setAgentFormData({ ...agentFormData, name: e.target.value })}
                  placeholder="e.g. Khalid Al-Sulaiti"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address (Login Username) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={agentFormData.email}
                  onChange={(e) => setAgentFormData({ ...agentFormData, email: e.target.value })}
                  placeholder="agent.khalid@alshaheedrecycling.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={agentFormData.phone}
                  onChange={(e) => setAgentFormData({ ...agentFormData, phone: e.target.value })}
                  placeholder="+974 5512 8899"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Trading Region
                </label>
                <input
                  type="text"
                  value={agentFormData.tradingRegion}
                  onChange={(e) => setAgentFormData({ ...agentFormData, tradingRegion: e.target.value })}
                  placeholder="GCC & South Asia, Middle East..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={agentFormData.country}
                  onChange={(e) => setAgentFormData({ ...agentFormData, country: e.target.value })}
                  placeholder="Qatar, UAE, India, Oman..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={agentFormData.city}
                  onChange={(e) => setAgentFormData({ ...agentFormData, city: e.target.value })}
                  placeholder="Doha, Dubai, Mumbai..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingAgent(null);
                }}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold shadow-md cursor-pointer"
              >
                {actionLoading ? 'Saving...' : editingAgent ? 'Save Changes' : 'Create Agent'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Agent Modal */}
      {deletingAgent && (
        <Modal
          isOpen={!!deletingAgent}
          onClose={() => setDeletingAgent(null)}
          title="Remove Agent From Registry"
          subtitle="Are you sure you want to deactivate and remove this commercial agent?"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{deletingAgent.name}</strong> ({deletingAgent.email})?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingAgent(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteAgent}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold shadow-md cursor-pointer"
              >
                {actionLoading ? 'Deleting...' : 'Delete Agent'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Assign Material */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Scrap Material to ${selectedAgent?.name}`}
        subtitle="Configure quantity, dollar-per-ton compensation rate, and target selling price"
        maxWidth="lg"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Scrap Material Listing *
            </label>
            <select
              required
              value={assignForm.listingId}
              onChange={(e) => {
                const l = listings.find((x) => x.id === e.target.value);
                setAssignForm({
                  ...assignForm,
                  listingId: e.target.value,
                  quantityMT: l ? l.quantity : assignForm.quantityMT,
                  targetSalesPrice: l ? l.pricePerUnit + 25 : assignForm.targetSalesPrice,
                });
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            >
              {listings.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.materialName} ({l.quantity} MT @ Ask ${l.pricePerUnit}/MT - {l.portOfShipping})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Allocated Quantity (MT) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={assignForm.quantityMT}
                onChange={(e) => setAssignForm({ ...assignForm, quantityMT: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Agent Rate ($ / MT) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={assignForm.agentRatePerTon}
                onChange={(e) => setAssignForm({ ...assignForm, agentRatePerTon: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-amber-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Target Approved Sales Price ($/MT)
            </label>
            <input
              type="number"
              value={assignForm.targetSalesPrice}
              onChange={(e) => setAssignForm({ ...assignForm, targetSalesPrice: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          {/* Real-time Calculation Box */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <div className="text-[10px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
              Automated Compensation Formula
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-slate-600 dark:text-slate-400">
                {assignForm.quantityMT} MT &times; ${assignForm.agentRatePerTon}/MT =
              </span>
              <span className="text-base font-black text-amber-700 dark:text-amber-400">
                ${(assignForm.quantityMT * assignForm.agentRatePerTon).toLocaleString()} USD
              </span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Commercial Guidelines
            </label>
            <textarea
              rows={2}
              value={assignForm.commercialTerms}
              onChange={(e) => setAssignForm({ ...assignForm, commercialTerms: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
