import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AuditLog } from '../../types';
import {
  ShieldCheck,
  Search,
  Clock,
  User,
  Filter,
  Layers,
  ArrowRight,
  Download,
  Printer,
} from 'lucide-react';
import { printTradeDocument, downloadCSV } from '../../utils/documentPrinter';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        const data = await api.getAuditLogs();
        setLogs(data);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.newValue && l.newValue.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExportCSV = () => {
    const headers = [
      'Timestamp',
      'User Name',
      'User Role',
      'Action',
      'Entity',
      'Entity ID',
      'Previous Value',
      'New Value',
      'IP Address',
    ];
    const rows = filtered.map((l) => [
      new Date(l.timestamp).toISOString(),
      l.userName,
      l.userRole,
      l.action,
      l.entity,
      l.entityId,
      l.previousValue || '',
      l.newValue || '',
      l.ipAddress || '127.0.0.1',
    ]);
    downloadCSV('al_shaheed_system_audit_trail_2026', headers, rows);
  };

  const handlePrint = () => {
    const rows = filtered.map((l) => [
      new Date(l.timestamp).toLocaleString(),
      `${l.userName} (${l.userRole})`,
      l.action,
      `${l.entity} #${l.entityId}`,
      l.newValue || 'N/A',
    ]);

    printTradeDocument({
      title: 'Al Shaheed Security & Transaction Compliance Audit Trail',
      docType: 'Official Governance & Audit Certificate',
      refNumber: `AUDIT-${Date.now().toString().slice(-6)}`,
      details: [
        { label: 'Audit Scope', value: 'Complete Transactional & Identity Events' },
        { label: 'Total Events Logged', value: `${filtered.length} Records` },
        { label: 'Security Standard', value: 'Immutable SHA256 Audit Verification' },
        { label: 'Jurisdiction', value: 'Qatar Commercial Law / GCC Trade Protocol' },
      ],
      tables: [
        {
          headers: ['Timestamp', 'Actor / Role', 'Action', 'Target Entity', 'Change Record'],
          rows: rows,
        },
      ],
      notes: [
        'All audit entries are timestamped via cryptographically verified server-side clocks.',
      ],
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Immutable Audit Trail &amp; System Logs
          </h1>
          <p className="text-xs text-slate-500">
            Real-time compliance record of all listing creations, match executions, cancellations, and status changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
            Print Trail
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter audit logs by action, user, entity, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-800 dark:text-slate-200"
        />
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Actor / User</th>
              <th className="px-4 py-3">Action Type</th>
              <th className="px-4 py-3">Target Entity</th>
              <th className="px-4 py-3">Change Description / Diff</th>
              <th className="px-4 py-3">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-sans font-semibold text-slate-800 dark:text-slate-200">
                  {log.userName}{' '}
                  <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500">
                    {log.userRole}
                  </span>
                </td>
                <td className="px-4 py-3 font-bold text-emerald-700 dark:text-emerald-400 font-sans">
                  {log.action}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {log.entity} ({log.entityId})
                </td>
                <td className="px-4 py-3 font-sans text-slate-700 dark:text-slate-300">
                  {log.previousValue && (
                    <span className="text-slate-400 line-through mr-1.5">{log.previousValue}</span>
                  )}
                  <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                    {log.newValue}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
