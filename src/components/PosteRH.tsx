import React, { useState } from "react";
import { Employee, DatabaseState, SalaryRecord } from "../types";
import { UserPlus, Calendar, CreditCard, Mail, Phone, Heart, CheckCircle2, UserCheck, Eye, Printer, X, PenTool, Landmark, Download } from "lucide-react";
import { downloadHtmlDocument } from "../utils/downloadHelper";

interface PosteRHProps {
  data: DatabaseState;
  onUpdate: (newData: DatabaseState) => void;
  darkMode: boolean;
}

export default function PosteRH({ data, onUpdate, darkMode }: PosteRHProps) {
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(data.employees[0] || null);
  const [isAddingEmp, setIsAddingEmp] = useState(false);
  const [isEditingEmp, setIsEditingEmp] = useState(false);

  // États de recherche et filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [roleFilter, setRoleFilter] = useState("Tous");

  // États du formulaire pour ajouter un employé
  const [newEmpForm, setNewEmpForm] = useState({
    name: "",
    role: "Administratif/RH - Chef des Équipes Agricoles",
    email: "",
    phone: "",
    salary: "450",
    status: "Présent" as Employee["status"],
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop"
  });

  // États du formulaire pour modifier un employé
  const [editEmpForm, setEditEmpForm] = useState({
    name: "",
    role: "Administratif/RH - Chef des Équipes Agricoles",
    email: "",
    phone: "",
    salary: "450"
  });

  // Module de génération de fiches de paie et vue d'impression simulée
  const [printingSlip, setPrintingSlip] = useState<Employee | null>(null);

  // État simulé pour le téléversement de la photo de profil visual
  const [isUploading, setIsUploading] = useState(false);

  const handleStatusChange = (empId: string, status: Employee["status"]) => {
    const updatedEmployees = data.employees.map((emp) => {
      if (emp.id === empId) {
        return { ...emp, status };
      }
      return emp;
    });
    const updated = { ...data, employees: updatedEmployees };
    onUpdate(updated);
    if (selectedEmp?.id === empId) {
      setSelectedEmp({ ...selectedEmp, status });
    }
  };

  const toggleAttendanceDay = (empId: string, day: string) => {
    const updatedEmployees = data.employees.map((emp) => {
      if (emp.id === empId) {
        const hasDay = emp.attendance.includes(day);
        const newAttendance = hasDay
          ? emp.attendance.filter((d) => d !== day)
          : [...emp.attendance, day];
        return { ...emp, attendance: newAttendance };
      }
      return emp;
    });
    const updated = { ...data, employees: updatedEmployees };
    onUpdate(updated);
    const updatedEmp = updatedEmployees.find((e) => e.id === empId);
    if (updatedEmp) setSelectedEmp(updatedEmp);
  };

  const handleAddSalaryPayment = (empId: string, amount: number) => {
    const today = new Date().toISOString().split("T")[0];
    const updatedEmployees = data.employees.map((emp) => {
      if (emp.id === empId) {
        return {
          ...emp,
          salaryHistory: [
            { date: today, amount, status: "Payé" as const },
            ...emp.salaryHistory
          ]
        };
      }
      return emp;
    });
    const updated = { ...data, employees: updatedEmployees };
    onUpdate(updated);
    const updatedEmp = updatedEmployees.find((e) => e.id === empId);
    if (updatedEmp) setSelectedEmp(updatedEmp);
  };

  const handleAddNewEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const newEmp: Employee = {
      id: `EMP-${String(data.employees.length + 1).padStart(3, "0")}`,
      name: newEmpForm.name,
      role: newEmpForm.role,
      email: newEmpForm.email || `${newEmpForm.name.toLowerCase().replace(/\s+/g, ".")}@alvinagro.com`,
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
    setSelectedEmp(newEmp);
    setIsAddingEmp(false);
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

  const handleStartEditing = (emp: Employee) => {
    setEditEmpForm({
      name: emp.name,
      role: emp.role,
      email: emp.email,
      phone: emp.phone,
      salary: emp.salary
    });
    setIsEditingEmp(true);
  };

  const handleSaveEmployeeEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    const updatedEmployees = data.employees.map((emp) => {
      if (emp.id === selectedEmp.id) {
        return {
          ...emp,
          name: editEmpForm.name,
          role: editEmpForm.role,
          email: editEmpForm.email,
          phone: editEmpForm.phone,
          salary: editEmpForm.salary
        };
      }
      return emp;
    });

    const updated = { ...data, employees: updatedEmployees };
    onUpdate(updated);
    const updatedEmp = updatedEmployees.find(e => e.id === selectedEmp.id);
    if (updatedEmp) setSelectedEmp(updatedEmp);
    setIsEditingEmp(false);
  };

  const handleLocalPhotoUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultBase64 = reader.result as string;
        setTimeout(() => {
          if (isAddingEmp) {
            setNewEmpForm(prev => ({ ...prev, photo: resultBase64 }));
          } else if (selectedEmp) {
            const updatedEmployees = data.employees.map((emp) => {
              if (emp.id === selectedEmp.id) {
                return { ...emp, photo: resultBase64 };
              }
              return emp;
            });
            const updated = { ...data, employees: updatedEmployees };
            onUpdate(updated);
            setSelectedEmp({ ...selectedEmp, photo: resultBase64 });
          }
          setIsUploading(false);
        }, 800);
      };
      reader.readAsDataURL(file);
    }
  };

  const getDynamicActiveDays = (): string[] => {
    const start = new Date("2026-05-25");
    const today = new Date();
    const list: string[] = [];
    const current = new Date(start);
    
    current.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    while (current <= today) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, "0");
      const day = String(current.getDate()).padStart(2, "0");
      list.push(`${year}-${month}-${day}`);
      current.setDate(current.getDate() + 1);
    }
    
    if (list.length === 0) {
      return [
        "2026-05-25",
        "2026-05-26",
        "2026-05-27",
        "2026-05-28",
        "2026-05-29",
        "2026-05-30",
        "2026-05-31",
        "2026-06-01",
        "2026-06-02",
        "2026-06-03"
      ];
    }
    return list;
  };

  const activeDaysList = getDynamicActiveDays();

  return (
    <div className="space-y-6">
      
      {/* En-tete et Logo Officiels du Departement */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-150 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white flex items-center justify-center shadow-md border-2 border-violet-400">
            <Landmark size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Ressources Humaines & Paie
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Contrôle d'accès • Portefeuilles ouvriers • États de présences • Versement des salaires en devises.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLONNE GAUCHE : ANNUAIRE DU PERSONNEL ET FILTRES */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* SECTION LISTE DU PERSONNEL AVEC RECHERCHE ET FILTRES */}
          <div className="bg-white dark:bg-neutral-900/30 dark:backdrop-blur-md p-5 rounded-2xl border border-slate-150 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-gray-50 dark:border-neutral-800 pb-2">
              <h3 className="text-xs font-bold text-gray-850 dark:text-neutral-200 uppercase tracking-widest flex items-center gap-1.5">
                📁 Portefeuilles Salariés ({data.employees.length})
              </h3>
              <button
                onClick={() => {
                  setIsEditingEmp(false);
                  setIsAddingEmp(true);
                }}
                className="p-1 px-2 pb-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <UserPlus size={13} /> Ajouter
              </button>
            </div>

            {/* Boite de Recherche et Filtres en Temps Reel */}
            <div className="space-y-3 bg-slate-50/50 dark:bg-neutral-950/20 p-3 rounded-xl border border-slate-100 dark:border-neutral-850">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔎 Rechercher par nom, poste..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg text-[11px] font-semibold text-gray-850 dark:text-white focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1.5 text-gray-400 hover:text-gray-600 font-extrabold text-xs"
                    type="button"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-gray-400 font-extrabold uppercase block mb-1">Statut d'Activité</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-2 py-1 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-md text-[11px] font-bold text-gray-700 dark:text-gray-300 focus:outline-none"
                  >
                    <option value="Tous">Tous</option>
                    <option value="Présent">Présents / En Poste</option>
                    <option value="En Mission">En Mission</option>
                    <option value="Congé">Congés</option>
                    <option value="Absent">Absents</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] text-gray-400 font-extrabold uppercase block mb-1">Département / Rôle</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-2 py-1 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-md text-[11px] font-bold text-gray-700 dark:text-gray-300 focus:outline-none"
                  >
                    <option value="Tous">Tous</option>
                    <option value="RH">Ressources Humaines (RH)</option>
                    <option value="Technique">Technique / Usine</option>
                    <option value="Logistique">Stocks / Dépôt</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Corps de la Liste */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {(() => {
                const filteredEmps = data.employees.filter((emp) => {
                  const cleanedSearch = searchTerm.toLowerCase().trim();
                  const matchesSearch = !cleanedSearch ||
                    emp.name.toLowerCase().includes(cleanedSearch) ||
                    emp.role.toLowerCase().includes(cleanedSearch) ||
                    emp.id.toLowerCase().includes(cleanedSearch);

                  const matchesStatus = statusFilter === "Tous" || emp.status === statusFilter;
                  
                  let matchesRole = true;
                  if (roleFilter !== "Tous") {
                    const r = emp.role.toLowerCase();
                    if (roleFilter === "RH") matchesRole = r.includes("rh") || r.includes("administratif");
                    else if (roleFilter === "Technique") matchesRole = r.includes("tech") || r.includes("usine") || r.includes("broyeur");
                    else if (roleFilter === "Logistique") matchesRole = r.includes("stock") || r.includes("logistique") || r.includes("dépôt");
                    else if (roleFilter === "Commercial") matchesRole = r.includes("commercia");
                  }

                  return matchesSearch && matchesStatus && matchesRole;
                });

                if (filteredEmps.length === 0) {
                  return (
                    <p className="text-center py-8 text-[11px] text-gray-400 dark:text-gray-500 italic">
                      Aucun collaborateur ne correspond à ces critères.
                    </p>
                  );
                }

                return filteredEmps.map((emp) => {
                  const isSelected = selectedEmp?.id === emp.id;
                  return (
                    <button
                      key={emp.id}
                      onClick={() => {
                        setSelectedEmp(emp);
                        setIsAddingEmp(false);
                        setIsEditingEmp(false);
                      }}
                      className={`group w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition ${
                        isSelected
                          ? "bg-violet-100/60 border-violet-400 dark:bg-violet-955/35 dark:border-violet-500/50"
                          : "bg-violet-50/20 dark:bg-violet-955/5 border-slate-205 dark:border-neutral-850 hover:bg-violet-50/50 dark:hover:bg-violet-955/15 hover:border-violet-300"
                      }`}
                    >
                      <img
                        src={emp.photo}
                        alt={emp.name}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full object-cover border"
                      />
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-gray-850 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400">
                            {emp.name}
                          </h4>
                          <span className={`w-2 h-2 rounded-full ${
                            emp.status === "Présent" ? "bg-emerald-500"
                              : emp.status === "En Mission" ? "bg-cyan-500"
                              : emp.status === "Congé" ? "bg-amber-500"
                              : "bg-red-500"
                          }`} />
                        </div>
                        <p className="text-[10px] text-gray-400 font-sans truncate mt-0.5">{emp.role}</p>
                      </div>
                    </button>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : ESPACE DE TRAVAIL POUR AJOUTER, VISIONNER OU MODIFIER UN PORTEFEUILLE DETAILLE */}
        <div className="lg:col-span-7">
          
          {isAddingEmp ? (
            /* FORMULAIRE D'AJOUT DE NOUVEL EMPLOYÉ */
            <form onSubmit={handleAddNewEmployee} className="p-5 md:p-6 bg-white dark:bg-neutral-900/40 border-2 border-slate-300 dark:border-neutral-800 rounded-2xl space-y-4 shadow-lg animate-fade-in text-xs">
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-neutral-850 pb-2">
                <h3 className="text-xs font-bold text-gray-850 dark:text-neutral-200 uppercase tracking-widest flex items-center gap-1.5">
                  <UserPlus size={16} className="text-violet-600" /> Enrôlement Administratif Nouveau Profil
                </h3>
                <button type="button" onClick={() => setIsAddingEmp(false)} className="text-gray-400 hover:text-gray-500">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-extrabold uppercase mb-1">Nom Complet du travailleur</label>
                  <input
                    type="text"
                    required
                    value={newEmpForm.name}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-300 dark:border-neutral-700 rounded-xl text-gray-955 dark:text-white font-semibold focus:outline-none focus:border-violet-600"
                    placeholder="ex: Jean de Dieu Mwamba"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold uppercase mb-1">Poste / Spécialisation</label>
                  <select
                    value={newEmpForm.role}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-300 dark:border-neutral-700 rounded-xl text-gray-955 dark:text-white font-semibold focus:outline-none focus:border-violet-600"
                  >
                    <option value="Administratif/RH - Chef des Équipes Agricoles">Chef de culture (RH)</option>
                    <option value="Technique - Opératrice de Ligne d'Huilerie">Opérateur Usine (Technique)</option>
                    <option value="Logistique & Stocks - Chef de Dépôt">Chef de Dépôt (Logistique)</option>
                    <option value="Commercial - Acheteuse et Négociatrice">Superviseur Commercial</option>
                    <option value="Technique - Mécanicien Agricole">Mécanicien (Maintenance)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold uppercase mb-1">Adresse Email professionnelle</label>
                  <input
                    type="email"
                    value={newEmpForm.email}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-300 dark:border-neutral-700 rounded-xl text-gray-955 dark:text-white font-semibold focus:outline-none focus:border-violet-600"
                    placeholder="ex: jean.mwamba@alvinagro.com"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold uppercase mb-1">Téléphone (RDC)</label>
                  <input
                    type="text"
                    value={newEmpForm.phone}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-300 dark:border-neutral-700 rounded-xl text-gray-955 dark:text-white font-semibold focus:outline-none focus:border-violet-600"
                    placeholder="+243 812 345 678"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold uppercase mb-1">Salaire de base (mensuel, USD)</label>
                  <input
                    type="number"
                    value={newEmpForm.salary}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, salary: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-300 dark:border-neutral-700 rounded-xl text-gray-955 dark:text-white font-mono font-bold focus:outline-none focus:border-violet-600"
                    placeholder="e.g. 500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold uppercase mb-1 font-sans">Importation d'identité photo</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="upload-portrait-input-form-add"
                      accept="image/*"
                      onChange={handleLocalPhotoUploadMock}
                      className="hidden"
                    />
                    <label
                      htmlFor="upload-portrait-input-form-add"
                      className="px-3 py-2 border-2 border-dashed border-slate-300 hover:border-violet-500 rounded-xl text-center text-xs text-gray-600 dark:text-gray-400 cursor-pointer bg-white dark:bg-neutral-800 w-full transition font-semibold"
                    >
                      {isUploading ? "Lecture du fichier..." : "📂 Choisir un fichier"}
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition shadow"
                >
                  Ajouter le profil à l'ERP Alvin
                </button>
              </div>
            </form>
          ) : isEditingEmp && selectedEmp ? (
            /* FORMULAIRE DE MODIFICATION D'EMPLOYÉ EXISTANT */
            <form onSubmit={handleSaveEmployeeEdits} className="p-5 md:p-6 bg-white dark:bg-neutral-900/40 border-2 border-violet-500 dark:border-neutral-800 rounded-2xl space-y-4 shadow-lg animate-fade-in text-xs">
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-neutral-850 pb-2">
                <h3 className="text-xs font-extrabold text-violet-700 dark:text-violet-300 uppercase tracking-wildest flex items-center gap-1.5 animate-pulse">
                  <PenTool size={16} /> Modification du Profil de l'employé
                </h3>
                <button type="button" onClick={() => setIsEditingEmp(false)} className="text-gray-400 hover:text-gray-500">
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-violet-50 dark:bg-violet-955/25 rounded-xl border border-violet-100 dark:border-violet-900/40">
                <img src={selectedEmp.photo} alt={selectedEmp.name} className="w-10 h-10 rounded-full object-cover border" />
                <div>
                  <h4 className="text-xs font-bold font-sans text-violet-800 dark:text-violet-300">{selectedEmp.name} - {selectedEmp.id}</h4>
                  <p className="text-[10px] text-gray-405 mt-0.5">Édition en cours dans Cloud Firestore.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-extrabold uppercase mb-1">Nom Complet du travailleur</label>
                  <input
                    type="text"
                    required
                    value={editEmpForm.name}
                    onChange={(e) => setEditEmpForm({ ...editEmpForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-300 dark:border-neutral-700 rounded-xl text-gray-955 dark:text-white font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold uppercase mb-1">Division / Poste</label>
                  <select
                    value={editEmpForm.role}
                    onChange={(e) => setEditEmpForm({ ...editEmpForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-300 dark:border-neutral-700 rounded-xl text-gray-955 dark:text-white font-semibold focus:outline-none"
                  >
                    <option value="Administratif/RH - Chef des Équipes Agricoles">Chef de culture (RH)</option>
                    <option value="Technique - Opératrice de Ligne d'Huilerie">Opérateur Usine (Technique)</option>
                    <option value="Logistique & Stocks - Chef de Dépôt">Chef de Dépôt (Logistique)</option>
                    <option value="Commercial - Acheteuse et Négociatrice">Superviseur Commercial</option>
                    <option value="Technique - Mécanicien Agricole">Mécanicien (Maintenance)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold uppercase mb-1">E-mail de communication officiel</label>
                  <input
                    type="email"
                    required
                    value={editEmpForm.email}
                    onChange={(e) => setEditEmpForm({ ...editEmpForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-300 dark:border-neutral-700 rounded-xl text-gray-955 dark:text-white font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold uppercase mb-1">Téléphone de contact</label>
                  <input
                    type="text"
                    required
                    value={editEmpForm.phone}
                    onChange={(e) => setEditEmpForm({ ...editEmpForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-300 dark:border-neutral-700 rounded-xl text-gray-955 dark:text-white font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold uppercase mb-1">Salaire contractuel de base (USD)</label>
                  <input
                    type="number"
                    required
                    value={editEmpForm.salary}
                    onChange={(e) => setEditEmpForm({ ...editEmpForm, salary: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-300 dark:border-neutral-700 rounded-xl text-gray-955 dark:text-white font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingEmp(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition shadow"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          ) : selectedEmp ? (
            /* APERCU DES DETAILS DE L'EMPLOYÉ */
            <div className="space-y-6">
              <div className="bg-white dark:bg-neutral-900/40 dark:backdrop-blur-md p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs">
                
                {/* En-tete principal de l'employe (concept de verre) */}
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  <div className="relative group shrink-0">
                    <img
                      src={selectedEmp.photo}
                      alt={selectedEmp.name}
                      referrerPolicy="no-referrer"
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-violet-500 shadow-md"
                    />
                    <input
                      type="file"
                      id="upload-portrait-input-detail-sub"
                      accept="image/*"
                      onChange={handleLocalPhotoUploadMock}
                      className="hidden"
                    />
                    <label
                      htmlFor="upload-portrait-input-detail-sub"
                      className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center text-[10px] text-white cursor-pointer transition duration-200"
                    >
                      Modifier image
                    </label>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-extrabold text-gray-900 dark:text-white truncate">{selectedEmp.name}</h3>
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-violet-50 dark:bg-violet-955/30 text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-900/40">
                        {selectedEmp.id}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-sans font-semibold flex items-center gap-1.5">
                      💼 {selectedEmp.role}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-[11px] text-gray-400 mt-2">
                      <span className="flex items-center gap-1"><Mail size={12} className="text-violet-500" /> {selectedEmp.email}</span>
                      <span className="flex items-center gap-1"><Phone size={12} className="text-violet-500" /> {selectedEmp.phone}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleStartEditing(selectedEmp)}
                      className="p-1 px-3 bg-violet-50 hover:bg-violet-100 dark:bg-violet-955/30 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-905/30 rounded-xl text-xs font-bold transition flex items-center gap-1 hover:scale-105"
                    >
                      ✏️ Modifier les Informations
                    </button>

                    <div className="flex items-center gap-2 mt-2">
                      <select
                        value={selectedEmp.status}
                        onChange={(e) => handleStatusChange(selectedEmp.id, e.target.value as Employee["status"])}
                        className="px-3 py-1 bg-white dark:bg-neutral-800 text-xs font-bold rounded-lg border-2 border-slate-200 dark:border-neutral-700 text-gray-800 dark:text-white outline-hidden focus:border-violet-500"
                      >
                        <option value="Présent">En Poste</option>
                        <option value="En Mission">En Mission</option>
                        <option value="Congé">Congé</option>
                        <option value="Absent">Absent</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Division des Presences et Salaires */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Widget calendrier de presence */}
                <div className="bg-white dark:bg-neutral-900/40 dark:backdrop-blur-md p-5 rounded-2xl border border-slate-150 dark:border-neutral-800">
                  <h4 className="text-xs font-bold text-gray-800 dark:text-neutral-200 flex items-center gap-1.5 border-b border-gray-50 dark:border-neutral-800 pb-3 mb-4 uppercase tracking-wider">
                    <Calendar size={15} className="text-violet-600" /> Registre Présences Individuel
                  </h4>
                  <p className="text-[11px] text-gray-550 mb-4 bg-slate-50 dark:bg-neutral-850 p-2.5 rounded-lg leading-relaxed">
                    Cliquez sur les dates pour basculer manuellement la présence de {selectedEmp.name}.
                  </p>
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {activeDaysList.map((day) => {
                      const isPresent = selectedEmp.attendance.includes(day);
                      const formattedDate = new Date(day).toLocaleDateString("fr-FR", {
                        weekday: "short",
                        day: "numeric",
                        month: "short"
                      });
                      return (
                        <div
                          key={day}
                          onClick={() => toggleAttendanceDay(selectedEmp.id, day)}
                          className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer ${
                            isPresent
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-955/20 dark:text-emerald-400 border-emerald-250"
                              : "bg-gray-50 dark:bg-neutral-800/10 border-gray-100 dark:border-neutral-800 text-gray-400"
                          }`}
                        >
                          <span className="text-xs font-bold">{formattedDate}</span>
                          <div className={`p-1 rounded-full ${isPresent ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-neutral-850 text-transparent"}`}>
                            <CheckCircle2 size={12} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Liste des salaires et feuille de paie */}
                <div className="bg-white dark:bg-neutral-900/40 dark:backdrop-blur-md p-5 rounded-2xl border border-slate-150 dark:border-neutral-800 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center border-b border-gray-50 dark:border-neutral-800 pb-3 mb-4 uppercase tracking-wider">
                      <h4 className="text-xs font-bold text-gray-800 dark:text-neutral-200 flex items-center gap-1.5">
                        <CreditCard size={15} className="text-violet-600" /> Traitement des Salaires
                      </h4>
                      <span className="text-xs font-bold text-violet-700 dark:text-violet-400 font-mono">
                        Base: ${selectedEmp.salary} USD / Mois
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Bouton interactif pour verser le salaire */}
                      <div className="bg-violet-50/50 dark:bg-violet-955/10 border border-violet-100 dark:border-violet-900/40 p-4 rounded-xl space-y-3 shadow-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-violet-700 dark:text-violet-400">Payer le mois en cours</span>
                          <span className="text-sm font-bold text-violet-700 dark:text-violet-400 font-mono">${selectedEmp.salary} USD</span>
                        </div>
                        <button
                          onClick={() => handleAddSalaryPayment(selectedEmp.id, Number(selectedEmp.salary))}
                          className="w-full text-center py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-lg transition"
                        >
                          💸 Valider le versement bancaire
                        </button>
                      </div>

                      {/* Historique des versements */}
                      <div className="space-y-2">
                        <h5 className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400">Derniers versements</h5>
                        <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                          {selectedEmp.salaryHistory.length === 0 ? (
                            <p className="text-xs text-gray-400 italic text-center py-2">Aucun versement enregistré.</p>
                          ) : (
                            selectedEmp.salaryHistory.map((pt, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[11px] p-2 rounded-lg border border-gray-50 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/10">
                                <span className="font-mono text-gray-600 dark:text-gray-400">{pt.date}</span>
                                <span className="font-bold text-gray-850 dark:text-white font-mono">${pt.amount} USD</span>
                                <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-100 dark:bg-emerald-955/20 text-emerald-700 dark:text-emerald-400 font-bold uppercase">
                                  {pt.status}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50 dark:border-neutral-800 mt-4">
                    <button
                      onClick={() => setPrintingSlip(selectedEmp)}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-sm"
                    >
                      <Printer size={14} /> Générer Bilan de Paie PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 py-10 italic">
              Veuillez sélectionner un collaborateur pour afficher ses informations de sécurité.
            </div>
          )}
        </div>
      </div>

      {/* BULLETIN DE PAIE PRET POUR IMPRESSION / SIMULATION PDF */}
      {printingSlip && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
            
            {/* Barre d'Action (non visible en mode d'impression du navigateur) */}
            <div className="bg-neutral-100 dark:bg-neutral-900 px-6 py-4 flex justify-between items-center border-b border-neutral-200 no-print">
              <span className="text-sm font-bold text-neutral-800 dark:text-neutral-205 flex items-center gap-2">
                📂 Aperçu Impression - Fiche Salarié Officielle PDF
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadHtmlDocument("printable-payslip", `fiche_salarie_${printingSlip.id}.html`, `Fiche de Paie - ${printingSlip.name}`)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Download size={14} /> Télécharger (.html)
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer size={14} /> Imprimer en PDF
                </button>
                <button
                  onClick={() => setPrintingSlip(null)}
                  className="p-1.5 text-gray-450 hover:text-gray-700 hover:bg-gray-200 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Zone de Contenu d'Impression (stylee comme une facture premium) */}
            <div id="printable-payslip" className="printable-area p-8 space-y-6 bg-white border border-gray-100 text-xs">
              <div className="flex justify-between items-start border-b border-gray-300 pb-6">
                <div>
                  <h3 className="text-xl font-extrabold text-violet-700 tracking-tight">ALVIN AGRO-INDUSTRIEL SARL</h3>
                  <p className="text-xs text-gray-500 mt-1">Route de Kipushi, Quartier Industriel • Lubumbashi, RDC</p>
                  <p className="text-xs text-gray-500">Contact: contact@alvinagro.com | CD/LSH/RCCM/24-B-04210</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-violet-100 text-violet-800 font-bold rounded-lg text-xs uppercase mb-1">
                    Fiche Officielle
                  </span>
                  <p className="text-xs text-gray-500">ID: {printingSlip.id}</p>
                </div>
              </div>

              {/* Identite du document */}
              <div className="text-center">
                <h4 className="text-sm font-black uppercase tracking-wider text-gray-800">BULLETIN DE PAIE & HISTORIQUE DE PRÉSENCES</h4>
                <p className="text-xs text-gray-400 mt-1 font-mono">Date d'édition : {new Date().toLocaleDateString("fr-FR")}</p>
              </div>

              {/* Details biographiques de l'employe */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                <div>
                  <p className="font-bold text-gray-400 uppercase tracking-wider text-[9px]">Nom de l'Employé</p>
                  <p className="text-sm font-bold text-gray-800 mt-1">{printingSlip.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{printingSlip.role}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-400 uppercase tracking-wider text-[9px]">Coordonnées</p>
                  <p className="text-gray-700 mt-1">Tél: {printingSlip.phone}</p>
                  <p className="text-gray-500 mt-0.5">Email: {printingSlip.email}</p>
                </div>
              </div>

              {/* Metriques de presence */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-gray-700 border-b border-gray-200 pb-1 uppercase tracking-wider">État des Présences Courantes</h5>
                <div className="flex flex-wrap gap-2 pt-1">
                  {activeDaysList.map((d) => {
                    const isPres = printingSlip.attendance.includes(d);
                    const formattedD = new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
                    return (
                      <span key={d} className={`px-2.5 py-1 text-xs rounded-lg font-medium border ${
                        isPres ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-gray-50 text-gray-450 border-gray-150"
                      }`}>
                        {formattedD} {isPres ? "✔" : "✘"}
                      </span>
                    );
                  })}
                </div>
                <p className="text-[11px] text-gray-500 italic mt-1">
                  Total des jours travaillés : {printingSlip.attendance.length} / {activeDaysList.length} sur le cycle de planification agro-industriel.
                </p>
              </div>

              {/* Calculs financiers */}
              <div className="space-y-2 pt-4">
                <h5 className="text-xs font-bold text-gray-700 border-b border-gray-100 pb-1 uppercase tracking-wider font-sans">Compte de Paie Salariale</h5>
                <div className="divide-y divide-gray-100 bg-gray-50 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Salaire de Base Mensuel</span>
                    <span className="font-mono font-bold text-gray-85*5">${printingSlip.salary} USD</span>
                  </div>
                  <div className="flex justify-between items-center py-1 font-bold text-violet-700 border-t border-gray-200 mt-2 pt-2">
                    <span>Mise en versement nette courante</span>
                    <span className="font-mono text-sm">${printingSlip.salary} USD</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 grid grid-cols-2 gap-4 text-center text-xs text-gray-400 border-t border-dashed border-gray-250">
                <div>
                  <p className="font-bold text-[10px] uppercase text-gray-500 font-sans">Signature du Salarié</p>
                  <div className="h-10"></div>
                  <p className="border-t border-gray-200/50 pt-1">{printingSlip.name}</p>
                </div>
                <div>
                  <p className="font-bold text-[10px] uppercase text-gray-500 font-sans">Pour ALVIN AGRO-INDUSTRIEL</p>
                  <div className="h-10"></div>
                  <p className="border-t border-gray-200/50 pt-1">Visa de la Direction RH</p>
                </div>
              </div>
              <div className="text-center text-[10px] font-mono italic text-gray-400">
                Certifié à Lubumbashi, République Démocratique du Congo. Conçu par Arnold Menemene.
              </div>
            </div>

            {/* Barre d'Actions Inferieure - Toujours accessible en bas du visionneur de document (corrige le probleme de defilement) */}
            <div className="bg-neutral-55 dark:bg-neutral-900 px-6 py-4 flex justify-end items-center gap-3 border-t border-slate-200 dark:border-neutral-800 rounded-b-2xl no-print">
              <button
                onClick={() => setPrintingSlip(null)}
                className="px-4 py-2 hover:bg-slate-200 bg-slate-100 dark:hover:bg-neutral-800 dark:bg-neutral-850 text-slate-700 dark:text-neutral-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Fermer
              </button>
              <button
                onClick={() => downloadHtmlDocument("printable-payslip", `fiche_salarie_${printingSlip.id}.html`, `Fiche de Paie - ${printingSlip.name}`)}
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
    </div>
  );
}
