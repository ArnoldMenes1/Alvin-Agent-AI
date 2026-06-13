import React, { useState } from "react";
import { DatabaseState, UserAccount, Employee } from "../types";
import { User, Layers, ShieldCheck, Activity, LineChart, Landmark, Lock, Mail, ArrowLeft, KeyRound, Sparkles, Smartphone, QrCode, ClipboardCheck, Clock, UserCheck, CheckCircle2, ChevronRight, Check, UserPlus } from "lucide-react";
import CompanyLogo from "./CompanyLogo";

interface LoginScreenProps {
  data: DatabaseState;
  onLogin: (role: "admin" | "stocks" | "technical" | "commercial" | "manager", name: string, email: string) => void;
  onUpdate: (newData: DatabaseState) => void;
  darkMode: boolean;
}

export default function LoginScreen({ data, onLogin, onUpdate, darkMode }: LoginScreenProps) {
  // Selection du mode : "login" (connexion poste), "register" (inscription employe), "mobile" (simulateur Android), "recruit" (recrutement direct)
  const [activeScreen, setActiveScreen] = useState<"choose" | "login" | "register" | "mobile" | "mobile_dashboard" | "recruit">("choose");
  const [selectedRole, setSelectedRole] = useState<"admin" | "stocks" | "technical" | "commercial" | "manager" | null>(null);

  // Etats des formulaires
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Etats de l'inscription
  const [registerEmail, setRegisterEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [matchedEmployee, setMatchedEmployee] = useState<Employee | null>(null);
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Etat de recrutement
  const [newEmpForm, setNewEmpForm] = useState({
    name: "",
    role: "Administratif/RH - Chef des Équipes Agricoles",
    email: "",
    phone: "",
    salary: "450",
    status: "Présent" as Employee["status"],
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop"
  });
  const [isUploading, setIsUploading] = useState(false);

  // Etats du simulateur mobile
  const [mobileEmail, setMobileEmail] = useState("");
  const [mobilePassword, setMobilePassword] = useState("");
  const [loggedInWorker, setLoggedInWorker] = useState<Employee | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState("");
  const [scannedLogs, setScannedLogs] = useState<Array<{ date: string, time: string, status: string, delay: string }>>([
    { date: "2026-05-25", time: "07:45", status: "A l'heure", delay: "0 min" },
    { date: "2026-05-22", time: "08:12", status: "A l'heure", delay: "0 min" },
  ]);

  // Liste initiale des identifiants professionnels pour l'ERP Alvin
  const demoUsers = data.users || [
    {
      role: "manager" as const,
      email: "manager@alvinagro.com",
      password: "alvinmanager2026",
      name: "Gérant Principal (DG)"
    },
    {
      role: "manager" as const,
      email: "menesmva@gmail.com",
      password: "alvinmanager2026",
      name: "Directeur Général (DG)"
    },
    {
      role: "admin" as const,
      email: "jean.kabamba@alvinagro.com",
      password: "alvinrh2026",
      name: "Jean Kabamba"
    },
    {
      role: "stocks" as const,
      email: "marc.mwamba@alvinagro.com",
      password: "alvinstock2026",
      name: "Marc Mwamba"
    },
    {
      role: "technical" as const,
      email: "aminata.tshibola@alvinagro.com",
      password: "alvintech2026",
      name: "Aminata Tshibola"
    },
    {
      role: "commercial" as const,
      email: "sarah.mwaza@alvinagro.com",
      password: "alvinsales2026",
      name: "Sarah Mwaza"
    }
  ];

  const roles = [
    {
      id: "manager" as const,
      title: "Directeur Général (Espace Gérant)",
      desc: "Tour de contrôle administrative & conversation avec l'Agent AI Alvin",
      icon: LineChart,
      color: "from-violet-500 to-violet-700",
      accent: "text-violet-600 dark:text-violet-400",
      bgHover: "hover:bg-violet-100/30 dark:hover:bg-violet-950/20 hover:border-violet-400 dark:hover:border-violet-500",
      bgDirect: "bg-violet-50/50 dark:bg-violet-955/15 border-violet-200 dark:border-violet-900/40 text-violet-950 dark:text-violet-200"
    },
    {
      id: "admin" as const,
      title: "Ressources Humaines & Finance",
      desc: "Suivi des salariés, présences journalières et fiches de paie",
      icon: Landmark,
      color: "from-slate-600 to-violet-800",
      accent: "text-slate-600 dark:text-slate-400",
      bgHover: "hover:bg-slate-100/50 dark:hover:bg-neutral-800/40 hover:border-slate-400 dark:hover:border-slate-500",
      bgDirect: "bg-slate-100/40 dark:bg-neutral-850/30 border-slate-250 dark:border-neutral-800 text-slate-900 dark:text-neutral-200"
    },
    {
      id: "stocks" as const,
      title: "Gestion des Stocks & Consommables",
      desc: "Entrées récoltes, cartons finis, inventaires d'emballages",
      icon: Layers,
      color: "from-emerald-600 to-teal-700",
      accent: "text-emerald-600 dark:text-emerald-400",
      bgHover: "hover:bg-emerald-100/30 dark:hover:bg-emerald-950/20 hover:border-emerald-500 dark:hover:border-emerald-600",
      bgDirect: "bg-emerald-50/50 dark:bg-emerald-955/15 border-emerald-200 dark:border-emerald-900/40 text-emerald-950 dark:text-emerald-200"
    },
    {
      id: "technical" as const,
      title: "Maintenance & Parc Technique",
      desc: "Heures de fonctionnement machines usine et historique de pannes",
      icon: Activity,
      color: "from-cyan-600 to-blue-700",
      accent: "text-cyan-600 dark:text-cyan-400",
      bgHover: "hover:bg-cyan-100/30 dark:hover:bg-cyan-950/20 hover:border-cyan-500 dark:hover:border-cyan-600",
      bgDirect: "bg-cyan-50/50 dark:bg-cyan-955/15 border-cyan-205 dark:border-cyan-900/40 text-cyan-955 dark:text-cyan-200"
    },
    {
      id: "commercial" as const,
      title: "Service Commercial & Facturation",
      desc: "Suivi des factures de vente en gros et de la caisse disponible",
      icon: ShieldCheck,
      color: "from-amber-500 to-orange-600",
      accent: "text-amber-500 dark:text-amber-400",
      bgHover: "hover:bg-amber-100/30 dark:hover:bg-amber-950/20 hover:border-amber-400 dark:hover:border-amber-500",
      bgDirect: "bg-amber-50/50 dark:bg-amber-955/15 border-amber-205 dark:border-amber-900/40 text-amber-955 dark:text-amber-200"
    }
  ];

  const handleRoleSelect = (roleId: "admin" | "stocks" | "technical" | "commercial" | "manager") => {
    setSelectedRole(roleId);
    setActiveScreen("login");
    setError(null);
    setSuccessMsg(null);
    
    // Remplissage automatique du compte d'evaluation par defaut pour ce poste pour faciliter les tests
    const matchingDemo = demoUsers.find((user) => user.role === roleId);
    if (matchingDemo) {
      setEmail(matchingDemo.email);
      setPassword(matchingDemo.password || "");
    } else {
      setEmail("");
      setPassword("");
    }
  };

  const handleAutofill = (demoUser: typeof demoUsers[0]) => {
    setSelectedRole(demoUser.role);
    setEmail(demoUser.email);
    setPassword(demoUser.password || "");
    setActiveScreen("login");
    setError(null);
    setSuccessMsg(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      // Recherche d'identifiants utilisateurs correspondants
      const foundUser = demoUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!foundUser) {
        setError("Identifiants incorrects. Veuillez utiliser l'un des comptes d'évaluation autorisés.");
        setLoading(false);
        return;
      }

      // Si l'utilisateur saisit des identifiants valides mais tente de se connecter a un terminal de poste different
      if (selectedRole && foundUser.role !== selectedRole && foundUser.role !== "manager" && selectedRole !== "manager") {
        setError(`Accès Refusé : Vos coordonnées appartiennent au poste "${foundUser.role.toUpperCase()}" et ne vous permettent pas de débloquer le terminal "${selectedRole.toUpperCase()}".`);
        setLoading(false);
        return;
      }

      // Succes
      setLoading(false);
      onLogin(foundUser.role, foundUser.name, foundUser.email);
    }, 450);
  };

  // ------ FLUX D'INSCRIPTION ------
  const handleVerifyRegisterEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const emp = data.employees.find(
      (e) => e.email.toLowerCase().trim() === registerEmail.toLowerCase().trim()
    );

    if (!emp) {
      setError("DÉSOLÉ : Votre adresse e-mail n'est pas répertoriée dans notre registre du personnel. En vertu des règles de sécurité de l'entreprise, vous ne pouvez pas créer de compte. Veuillez vous diriger vers le bureau des Ressources Humaines (Jean Kabamba) pour vous faire enregistrer.");
      setIsEmailVerified(false);
      setMatchedEmployee(null);
      return;
    }

    // Adresse email trouvee, saisie du mot de passe autorisee
    setMatchedEmployee(emp);
    setIsEmailVerified(true);
    setSuccessMsg(`Félicitations ${emp.name} ! Votre adresse email RH est reconnue. Veuillez définir votre mot de passe ci-dessous pour activer votre portfolio.`);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (registerPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    if (registerPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    // Determination du role du poste equivalent selon l'intitule de poste de l'employe
    let assignedRole: "admin" | "stocks" | "technical" | "commercial" | "manager" = "stocks";
    const lowerRoleStr = matchedEmployee!.role.toLowerCase();
    if (lowerRoleStr.includes("rh") || lowerRoleStr.includes("admin")) {
      assignedRole = "admin";
    } else if (lowerRoleStr.includes("stock") || lowerRoleStr.includes("dépôt") || lowerRoleStr.includes("logistique")) {
      assignedRole = "stocks";
    } else if (lowerRoleStr.includes("tech") || lowerRoleStr.includes("moulin") || lowerRoleStr.includes("broyeur") || lowerRoleStr.includes("vis") || lowerRoleStr.includes("opérat")) {
      assignedRole = "technical";
    } else if (lowerRoleStr.includes("commer") || lowerRoleStr.includes("vent") || lowerRoleStr.includes("factur") || lowerRoleStr.includes("achat")) {
      assignedRole = "commercial";
    }

    // Creation du compte utilisateur
    const newUser: UserAccount = {
      email: matchedEmployee!.email.toLowerCase().trim(),
      password: registerPassword,
      role: assignedRole,
      name: matchedEmployee!.name
    };

    // Ajout aux utilisateurs
    const currentUsers = data.users || demoUsers;
    const filteredUsers = currentUsers.filter((u) => u.email.toLowerCase() !== newUser.email);
    const updatedUsers = [...filteredUsers, newUser];

    const updatedState = {
      ...data,
      users: updatedUsers
    };

    onUpdate(updatedState);
    setSuccessMsg(`Votre compte est enregistré avec succès ! Vous pouvez maintenant déverrouiller le poste "${assignedRole.toUpperCase()}" avec votre mot de passe.`);
    setIsEmailVerified(false);
    setRegisterEmail("");
    setRegisterPassword("");
    setConfirmPassword("");
    setSelectedRole(assignedRole);
    setEmail(newUser.email);
    setPassword(newUser.password || "");
    setActiveScreen("login");
  };

  // ------ FLUX DE SIMULATEUR MOBILE ANDROID OUVRIER ------
  const handleMobileLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Recherche dans les utilisateurs d'evaluation ou inscrits pour verifier les identifiants
    const currentUsers = data.users || demoUsers;
    const foundUser = currentUsers.find(
      (u) => u.email.toLowerCase() === mobileEmail.toLowerCase().trim() && u.password === mobilePassword
    );

    // Verifier egalement si le travailleur existe dans la liste des employes
    const matchedEmp = data.employees.find(
      (emp) => emp.email.toLowerCase() === mobileEmail.toLowerCase().trim()
    );

    if (!foundUser || !matchedEmp) {
      setError("Accès d'ouvrier invalide. Assurez-vous d'avoir créé votre mot de passe via l'onglet S'enregistrer.");
      return;
    }

    setLoggedInWorker(matchedEmp);
    setActiveScreen("mobile_dashboard");
    setError(null);
  };

  const getDepartmentSchedule = (roleStr: string) => {
    const r = roleStr.toLowerCase();
    if (r.includes("rh") || r.includes("admin")) {
      return { shift: "Équipe Administative & Bureau", hours: "08:30 à 16:30", startHour: 8.5 };
    } else if (r.includes("stock") || r.includes("logistique")) {
      return { shift: "Équipe Logistique & Dépôt", hours: "07:30 à 16:30", startHour: 7.5 };
    } else if (r.includes("tech") || r.includes("usine") || r.includes("broyeur")) {
      return { shift: "Équipe Usine & Lignes d'huile", hours: "08:00 à 17:00", startHour: 8.0 };
    } else {
      return { shift: "Équipe Commerciale Terrain", hours: "08:30 à 17:00", startHour: 8.5 };
    }
  };

  const triggerQrScan = () => {
    if (!loggedInWorker) return;
    setScanning(true);
    setScanResult(null);

    // Simulation du delai de balayage camera standard
    setTimeout(() => {
      setScanning(false);
      const todayString = new Date().toISOString().split("T")[0];
      
      // Calcul du retard selon les horaires de quart de travail
      const currentHour = new Date().getHours() + new Date().getMinutes() / 60;
      const sched = getDepartmentSchedule(loggedInWorker.role);
      
      let delayText = "À l'heure";
      let minuteDiff = 0;
      if (currentHour > sched.startHour) {
        minuteDiff = Math.round((currentHour - sched.startHour) * 60);
        delayText = `En Retard (+${minuteDiff} mins)`;
      }

      // Ajout au registre des presences de la base de donnees locale pour actualisation RH
      if (!loggedInWorker.attendance.includes(todayString)) {
        const updatedEmployees = data.employees.map((emp) => {
          if (emp.id === loggedInWorker.id) {
            return {
              ...emp,
              attendance: [...emp.attendance, todayString]
            };
          }
          return emp;
        });

        onUpdate({
          ...data,
          employees: updatedEmployees
        });

        // Actualisation de l'etat local de l'ouvrier actif
        setLoggedInWorker({
          ...loggedInWorker,
          attendance: [...loggedInWorker.attendance, todayString]
        });
      }

      const currentTime = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      setScannedLogs([
        { date: todayString, time: currentTime, status: minuteDiff > 0 ? "Retard" : "Présent", delay: `${minuteDiff} min` },
        ...scannedLogs
      ]);

      setScanResult(`SÉCURITÉ ALVIN : Présence enregistrée avec succès pour aujourd'hui (${todayString}) à ${currentTime}. Horaire de service respecté (${sched.hours}). Statut d'arrivée : ${delayText}.`);
    }, 1800);
  };

  const handleLocalPhotoUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultBase64 = reader.result as string;
        setTimeout(() => {
          setNewEmpForm(prev => ({ ...prev, photo: resultBase64 }));
          setIsUploading(false);
        }, 800);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRecruitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newEmpForm.name.trim();
    if (!cleanName) {
      setError("Le nom complet est requis.");
      return;
    }

    const newEmp: Employee = {
      id: `EMP-${String(data.employees.length + 1).padStart(3, "0")}`,
      name: cleanName,
      role: newEmpForm.role,
      email: newEmpForm.email || `${cleanName.toLowerCase().replace(/\s+/g, ".")}@alvinagro.com`,
      phone: newEmpForm.phone || "+243 812 000 000",
      salary: newEmpForm.salary,
      status: newEmpForm.status,
      photo: newEmpForm.photo,
      salaryHistory: [],
      attendance: [new Date().toISOString().split("T")[0]]
    };

    const updated = {
      ...data,
      employees: [...data.employees, newEmp]
    };
    onUpdate(updated);
    setSuccessMsg(`L'employé(e) "${newEmp.name}" a été recruté(e) et persisté(e) dans le système. Prêt pour l'auto-enregistrement : configurez le mot de passe d'accès pour son poste !`);
    setIsEmailVerified(true);
    setMatchedEmployee(newEmp);
    setRegisterEmail(newEmp.email);
    setActiveScreen("register");

    // Reinitialisation du formulaire
    setNewEmpForm({
      name: "",
      role: "Administratif/RH - Chef des Équipes Agricoles",
      email: "",
      phone: "",
      salary: "450",
      status: "Présent",
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop"
    });
  };

  const getRoleBorderColor = (r: string) => {
    switch (r) {
      case "manager": return "border-l-violet-600 hover:border-violet-400";
      case "admin": return "border-l-slate-700 hover:border-slate-500";
      case "stocks": return "border-l-emerald-600 hover:border-emerald-500";
      case "technical": return "border-l-cyan-600 hover:border-cyan-500";
      case "commercial": return "border-l-amber-500 hover:border-amber-400";
      default: return "border-l-gray-400";
    }
  };

  const getRoleBadgeColor = (r: string) => {
    switch (r) {
      case "manager": return "bg-violet-50 text-violet-700 border-violet-150";
      case "admin": return "bg-slate-100 text-slate-800 border-slate-250";
      case "stocks": return "bg-emerald-50 text-emerald-700 border-emerald-150";
      case "technical": return "bg-cyan-50 text-cyan-700 border-cyan-150";
      case "commercial": return "bg-amber-50 text-amber-700 border-amber-150";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-4 py-10 max-w-7xl mx-auto w-full">
      {/* En-tete de marque avec logo de l'entreprise */}
      <div className="text-center mb-8 max-w-xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200 mb-4 shadow-sm animate-pulse-slow">
          🌟 Système Centralisé Alvin Corporation (Katanga • RDC)
        </div>
        
        {/* Badge de logo officiel de l'entreprise */}
        <div className="flex items-center justify-center gap-3.5 mb-2">
          <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-200 p-2 flex items-center justify-center shadow-lg transform hover:rotate-3 transition duration-300">
            <CompanyLogo size="100%" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-black leading-none tracking-tight text-slate-900 sm:text-4xl">
              Alvin <span className="text-violet-600">Agent AI</span>
            </h1>
            <p className="text-[11px] font-mono uppercase tracking-widest text-slate-500 font-extrabold mt-1">Agro-Industrial ERP</p>
          </div>
        </div>

        {/* Controlleurs d'onglets globaux */}
        <div className="flex justify-center gap-2 mt-6 p-1 bg-slate-200/70 border border-slate-300 rounded-xl max-w-lg mx-auto shadow-inner">
          <button
            onClick={() => { setActiveScreen("choose"); setError(null); }}
            className={`px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              (activeScreen === "choose" || activeScreen === "login")
                ? "bg-violet-600 dark:bg-violet-800 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <KeyRound size={13} /> Terminals de Rôle
          </button>
          
          <button
            onClick={() => { setActiveScreen("recruit"); setError(null); setSuccessMsg(null); }}
            className={`px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              activeScreen === "recruit"
                ? "bg-violet-600 dark:bg-violet-800 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <UserPlus size={13} /> Recruter Employé
          </button>

          <button
            onClick={() => { setActiveScreen("register"); setError(null); setSuccessMsg(null); }}
            className={`px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              activeScreen === "register"
                ? "bg-violet-600 dark:bg-violet-800 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <UserCheck size={13} /> S'accréditer
          </button>
        </div>
      </div>

      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-8 items-stretch pt-2">
        
        {/* EMPLACEMENT COMPOSANT GAUCHE : Vues interactives */}
        <div className="flex-1">
          {activeScreen === "choose" && (
            /* ECRAN DE SELECTION DU TERMINAL */
            <div className="space-y-6">
              <h2 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                📂 Choix du Terminal Agricole Autorisé :
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                {roles.map((item) => {
                  const IconComp = item.icon;
                  // Frontieres dynamiques avec mise en valeur de la bordure gauche à forte couleur
                  let borderHighlight = "border-l-violet-600 hover:border-violet-400";
                  if (item.id === "admin") {
                    borderHighlight = "border-l-slate-705 hover:border-slate-500";
                  } else if (item.id === "stocks") {
                    borderHighlight = "border-l-emerald-600 hover:border-emerald-400";
                  } else if (item.id === "technical") {
                    borderHighlight = "border-l-cyan-600 hover:border-cyan-400";
                  } else if (item.id === "commercial") {
                    borderHighlight = "border-l-amber-500 hover:border-amber-450";
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleRoleSelect(item.id)}
                      className={`group flex items-start gap-4 text-left p-5 rounded-2xl bg-white border border-slate-205 border-l-4 ${borderHighlight} transition-all duration-300 hover:shadow-lg cursor-pointer hover:scale-[1.01] active:scale-100 shadow-sm`}
                    >
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br ${item.color} text-white shrink-0 shadow-md transform group-hover:scale-105 transition-transform`} >
                        <IconComp size={22} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-800 group-hover:text-violet-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-505 mt-1 line-clamp-2 leading-relaxed font-semibold">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeScreen === "login" && (
            /* ECRAN GENERAL D'AUTHENTIFICATION AVEC BARRE DE COULEUR SUPERIEURE */
            <div className={`bg-white rounded-2xl border-t-4 ${
              selectedRole === "manager" ? "border-t-violet-600" :
              selectedRole === "admin" ? "border-t-slate-700" :
              selectedRole === "stocks" ? "border-t-emerald-600" :
              selectedRole === "technical" ? "border-t-cyan-600" :
              selectedRole === "commercial" ? "border-t-amber-500" :
              "border-t-violet-600"
            } border-x border-b border-slate-200 p-6 md:p-8 shadow-xl space-y-6 animate-fade-in`}>
              <button
                onClick={() => setActiveScreen("choose")}
                className="inline-flex items-center gap-1.5 text-xs text-violet-600 font-extrabold hover:underline cursor-pointer"
              >
                <ArrowLeft size={14} /> Revenir au catalogue des divisions
              </button>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider block">Terminal de Contrôle Connecté</span>
                <div className="flex items-center gap-3.5 bg-violet-50/70 p-4 rounded-xl border border-violet-100">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${
                    selectedRole === "manager" ? "from-violet-500 to-violet-700" :
                    selectedRole === "admin" ? "from-slate-600 to-slate-800" :
                    selectedRole === "stocks" ? "from-emerald-600 to-teal-700" :
                    selectedRole === "technical" ? "from-cyan-600 to-blue-700" :
                    selectedRole === "commercial" ? "from-amber-400 to-orange-600" :
                    "from-violet-500 to-violet-700"
                  } text-white shrink-0 shadow-sm`}>
                    {(() => {
                      const matchedIcon = roles.find((r) => r.id === selectedRole);
                      const IconLabel = matchedIcon ? matchedIcon.icon : Lock;
                      return <IconLabel size={22} />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      {roles.find((r) => r.id === selectedRole)?.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">Le système audite les signatures administratives de Lubumbashi.</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-xs font-semibold leading-relaxed animate-shake">
                  {error}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block font-sans">Compte Utilisateur (Email Liaison)</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom.prenom@alvinagro.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-50 font-bold shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block font-sans">Mot de Passe Sécurisé d'Accès</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-50 font-bold shadow-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-100 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
                  ) : (
                    <>
                      <KeyRound size={14} /> Déverrouiller le Poste Professionnel
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {activeScreen === "recruit" && (
            /* FORMULAIRE DIRECT D'ENROLEMEMENT D'UN NOUVEL EMPLOYE AVEC BARRE DE COULEUR SUPERIEURE */
            <div className="bg-white rounded-2xl border-t-4 border-t-emerald-600 border-x border-b border-slate-200 p-6 md:p-8 shadow-xl space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <UserPlus size={18} className="text-emerald-600" /> Enrôlement Administratif (Nouveau Recrutement)
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Ajoutez instantanément un nouvel employé au portefeuille RH de la plateforme Alvin. Une fois créé, l'employé(e) pourra s'accréditer et définir ses propres codes de sécurité.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-xs font-semibold leading-relaxed">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl text-xs font-semibold">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleRecruitSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 font-extrabold uppercase mb-1">Nom Complet du travailleur</label>
                    <input
                      type="text"
                      required
                      value={newEmpForm.name}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, name: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-gray-900 font-bold focus:outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-50 transition-all font-sans"
                      placeholder="Jean de Dieu Mwamba"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-extrabold uppercase mb-1">Poste / Spécialisation</label>
                    <select
                      value={newEmpForm.role}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, role: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-gray-900 font-bold focus:outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-50 transition-all cursor-pointer"
                    >
                      <option value="Administratif/RH - Chef des Équipes Agricoles">Chef de culture (RH)</option>
                      <option value="Technique - Opératrice de Ligne d'Huilerie">Opérateur Usine (Technique)</option>
                      <option value="Logistique & Stocks - Chef de Dépôt">Chef de Dépôt (Logistique)</option>
                      <option value="Commercial - Acheteuse et Négociatrice">Superviseur Commercial</option>
                      <option value="Technique - Mécanicien Agricole">Mécanicien (Maintenance)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-extrabold uppercase mb-1">Adresse Email professionnelle (Optionnel)</label>
                    <input
                      type="email"
                      value={newEmpForm.email}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, email: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-gray-900 font-bold focus:outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-50 transition-all"
                      placeholder="Laissez vide pour auto-générer"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-extrabold uppercase mb-1">Téléphone (RDC)</label>
                    <input
                      type="text"
                      value={newEmpForm.phone}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, phone: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-gray-900 font-bold focus:outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-50 transition-all"
                      placeholder="+243 812 345 678"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-extrabold uppercase mb-1">Salaire de base (mensuel, USD)</label>
                    <input
                      type="number"
                      value={newEmpForm.salary}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, salary: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-gray-900 font-mono font-bold focus:outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-50 transition-all"
                      placeholder="e.g. 450"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-extrabold uppercase mb-1">Portrait d'Identité (Photo)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id="portal-upload-portrait-input"
                        accept="image/*"
                        onChange={handleLocalPhotoUploadMock}
                        className="hidden"
                      />
                      <label
                        htmlFor="portal-upload-portrait-input"
                        className="px-3 py-2.5 w-full border border-slate-300 hover:border-violet-500 rounded-xl text-center text-xs text-slate-600 cursor-pointer bg-slate-50 hover:bg-violet-50/30 transition-all font-bold"
                      >
                        {isUploading ? "Lecture du fichier..." : "📂 Charger une photo"}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserPlus size={14} /> Recruter et Procéder à l'Accréditation
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeScreen === "register" && (
            /* PRE-ENREGISTREMENT DES EMPLOYES */
            <div className="bg-white rounded-2xl border-t-4 border-t-indigo-600 border-x border-b border-slate-200 p-6 md:p-8 shadow-xl space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-3" >
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <UserCheck size={18} className="text-indigo-600" /> Auto-Enregistrement de Mot de Passe Salarié
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  L'administrateur RH a déjà enregistré votre profil et votre adresse email. Si cette adresse est reconnue, vous pouvez configurer votre mot de passe pour débloquer votre accès au système.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-amber-50 border-l-4 border-amber-500 text-amber-900 rounded-xl text-xs font-semibold leading-relaxed">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-850 rounded-xl text-xs font-bold">
                  {successMsg}
                </div>
              )}

              {!isEmailVerified ? (
                /* Etape A : Verifier l'email dans le registre du personnel */
                <form onSubmit={handleVerifyRegisterEmail} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block font-sans">Votre Adresse E-mail Professionnelle</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder="exemple : aminata.tshibola@alvinagro.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-50"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">Le système vérifiera si cette adresse est enregistrée dans le portefeuille RH officiel de la firme.</p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Vérifier mon Éligibilité & Authentifier
                  </button>
                </form>
              ) : (
                /* Etape B : Email reconnu, definition du mot de passe */
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="flex gap-3 items-center p-3.5 bg-violet-50 rounded-xl border border-violet-100">
                    <img src={matchedEmployee?.photo} alt={matchedEmployee?.name} className="w-10 h-10 rounded-full object-cover border" referrerPolicy="no-referrer" />
                    <div>
                      <h4 className="text-xs font-black text-violet-850 uppercase tracking-wide">{matchedEmployee?.name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">{matchedEmployee?.role}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Définir le Mot de Passe</label>
                    <input
                      type="password"
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Au moins 6 caractères"
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block font-sans">Confirmer le Mot de Passe</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Répétez le mot de passe"
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-50"
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEmailVerified(false)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                    >
                      Enregistrer mon Compte & Débloquer
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* PANNEAU DROIT : Raccourcis de test rapide (comptes d'evaluation) */}
        <div className="w-full lg:w-80 bg-slate-50 dark:bg-neutral-900/20 border border-slate-100 dark:border-neutral-900/60 p-5 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-violet-600 dark:text-violet-400" /> Comptes Éditeurs de Démo
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-gray-450 leading-relaxed">
              Pour des raisons de commodité d'audit, utilisez ces raccourcis d'identification pré-autorisés :
            </p>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {demoUsers.map((user, idx) => {
                const isSelected = selectedRole === user.role;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAutofill(user)}
                    className="w-full p-2.5 text-left bg-violet-50/40 hover:bg-violet-100/60 dark:bg-violet-955/15 dark:hover:bg-violet-950/25 rounded-xl border border-violet-100/65 dark:border-violet-900/40 text-xs transition block cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 dark:text-white text-[11px]">{user.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-violet-100 dark:bg-violet-955/40 text-violet-700 dark:text-violet-300 uppercase font-mono font-bold">
                        {user.role}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{user.email}</p>
                    <p className="text-[9px] text-violet-600 dark:text-violet-400 font-mono mt-0.5">Mot de passe : <span className="underline">{user.password || "aucun"}</span></p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-150 dark:border-neutral-800 text-[10px] text-gray-450 dark:text-gray-500 italic text-center leading-relaxed">
            Arnold Menemene Credits • Les accès respectent la hiérarchie stricte RBAC.
          </div>
        </div>

      </div>

      <div className="mt-10 text-center text-xs text-gray-400 dark:text-gray-500 font-mono">
        Ressources et Données Agro-industrielles Persistées • Lubumbashi • RDC
      </div>
    </div>
  );
}
