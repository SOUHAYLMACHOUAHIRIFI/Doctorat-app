# GCD USMBA — Plateforme de Gestion du Cycle Doctoral

**Université Sidi Mohamed Ben Abdellah (USMBA) · Fès**  
**Centre d'Études Doctorales (CED)**

Plateforme Full-Stack universitaire, moderne, sécurisée et modulaire pour la gestion intégrale du cycle doctoral de l'Université Sidi Mohamed Ben Abdellah de Fès.

---

## 🏛️ 1. Architecture Générale

L'application a été conçue selon une architecture Full-Stack en couches :

- **Frontend** : React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons.
- **Backend** : Node.js 22, Express, REST API avec validation Zod.
- **Sécurité** :
  - Authentification par cookies HTTP-Only `SameSite=Lax` + En-têtes Bearer Token JWT.
  - Hachage cryptographique des mots de passe avec **Bcrypt** (Salt rounds = 10).
  - Rate-Limiting sur les points d'entrée d'authentification contre les attaques par force brute.
  - Contrôle d'accès basé sur les rôles (**RBAC**) strict et isolé côté serveur.
- **Persistance des Données** :
  - Moteur relationnel atomique (`data/gcd_database.json`) synchronisé avec le schéma Prisma (`prisma/schema.prisma`).
  - Prêt pour PostgreSQL Cloud SQL via le modèle Prisma à 19 entités relationnelles.

---

## 👥 2. Rôles et Comptes de Démonstration (RBAC)

Tous les comptes institutionnels de test utilisent le mot de passe initial : `usmba2026`.

| # | Rôle | Email Institutionnel | Mot de Passe | Prérogatives |
|---|------|----------------------|--------------|--------------|
| **1** | **CANDIDATE** | `youssef.elamrani@usmba.ac.ma` | `usmba2026` | Profil candidat, dépôt & scan des 4 pièces obligatoires, recherche de sujets, postulation, suivi de dossier. |
| **2** | **DOCTORANT** | `salma.tazi@usmba.ac.ma` | `usmba2026` | Doctorant inscrit, réinscription annuelle, téléversement des rapports d'activité et publications. |
| **3** | **SUPERVISOR** | `karim.bennani@usmba.ac.ma` | `usmba2026` | Proposition de sujets, évaluation pédagogique des candidatures (Favorable, Défavorable, À corriger), avis sur réinscriptions. |
| **4** | **STRUCTURE_DIRECTOR** | `dir.lisac@usmba.ac.ma` | `usmba2026` | Examen et validation des sujets de recherche du laboratoire, validation des dossiers administratifs. |
| **5** | **CED_ADMIN** | `ced.admin@usmba.ac.ma` | `usmba2026` | Délibération finale d'admission, statistiques globales du CED, ouverture/clôture de la campagne doctorale. |
| **6** | **SYSTEM_ADMIN** | `admin.system@usmba.ac.ma` | `usmba2026` | Journal d'audit et de sécurité, gestion des comptes utilisateurs, supervision globale. |

---

## 🔄 3. Workflow en 7 Étapes du Candidat

1. **Étape 1 : Profil & 4 Pièces Obligatoires** (Baccalauréat, Relevés de notes, Diplôme, CIN). L'accès aux candidatures reste strictement verrouillé tant que les 4 pièces ne sont pas validées.
2. **Étape 2 : Consultation & Recherche des Sujets de Thèse** dans le catalogue des laboratoires.
3. **Étape 3 : Dépôt Formel de la Candidature** avec rattachement automatique des pièces et lettre de motivation.
4. **Étape 4 : Vérification Administrative des Pièces** par le guichet numérique du CED.
5. **Étape 5 : Évaluation Pédagogique du Directeur de Thèse** (Avis motivé et appréciation).
6. **Étape 6 : Validation par le Conseil de Structure / CED**.
7. **Étape 7 : Décision Finale & Promotion Automatique** du statut `CANDIDATE` en `DOCTORANT`.

---

## 📷 4. Module de Numérisation (Dual-Mode Scanner)

Le scanner de documents (`DocumentScannerModal.tsx`) intègre un système infaillible à double mode :
- **Mode Caméra Directe** : Capture en direct via `navigator.mediaDevices.getUserMedia` avec détection automatique de la caméra arrière (smartphone/tablette) ou webcam, cadrage dynamique et horodatage certifié sur canvas.
- **Mode Importation Fichier (Secours permanent)** : Sélecteur direct de fichiers PDF ou images (JPG, PNG, WebP) permettant de contourner tout blocage matériel ou refus d'autorisation vidéo.

---

## 📡 5. Documentation des Points d'Entrée API REST

### Authentification (`/api/auth`)
- `POST /api/auth/register` : Inscription d'un nouveau candidat avec email `@usmba.ac.ma`.
- `POST /api/auth/login` : Authentification, génération de cookie HTTP-Only et token JWT.
- `POST /api/auth/logout` : Révocation du cookie et déconnexion.
- `GET /api/auth/me` : Profil de l'utilisateur actuellement authentifié.
- `PUT /api/auth/profile` : Mise à jour des coordonnées et informations personnelles.
- `POST /api/auth/password/reset-request` : Demande de réinitialisation sécurisée du mot de passe.

### Sujets de Recherche (`/api/topics`)
- `GET /api/topics` : Liste des sujets validés (ou tous pour les administrateurs).
- `GET /api/topics/:id` : Détail d'un sujet de recherche.
- `POST /api/topics` : Création d'un sujet (réservé aux directeurs de thèse).
- `PUT /api/topics/:id` : Mise à jour d'un sujet.
- `POST /api/topics/:id/review` : Approbation ou rejet avec motif par la direction de structure.

### Documents Administratifs (`/api/documents`)
- `GET /api/documents/my` : Liste des documents du candidat connecté.
- `POST /api/documents/upload` : Téléversement ou scan d'une pièce justificative.
- `POST /api/documents/:id/review` : Examen et validation ou rejet motivé d'une pièce.
- `DELETE /api/documents/:id` : Suppression d'une pièce.

### Candidatures (`/api/applications`)
- `GET /api/applications` : Liste filtrée selon le rôle (candidat, directeur, structure).
- `POST /api/applications` : Soumission formelle d'une candidature.
- `POST /api/applications/:id/evaluate` : Évaluation pédagogique par le directeur de thèse.
- `POST /api/applications/:id/validate-structure` : Décision d'admission finale par le CED.
- `DELETE /api/applications/:id` : Retrait de candidature.

### Réinscriptions (`/api/re-enrollments`)
- `GET /api/re-enrollments` : Liste des demandes de réinscription annuelle.
- `POST /api/re-enrollments` : Dépôt d'une demande avec rapport d'activité et publications.
- `POST /api/re-enrollments/:id/evaluate` : Avis de l'encadrant.
- `POST /api/re-enrollments/:id/validate-ced` : Validation officielle de la réinscription.

### Notifications & Audit (`/api/notifications`, `/api/audit`, `/api/stats`)
- `GET /api/notifications/my` : Notifications en temps réel pour l'utilisateur connecté.
- `PUT /api/notifications/:id/read` : Marquer comme lue.
- `GET /api/stats/dashboard` : Indicateurs clés (KPIs) et statistiques d'admission du CED.
- `GET /api/audit` : Journal de sécurité et traçabilité pour les administrateurs.

---

## 🚀 6. Installation & Lancement

```bash
# 1. Installation des dépendances
npm install

# 2. Configuration des variables d'environnement
cp .env.example .env

# 3. Lancement du serveur Full-Stack (Express API + Vite sur le port 3000)
npm run dev

# 4. Compilation et vérification des types
npm run build
```
