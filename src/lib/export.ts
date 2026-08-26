import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';
import { Candidature, StatutCandidature } from '../types/candidature';

// Colonnes exportées, dans l'ordre, avec leurs libellés français.
// id, created_at et updated_at sont volontairement exclus : usage technique uniquement.
const COLONNES: { key: keyof Candidature; label: string }[] = [
  { key: 'poste', label: 'Poste' },
  { key: 'entreprise', label: 'Entreprise' },
  { key: 'reference_job', label: 'Réf. Job' },
  { key: 'canal', label: 'Canal' },
  { key: 'url', label: 'URL' },
  { key: 'tags', label: 'Tags' },
  { key: 'date_candidature', label: 'Date de candidature' },
  { key: 'date_relance', label: 'Date de relance' },
  { key: 'date_reponse', label: 'Date de réponse' },
  { key: 'statut', label: 'Statut' },
  { key: 'competences_demandees', label: 'Compétences demandées' },
  { key: 'competences_acquises', label: 'Compétences acquises' },
  { key: 'notes', label: 'Notes' },
];

// Couleurs par statut, réutilisées pour le PDF (RGB, cohérent avec les badges de l'interface)
const COULEURS_STATUT: Record<StatutCandidature, [number, number, number]> = {
  'En attente': [254, 243, 199],
  'Entretien programmé': [219, 234, 254],
  'Accepté': [209, 250, 229],
  'Refusé': [254, 226, 226],
  'Sans réponse': [241, 245, 249],
};

function formatDate(d?: string): string {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return y && m && day ? `${day}/${m}/${y}` : d;
}

function versLignes(candidatures: Candidature[]) {
  return candidatures.map(c => {
    const ligne: Record<string, string> = {};
    for (const { key, label } of COLONNES) {
      const valeur = c[key];
      ligne[label] =
        key === 'date_candidature' || key === 'date_relance' || key === 'date_reponse'
          ? formatDate(valeur as string | undefined)
          : ((valeur as string | undefined) ?? '—');
    }
    return ligne;
  });
}

export async function exportToExcel(candidatures: Candidature[]) {
  if (candidatures.length === 0) return;

  try {
    const filePath = await save({
      filters: [{ name: 'Excel', extensions: ['xlsx'] }],
      defaultPath: 'candidatures.xlsx',
    });
    if (!filePath) return;

    const lignes = versLignes(candidatures);
    const worksheet = XLSX.utils.json_to_sheet(lignes, {
      header: COLONNES.map(c => c.label),
    });

    // Largeurs de colonnes ajustées à la lisibilité du contenu
    worksheet['!cols'] = [
      { wch: 24 }, // Poste
      { wch: 20 }, // Entreprise
      { wch: 16 }, // Réf. Job
      { wch: 14 }, // Canal
      { wch: 16 }, // Date de candidature
      { wch: 14 }, // Date de relance
      { wch: 14 }, // Date de réponse
      { wch: 20 }, // Statut
      { wch: 28 }, // Compétences demandées
      { wch: 28 }, // Compétences acquises
      { wch: 30 }, // Notes
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidatures');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    await writeFile(filePath, new Uint8Array(excelBuffer));
  } catch (err) {
    console.error("Erreur lors de l'export Excel:", err);
    alert("Une erreur est survenue lors de l'exportation du fichier Excel.");
  }
}

export async function exportToCSV(candidatures: Candidature[]) {
  if (candidatures.length === 0) return;

  try {
    const filePath = await save({
      filters: [{ name: 'CSV', extensions: ['csv'] }],
      defaultPath: 'candidatures.csv',
    });
    if (!filePath) return;

    const lignes = versLignes(candidatures);
    const headers = COLONNES.map(c => c.label);
    const rows = lignes.map(ligne =>
      headers.map(h => `"${String(ligne[h]).replace(/"/g, '""')}"`).join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const encoder = new TextEncoder();
    // BOM UTF-8 pour un affichage correct des accents dans Excel
    const data = encoder.encode('\uFEFF' + csvContent);

    await writeFile(filePath, data);
  } catch (err) {
    console.error("Erreur lors de l'export CSV:", err);
    alert("Une erreur est survenue lors de l'exportation du fichier CSV.");
  }
}

export async function exportToPDF(candidatures: Candidature[]) {
  if (candidatures.length === 0) return;

  try {
    const filePath = await save({
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
      defaultPath: 'candidatures.pdf',
    });
    if (!filePath) return;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Suivi des candidatures', 14, 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    const dateExport = new Date().toLocaleDateString('fr-FR');
    doc.text(`Exporté le ${dateExport} — ${candidatures.length} candidature(s)`, 14, 21);

    const lignes = versLignes(candidatures);
    const headers = COLONNES.map(c => c.label);
    const body = lignes.map(ligne => headers.map(h => ligne[h]));

    autoTable(doc, {
      head: [headers],
      body,
      startY: 26,
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 25 }, // Poste
        1: { cellWidth: 20 }, // Entreprise
        2: { cellWidth: 20 }, // Réf. Job
        9: { cellWidth: 26 }, // Statut
      },
      didParseCell: (data) => {
        // Colore la cellule "Statut" selon sa valeur, comme les badges de l'interface
        if (data.section === 'body' && data.column.index === 9) {
          const statut = data.cell.raw as StatutCandidature;
          const couleur = COULEURS_STATUT[statut];
          if (couleur) data.cell.styles.fillColor = couleur;
        }
      },
    });

    const pdfBuffer = doc.output('arraybuffer');
    await writeFile(filePath, new Uint8Array(pdfBuffer));
  } catch (err) {
    console.error("Erreur lors de l'export PDF:", err);
    alert("Une erreur est survenue lors de l'exportation du fichier PDF.");
  }
}
