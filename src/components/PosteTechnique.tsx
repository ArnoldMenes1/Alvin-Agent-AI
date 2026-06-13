import React, { useState } from "react";
import { DatabaseState, Machine, MaintenanceRecord } from "../types";
import { Activity, AlertOctagon, CheckCircle2, DollarSign, PenTool, Printer, Settings, Wrench, X, Download } from "lucide-react";
import { downloadHtmlDocument } from "../utils/downloadHelper";

interface PosteTechniqueProps {
  data: DatabaseState;
  onUpdate: (newData: DatabaseState) => void;
  darkMode: boolean;
}

export default function PosteTechnique({ data, onUpdate, darkMode }: PosteTechniqueProps) {
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(data.machinery[0] || null);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [printingMachineId, setPrintingMachineId] = useState<string | null>(null);

  // États du formulaire pour ajouter une fiche de maintenance
  const [recordForm, setRecordForm] = useState({
    type: "Régulière" as MaintenanceRecord["type"],
    cost: "150",
    description: ""
  });

  const handleUpdateStatus = (machineId: string, status: Machine["status"]) => {
    const updatedMachinery = data.machinery.map((mac) => {
      if (mac.id === machineId) {
        return { ...mac, status };
      }
      return mac;
    });
    const updated = { ...data, machinery: updatedMachinery };
    onUpdate(updated);
    if (selectedMachine?.id === machineId) {
      setSelectedMachine({ ...selectedMachine, status });
    }
  };

  const handleAddHours = (machineId: string, addedHrs: number) => {
    const updatedMachinery = data.machinery.map((mac) => {
      if (mac.id === machineId) {
        return { ...mac, hours: mac.hours + addedHrs };
      }
      return mac;
    });
    const updated = { ...data, machinery: updatedMachinery };
    onUpdate(updated);
    if (selectedMachine?.id === machineId) {
      setSelectedMachine({ ...selectedMachine, hours: selectedMachine.hours + addedHrs });
    }
  };

  const handleCreateMaintenanceRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachine) return;

    const newRecord: MaintenanceRecord = {
      date: new Date().toISOString().split("T")[0],
      type: recordForm.type,
      cost: Number(recordForm.cost),
      description: recordForm.description
    };

    const updatedMachinery = data.machinery.map((mac) => {
      if (mac.id === selectedMachine.id) {
        return {
          ...mac,
          maintenanceHistory: [newRecord, ...mac.maintenanceHistory]
        };
      }
      return mac;
    });

    const updated = { ...data, machinery: updatedMachinery };
    onUpdate(updated);
    setIsAddingRecord(false);
    setRecordForm({ type: "Régulière", cost: "150", description: "" });
    const updatedMac = updatedMachinery.find((m) => m.id === selectedMachine.id);
    if (updatedMac) setSelectedMachine(updatedMac);
  };

  return (
    <div className="space-y-6">
      {/* Bloc de titre */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-neutral-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Maintenance Industrielle & Parc Technique
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Poste Technique • Registre d'heures-machine, historiques de panne et interventions d'ateliers de Lubumbashi.
          </p>
        </div>
        {selectedMachine && (
          <button
            onClick={() => setPrintingMachineId(selectedMachine.id)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-bold transition-all cursor-pointer shadow-md"
          >
            <Printer size={16} /> Générer Rapport Maintenance PDF
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche : Portefeuilles et cartes des machines */}
        <div className="lg:col-span-1 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {data.machinery.map((mac) => {
              const isSelected = selectedMachine?.id === mac.id;
              return (
                <button
                  key={mac.id}
                  onClick={() => {
                    setSelectedMachine(mac);
                    setIsAddingRecord(false);
                  }}
                  className={`flex flex-col text-left rounded-2xl border p-4 transition-all relative overflow-hidden cursor-pointer ${
                    isSelected
                      ? "bg-cyan-500/20 border-cyan-500 dark:bg-cyan-950/40 dark:border-cyan-500 shadow-md transform scale-[1.02]"
                      : "bg-cyan-50/20 dark:bg-cyan-955/5 dark:backdrop-blur-md border-cyan-200/50 dark:border-neutral-850 hover:bg-cyan-50/50 dark:hover:bg-cyan-955/15 hover:border-cyan-300"
                  }`}
                >
                  {/* Balise de statut en haut a droite */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        mac.status === "Opérationnel"
                          ? "bg-emerald-500 animate-pulse"
                          : mac.status === "En Maintenance"
                          ? "bg-amber-400"
                          : "bg-red-500 animate-bounce"
                      }`}
                    />
                    <span className="text-[9px] font-bold text-gray-400 uppercase">{mac.status}</span>
                  </div>

                  <span className="text-[10px] font-bold text-gray-400 font-mono tracking-wider">{mac.id}</span>
                  <h3 className="text-sm font-extrabold text-gray-800 dark:text-white mt-1 pr-16 line-clamp-1">
                    {mac.name}
                  </h3>
                  <p className="text-xs text-gray-400 bg-gray-50 dark:bg-neutral-850/50 p-1 rounded-sm w-fit mt-1.5">
                    🔧 Type: {mac.category}
                  </p>

                  <div className="flex justify-between items-center mt-6 pt-3 border-t border-gray-150/50 dark:border-neutral-800/60 w-full text-xs">
                    <span className="text-gray-400">Heures de marche :</span>
                    <span className="font-mono font-bold text-gray-800 dark:text-white">{mac.hours.toLocaleString()} hrs</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Colonne droite : Diagnostic detaille et historique des interventions */}
        <div className="lg:col-span-2">
          {selectedMachine ? (
            <div className="space-y-6">
              {/* Carte visuelle des indicateurs cles */}
              <div className="p-6 bg-white dark:bg-neutral-900/40 dark:backdrop-blur-md rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs relative overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  <img
                    src={selectedMachine.photo}
                    alt={selectedMachine.name}
                    referrerPolicy="no-referrer"
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-550/50 shadow-md"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-extrabold text-gray-950 dark:text-white">{selectedMachine.name}</h3>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Enregistrement d'atelier : {selectedMachine.id} • Secteur : {selectedMachine.category}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={() => handleAddHours(selectedMachine.id, 50)}
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-lg transition"
                      >
                        ⏱ +50 hrs d'activité
                      </button>
                      <button
                        onClick={() => handleAddHours(selectedMachine.id, 100)}
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-lg transition"
                      >
                        ⏱ +100 hrs d'activité
                      </button>
                    </div>
                  </div>

                  {/* Controleur de statut et indicateurs d'heures */}
                  <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ajuster Diagnostic</span>
                    <select
                      value={selectedMachine.status}
                      onChange={(e) => handleUpdateStatus(selectedMachine.id, e.target.value as Machine["status"])}
                      className="px-3 py-1 bg-gray-50 dark:bg-neutral-800 text-xs font-bold rounded-lg border border-gray-150 dark:border-neutral-700 text-gray-800 dark:text-white outline-hidden focus:border-indigo-500"
                    >
                      <option value="Opérationnel">✓ Opérationnel</option>
                      <option value="En Maintenance">⚠ En Maintenance</option>
                      <option value="En Panne">🚨 En Panne</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Liste de maintenance ou formulaire d'insertion */}
              {isAddingRecord ? (
                /* FORMULAIRE DE NOUVELLE FICHE D'INTERVENTION */
                <form onSubmit={handleCreateMaintenanceRecord} className="p-6 bg-white dark:bg-neutral-900/40 dark:backdrop-blur-md rounded-2xl border border-gray-150 dark:border-neutral-800 space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-55/60 dark:border-neutral-800 pb-2">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-neutral-200 uppercase tracking-wider">
                      Nouvelle Fiche d'Intervention Mécanique
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsAddingRecord(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Type d'Intervention</label>
                      <select
                        value={recordForm.type}
                        onChange={(e) => setRecordForm({ ...recordForm, type: e.target.value as MaintenanceRecord["type"] })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-150 dark:border-neutral-850 rounded-xl text-xs text-gray-900 dark:text-white outline-hidden focus:border-indigo-500"
                      >
                        <option value="Régulière">Régulière / Vidange / Entretien</option>
                        <option value="Corrective">Corrective / Réparation composante</option>
                        <option value="Urgente">Urgente / Panne critique bloquante</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Coût d'intervention (USD)</label>
                      <input
                        type="number"
                        required
                        value={recordForm.cost}
                        onChange={(e) => setRecordForm({ ...recordForm, cost: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-150 dark:border-neutral-850 rounded-xl text-xs text-gray-900 dark:text-white outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Rapport de pièces et description des réparations</label>
                      <textarea
                        required
                        value={recordForm.description}
                        onChange={(e) => setRecordForm({ ...recordForm, description: e.target.value })}
                        rows={3}
                        placeholder="Remplacement des joints d'étanchéité, ajout de graisse haute température et vérification de tension électrique..."
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-neutral-800 border border-gray-150 dark:border-neutral-850 rounded-xl text-xs text-gray-900 dark:text-white outline-hidden focus:border-indigo-500 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
                  >
                    Enregistrer la fiche d'atelier
                  </button>
                </form>
              ) : (
                /* RAPPORTS DE TRAVAUX RECENTS */
                <div className="p-6 bg-white dark:bg-neutral-900/40 dark:backdrop-blur-md rounded-2xl border border-gray-100 dark:border-neutral-800">
                  <div className="flex justify-between items-center border-b border-gray-50 dark:border-neutral-800 pb-3 mb-4">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-neutral-200">
                      Carnet Historique de Maintenance
                    </h4>
                    <button
                      onClick={() => setIsAddingRecord(true)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition cursor-pointer"
                    >
                      + Écrire Rapport
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {selectedMachine.maintenanceHistory.length === 0 ? (
                      <p className="text-xs text-gray-400 italic text-center py-4">Cette machine n'a aucun carnet d'intervention saisi.</p>
                    ) : (
                      selectedMachine.maintenanceHistory.map((rec, idx) => (
                        <div
                          key={idx}
                          className="p-3 border border-gray-50 dark:border-neutral-800 bg-gray-55/35 dark:bg-neutral-850/10 rounded-xl space-y-2 text-xs"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-[10px] text-gray-400">{rec.date}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              rec.type === "Régulière"
                                ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                                : "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                            }`}>
                              {rec.type}
                            </span>
                            <span className="font-mono font-bold text-gray-800 dark:text-white">${rec.cost} USD</span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 font-sans leading-relaxed">{rec.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 text-gray-400">
              Veuillez sélectionner un engin technique pour consulter son rapport.
            </div>
          )}
        </div>
      </div>

      {/* BULLETIN DE DIAGNOSTIC DES MACHINES PRET POUR IMPRESSION */}
      {printingMachineId && (() => {
        const pm = data.machinery.find((m) => m.id === printingMachineId);
        if (!pm) return null;
        return (
          <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto flex items-center justify-center p-4">
            <div className="bg-white text-gray-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
              <div className="bg-neutral-100 px-6 py-4 flex justify-between items-center border-b border-neutral-200 no-print">
                <span className="text-sm font-bold text-neutral-800 flex items-center gap-2">
                  📂 Aperçu Impression - Fiche Technique Diagnostic PDF
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadHtmlDocument("printable-machine-diag", `fiche_technique_${pm.id}.html`, `Fiche Technique - ${pm.name}`)}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Download size={14} /> Télécharger (.html)
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Printer size={14} /> Imprimer en PDF
                  </button>
                  <button
                    onClick={() => setPrintingMachineId(null)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div id="printable-machine-diag" className="printable-area p-8 space-y-6 bg-white">
                <div className="flex justify-between items-start border-b border-gray-300 pb-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-indigo-700 tracking-tight">ALVIN AGRO-INDUSTRIEL SARL</h3>
                    <p className="text-xs text-gray-500 mt-1">Route de Kipushi, Quartier Industriel • Lubumbashi, RDC</p>
                    <p className="text-xs text-gray-500">Service Maintenance Technique Usines & Champs</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-800 font-bold rounded-lg text-xs uppercase mb-1">
                      Fiche d'État Technique
                    </span>
                    <p className="text-xs text-gray-500 font-mono">Date: {new Date().toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>

                <div className="text-center">
                  <h4 className="text-md font-bold uppercase tracking-wider text-gray-850">RAPPORT TECHNIQUE D'INTERVENTION & COMPTEURS</h4>
                </div>

                {/* Informations d'identite */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-xs">
                  <div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Désignation Matériel</p>
                    <p className="text-sm font-bold text-gray-800 mt-1">{pm.name}</p>
                    <p className="text-gray-500 mt-0.5">Secteur: {pm.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Indicateurs Clés</p>
                    <p className="text-gray-700 font-mono mt-1 font-bold">Heures cumulées: {pm.hours.toLocaleString()} hrs</p>
                    <p className="text-gray-505 font-semibold mt-0.5">Statut: {pm.status}</p>
                  </div>
                </div>

                {/* Tableau de l'historique des reparations */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-150 pb-1">Interventions et Pièces Remplacées</h5>
                  <table className="w-full text-left text-xs text-gray-700 divide-y divide-gray-100">
                    <thead>
                      <tr className="bg-gray-50 font-bold">
                        <th className="p-2">Date</th>
                        <th className="p-2">Type d'Atelier</th>
                        <th className="p-2">Description des Travaux</th>
                        <th className="p-2 text-right">Frais (USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pm.maintenanceHistory.map((rec, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-mono">{rec.date}</td>
                          <td className="p-2 font-bold">{rec.type}</td>
                          <td className="p-2 max-w-sm">{rec.description}</td>
                          <td className="p-2 text-right font-mono font-bold">${rec.cost}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-8 flex justify-between text-xs text-gray-400 border-t border-dashed border-gray-200">
                  <div>
                    <p className="font-bold text-[10px] uppercase text-gray-500">Signé Ateliers Lubumbashi</p>
                    <div className="h-10"></div>
                    <p className="pt-1">Mécanicien en Chef</p>
                  </div>
                  <div>
                    <p className="font-bold text-[10px] uppercase text-gray-500">Validation Ingénieur</p>
                    <div className="h-10"></div>
                    <p className="pt-1">Chef de Maintenance</p>
                  </div>
                </div>

              </div>

               {/* Barre d'Actions Inferieure - Toujours accessible en bas du visionneur de document (corrige le probleme de defilement) */}
              <div className="bg-neutral-55 dark:bg-neutral-900 px-6 py-4 flex justify-end items-center gap-3 border-t border-slate-200 dark:border-neutral-800 rounded-b-2xl no-print">
                <button
                  onClick={() => setPrintingMachineId(null)}
                  className="px-4 py-2 hover:bg-slate-200 bg-slate-100 dark:hover:bg-neutral-800 dark:bg-neutral-850 text-slate-700 dark:text-neutral-300 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  onClick={() => downloadHtmlDocument("printable-machine-diag", `fiche_technique_${pm.id}.html`, `Fiche Technique - ${pm.name}`)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition"
                >
                  <Download size={14} /> Télécharger (.html)
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition transform hover:scale-[1.02]"
                >
                  <Printer size={14} /> Imprimer en PDF / Télécharger
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
