import React, { useState, useEffect, useRef } from "react";
import { DatabaseState, Employee, Machine, SalesInvoice } from "../types";
import { Brain, Send, ShieldAlert, AlertTriangle, AlertCircle, Mail, Sparkles, Printer, Hourglass, Zap, ChevronRight, MessageSquareCode, Settings, Calendar, Bell, X, CheckSquare, RefreshCw, Volume2, Download, Landmark } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { downloadHtmlDocument } from "../utils/downloadHelper";

export function AlvinLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      className={className}
    >
      <rect width="100" height="100" fill="none"/>

      <defs>
        <linearGradient id="alvinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A370FF" stopOpacity={1} />
          <stop offset="100%" stopColor="#8A4FFF" stopOpacity={1} />
        </linearGradient>
        <linearGradient id="glowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8A4FFF" stopOpacity={0.1} />
          <stop offset="100%" stopColor="#8A4FFF" stopOpacity={0.6} />
        </linearGradient>
      </defs>

      <path 
        d="M50 8 C35 8 18 18 10 35 Q5 50 10 65 C18 82 35 92 50 92 C65 92 82 82 90 65 Q95 50 90 35 C82 18 65 8 50 8 Z" 
        fill="none" 
        stroke="url(#alvinGrad)" 
        strokeWidth="2.5" 
        opacity="0.6"
      />

      <path 
        d="M50 15 L50 15 C45 25 40 35 35 45 C30 55 25 65 20 75 M50 15 C55 25 60 35 65 45 C70 55 75 65 80 75 M30 55 Q50 50 70 55 M50 15 C50 35 40 50 30 65 C20 80 30 90 50 90 C70 90 80 80 70 65 C60 50 50 35 50 15 Z" 
        fill="none" 
        stroke="url(#alvinGrad)" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
               
      <circle cx={50} cy={15} r="4.5" fill="url(#alvinGrad)"/>
      <circle cx={20} cy={75} r="3.5" fill="#A370FF"/>
      <circle cx={80} cy={75} r="3.5" fill="#8A4FFF"/>
      <circle cx={50} cy={90} r="2.5" fill="#8A4FFF" opacity={0.5}/>

      <path d="M50 15 Q55 25 60 35" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity={0.4}/>
      <circle cx={50} cy={15} r="1.5" fill="#FFFFFF"/>
    </svg>
  );
}

interface DashboardGerantProps {
  data: DatabaseState;
  onUpdate: (newData: DatabaseState) => void;
  darkMode: boolean;
}

interface ChatMessage {
  sender: "user" | "alvin";
  text: string;
  timestamp: string;
}

export default function DashboardGerant({ data, onUpdate, darkMode }: DashboardGerantProps) {
  // Etat de la messagerie
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "alvin",
      text: "Bonjour Directeur. Je suis **Alvin Agent AI**, votre assistant exécutif stratégique à Lubumbashi.\n\nJ'ai analysé en temps réel les récoltes des champs, l'activité de l'huilerie, l'état d'entretien des moulins et vos stocks d'emballages.\n\nDemandez-moi une **estimation précise d'épuisement de vos sacs de farine** ou de vos **bouteilles d'huile**, une **synthèse financière** ou un **plan d'action stratégique** !",
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLodingChat, setIsLoadingChat] = useState(false);
  
  // Utilise pour le generateur interactif de rapport PDF visible
  const [strategicReport, setStrategicReport] = useState<string | null>(null);
  
  // Etat de la configuration du seuil dynamique
  const [safetyDays, setSafetyDays] = useState<number>(15); // Par defaut 15 jours de stock de securite de production
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSentStatus, setEmailSentStatus] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLodingChat]);

  // Taux de production
  const cornDailyRate = data.productionRates.cornProcessingRate || 150;
  const soyDailyRate = data.productionRates.soyProcessingRate || 180;

  // Stocks
  const cornSacksLeft = data.stocks.consumables.find((c) => c.id === "CO-001")?.quantity || 0;
  const soyBottlesLeft = data.stocks.consumables.find((c) => c.id === "CO-002")?.quantity || 0;
  const engraisLeft = data.stocks.consumables.find((c) => c.id === "CO-003")?.quantity || 0;
  const pesticideLeft = data.stocks.consumables.find((c) => c.id === "CO-004")?.quantity || 0;

  // Produits finis
  const cornFlourProduct = data.stocks.finishedProducts.find((f) => f.id === "FP-001")?.quantity || 0;
  const soyOilProduct = data.stocks.finishedProducts.find((f) => f.id === "FP-002")?.quantity || 0;

  // Calcul dynamique de la vitesse moyenne des ventes
  const cornFlourSalesTotal = data.commercial.sales
    .filter((s) => s.product.includes("Farine"))
    .reduce((sum, s) => sum + s.quantity, 0);
  const totalSalesTransactions = data.commercial.sales.length || 1;
  const avgCornSalesDailySpeed = Math.round((cornFlourSalesTotal / totalSalesTransactions) * 0.8) || 80; // Vente estimee a 80 sacs par jour

  const soyOilSalesTotal = data.commercial.sales
    .filter((s) => s.product.includes("Huile"))
    .reduce((sum, s) => sum + s.quantity, 0);
  const avgSoySalesDailySpeed = Math.round((soyOilSalesTotal / totalSalesTransactions) * 0.5) || 20; // Vente estimee a 20 bouteilles par jour

  // Calculer des seuils dynamiques bases sur la vitesse de production et de vente
  const dynamicSacksThreshold = Math.round(cornDailyRate * safetyDays);
  const dynamicBottlesThreshold = Math.round(soyDailyRate * safetyDays);
  const dynamicCornFlourThreshold = Math.round(avgCornSalesDailySpeed * safetyDays);
  const dynamicSoyOilThreshold = Math.round(avgSoySalesDailySpeed * safetyDays);

  const dynamicEngraisThreshold = 5.0; // Tonnes
  const dynamicPesticideThreshold = 500; // Litres

  // Estimations des jours restants avant rupture
  const sacksRunoutDays = cornDailyRate > 0 ? (cornSacksLeft / cornDailyRate).toFixed(1) : "Infini";
  const bottlesRunoutDays = soyDailyRate > 0 ? (soyBottlesLeft / soyDailyRate).toFixed(1) : "Infini";

  // Verifier les transits en attente
  const pendingSacksPurchases = data.commercial.purchases
    .filter((p) => p.product.includes("Sacs") && p.status === "En Cours")
    .reduce((acc, p) => acc + p.quantity, 0);

  const pendingBottlesPurchases = data.commercial.purchases
    .filter((p) => p.product.includes("Bouteilles") && p.status === "En Cours")
    .reduce((acc, p) => acc + p.quantity, 0);

  const totalFutureSacks = cornSacksLeft + pendingSacksPurchases;
  const futureSacksRunoutDays = cornDailyRate > 0 ? (totalFutureSacks / cornDailyRate).toFixed(1) : "Infini";

  const totalFutureBottles = soyBottlesLeft + pendingBottlesPurchases;
  const futureBottlesRunoutDays = soyDailyRate > 0 ? (totalFutureBottles / soyDailyRate).toFixed(1) : "Infini";

  // Logique de declenchement dynamique pour les alertes d'alarme
  const activeAlertsList: Array<{ type: "critical" | "warning"; item: string; current: string; threshold: string; desc: string }> = [];

  if (cornSacksLeft < dynamicSacksThreshold) {
    activeAlertsList.push({
      type: "critical",
      item: "Sacs d'emballage vides 25kg (Farine)",
      current: `${cornSacksLeft.toLocaleString()} pièces`,
      threshold: `${dynamicSacksThreshold.toLocaleString()} pièces (Seuil pour ${safetyDays} jours)`,
      desc: `Alerte Seuil Dynamique : Le stock actuel (${cornSacksLeft} pcs) ne tiendra que ${sacksRunoutDays} jours contre un usage de production journalière de ${cornDailyRate} sacs. Risque d'arrêt d'embouteillage de la Farine.`
    });
  }

  if (soyBottlesLeft < dynamicBottlesThreshold) {
    activeAlertsList.push({
      type: "warning",
      item: "Bouteilles plastiques vides 1L",
      current: `${soyBottlesLeft.toLocaleString()} pièces`,
      threshold: `${dynamicBottlesThreshold.toLocaleString()} pièces (Seuil pour ${safetyDays} jours)`,
      desc: `Alerte Seuil Dynamique : Le stock actuel (${soyBottlesLeft} pcs) couvre ${bottlesRunoutDays} jours face à un rythme de production journalière de ${soyDailyRate} bouteilles.`
    });
  }

  if (cornFlourProduct < dynamicCornFlourThreshold) {
    activeAlertsList.push({
      type: "warning",
      item: "Farine de Maïs Tamisée Premium (Produit fini)",
      current: `${cornFlourProduct.toLocaleString()} sacs`,
      threshold: `${dynamicCornFlourThreshold.toLocaleString()} sacs (Seuil pour ${safetyDays} jours)`,
      desc: `Stock bas : La quantité disponible de Farine de Maïs en entrepôt (${cornFlourProduct} sacs) est sous le seuil dynamique requis pour faire face aux livraisons clients moyennes sous ${safetyDays} jours.`
    });
  }

  if (soyOilProduct < dynamicSoyOilThreshold) {
    activeAlertsList.push({
      type: "warning",
      item: "Huile de Soja Pure Raffinée (Produit fini)",
      current: `${soyOilProduct.toLocaleString()} bouteilles`,
      threshold: `${dynamicSoyOilThreshold.toLocaleString()} bouteilles (Seuil pour ${safetyDays} jours)`,
      desc: `Stock d'urgence : Le stock d'huile de soja finie (${soyOilProduct} bouteilles) est inférieur de la sécurité dynamique pour livrer nos acheteurs prévus.`
    });
  }

  if (engraisLeft < dynamicEngraisThreshold) {
    activeAlertsList.push({
      type: "critical",
      item: "Engrais NPK 15-15-15 (Intrant de culture)",
      current: `${engraisLeft} tonnes`,
      threshold: `${dynamicEngraisThreshold} tonnes`,
      desc: `Alerte Intrant Agricole : Le niveau d'engrais (${engraisLeft}T) est insuffisant pour la programmation maraîchère à venir (seuil de sécurité : ${dynamicEngraisThreshold}T).`
    });
  }

  // Gérer l'envoi de requêtes IA stratégiques
  const handleSendMessage = async (msgText: string) => {
    if (!msgText.trim() || isLodingChat) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text: msgText,
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoadingChat(true);

    try {
      const resp = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msgText,
          customData: data
        })
      });
      const resJson = await resp.json();
      const alvinText = resJson.text || "Pardon, je n'ai pas pu compiler la réponse. Pouvez-vous reformuler ?";
      
      const alvinMsg: ChatMessage = {
        sender: "alvin",
        text: alvinText,
        timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, alvinMsg]);
    } catch (err) {
      console.error("Chat communication failure:", err);
      const errorMsg: ChatMessage = {
        sender: "alvin",
        text: "🚨 **Échec de la connexion réseau avec Lubumbashi.**\nLe temps de latence est trop important ou le réseau est saturé. Veuillez réessayer.",
        timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const executeAutofillMessage = (text: string) => {
    handleSendMessage(text);
  };

  const handlePlayTTS = (text: string) => {
    try {
      if (!window.speechSynthesis) {
        alert("La synthèse vocale n'est pas supportée dans votre navigateur.");
        return;
      }
      window.speechSynthesis.cancel();
      // Nettoyer les caractères markdown pour une écoute agréable
      const plainText = text
        .replace(/\*\*|__/g, "")
        .replace(/#+\s/g, "")
        .replace(/-\s/g, "")
        .replace(/`[^`]+`/g, "")
        .replace(/[*_#`\-]/g, " ");

      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.lang = "fr-FR";
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStopTTS = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // Préréglages de requêtes rapides
  const presets = [
    { title: "Calcul des Ruptures d'Emballages", text: "Fais l'évaluation de rupture de stock de mes emballages (sacs, bouteilles) d'après les vitesses de broyage et d'huile." },
    { title: "Statuts Machines & Pannes", text: "Quelles sont les machines nécessitant une intervention d'urgence et comment réemployer notre équipe technique ?" },
    { title: "Plan de Recouvrement Factures", text: "Analyse mes factures de vente impayées ou en attente à Lubumbashi et donne-moi une tactique de relance de trésorerie locale." },
    { title: "Rapport Stratégique complet", text: `Rédige un rapport complet d'affaires et de stratégie avec calcul de seuil de sécurité sur ${safetyDays} jours pour le Directeur.` }
  ];

  // États dynamiques du graphique
  const [chartMetric, setChartMetric] = useState<"amount" | "quantity" | "profit">("amount");
  const [selectedBarIdx, setSelectedBarIdx] = useState<number | null>(0); // Par défaut la première facture sélectionnée

  // Données pour le graphique SVG
  const chartSales = data.commercial.sales.slice(0, 5).map((s, idx) => {
    let val = s.amount;
    if (chartMetric === "quantity") {
      val = s.quantity;
    } else if (chartMetric === "profit") {
      val = s.amount * 0.18;
    }
    return {
      label: s.client.split(" ")[0].substring(0, 10),
      amount: s.amount,
      quantity: s.quantity,
      profit: s.amount * 0.18,
      product: s.product,
      date: s.date,
      client: s.client,
      status: s.status,
      activeVal: val,
      idx
    };
  });
  const maxVal = Math.max(...chartSales.map((s) => s.activeVal), 1);

  // Déclencheur simulé d'e-mail SMTP
  const handleSimulateEmail = () => {
    setEmailSentStatus(true);
    setTimeout(() => {
      setShowEmailModal(true);
    }, 200);
  };

  return (
    <div className="space-y-6">
      
      {/* Bloc de titre */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-150 dark:border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Brain className="text-indigo-600 dark:text-indigo-400 shrink-0" /> Tour de Contrôle Stratégique l'Espace Gérant
          </h2>
          <p className="text-xs text-slate-500 dark:text-gray-405">
            Évaluation automatisée en temps réel d'après les stocks des dépôts, factures et lignes d'industries de Lubumbashi.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {strategicReport && (
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Printer size={13} /> Imprimer Bulletin PDF
            </button>
          )}
          <button
            onClick={handleSimulateEmail}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            id="btn-simulate-email-alert"
          >
            <Mail size={13} />
            <span>Alerter par Email</span>
          </button>
        </div>
      </div>

      {/* Banniere de Configuration du Seuil Dynamique */}
      <div className="bg-white dark:bg-neutral-900 shadow-sm border border-slate-205 dark:border-neutral-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-lg">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Settings size={15} className="text-indigo-600" /> Configuration des Alertes & Seuils Dynamiques
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-450 leading-relaxed">
            Configurez la couverture de sécurité minimale. Le système calcule dynamiquement votre seuil critique (Farine de maïs: <strong>150 sacs/jour</strong>, Huile de soja: <strong>180 bouteilles/jour</strong>, Ventes de farine: <strong>{avgCornSalesDailySpeed} sacs/jour</strong>).
          </p>
        </div>

        {/* Selecteur de jours de securite buffer */}
        <div className="w-full md:w-80 shrink-0 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-neutral-350">
            <span>Buffer de Couverture requis :</span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-mono text-xs">
              {safetyDays} jours de stock
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-450">5j</span>
            <input
              type="range"
              min="5"
              max="35"
              step="5"
              value={safetyDays}
              onChange={(e) => setSafetyDays(parseInt(e.target.value))}
              className="flex-1 h-1.5 bg-slate-100 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="text-[10px] text-gray-455">35j</span>
          </div>
          <div className="flex gap-2 justify-between pt-1">
            <button
              onClick={() => setSafetyDays(10)}
              className={`text-[9px] px-2 py-0.5 rounded-md transition font-extrabold ${
                safetyDays === 10
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                  : "bg-gray-100 dark:bg-neutral-800 text-slate-500 hover:bg-gray-200"
              }`}
            >
              10 J (Flux Tendu)
            </button>
            <button
              onClick={() => setSafetyDays(15)}
              className={`text-[9px] px-2 py-0.5 rounded-md transition font-extrabold ${
                safetyDays === 15
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                  : "bg-gray-100 dark:bg-neutral-800 text-slate-500 hover:bg-gray-200"
              }`}
            >
              15 J (Standard)
            </button>
            <button
              onClick={() => setSafetyDays(25)}
              className={`text-[9px] px-2 py-0.5 rounded-md transition font-extrabold ${
                safetyDays === 25
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                  : "bg-gray-100 dark:bg-neutral-800 text-slate-500 hover:bg-gray-200"
              }`}
            >
              25 J (Sécuritaire)
            </button>
          </div>
        </div>
      </div>

      {/* Grille contenant le panneau d'alertes dynamiques */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* DETECTEUR D'ALERTES DYNAMIQUES ET GRAPHIQUE SVG */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Tableau des Ruptures et Alertes Actives de l'Entreprise */}
          <div className="bg-white dark:bg-neutral-900 shadow-sm border border-slate-205 dark:border-neutral-800 p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-neutral-800/80 pb-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Bell size={15} className="text-indigo-600 animate-swing" /> Tableau des Ruptures & Alertes Actives
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight ${
                activeAlertsList.length > 0 ? "bg-red-50 dark:bg-red-955/20 text-red-600" : "bg-emerald-50 text-emerald-600"
              }`}>
                {activeAlertsList.length} Alerte{activeAlertsList.length > 1 ? "s" : ""} active{activeAlertsList.length > 1 ? "s" : ""}
              </span>
            </div>

            {activeAlertsList.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/50 dark:bg-neutral-850/10 border border-dashed border-slate-200 dark:border-neutral-800 rounded-xl space-y-2">
                <p className="text-xs font-bold text-slate-700 dark:text-neutral-300">🎉 Aucun seuil critique enfreint !</p>
                <p className="text-[10px] text-slate-400">Tous les stocks sont au-dessus de la couverture dynamique de {safetyDays} jours programmée.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeAlertsList.map((alert, i) => (
                  <div
                    key={i}
                    className={`p-3.5 rounded-xl border flex gap-3.5 items-start transition ${
                      alert.type === "critical"
                        ? "bg-red-50/60 dark:bg-red-955/10 border-red-200 dark:border-red-900/40 text-red-900 dark:text-red-300"
                        : "bg-amber-50/60 dark:bg-amber-955/10 border-amber-200 dark:border-amber-900/30 text-amber-900 dark:text-amber-200"
                    }`}
                  >
                    <div className="p-1.5 rounded-lg shrink-0 mt-0.5 bg-white/80 dark:bg-neutral-80">
                      {alert.type === "critical" ? (
                        <ShieldAlert size={14} className="text-red-600 animate-pulse" />
                      ) : (
                        <AlertTriangle size={14} className="text-amber-600" />
                      )}
                    </div>
                    <div className="space-y-1 select-text text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-white uppercase leading-tight">
                          {alert.item}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-sm bg-black/5 dark:bg-white/5 tracking-tight shrink-0 w-fit">
                          Stock: <strong className="font-extrabold">{alert.current}</strong>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-gray-300 leading-relaxed font-sans mt-0.5">
                        {alert.desc}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono tracking-tight mt-1">
                        Sécurité cible : <span className="font-semibold text-indigo-600 dark:text-indigo-400">{alert.threshold}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Indicateurs Predictifs de Conditionnement et Sacs */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-205 dark:border-neutral-800 p-5 space-y-4 shadow-xs text-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Indicateurs de Vitesse & Autonomie d'Entrepôts
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Prediction de stock de Sacs de farine */}
              <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-neutral-850/10 border border-slate-200 dark:border-neutral-800 relative overflow-hidden">
                <div className="absolute right-2.5 top-2.5 p-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/45 text-indigo-700 dark:text-indigo-300">
                  <Hourglass size={13} />
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Sacs 25kg (Farine)</span>
                <p className="text-lg font-extrabold text-slate-800 dark:text-white mt-1">
                  {cornSacksLeft.toLocaleString()} pièces
                </p>

                <div className="flex justify-between items-center text-[10px] text-slate-550 mt-2.5 pt-2 border-t border-slate-150 dark:border-neutral-800">
                  <span>Usage: {cornDailyRate} / jr</span>
                  <span className={`font-bold ${Number(sacksRunoutDays) < safetyDays ? "text-red-500" : "text-emerald-600"}`}>
                    Autonomie: ~{sacksRunoutDays} jrs
                  </span>
                </div>

                {pendingSacksPurchases > 0 && (
                  <div className="text-[9px] mt-2 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Zap size={10} /> En route: +{pendingSacksPurchases.toLocaleString()} pcs (~{futureSacksRunoutDays} j)
                  </div>
                )}
              </div>

              {/* Prediction de stock de Bouteilles d'huile */}
              <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-neutral-850/10 border border-slate-205 dark:border-neutral-800 relative overflow-hidden">
                <div className="absolute right-2.5 top-2.5 p-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/45 text-indigo-700 dark:text-indigo-300">
                  <Hourglass size={13} />
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Bouteilles 1L (Huile)</span>
                <p className="text-lg font-extrabold text-slate-800 dark:text-white mt-1">
                  {soyBottlesLeft.toLocaleString()} pièces
                </p>

                <div className="flex justify-between items-center text-[10px] text-slate-550 mt-2.5 pt-2 border-t border-slate-150 dark:border-neutral-800">
                  <span>Usage: {soyDailyRate} / jr</span>
                  <span className={`font-bold ${Number(bottlesRunoutDays) < safetyDays ? "text-red-500" : "text-emerald-600"}`}>
                    Autonomie: ~{bottlesRunoutDays} jrs
                  </span>
                </div>

                {pendingBottlesPurchases > 0 && (
                  <div className="text-[9px] mt-2 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Zap size={10} /> En route: +{pendingBottlesPurchases.toLocaleString()} pcs (~{futureBottlesRunoutDays} j)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Graphique financier SVG */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-205 dark:border-neutral-800 p-5 space-y-4 shadow-xs text-xs">
            
            {/* Description de l'en-tete et des onglets de metriques */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle size={15} className="text-indigo-600" /> Graphique Commercial Interactif
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Cliquez sur une barre pour analyser le client avec Alvin</p>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/45 text-indigo-700 dark:text-indigo-300 font-extrabold uppercase tracking-tight">
                Métriques d'Affaires Live
              </span>
            </div>

            {/* Commutateurs dynamiques de metriques */}
            <div className="flex bg-slate-100 dark:bg-neutral-950 p-1 rounded-xl max-w-sm gap-1 border border-slate-200/50 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setChartMetric("amount")}
                className={`flex-1 py-1 px-2.5 rounded-lg text-center text-[10px] font-bold transition-all cursor-pointer ${
                  chartMetric === "amount"
                    ? "bg-white dark:bg-neutral-850 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-705 dark:text-gray-400"
                }`}
              >
                Chiffre d'Affaires ($)
              </button>
              <button
                type="button"
                onClick={() => setChartMetric("quantity")}
                className={`flex-1 py-1 px-2.5 rounded-lg text-center text-[10px] font-bold transition-all cursor-pointer ${
                  chartMetric === "quantity"
                    ? "bg-white dark:bg-neutral-850 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-705 dark:text-gray-400"
                }`}
              >
                Volume (Litres)
              </button>
              <button
                type="button"
                onClick={() => setChartMetric("profit")}
                className={`flex-1 py-1 px-2.5 rounded-lg text-center text-[10px] font-bold transition-all cursor-pointer ${
                  chartMetric === "profit"
                    ? "bg-white dark:bg-neutral-850 text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-705 dark:text-gray-400"
                }`}
              >
                Bénéfices (18%)
              </button>
            </div>

            {/* Element SVG representant le graphique */}
            <div className="relative pt-2">
              <svg viewBox="0 0 500 200" className="w-full h-auto overflow-visible select-none font-sans">
                <line x1="40" y1="20" x2="480" y2="20" stroke="#f0f0f0" className="opacity-45" strokeDasharray="4" />
                <line x1="40" y1="80" x2="480" y2="80" stroke="#f0f0f0" className="opacity-45" strokeDasharray="4" />
                <line x1="40" y1="140" x2="480" y2="140" stroke="#f0f0f0" className="opacity-45" strokeDasharray="4" />
                <line x1="40" y1="170" x2="480" y2="170" stroke="#e2e8f0" strokeWidth="1.5" />

                {chartSales.map((item, index) => {
                  const paddingLeft = 40;
                  const totalBars = chartSales.length;
                  const stepX = (440 / totalBars);
                  const barWidth = Math.min(32, stepX - 16);
                  const barX = paddingLeft + index * stepX + (stepX - barWidth) / 2;

                  const maxChartHeight = 140;
                  const barHeight = (item.activeVal / maxVal) * maxChartHeight;
                  const barY = 170 - barHeight;
                  const isSelected = selectedBarIdx === index;

                  const getBarFill = () => {
                    if (isSelected) return "fill-violet-600 dark:fill-violet-400";
                    if (chartMetric === "profit") return "fill-emerald-500/80 hover:fill-emerald-600 dark:fill-emerald-600 dark:hover:fill-emerald-500";
                    return "fill-indigo-500/80 hover:fill-indigo-600 dark:fill-indigo-500 dark:hover:fill-indigo-400";
                  };

                  return (
                    <g 
                      key={item.idx} 
                      className="group cursor-pointer"
                      onClick={() => setSelectedBarIdx(index)}
                    >
                      <rect
                        x={barX}
                        y={barY}
                        width={barWidth}
                        height={Math.max(4, barHeight)}
                        rx="4"
                        className={`${getBarFill()} transition-all duration-300 filter ${isSelected ? "drop-shadow-[0_0_6px_rgba(139,92,246,0.5)]" : "hover:brightness-110"}`}
                      />
                      <text
                        x={barX + barWidth / 2}
                        y={barY - 7}
                        textAnchor="middle"
                        className="text-[9px] font-mono font-bold fill-slate-800 dark:fill-white opacity-0 group-hover:opacity-100 transition duration-200"
                      >
                        {chartMetric === "amount" ? `$${Math.round(item.amount)}` : chartMetric === "quantity" ? `${item.quantity}L` : `$${Math.round(item.profit)}`}
                      </text>
                      <text
                        x={barX + barWidth / 2}
                        y="184"
                        textAnchor="middle"
                        className={`text-[9px] font-sans tracking-tight transition-all ${isSelected ? "fill-violet-600 dark:fill-violet-400 font-bold" : "fill-gray-405"}`}
                      >
                        {item.label}
                      </text>
                    </g>
                  );
                })}

                <text x="5" y="24" className="text-[8px] fill-gray-400 font-mono">
                  {chartMetric === "amount" ? `$${Math.round(maxVal)}` : chartMetric === "quantity" ? `${Math.round(maxVal)}L` : `$${Math.round(maxVal)}`}
                </text>
                <text x="5" y="94" className="text-[8px] fill-gray-400 font-mono">
                  {chartMetric === "amount" ? `$${Math.round(maxVal / 2)}` : chartMetric === "quantity" ? `${Math.round(maxVal / 2)}L` : `$${Math.round(maxVal / 2)}`}
                </text>
                <text x="5" y="174" className="text-[8px] fill-gray-400 font-mono">0</text>
              </svg>
            </div>

            {/* Panneau Detaille Dynamique avec Commentaires Strategiques Alvin */}
            {selectedBarIdx !== null && chartSales[selectedBarIdx] && (
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150 dark:border-neutral-800 space-y-2 animate-fade-in text-slate-800 dark:text-neutral-100">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-mono font-bold text-indigo-700 dark:text-indigo-400">
                    Facture ID: #{data.commercial.sales[selectedBarIdx].id}
                  </span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold ${
                    chartSales[selectedBarIdx].status === "Payé" 
                      ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"
                      : "bg-amber-100 dark:bg-amber-950/55 text-amber-700 dark:text-amber-400"
                  }`}>
                    Statut: {chartSales[selectedBarIdx].status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-gray-400 text-[10px] block">Client principal</span>
                    <strong className="text-slate-800 dark:text-white font-bold">{chartSales[selectedBarIdx].client}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Huile commandée</span>
                    <strong className="text-slate-800 dark:text-white font-semibold">{chartSales[selectedBarIdx].product}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Volume total</span>
                    <strong className="text-slate-800 dark:text-white font-mono">{chartSales[selectedBarIdx].quantity.toLocaleString()} Litres</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Facturé / Marge (18%)</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 font-mono font-black block">
                      ${chartSales[selectedBarIdx].amount.toLocaleString()} <span className="text-gray-400 text-[10px] font-normal">(${Math.round(chartSales[selectedBarIdx].profit).toLocaleString()})</span>
                    </strong>
                  </div>
                </div>
                <div className="bg-violet-50/50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-violet-100 dark:border-slate-800/60 text-[11px] text-violet-800 dark:text-violet-300 mt-2">
                  <span className="font-extrabold text-[10px] text-violet-700 dark:text-violet-400 uppercase tracking-wider block mb-0.5">
                    🤖 Analyse Alvin Agent AI :
                  </span>
                  {chartSales[selectedBarIdx].status === "Payé" ? (
                    <span>Le client <strong>{chartSales[selectedBarIdx].client.split(" ")[0]}</strong> a entièrement soldé son solde de ${chartSales[selectedBarIdx].amount.toLocaleString()}. Ce flux de trésorerie est immédiatement disponible pour financer le réapprovisionnement de la logistique grainière à Lubumbashi.</span>
                  ) : (
                    <span><strong>ATTENTION TRESORERIE :</strong> Le solde de ${chartSales[selectedBarIdx].amount.toLocaleString()} de <strong>{chartSales[selectedBarIdx].client.split(" ")[0]}</strong> est en cours. Je recommande une relance commerciale amiable du dépôt pour éviter tout retard de paiement ce mois-ci.</span>
                  )}
                </div>
              </div>
            )}
            
            <p className="text-[10px] text-gray-450 text-center italic mt-1.5">
              Suivi des transactions clients majeures en gros à Lubumbashi (RDC)
            </p>
          </div>
        </div>

        {/* COLONNE DROITE : Zone de messagerie avec l'Agent Alvin */}
        <div className="lg:col-span-5 flex flex-col h-[75vh] bg-white dark:bg-neutral-900 rounded-2xl border border-slate-205 dark:border-neutral-800 overflow-hidden shadow-xs">
          
          {/* En-tete de la messagerie active */}
          <div className="p-4 bg-slate-50 dark:bg-neutral-850 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-violet-100/80 dark:bg-neutral-800 flex items-center justify-center shadow-xs shrink-0 select-none">
                <AlvinLogo className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-neutral-200 flex items-center gap-1.5 leading-none font-sans">
                  Conseils Alvin Agent AI <Sparkles size={11} className="text-violet-500 animate-pulse" />
                </h4>
                <span className="text-[9px] text-gray-400 font-mono">Prise en compte du Buffer de {safetyDays} jours</span>
              </div>
            </div>
            {window.speechSynthesis && (
              <button
                onClick={handleStopTTS}
                className="px-2 py-1 border border-rose-200 text-rose-700 hover:bg-rose-50 text-[10px] rounded-lg font-bold"
                title="Arrêter de lire à voix haute"
              >
                ■ Arrêter
              </button>
            )}
          </div>

          {/* Chronologie des messages */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4 font-sans text-xs bg-slate-50/10 dark:bg-neutral-950/20">
            {messages.map((m, idx) => {
              const isUser = m.sender === "user";
              return (
                <div key={idx} className={`flex gap-2.5 items-start ${isUser ? "justify-end" : "justify-start"} w-full`}>
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-violet-100/70 dark:bg-neutral-800 flex items-center justify-center border border-violet-100 dark:border-neutral-700/60 shadow-xs shrink-0 select-none mt-1">
                      <AlvinLogo className="w-5 h-5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-sm leading-relaxed ${
                      isUser
                        ? "bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-white rounded-tr-none border border-slate-200 dark:border-neutral-700 font-medium"
                        : "bg-white dark:bg-neutral-850 text-slate-800 dark:text-gray-100 rounded-tl-none border border-slate-200 dark:border-neutral-800"
                    }`}
                  >
                    {!isUser ? (
                      <div className="space-y-3">
                        <div className="text-xs select-text">
                          <Markdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <p className="mb-2 leading-relaxed text-slate-800 dark:text-neutral-200">{children}</p>,
                              strong: ({ children }) => <strong className="font-extrabold text-violet-750 dark:text-violet-300">{children}</strong>,
                              ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1 text-slate-800 dark:text-neutral-200">{children}</ul>,
                              li: ({ children }) => <li className="text-slate-800 dark:text-neutral-200">{children}</li>,
                              ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1 text-slate-800 dark:text-neutral-200">{children}</ol>,
                              h1: ({ children }) => <h1 className="text-sm font-black text-slate-900 dark:text-white mt-3 mb-1 uppercase tracking-wide border-b pb-1 border-slate-150 dark:border-neutral-800">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-xs font-black text-slate-800 dark:text-neutral-100 mt-2 mb-1 uppercase tracking-wider">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-xs font-extrabold text-slate-800 dark:text-neutral-200 mt-2 mb-1">{children}</h3>,
                              table: ({ children }) => (
                                <div className="overflow-x-auto my-3 border border-slate-200 dark:border-neutral-700/60 rounded-xl shadow-xs">
                                  <table className="min-w-full divide-y divide-slate-200 dark:divide-neutral-700 text-left text-xs bg-white/50 dark:bg-neutral-900/50">
                                    {children}
                                  </table>
                                </div>
                              ),
                              thead: ({ children }) => <thead className="bg-slate-50 dark:bg-neutral-800 text-slate-900 dark:text-white">{children}</thead>,
                              tbody: ({ children }) => <tbody className="bg-transparent divide-y divide-slate-100 dark:divide-neutral-800">{children}</tbody>,
                              tr: ({ children }) => <tr className="hover:bg-slate-50/50 dark:hover:bg-neutral-800/20">{children}</tr>,
                              th: ({ children, style }) => (
                                <th style={style} className="px-3 py-2 text-left font-bold border-b border-slate-200 dark:border-neutral-700 text-[11px] uppercase tracking-wider">
                                  {children}
                                </th>
                              ),
                              td: ({ children, style }) => (
                                <td style={style} className="px-3 py-2 text-slate-700 dark:text-neutral-300 font-normal font-sans text-xs">
                                  {children}
                                </td>
                              ),
                            }}
                          >
                            {m.text}
                          </Markdown>
                        </div>
                        
                        {/* BARRE D'ACTIONS INFERIEURE POUR LES OUTILS DE MESSAGE (TTS ET PDF) */}
                        <div className="pt-2 border-t border-slate-100 dark:border-neutral-800 flex items-center gap-3 text-[10px] font-bold">
                          <button
                            type="button"
                            onClick={() => handlePlayTTS(m.text)}
                            className="text-violet-700 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer select-none"
                            title="Écouter le contenu du message"
                          >
                            <Volume2 size={13} /> Lire à voix haute
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setStrategicReport(m.text)}
                            className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer select-none"
                            title="Générer un PDF officiel et personnalisable d'après cette réponse"
                          >
                            <Printer size={13} /> Générer Rapport PDF
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs select-text">{m.text}</p>
                    )}
                    <span className={`block text-[9px] mt-2 text-right ${isUser ? "text-slate-500 dark:text-neutral-450" : "text-slate-400"}`}>
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isLodingChat && (
              <div className="flex gap-2.5 items-start justify-start w-full">
                <div className="w-7 h-7 rounded-lg bg-violet-100/70 dark:bg-neutral-800 flex items-center justify-center border border-violet-100 dark:border-neutral-700/60 shadow-xs shrink-0 select-none mt-1 animate-pulse">
                  <AlvinLogo className="w-5 h-5" />
                </div>
                <div className="bg-white dark:bg-neutral-850 rounded-2xl p-4 rounded-tl-none flex items-center gap-2 border border-slate-150 dark:border-neutral-800">
                  <span className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="text-[10px] text-gray-400 font-mono ml-1 flex items-center gap-1">
                    <RefreshCw size={10} className="animate-spin text-violet-550" />
                    Alvin calcule les seuils...
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Grille de prereglages */}
          <div className="p-3 bg-slate-50 dark:bg-neutral-850/50 border-t border-slate-205 dark:border-neutral-800 space-y-2 shrink-0 no-print">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Consultations d'urgence Alvin AI :</span>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => executeAutofillMessage(p.text)}
                  disabled={isLodingChat}
                  className="p-2 border border-slate-200 dark:border-neutral-800 hover:border-violet-400 dark:hover:border-violet-500 rounded-xl text-left text-[10px] bg-white dark:bg-neutral-900/40 text-slate-600 dark:text-gray-300 transition line-clamp-2 leading-tight cursor-pointer font-medium"
                >
                  ✨ <span className="font-extrabold text-slate-800 dark:text-neutral-200">{p.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Formulaire d'ecriture */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputMessage);
            }}
            className="p-3 bg-white dark:bg-neutral-900 border-t border-slate-200 dark:border-neutral-800 flex gap-2 shrink-0 no-print"
          >
            <input
              type="text"
              required
              disabled={isLodingChat}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Posez une question sur nos stocks, pannes ou ventes..."
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-neutral-800 border-2 border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-hidden focus:outline-none focus:border-violet-600 disabled:opacity-50 placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={isLodingChat || !inputMessage.trim()}
              className="p-2 px-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center justify-center font-bold"
            >
              <Send size={14} />
            </button>
          </form>

        </div>

      </div>

      {/* APERCU AVANT IMPRESSION DU RAPPORT STRATEGIQUE DE L'IA */}
      {strategicReport && (
        <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white text-gray-905 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
            
            {/* Bloc d'en-tete et actions */}
            <div className="bg-neutral-100 px-6 py-4 flex justify-between items-center border-b border-neutral-200 no-print">
              <span className="text-xs font-extrabold text-neutral-850 flex items-center gap-2">
                📂 Aperçu Impression - Rapport Stratégique Alvin Agent AI PDF
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadHtmlDocument("printable-strategic-report", "rapport_strategique_alvin.html", "Rapport Stratégique Alvin Agent AI")}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Download size={14} /> Télécharger (.html)
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer size={14} /> Imprimer en PDF
                </button>
                <button
                  onClick={() => setStrategicReport(null)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Contenu du document */}
            <div id="printable-strategic-report" className="printable-area p-8 space-y-6 bg-white max-h-[75vh] overflow-y-auto select-text font-sans text-xs">
              <div className="flex justify-between items-start border-b border-gray-300 pb-6">
                <div>
                  <h3 className="text-lg font-extrabold text-violet-700 tracking-tight">ALVIN AGRO-INDUSTRIEL SARL</h3>
                  <p className="text-xs text-gray-500 mt-1">Route de Kipushi, Quartier Industriel • Lubumbashi, RDC</p>
                  <p className="text-[10px] text-gray-405 font-mono">Service d'Audit Stratégique d'Intelligence Artificielle</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-violet-100 text-violet-850 font-bold rounded-lg text-xs uppercase mb-1">
                    Bulletin d'Audit AI
                  </span>
                  <p className="text-xs text-gray-500 font-mono">Lubumbashi, le {new Date().toLocaleDateString("fr-FR")}</p>
                </div>
              </div>

              <div className="text-center">
                <h4 className="text-sm font-black uppercase tracking-wider text-gray-805 border-b border-gray-150 pb-2">
                  BULLETIN DE RECOMMANDATIONS PROCESSUS AGRO-ALIMENTAIRES
                </h4>
              </div>

              {/* Affichage elegant du texte markdown genere dans le style de document imprimable */}
              <div className="leading-relaxed text-gray-800 p-2 text-xs">
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-2 text-gray-800 font-medium">{children}</p>,
                    strong: ({ children }) => <strong className="font-bold text-black">{children}</strong>,
                    ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1 text-gray-800">{children}</ul>,
                    li: ({ children }) => <li className="text-gray-800">{children}</li>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1 text-gray-800">{children}</ol>,
                    h1: ({ children }) => <h1 className="text-sm font-black text-black mt-3 mb-1 uppercase border-b pb-1 border-gray-300">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xs font-black text-black mt-2 mb-1 uppercase">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-xs font-bold text-black mt-2 mb-1">{children}</h3>,
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-3 border border-gray-300 rounded-lg shadow-2xs">
                        <table className="min-w-full divide-y divide-gray-300 text-left text-[11px] bg-white">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => <thead className="bg-gray-100 text-gray-900">{children}</thead>,
                    tbody: ({ children }) => <tbody className="bg-white divide-y divide-gray-250">{children}</tbody>,
                    tr: ({ children }) => <tr className="hover:bg-gray-50/50">{children}</tr>,
                    th: ({ children, style }) => (
                      <th style={style} className="px-2 py-1.5 font-bold text-gray-900 border-b border-gray-300 text-[10px] uppercase tracking-wider">
                        {children}
                      </th>
                    ),
                    td: ({ children, style }) => (
                      <td style={style} className="px-2 py-1.5 text-gray-800 font-normal font-sans text-xs">
                        {children}
                      </td>
                    ),
                  }}
                >
                  {strategicReport}
                </Markdown>
              </div>

              {/* Section des signatures */}
              <div className="pt-12 grid grid-cols-2 gap-4 text-center text-xs text-gray-400 border-t border-dashed border-gray-250">
                <div>
                  <p className="font-bold text-[10px] uppercase text-gray-505">Gérant Mandataire Principal</p>
                  <div className="h-10"></div>
                  <p className="border-t border-gray-200 pt-1">Signature autorisée</p>
                </div>
                <div>
                  <p className="font-bold text-[10px] uppercase text-gray-505">Pour Audit Alvin Agent AI</p>
                  <div className="h-10"></div>
                  <p className="border-t border-gray-200 pt-1">Système validé en temps réel</p>
                </div>
              </div>

              <div className="text-center text-[10px] text-gray-400 font-mono italic pt-6">
                Grand-Livre de Décisions Opérationnelles Alvin Agro-industriel. Conçu par Arnold Menemene.
              </div>
            </div>

            {/* Barre d'Actions Inferieure - Toujours accessible en bas du visionneur de document (corrige le probleme de defilement) */}
            <div className="bg-neutral-50 px-6 py-4 flex justify-end items-center gap-3 border-t border-neutral-200 rounded-b-2xl no-print">
              <button
                onClick={() => setStrategicReport(null)}
                className="px-4 py-2 hover:bg-neutral-200 bg-neutral-150 text-neutral-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Fermer
              </button>
              <button
                onClick={() => downloadHtmlDocument("printable-strategic-report", "rapport_strategique_alvin.html", "Rapport Stratégique Alvin Agent AI")}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition"
              >
                <Download size={14} /> Télécharger (.html)
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition transform hover:scale-[1.02]"
              >
                <Printer size={14} /> Imprimer en PDF / Télécharger
              </button>
            </div>

          </div>
        </div>
      )}

      {/* POPUP DE LA RUPTURE DE STOCK AVEC DETAILS SMTP */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in no-print">
          <div className="bg-white dark:bg-neutral-900 border border-slate-205 dark:border-neutral-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* En-tete du popup */}
            <div className="bg-slate-55 dark:bg-neutral-850 p-4 border-b border-slate-150 dark:border-neutral-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-955/20 text-emerald-705 dark:text-emerald-400 flex items-center justify-center">
                  <Mail size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Alerte de Stock Déclenchée (Simulateur SMTP local)</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Relais SMTP : srv-mail.lubumbashi-alvin.net • Port 25</span>
                </div>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-neutral-800 rounded-lg text-slate-400 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Conteneur simule de l'email */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 font-sans text-xs bg-slate-50 dark:bg-neutral-950 select-text">
              <div className="bg-white dark:bg-neutral-950 p-4 rounded-xl border border-slate-200 dark:border-neutral-800 space-y-2">
                <div>
                  <span className="text-slate-400 block font-mono text-[10px]">DE :</span>
                  <span className="font-bold text-slate-700 dark:text-neutral-300">alvin-erp-notify@alvinagro.com (Lubumbashi Automatic Dispatcher)</span>
                </div>
                <div className="border-t border-slate-100 dark:border-neutral-800 pt-1.5">
                  <span className="text-slate-400 block font-mono text-[10px]">POUR :</span>
                  <span className="font-bold text-indigo-705 dark:text-indigo-400">menesmva@gmail.com (Directeur Général / Gérant Principal)</span>
                </div>
                <div className="border-t border-slate-100 dark:border-neutral-800 pt-1.5">
                  <span className="text-slate-400 block font-mono text-[10px]">SUJET :</span>
                  <span className="font-extrabold text-red-600 dark:text-red-400">⚠️ ALERTE OPÉRATIONNELLE : Risque de rupture de stocks à Kipushi, RDC (Buffer requis : {safetyDays} jours)</span>
                </div>
              </div>

              {/* Contenu du corps de l'email */}
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-slate-200 dark:border-neutral-800 space-y-4 shadow-sm text-slate-800 dark:text-neutral-101">
                <div className="border-b border-slate-100 dark:border-neutral-800 pb-3">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-md">ALVIN AGRO-INDUSTRIEL SARL — FLUX DE TRAVAIL DES STOCKS</h4>
                  <p className="text-[10px] text-slate-350 mt-0.5">Lubumbashi • Date d'édition : {new Date().toLocaleDateString("fr-FR")} à 12h00 UTC</p>
                </div>

                <p className="text-xs leading-relaxed">
                  Cher Directeur Général,
                </p>

                <p className="text-xs leading-relaxed">
                  Le système de surveillance intelligent Alvin Agent AI a identifié que plusieurs niveaux de fournitures et emballages sont tombés en dessous des seuils dynamiques de couverture de sécurité requis pour garantir un rythme de production stable de {safetyDays} jours.
                </p>

                <div className="bg-rose-50/50 dark:bg-rose-955/15 p-4 rounded-xl border border-rose-150 text-rose-900 dark:text-rose-300 space-y-3 font-semibold">
                  <h5 className="font-black flex items-center gap-1.5 text-xs text-rose-600">
                    <ShieldAlert size={14} /> RÉCAPITULATIF DES ENFREINTES CRITIQUES SUR L'ENTREPOT DE KIPUSHI (DRC) :
                  </h5>
                  <div className="space-y-2 text-[11px] font-sans">
                    <p>
                      • <strong>Sacs d'emballage vides 25kg (Farine d'Uvira) :</strong> Stock actuel : <strong>{cornSacksLeft.toLocaleString()} pcs</strong> (Seuil minimal attendu pour {safetyDays} jours : <strong>{dynamicSacksThreshold.toLocaleString()} pcs</strong>). <span className="underline font-bold">Autonomie actuelle : ~{sacksRunoutDays} jours uniquement</span> face à la vitesse du broyeur (150 sacs/jour).
                    </p>
                    <p>
                      • <strong>Engrais de culture NPK 15-15-15 :</strong> Stock actuel : <strong>{engraisLeft} tonnes</strong> (Niveau d'urgence fixé à {dynamicEngraisThreshold} tonnes). Risque de retard sur les semis maraîchers.
                    </p>
                    {activeAlertsList.filter(a => a.item.includes("Bouteilles") || a.item.includes("Farine de Maïs") || a.item.includes("Huile")).map((a, i) => (
                      <p key={i}>
                        • <strong>{a.item} :</strong> Actuel : {a.current} (Seuil requis de {safetyDays}j : {a.threshold}).
                      </p>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl space-y-2">
                  <h5 className="font-bold text-slate-905 dark:text-white text-xs font-sans">RECOMMANDATIONS EXÉCUTIVES PRIORITAIRES :</h5>
                  <ul className="list-disc list-inside space-y-1.5 font-sans leading-relaxed text-[11px] text-slate-655">
                    <li>Rationnaliser la transformation du Maïs ou activer en urgence l'avenant d'approvisionnement auprès de <strong>PlastKat Sarl</strong> (Actuellement, une commande de 5000 sacs est en transit prévue le 31 Mai).</li>
                    <li>Mobiliser l'équipe des finances pour encaisser les factures clients en cours (Etablissements Mwanke: <strong>$2,160 USD</strong>) pour alimenter la trésorerie et autoriser le décaissement pour l'achat de NPK.</li>
                  </ul>
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  Ceci est une notification automatique de l'agent Alvin AI. Veuillez prendre les mesures opérationnelles requises au niveau du terminal logistique de Lubumbashi.
                </p>
              </div>
            </div>

            {/* Pied de page du popup */}
            <div className="p-4 bg-slate-50 dark:bg-neutral-850 border-t border-slate-150 dark:border-neutral-800 flex justify-end gap-2 text-xs font-bold">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-slate-700 dark:text-neutral-200 rounded-xl transition cursor-pointer"
              >
                Fermer l'Aperçu
              </button>
              <button
                onClick={() => {
                  alert("Simulation de renvoi de mail effectuée avec succès vers menesmva@gmail.com !");
                  setShowEmailModal(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw size={13} /> Renvoyer par SMTP
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
