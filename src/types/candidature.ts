export type StatutCandidature = 'En attente' | 'Entretien programmé' | 'Accepté' | 'Refusé' | 'Sans réponse';

export interface Candidature {
    id?: number;
    poste: string;
    entreprise: string;
    reference_job?: string;
    canal?: string;
    date_candidature?: string;
    date_relance?: string;
    date_reponse?: string;
    statut: StatutCandidature;
    notes?: string;
    competences_demandees?: string;
    competences_acquises?: string;
    url?: string;
    tags?: string;
    created_at?: string;
    updated_at?: string;
}
