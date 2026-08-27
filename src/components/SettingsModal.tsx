import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../lib/db';
import { X } from 'lucide-react';
import { message } from '@tauri-apps/plugin-dialog';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [matricule, setMatricule] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const s = await getSettings();
      if (s) {
        setPrenom(s.prenom || '');
        setNom(s.nom || '');
        setMatricule(s.matricule || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveSettings({ prenom, nom, matricule });
      await message('Paramètres sauvegardés avec succès.', { title: 'Succès', kind: 'info' });
      onClose();
    } catch (err) {
      console.error(err);
      await message('Erreur lors de la sauvegarde des paramètres.', { title: 'Erreur', kind: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Paramètres utilisateur</h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="candidature-form">
          <div className="form-group">
            <label>Prénom</label>
            <input 
              type="text" 
              value={prenom} 
              onChange={e => setPrenom(e.target.value)} 
              placeholder="Ex: Jean"
            />
          </div>
          <div className="form-group">
            <label>Nom</label>
            <input 
              type="text" 
              value={nom} 
              onChange={e => setNom(e.target.value)} 
              placeholder="Ex: Dupont"
            />
          </div>
          <div className="form-group">
            <label>Matricule (Optionnel)</label>
            <input 
              type="text" 
              value={matricule} 
              onChange={e => setMatricule(e.target.value)} 
              placeholder="Ex: MAT-12345"
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
