
import { Candidature } from '../types/candidature';

interface StatsBarProps {
  candidatures: Candidature[];
}

export function StatsBar({ candidatures }: StatsBarProps) {
  const total = candidatures.length;
  const enAttente = candidatures.filter(c => c.statut === 'En attente' || c.statut === 'Sans réponse').length;
  const entretiens = candidatures.filter(c => c.statut === 'Entretien programmé').length;
  const refus = candidatures.filter(c => c.statut === 'Refusé').length;
  const acceptes = candidatures.filter(c => c.statut === 'Accepté').length;

  return (
    <div className="stats-bar">
      <div className="stat-card">
        <span className="stat-label">Total</span>
        <span className="stat-value">{total}</span>
      </div>
      <div className="stat-card text-yellow">
        <span className="stat-label">En attente</span>
        <span className="stat-value">{enAttente}</span>
      </div>
      <div className="stat-card text-blue">
        <span className="stat-label">Entretiens</span>
        <span className="stat-value">{entretiens}</span>
      </div>
      <div className="stat-card text-green">
        <span className="stat-label">Accepté</span>
        <span className="stat-value">{acceptes}</span>
      </div>
      <div className="stat-card text-red">
        <span className="stat-label">Refus</span>
        <span className="stat-value">{refus}</span>
      </div>
    </div>
  );
}
