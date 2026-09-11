import { useState } from 'react';
import { Candidature, StatutCandidature } from '../types/candidature';
import { message } from '@tauri-apps/plugin-dialog';

interface CandidatureFormProps {
  onAdd: (c: Omit<Candidature, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export function CandidatureForm({ onAdd }: CandidatureFormProps) {
  const [poste, setPoste] = useState('');
  const [entreprise, setEntreprise] = useState('');
  const [referenceJob, setReferenceJob] = useState('');
  const [canal, setCanal] = useState('');
  
  const getLocalDate = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  const [dateCandidature, setDateCandidature] = useState(getLocalDate());
  const [statut, setStatut] = useState<StatutCandidature>('En attente');
  const [competencesDemandees, setCompetencesDemandees] = useState('');
  const [competencesAcquises, setCompetencesAcquises] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

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
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = `https://${finalUrl}`;
      }
    }

    setLoading(true);
    const normalizedTags = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .join(', ');

    try {
      await onAdd({
        poste,
        entreprise,
        reference_job: referenceJob,
        canal,
        date_candidature: dateCandidature,
        statut,
        notes: '',
        competences_demandees: competencesDemandees,
        competences_acquises: competencesAcquises,
        url: finalUrl,
        tags: normalizedTags
      });
      // Réinitialiser le formulaire
      setPoste('');
      setEntreprise('');
      setReferenceJob('');
      setCanal('');
      setStatut('En attente');
      setCompetencesDemandees('');
      setCompetencesAcquises('');
      setUrl('');
      setTags('');
    } catch (err) {
      console.error(err);
      await message('Erreur lors de l\'ajout de la candidature.', { title: 'Erreur', kind: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card form-container">
      <h3>Nouvelle Candidature</h3>
      <form onSubmit={handleSubmit} className="candidature-form">
        <div className="form-group">
          <label>Poste *</label>
          <input 
            type="text" 
            required 
            value={poste} 
            onChange={e => setPoste(e.target.value)} 
            placeholder="Ex: Développeur React"
          />
        </div>
        <div className="form-group">
          <label>Entreprise *</label>
          <input 
            type="text" 
            required 
            value={entreprise} 
            onChange={e => setEntreprise(e.target.value)} 
            placeholder="Ex: Google"
          />
        </div>
        <div className="form-group">
          <label>Référence job</label>
          <input 
            type="text" 
            value={referenceJob} 
            onChange={e => setReferenceJob(e.target.value)} 
            placeholder="Ex: REF-2023-A"
          />
        </div>
        <div className="form-group">
          <label>Canal</label>
          <input 
            type="text" 
            value={canal} 
            onChange={e => setCanal(e.target.value)} 
            placeholder="Ex: LinkedIn, Site web..."
          />
        </div>
        <div className="form-group">
          <label>Lien de l'offre</label>
          <textarea 
            value={url} 
            onChange={e => setUrl(e.target.value)} 
            placeholder="Ex: linkedin.com/..."
            rows={2}
          />
        </div>
        <div className="form-group">
          <label>Tags (séparés par une virgule)</label>
          <input 
            type="text" 
            value={tags} 
            onChange={e => setTags(e.target.value)} 
            placeholder="Ex: CDI, Télétravail, Urgent"
          />
        </div>
        <div className="form-group">
          <label>Compétences demandées</label>
          <input 
            type="text" 
            value={competencesDemandees} 
            onChange={e => setCompetencesDemandees(e.target.value)} 
            placeholder="Ex: React, Node.js..."
          />
        </div>
        <div className="form-group">
          <label>Notes compétences acquises</label>
          <input 
            type="text" 
            value={competencesAcquises} 
            onChange={e => setCompetencesAcquises(e.target.value)} 
            placeholder="Ex: 80% (manque Docker)"
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
        <div className="form-group">
          <label>Statut initial</label>
          <select 
            value={statut} 
            onChange={e => setStatut(e.target.value as StatutCandidature)}
          >
            <option value="En attente">En attente</option>
            <option value="Entretien programmé">Entretien programmé</option>
            <option value="Accepté">Accepté</option>
            <option value="Refusé">Refusé</option>
            <option value="Sans réponse">Sans réponse</option>
          </select>
        </div>
        <div className="form-submit">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Ajout...' : 'Ajouter'}
          </button>
        </div>
      </form>
    </div>
  );
}
