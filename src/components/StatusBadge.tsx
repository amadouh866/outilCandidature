
import { StatutCandidature } from '../types/candidature';

interface StatusBadgeProps {
  statut: StatutCandidature;
}

export function StatusBadge({ statut }: StatusBadgeProps) {
  const getBadgeClass = () => {
    switch (statut) {
      case 'En attente':
        return 'badge-warning';
      case 'Entretien programmé':
        return 'badge-info';
      case 'Accepté':
        return 'badge-success';
      case 'Refusé':
        return 'badge-danger';
      case 'Sans réponse':
        return 'badge-default';
      default:
        return 'badge-default';
    }
  };

  return (
    <span className={`badge ${getBadgeClass()}`}>
      {statut}
    </span>
  );
}
