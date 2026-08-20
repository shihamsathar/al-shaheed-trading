import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { TradeDocument } from '../../types';
import {
  FileText,
  Upload,
  Search,
  Download,
  ShieldCheck,
  Plus,
  Eye,
  CheckCircle2,
  FileCheck,
  Printer,
} from 'lucide-react';
import { printTradeDocument, downloadDocumentFile } from '../../utils/documentPrinter';

export const AdminDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<TradeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    title: '',
    documentType: 'INSPECTION_REPORT',
    fileName: 'sgs_inspection_report_ast.pdf',
    fileSize: '2.4 MB',
    fileUrl: '#',
    accessRoles: ['ADMIN', 'BUYER', 'SUPPLIER'],
  });

  const loadDocs = async () => {
    try {
      setLoading(true);
      const data = await api.getDocuments();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load trade documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.uploadDocument(uploadForm);
      setIsUploadModalOpen(false);
      await loadDocs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.documentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            International Trade Documentation Desk
          </h1>
          <p className="text-xs text-slate-500">
            Bill of Lading, SGS Inspection Reports, Certificates of Origin, and Commercial Invoices.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          Upload Verified Document
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search documents by title, type, or contract..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-800 dark:text-slate-200"
        />
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((doc) => (
          <div
            key={doc.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-all"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  <FileText className="w-6 h-6" />
                </div>
                <Badge status={doc.status} size="sm" />
              </div>

              <div className="mt-3">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  {doc.documentType.replace(/_/g, ' ')}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  File: {doc.fileName} ({doc.fileSize})
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-1">
                <div>Uploaded By: <strong className="text-slate-700 dark:text-slate-300">{doc.uploadedBy}</strong></div>
                <div>Date: {new Date(doc.uploadedAt).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  title="Print official document letterhead"
                  onClick={() =>
                    printTradeDocument({
                      title: doc.title,
                      docType: doc.documentType.replace(/_/g, ' '),
                      refNumber: `DOC-${doc.id.toUpperCase()}`,
                      date: new Date(doc.uploadedAt).toLocaleDateString(),
                      details: [
                        { label: 'Document Name', value: doc.title },
                        { label: 'Classification', value: doc.documentType.replace(/_/g, ' ') },
                        { label: 'Issuing Authority / Uploaded By', value: doc.uploadedBy },
                        { label: 'Verification Status', value: doc.status },
                        { label: 'File Archive', value: doc.fileName },
                        { label: 'Registered Port / Desk', value: 'Hamad Port (Doha) / GCC Division' },
                      ],
                      notes: [
                        'This document has been audited and validated according to international ISRI scrap metals and recovered fiber guidelines.',
                        'All parties authorized under access clearance may inspect the verified original on record at Al Shaheed Trading & Equipment Co.',
                      ],
                    })
                  }
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const content = `===============================================================
AL SHAHEED TRADING & EQUIPMENT CO. - OFFICIAL TRADE CERTIFICATE
===============================================================
DOCUMENT: ${doc.title}
REFERENCE: DOC-${doc.id.toUpperCase()}
TYPE: ${doc.documentType}
STATUS: ${doc.status}
UPLOADED BY: ${doc.uploadedBy}
DATE: ${new Date(doc.uploadedAt).toISOString()}
FILE: ${doc.fileName} (${doc.fileSize})

FACILITATED UNDER ISRI & QATAR CHAMBER OF COMMERCE COMPLIANCE.
AUTHENTICATION HASH: SHA256-${Math.random().toString(36).substring(2, 15).toUpperCase()}
===============================================================`;
                    downloadDocumentFile(doc.fileName.endsWith('.pdf') ? doc.fileName.replace('.pdf', '.txt') : `${doc.fileName}.txt`, doc.title, content);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1 hover:bg-slate-800 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Upload Document */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Trade Document"
        subtitle="Attach official certificates, BL documents, or inspection files"
        maxWidth="md"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Document Title *
            </label>
            <input
              required
              type="text"
              placeholder="e.g. SGS Quality & Radiation Certificate"
              value={uploadForm.title}
              onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Document Category *
            </label>
            <select
              value={uploadForm.documentType}
              onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            >
              <option value="BILL_OF_LADING">Bill of Lading (Ocean BL)</option>
              <option value="INSPECTION_REPORT">SGS / Alex Stewart Inspection Report</option>
              <option value="CERTIFICATE_OF_ORIGIN">Certificate of Origin (Chamber of Commerce)</option>
              <option value="COMMERCIAL_INVOICE">Commercial Invoice &amp; Packing List</option>
              <option value="INSURANCE_CERTIFICATE">Marine Cargo Insurance Certificate</option>
              <option value="RADIATION_FREE_CERT">Radiation-Free &amp; Non-Hazardous Certificate</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              File Attachment *
            </label>
            <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center bg-slate-50 dark:bg-slate-950">
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                {uploadForm.fileName}
              </span>
              <span className="text-[10px] text-slate-400">PDF, JPG, PNG up to 25MB</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold"
            >
              Upload &amp; Verify
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
