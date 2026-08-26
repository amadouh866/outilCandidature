import { useState, useEffect } from 'react';
import { Candidature } from '../types/candidature';
import { X } from 'lucide-react';

interface EditCandidatureModalProps {
  candidature: Candidature | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, c: Partial<Candidature>) => Promise<void>;
}

export function EditCandidatureModal({ candidature, isOpen, onClose, onSave }: EditCandidatureModalProps) {
  const [poste, setPoste] = useState('');
  const [entreprise, setEntreprise] = useState('');
  const [referenceJob, setReferenceJob] = useState('');
  const [canal, setCanal] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');
  const [dateCandidature, setDateCandidature] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (candidature) {
      setPoste(candidature.poste || '');
      setEntreprise(candidature.entreprise || '');
      setReferenceJob(candidature.reference_job || '');
      setCanal(candidature.canal || '');
      setUrl(candidature.url || '');
      setTags(candidature.tags || '');
      setDateCandidature(candidature.date_candidature || '');
    }
  }, [candidature]);

  if (!isOpen || !candidature) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poste || !entreprise) return;
    
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
        url: url.trim(),
        tags: normalizedTags,
        date_candidature: dateCandidature || undefined
      });
      onClose();
    } catch (err) {
      console.error(err);
      const { message } = await import('@tauri-apps/plugin-dialog');
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
            <input 
              type="text" 
              required 
              value={poste} 
              onChange={e => setPoste(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Entreprise *</label>
            <input 
              type="text" 
              required 
              value={entreprise} 
              onChange={e => setEntreprise(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Référence job</label>
            <input 
              type="text" 
              value={referenceJob} 
              onChange={e => setReferenceJob(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Canal</label>
            <input 
              type="text" 
              value={canal} 
              onChange={e => setCanal(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Lien de l'offre</label>
            <input 
              type="url" 
              value={url} 
              onChange={e => setUrl(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Tags (séparés par virgule)</label>
            <input 
              type="text" 
              value={tags} 
              onChange={e => setTags(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Date de candidature</label>
            <input 
              type="date" 
              value={dateCandidature} 
              onChange={e => setDateCandidature(e.target.value)} 
            />
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
