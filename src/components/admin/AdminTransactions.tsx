import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Transaction } from '../../types';
import {
  ArrowLeftRight,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Ship,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Clock,
  Building2,
  XCircle,
  Download,
  AlertTriangle,
  Printer,
} from 'lucide-react';
import { printTradeDocument, downloadCSV } from '../../utils/documentPrinter';

export const AdminTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const [statusForm, setStatusForm] = useState({
    status: 'IN_PROGRESS',
    paymentStatus: 'ADVANCE_RECEIVED',
    shipmentStatus: 'CONTAINER_LOADED',
  });

  const [cancelForm, setCancelForm] = useState({
    reason: 'Commercial terms disagreement or LC expiration',
    financialImpact: 0,
    notes: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenStatusModal = (txn: Transaction) => {
    setSelectedTxn(txn);
    setStatusForm({
      status: txn.status,
      paymentStatus: txn.paymentStatus,
      shipmentStatus: txn.shipmentStatus,
    });
    setIsStatusModalOpen(true);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxn) return;
    try {
      await api.updateTransactionStatus(selectedTxn.id, statusForm);
      setIsStatusModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenCancelModal = (txn: Transaction) => {
    setSelectedTxn(txn);
    setCancelForm({
      reason: 'Buyer LC issuance expired',
      financialImpact: 0,
      notes: '',
    });
    setIsCancelModalOpen(true);
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxn) return;
    try {
      await api.cancelTransaction(selectedTxn.id, cancelForm.reason, cancelForm.financialImpact, cancelForm.notes);
      setIsCancelModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = transactions.filter((t) => {
    const matchSearch =
      t.dealCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !selectedStatus || t.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  // Summary Metrics
  const totalVolumeMT = transactions.reduce((acc, t) => acc + t.quantity, 0);
  const totalGrossProfit = transactions.reduce((acc, t) => acc + t.grossMargin, 0);
  const totalCommissions = transactions.reduce((acc, t) => acc + t.totalAgentCommission, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Deal Transactions &amp; Settlement Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Real-time trade lifecycle tracking, purchase &amp; sales records, margins, and shipping milestones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const headers = [
                'Deal Code',
                'Material Name',
                'Quantity MT',
                'Incoterms',
                'Supplier',
                'Buyer',
                'Purchase USD',
                'Sales USD',
                'Gross Margin USD',
                'Agent',
                'Agent Commission USD',
                'Status',
                'Payment Status',
                'Shipment Status',
                'Origin Port',
                'Destination Port',
                'Created At',
              ];
              const rows = transactions.map((t) => [
                t.dealCode,
                t.materialName,
                t.quantity,
                t.incoterms,
                t.supplierName,
                t.buyerName,
                t.totalPurchaseValue,
                t.totalSalesValue,
                t.grossMargin,
                t.agentName || 'Direct',
                t.totalAgentCommission,
                t.status,
                t.paymentStatus,
                t.shipmentStatus,
                t.originPort,
                t.destinationPort,
                new Date(t.createdAt).toLocaleDateString(),
              ]);
              downloadCSV('al_shaheed_deals_settlement_ledger_2026', headers, rows);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            type="button"
            onClick={() => {
              const rows = transactions.map((t) => [
                t.dealCode,
                `${t.materialName} (${t.quantity} MT)`,
                `S: ${t.supplierName} / B: ${t.buyerName}`,
                `$${t.totalSalesValue.toLocaleString()}`,
                `+$${t.grossMargin.toLocaleString()}`,
                t.status,
              ]);
              printTradeDocument({
                title: 'International Scrap Deals & Settlement Audit Ledger',
                docType: 'Official Transaction Audit Record',
                refNumber: 'TXN-AUDIT-2026',
                details: [
                  { label: 'Total Recorded Deals', value: `${transactions.length} Contracts` },
                  { label: 'Accumulated Volume', value: `${totalVolumeMT.toLocaleString()} MT` },
                  { label: 'Realized Arbitrage Margin', value: `+$${totalGrossProfit.toLocaleString()} USD` },
                  { label: 'Agent Disbursements', value: `$${totalCommissions.toLocaleString()} USD` },
                ],
                tables: [
                  {
                    headers: ['Deal Code', 'Commodity & Quantity', 'Parties (Supplier / Buyer)', 'Sales Value (USD)', 'Gross Margin', 'Status'],
                    rows: rows,
                  },
                ],
                notes: [
                  'All deals documented herein represent verified CIF/FOB shipments via Hamad Port and partnered international discharge terminals.',
                ],
              });
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Ledger
          </button>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-right">
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase block">
              Realized Gross Margin
            </span>
            <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
              +${totalGrossProfit.toLocaleString()} USD
            </span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search deal code, material, buyer, supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200"
          >
            <option value="">All Deal Statuses</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="SOLD">SOLD</option>
            <option value="MATCHED">MATCHED</option>
            <option value="CANCELLED">CANCELLED (Red)</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3">Deal Code</th>
              <th className="px-4 py-3">Material &amp; Volume</th>
              <th className="px-4 py-3">Counterparties</th>
              <th className="px-4 py-3">Financials (Purchase vs Sale)</th>
              <th className="px-4 py-3">Gross Margin</th>
              <th className="px-4 py-3">Agent ($/MT)</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3.5">
                  <span className="font-mono font-bold text-slate-900 dark:text-white block">
                    {t.dealCode}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </span>
                </td>

                <td className="px-4 py-3.5">
                  <div className="font-bold text-slate-900 dark:text-white">{t.materialName}</div>
                  <div className="text-[11px] text-slate-500">
                    {t.quantity} {t.unit} &bull; {t.incoterms}
                  </div>
                </td>

                <td className="px-4 py-3.5">
                  <div className="text-purple-700 dark:text-purple-400 font-semibold truncate max-w-[140px]">
                    S: {t.supplierName}
                  </div>
                  <div className="text-blue-700 dark:text-blue-400 font-semibold truncate max-w-[140px]">
                    B: {t.buyerName}
                  </div>
                </td>

                <td className="px-4 py-3.5">
                  <div className="text-slate-600 dark:text-slate-400">
                    Buy: ${t.purchasePricePerUnit}/MT (${t.totalPurchaseValue.toLocaleString()})
                  </div>
                  <div className="font-bold text-emerald-700 dark:text-emerald-400">
                    Sell: ${t.sellingPricePerUnit}/MT (${t.totalSalesValue.toLocaleString()})
                  </div>
                </td>

                <td className="px-4 py-3.5">
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    +${t.grossMargin.toLocaleString()}
                  </span>
                </td>

                <td className="px-4 py-3.5">
                  {t.agentName ? (
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        {t.agentName}
                      </span>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400">
                        ${t.agentCommissionPerTon}/MT (${t.totalAgentCommission.toLocaleString()})
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400">Direct Principal</span>
                  )}
                </td>

                <td className="px-4 py-3.5">
                  <Badge status={t.status} size="sm" />
                </td>

                <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                  <button
                    onClick={() => {
                      setSelectedTxn(t);
                      setIsDetailModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-[11px] text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleOpenStatusModal(t)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-500"
                  >
                    Update
                  </button>
                  {t.status !== 'CANCELLED' && t.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleOpenCancelModal(t)}
                      className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[11px] hover:bg-rose-100"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Transaction Details Breakdown */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Commercial Deal Sheet: ${selectedTxn?.dealCode}`}
        subtitle={`Material: ${selectedTxn?.materialName} (${selectedTxn?.quantity} MT)`}
        maxWidth="3xl"
      >
        {selectedTxn && (
          <div className="space-y-4 text-xs">
            {/* Top Stat Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-900 text-white">
              <div>
                <span className="text-[10px] text-slate-400 block">Total Purchase Cost</span>
                <strong className="text-base">${selectedTxn.totalPurchaseValue.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Total Sales Revenue</span>
                <strong className="text-base text-emerald-400">
                  ${selectedTxn.totalSalesValue.toLocaleString()}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Gross Trading Margin</span>
                <strong className="text-base text-emerald-300">
                  +${selectedTxn.grossMargin.toLocaleString()}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Contract Status</span>
                <div className="mt-1">
                  <Badge status={selectedTxn.status} size="sm" />
                </div>
              </div>
            </div>

            {/* Logistics and Port Routing */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px]">Origin Port</span>
                <strong className="text-slate-800 dark:text-slate-200">{selectedTxn.originPort}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Destination Port</span>
                <strong className="text-slate-800 dark:text-slate-200">{selectedTxn.destinationPort}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Payment Status</span>
                <strong className="text-emerald-700 dark:text-emerald-400">{selectedTxn.paymentStatus}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Shipment Status</span>
                <strong className="text-blue-700 dark:text-blue-400">{selectedTxn.shipmentStatus}</strong>
              </div>
            </div>

            {/* Counterparty identities */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                <span className="font-bold text-purple-900 dark:text-purple-300 block mb-1">
                  Supplier Details
                </span>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedTxn.supplierName}
                </div>
                <div className="text-slate-500">Asking Price: ${selectedTxn.purchasePricePerUnit}/MT</div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <span className="font-bold text-blue-900 dark:text-blue-300 block mb-1">
                  Buyer Details
                </span>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedTxn.buyerName}
                </div>
                <div className="text-slate-500">Contracted Price: ${selectedTxn.sellingPricePerUnit}/MT</div>
              </div>
            </div>

            {selectedTxn.cancellationDetails && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300">
                <strong className="block font-bold">Cancellation Audit Record:</strong>
                <div>Reason: {selectedTxn.cancellationDetails.reason}</div>
                <div>Cancelled By: {selectedTxn.cancellationDetails.cancelledBy}</div>
                <div>Financial Impact: ${selectedTxn.cancellationDetails.financialImpact}</div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="text-[11px] text-slate-400">
                Transaction ID: <span className="font-mono">{selectedTxn.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const headers = [
                      'Property',
                      'Value',
                    ];
                    const rows = [
                      ['Deal Code', selectedTxn.dealCode],
                      ['Material', selectedTxn.materialName],
                      ['Quantity MT', selectedTxn.quantity],
                      ['Incoterms', selectedTxn.incoterms],
                      ['Supplier', selectedTxn.supplierName],
                      ['Buyer', selectedTxn.buyerName],
                      ['Purchase Price USD/MT', selectedTxn.purchasePricePerUnit],
                      ['Total Purchase USD', selectedTxn.totalPurchaseValue],
                      ['Selling Price USD/MT', selectedTxn.sellingPricePerUnit],
                      ['Total Sales USD', selectedTxn.totalSalesValue],
                      ['Gross Margin USD', selectedTxn.grossMargin],
                      ['Agent Name', selectedTxn.agentName || 'None'],
                      ['Agent Commission USD', selectedTxn.totalAgentCommission],
                      ['Status', selectedTxn.status],
                      ['Payment Status', selectedTxn.paymentStatus],
                      ['Shipment Status', selectedTxn.shipmentStatus],
                      ['Origin Port', selectedTxn.originPort],
                      ['Destination Port', selectedTxn.destinationPort],
                      ['Date', new Date(selectedTxn.createdAt).toLocaleDateString()],
                    ];
                    downloadCSV(`deal_sheet_${selectedTxn.dealCode}`, headers, rows);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Deal Sheet
                </button>
                <button
                  type="button"
                  onClick={() =>
                    printTradeDocument({
                      title: `Commercial Trade Contract & Settlement Sheet: ${selectedTxn.dealCode}`,
                      docType: 'Official Commercial Settlement',
                      refNumber: selectedTxn.dealCode,
                      counterparty: `${selectedTxn.supplierName} (Seller) ➔ ${selectedTxn.buyerName} (Buyer)`,
                      date: new Date(selectedTxn.createdAt).toLocaleDateString(),
                      details: [
                        { label: 'Commodity Material', value: selectedTxn.materialName },
                        { label: 'Contracted Quantity', value: `${selectedTxn.quantity} ${selectedTxn.unit}` },
                        { label: 'Trade Terms', value: selectedTxn.incoterms },
                        { label: 'Deal Status', value: selectedTxn.status },
                        { label: 'Origin Shipping Port', value: selectedTxn.originPort },
                        { label: 'Destination Discharge Port', value: selectedTxn.destinationPort },
                        { label: 'Payment Milestone', value: selectedTxn.paymentStatus },
                        { label: 'Shipment Milestone', value: selectedTxn.shipmentStatus },
                      ],
                      tables: [
                        {
                          headers: ['Leg / Component', 'Rate ($/MT)', 'Total Commercial Value (USD)'],
                          rows: [
                            ['Supplier Purchase (Inbound)', `$${selectedTxn.purchasePricePerUnit}/MT`, `$${selectedTxn.totalPurchaseValue.toLocaleString()} USD`],
                            ['Buyer Sales (Outbound)', `$${selectedTxn.sellingPricePerUnit}/MT`, `$${selectedTxn.totalSalesValue.toLocaleString()} USD`],
                            ['Al Shaheed Gross Arbitrage Margin', `+$${(selectedTxn.sellingPricePerUnit - selectedTxn.purchasePricePerUnit)}/MT`, `+$${selectedTxn.grossMargin.toLocaleString()} USD`],
                            ['Brokerage / Agent Allocation', `$${selectedTxn.agentCommissionPerTon}/MT`, `$${selectedTxn.totalAgentCommission.toLocaleString()} USD`],
                          ],
                        },
                      ],
                      notes: [
                        'Payment execution subject to verifiable Letter of Credit (LC) or swift bank transfer verification.',
                        'Inspection certificate and bill of lading (BL) must accompany shipping clearing documents.',
                      ],
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold hover:bg-slate-800 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Contract
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Status Update */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Transaction Lifecycle Milestones"
        subtitle={`Deal: ${selectedTxn?.dealCode}`}
        maxWidth="md"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Overall Deal Status *
            </label>
            <select
              value={statusForm.status}
              onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
            >
              <option value="IN_PROGRESS">IN_PROGRESS (Active Trade Execution)</option>
              <option value="COMPLETED">COMPLETED (Fully Settled &amp; Delivered)</option>
              <option value="SOLD">SOLD (Mark in Red)</option>
              <option value="MATCHED">MATCHED</option>
              <option value="CANCELLED">CANCELLED (Mark in Dark Red)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Payment &amp; Financial Status *
            </label>
            <select
              value={statusForm.paymentStatus}
              onChange={(e) => setStatusForm({ ...statusForm, paymentStatus: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            >
              <option value="ADVANCE_RECEIVED">Advance Payment Received (20%)</option>
              <option value="LC_OPENED_AND_VERIFIED">LC Irrevocable Opened &amp; Verified</option>
              <option value="DOCUMENTS_RELEASED">Documents Released Against Acceptance</option>
              <option value="FULLY_SETTLED">100% Funds Fully Settled</option>
              <option value="PENDING">Pending Initial Deposit</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Shipment &amp; Logistics Milestone *
            </label>
            <select
              value={statusForm.shipmentStatus}
              onChange={(e) => setStatusForm({ ...statusForm, shipmentStatus: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            >
              <option value="CARGO_ACCUMULATION">Cargo Accumulation at Depot</option>
              <option value="CONTAINER_LOADED">Containers Stuffed &amp; Sealed</option>
              <option value="SGS_INSPECTION_PASSED">SGS Inspection Passed &amp; Certified</option>
              <option value="CUSTOMS_CLEARED">Customs Export Cleared</option>
              <option value="ON_BOARD_VESSEL">On-Board Maritime Vessel (BL Issued)</option>
              <option value="ARRIVED_AT_DESTINATION">Arrived at Destination Discharge Port</option>
              <option value="DELIVERED_TO_BUYER">Delivered to Buyer Foundry / Yard</option>
            </select>
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
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold"
            >
              Save Milestones
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Cancel Deal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Commercial Transaction"
        subtitle={`Cancel Deal: ${selectedTxn?.dealCode}`}
        maxWidth="md"
      >
        <form onSubmit={handleCancelSubmit} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300">
            <strong className="block font-bold">Important Notice:</strong>
            Cancelling this transaction will automatically re-open the supplier scrap listing to AVAILABLE status for re-matching on the marketplace.
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Cancellation Reason *
            </label>
            <textarea
              required
              rows={2}
              value={cancelForm.reason}
              onChange={(e) => setCancelForm({ ...cancelForm, reason: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              placeholder="e.g. Buyer failed to open LC within the contractual 14-day window..."
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Financial Impact / Incurred Demurrage ($ USD)
            </label>
            <input
              type="number"
              value={cancelForm.financialImpact}
              onChange={(e) => setCancelForm({ ...cancelForm, financialImpact: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 font-semibold"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
            >
              Confirm Cancellation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
