import React, { useState } from "react";
import { DatabaseState, SalesInvoice, PurchaseOrder, Client } from "../types";
import { ClipboardCheck, DollarSign, PenTool, Printer, Receipt, ShieldX, ShoppingBag, ShoppingCart, Truck, X, Layers, Landmark, Download, Users, UserPlus, Trash2, Calendar, MapPin, Phone, Mail, Building, Plus, BookOpen, AlertCircle, FileText, Sparkles } from "lucide-react";
import { downloadHtmlDocument } from "../utils/downloadHelper";

interface PosteCommercialProps {
  data: DatabaseState;
  onUpdate: (newData: DatabaseState) => void;
  darkMode: boolean;
}

export default function PosteCommercial({ data, onUpdate, darkMode }: PosteCommercialProps) {
  const [activeTab, setActiveTab] = useState<"sales" | "purchases" | "clients">("sales");
  const [printingInvoice, setPrintingInvoice] = useState<SalesInvoice | null>(null);

  // États des variables de l'annuaire client
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [clientForm, setClientForm] = useState({
    name: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
    category: "Grossiste" as Client["category"]
  });
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Formulaire d'insertion de facture de vente
  const [isAddingSale, setIsAddingSale] = useState(false);
  const [saleForm, setSaleForm] = useState({
    client: "",
    product: data.stocks.finishedProducts[0]?.name || "Farine de Maïs Tamisée Premium (Sacs 25kg)",
    quantity: "100",
    unitPrice: "25", // prix unitaire ajustable lors de la saisie de la facture 
    status: "Payé" as SalesInvoice["status"]
  });

  // Sélection de bon de commande de consommables
  const [isAddingPurchase, setIsAddingPurchase] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    supplier: "",
    product: data.stocks.consumables[0]?.name || "Sacs d'emballage vides 25kg",
    quantity: "5000",
    amount: "1250",
    deliveryDate: ""
  });

  // Calculer la liquidité d'entreprise totale (caisse disponible)
  const totalSalesRevenue = data.commercial.sales
    .filter((s) => s.status === "Payé")
    .reduce((acc, s) => acc + s.amount, 0);

  const totalPurchasesExpenses = data.commercial.purchases
    .reduce((acc, p) => acc + p.amount, 0);

  const totalSalariesPaid = data.employees.reduce(
    (acc, emp) => acc + emp.salaryHistory.reduce((sum, sal) => sum + sal.amount, 0),
    0
  );

  // Liquidités initiales injectées dans le coffre principal
  const startingCash = 25000;
  const cashInSafe = Math.max(0, startingCash + totalSalesRevenue - totalPurchasesExpenses - totalSalariesPaid);

  const handleRegisterNewClient = (e: React.FormEvent) => {
    e.preventDefault();
    const existingClients = data.clients || [];
    const newClient: Client = {
      id: `CLI-${String(existingClients.length + 1).padStart(3, "0")}`,
      name: clientForm.name,
      companyName: clientForm.companyName,
      email: clientForm.email || `${clientForm.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      phone: clientForm.phone || "+243 000 000 000",
      address: clientForm.address || "Lubumbashi, RDC",
      registeredDate: new Date().toISOString().split("T")[0],
      category: clientForm.category
    };

    const updated = {
      ...data,
      clients: [...existingClients, newClient]
    };
    onUpdate(updated);
    setIsAddingClient(false);
    setClientForm({
      name: "",
      companyName: "",
      email: "",
      phone: "",
      address: "",
      category: "Grossiste"
    });
  };

  const handleDeleteClient = (clientId: string) => {
    const existingClients = data.clients || [];
    const updated = {
      ...data,
      clients: existingClients.filter(cl => cl.id !== clientId)
    };
    onUpdate(updated);
    if (selectedClientForDetails?.id === clientId) {
      setSelectedClientForDetails(null);
    }
  };

  const handleAddNewSale = (e: React.FormEvent) => {
    e.preventDefault();
    
    const calculatedAmount = Number(saleForm.quantity) * Number(saleForm.unitPrice);
    
    const newSale: SalesInvoice = {
      id: `FAC-${String(data.commercial.sales.length + 1).padStart(3, "0")}`,
      client: saleForm.client,
      product: saleForm.product,
      quantity: Number(saleForm.quantity),
      amount: calculatedAmount,
      date: new Date().toISOString().split("T")[0],
      status: saleForm.status
    };

    // Si le statut de la vente est Paye, deduire automatiquement les quantites de produits finis du stock actuel !
    const productItem = data.stocks.finishedProducts.find((f) => f.name === saleForm.product);
    let updatedFp = [...data.stocks.finishedProducts];
    if (productItem && saleForm.status === "Payé") {
      updatedFp = data.stocks.finishedProducts.map((fp) => {
        if (fp.id === productItem.id) {
          return { ...fp, quantity: Math.max(0, fp.quantity - Number(saleForm.quantity)) };
        }
        return fp;
      });
    }

    const updated = {
      ...data,
      stocks: {
        ...data.stocks,
        finishedProducts: updatedFp
      },
      commercial: {
        ...data.commercial,
        sales: [newSale, ...data.commercial.sales]
      }
    };
    onUpdate(updated);
    setIsAddingSale(false);
    setSaleForm({
      client: "",
      product: data.stocks.finishedProducts[0]?.name || "Farine de Maïs Tamisée Premium (Sacs 25kg)",
      quantity: "100",
      unitPrice: "25",
      status: "Payé"
    });
  };

  const handleAddNewPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const futureDate = purchaseForm.deliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const newPurchase: PurchaseOrder = {
      id: `BON-${String(data.commercial.purchases.length + 1).padStart(3, "0")}`,
      supplier: purchaseForm.supplier,
      product: purchaseForm.product,
      quantity: Number(purchaseForm.quantity),
      amount: Number(purchaseForm.amount),
      date: new Date().toISOString().split("T")[0],
      status: "En Cours" as const,
      deliveryDate: futureDate
    };

    const updated = {
      ...data,
      commercial: {
        ...data.commercial,
        purchases: [newPurchase, ...data.commercial.purchases]
      }
    };
    onUpdate(updated);
    setIsAddingPurchase(false);
    setPurchaseForm({
      supplier: "",
      product: data.stocks.consumables[0]?.name || "Sacs d'emballage vides 25kg",
      quantity: "5000",
      amount: "1250",
      deliveryDate: ""
    });
  };

  const handleStatusChange = (saleId: string, status: SalesInvoice["status"]) => {
    const updatedSales = data.commercial.sales.map((sal) => {
      if (sal.id === saleId) {
        return { ...sal, status };
      }
      return sal;
    });
    const updated = {
      ...data,
      commercial: {
        ...data.commercial,
        sales: updatedSales
      }
    };
    onUpdate(updated);
  };

  const handleReceivePurchase = (purchaseId: string) => {
    // La reception du bon de commande approvisionne automatiquement le consommable correspondant !
    const po = data.commercial.purchases.find((p) => p.id === purchaseId);
    if (!po) return;

    const consumableItem = data.stocks.consumables.find((c) => c.name === po.product);
    let updatedConsumables = [...data.stocks.consumables];
    if (consumableItem) {
      updatedConsumables = data.stocks.consumables.map((co) => {
        if (co.id === consumableItem.id) {
          return { ...co, quantity: co.quantity + po.quantity };
        }
        return co;
      });
    }

    const updatedPurchases = data.commercial.purchases.map((p) => {
      if (p.id === purchaseId) {
        return { ...p, status: "Livré" as const };
      }
      return p;
    });

    const updated = {
      ...data,
      stocks: {
        ...data.stocks,
        consumables: updatedConsumables
      },
      commercial: {
        ...data.commercial,
        purchases: updatedPurchases
      }
    };
    onUpdate(updated);
  };

  // Recuperer les informations des produits actuellement selectionnes
  const activeSelectedProduct = data.stocks.finishedProducts.find(f => f.name === saleForm.product);
  const currentProductStock = activeSelectedProduct ? activeSelectedProduct.quantity : 0;

  const activeSelectedConsumable = data.stocks.consumables.find(co => co.name === purchaseForm.product);
  const currentConsumableStock = activeSelectedConsumable ? activeSelectedConsumable.quantity : 0;

  return (
    <div className="space-y-6">
      {/* En-tete de service officiel et Logo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-150 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md border-2 border-amber-300">
            <ShoppingCart size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Logistique Commerciale & Facturation
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ventes en gros • Bons d'approvisionnement • Trésorerie et caisse de sécurité.
            </p>
          </div>
        </div>
      </div>

      {/* Surveillance de la tresorerie de l'entreprise / Resume du tableau de bord */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recettes totales */}
        <div className="bg-white dark:bg-neutral-900/40 p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Recettes Encaissées (Ventes)</span>
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            ${totalSalesRevenue.toLocaleString()} USD
          </p>
          <span className="text-[9px] text-gray-450 block mt-1">Total des factures au statut "Payé"</span>
        </div>

        {/* Liquidites actuelles en caisse */}
        <div className="bg-white dark:bg-neutral-900/40 p-4 rounded-2xl border border-gray-150 dark:border-neutral-800 shadow-xs relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-10 text-violet-600">
            <Landmark size={40} />
          </div>
          <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Solde Réel en Caisse (Trésorerie)</span>
          <p className="text-xl font-extrabold text-violet-600 dark:text-violet-400 mt-1">
            ${cashInSafe.toLocaleString()} USD
          </p>
          <span className="text-[9px] text-gray-450 block mt-1">Recettes - Dépenses Consommables - Salaires Payés</span>
        </div>

        {/* Creances en attente */}
        <div className="bg-white dark:bg-neutral-900/40 p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Créances en Attente</span>
          <p className="text-xl font-extrabold text-amber-600 mt-1">
            ${data.commercial.sales.filter((f) => f.status === "En Attente").reduce((acc, s) => acc + s.amount, 0).toLocaleString()} USD
          </p>
          <span className="text-[9px] text-gray-450 block mt-1">Règlements non finalisés répertoriés</span>
        </div>
      </div>

      {/* Changement d'onglets */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-neutral-800/60 rounded-xl w-fit">
        <button
          onClick={() => {
            setActiveTab("sales");
            setIsAddingSale(false);
          }}
          className={`px-4 py-2 rounded-lg text-xs font-bold select-none cursor-pointer transition-all ${
            activeTab === "sales"
              ? "bg-amber-600 dark:bg-amber-700 text-white shadow-xs"
              : "text-gray-500 hover:text-amber-600 dark:hover:text-amber-400"
          }`}
          id="tab-sales-commercial"
        >
          📈 Factures Ventes en Gros
        </button>
        <button
          onClick={() => {
            setActiveTab("purchases");
            setIsAddingPurchase(false);
          }}
          className={`px-4 py-2 rounded-lg text-xs font-bold select-none cursor-pointer transition-all ${
            activeTab === "purchases"
              ? "bg-amber-600 dark:bg-amber-700 text-white shadow-xs"
              : "text-gray-500 hover:text-amber-600 dark:hover:text-amber-400"
          }`}
          id="tab-purchases-commercial"
        >
          🛒 Achats Consommables (PO)
        </button>
        <button
          onClick={() => {
            setActiveTab("clients");
            setIsAddingClient(false);
            setSelectedClientForDetails(null);
          }}
          className={`px-4 py-2 rounded-lg text-xs font-bold select-none cursor-pointer transition-all ${
            activeTab === "clients"
              ? "bg-amber-600 dark:bg-amber-700 text-white shadow-xs"
              : "text-gray-500 hover:text-amber-600 dark:hover:text-amber-400"
          }`}
          id="tab-clients-commercial"
        >
          👥 Fichier Clients ({(data.clients || []).length})
        </button>
      </div>

      {activeTab === "sales" ? (
        /* FEUILLE DES VENTES */
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-gray-50 dark:bg-neutral-850 p-4 rounded-xl border border-gray-100 dark:border-neutral-800">
            <div>
              <span className="text-xs text-gray-500 font-semibold">Registre de ventes wholesale</span>
              <p className="text-base font-extrabold text-slate-805 dark:text-white mt-0.5">
                {data.commercial.sales.length} Transactions Émises
              </p>
            </div>
            <button
              onClick={() => setIsAddingSale(true)}
              className="px-4 py-2 bg-violet-600 dark:bg-violet-700 hover:bg-violet-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
            >
              + Rédiger Facture Client
            </button>
          </div>

          {isAddingSale && (
            /* FORMULAIRE DES VENTES */
            <form onSubmit={handleAddNewSale} className="p-5 bg-white dark:bg-neutral-900/40 dark:backdrop-blur-md border-2 border-slate-300 dark:border-neutral-800 rounded-2xl space-y-4 shadow-lg">
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-neutral-850 pb-2">
                <h3 className="text-xs font-black text-gray-850 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt size={16} className="text-violet-600" /> Émission Nouvelle Facture Wholesale
                </h3>
                <button type="button" onClick={() => setIsAddingSale(false)} className="text-gray-400 hover:text-gray-500">
                  <X size={18} />
                </button>
              </div>

              {/* AFFICHAGE ALERTE DE STOCK PRODUITS DYNAMIQUE */}
              <div className="p-3 bg-slate-50 dark:bg-neutral-850 border border-slate-150 dark:border-neutral-800 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">PRODUIT SÉLECTIONNÉ :</span>
                  <span className="font-extrabold text-gray-800 dark:text-white">{saleForm.product}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">STOCK DISPONIBLE :</span>
                  <span className={`font-mono font-bold text-sm ${currentProductStock > 100 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500 dark:text-amber-400 animate-pulse"}`}>
                    {currentProductStock.toLocaleString()} unités
                  </span>
                </div>
              </div>

              {Number(saleForm.quantity) > currentProductStock && saleForm.status === "Payé" && (
                <div className="p-3 bg-rose-50 dark:bg-rose-955/20 border-l-4 border-rose-500 text-rose-800 dark:text-rose-400 rounded-lg text-xs font-bold animate-pulse">
                  ⚠️ STOCK INSUFFISANT : Vous essayez de débiter {Number(saleForm.quantity).toLocaleString()} unités alors que le stock disponible n'est que de {currentProductStock.toLocaleString()} unités.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-500 font-extrabold uppercase tracking-wider">Raison Sociale Client</label>
                    {data.clients && data.clients.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSaleForm({ ...saleForm, client: "CUSTOM_CLIENT" })}
                        className="text-[10px] text-violet-600 dark:text-violet-400 font-bold hover:underline"
                      >
                        Saisie manuelle
                      </button>
                    )}
                  </div>
                  {data.clients && data.clients.length > 0 ? (
                    <div className="space-y-2">
                      <select
                        value={data.clients.some(c => c.companyName === saleForm.client) ? saleForm.client : (saleForm.client === "" ? "" : "CUSTOM_CLIENT")}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "CUSTOM_CLIENT") {
                            setSaleForm({ ...saleForm, client: "" });
                          } else {
                            setSaleForm({ ...saleForm, client: val });
                          }
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-300 dark:border-neutral-700 rounded-xl text-gray-950 dark:text-white font-semibold focus:outline-none focus:border-violet-600"
                      >
                        <option value="">-- Choisir un client enregistré --</option>
                        {data.clients.map((c) => (
                          <option key={c.id} value={c.companyName}>
                            {c.companyName} ({c.name} - {c.category})
                          </option>
                        ))}
                        <option value="CUSTOM_CLIENT">✍️ Saisie manuelle à la volée...</option>
                      </select>
                      
                      {(!data.clients.some(c => c.companyName === saleForm.client) || saleForm.client === "") && (
                        <input
                          type="text"
                          required
                          value={saleForm.client}
                          onChange={(e) => setSaleForm({ ...saleForm, client: e.target.value })}
                          placeholder="Nom de la boulangerie, supermarché ou grossiste..."
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-850 border border-violet-200 dark:border-neutral-700 rounded-xl text-gray-950 dark:text-white font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500"
                        />
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      required
                      value={saleForm.client}
                      onChange={(e) => setSaleForm({ ...saleForm, client: e.target.value })}
                      placeholder="Boulangerie du grand centre du Katanga"
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-300 dark:border-neutral-700 rounded-xl text-gray-950 dark:text-white font-semibold focus:outline-none focus:border-violet-600"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold uppercase tracking-wider mb-1">Produit de Gros à facturer</label>
                  <select
                    value={saleForm.product}
                    onChange={(e) => setSaleForm({ ...saleForm, product: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-300 dark:border-neutral-700 rounded-xl text-gray-955 dark:text-white font-semibold focus:outline-none focus:border-violet-600"
                  >
                    {data.stocks.finishedProducts.map((fp) => (
                      <option key={fp.id} value={fp.name}>{fp.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold uppercase tracking-wider mb-1">Quantité Facturée</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={saleForm.quantity}
                    onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-300 dark:border-neutral-700 rounded-xl text-gray-955 dark:text-white font-semibold focus:outline-none focus:border-violet-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold uppercase tracking-wider mb-1">Prix Unitaire (USD • Ajustable)</label>
                  <input
                    type="number"
                    required
                    min="0.1"
                    step="0.1"
                    value={saleForm.unitPrice}
                    onChange={(e) => setSaleForm({ ...saleForm, unitPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-300 dark:border-neutral-700 rounded-xl text-gray-955 dark:text-white font-mono font-bold focus:outline-none focus:border-violet-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold uppercase tracking-wider mb-1">Facturation Initiale Statut</label>
                  <select
                    value={saleForm.status}
                    onChange={(e) => setSaleForm({ ...saleForm, status: e.target.value as SalesInvoice["status"] })}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-300 dark:border-neutral-700 rounded-xl text-gray-955 dark:text-white font-semibold focus:outline-none focus:border-violet-600"
                  >
                    <option value="Payé">Payé (Dispatche de stock immédiat)</option>
                    <option value="En Attente">En Attente de règlement (Créance)</option>
                  </select>
                </div>

                <div className="bg-violet-50 dark:bg-violet-950/25 p-3.5 rounded-xl border border-violet-100 dark:border-violet-900/40 flex flex-col justify-center">
                  <span className="text-[10px] text-violet-500 font-extrabold uppercase tracking-wider">Montant Total Facturé :</span>
                  <span className="text-xl font-mono font-black text-violet-700 dark:text-violet-300">
                    ${(Number(saleForm.quantity || 0) * Number(saleForm.unitPrice || 0)).toLocaleString()} USD
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={Number(saleForm.quantity) > currentProductStock && saleForm.status === "Payé"}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Émettre la facture et comptabiliser
              </button>
            </form>
          )}

          {/* TABLEAU */}
          <div className="bg-white dark:bg-neutral-900/30 dark:backdrop-blur-md rounded-2xl border border-slate-150 dark:border-neutral-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-neutral-850 text-gray-450 uppercase font-bold border-b border-gray-100 dark:border-neutral-800 text-[10px] tracking-wide">
                    <th className="p-3">ID Facture</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Client grossiste</th>
                    <th className="p-3">Désignation</th>
                    <th className="p-3 text-right">Quantité</th>
                    <th className="p-3 text-right">Total Net</th>
                    <th className="p-3 text-center">Règlement</th>
                    <th className="p-3 text-center">Impression</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
                  {data.commercial.sales.map((sal) => (
                    <tr key={sal.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-850/10 transition">
                      <td className="p-3 font-mono font-bold text-violet-600 dark:text-violet-400">{sal.id}</td>
                      <td className="p-3 font-mono text-gray-400">{sal.date}</td>
                      <td className="p-3 font-bold text-gray-800 dark:text-white">{sal.client}</td>
                      <td className="p-3 text-gray-500 max-w-[150px] truncate">{sal.product}</td>
                      <td className="p-3 text-right font-mono text-gray-600 dark:text-gray-400 font-medium">{sal.quantity} pcs</td>
                      <td className="p-3 text-right font-mono font-black text-gray-850 dark:text-white">${sal.amount.toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <select
                          value={sal.status}
                          onChange={(e) => handleStatusChange(sal.id, e.target.value as SalesInvoice["status"])}
                          className={`px-2 py-1 text-[10px] font-bold uppercase rounded-lg border outline-hidden cursor-pointer ${
                            sal.status === "Payé"
                              ? "bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border-emerald-300"
                              : "bg-amber-100 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border-amber-300"
                          }`}
                        >
                          <option value="Payé">Payé</option>
                          <option value="En Attente">En Attente</option>
                          <option value="Annulé">Annulé</option>
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setPrintingInvoice(sal)}
                          className="p-1 px-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-md hover:scale-105 transition shadow-xs cursor-pointer"
                        >
                          🖨 Imprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === "purchases" ? (
        /* BONS DE COMMANDE ACHATS DE CONDITIONNEMENT */
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-gray-50 dark:bg-neutral-850 p-4 rounded-xl border border-gray-100 dark:border-neutral-800">
            <div>
              <span className="text-xs text-gray-500 font-semibold font-sans">En cours de pré-livraison</span>
              <p className="text-base font-extrabold text-amber-600 dark:text-amber-450">
                {data.commercial.purchases.filter((p) => p.status === "En Cours").length} Commandes émises
              </p>
            </div>
            <button
              onClick={() => setIsAddingPurchase(true)}
              className="px-4 py-2 bg-violet-600 dark:bg-violet-700 hover:bg-violet-700 dark:hover:bg-violet-800 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              + Commander Consommables
            </button>
          </div>

          {isAddingPurchase && (
            /* FORMULAIRE DES BONS DE COMMANDE ACHATS */
            <form onSubmit={handleAddNewPurchase} className="p-5 bg-white dark:bg-neutral-900/40 dark:backdrop-blur-md border border-gray-100 dark:border-neutral-800 rounded-2xl space-y-4 shadow-md">
              <div className="flex justify-between items-center border-b border-gray-150 dark:border-neutral-855 pb-2">
                <h3 className="text-xs font-bold text-gray-800 dark:text-neutral-200 uppercase tracking-widest flex items-center gap-1.5 animate-fade-in">
                  <ShoppingCart size={16} className="text-violet-600" /> Demande de Consommables (Bons de commande)
                </h3>
                <button type="button" onClick={() => setIsAddingPurchase(false)} className="text-gray-400 hover:text-gray-500">
                  <X size={18} />
                </button>
              </div>

              {/* REGULATEUR ALERTE TRESORERIE POUR EVITER SUR-COMMANDE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-violet-50 dark:bg-violet-955/20 border border-violet-100 dark:border-violet-900/45 rounded-xl text-xs">
                  <span className="text-[10px] text-violet-600 dark:text-violet-400 font-bold block uppercase tracking-wide">Trésorerie Disponible :</span>
                  <span className="text-base font-mono font-extrabold text-violet-700 dark:text-violet-300">
                    ${cashInSafe.toLocaleString()} USD
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-neutral-850 border border-slate-150 dark:border-neutral-800 rounded-xl text-xs">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wide">Stock actuel emballages :</span>
                  <span className="text-base font-mono font-bold">
                    {currentConsumableStock.toLocaleString()} unités
                  </span>
                </div>
              </div>

              {Number(purchaseForm.amount) > cashInSafe && (
                <div className="p-3 bg-rose-50 dark:bg-rose-955/25 border-l-4 border-rose-500 text-rose-800 dark:text-rose-450 rounded-lg text-xs font-bold animate-pulse">
                  ⚠️ ALERTE TRÉSORERIE : Le montant requis pour cette commande (${Number(purchaseForm.amount).toLocaleString()} USD) excède la liquidité actuellement disponible en caisse (${cashInSafe.toLocaleString()} USD).
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-500 font-extrabold uppercase mb-1">Réseau Fournisseur</label>
                  <input
                    type="text"
                    required
                    value={purchaseForm.supplier}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, supplier: e.target.value })}
                    placeholder="ex: PlastKat Lubumbashi Sarl"
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-300 dark:border-neutral-700 rounded-xl text-gray-955 dark:text-white font-semibold focus:outline-none focus:border-violet-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold uppercase mb-1">Désignation du Consommable</label>
                  <select
                    value={purchaseForm.product}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, product: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-300 dark:border-neutral-700 rounded-xl text-gray-955 dark:text-white font-semibold focus:outline-none focus:border-violet-600"
                  >
                    {data.stocks.consumables.map((co) => (
                      <option key={co.id} value={co.name}>{co.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold uppercase mb-1">Quantité demandée (unités)</label>
                  <input
                    type="number"
                    required
                    value={purchaseForm.quantity}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-300 dark:border-neutral-700 rounded-xl text-gray-955 dark:text-white font-semibold focus:outline-none focus:border-violet-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold uppercase mb-1">Frais d'acquisition (USD)</label>
                  <input
                    type="number"
                    required
                    value={purchaseForm.amount}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-300 dark:border-neutral-700 rounded-xl text-gray-955 dark:text-white font-mono font-bold focus:outline-none focus:border-violet-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-extrabold uppercase mb-1">Date estimée de livraison</label>
                  <input
                    type="date"
                    required
                    value={purchaseForm.deliveryDate}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, deliveryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-300 dark:border-neutral-700 rounded-xl text-gray-955 dark:text-white font-semibold focus:outline-none focus:border-violet-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={Number(purchaseForm.amount) > cashInSafe}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-45"
              >
                Émettre le bon d'acquisition
              </button>
            </form>
          )}

          {/* LISTE DES BONS DE COMMANDE */}
          <div className="bg-white dark:bg-neutral-900/30 dark:backdrop-blur-md rounded-xl border border-slate-150 dark:border-neutral-800 p-2 space-y-3 shadow-xs">
            {data.commercial.purchases.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-6">Aucun bon d'achat émis.</p>
            ) : (
              data.commercial.purchases.map((po) => (
                <div key={po.id} className="p-4 rounded-xl border border-slate-100 dark:border-neutral-800/60 flex flex-wrap gap-4 justify-between items-center text-xs bg-gray-55/20 dark:bg-neutral-850/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-violet-700 dark:text-violet-400">{po.id}</span>
                      <span className="text-[10px] bg-violet-50 dark:bg-violet-955/40 text-violet-700 dark:text-violet-400 p-1 rounded-sm">{po.supplier}</span>
                    </div>
                    <h4 className="font-bold text-gray-805 dark:text-white">{po.product}</h4>
                    <p className="text-[10px] text-gray-400 font-mono">
                      Quantité: {po.quantity.toLocaleString()} pcs • Commande émise le : {po.date}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="block font-mono font-extrabold text-gray-800 dark:text-white">${po.amount} USD</span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1 justify-end">
                        <Truck size={12} /> Livraison : {po.deliveryDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        po.status === "Livré"
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-300"
                          : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-300 animate-pulse"
                      }`}>
                        {po.status}
                      </span>

                      {po.status === "En Cours" && (
                        <button
                          onClick={() => handleReceivePurchase(po.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] cursor-pointer"
                        >
                          ✓ Réceptionner
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* DIRECTOIRE ET HISTORIQUE TRANSACTIONNEL DU PORTEFEUILLE CLIENTELE */
        <div className="space-y-6 animate-fade-in font-sans">
          {selectedClientForDetails ? (
            /* Vue detaillee du profil client selectionne */
            <div className="p-6 bg-white dark:bg-neutral-900 border border-slate-150 dark:border-neutral-800 rounded-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-neutral-800 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-955/40 text-violet-600 dark:text-violet-300 flex items-center justify-center border border-violet-200 shadow-xs">
                    <Building size={26} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900 dark:text-white">{selectedClientForDetails.companyName}</h3>
                      <span className="px-2 py-0.5 text-[9px] bg-slate-150 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 rounded-full font-bold uppercase">
                        {selectedClientForDetails.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Gérant : {selectedClientForDetails.name} • Partenaire historique depuis le {selectedClientForDetails.registeredDate}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClientForDetails(null)}
                  className="px-4 py-2 hover:bg-slate-205 bg-slate-100 dark:hover:bg-neutral-800 dark:bg-neutral-850 text-slate-705 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer shadow-xs transition animate-fade-in"
                >
                  ← Tous nos clients
                </button>
              </div>

              {/* Cartes de contact et d'indicateurs pour le client specifique */}
              {(() => {
                const clientSales = data.commercial.sales.filter(s => s.client === selectedClientForDetails.companyName);
                const paidSum = clientSales.filter(s => s.status === "Payé").reduce((sum, s) => sum + s.amount, 0);
                const pendingSum = clientSales.filter(s => s.status === "En Attente").reduce((sum, s) => sum + s.amount, 0);

                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-gray-500 dark:text-neutral-450">
                      <div className="p-3.5 bg-slate-50 dark:bg-neutral-850 rounded-xl border border-slate-150 dark:border-neutral-800 flex items-center gap-2.5">
                        <Phone size={14} className="text-indigo-600" />
                        <span className="font-mono">{selectedClientForDetails.phone}</span>
                      </div>
                      <div className="p-3.5 bg-slate-50 dark:bg-neutral-850 rounded-xl border border-slate-150 dark:border-neutral-800 flex items-center gap-2.5">
                        <Mail size={14} className="text-indigo-600" />
                        <span className="truncate">{selectedClientForDetails.email}</span>
                      </div>
                      <div className="p-3.5 bg-slate-50 dark:bg-neutral-850 rounded-xl border border-slate-150 dark:border-neutral-800 flex items-center gap-2.5">
                        <MapPin size={14} className="text-red-500" />
                        <span className="truncate">{selectedClientForDetails.address}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-50 dark:bg-neutral-850/40 rounded-xl border border-gray-150 dark:border-neutral-800/80">
                        <span className="text-[9px] uppercase font-bold text-gray-450 block">Volume Total Émis</span>
                        <p className="text-lg font-black text-slate-805 dark:text-white mt-1">
                          {clientSales.length} Factures de Gros
                        </p>
                      </div>
                      <div className="p-4 bg-emerald-50/20 dark:bg-emerald-955/10 rounded-xl border border-emerald-150/40 dark:border-neutral-800/80">
                        <span className="text-[9px] uppercase font-bold text-emerald-600 block">Fonds Encaissés (Payé)</span>
                        <p className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                          ${paidSum.toLocaleString()} USD
                        </p>
                      </div>
                      <div className="p-4 bg-amber-50/20 dark:bg-amber-955/10 rounded-xl border border-amber-150/40 dark:border-neutral-800/80">
                        <span className="text-[9px] uppercase font-bold text-amber-600 block">Créances encours à Lubumbashi</span>
                        <p className="text-xl font-mono font-bold text-amber-600 mt-1">
                          ${pendingSum.toLocaleString()} USD
                        </p>
                      </div>
                    </div>

                    {/* Journal des transactions du client */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-neutral-205 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                          <FileText size={15} className="text-violet-600" /> Registre Spécifique des Commandes
                        </h4>
                        <button
                          onClick={() => {
                            setSaleForm({
                              ...saleForm,
                              client: selectedClientForDetails.companyName
                            });
                            setActiveTab("sales");
                            setIsAddingSale(true);
                          }}
                          className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-[11px] rounded-lg shadow-xs cursor-pointer transition transform hover:scale-[1.02]"
                        >
                          + Éditer Facture pour ce Client
                        </button>
                      </div>

                      <div className="bg-white dark:bg-neutral-900/30 rounded-xl border border-slate-150 dark:border-neutral-800 overflow-hidden shadow-xs">
                        <div className="overflow-x-auto font-sans">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-neutral-850 text-[9px] uppercase font-semibold text-gray-400 tracking-wider border-b border-gray-100 dark:border-neutral-850">
                                <th className="p-3">Facture ID</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Désignation Produit</th>
                                <th className="p-3 text-right">Quantité</th>
                                <th className="p-3 text-right">Total Net</th>
                                <th className="p-3 text-center">Règlement de caisse</th>
                                <th className="p-3 text-center">Fiches PDF</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
                              {clientSales.length === 0 ? (
                                <tr>
                                  <td colSpan={7} className="p-6 text-center text-xs text-gray-400 italic">Aucune transaction répertoriée pour ce client.</td>
                                </tr>
                              ) : (
                                clientSales.map((sal) => (
                                  <tr key={sal.id} className="hover:bg-gray-55/40 dark:hover:bg-neutral-850/5 transition">
                                    <td className="p-3 font-mono font-bold text-violet-600 dark:text-violet-400">{sal.id}</td>
                                    <td className="p-3 font-mono text-gray-405">{sal.date}</td>
                                    <td className="p-3 font-semibold text-gray-800 dark:text-neutral-200">{sal.product}</td>
                                    <td className="p-3 text-right font-mono text-gray-600 dark:text-neutral-350">{sal.quantity.toLocaleString()} pcs</td>
                                    <td className="p-3 text-right font-mono font-bold text-gray-850 dark:text-white">${sal.amount.toLocaleString()}</td>
                                    <td className="p-3 text-center">
                                      <select
                                        value={sal.status}
                                        onChange={(e) => handleStatusChange(sal.id, e.target.value as SalesInvoice["status"])}
                                        className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-lg border outline-none cursor-pointer ${
                                          sal.status === "Payé"
                                            ? "bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border-emerald-300"
                                            : "bg-amber-100 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border-amber-300"
                                        }`}
                                      >
                                        <option value="Payé">Payé</option>
                                        <option value="En Attente">En Attente</option>
                                        <option value="Annulé">Annulé</option>
                                      </select>
                                    </td>
                                    <td className="p-3 text-center">
                                      <button
                                        onClick={() => setPrintingInvoice(sal)}
                                        className="p-1 px-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-md hover:scale-105 transition shadow-xs cursor-pointer text-[10px]"
                                      >
                                        Facturer
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            /* Page de la liste de l'annuaire */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-neutral-900 border border-slate-150 dark:border-neutral-800 p-4 rounded-xl shadow-xs">
                <div className="w-full sm:w-1/2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="🔍 Filtrer les clients partenaires par Raison Sociale, Resp..."
                    className="w-full px-4.5 py-2.5 bg-slate-50 dark:bg-neutral-855 border border-slate-150 dark:border-neutral-850 rounded-xl text-xs text-gray-950 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-violet-600"
                  />
                </div>
                <button
                  onClick={() => setIsAddingClient(!isAddingClient)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transform hover:scale-[1.01] transition cursor-pointer"
                >
                  <UserPlus size={15} /> + Enregistrer un Grossiste
                </button>
              </div>

              {isAddingClient && (
                /* FORMULAIRE DE CREATION DE NOUVEAU CLIENT */
                <form onSubmit={handleRegisterNewClient} className="p-5 bg-white dark:bg-neutral-900 border-2 border-slate-350 dark:border-neutral-800 rounded-2xl space-y-4 shadow-lg text-xs animate-slide-up">
                  <div className="flex justify-between items-center border-b border-gray-150 dark:border-neutral-800 pb-2">
                    <h3 className="text-xs font-black text-gray-805 dark:text-neutral-200 uppercase tracking-widest flex items-center gap-1.5">
                      <UserPlus size={15} className="text-violet-600" /> Formulaire de Répertoire d'Affaires Client
                    </h3>
                    <button type="button" onClick={() => setIsAddingClient(false)} className="text-gray-455 hover:text-gray-500">
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-505 font-bold uppercase mb-1">Raison Sociale de l'Établissement *</label>
                      <input
                        type="text"
                        required
                        value={clientForm.companyName}
                        onChange={(e) => setClientForm({ ...clientForm, companyName: e.target.value })}
                        placeholder="ex: Établissements Mwanke & Fils"
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-205 dark:border-neutral-700 rounded-xl text-gray-955 dark:text-white font-semibold focus:outline-none focus:border-violet-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-505 font-bold uppercase mb-1">Responsable Principal (Interlocuteur) *</label>
                      <input
                        type="text"
                        required
                        value={clientForm.name}
                        onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                        placeholder="ex: Jean-Pierre Mwanke"
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-205 dark:border-neutral-700 rounded-xl text-gray-955 dark:text-white font-semibold focus:outline-none focus:border-violet-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-505 font-bold uppercase mb-1">Type de Client *</label>
                      <select
                        value={clientForm.category}
                        onChange={(e) => setClientForm({ ...clientForm, category: e.target.value as Client["category"] })}
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-205 dark:border-neutral-700 rounded-xl text-gray-955 dark:text-white font-semibold focus:outline-none focus:border-violet-600"
                      >
                        <option value="Grossiste">Grossiste de Farine</option>
                        <option value="Boulangerie">Boulangerie Industrielle</option>
                        <option value="Supermarché">Supermarché / Grande Surface</option>
                        <option value="Distributeur">Distributeur Alimentaire National</option>
                        <option value="Autre">Autre Profil</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-505 font-bold uppercase mb-1">Numéro de Téléphone Mobiles *</label>
                      <input
                        type="text"
                        required
                        value={clientForm.phone}
                        onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                        placeholder="ex: +243 813 908 111"
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-205 dark:border-neutral-700 rounded-xl text-gray-955 dark:text-white font-mono focus:outline-none focus:border-violet-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-550 font-bold uppercase mb-1">Email professionnel</label>
                      <input
                        type="email"
                        value={clientForm.email}
                        onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                        placeholder="ex: mwankefils@gmail.com"
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-205 dark:border-neutral-700 rounded-xl text-gray-955 dark:text-white focus:outline-none focus:border-violet-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-550 font-bold uppercase mb-1">Adresse Bureau / Ville</label>
                      <input
                        type="text"
                        value={clientForm.address}
                        onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                        placeholder="ex: Avenue Lumumba 410, Lubumbashi"
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-slate-205 dark:border-neutral-700 rounded-xl text-gray-955 dark:text-white focus:outline-none focus:border-violet-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition cursor-pointer"
                  >
                    Valider l'archivage de la fiche client
                  </button>
                </form>
              )}

              {/* Grille de fiches profils clients de Lubumbashi */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(data.clients || [])
                  .filter((c) => {
                    const criteria = `${c.companyName} ${c.name} ${c.category} ${c.phone}`.toLowerCase();
                    return criteria.includes(searchTerm.toLowerCase());
                  })
                  .map((c) => {
                    const clientSales = data.commercial.sales.filter(s => s.client === c.companyName);
                    const paidSum = clientSales.filter(s => s.status === "Payé").reduce((sum, s) => sum + s.amount, 0);
                    const unpaidSum = clientSales.filter(s => s.status === "En Attente").reduce((sum, s) => sum + s.amount, 0);

                    return (
                      <div key={c.id} className="bg-white dark:bg-neutral-900 border border-slate-150 dark:border-neutral-805 rounded-2xl overflow-hidden shadow-xs relative flex flex-col justify-between hover:border-violet-400 dark:hover:border-neutral-700 transition group duration-150 pb-1">
                        <div className={`h-2 w-full ${
                          c.category === "Boulangerie" ? "bg-amber-500" :
                          c.category === "Supermarché" ? "bg-emerald-500" :
                          c.category === "Grossiste" ? "bg-indigo-500" :
                          c.category === "Distributeur" ? "bg-purple-500" : "bg-neutral-400"
                        }`} />

                        <div className="p-5 space-y-4 flex-grow">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-mono font-bold text-gray-400 block">{c.id}</span>
                              <h4 className="font-extrabold text-slate-900 dark:text-white mt-0.5 line-clamp-1">{c.companyName}</h4>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-center border-2 ${
                              c.category === "Boulangerie" ? "bg-amber-55 border-amber-200 text-amber-800" :
                              c.category === "Supermarché" ? "bg-emerald-55 border-emerald-200 text-emerald-800" :
                              c.category === "Grossiste" ? "bg-indigo-55 border-indigo-200 text-indigo-805" :
                              "bg-purple-55 border-purple-200 text-purple-800"
                            }`}>
                              {c.category}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-xs text-gray-500 dark:text-neutral-400">
                            <div className="flex items-center gap-1.5">
                              <Building size={12} className="text-gray-400 shrink-0" />
                              <span className="font-medium truncate">Resp: {c.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Phone size={12} className="text-gray-400 shrink-0" />
                              <span className="font-mono">{c.phone}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin size={12} className="text-red-405 shrink-0" />
                              <span className="truncate">{c.address}</span>
                            </div>
                          </div>

                          <div className="bg-slate-50 dark:bg-neutral-850/60 p-3 rounded-xl border border-slate-100 dark:border-neutral-800 text-[10px] grid grid-cols-2 gap-2 text-center text-gray-500">
                            <div>
                              <span className="block text-gray-400 font-extrabold uppercase">VOLUME ENCAISSÉ</span>
                              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">${paidSum.toLocaleString()}</span>
                            </div>
                            <div className="border-l border-slate-200 dark:border-neutral-800">
                              <span className="block text-gray-400 font-extrabold uppercase">CRÉANCES EN ATTENTE</span>
                              <span className={`font-mono font-bold text-xs ${unpaidSum > 0 ? "text-amber-500 animate-pulse font-extrabold" : "text-gray-400"}`}>
                                ${unpaidSum.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-neutral-850/30 px-5 py-3 border-t border-slate-100 dark:border-neutral-800 flex justify-between items-center text-xs">
                          <span className="text-[10px] text-gray-400 font-medium">Factures émises: {clientSales.length} dossiers</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedClientForDetails(c)}
                              className="px-3 py-1.5 bg-violet-50 dark:bg-violet-955/40 hover:bg-violet-100 dark:hover:bg-violet-900 text-violet-700 dark:text-violet-300 font-bold rounded-lg cursor-pointer transform hover:scale-[1.03] transition"
                            >
                              Fiche & Achats
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Voulez-vous vraiment désactiver le client ${c.companyName} au grand Katanga ?\n(Les transactions resteront archivées dans l'historique mais le répertoire du client sera désactivé).`)) {
                                  handleDeleteClient(c.id);
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-955/20 rounded-lg cursor-pointer transition"
                              title="Retirer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {(data.clients || []).length === 0 && (
                  <div className="col-span-full py-12 text-center text-xs text-gray-450 italic bg-white dark:bg-neutral-900 rounded-2xl border border-dashed border-gray-200">
                    👥 Aucun client enregistré dans la base de données. Enregistrez votre premier client à Lubumbashi en cliquant ci-dessus.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FACTURE CLIENT POUR IMPRESSION */}
      {printingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white text-gray-905 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
            <div className="bg-neutral-100 px-6 py-4 flex justify-between items-center border-b border-neutral-200 no-print">
              <span className="text-sm font-bold text-neutral-800 flex items-center gap-2">
                📂 Aperçu Impression - Facture Client Officielle PDF
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadHtmlDocument("printable-client-invoice", `facture_${printingInvoice.id}.html`, `Facture - ${printingInvoice.client}`)}
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
                  onClick={() => setPrintingInvoice(null)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div id="printable-client-invoice" className="printable-area p-8 space-y-6 bg-white animate-fade-in">
              <div className="flex justify-between items-start border-b border-gray-300 pb-6">
                <div>
                  <h3 className="text-xl font-extrabold text-violet-700 tracking-tight">ALVIN AGRO-INDUSTRIEL SARL</h3>
                  <p className="text-xs text-gray-500 mt-1 font-sans">Route de Kipushi, Quartier Industriel • Lubumbashi, RDC</p>
                  <p className="text-xs text-gray-500 font-mono">RCCM: CD/LSH/RCCM/24-B-04210</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-violet-100 text-violet-800 font-bold rounded-lg text-xs uppercase mb-1">
                    Facture Client
                  </span>
                  <p className="text-xs text-gray-500 font-mono">Date émission: {printingInvoice.date}</p>
                </div>
              </div>

              {/* Details de la Facture */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-xs">
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Facturer à (Client)</p>
                  <p className="text-sm font-bold text-gray-850 mt-1">{printingInvoice.client}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Informations Facture</p>
                  <p className="text-gray-700 mt-1 font-bold font-mono">Invoice N°: {printingInvoice.id}</p>
                  <p className="text-gray-550">Règlement : {printingInvoice.status}</p>
                </div>
              </div>

              {/* Tableau des Articles */}
              <div className="pt-2">
                <table className="w-full text-left text-xs divide-y divide-gray-150">
                  <thead>
                    <tr className="bg-gray-50 font-bold">
                      <th className="p-2">Réf Description Produit</th>
                      <th className="p-2 text-right">Quantité</th>
                      <th className="p-2 text-right">P.U (USD)</th>
                      <th className="p-2 text-right">Total Net (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="p-2">{printingInvoice.product}</td>
                      <td className="p-2 text-right font-mono">{printingInvoice.quantity} pcs</td>
                      <td className="p-2 text-right font-mono">${(printingInvoice.amount / printingInvoice.quantity).toFixed(2)}</td>
                      <td className="p-2 text-right font-mono font-bold">${printingInvoice.amount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Calculs des Totaux */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <div className="w-1/2 divide-y divide-gray-100 text-xs bg-gray-50 p-4 rounded-xl space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Sous-total net</span>
                    <span className="font-mono font-semibold">${printingInvoice.amount.toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between font-bold text-violet-700 border-t border-gray-200 pt-2 mt-2">
                    <span>Total Général Net</span>
                    <span className="font-mono text-sm">${printingInvoice.amount.toLocaleString()} USD</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 flex justify-between text-xs text-gray-450 border-t border-dashed border-gray-250">
                <div>
                  <p className="font-bold text-[10px] uppercase text-gray-500">Pour Client (Bon pour accord)</p>
                  <div className="h-10"></div>
                  <p className="border-t border-gray-150 pt-1">Signature autorisée</p>
                </div>
                <div>
                  <p className="font-bold text-[10px] uppercase text-gray-500">Pour ALVIN AGRO-INDUSTRIEL SARL</p>
                  <div className="h-10"></div>
                  <p className="border-t border-gray-150 pt-1">Service Facturation & Caisse</p>
                </div>
              </div>

              <div className="text-center text-[10px] text-gray-400 font-mono italic pt-4">
                Grand-Livre certifié par Arnold Menemene pour Alvin Agro-industriel SARL.
              </div>
            </div>

            {/* Barre d'Actions Inferieure - Toujours accessible au bas de la visionneuse de document (corrige le probleme de defilement) */}
            <div className="bg-neutral-55 dark:bg-neutral-900 px-6 py-4 flex justify-end items-center gap-3 border-t border-slate-200 dark:border-neutral-800 rounded-b-2xl no-print">
              <button
                onClick={() => setPrintingInvoice(null)}
                className="px-4 py-2 hover:bg-slate-200 bg-slate-100 dark:hover:bg-neutral-800 dark:bg-neutral-850 text-slate-700 dark:text-neutral-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Fermer
              </button>
              <button
                onClick={() => downloadHtmlDocument("printable-client-invoice", `facture_${printingInvoice.id}.html`, `Facture - ${printingInvoice.client}`)}
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
