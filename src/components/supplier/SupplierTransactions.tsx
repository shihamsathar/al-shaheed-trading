import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';
import { Transaction } from '../../types';
import {
  ArrowLeftRight,
  Ship,
  DollarSign,
  CheckCircle2,
  Clock,
  FileText,
  Download,
  Printer,
} from 'lucide-react';
import { printTradeDocument, downloadCSV } from '../../utils/documentPrinter';

export const SupplierTransactions: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTxns() {
      try {
        setLoading(true);
        const data = await api.getTransactions();
        const myTxns = data.filter((t) => t.supplierId === user?.id || !t.supplierId);
        setTransactions(myTxns);
      } catch (err) {
        console.error('Failed to load supplier transactions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTxns();
  }, [user]);

  const totalVolume = transactions.reduce((acc, t) => acc + t.quantity, 0);
  const totalReceivables = transactions.reduce((acc, t) => acc + t.totalPurchaseValue, 0);

  const handleExportCSV = () => {
    const headers = [
      'Deal Code',
      'Material Lot',
      'Quantity MT',
      'Purchase Price USD/MT',
      'Total Payable USD',
      'Payment Status',
      'Shipment Milestone',
      'Status',
      'Origin Port',
      'Date',
    ];
    const rows = transactions.map((t) => [
      t.dealCode,
      t.materialName,
      t.quantity,
      t.purchasePricePerUnit,
      t.totalPurchaseValue,
      t.paymentStatus,
      t.shipmentStatus,
      t.status,
      t.originPort,
      new Date(t.createdAt).toLocaleDateString(),
    ]);
    downloadCSV(`supplier_sales_orders_${user?.name || 'supplier'}`, headers, rows);
  };

  const handlePrint = () => {
    const rows = transactions.map((t) => [
      t.dealCode,
      `${t.materialName} (${t.quantity} MT)`,
      `$${t.purchasePricePerUnit}/MT`,
      `$${t.totalPurchaseValue.toLocaleString()} USD`,
      t.paymentStatus,
      t.status,
    ]);

    printTradeDocument({
      title: 'Supplier Scrap Sales Orders & Settlement Ledger',
      docType: 'Official Sales & Dispatches Statement',
      refNumber: `SUP-${user?.id?.substring(0, 6).toUpperCase() || 'TXN-2026'}`,
      counterparty: `Supplier Enterprise: ${user?.name || 'Scrap Supplier Organization'} (${user?.company || 'Authorized Metal Recycler'})`,
      details: [
        { label: 'Registered Supplier', value: user?.name || 'Supply Counterparty' },
        { label: 'Active Trade Contracts', value: `${transactions.length} Orders` },
        { label: 'Total Volume Dispatched', value: `${totalVolume.toLocaleString()} MT` },
        { label: 'Gross Sales Proceeds (USD)', value: `$${totalReceivables.toLocaleString()} USD` },
      ],
      tables: [
        {
          headers: ['Deal Code', 'Scrap Material', 'Purchase Price ($/MT)', 'Total Receivables', 'Payment Status', 'Trade Status'],
          rows: rows,
        },
      ],
      notes: [
        'Payment execution adheres to agreed LC / TT milestone terms upon presentation of verified weighing slips.',
        'Inspections performed under SGS / Bureau Veritas international certification standards.',
      ],
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Sales Orders &amp; Export Shipments
          </h1>
          <p className="text-xs text-slate-500">
            Track sales confirmed by Al Shaheed, container dispatch, LC releases, and settlements.
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
            Print Ledger
          </button>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-right">
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase block">
              Total Contracted Sales
            </span>
            <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
              ${totalReceivables.toLocaleString()} USD
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3">Deal Code</th>
              <th className="px-4 py-3">Material Lot</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Agreed Purchase Price</th>
              <th className="px-4 py-3">Total Payable to Supplier</th>
              <th className="px-4 py-3">Payment Status</th>
              <th className="px-4 py-3">Shipment Milestone</th>
              <th className="px-4 py-3">Deal Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                  {t.dealCode}
                </td>
                <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                  {t.materialName}
                </td>
                <td className="px-4 py-3.5 font-semibold">
                  {t.quantity} {t.unit}
                </td>
                <td className="px-4 py-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                  ${t.purchasePricePerUnit}/MT
                </td>
                <td className="px-4 py-3.5 font-black text-slate-900 dark:text-white">
                  ${t.totalPurchaseValue.toLocaleString()} USD
                </td>
                <td className="px-4 py-3.5">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold text-[10px]">
                    {t.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                  {t.shipmentStatus}
                </td>
                <td className="px-4 py-3.5">
                  <Badge status={t.status} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
