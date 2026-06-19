export interface AttendanceRecord {
  date: string;
  status: "Présent" | "Absent";
}

export interface SalaryRecord {
  date: string;
  amount: number;
  status: "Payé" | "En Attente" | "Retenu";
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  salary: string;
  status: "Présent" | "En Mission" | "Congé" | "Absent";
  photo: string;
  salaryHistory: SalaryRecord[];
  attendance: string[]; // dates de présence
}

export interface RawMaterialStock {
  id: string;
  name: string;
  tonnage: number;
  unit: string;
}

export interface FinishedProductStock {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface ConsumableStock {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  threshold: number; // seuil d'alerte de niveau critique
}

export interface Stocks {
  rawMaterials: RawMaterialStock[];
  finishedProducts: FinishedProductStock[];
  consumables: ConsumableStock[];
}

export interface ProductionRates {
  cornProcessingRate: number; // sacs vides consommes/remplis par jour
  soyProcessingRate: number; // bouteilles consommees/remplies par jour
  notes: string;
}

export interface MaintenanceRecord {
  date: string;
  type: "Régulière" | "Corrective" | "Urgente";
  cost: number;
  description: string;
}

export interface Machine {
  id: string;
  name: string;
  category: "Agricole" | "Transformation Usine" | "Logistique" | "Autre";
  hours: number;
  status: "Opérationnel" | "En Maintenance" | "En Panne";
  photo: string;
  maintenanceHistory: MaintenanceRecord[];
}

export interface SalesInvoice {
  id: string;
  client: string;
  product: string;
  quantity: number;
  amount: number; // en USD
  date: string;
  status: "Payé" | "En Attente" | "Annulé";
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  product: string;
  quantity: number;
  amount: number;
  date: string;
  status: "Planifié" | "En Cours" | "Livré" | "Annulé";
  deliveryDate: string;
}

export interface CommercialData {
  sales: SalesInvoice[];
  purchases: PurchaseOrder[];
}

export interface Client {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  registeredDate: string;
  category: "Grossiste" | "Supermarché" | "Boulangerie" | "Distributeur" | "Autre";
}

export interface UserAccount {
  email: string;
  password?: string;
  role: "admin" | "stocks" | "technical" | "commercial" | "manager";
  name: string;
}

export interface StockAlert {
  id: string;
  timestamp: string;
  product: string;
  currentLevel: number;
  threshold: number;
  text: string;
  status: "read" | "unread";
}

export interface ChatMessage {
  sender: "user" | "alvin";
  text: string;
  timestamp: string;
}

export interface DatabaseState {
  employees: Employee[];
  stocks: Stocks;
  productionRates: ProductionRates;
  machinery: Machine[];
  commercial: CommercialData;
  users?: UserAccount[];
  alerts?: StockAlert[];
  clients?: Client[];
  chatHistory?: ChatMessage[];
}
