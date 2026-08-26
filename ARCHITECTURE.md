# Architecture & Documentation - Suivi des Candidatures

Ce document explique le rôle de chaque fichier créé dans ce projet et comment ils interagissent entre eux. L'application suit une architecture moderne combinant un Backend rust (Tauri) et un Frontend (React) avec une base de données locale (SQLite).

---

## 1. Backend & Configuration Tauri (`src-tauri/`)

Ces fichiers gèrent l'application native, l'accès au système de fichiers et la base de données SQLite embarquée.

*   **`src-tauri/src/main.rs` & `src-tauri/src/lib.rs`**
    *   **Rôle** : C'est le point d'entrée de l'application de bureau Rust (Backend).
    *   **Connexions** : Dans `lib.rs`, on initialise Tauri et on configure le plugin officiel `tauri-plugin-sql`. On lui indique d'utiliser une base SQLite (`candidatures.db`) et de charger les migrations automatiquement.
*   **`src-tauri/migrations/001_init.sql`**
    *   **Rôle** : Schéma de base de données. Il contient la requête SQL pour créer la table `candidatures` et ses index s'ils n'existent pas.
    *   **Connexions** : Chargé par `lib.rs` au démarrage. Tauri exécute ce fichier lors de la création initiale de la base de données.
*   **`src-tauri/capabilities/default.json`**
    *   **Rôle** : Fichier de sécurité Tauri.
    *   **Connexions** : Il autorise spécifiquement le frontend à communiquer avec le plugin SQL (permission `"sql:default"`). Sans cela, React ne pourrait pas lire ni écrire dans SQLite.

---

## 2. Logique de Données & États (Frontend - `src/`)

Ces fichiers gèrent les règles métier et la communication avec le backend Tauri.

*   **`src/types/candidature.ts`**
    *   **Rôle** : Définition des types TypeScript (interface `Candidature`, type `StatutCandidature`).
    *   **Connexions** : Importé par la quasi-totalité des fichiers Frontend pour assurer que les données manipulées sont strictement typées et correspondent aux colonnes SQLite.
*   **`src/lib/db.ts`**
    *   **Rôle** : Wrapper de la base de données. Il expose des fonctions JavaScript simples (`getCandidatures`, `createCandidature`, etc.).
    *   **Connexions** : Ce fichier est la passerelle vers le backend. Il utilise l'API `@tauri-apps/plugin-sql` pour envoyer des requêtes SQL directement à Tauri.
*   **`src/hooks/useCandidatures.ts`**
    *   **Rôle** : Hook React personnalisé. Il gère l'état global (les candidatures chargées, l'état de chargement, les erreurs).
    *   **Connexions** : Il fait le pont entre l'interface utilisateur (`App.tsx`) et la base de données (`db.ts`). Quand l'UI demande un ajout, ce hook appelle `db.ts`, puis met à jour l'état React pour rafraîchir l'écran.
*   **`src/lib/export.ts`**
    *   **Rôle** : Contient la logique d'exportation des données.
    *   **Connexions** : Reçoit la liste des candidatures depuis l'interface et utilise `SheetJS` (`xlsx`) pour générer le fichier Excel, ou génère manuellement le fichier CSV.

---

## 3. Interface Utilisateur (React Components - `src/components/`)

Ces fichiers sont les "briques" visuelles de l'application.

*   **`src/main.tsx`**
    *   **Rôle** : Démarre l'application React et injecte le CSS global.
*   **`src/App.tsx`**
    *   **Rôle** : Le composant principal (Chef d'orchestre).
    *   **Connexions** : Il instancie le hook `useCandidatures`. Il possède la donnée (les candidatures) et la distribue (via les *props*) à tous les sous-composants (`StatsBar`, `CandidatureTable`, etc.).
*   **`src/components/CandidatureForm.tsx`**
    *   **Rôle** : Formulaire d'ajout.
    *   **Connexions** : Reçoit la fonction `add` (depuis `App.tsx`) pour insérer une nouvelle donnée.
*   **`src/components/CandidatureTable.tsx`**
    *   **Rôle** : Affiche les candidatures sous forme de tableau interactif.
    *   **Connexions** : Reçoit la liste filtrée depuis `App.tsx`. Il reçoit aussi les fonctions `update` et `delete` pour modifier les statuts ou supprimer une ligne directement depuis le tableau. Il intègre le sous-composant `StatusBadge`.
*   **`src/components/StatusBadge.tsx`**
    *   **Rôle** : Un composant visuel minimaliste affichant une étiquette de couleur (ex: vert pour "Accepté").
*   **`src/components/StatsBar.tsx`**
    *   **Rôle** : Affiche les compteurs (total, acceptés, refus...).
    *   **Connexions** : Reçoit la liste de toutes les candidatures et calcule les statistiques à la volée.
*   **`src/components/FilterBar.tsx`**
    *   **Rôle** : Les boutons pour filtrer l'affichage par statut.
    *   **Connexions** : Modifie l'état `filter` défini dans `App.tsx`.
*   **`src/components/ExportButtons.tsx`**
    *   **Rôle** : Boutons "Télécharger Excel" et "Télécharger CSV".
    *   **Connexions** : Appellent les fonctions du fichier `export.ts`.

---

## 4. Design & Style

*   **`src/styles/global.css`**
    *   **Rôle** : Feuille de style unique en Vanilla CSS.
    *   **Connexions** : Importée dans `main.tsx`. Elle utilise des variables CSS (`:root`) pour maintenir un design cohérent et élégant sur l'ensemble des composants (couleurs, ombres, boutons, tableaux).
