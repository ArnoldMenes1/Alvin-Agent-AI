<div align="center">

  <!-- Icône de l'application -->
  <div style="background-color: #F5F3FF; padding: 20px; border-radius: 24px; display: inline-block; border: 1px solid #E9E3FF; margin-bottom: 16px;">
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
    </svg>
  </div>

  <h1>💜 ALVIN AGRO-INDUSTRIEL ERP</h1>
  <h1>REALISER PAR ARNOLD MENEMENE</h1>
  <p><strong>Système Intégré de Gestion de Nouvelle Génération piloté par Agent Intelligent</strong></p>

  <!-- Badges de technologies -->
  <p>
    <img src="https://img.shields.io/badge/Architecture-Full_Stack-8B5CF6?style=for-the-badge" alt="FullStack">
    <img src="https://img.shields.io/badge/Database-Supabase_Cloud-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase">
    <img src="https://img.shields.io/badge/AI_Engine-Gemini_API-4285F4?style=for-the-badge&logo=google" alt="Gemini">
    <img src="https://img.shields.io/badge/Environment-Cloud_Europe-0052CC?style=for-the-badge" alt="Cloud Europe">
  </p>

  <p style="color: #64748B; max-width: 700px; font-size: 15px;">
    Une plateforme ERP résiliente, optimisée pour le déploiement multi-IP sur réseau local et cloud, combinant une gestion stricte des ressources industrielles (RH, Stocks, Ventes) avec la puissance analytique d'un agent conversationnel synchrone.
  </p>

  <br>

  <!-- Liens d'accès rapides -->
  <table data-canonical-src="" style="border-collapse: collapse; border: none;">
    <tr>
      <td style="border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 24px; background: #FBFBFF; text-align: center;">
        <a href="https://alvin-agent-ai-537070332994.europe-west2.run.app" target="_blank" style="text-decoration: none; color: #7C3AED; font-weight: bold;">🚀 Accéder à l'Application</a>
      </td>
      <td style="border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 24px; background: #FBFBFF; text-align: center;">
        <a href="https://www.canva.com/design/DAHMKo8OXaY/Vn86lwy3kCcClO92uRvZIg/view?utm_content=DAHMKo8OXaY&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hacfdc91ee0#8" target="_blank" style="text-decoration: none; color: #7C3AED; font-weight: bold;">📊 Diaporama Canva</a>
      </td>
      <td style="border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 24px; background: #FBFBFF; text-align: center;">
        <a href="https://drive.google.com/file/d/1NdMx41amcv2cj64uaB62KRCKOpa4UdTL/view?usp=drive_link" target="_blank" style="text-decoration: none; color: #7C3AED; font-weight: bold;">📂 Rapport Technique PDF</a>
      </td>
    </tr>
  </table>

</div>

---

## 🎨 Charte Graphique & Ergonomie

L'application a été bâtie selon le standard **Prestige Light Mode**, méticuleusement optimisé pour le confort visuel lors d'utilisations intensives sur le terrain :
*   **Fond Principal :** Blanc-bleuté améthyste ultra-clair (`#F8F9FC`) limitant la fatigue oculaire.
*   **Contraste :** Typographie en nuances de charbon profond (`Slate-900`) pour une lisibilité parfaite en plein soleil.
*   **Accents :** Teintes de Violet Doux et Indigo Royal pour identifier instantanément les commandes prioritaires.
*   **Mobile-First :** Neutralisation des distorsions ou zooms automatiques du système mobile et boutons tactiles calibrés à un minimum de `44px`.

---

## 🚀 Fonctionnalités Clés du Système

### 💬 1. Agent IA Analytique Connecté (Agent Alvin)
*   **Contextualisation en Temps Réel :** À chaque interaction, l'agent extrait instantanément la situation globale de l'entreprise depuis la base de données cloud pour formuler ses diagnostics.
*   **Rendu Visuel Moderne :** Structuration enrichie des réponses de l'IA (mise en relief des formules industrielles, listes, titres clairs et tableaux de bordures fines violettes).
*   **Persistance Absolue :** Sauvegarde et historisation bidirectionnelle systématique de l'intégralité des fils de discussions directement au sein de la table cloud `ai_chat_history`.
*   **Export Administratif PDF :** Génération instantanée au format papier à en-tête officiel corporate de la société, intégrant la date, l'auteur et un espace de signature standardisé.

### 👥 2. Gestion RH Avancée & Capture Médias
*   **Portfolio d'Identité :** Grille ergonomique affichant les fiches détaillées de chaque agent opérationnel.
*   **Acquisition Caméra Native :** Module de capture photo en direct via l'API Web `navigator.mediaDevices.getUserMedia` avec encodage transparent en chaîne Base64 pour persistance immédiate.
*   **Suivi Chronologique des Présences :** Calendrier décisionnel associant les statuts réglementaires exacts (*En poste, En mission, En mis à pied, Licencié*).

### 📦 3. Postes Opérationnels Décentralisés
*   Interfaces métiers hermétiques et optimisées pour les flux de production : Gestion logistique des stocks, terminaux techniques de maintenance et consoles commerciales de facturation.

---

## 🛠️ Architecture Technique & Stack

L'architecture s'appuie sur une isolation stricte des couches pour garantir des performances optimales et une scalabilité totale :

| Couche | Technologie Principale | Rôle Métier |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite + Tailwind CSS | Interface utilisateur réactive, fluide et optimisée mobile. |
| **Backend** | Node.js + Express (TypeScript) | API REST d'orchestration, routage réseau local, injection de contexte. |
| **Persistance** | Supabase (PostgreSQL Cloud) | Base de données relationnelle principale unifiée (CRUD immédiat). |
| **Moteur IA** | Google Gemini 2.5 Flash SDK | Traitement cognitif, bilans de production et prévisions de pannes. |
| **Conteneur** | Docker (Multi-stage Build) | Packaging unifié de l'infrastructure prêt pour l'exploitation. |

---

## 📁 Structure du Code Source

```text
├── supabase_setup.sql       # Script de migration et schéma relationnel des tables SQL
├── server.ts                 # Serveur Express configuré sur l'hôte réseau 0.0.0.0:3002
├── Dockerfile                # Image de production optimisée multi-étape pour Google Cloud
├── package.json              # Scripts d'exécution (incluant l'exposition réseau --host)
└── src/
    ├── main.tsx              # Point d'entrée de l'application
    ├── types.ts              # Déclarations et typages stricts des données ERP
    ├── utils/
    │   └── downloadHelper.ts # Moteur de conversion et mise en page administrative PDF
    └── components/
        ├── LoginScreen.tsx   # Authentification et routage par profils opérationnels
        ├── DashboardGerant.tsx # Console DG, Chat IA synchrone et export de documents
        └── PosteRH.tsx       # Gestion du personnel, flux caméra et calendrier

