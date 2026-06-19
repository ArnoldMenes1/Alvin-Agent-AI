import React from "react";
import { DatabaseState, Employee } from "../types";
import { Mail, Phone, Clock, Briefcase, Coins, Shield, BadgeAlert } from "lucide-react";

interface EmployeeSubHeaderProps {
  role: "admin" | "stocks" | "technical" | "commercial" | "manager";
  userName: string;
  userEmail: string;
  dbState: DatabaseState;
}

export default function EmployeeSubHeader({ role, userName, userEmail, dbState }: EmployeeSubHeaderProps) {
  // Recherche du profil employé dans la base de données correspondant à l'adresse e-mail de connexion
  const employee = dbState.employees.find(
    (emp) => emp.email.toLowerCase().trim() === userEmail.toLowerCase().trim()
  );

  // Si l'utilisateur est le gérant, crée une représentation d'avatar exécutif personnalisée
  const isManager = role === "manager";
  
  const profileName = employee?.name || userName || "Directeur d'Opérations";
  const profileRole = employee?.role || (isManager ? "Gérant Général & Administrateur Principal" : "Collaborateur Externe");
  const profileEmail = employee?.email || userEmail || "contact@alvinagro.com";
  const profilePhone = employee?.phone || "+243 812 300 000";
  const profilePhoto = employee?.photo || (isManager 
    ? "https://plus.unsplash.com/premium_photo-1682096252599-e8536cd97d2b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8amV1bmUlMjBob21tZXxlbnwwfHwwfHx8MA%3D%3D"
    : "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop");
  const profileStatus = employee?.status || "Présent";
  const profileId = employee?.id || (isManager ? "DIR-001" : "OPER-999");
  const profileSalary = employee?.salary || (isManager ? "N/A" : "450");

  // Obtenir les détails du quart de travail correspondant à l'employé
  const getShiftDetails = (roleStr: string) => {
    const r = roleStr.toLowerCase();
    if (r.includes("rh") || r.includes("admin") || r.includes("gérant") || r.includes("dir")) {
      return { shift: "Équipe Administative & Bureau", hours: "08:30 à 16:30" };
    } else if (r.includes("stock") || r.includes("logistique") || r.includes("dépôt")) {
      return { shift: "Équipe Logistique & Dépôt", hours: "07:30 à 16:30" };
    } else if (r.includes("tech") || r.includes("usine") || r.includes("broyeur")) {
      return { shift: "Équipe Usine & Lignes d'huile", hours: "08:00 à 17:00" };
    } else {
      return { shift: "Équipe Commerciale Terrain", hours: "08:30 à 17:00" };
    }
  };

  const shiftInfo = getShiftDetails(profileRole);

  // Mappage de couleur pour le badge de statut
  const getStatusBadge = (statusStr: string) => {
    switch (statusStr) {
      case "Présent":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-100 dark:border-emerald-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Connecté • Service Actif
          </span>
        );
      case "En Mission":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-450 text-xs font-bold rounded-full border border-amber-100 dark:border-amber-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            En Mission Extérieure
          </span>
        );
      case "Congé":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 text-xs font-bold rounded-full border border-sky-100 dark:border-sky-900/30">
            En Congé Annuel
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-400 text-xs font-bold rounded-full">
            Indisponible
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-850 p-5 mb-6 shadow-sm no-print">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Côté gauche : Photo d'avatar et détails professionnels de l'employé */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={profilePhoto} 
              alt={profileName} 
              className="w-14 h-14 rounded-2xl object-cover border-2 border-violet-500/20 dark:border-violet-450/40 shadow-xs" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-violet-600 dark:bg-violet-500 text-white rounded-lg flex items-center justify-center text-[10px] font-black shadow-md">
              🎖️
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold tracking-widest text-violet-600 dark:text-violet-400 uppercase bg-violet-50 dark:bg-violet-955/20 px-2 py-0.5 rounded-md">
                {profileId}
              </span>
              <span className="text-[10px] font-sans font-extrabold text-slate-400 tracking-wider">
                PORTAL COMPTE SALARIÉ
              </span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-1 leading-none flex items-center gap-1.5">
              {profileName}
              {isManager && <Shield size={14} className="text-violet-600 inline" />}
            </h2>
            <p className="text-xs text-slate-550 dark:text-gray-400 mt-1 flex items-center gap-1">
              <Briefcase size={12} className="text-slate-400" /> {profileRole}
            </p>
          </div>
        </div>

        {/* Côté central : Fiches de contact professionnel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-gray-450 border-t md:border-t-0 md:border-l md:border-r border-slate-100 dark:border-neutral-800 pt-4 md:pt-0 px-0 md:px-6 flex-1">
          <div className="flex items-center gap-2">
            <Mail size={13} className="text-slate-400" />
            <span className="truncate font-medium">{profileEmail}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={13} className="text-slate-400" />
            <span className="font-medium">{profilePhone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-slate-400" />
            <span>
              Horaire: <strong className="text-slate-800 dark:text-white font-semibold">{shiftInfo.hours}</strong> ({shiftInfo.shift})
            </span>
          </div>
          {!isManager && (
            <div className="flex items-center gap-2">
              <Coins size={13} className="text-slate-400" />
              <span>
                Cout horaire contractuel: <strong className="text-slate-800 dark:text-white font-mono font-bold">${profileSalary}/mois</strong>
              </span>
            </div>
          )}
          {isManager && (
            <div className="flex items-center gap-2">
              <Shield size={13} className="text-indigo-500" />
              <span className="text-indigo-600 dark:text-indigo-350 font-bold">Consulat stratégique Alvin AI</span>
            </div>
          )}
        </div>

        {/* Côté droit : Badge de statut actif */}
        <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-neutral-800">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Régulation Horaire
          </span>
          {getStatusBadge(profileStatus)}
        </div>

      </div>
    </div>
  );
}
