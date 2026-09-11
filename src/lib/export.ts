import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { save, message } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';
import { Candidature, StatutCandidature } from '../types/candidature';
import { getSettings } from './db';

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

// Colonnes spécifiques pour l'export PDF (8 colonnes, largeurs explicites en mm pour un total de ~269mm)
const COLONNES_PDF: { key: keyof Candidature; label: string; width: number }[] = [
  { key: 'poste', label: 'Poste', width: 32 },
  { key: 'entreprise', label: 'Entreprise', width: 28 },
  { key: 'reference_job', label: 'Réf.', width: 20 },
  { key: 'canal', label: 'Canal', width: 22 },
  { key: 'date_candidature', label: 'Date', width: 16 },
  { key: 'statut', label: 'Statut', width: 24 },
  { key: 'competences_demandees', label: 'Compétences', width: 40 },
  { key: 'notes', label: 'Notes', width: 40 },
  { key: 'url', label: 'URL', width: 45 },
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

function versLignesPDF(candidatures: Candidature[]) {
  return candidatures.map(c => {
    const ligne: Record<string, string> = {};
    for (const { key, label } of COLONNES_PDF) {
      const valeur = c[key];
      ligne[label] =
        key === 'date_candidature'
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
    await message("Une erreur est survenue lors de l'exportation du fichier Excel.", { title: 'Erreur', kind: 'error' });
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
    await message("Une erreur est survenue lors de l'exportation du fichier CSV.", { title: 'Erreur', kind: 'error' });
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

    const settings = await getSettings();

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let curY = 15;

    if (settings && (settings.nom || settings.prenom)) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const nomComplet = [settings.prenom, settings.nom].filter(Boolean).join(' ');
      doc.text(nomComplet, 14, curY);
    }
    
    if (settings && settings.matricule) {
      const boxWidth = 55;
      const boxHeight = 12;
      const boxX = pageWidth - 14 - boxWidth;
      const boxY = curY - 8;
      doc.setDrawColor(180);
      doc.setLineWidth(0.3);
      doc.rect(boxX, boxY, boxWidth, boxHeight);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120);
      doc.text('Matricule', boxX + 3, boxY + 4.5);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text(settings.matricule, boxX + 3, boxY + 9.5);
    }
    
    if (settings && (settings.nom || settings.prenom || settings.matricule)) {
      curY += 8;
      doc.setDrawColor(220);
      doc.setLineWidth(0.2);
      doc.line(14, curY, pageWidth - 14, curY);
      curY += 6;
    } else {
      curY += 2;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('Suivi des candidatures', 14, curY);
    curY += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    const dateExport = new Date().toLocaleDateString('fr-FR');
    doc.text(`Exporté le ${dateExport} — ${candidatures.length} candidature(s)`, 14, curY);
    curY += 5;

    const lignes = versLignesPDF(candidatures);
    const headers = COLONNES_PDF.map(c => c.label);
    const body = lignes.map(ligne => headers.map(h => ligne[h]));

    // Génération dynamique de columnStyles à partir de COLONNES_PDF
    const dynamicColumnStyles: Record<number, any> = {};
    COLONNES_PDF.forEach((col, index) => {
      dynamicColumnStyles[index] = { 
        cellWidth: col.width,
        // 'linebreak' par défaut permet le retour à la ligne automatique (idéal pour l'URL complète)
        overflow: (col.key === 'canal' || col.key === 'reference_job') ? 'ellipsize' : 'linebreak'
      };
    });

    const statutIndex = COLONNES_PDF.findIndex(c => c.key === 'statut');

    autoTable(doc, {
      head: [headers],
      body,
      startY: curY + 3,
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: dynamicColumnStyles,
      didParseCell: (data) => {
        // Colore la cellule "Statut" selon sa valeur, comme les badges de l'interface
        if (data.section === 'body' && data.column.index === statutIndex) {
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
    await message("Une erreur est survenue lors de l'exportation du fichier PDF.", { title: 'Erreur', kind: 'error' });
  }
}
