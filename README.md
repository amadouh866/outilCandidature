# Historique du Développement - Suivi de Candidatures

Ce document retrace l'intégralité du processus de développement, les fonctionnalités ajoutées et les choix techniques effectués pour la création de l'application de "Suivi de Candidatures".

## 1. Fondation du Projet (Tauri v2 + React + SQLite)
- **Architecture** : Application de bureau autonome (Desktop App) construite avec le framework **Tauri v2**.
- **Frontend** : Interface utilisateur en **React** (TypeScript) propulsée par **Vite** pour des performances optimales.
- **Base de données locale** : Utilisation du plugin natif `@tauri-apps/plugin-sql` avec **SQLite**. Les données sont stockées directement sur l'ordinateur de l'utilisateur de manière sécurisée.

## 2. Évolution du Schéma de Données (Migrations)
La base de données a évolué de manière incrémentale via des migrations SQL gérées par Tauri (`src-tauri/migrations/`) :
- **001_init.sql** : Création de la table `candidatures` de base (Poste, Entreprise, Canal, Dates, Statut).
- **002_add_competences.sql** : Ajout des colonnes pour les `competences_demandees`, `competences_acquises`, et `notes` pour une meilleure analyse de l'adéquation au poste.
- **003_add_reference_job.sql** : Ajout du champ `reference_job` pour assurer le suivi strict d'une offre.
- **004_add_url_and_tags.sql** : Ajout des champs `url` (lien vers l'offre) et `tags` (mots-clés en texte libre).
- **005_add_settings.sql** : Création de la table `settings` (ID unique) pour sauvegarder les informations de l'utilisateur (Prénom, Nom, Matricule).

## 3. Interface Utilisateur & Expérience (UI/UX)
- **Tableau de Bord** : 
  - Affichage des statistiques globales (nombre total, en attente, refusés, etc.).
  - Barre de recherche textuelle multicritères (Poste, Entreprise, Réf Job).
  - Filtrage rapide par statut.
  - Pagination robuste : Retourne automatiquement à la page 1 lors d'un nouveau filtre pour éviter d'afficher une "page blanche".
- **Modification des Candidatures** :
  - Création du composant `EditCandidatureModal`. Les modifications se font dans une fenêtre superposée (modale) plutôt que directement dans les cellules du tableau, réglant ainsi les problèmes de perte de focus (curseur qui saute).
- **Formatage Intelligent** :
  - *Tags* : Normalisation automatique à la saisie (suppression des espaces superflus autour des virgules).
  - *URL* : Le champ de l'offre d'emploi est de type `text`. Un normalisateur vérifie si l'utilisateur a oublié le `https://` et l'ajoute automatiquement à la sauvegarde. Les liens sont cliquables depuis le tableau via le `@tauri-apps/plugin-opener` (ouvre le navigateur par défaut).

## 4. Moteur d'Exportation de Données (Excel, CSV, PDF)
La logique d'export a été centralisée dans `src/lib/export.ts` :
- **Excel (.xlsx)** et **CSV** : Exporte les données brutes (13 colonnes complètes) pour des analyses futures ou des sauvegardes d'archives (via les bibliothèques `xlsx`).
- **PDF (.pdf)** : Génération professionnelle calibrée (via `jspdf` et `jspdf-autotable`).
  - *Personnalisation* : L'en-tête du PDF intègre dynamiquement les paramètres de l'utilisateur (Nom, Prénom, et encart visuel pour le Matricule).
  - *Lisibilité (Le problème des 13 colonnes)* : Le tableau PDF a été réduit aux **8 colonnes essentielles** (Poste, Entreprise, Canal, Date, Statut, Compétences demandées, Notes, URL). 
  - Les largeurs ont été réparties au millimètre près pour rentrer exactement sur une page A4 Paysage (269mm de largeur utile).
  - Gestion de l'URL : Le texte est tronqué proprement (ellipsize : `...`) plutôt que d'être brutalement coupé au milieu d'un mot.

## 5. Industrialisation et CI/CD (GitHub Actions)
- **Versions** : Synchronisation des numéros de version à la **v1.1.0** dans `package.json`, `Cargo.toml`, et `tauri.conf.json` pour éviter les conflits de compilation.
- **Fichiers exclus (Gitignore)** : Validation stricte des fichiers ignorés (`dist`, `node_modules`, et le fameux `src-tauri/target/` qui contient les exécutables locaux) tandis que le `Cargo.lock` a été conservé pour garantir la reproductibilité.
- **Workflow GitHub Action** : Mise en place de `.github/workflows/release.yml`. Lors d'un push sur la branche `main`, le cloud de GitHub compile automatiquement l'application pour générer l'installeur officiel Windows (`.exe`) et l'ajoute directement dans l'onglet "Releases" du dépôt.
