import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  BarChart3,
  TrendingUp,
  Download,
  DollarSign,
  Boxes,
  PieChart,
  Calendar,
  Layers,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import { printTradeDocument, downloadCSV } from '../../utils/documentPrinter';

export const AdminReports: React.FC = () => {
  const [chartsData, setChartsData] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        const [cData, sum] = await Promise.all([
          api.getAnalyticsCharts(),
          api.getAnalyticsSummary(),
        ]);
        setChartsData(cData);
        setSummary(sum);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const handlePrint = () => {
    const rows = (chartsData?.monthlyTrends || []).map((t: any) => [
      t.month,
      `$${Number(t.purchaseUSD).toLocaleString()} USD`,
      `$${Number(t.salesUSD).toLocaleString()} USD`,
      `+$${Number(t.marginUSD).toLocaleString()} USD`,
      `${Number(t.volumeMT).toLocaleString()} MT`,
    ]);

    const commodityRows = (chartsData?.commodityBreakdown || []).map((c: any) => [
      c.name,
      `${Number(c.volumeMT).toLocaleString()} MT`,
      `$${Number(c.valueUSD).toLocaleString()} USD`,
      'Active Arbitrage Trade Flow',
    ]);

    printTradeDocument({
      title: 'Commercial Trading & Financial Arbitrage Performance Report',
      docType: 'Executive Analytics Statement',
      refNumber: 'RPT-2026-Q1/Q2',
      details: [
        { label: 'Total Sales Turnover', value: `$${(summary?.totalSalesValue || 0).toLocaleString()} USD` },
        { label: 'Realized Gross Margin', value: `+$${(summary?.totalGrossMargin || 0).toLocaleString()} USD` },
        { label: 'Traded Scrap Volume', value: `${(summary?.totalAvailableMT || 0).toLocaleString()} MT` },
        { label: 'Agent Disbursed Commissions', value: `$${(summary?.totalAgentCommissions || 0).toLocaleString()} USD` },
      ],
      tables: [
        {
          headers: ['Month', 'Purchase (USD)', 'Sales Turnover (USD)', 'Gross Margin (USD)', 'Volume (MT)'],
          rows: rows,
        },
        {
          headers: ['Commodity Category', 'Physical Volume (MT)', 'Estimated Cargo Value (USD)', 'Status'],
          rows: commodityRows,
        },
      ],
      notes: [
        'All scrap trades comply with ISRI circular economy codes and bilateral maritime contracts.',
        'Gross arbitrage margins are calculated after all loading, port handling, and agent $/MT fee disbursements.',
      ],
    });
  };

  const handleExportCSV = () => {
    const headers = ['Month', 'Purchase USD', 'Sales USD', 'Gross Margin USD', 'Volume MT'];
    const rows = (chartsData?.monthlyTrends || []).map((t: any) => [
      t.month,
      t.purchaseUSD,
      t.salesUSD,
      t.marginUSD,
      t.volumeMT,
    ]);
    downloadCSV('al_shaheed_executive_trading_report_2026', headers, rows);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3" />
        Generating Executive Trading Analytics...
      </div>
    );
  }

  const maxVolume = Math.max(...(chartsData?.commodityBreakdown?.map((c: any) => c.volumeMT) || [1000]));
  const maxTrendSales = Math.max(...(chartsData?.monthlyTrends?.map((t: any) => t.salesUSD) || [1000000]));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Trading Intelligence &amp; Financial Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Monthly commercial turnover, gross arbitrage margins, commodity volumes, and maritime trade flows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Financial Metrics Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Sales Turnover
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            ${(summary?.totalSalesValue || 0).toLocaleString()} USD
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            +18.4% vs last quarter
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Gross Trading Profit Margin
          </span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            +${(summary?.totalGrossMargin || 0).toLocaleString()} USD
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Avg spread: $28.50 / MT
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Traded Scrap Volume
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {(summary?.totalAvailableMT || 0).toLocaleString()} MT
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across 15 maritime routes
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Agent Commissions Disbursed
          </span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            ${(summary?.totalAgentCommissions || 0).toLocaleString()} USD
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Based on $/MT contracts
          </div>
        </div>
      </div>

      {/* Two Column Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Financial Trends Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Monthly Trading Turnover &amp; Gross Margins (USD)
              </h3>
              <p className="text-xs text-slate-500">6-Month Trading Velocity</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Sales Revenue
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-400" /> Purchase Cost
              </span>
            </div>
          </div>

          <div className="space-y-3 mt-6">
            {chartsData?.monthlyTrends?.map((item: any) => {
              const salesPct = Math.round((item.salesUSD / maxTrendSales) * 100);
              const purchasePct = Math.round((item.purchaseUSD / maxTrendSales) * 100);
              return (
                <div key={item.month} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="w-10 text-slate-700 dark:text-slate-300 font-bold">{item.month}</span>
                    <span className="text-slate-500 text-[11px]">
                      Sales: ${item.salesUSD.toLocaleString()} | Margin: +${item.marginUSD.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex gap-1 p-0.5">
                    <div
                      className="bg-emerald-500 h-full rounded-md transition-all duration-500"
                      style={{ width: `${salesPct}%` }}
                    />
                    <div
                      className="bg-slate-400 h-full rounded-md transition-all duration-500 opacity-60"
                      style={{ width: `${purchasePct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Commodity Volume Distribution */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Commodity Volume Breakdown (MT)
              </h3>
              <p className="text-xs text-slate-500">Inventory volume by scrap category</p>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            {chartsData?.commodityBreakdown?.map((cat: any) => {
              const pct = Math.round((cat.volumeMT / maxVolume) * 100);
              return (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-900 dark:text-white font-bold">{cat.name}</span>
                    <span className="text-slate-600 dark:text-slate-400 font-mono">
                      {cat.volumeMT.toLocaleString()} MT (${cat.valueUSD.toLocaleString()})
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
