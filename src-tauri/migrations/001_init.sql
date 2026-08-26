CREATE TABLE IF NOT EXISTS candidatures (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    poste           TEXT NOT NULL,
    entreprise      TEXT NOT NULL,
    canal           TEXT,
    date_candidature TEXT,
    date_relance    TEXT,
    date_reponse    TEXT,
    statut          TEXT NOT NULL DEFAULT 'En attente'
                        CHECK (statut IN (
                            'En attente',
                            'Entretien programmé',
                            'Accepté',
                            'Refusé',
                            'Sans réponse'
                        )),
    notes           TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_candidatures_statut ON candidatures(statut);
CREATE INDEX IF NOT EXISTS idx_candidatures_date ON candidatures(date_candidature);

CREATE TRIGGER IF NOT EXISTS trg_candidatures_updated_at
AFTER UPDATE ON candidatures
FOR EACH ROW
BEGIN
    UPDATE candidatures SET updated_at = datetime('now') WHERE id = OLD.id;
END;
