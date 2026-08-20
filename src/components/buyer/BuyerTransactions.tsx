import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';
import { Transaction } from '../../types';
import {
  ShoppingBag,
  Ship,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Download,
  Printer,
} from 'lucide-react';
import { printTradeDocument, downloadCSV } from '../../utils/documentPrinter';

export const BuyerTransactions: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTxns() {
      try {
        setLoading(true);
        const data = await api.getTransactions();
        const myTxns = data.filter((t) => t.buyerId === user?.id || !t.buyerId);
        setTransactions(myTxns);
      } catch (err) {
        console.error('Failed to load buyer transactions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTxns();
  }, [user]);

  const totalVolume = transactions.reduce((acc, t) => acc + t.quantity, 0);
  const totalProcuredUSD = transactions.reduce((acc, t) => acc + t.totalSalesValue, 0);

  const handleExportCSV = () => {
    const headers = [
      'Contract Deal Code',
      'Material Lot',
      'Volume MT',
      'Contract Price USD/MT',
      'Total Invoice Value USD',
      'Discharge Port',
      'Logistics Status',
      'Trade Status',
      'Date',
    ];
    const rows = transactions.map((t) => [
      t.dealCode,
      t.materialName,
      t.quantity,
      t.sellingPricePerUnit,
      t.totalSalesValue,
      t.destinationPort,
      t.shipmentStatus,
      t.status,
      new Date(t.createdAt).toLocaleDateString(),
    ]);
    downloadCSV(`buyer_procurement_contracts_${user?.name || 'buyer'}`, headers, rows);
  };

  const handlePrint = () => {
    const rows = transactions.map((t) => [
      t.dealCode,
      `${t.materialName} (${t.quantity} MT)`,
      `$${t.sellingPricePerUnit}/MT`,
      `$${t.totalSalesValue.toLocaleString()} USD`,
      t.destinationPort,
      t.shipmentStatus,
      t.status,
    ]);

    printTradeDocument({
      title: 'Buyer Scrap Procurement Contracts & Invoices',
      docType: 'Official Commercial Procurement Statement',
      refNumber: `BUY-${user?.id?.substring(0, 6).toUpperCase() || 'PROC-2026'}`,
      counterparty: `Procuring Foundry / Mill: ${user?.name || 'Buyer Enterprise'} (${user?.company || 'Certified Smelter & Mill'})`,
      details: [
        { label: 'Authorized Buyer', value: user?.name || 'Procurement Buyer' },
        { label: 'Contracted Shipments', value: `${transactions.length} Purchase Contracts` },
        { label: 'Total Volume Secured', value: `${totalVolume.toLocaleString()} MT` },
        { label: 'Gross Procurement Value (USD)', value: `$${totalProcuredUSD.toLocaleString()} USD` },
      ],
      tables: [
        {
          headers: ['Contract Code', 'Scrap Commodity', 'Agreed Price ($/MT)', 'Total Invoice Value', 'Destination Port', 'Logistics Milestone', 'Status'],
          rows: rows,
        },
      ],
      notes: [
        'All shipments guaranteed conforming to contracted ISRI specifications and moisture thresholds.',
        'Official original Bills of Lading (BL) and SGS Certificates of Analysis released through nominated banks.',
      ],
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Procurement Contracts &amp; Container Tracking
          </h1>
          <p className="text-xs text-slate-500">
            Track confirmed scrap purchase contracts, Bill of Lading releases, and vessel arrivals at your discharge port.
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

          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-right">
            <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase block">
              Total Contracted Value
            </span>
            <span className="text-base font-black text-blue-700 dark:text-blue-400">
              ${totalProcuredUSD.toLocaleString()} USD
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3">Contract / Deal Code</th>
              <th className="px-4 py-3">Material Lot</th>
              <th className="px-4 py-3">Volume</th>
              <th className="px-4 py-3">Contract Price</th>
              <th className="px-4 py-3">Total Invoice Value</th>
              <th className="px-4 py-3">Discharge Port</th>
              <th className="px-4 py-3">Logistics Status</th>
              <th className="px-4 py-3">Trade Status</th>
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
                <td className="px-4 py-3.5 font-bold text-blue-600 dark:text-blue-400">
                  ${t.sellingPricePerUnit}/MT
                </td>
                <td className="px-4 py-3.5 font-black text-slate-900 dark:text-white">
                  ${t.totalSalesValue.toLocaleString()} USD
                </td>
                <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300">
                  {t.destinationPort}
                </td>
                <td className="px-4 py-3.5">
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold text-[10px]">
                    {t.shipmentStatus}
                  </span>
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
