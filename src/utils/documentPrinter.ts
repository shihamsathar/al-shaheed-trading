/**
 * Al Shaheed Trading & Equipment Co.
 * Document & Report Printing and Download Utilities
 * Generates verified PDF-ready printable documents, CSV exports, and official trading invoices.
 */

export interface PrintableDocOptions {
  title: string;
  docType: string;
  refNumber: string;
  date?: string;
  counterparty?: string;
  details: { label: string; value: string | number }[];
  tables?: {
    headers: string[];
    rows: (string | number)[][];
  }[];
  notes?: string[];
}

/**
 * Universal safe print generator
 * Opens a formatted, printable window that renders styled company letterhead and invokes print
 */
export function printTradeDocument(doc: PrintableDocOptions) {
  const printWindow = window.open('', '_blank', 'width=850,height=900');
  if (!printWindow) {
    // Fallback if popup blocked: print current window
    window.print();
    return;
  }

  const currentDate = doc.date || new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const detailsHtml = doc.details
    .map(
      (d) => `
      <div style="padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">${d.label}</div>
        <div style="font-size: 13px; color: #0f172a; font-weight: 600; margin-top: 2px;">${d.value}</div>
      </div>
    `
    )
    .join('');

  let tablesHtml = '';
  if (doc.tables && doc.tables.length > 0) {
    tablesHtml = doc.tables
      .map(
        (table) => `
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px;">
          <thead>
            <tr style="background: #0f172a; color: #ffffff;">
              ${table.headers
                .map(
                  (h) =>
                    `<th style="padding: 10px 12px; text-align: left; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">${h}</th>`
                )
                .join('')}
            </tr>
          </thead>
          <tbody>
            ${table.rows
              .map(
                (row, i) => `
              <tr style="background: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
                ${row
                  .map(
                    (cell, ci) =>
                      `<td style="padding: 9px 12px; color: #334155; ${ci === 0 ? 'font-weight: 600; color: #0f172a;' : ''}">${cell}</td>`
                  )
                  .join('')}
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `
      )
      .join('');
  }

  const notesHtml =
    doc.notes && doc.notes.length > 0
      ? `
      <div style="margin-top: 24px; padding: 14px; background: #f1f5f9; border-left: 4px solid #059669; border-radius: 4px; font-size: 11px; color: #334155;">
        <strong style="color: #0f172a; display: block; margin-bottom: 4px;">Terms &amp; Facilitation Protocol:</strong>
        <ul style="margin: 0; padding-left: 18px; line-height: 1.6;">
          ${doc.notes.map((n) => `<li>${n}</li>`).join('')}
        </ul>
      </div>
    `
      : '';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${doc.title} - ${doc.refNumber}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4; margin: 16mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 24px;
            background: #ffffff;
          }
          .header-box {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #059669;
            padding-bottom: 18px;
            margin-bottom: 20px;
          }
          .company-title {
            font-size: 18px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.5px;
          }
          .company-subtitle {
            font-size: 11px;
            color: #059669;
            font-weight: 700;
            margin-top: 2px;
          }
          .company-address {
            font-size: 10px;
            color: #64748b;
            margin-top: 4px;
            line-height: 1.4;
          }
          .doc-badge {
            text-align: right;
          }
          .doc-type {
            font-size: 16px;
            font-weight: 800;
            color: #059669;
            text-transform: uppercase;
          }
          .doc-ref {
            font-family: monospace;
            font-size: 12px;
            font-weight: 700;
            color: #334155;
            margin-top: 2px;
          }
          .grid-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 20px;
          }
          .stamp-box {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
          }
          .signature-line {
            width: 200px;
            border-top: 1px solid #94a3b8;
            margin-top: 40px;
            text-align: center;
            font-size: 11px;
            color: #64748b;
            padding-top: 4px;
          }
          .stamp-seal {
            border: 2px solid #059669;
            color: #059669;
            padding: 8px 14px;
            border-radius: 8px;
            font-weight: 800;
            font-size: 11px;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 58px; height: 58px; flex-shrink: 0;">
              <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
                <circle cx="120" cy="100" r="54" fill="#15803d" />
                <circle cx="120" cy="100" r="50" fill="#22c55e" />
                <path d="M96 72 C98 65 106 60 114 62 C118 64 122 70 120 76 C116 80 112 85 107 88 C104 90 98 87 97 83 C95 78 94 75 96 72 Z" fill="#dcfce7" />
                <path d="M110 92 C113 90 116 93 118 97 C120 102 122 112 118 120 C115 125 111 128 108 124 C106 119 107 106 110 92 Z" fill="#dcfce7" />
                <path d="M128 66 C134 64 140 68 142 74 C144 80 142 86 138 90 C136 94 138 102 142 108 C144 114 140 124 135 122 C130 120 128 110 130 100 C131 92 127 82 125 76 C124 70 126 67 128 66 Z" fill="#dcfce7" />
                <path d="M74 46 C80 32 100 24 124 24 C152 24 178 38 186 64 L204 60 L188 98 L152 76 L168 72 C162 56 145 44 124 44 C106 44 92 50 86 60 Z" fill="#4ade80" />
                <path d="M62 78 L78 62 L80 84 C70 96 66 112 70 128 C76 150 94 168 116 174 L114 194 C84 186 60 162 52 134 C46 112 50 92 62 78 Z" fill="#22c55e" />
                <polygon points="40,76 88,48 78,98" fill="#16a34a" />
                <path d="M168 96 C176 110 178 126 174 142 C166 168 142 186 116 190 L118 170 C136 166 152 152 156 134 C158 122 156 112 150 102 Z" fill="#15803d" />
                <polygon points="132,154 184,188 148,206" fill="#15803d" />
                <g transform="translate(120, 206)">
                  <path d="M0 0 C-6 -8 -16 -10 -22 -6 C-24 0 -18 10 -8 10 C-3 10 -1 6 0 0 Z" fill="#4ade80" />
                  <path d="M0 0 C6 -8 16 -10 22 -6 C24 0 18 10 8 10 C3 10 1 6 0 0 Z" fill="#22c55e" />
                </g>
              </svg>
            </div>
            <div>
              <div class="company-title">AL SHAHEED TRADING &amp; EQUIPMENT CO.</div>
              <div class="company-subtitle">COMMODITIES, RECYCLING &amp; SCRAP BROKERAGE DIVISION &bull; REDUCE &bull; REUSE &bull; RECYCLE</div>
              <div class="company-address">
                Zone 57, Street 810, Building 45, Industrial Area &bull; P.O. Box 24910, Doha, Qatar<br />
                CR: 882910/QA &bull; Desk: +974 30437712 &bull; Email: trade@alshaheedtrading.com
              </div>
            </div>
          </div>
          <div class="doc-badge">
            <div class="doc-type">${doc.docType}</div>
            <div class="doc-ref">REF: ${doc.refNumber}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Issue Date: ${currentDate}</div>
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <h2 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0;">${doc.title}</h2>
          ${doc.counterparty ? `<div style="font-size: 12px; color: #475569;">Facilitated Counterparty / Client: <strong>${doc.counterparty}</strong></div>` : ''}
        </div>

        <div class="grid-details">
          ${detailsHtml}
        </div>

        ${tablesHtml}

        ${notesHtml}

        <div class="stamp-box">
          <div>
            <div class="stamp-seal">
              Verified Trade Document<br />
              <span style="font-size: 9px; font-weight: normal; color: #475569;">ISRI SPECIFICATIONS &bull; SGS CERTIFIED</span>
            </div>
          </div>
          <div>
            <div class="signature-line">Authorized Signatory<br />Al Shaheed Commercial Desk</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 350);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Downloads formatted CSV file
 */
export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvRows = [headers.join(',')];

  rows.forEach((row) => {
    const escaped = row.map((cell) => {
      const str = String(cell ?? '').replace(/"/g, '""');
      return `"${str}"`;
    });
    csvRows.push(escaped.join(','));
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvRows.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates and downloads a mock/formatted trade document file (PDF / Text receipt)
 */
export function downloadDocumentFile(fileName: string, title: string, contentText: string) {
  const blob = new Blob([contentText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
