import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';
import { AgentAssignment } from '../../types';
import {
  DollarSign,
  Award,
  CheckCircle2,
  Clock,
  Download,
  Printer,
} from 'lucide-react';
import { printTradeDocument, downloadCSV } from '../../utils/documentPrinter';

export const AgentCommissionLedger: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<AgentAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLedger() {
      try {
        setLoading(true);
        const data = await api.getAgentAssignments();
        const myAssignments = data.filter((a) => a.agentId === user?.id || !a.agentId);
        setAssignments(myAssignments);
      } catch (err) {
        console.error('Failed to load commission ledger:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLedger();
  }, [user]);

  const totalCalculated = assignments.reduce((acc, a) => acc + (a.calculatedAgentAmount || 0), 0);
  const totalSettled = assignments
    .filter((a) => a.status === 'COMMERCIAL_CLOSED' || a.status === 'SOLD')
    .reduce((acc, a) => acc + (a.calculatedAgentAmount || 0), 0);

  const handleExportCSV = () => {
    const headers = [
      'Assignment Ref',
      'Material Name',
      'Volume MT',
      'Commission Rate USD/MT',
      'Total Commission USD',
      'Status',
      'Assigned Date',
    ];
    const rows = assignments.map((a) => [
      `ASG-${a.id}`,
      a.materialName,
      a.quantityMT,
      a.agentRatePerTon,
      a.calculatedAgentAmount,
      a.status,
      new Date(a.assignedAt).toLocaleDateString(),
    ]);
    downloadCSV(`agent_commission_ledger_${user?.name || 'agent'}`, headers, rows);
  };

  const handlePrint = () => {
    const rows = assignments.map((a) => [
      `ASG-${a.id}`,
      a.materialName,
      `${a.quantityMT.toLocaleString()} MT`,
      `$${a.agentRatePerTon}/MT`,
      `$${a.calculatedAgentAmount.toLocaleString()} USD`,
      a.status,
    ]);

    printTradeDocument({
      title: 'Agent Dollar-per-Ton ($/MT) Commission Statement',
      docType: 'Official Remittance & Earnings Ledger',
      refNumber: `AGT-${user?.id?.substring(0, 6).toUpperCase() || 'COMM-2026'}`,
      counterparty: `Agent Facilitator: ${user?.name || 'Commercial Desk Agent'} (${user?.email || 'trade@alshaheedtrading.com'})`,
      details: [
        { label: 'Assigned Agent', value: user?.name || 'Commercial Agent' },
        { label: 'Total Assigned Deals', value: `${assignments.length} Contracts` },
        { label: 'Total Calculated Commissions', value: `$${totalCalculated.toLocaleString()} USD` },
        { label: 'Total Settled / Disbursed', value: `$${totalSettled.toLocaleString()} USD` },
      ],
      tables: [
        {
          headers: ['Assignment Ref', 'Assigned Scrap Material', 'Volume (MT)', 'Rate ($/MT)', 'Gross Remittance', 'Status'],
          rows: rows,
        },
      ],
      notes: [
        'Commissions are disbursed strictly based on executed tonnage as verified by SGS inspection at origin load ports.',
        'Final payout releases upon commercial buyer settlement and LC liquidation.',
      ],
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Dollar-per-Ton ($/MT) Commission Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Transparent commission accounting calculated as: <strong>Volume (MT) &times; Fixed Commission Rate ($/MT)</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Statement
          </button>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-right">
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase block">
              Total Settled Earnings
            </span>
            <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
              ${totalSettled.toLocaleString()} USD
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3">Assignment Reference</th>
              <th className="px-4 py-3">Assigned Scrap Material</th>
              <th className="px-4 py-3">Volume (MT)</th>
              <th className="px-4 py-3">Commission Rate ($/MT)</th>
              <th className="px-4 py-3">Gross Commission (USD)</th>
              <th className="px-4 py-3">Payout Status</th>
              <th className="px-4 py-3">Assigned Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {assignments.map((asg) => (
              <tr key={asg.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                  ASG-{asg.id}
                </td>
                <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                  {asg.materialName}
                </td>
                <td className="px-4 py-3.5 font-semibold">{asg.quantityMT} MT</td>
                <td className="px-4 py-3.5 font-bold text-amber-700 dark:text-amber-400">
                  ${asg.agentRatePerTon}/MT
                </td>
                <td className="px-4 py-3.5 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  ${asg.calculatedAgentAmount.toLocaleString()} USD
                </td>
                <td className="px-4 py-3.5">
                  <Badge status={asg.status} size="sm" />
                </td>
                <td className="px-4 py-3.5 text-slate-400">
                  {new Date(asg.assignedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
