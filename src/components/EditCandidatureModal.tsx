import { useState } from 'react';
import { Candidature, StatutCandidature } from '../types/candidature';
import { X } from 'lucide-react';
import { message } from '@tauri-apps/plugin-dialog';

interface EditCandidatureModalProps {
  candidature: Candidature | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, c: Partial<Candidature>) => Promise<void>;
}

export function EditCandidatureModal({ candidature, isOpen, onClose, onSave }: EditCandidatureModalProps) {
  const [poste, setPoste] = useState(candidature?.poste || '');
  const [entreprise, setEntreprise] = useState(candidature?.entreprise || '');
  const [referenceJob, setReferenceJob] = useState(candidature?.reference_job || '');
  const [canal, setCanal] = useState(candidature?.canal || '');
  const [url, setUrl] = useState(candidature?.url || '');
  const [tags, setTags] = useState(candidature?.tags || '');
  const [dateCandidature, setDateCandidature] = useState(candidature?.date_candidature || '');
  const [dateRelance, setDateRelance] = useState(candidature?.date_relance || '');
  const [dateReponse, setDateReponse] = useState(candidature?.date_reponse || '');
  const [statut, setStatut] = useState<StatutCandidature>(candidature?.statut || 'En attente');
  const [notes, setNotes] = useState(candidature?.notes || '');
  const [competencesDemandees, setCompetencesDemandees] = useState(candidature?.competences_demandees || '');
  const [competencesAcquises, setCompetencesAcquises] = useState(candidature?.competences_acquises || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !candidature) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poste || !entreprise) return;
    
    let finalUrl = url.trim();
    if (finalUrl) {
      const lowerUrl = finalUrl.toLowerCase();
      if (lowerUrl.startsWith('javascript:') || lowerUrl.startsWith('data:') || lowerUrl.startsWith('vbscript:')) {
        await message('Format d\'URL non autorisé.', { title: 'Erreur de sécurité', kind: 'error' });
        return;
      }
      if (!lowerUrl.startsWith('http://') && !lowerUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
    }
    
    setLoading(true);
    const normalizedTags = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .join(', ');

    try {
      await onSave(candidature.id!, {
        poste,
        entreprise,
        reference_job: referenceJob,
        canal,
        url: finalUrl,
        tags: normalizedTags,
        date_candidature: dateCandidature || undefined,
        date_relance: dateRelance || undefined,
        date_reponse: dateReponse || undefined,
        statut,
        notes,
        competences_demandees: competencesDemandees,
        competences_acquises: competencesAcquises
      });
      onClose();
    } catch (err) {
      console.error(err);
      await message('Erreur lors de la mise à jour.', { title: 'Erreur', kind: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Modifier la candidature</h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="candidature-form">
          <div className="form-group">
            <label>Poste *</label>
            <input type="text" required value={poste} onChange={e => setPoste(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Entreprise *</label>
            <input type="text" required value={entreprise} onChange={e => setEntreprise(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Référence job</label>
            <input type="text" value={referenceJob} onChange={e => setReferenceJob(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Canal</label>
            <input type="text" value={canal} onChange={e => setCanal(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Lien de l'offre</label>
            <textarea rows={2} value={url} onChange={e => setUrl(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Tags (séparés par virgule)</label>
            <input type="text" value={tags} onChange={e => setTags(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Statut</label>
            <select value={statut} onChange={e => setStatut(e.target.value as StatutCandidature)}>
              <option value="En attente">En attente</option>
              <option value="Entretien programmé">Entretien programmé</option>
              <option value="Accepté">Accepté</option>
              <option value="Refusé">Refusé</option>
              <option value="Sans réponse">Sans réponse</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date de candidature</label>
            <input type="date" value={dateCandidature} onChange={e => setDateCandidature(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Date de relance</label>
            <input type="date" value={dateRelance} onChange={e => setDateRelance(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Date de réponse</label>
            <input type="date" value={dateReponse} onChange={e => setDateReponse(e.target.value)} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Compétences demandées</label>
            <textarea rows={3} value={competencesDemandees} onChange={e => setCompetencesDemandees(e.target.value)} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Compétences acquises</label>
            <textarea rows={3} value={competencesAcquises} onChange={e => setCompetencesAcquises(e.target.value)} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Notes</label>
            <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          
          <div className="modal-actions" style={{ gridColumn: '1 / -1' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
