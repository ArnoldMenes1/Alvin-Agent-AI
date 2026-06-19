import React, { useState } from "react";
import { DatabaseState, RawMaterialStock, FinishedProductStock, ConsumableStock } from "../types";
import { Layers, ArrowDownLeft, ArrowUpRight, AlertTriangle, HelpCircle, Package, PlusCircle, Printer, X, LayoutGrid, Download } from "lucide-react";
import { downloadHtmlDocument } from "../utils/downloadHelper";

interface PosteStocksProps {
  data: DatabaseState;
  onUpdate: (newData: DatabaseState) => void;
  darkMode: boolean;
}

export default function PosteStocks({ data, onUpdate, darkMode }: PosteStocksProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "actions" | "createnew">("summary");
  const [printingInventory, setPrintingInventory] = useState(false);

  // Nouvel item pour le stock
  const [newItemType, setNewItemType] = useState<"raw" | "finished" | "consumable">("finished");
  const [newItemId, setNewItemId] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("Cartons");
  const [newItemThreshold, setNewItemThreshold] = useState("100");
  const [newProductSuccess, setNewProductSuccess] = useState<string | null>(null);
  const [newProductError, setNewProductError] = useState<string | null>(null);

  // Auto-fill ID and unit depending on selected type
  React.useEffect(() => {
    if (newItemType === "raw") {
      setNewItemId(`RM-${String(data.stocks.rawMaterials.length + 1).padStart(3, '0')}`);
      setNewItemUnit("Tonnes");
    } else if (newItemType === "finished") {
      setNewItemId(`FP-${String(data.stocks.finishedProducts.length + 1).padStart(3, '0')}`);
      setNewItemUnit("Cartons");
    } else {
      setNewItemId(`CO-${String(data.stocks.consumables.length + 1).padStart(3, '0')}`);
      setNewItemUnit("pcs");
    }
    setNewProductSuccess(null);
    setNewProductError(null);
  }, [newItemType, data.stocks.rawMaterials.length, data.stocks.finishedProducts.length, data.stocks.consumables.length]);

  // Etats des formulaires
  const [rmForm, setRmForm] = useState({ id: data.stocks.rawMaterials[0]?.id || "", amount: "" });
  const [fpForm, setFpForm] = useState({ id: data.stocks.finishedProducts[0]?.id || "", quantity: "" });
  const [coForm, setCoForm] = useState({ id: data.stocks.consumables[0]?.id || "", quantity: "" });

  const handleCreateNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setNewProductSuccess(null);
    setNewProductError(null);

    const targetId = newItemId.trim().toUpperCase();
    const name = newItemName.trim();
    const unit = newItemUnit.trim();

    if (!targetId || !name || !unit) {
      setNewProductError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    // Vérifier l'unicité de l'ID
    const existsRaw = data.stocks.rawMaterials.some((item) => item.id.toUpperCase() === targetId);
    const existsFin = data.stocks.finishedProducts.some((item) => item.id.toUpperCase() === targetId);
    const existsCon = data.stocks.consumables.some((item) => item.id.toUpperCase() === targetId);

    if (existsRaw || existsFin || existsCon) {
      setNewProductError(`L'identifiant "${targetId}" est déjà utilisé par un autre article.`);
      return;
    }

    const qty = Number(newItemQuantity) || 0;
    const updatedStocks = { ...data.stocks };

    if (newItemType === "raw") {
      const item: RawMaterialStock = { id: targetId, name, tonnage: qty, unit };
      updatedStocks.rawMaterials = [...updatedStocks.rawMaterials, item];
    } else if (newItemType === "finished") {
      const item: FinishedProductStock = { id: targetId, name, quantity: qty, unit };
      updatedStocks.finishedProducts = [...updatedStocks.finishedProducts, item];
    } else {
      const item: ConsumableStock = { id: targetId, name, quantity: qty, unit, threshold: Number(newItemThreshold) || 100 };
      updatedStocks.consumables = [...updatedStocks.consumables, item];
    }

    const updated = {
      ...data,
      stocks: updatedStocks
    };

    onUpdate(updated);
    setNewProductSuccess(`"${name}" (${targetId}) a bien été créé.`);
    
    // Auto-select in transactions dropdowns
    if (newItemType === "raw") {
      setRmForm(prev => ({ ...prev, id: targetId }));
    } else if (newItemType === "finished") {
      setFpForm(prev => ({ ...prev, id: targetId }));
    } else {
      setCoForm(prev => ({ ...prev, id: targetId }));
    }

    // Reset formulaire
    setNewItemName("");
    setNewItemQuantity("");
    setNewItemThreshold("100");
  };

  const handleUpdateRawMaterial = (e: React.FormEvent, type: "entry" | "dispatch") => {
    e.preventDefault();
    if (!rmForm.id || !rmForm.amount) return;

    const changeVal = Number(rmForm.amount) * (type === "entry" ? 1 : -1);
    const updatedRm = data.stocks.rawMaterials.map((rm) => {
      if (rm.id === rmForm.id) {
        return { ...rm, tonnage: Math.max(0, rm.tonnage + changeVal) };
      }
      return rm;
    });

    const updated = {
      ...data,
      stocks: {
        ...data.stocks,
        rawMaterials: updatedRm
      }
    };
    onUpdate(updated);
    setRmForm({ ...rmForm, amount: "" });
  };

  const handleUpdateFinishedProduct = (e: React.FormEvent, type: "entry" | "dispatch") => {
    e.preventDefault();
    if (!fpForm.id || !fpForm.quantity) return;

    const changeVal = Number(fpForm.quantity) * (type === "entry" ? 1 : -1);
    const updatedFp = data.stocks.finishedProducts.map((fp) => {
      if (fp.id === fpForm.id) {
        return { ...fp, quantity: Math.max(0, fp.quantity + changeVal) };
      }
      return fp;
    });

    const updated = {
      ...data,
      stocks: {
        ...data.stocks,
        finishedProducts: updatedFp
      }
    };
    onUpdate(updated);
    setFpForm({ ...fpForm, quantity: "" });
  };

  const handleUpdateConsumable = (e: React.FormEvent, type: "refill" | "consume") => {
    e.preventDefault();
    if (!coForm.id || !coForm.quantity) return;

    const changeVal = Number(coForm.quantity) * (type === "refill" ? 1 : -1);
    const updatedCo = data.stocks.consumables.map((co) => {
      if (co.id === coForm.id) {
        return { ...co, quantity: Math.max(0, co.quantity + changeVal) };
      }
      return co;
    });

    const updated = {
      ...data,
      stocks: {
        ...data.stocks,
        consumables: updatedCo
      }
    };
    onUpdate(updated);
    setCoForm({ ...coForm, quantity: "" });
  };

  return (
    <div className="space-y-6">
      {/* Bloc de titre */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-neutral-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Suivi des Stocks, Récoltes & Emballages
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Poste Logistique • Suivi des matières premières des champs aux emballages de transformation usine.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPrintingInventory(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all cursor-pointer shadow-md"
          >
            <Printer size={16} /> Générer Bon d'Inventaire PDF
          </button>
        </div>
      </div>

      {/* Onglets de changement de vue */}
      <div className="flex flex-wrap gap-2 p-1 bg-gray-100 dark:bg-neutral-800/60 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("summary")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold select-none cursor-pointer transition-all ${
            activeTab === "summary"
              ? "bg-emerald-600 dark:bg-emerald-700 text-white shadow-xs"
              : "text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400"
          }`}
        >
          📁 Résumé d'Inventaire Actuel
        </button>
        <button
          onClick={() => setActiveTab("actions")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold select-none cursor-pointer transition-all ${
            activeTab === "actions"
              ? "bg-emerald-600 dark:bg-emerald-700 text-white shadow-xs"
              : "text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400"
          }`}
        >
          🔄 Enregistrer Flux (Entrées / Sorties)
        </button>
        <button
          onClick={() => {
            setActiveTab("createnew");
            setNewProductSuccess(null);
            setNewProductError(null);
          }}
          className={`px-4 py-2 rounded-lg text-xs font-semibold select-none cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTab === "createnew"
              ? "bg-emerald-600 dark:bg-emerald-700 text-white shadow-xs"
              : "text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400"
          }`}
        >
          ➕ Ajouter Nouveau Produit
        </button>
      </div>

      {activeTab === "summary" && (
        /* RESUME DE L'INVENTAIRE AVEC ALERTES */
        <div className="space-y-6">
          {/* Section 1 : Tonnages de mais/soja bruts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-neutral-900/40 dark:backdrop-blur-md p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Matières Premières (Champs)</span>
                  <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
                    {data.stocks.rawMaterials.reduce((acc, rm) => acc + rm.tonnage, 0).toFixed(1)} T
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 rounded-xl">
                  <Layers size={20} />
                </div>
              </div>

              <div className="mt-4 divide-y divide-gray-50 dark:divide-neutral-800/40 space-y-2">
                {data.stocks.rawMaterials.map((rm) => (
                  <div key={rm.id} className="flex justify-between items-center text-xs pt-2">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{rm.name}</span>
                    <span className="font-mono font-bold text-gray-800 dark:text-white">{rm.tonnage.toFixed(1)} {rm.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900/40 dark:backdrop-blur-md p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Produits Finis Transformés (Facturables)</span>
                  <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                    {data.stocks.finishedProducts.reduce((acc, fp) => acc + fp.quantity, 0)} Cartons
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl">
                  <Package size={20} />
                </div>
              </div>

              <div className="mt-4 divide-y divide-gray-50 dark:divide-neutral-800/40 space-y-2">
                {data.stocks.finishedProducts.map((fp) => (
                  <div key={fp.id} className="flex justify-between items-center text-xs pt-2">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{fp.name}</span>
                    <span className="font-mono font-bold text-gray-800 dark:text-white">{fp.quantity} {fp.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2 : Consommables et grille d'alerte des emballages */}
          <div className="bg-white dark:bg-neutral-900/40 dark:backdrop-blur-md p-6 rounded-2xl border border-gray-100 dark:border-neutral-800">
            <h3 className="text-sm font-bold text-gray-800 dark:text-neutral-200 border-b border-gray-50 dark:border-neutral-800 pb-3 mb-4 uppercase tracking-wider">
              Niveaux des Consommables Critiques (Emballage & Intrants)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.stocks.consumables.map((co) => {
                const isLow = co.quantity < co.threshold;
                return (
                  <div
                    key={co.id}
                    className={`p-4 rounded-xl border relative overflow-hidden transition ${
                      isLow
                        ? "bg-red-500/5 border-red-200 dark:border-red-950/50"
                        : "bg-gray-55/40 dark:bg-neutral-800/20 border-gray-100 dark:border-neutral-800/50"
                    }`}
                  >
                    {isLow && (
                      <div className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg animate-pulse">
                        <AlertTriangle size={12} />
                      </div>
                    )}
                    <span className="text-[10px] font-bold text-gray-400 font-mono uppercase tracking-wider">{co.id}</span>
                    <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 line-clamp-2 mt-1 min-h-[32px]">
                      {co.name}
                    </h4>

                    <div className="flex justify-between items-baseline mt-4 border-t border-gray-50 dark:border-neutral-800/50 pt-2">
                      <span className="text-lg font-extrabold text-gray-900 dark:text-white font-mono">
                        {co.quantity.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400">
                        {co.unit}
                      </span>
                    </div>

                    {/* Barre de progression */}
                    <div className="mt-3 w-full bg-gray-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, (co.quantity / (co.threshold * 2)) * 100)}%` }}
                        className={`h-full rounded-full ${isLow ? "bg-red-500" : "bg-indigo-500"}`}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-gray-400 mt-1">
                      <span>Min: {co.threshold.toLocaleString()}</span>
                      <span className={isLow ? "text-red-500 font-bold" : "text-indigo-600"}>
                        {isLow ? "🚨 ALERTE RUPTURE" : "✓ NIVEAU OK"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "actions" && (
        /* PANNEAU ACTIONS ET TRANSACTIONS */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Action 1 : Tonnage de recolte des matieres premieres */}
          <form onSubmit={(e) => handleUpdateRawMaterial(e, "entry")} className="bg-white dark:bg-neutral-900/40 dark:backdrop-blur-md p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                <ArrowDownLeft size={16} /> Pesée des récoltes (Champs)
              </h4>
              <p className="text-xs text-gray-500">Enregistrer une livraison de maïs ou soja fraîchement récoltée venant des champs de culture.</p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Matière première</label>
                  <select
                    value={rmForm.id || (data.stocks.rawMaterials[0]?.id || "")}
                    onChange={(e) => setRmForm({ ...rmForm, id: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-800 rounded-xl text-xs text-gray-955 dark:text-white"
                  >
                    {data.stocks.rawMaterials.map((rm) => (
                      <option key={rm.id} value={rm.id}>{rm.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Tonnage brut entrant (tonnes)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={rmForm.amount}
                    onChange={(e) => setRmForm({ ...rmForm, amount: e.target.value })}
                    placeholder="ex: 12.5"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-800 rounded-xl text-xs text-gray-950 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                + Enregistrer Entrée
              </button>
              <button
                type="button"
                onClick={(e) => handleUpdateRawMaterial(e, "dispatch")}
                className="py-1.5 px-3 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                - Broyer (Usine)
              </button>
            </div>
          </form>

          {/* Action 2 : Produits finis */}
          <form onSubmit={(e) => handleUpdateFinishedProduct(e, "entry")} className="bg-white dark:bg-neutral-900/40 dark:backdrop-blur-md p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <ArrowDownLeft size={16} /> Entrée Produits Finis (Usine)
              </h4>
              <p className="text-xs text-gray-500">Saisir les boîtes ou sacs de farine scellés sortant de la chaîne de transformation mécanique.</p>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Produit de sortie</label>
                  <select
                    value={fpForm.id || (data.stocks.finishedProducts[0]?.id || "")}
                    onChange={(e) => setFpForm({ ...fpForm, id: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-800 rounded-xl text-xs text-gray-955 dark:text-white"
                  >
                    {data.stocks.finishedProducts.map((fp) => (
                      <option key={fp.id} value={fp.id}>{fp.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Nombre d'unités emballées</label>
                  <input
                    type="number"
                    required
                    value={fpForm.quantity}
                    onChange={(e) => setFpForm({ ...fpForm, quantity: e.target.value })}
                    placeholder="ex: 150"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-800 rounded-xl text-xs text-gray-955 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                + Enregistrer Production
              </button>
              <button
                type="button"
                onClick={(e) => handleUpdateFinishedProduct(e, "dispatch")}
                className="py-1.5 px-3 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                - Expédier (Wholesale)
              </button>
            </div>
          </form>

          {/* Action 3 : Ajustements des consommables */}
          <form onSubmit={(e) => handleUpdateConsumable(e, "refill")} className="bg-white dark:bg-neutral-900/40 dark:backdrop-blur-md p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1">
                <PlusCircle size={16} /> Ajuster Consomables de fabrication
              </h4>
              <p className="text-xs text-gray-500">Réapprovisionner ou consommer manuellement des emballages cartons, bouteilles pét ou engrais.</p>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Sélectionner consommable</label>
                  <select
                    value={coForm.id || (data.stocks.consumables[0]?.id || "")}
                    onChange={(e) => setCoForm({ ...coForm, id: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-800 rounded-xl text-xs text-gray-955 dark:text-white"
                  >
                    {data.stocks.consumables.map((co) => (
                      <option key={co.id} value={co.id}>{co.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Quantité (recharge ou consommation)</label>
                  <input
                    type="number"
                    required
                    value={coForm.quantity}
                    onChange={(e) => setCoForm({ ...coForm, quantity: e.target.value })}
                    placeholder="ex: 3000"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-800 rounded-xl text-xs text-gray-955 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                + Réapprovisionner
              </button>
              <button
                type="button"
                onClick={(e) => handleUpdateConsumable(e, "consume")}
                className="py-1.5 px-3 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                - Libérer à l'Usine
              </button>
            </div>
          </form>

        </div>
      )}

      {activeTab === "createnew" && (
        <div className="bg-white dark:bg-neutral-900/40 dark:backdrop-blur-md p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm space-y-6">
          <div className="border-b border-gray-100 dark:border-neutral-800 pb-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Création et Enregistrement de Nouveau Produit ou Intrant</h3>
            <p className="text-xs text-gray-500">Ajouter un nouveau produit fini, matière première ou consommable logistique non présent par défaut au dépôt.</p>
          </div>

          <form onSubmit={handleCreateNewProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            <div className="space-y-4">
              {/* Type Category */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Catégorie d'Article</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewItemType("raw")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      newItemType === "raw"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-400 dark:text-indigo-300"
                        : "bg-gray-50 border-gray-100 hover:border-gray-300 text-gray-650 dark:bg-neutral-800 dark:border-neutral-800"
                    }`}
                  >
                    <span>🌾</span>
                    <span>Matière Première</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewItemType("finished")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      newItemType === "finished"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-400 dark:text-emerald-300"
                        : "bg-gray-50 border-gray-100 hover:border-gray-300 text-gray-650 dark:bg-neutral-800 dark:border-neutral-800"
                    }`}
                  >
                    <span>📦</span>
                    <span>Produit Fini</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewItemType("consumable")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      newItemType === "consumable"
                        ? "bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-955/20 dark:border-amber-400 dark:text-amber-300"
                        : "bg-gray-50 border-gray-100 hover:border-gray-300 text-gray-650 dark:bg-neutral-800 dark:border-neutral-800"
                    }`}
                  >
                    <span>🛠️</span>
                    <span>Consommable</span>
                  </button>
                </div>
              </div>

              {/* ID Identifier */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Identifiant Unique (Code ID)</label>
                <input
                  type="text"
                  required
                  placeholder="ex: FP-003, CO-005..."
                  value={newItemId}
                  onChange={(e) => setNewItemId(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-800 rounded-xl text-xs text-gray-955 dark:text-white font-mono"
                />
                <p className="text-[10px] text-gray-450 mt-1">Identifiant unique servant de clé d'inventaire technique au dépôt.</p>
              </div>

              {/* Designation Name */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Désignation (Nom complet de l'article)</label>
                <input
                  type="text"
                  required
                  placeholder={newItemType === "raw" ? "ex: Graines de Soja Bio" : newItemType === "finished" ? "ex: Farine Extra Fine 10kg" : "ex: Cartons Triplex Larges"}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-800 rounded-xl text-xs text-gray-955 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-4">
              {/* Quantité Initiale */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Stock Initial</label>
                <input
                  type="number"
                  step={newItemType === "raw" ? "0.1" : "1"}
                  required
                  placeholder="ex: 0"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-805 border border-gray-100 dark:border-neutral-800 rounded-xl text-xs text-gray-955 dark:text-white font-mono"
                />
              </div>

              {/* Unit used */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Unité de mesure</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Tonnes, Cartons, pcs, Kg"
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-808 border border-gray-100 dark:border-neutral-800 rounded-xl text-xs text-gray-955 dark:text-white"
                />
              </div>

              {/* Threshold only for Consumables */}
              {newItemType === "consumable" && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Seuil critique d'alerte rupture</label>
                  <input
                    type="number"
                    required
                    placeholder="ex: 100"
                    value={newItemThreshold}
                    onChange={(e) => setNewItemThreshold(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-805 border border-gray-100 dark:border-neutral-800 rounded-xl text-xs text-gray-955 dark:text-white font-mono"
                  />
                  <p className="text-[10px] text-red-500/85 mt-1">L'application lèvera une alerte rouge dès que le stock descend sous ce seuil.</p>
                </div>
              )}

              {/* Error and Success status notifications */}
              {newProductSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-450 text-xs font-bold rounded-xl">
                  ✓ {newProductSuccess}
                </div>
              )}

              {newProductError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs font-bold rounded-xl font-sans">
                  ⚠️ {newProductError}
                </div>
              )}

              <div className="pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewItemName("");
                    setNewItemQuantity("");
                    setNewProductSuccess(null);
                    setNewProductError(null);
                  }}
                  className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-neutral-800 bg-gray-100 dark:bg-neutral-850 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Effacer
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md"
                >
                  Ajouter au dépôt
                </button>
              </div>
            </div>
          </form>

          {/* Section visualisant la liste actuelle des produits */}
          <div className="pt-6 border-t border-gray-100 dark:border-neutral-800/80 space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">État actuel des articles au dépôt</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-gray-50 dark:bg-neutral-800/10 p-3 rounded-xl border border-gray-100 dark:border-neutral-800">
                <span className="font-bold text-indigo-700 dark:text-indigo-400 block mb-2">Matières Premières ({data.stocks.rawMaterials.length})</span>
                <ul className="space-y-1 divide-y divide-gray-55 dark:divide-neutral-800/40">
                  {data.stocks.rawMaterials.map((rm) => (
                    <li key={rm.id} className="pt-1 flex justify-between">
                      <span className="text-gray-700 dark:text-neutral-300">{rm.name} <span className="text-[10px] text-gray-400 font-mono">({rm.id})</span></span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">{rm.tonnage.toFixed(1)} {rm.unit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-neutral-800/10 p-3 rounded-xl border border-gray-100 dark:border-neutral-800">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-2">Produits Finis ({data.stocks.finishedProducts.length})</span>
                <ul className="space-y-1 divide-y divide-gray-55 dark:divide-neutral-800/40">
                  {data.stocks.finishedProducts.map((fp) => (
                    <li key={fp.id} className="pt-1 flex justify-between">
                      <span className="text-gray-700 dark:text-neutral-300">{fp.name} <span className="text-[10px] text-gray-400 font-mono">({fp.id})</span></span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">{fp.quantity.toLocaleString()} {fp.unit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-neutral-800/10 p-3 rounded-xl border border-gray-100 dark:border-neutral-800">
                <span className="font-bold text-amber-700 dark:text-amber-400 block mb-2">Consommables d'Usine ({data.stocks.consumables.length})</span>
                <ul className="space-y-1 divide-y divide-gray-55 dark:divide-neutral-800/40">
                  {data.stocks.consumables.map((co) => (
                    <li key={co.id} className="pt-1 flex justify-between">
                      <span className="text-gray-700 dark:text-neutral-300">{co.name} <span className="text-[10px] text-gray-400 font-mono">({co.id})</span></span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">{co.quantity.toLocaleString()} {co.unit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECOUVREMENT DE L'INVENTAIRE DES STOCKS POUR IMPRESSION */}
      {printingInventory && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
            <div className="bg-neutral-100 px-6 py-4 flex justify-between items-center border-b border-neutral-200 no-print">
              <span className="text-sm font-bold text-neutral-800 flex items-center gap-2">
                📂 Aperçu Impression - Bon d'état des Stocks PDF
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadHtmlDocument("printable-stock-inventory", "fiche_inventaire_stocks.html", "Bon d'état des Stocks - Alvin Agro-industriel")}
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
                  onClick={() => setPrintingInventory(false)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div id="printable-stock-inventory" className="printable-area p-8 space-y-6 bg-white">
              <div className="flex justify-between items-start border-b border-gray-300 pb-6">
                <div>
                  <h3 className="text-xl font-extrabold text-indigo-700 tracking-tight">ALVIN AGRO-INDUSTRIEL SARL</h3>
                  <p className="text-xs text-gray-500 mt-1">Route de Kipushi, Quartier Industriel • Lubumbashi, RDC</p>
                  <p className="text-xs text-gray-500">Superviseur Dépôt: Marc Mwamba</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 font-bold rounded-lg text-xs uppercase mb-1">
                    Inventaire Mensuel
                  </span>
                  <p className="text-xs text-gray-500 font-mono">Date: {new Date().toLocaleDateString("fr-FR")}</p>
                </div>
              </div>

              <div className="text-center">
                <h4 className="text-md font-bold uppercase tracking-wider text-gray-800">BON D'INVENTAIRE ET ÉTAT DES STOCKS</h4>
              </div>

              {/* Tableau des tonnages */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200 pb-1">1. Matières Premières (Récoltes)</h5>
                <table className="w-full text-left text-xs text-gray-700 divide-y divide-gray-100">
                  <thead>
                    <tr className="bg-gray-50 font-bold">
                      <th className="p-2">Réf ID</th>
                      <th className="p-2">Désignation</th>
                      <th className="p-2 text-right">Tonnage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.stocks.rawMaterials.map((rm) => (
                      <tr key={rm.id}>
                        <td className="p-2 font-mono text-[10px]">{rm.id}</td>
                        <td className="p-2">{rm.name}</td>
                        <td className="p-2 text-right font-mono font-bold">{rm.tonnage.toFixed(1)} {rm.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tableau des produits finis */}
              <div className="space-y-2 pt-2">
                <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200 pb-1">2. Produits Finis du Dépôt</h5>
                <table className="w-full text-left text-xs text-gray-700 divide-y divide-gray-100">
                  <thead>
                    <tr className="bg-gray-50 font-bold">
                      <th className="p-2">Réf ID</th>
                      <th className="p-2">Description du Produit</th>
                      <th className="p-2 text-right">Quantité Enregistrée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.stocks.finishedProducts.map((fp) => (
                      <tr key={fp.id}>
                        <td className="p-2 font-mono text-[10px]">{fp.id}</td>
                        <td className="p-2">{fp.name}</td>
                        <td className="p-2 text-right font-mono font-bold">{fp.quantity} {fp.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tableau des consommables */}
              <div className="space-y-2 pt-2">
                <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200 pb-1">3. État des Consommables & Alerte Seuil</h5>
                <table className="w-full text-left text-xs text-gray-700 divide-y divide-gray-100 animate-fade-in">
                  <thead>
                    <tr className="bg-gray-50 font-bold">
                      <th className="p-2">Réf ID</th>
                      <th className="p-2">Type d'Emballage / Intrant</th>
                      <th className="p-2 text-right">Stock Actuel</th>
                      <th className="p-2 text-right">Seuil Alerte</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.stocks.consumables.map((co) => {
                      const isLow = co.quantity < co.threshold;
                      return (
                        <tr key={co.id} className={isLow ? "bg-red-50 text-red-900" : ""}>
                          <td className="p-2 font-mono text-[10px]">{co.id}</td>
                          <td className="p-2">{co.name}</td>
                          <td className="p-2 text-right font-mono font-bold">{co.quantity.toLocaleString()}</td>
                          <td className="p-2 text-right font-mono text-gray-450">{co.threshold.toLocaleString()}</td>
                          <td className="p-2 text-center font-bold text-[10px]">
                            {isLow ? "🚨 RUPTURE" : "✓ OK"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pt-8 flex justify-between text-xs text-gray-400 border-t border-dashed border-gray-200">
                <div>
                  <p className="font-bold text-[10px] uppercase text-gray-500">Signé Chef de Dépôt</p>
                  <div className="h-10"></div>
                  <p className="pt-1">Marc Mwamba</p>
                </div>
                <div>
                  <p className="font-bold text-[10px] uppercase text-gray-500">Contrôle Qualité Usine</p>
                  <div className="h-10"></div>
                  <p className="pt-1">Visa de Direction</p>
                </div>
              </div>

            </div>

            {/* Barre d'actions inferieure - Toujours accessible en bas de la visionneuse de documents (corrige le probleme de defilement) */}
            <div className="bg-neutral-55 dark:bg-neutral-900 px-6 py-4 flex justify-end items-center gap-3 border-t border-slate-200 dark:border-neutral-800 rounded-b-2xl no-print">
              <button
                onClick={() => setPrintingInventory(false)}
                className="px-4 py-2 hover:bg-slate-200 bg-slate-100 dark:hover:bg-neutral-800 dark:bg-neutral-850 text-slate-700 dark:text-neutral-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Fermer
              </button>
              <button
                onClick={() => downloadHtmlDocument("printable-stock-inventory", "fiche_inventaire_stocks.html", "Bon d'état des Stocks - Alvin Agro-industriel")}
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
      )}
    </div>
  );
}
