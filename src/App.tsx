import { useState } from 'react';
import { useCandidatures } from './hooks/useCandidatures';
import { CandidatureForm } from './components/CandidatureForm';
import { CandidatureTable } from './components/CandidatureTable';
import { StatsBar } from './components/StatsBar';
import { FilterBar } from './components/FilterBar';
import { ExportButtons } from './components/ExportButtons';
import { SettingsModal } from './components/SettingsModal';
import { StatutCandidature } from './types/candidature';
import { Settings } from 'lucide-react';

function App() {
  const { candidatures, loading, error, add, update, remove } = useCandidatures();
  const [filter, setFilter] = useState<StatutCandidature | 'Tous'>('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const filteredCandidatures = candidatures.filter(c => {
    const matchesFilter = filter === 'Tous' || c.statut === filter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = c.poste.toLowerCase().includes(searchLower) || 
                          c.entreprise.toLowerCase().includes(searchLower) ||
                          (c.reference_job || '').toLowerCase().includes(searchLower);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1>Suivi des Candidatures</h1>
          <p className="app-subtitle">Vos candidatures, centralisées et sécurisées.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            className="btn-icon" 
            onClick={() => setSettingsOpen(true)}
            title="Paramètres utilisateur"
          >
            <Settings size={20} />
          </button>
          <ExportButtons candidatures={candidatures} />
        </div>
      </header>

      {error && <div className="error-alert">{error}</div>}

      <StatsBar candidatures={candidatures} />

      <main className="app-main">
        <section className="form-section">
          <CandidatureForm onAdd={add} />
        </section>

        <section className="table-section">
          <div className="table-header">
            <h2>Mes Candidatures</h2>
            <FilterBar 
              filter={filter} 
              setFilter={setFilter} 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>
          
          {loading ? (
            <div className="loading">Chargement des données...</div>
          ) : (
            <CandidatureTable 
              candidatures={filteredCandidatures} 
              onUpdate={update} 
              onDelete={remove} 
            />
          )}
        </section>
      </main>
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

export default App;
