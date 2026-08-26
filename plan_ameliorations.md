# Plan d'implémentation : URL, Tags et Pagination

Voici la feuille de route technique pour intégrer vos trois fonctionnalités sans altérer la stabilité de l'application.

## 1. Mise à jour de la Base de Données (Migration)
Puisque nous ajoutons deux nouvelles informations (l'URL et les Tags), nous devons mettre à jour la structure de la base de données SQLite.
- **Fichier** : Création d'une nouvelle migration `004_add_url_and_tags.sql`.
- **Action** : Ajout de deux colonnes `url TEXT` et `tags TEXT`.
- **Mise à jour Tauri** : Déclaration de cette version 4 dans `src-tauri/src/lib.rs`.

## 2. Intégration de l'URL de l'annonce (Idée 1)
- **Modèle de données** : Ajout de `url?: string` dans `src/types/candidature.ts` et `src/lib/db.ts`.
- **Formulaires** : Ajout d'un champ "Lien de l'offre" dans l'ajout et l'édition.
- **Tableau** : Au lieu d'ajouter une énième colonne encombrante, nous allons transformer le nom du "Poste" ou ajouter une petite icône 🔗 à côté de celui-ci. 
- **Sécurité** : Au clic, le lien s'ouvrira dans le vrai navigateur de votre ordinateur (Chrome/Edge/Firefox) grâce à l'API Tauri native `plugin-opener` (pour éviter que l'offre ne s'ouvre à l'intérieur de l'application).

## 3. Système d'étiquettes / Tags (Idée 3)
- **Modèle de données** : Ajout de `tags?: string`. Les tags seront sauvegardés sous forme de texte séparé par des virgules (ex: `"CDI, Télétravail"`).
- **Formulaires** : Ajout d'un champ texte "Tags (séparés par une virgule)".
- **Tableau** : Nous allons découper ces mots et les afficher sous forme de petits "badges" arrondis (similaires aux badges de statuts, mais avec des couleurs plus variées ou neutres). Ils seront affichés dans une nouvelle colonne "Tags".

## 4. Pagination du Tableau (Idée 5)
- **Logique** : Dans `CandidatureTable.tsx`, la liste complète filtrée et triée sera découpée en "pages".
- **Interface** : Ajout d'une barre de contrôle en bas du tableau :
  - Un texte indiquant "Page 1 sur 5".
  - Des boutons `[Précédent]` et `[Suivant]`.
  - Un menu déroulant pour choisir le nombre d'éléments par page : `10`, `25`, `50` ou `Tous`.
- Cette modification se fera purement côté affichage (React), vos données resteront intactes et le système d'export téléchargera toujours l'intégralité des candidatures.

## 5. Exports (Excel, CSV, PDF)
- Mise à jour de `src/lib/export.ts` pour inclure les colonnes "URL" et "Tags" lors du téléchargement de vos données.
