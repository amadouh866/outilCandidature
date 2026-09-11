import { useState, useEffect, useMemo } from 'react';
import { Candidature } from '../types/candidature';
import { StatusBadge } from './StatusBadge';
import { Trash2, Pencil, ExternalLink } from 'lucide-react';
import { EditCandidatureModal } from './EditCandidatureModal';
import { confirm, message } from '@tauri-apps/plugin-dialog';
import { openUrl } from '@tauri-apps/plugin-opener';

interface CandidatureTableProps {
  candidatures: Candidature[];
  onUpdate: (id: number, c: Partial<Candidature>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function CandidatureTable({ candidatures, onUpdate, onDelete }: CandidatureTableProps) {
  const [editingCandidature, setEditingCandidature] = useState<Candidature | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Candidature; direction: 'asc' | 'desc' } | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  useEffect(() => {
    setCurrentPage(1);
  }, [candidatures]);

  const sortedCandidatures = useMemo(() => {
    return [...candidatures].sort((a, b) => {
      if (!sortConfig) return 0;
      const { key, direction } = sortConfig;
      const valA = a[key] ?? '';
      const valB = b[key] ?? '';
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [candidatures, sortConfig]);

  if (candidatures.length === 0) {
    return <div className="empty-state">Aucune candidature pour le moment.</div>;
  }

  const handleDelete = async (id: number) => {
    try {
      const isConfirmed = await confirm(
        "Êtes-vous sûr de vouloir supprimer cette candidature ? Cette action est irréversible.",
        { title: 'Confirmation de suppression', kind: 'warning' }
      );
      
      if (isConfirmed) {
        await onDelete(id);
      }
    } catch (err) {
      console.error(err);
      await message("Erreur lors de la suppression de la candidature.", { title: 'Erreur', kind: 'error' });
    }
  };

  const isRelanceOverdue = (c: Candidature) => {
    if (!c.date_relance) return false;
    if (c.statut === 'Accepté' || c.statut === 'Refusé') return false;
    
    const relanceDate = new Date(c.date_relance);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return relanceDate <= today;
  };

  const handleSort = (key: keyof Candidature) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Candidature) => {
    if (sortConfig?.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(sortedCandidatures.length / itemsPerPage);
  const paginatedCandidatures = itemsPerPage === -1 
    ? sortedCandidatures 
    : sortedCandidatures.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('poste')} style={{cursor: 'pointer'}}>Poste{getSortIcon('poste')}</th>
            <th onClick={() => handleSort('entreprise')} style={{cursor: 'pointer'}}>Entreprise{getSortIcon('entreprise')}</th>
            <th onClick={() => handleSort('reference_job')} style={{cursor: 'pointer'}}>Réf. Job{getSortIcon('reference_job')}</th>
            <th onClick={() => handleSort('canal')} style={{cursor: 'pointer'}}>Canal{getSortIcon('canal')}</th>
            <th onClick={() => handleSort('date_candidature')} style={{cursor: 'pointer'}}>Candidature{getSortIcon('date_candidature')}</th>
            <th>Comp. demandées</th>
            <th>Comp. acquises</th>
            <th onClick={() => handleSort('date_relance')} style={{cursor: 'pointer'}}>Relance{getSortIcon('date_relance')}</th>
            <th onClick={() => handleSort('date_reponse')} style={{cursor: 'pointer'}}>Réponse{getSortIcon('date_reponse')}</th>
            <th onClick={() => handleSort('statut')} style={{cursor: 'pointer'}}>Statut{getSortIcon('statut')}</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedCandidatures.map(c => (
            <tr key={c.id}>
              <td className="font-medium">
                {c.poste}
                {c.url && (
                  <button 
                    onClick={() => openUrl(c.url!)}
                    className="btn-icon"
                    title="Ouvrir l'offre"
                    style={{ marginLeft: '4px' }}
                  >
                    <ExternalLink size={14} />
                  </button>
                )}
              </td>
              <td>
                <div>{c.entreprise}</div>
                {c.tags && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {c.tags.split(',').map((tag, i) => (
                      <span key={i} className="badge badge-default" style={{ fontSize: '0.65rem' }}>{tag.trim()}</span>
                    ))}
                  </div>
                )}
              </td>
              <td>{c.reference_job || '—'}</td>
              <td>{c.canal}</td>
              <td>{c.date_candidature}</td>
              <td>
                <span className="text-truncate" title={c.competences_demandees || ''}>
                  {c.competences_demandees || '—'}
                </span>
              </td>
              <td>
                <span className="text-truncate" title={c.competences_acquises || ''}>
                  {c.competences_acquises || '—'}
                </span>
              </td>
              <td>
                <span className={isRelanceOverdue(c) ? 'text-red font-bold' : ''} title={isRelanceOverdue(c) ? "Relance dépassée !" : ""}>
                  {c.date_relance || '—'}
                </span>
              </td>
              <td>
                <span>{c.date_reponse || '—'}</span>
              </td>
              <td>
                <StatusBadge statut={c.statut} />
              </td>
              <td>
                <span className="text-truncate" title={c.notes || ''}>
                  {c.notes || '—'}
                </span>
              </td>
              <td className="actions-cell" style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => setEditingCandidature(c)}
                  className="btn-icon text-blue"
                  title="Modifier"
                >
                  <Pencil size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(c.id!)}
                  className="btn-icon text-red"
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', alignItems: 'center' }}>
        <div>
          <select 
            value={itemsPerPage} 
            onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="table-select"
            style={{ width: 'auto', minWidth: 'auto', padding: '0.2rem' }}
          >
            <option value={10}>10 par page</option>
            <option value={25}>25 par page</option>
            <option value={50}>50 par page</option>
            <option value={-1}>Tous</option>
          </select>
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Page {currentPage} sur {totalPages || 1}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn btn-outline btn-sm" 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(p => p - 1)}
          >
            Précédent
          </button>
          <button 
            className="btn btn-outline btn-sm" 
            disabled={currentPage >= totalPages || totalPages === 0} 
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Suivant
          </button>
        </div>
      </div>

      <EditCandidatureModal 
        key={editingCandidature?.id}
        isOpen={!!editingCandidature}
        candidature={editingCandidature}
        onClose={() => setEditingCandidature(null)}
        onSave={onUpdate}
      />
    </div>
  );
}
