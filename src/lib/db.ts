import Database from '@tauri-apps/plugin-sql';
import { Candidature } from '../types/candidature';
import { Settings } from '../types/settings';

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load('sqlite:candidatures.db');
  }
  return db;
}

export async function getCandidatures(): Promise<Candidature[]> {
  const db = await getDb();
  return await db.select<Candidature[]>('SELECT * FROM candidatures ORDER BY id DESC');
}

export async function createCandidature(c: Omit<Candidature, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
  const db = await getDb();
  await db.execute(
    `INSERT INTO candidatures (poste, entreprise, reference_job, canal, date_candidature, date_relance, date_reponse, statut, notes, competences_demandees, competences_acquises, url, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      c.poste ?? null, 
      c.entreprise ?? null,
      c.reference_job ?? null, 
      c.canal ?? null, 
      c.date_candidature ?? null, 
      c.date_relance ?? null, 
      c.date_reponse ?? null, 
      c.statut ?? null, 
      c.notes ?? null,
      c.competences_demandees ?? null,
      c.competences_acquises ?? null,
      c.url ?? null,
      c.tags ?? null
    ]
  );
}

export async function updateCandidature(id: number, c: Partial<Omit<Candidature, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
  const db = await getDb();
  const fields: string[] = [];
  const values: any[] = [];
  let index = 1;

  for (const [key, value] of Object.entries(c)) {
    fields.push(`${key} = $${index}`);
    values.push(value ?? null);
    index++;
  }
  
  if (fields.length === 0) return;

  values.push(id);
  
  const query = `UPDATE candidatures SET ${fields.join(', ')} WHERE id = $${index}`;
  await db.execute(query, values);
}

export async function deleteCandidature(id: number): Promise<void> {
  const db = await getDb();
  await db.execute('DELETE FROM candidatures WHERE id = $1', [id]);
}

export async function getSettings(): Promise<Settings | null> {
  const db = await getDb();
  const result = await db.select<Settings[]>('SELECT prenom, nom, matricule FROM settings WHERE id = 1');
  return result.length > 0 ? result[0] : null;
}

export async function saveSettings(s: Settings): Promise<void> {
  const db = await getDb();
  await db.execute(
    `UPDATE settings 
     SET prenom = $1, nom = $2, matricule = $3, updated_at = CURRENT_TIMESTAMP 
     WHERE id = 1`,
    [s.prenom ?? null, s.nom ?? null, s.matricule ?? null]
  );
}
