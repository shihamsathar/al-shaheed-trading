import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { AgentAssignment } from '../../types';
import {
  Boxes,
  DollarSign,
  Eye,
  CheckCircle2,
  Ship,
  Sparkles,
  Award,
  Send,
} from 'lucide-react';

export const AgentAssignedMaterials: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<AgentAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsg, setSelectedAsg] = useState<AgentAssignment | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const [clientForm, setClientForm] = useState({
    clientCompanyName: '',
    clientCountry: 'India',
    offeredPricePerMT: 375,
    quantityMT: 100,
    notes: 'Buyer has accepted CFR terms and is ready to issue LC at Sight within 7 banking days.',
  });

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await api.getAgentAssignments();
      const myAssignments = data.filter((a) => a.agentId === user?.id || !a.agentId);
      setAssignments(myAssignments);
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [user]);

  const handleOpenClientModal = (asg: AgentAssignment) => {
    setSelectedAsg(asg);
    setClientForm({
      clientCompanyName: '',
      clientCountry: 'India',
      offeredPricePerMT: asg.targetSalesPrice,
      quantityMT: asg.quantityMT,
      notes: 'Buyer confirmed interest at agreed $/MT price.',
    });
    setIsClientModalOpen(true);
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Client offer for ${selectedAsg?.materialName} transmitted to Al Shaheed Desk! Your $${selectedAsg?.agentRatePerTon}/MT commission has been locked in the deal queue.`);
    setIsClientModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Assigned Materials &amp; Broker Pitching Desk
          </h1>
          <p className="text-xs text-slate-500">
            Exclusive materials assigned by Al Shaheed. Present to your verified buyer network with fixed dollar-per-ton commission.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((asg) => (
          <div
            key={asg.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between hover:border-amber-500/40 transition-all"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  Assigned Lot #{asg.id}
                </span>
                <Badge status={asg.status} size="sm" />
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {asg.materialName}
              </h3>

              <div className="mt-3 p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Assigned Volume:</span>
                  <strong className="text-slate-900 dark:text-white">{asg.quantityMT} MT</strong>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Target Client Price:</span>
                  <strong className="text-slate-900 dark:text-white">${asg.targetSalesPrice}/MT</strong>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-amber-200 dark:border-amber-800/80">
                  <span className="text-amber-800 dark:text-amber-300 font-bold">Your Commission:</span>
                  <span className="text-sm font-black text-amber-700 dark:text-amber-400">
                    ${asg.agentRatePerTon}/MT
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Expected Payout:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    ${asg.calculatedAgentAmount.toLocaleString()} USD
                  </span>
                </div>
              </div>

              {asg.commercialTerms && (
                <p className="text-[11px] text-slate-500 mt-2.5 line-clamp-2">
                  <strong>Desk Guidelines:</strong> {asg.commercialTerms}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                id={`present-buyer-${asg.id}`}
                onClick={() => handleOpenClientModal(asg)}
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Client Buying Proposal &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Client Proposal */}
      <Modal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title="Submit Client Buying Proposal to Al Shaheed Desk"
        subtitle={`Lot: ${selectedAsg?.materialName} &bull; Your Rate: $${selectedAsg?.agentRatePerTon}/MT`}
        maxWidth="md"
      >
        <form onSubmit={handleClientSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Client Company Name *
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Tata Steel Mills / Jindal Recycling Corp"
              value={clientForm.clientCompanyName}
              onChange={(e) => setClientForm({ ...clientForm, clientCompanyName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Client Country *
              </label>
              <input
                required
                type="text"
                value={clientForm.clientCountry}
                onChange={(e) => setClientForm({ ...clientForm, clientCountry: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Offered Price ($/MT) *
              </label>
              <input
                required
                type="number"
                value={clientForm.offeredPricePerMT}
                onChange={(e) => setClientForm({ ...clientForm, offeredPricePerMT: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Quantity MT *
            </label>
            <input
              required
              type="number"
              value={clientForm.quantityMT}
              onChange={(e) => setClientForm({ ...clientForm, quantityMT: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
            />
          </div>

          {/* Guaranteed Commission Callout */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300">
            <span className="text-[10px] uppercase font-bold block">Guaranteed Commission on Closure:</span>
            <strong className="text-sm">
              {clientForm.quantityMT} MT &times; ${selectedAsg?.agentRatePerTon}/MT = ${(clientForm.quantityMT * (selectedAsg?.agentRatePerTon || 0)).toLocaleString()} USD
            </strong>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Payment Terms &amp; Readiness
            </label>
            <textarea
              rows={2}
              value={clientForm.notes}
              onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsClientModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
            >
              Transmit Deal Proposal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
