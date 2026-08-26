
import { StatutCandidature } from '../types/candidature';

interface FilterBarProps {
  filter: StatutCandidature | 'Tous';
  setFilter: (f: StatutCandidature | 'Tous') => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
}

const STATUTS: (StatutCandidature | 'Tous')[] = [
  'Tous',
  'En attente',
  'Entretien programmé',
  'Accepté',
  'Refusé',
  'Sans réponse'
];

import { Search } from 'lucide-react';

export function FilterBar({ filter, setFilter, searchTerm, setSearchTerm }: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="search-input-wrapper" style={{ position: 'relative', marginRight: '1rem' }}>
        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input 
          type="text" 
          placeholder="Rechercher (poste, entreprise...)" 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '32px', width: '250px' }}
        />
      </div>
      <span>Filtrer :</span>
      <div className="filter-options">
        {STATUTS.map(statut => (
          <button
            key={statut}
            className={`btn btn-sm ${filter === statut ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(statut)}
          >
            {statut}
          </button>
        ))}
      </div>
    </div>
  );
}
