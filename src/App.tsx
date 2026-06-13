import React, { useState, useEffect } from "react";
import LoginScreen from "./components/LoginScreen";
import PosteRH from "./components/PosteRH";
import PosteStocks from "./components/PosteStocks";
import PosteTechnique from "./components/PosteTechnique";
import PosteCommercial from "./components/PosteCommercial";
import DashboardGerant from "./components/DashboardGerant";
import { DatabaseState } from "./types";
import { LogOut, Sun, Moon, Database, MapPin, Smartphone, Download, QrCode, ShieldCheck, X, ChevronRight } from "lucide-react";
import CompanyLogo from "./components/CompanyLogo";
import EmployeeSubHeader from "./components/EmployeeSubHeader";

export type EnterpriseRole = "admin" | "stocks" | "technical" | "commercial" | "manager";

export default function App() {
  const [role, setRole] = useState<EnterpriseRole | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [dbState, setDbState] = useState<DatabaseState | null>(null);
  const [errorSync, setErrorSync] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [activeManagerTab, setActiveManagerTab] = useState<"general" | "admin" | "stocks" | "technical" | "commercial">("general");

  // Charger la base de donnees immediatement lors de l'activation
  useEffect(() => {
    async function loadData() {
      try {
        setIsSyncing(true);
        const resp = await fetch("/api/database");
        if (!resp.ok) throw new Error("Impossible de lire la base de données.");
        const json = await resp.json();
        setDbState(json);
      } catch (err: any) {
        console.error("Data load error:", err);
        setErrorSync("Erreur de synchronisation avec la base de données. Affichage autonome activé.");
      } finally {
        setIsSyncing(false);
      }
    }
    loadData();
  }, []);

  // Mettre a jour le theme de maniere dynamique (toujours clair)
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const handleUpdate = async (updated: DatabaseState) => {
    setDbState(updated);
    try {
      setIsSyncing(true);
      const resp = await fetch("/api/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (!resp.ok) throw new Error("Échec d'écriture.");
      setErrorSync(null);
    } catch (e) {
      console.warn("Write offline backup option:", e);
      setErrorSync("Enregistrement local effectué. Synchronisation serveur suspendue.");
    } finally {
      setIsSyncing(false);
    }
  };

  const getRoleLabel = (r: EnterpriseRole) => {
    switch (r) {
      case "admin": return "RH & Finance d'Entreprise";
      case "stocks": return "Logistique des Stocks & Intrants";
      case "technical": return "Ingénierie & Maintenance Usines";
      case "commercial": return "Gestion Commerciale & Facturation";
      case "manager": return "Directeur Général (Alvin AI Console)";
    }
  };

  if (!dbState) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex flex-col items-center justify-center p-4">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-t-indigo-600 border-gray-100 animate-spin mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Chargement de la Base de Données...</h3>
          <p className="text-xs text-slate-500">Contact des serveurs sécurisés ALVIN à Lubumbashi, RDC.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-slate-800 dark:bg-neutral-950 dark:text-neutral-100 transition duration-200 animate-fade-in">
      
      {/* Si aucun role de session n'est actif, afficher l'entree de connexion unifiee */}
      {!role ? (
        <LoginScreen
          data={dbState}
          onLogin={(selected, name, email) => {
            setRole(selected);
            setUserName(name);
            setUserEmail(email);
            setActiveManagerTab("general");
          }}
          onUpdate={handleUpdate}
          darkMode={darkMode}
        />
      ) : (
        /* COUCHE CONTENEUR DE SESSION */
        <div className="flex flex-col min-h-screen">
          
          {/* Barre de Navigation Superieure Executive */}
          <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-slate-200 dark:border-neutral-900 px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white dark:bg-neutral-900 border border-violet-100 dark:border-neutral-800 p-1 flex items-center justify-center shadow-md">
                <CompanyLogo size="100%" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                  ALVIN AGRO-INDUSTRIEL SARL
                </h1>
                <p className="text-[10px] text-slate-400 font-mono tracking-tight flex items-center gap-1.5 mt-0.5">
                  <MapPin size={10} className="text-red-500" /> Lubumbashi, Haut-Katanga, RDC
                </p>
              </div>
            </div>

            {/* Indicateur central du role actif dans la session */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/35 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-500 animate-pulse" />
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300">
                {getRoleLabel(role)} : {userName || "Opérateur"}
              </span>
            </div>

            {/* Outils d'action a droite : Synchroniseur, Deconnexion */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              {/* Indicateur de statut de synchronisation */}
              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                <Database size={11} className={isSyncing ? "animate-spin text-indigo-500" : "text-emerald-500"} />
                <span className="hidden sm:inline">{isSyncing ? "Saisie..." : "Synchronisé"}</span>
              </div>

              {/* Bouton pour abandonner le role de session */}
              <button
                onClick={() => {
                  setRole(null);
                  setUserName("");
                  setUserEmail("");
                }}
                className="p-2 sm:px-3 sm:py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-955/20 dark:hover:bg-red-955/35 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Quitter le poste"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Déconnecter</span>
              </button>
            </div>
          </header>

          {/* Onglets de navigation du panneau de controle pour le Gerant (uniquement visible pour le Directeur General) */}
          {role === "manager" && (
            <div className="bg-slate-50 dark:bg-neutral-900/40 border-b border-slate-200 dark:border-neutral-900 px-6 py-2 no-print">
              <div className="max-w-7xl mx-auto flex flex-wrap gap-2 text-xs font-bold">
                <button
                  onClick={() => setActiveManagerTab("general")}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                    activeManagerTab === "general"
                      ? "bg-indigo-600 text-white"
                      : "bg-white dark:bg-neutral-805 text-slate-600 dark:text-gray-300 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 dark:border-neutral-800"
                  }`}
                >
                  📊 Tableau de Bord DG (Alvin AI)
                </button>
                <button
                  onClick={() => setActiveManagerTab("admin")}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                    activeManagerTab === "admin"
                      ? "bg-indigo-600 text-white"
                      : "bg-white dark:bg-neutral-805 text-slate-600 dark:text-gray-300 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 dark:border-neutral-800"
                  }`}
                >
                  👥 Division RH & Paie
                </button>
                <button
                  onClick={() => setActiveManagerTab("stocks")}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                    activeManagerTab === "stocks"
                      ? "bg-indigo-600 text-white"
                      : "bg-white dark:bg-neutral-805 text-slate-600 dark:text-gray-300 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 dark:border-neutral-800"
                  }`}
                >
                  📦 Logistique & Dépôts
                </button>
                <button
                  onClick={() => setActiveManagerTab("technical")}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                    activeManagerTab === "technical"
                      ? "bg-indigo-600 text-white"
                      : "bg-white dark:bg-neutral-805 text-slate-600 dark:text-gray-300 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 dark:border-neutral-800"
                  }`}
                >
                  ⚙️ Maintenance Industrielle
                </button>
                <button
                  onClick={() => setActiveManagerTab("commercial")}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                    activeManagerTab === "commercial"
                      ? "bg-indigo-600 text-white"
                      : "bg-white dark:bg-neutral-850 text-slate-600 dark:text-gray-300 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 dark:border-neutral-800"
                  }`}
                >
                  💰 Commercial & Factures
                </button>
              </div>
            </div>
          )}

          {/* Alerte de synchroniseur en cas d'anomalie de connexion */}
          {errorSync && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-400 px-6 py-2 text-center text-[11px] font-semibold">
              ⚠️ {errorSync}
            </div>
          )}

          {/* Espace de travail principal */}
          <main className="flex-1 p-6 max-w-7xl mx-auto w-full text-slate-800 dark:text-neutral-100">
            {/* Sous-en-tete du profil du travailleur chargeant ses informations de session */}
            {role && dbState && (
              <EmployeeSubHeader 
                role={role} 
                userName={userName} 
                userEmail={userEmail} 
                dbState={dbState} 
              />
            )}

            {/* Vues standard des divisions restreintes */}
            {role === "admin" && (
              <PosteRH data={dbState} onUpdate={handleUpdate} darkMode={darkMode} />
            )}
            {role === "stocks" && (
              <PosteStocks data={dbState} onUpdate={handleUpdate} darkMode={darkMode} />
            )}
            {role === "technical" && (
              <PosteTechnique data={dbState} onUpdate={handleUpdate} darkMode={darkMode} />
            )}
            {role === "commercial" && (
              <PosteCommercial data={dbState} onUpdate={handleUpdate} darkMode={darkMode} />
            )}

            {/* Vue Directe du Gerant disposant de toutes les options multi-divisions */}
            {role === "manager" && (
              <>
                {activeManagerTab === "general" && (
                  <DashboardGerant data={dbState} onUpdate={handleUpdate} darkMode={darkMode} />
                )}
                {activeManagerTab === "admin" && (
                  <div className="space-y-4">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-450 text-xs font-bold rounded-xl flex items-center gap-2">
                      <span>🕵️</span>
                      <span>Mode Consultation : Vous visualisez actuellement la division <strong>Ressources Humaines & Paie</strong> en tant que Directeur Général.</span>
                    </div>
                    <PosteRH data={dbState} onUpdate={handleUpdate} darkMode={darkMode} />
                  </div>
                )}
                {activeManagerTab === "stocks" && (
                  <div className="space-y-4">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-450 text-xs font-bold rounded-xl flex items-center gap-2">
                      <span>🕵️</span>
                      <span>Mode Consultation : Vous visualisez actuellement la division <strong>Logistique des Stocks</strong> en tant que Directeur Général.</span>
                    </div>
                    <PosteStocks data={dbState} onUpdate={handleUpdate} darkMode={darkMode} />
                  </div>
                )}
                {activeManagerTab === "technical" && (
                  <div className="space-y-4">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-450 text-xs font-bold rounded-xl flex items-center gap-2">
                      <span>🕵️</span>
                      <span>Mode Consultation : Vous visualisez actuellement la division <strong>Maintenance Industrielle</strong> en tant que Directeur Général.</span>
                    </div>
                    <PosteTechnique data={dbState} onUpdate={handleUpdate} darkMode={darkMode} />
                  </div>
                )}
                {activeManagerTab === "commercial" && (
                  <div className="space-y-4">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-450 text-xs font-bold rounded-xl flex items-center gap-2">
                      <span>🕵️</span>
                      <span>Mode Consultation : Vous visualisez actuellement la division <strong>Facturation & Ventes Commerciales</strong> en tant que Directeur Général.</span>
                    </div>
                    <PosteCommercial data={dbState} onUpdate={handleUpdate} darkMode={darkMode} />
                  </div>
                )}
              </>
            )}
          </main>

          {/* Label texte de bas de page respectueux et humble */}
          <footer className="py-6 border-t border-slate-200 text-center text-[11px] text-slate-400 font-sans mt-12 no-print">
            © 2026 ALVIN AGRO-INDUSTRIEL SARL• Lubumbashi RDC • Tous droits réservés.  Conçu par Arnold MENEMENE
          </footer>


        </div>
      )}
    </div>
  );
}
