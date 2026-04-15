import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportableProject {
  _id: string;
  name: string;
  url: string;
  status?: string;
  environment?: string;
  passed?: number;
  failed?: number;
  totalScenarios?: number;
  duration?: string;
  createdAt?: string;
  owner?: { firstName?: string; lastName?: string; avatar?: string };
}

interface Column {
  key: keyof ExportableProject | 'owner';
  label: string;
}

const COLUMNS: Column[] = [
  { key: 'name', label: 'Project Name' },
  { key: 'url', label: 'URL' },
  { key: 'environment', label: 'Environment' },
  { key: 'status', label: 'Status' },
  { key: 'passed', label: 'Passed' },
  { key: 'failed', label: 'Failed' },
  { key: 'totalScenarios', label: 'Total Scenarios' },
  { key: 'duration', label: 'Duration' },
  { key: 'owner', label: 'Owner' },
  { key: 'createdAt', label: 'Created' },
];

function cellValue(p: ExportableProject, col: Column): string | number {
  if (col.key === 'owner') {
    return p.owner
      ? `${p.owner.firstName ?? ''} ${p.owner.lastName ?? ''}`.trim()
      : '—';
  }
  if (col.key === 'createdAt') {
    return p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—';
  }
  const v = p[col.key];
  if (v === undefined || v === null || v === '') return '—';
  return v as string | number;
}

function buildRows(projects: ExportableProject[]) {
  return projects.map((p) => {
    const row: Record<string, string | number> = {};
    COLUMNS.forEach((col) => {
      row[col.label] = cellValue(p, col);
    });
    return row;
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function timestamp() {
  return new Date().toISOString().slice(0, 10);
}

/** Export projects as an .xlsx file (Excel). */
export function exportProjectsXLSX(projects: ExportableProject[]) {
  const rows = buildRows(projects);
  const sheet = XLSX.utils.json_to_sheet(rows);

  // Set reasonable column widths
  sheet['!cols'] = COLUMNS.map((c) => ({ wch: c.label.length + 14 }));

  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Projects');
  XLSX.writeFile(book, `testara-projects-${timestamp()}.xlsx`);
}

/** Export projects as a .csv file. */
export function exportProjectsCSV(projects: ExportableProject[]) {
  const rows = buildRows(projects);
  const headers = COLUMNS.map((c) => c.label);
  const escape = (v: string | number) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(',')];
  rows.forEach((r) => {
    lines.push(headers.map((h) => escape(r[h] as string | number)).join(','));
  });
  const blob = new Blob(['\uFEFF' + lines.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  downloadBlob(blob, `testara-projects-${timestamp()}.csv`);
}

/** Export projects as a styled PDF report. */
export function exportProjectsPDF(projects: ExportableProject[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(101, 76, 222); // brand primary
  doc.text('Testara — Projects Report', 40, 50);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 140);
  doc.text(
    `Generated on ${new Date().toLocaleString()}  ·  ${projects.length} project${projects.length === 1 ? '' : 's'}`,
    40,
    68,
  );

  // Divider
  doc.setDrawColor(230, 230, 240);
  doc.line(40, 82, pageWidth - 40, 82);

  const head = [COLUMNS.map((c) => c.label)];
  const body = projects.map((p) =>
    COLUMNS.map((c) => String(cellValue(p, c))),
  );

  autoTable(doc, {
    startY: 100,
    head,
    body,
    theme: 'grid',
    headStyles: {
      fillColor: [101, 76, 222],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [40, 40, 60],
    },
    alternateRowStyles: {
      fillColor: [248, 249, 252],
    },
    styles: {
      cellPadding: 6,
      overflow: 'linebreak',
    },
    margin: { left: 40, right: 40 },
  });

  doc.save(`testara-projects-${timestamp()}.pdf`);
}
