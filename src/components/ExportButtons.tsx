import { Candidature } from '../types/candidature';
import { exportToExcel, exportToCSV, exportToPDF } from '../lib/export';
import { Download } from 'lucide-react';

interface ExportButtonsProps {
  candidatures: Candidature[];
}

export function ExportButtons({ candidatures }: ExportButtonsProps) {
  const disabled = candidatures.length === 0;

  return (
    <div className="export-buttons">
      <button
        className="btn btn-outline"
        onClick={() => exportToExcel(candidatures)}
        disabled={disabled}
      >
        <Download size={16} /> Excel
      </button>
      <button
        className="btn btn-outline"
        onClick={() => exportToPDF(candidatures)}
        disabled={disabled}
      >
        <Download size={16} /> PDF
      </button>
      <button
        className="btn btn-outline"
        onClick={() => exportToCSV(candidatures)}
        disabled={disabled}
      >
        <Download size={16} /> CSV
      </button>
    </div>
  );
}
