import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import dns from "dns";

// Forcer Node.js à préférer IPv4 lors de la résolution DNS (corrige l'erreur TypeError: fetch failed en local)
dns.setDefaultResultOrder("ipv4first");

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

const DB_PATH = path.join(process.cwd(), "src/database.json");

// Initialiser Supabase. Revenir de maniere transparente au stockage sur fichier local si les identifiants ne sont pas encore configures.
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

let supabase: any = null;
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("[Alvin Supabase] Client initialisé avec succès !");
  } catch (error) {
    console.error("[Alvin Supabase] Échec de l'initialisation du client Supabase :", error);
  }
} else {
  console.log("[Alvin Supabase] Clés manquantes dans l'environnement. Mode de repli sur fichier local 'src/database.json' activé.");
}

// Fonction d'assistance pour verifier que la base de donnees existe et est lisible
function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      // Creer le dossier racine s'il n'existe pas
      const dirOfDB = path.dirname(DB_PATH);
      if (!fs.existsSync(dirOfDB)) {
        fs.mkdirSync(dirOfDB, { recursive: true });
      }
      return null;
    }
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading database file:", e);
    return null;
  }
}

function writeDB(data: any) {
  try {
    const dirOfDB = path.dirname(DB_PATH);
    if (!fs.existsSync(dirOfDB)) {
      fs.mkdirSync(dirOfDB, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("Error writing database file:", e);
    return false;
  }
}

// ----------------------------------------------------
// ROUTES DE L'API
// ----------------------------------------------------

// Permet le telechargement de documents demande par le client, en contournant les restrictions de l'iframe du bac a sable
app.post("/api/download", express.urlencoded({ extended: true, limit: "15mb" }), (req, res) => {
  const { html, filename } = req.body;
  if (!html || !filename) {
    return res.status(400).send("Paramètres manquants (html, filename).");
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(html);
});

// Obtenir l'instante de l'ensemble de l'ERP en temps reel depuis Supabase, avec repli sur le fichier local
app.get("/api/database", async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("alvin_agro_erp")
        .select("state")
        .eq("id", 1)
        .single();

      if (error) {
        // La table ou l'enregistrement n'existe pas encore, nous l'initialisons automatiquement avec le fichier local
        if (error.code === "PGRST116" || error.message?.includes("relation") || error.message?.includes("does not exist")) {
          console.log("[Alvin Supabase] Snapshot non trouvé ou table non configurée. Tentative d'auto-création...");
          const localData = readDB();
          if (localData) {
            await supabase.from("alvin_agro_erp").upsert({ id: 1, state: localData, updated_at: new Date() }).select();
          }
          return res.json(localData);
        }
        throw error;
      }
      if (data && data.state) {
        return res.json(data.state);
      }
    } catch (e: any) {
      console.warn("[Alvin Supabase] Erreur lecture Supabase, repli sur local :", e.message || e);
    }
  }

  // Repli de secours
  const data = readDB();
  if (!data) {
    return res.status(500).json({ error: "Failed to load database state." });
  }
  res.json(data);
});

// Mettre a jour l'instante de la base de donnees dans Supabase et ecrire en local comme double sauvegarde
async function syncRelationalTables(supabaseClient: any, state: any) {
  if (!supabaseClient || !state) return;
  console.log("[Alvin Sync] Début de la synchronisation relationnelle vers Supabase...");
  try {
    // 1. Synchronisation des Employes
    if (Array.isArray(state.employees)) {
      for (const emp of state.employees) {
        await supabaseClient.from("employees").upsert({
          id: emp.id,
          name: emp.name,
          role: emp.role,
          email: emp.email,
          phone: emp.phone,
          salary: parseFloat(emp.salary) || 0,
          status: emp.status,
          photo_url: emp.photo,
          updated_at: new Date()
        });

        // Mise a jour ou insertion de l'historique des salaires
        if (Array.isArray(emp.salaryHistory)) {
          for (const s of emp.salaryHistory) {
            await supabaseClient.from("employee_salaries").upsert({
              employee_id: emp.id,
              payment_date: s.date,
              amount: s.amount,
              payment_status: s.status
            }, { onConflict: "employee_id,payment_date" });
          }
        }

        // Mise a jour ou insertion des presences
        if (Array.isArray(emp.attendance)) {
          for (const dateStr of emp.attendance) {
            await supabaseClient.from("employee_attendance").upsert({
              employee_id: emp.id,
              attendance_date: dateStr,
              status: "Présent"
            }, { onConflict: "employee_id,attendance_date" });
          }
        }
      }
    }

    // 2. Synchronisation du Parc de Machines
    if (Array.isArray(state.machinery)) {
      for (const m of state.machinery) {
        await supabaseClient.from("machinery").upsert({
          id: m.id,
          name: m.name,
          category: m.category,
          operating_hours: m.hours || 0,
          status: m.status,
          photo_url: m.photo,
          updated_at: new Date()
        });

        if (Array.isArray(m.maintenanceHistory)) {
          for (const maint of m.maintenanceHistory) {
            await supabaseClient.from("machinery_maintenance").upsert({
              machine_id: m.id,
              maintenance_date: maint.date,
              type: maint.type,
              cost: maint.cost || 0,
              description: maint.description
            }, { onConflict: "machine_id,maintenance_date,description" });
          }
        }
      }
    }

    // 3. Synchronisation des Stocks
    if (state.stocks) {
      if (Array.isArray(state.stocks.rawMaterials)) {
        for (const r of state.stocks.rawMaterials) {
          await supabaseClient.from("stocks_raw_materials").upsert({
            id: r.id,
            name: r.name,
            tonnage: r.tonnage || 0,
            unit: r.unit,
            updated_at: new Date()
          });
        }
      }

      if (Array.isArray(state.stocks.finishedProducts)) {
        for (const f of state.stocks.finishedProducts) {
          await supabaseClient.from("stocks_finished_products").upsert({
            id: f.id,
            name: f.name,
            quantity: f.quantity || 0,
            unit: f.unit,
            updated_at: new Date()
          });
        }
      }

      if (Array.isArray(state.stocks.consumables)) {
        for (const c of state.stocks.consumables) {
          await supabaseClient.from("stocks_consumables").upsert({
            id: c.id,
            name: c.name,
            quantity: c.quantity || 0,
            unit: c.unit,
            warning_threshold: c.threshold || 0,
            updated_at: new Date()
          });
        }
      }
    }

    // 4. Synchronisation des Ratios de Production
    if (state.productionRates) {
      const pr = state.productionRates;
      await supabaseClient.from("production_rates").upsert({
        rate_key: "cornProcessingRate",
        rate_value: pr.cornProcessingRate || 150,
        description: "Maïs d'Usine Farine",
        updated_at: new Date()
      });
      await supabaseClient.from("production_rates").upsert({
        rate_key: "soyProcessingRate",
        rate_value: pr.soyProcessingRate || 180,
        description: "Huile de Soja Usine",
        updated_at: new Date()
      });
    }

    // 5. Synchronisation Commerciale
    if (state.commercial) {
      if (Array.isArray(state.commercial.sales)) {
        for (const s of state.commercial.sales) {
          await supabaseClient.from("sales").upsert({
            id: s.id,
            client_name: s.client,
            product_name: s.product,
            quantity: s.quantity || 0,
            amount: s.amount || 0,
            sale_date: s.date,
            status: s.status
          });
        }
      }

      if (Array.isArray(state.commercial.purchases)) {
        for (const p of state.commercial.purchases) {
          await supabaseClient.from("purchases").upsert({
            id: p.id,
            supplier_name: p.supplier,
            product_name: p.product,
            quantity: p.quantity || 0,
            amount: p.amount || 0,
            purchase_date: p.date,
            status: p.status,
            delivery_date: p.deliveryDate
          });
        }
      }
    }

    // 6. Synchronisation des Alertes de Seuil
    if (Array.isArray(state.alerts)) {
      for (const a of state.alerts) {
        await supabaseClient.from("alerts").upsert({
          id: a.id,
          timestamp: a.timestamp,
          product_name: a.product,
          current_level: a.currentLevel || 0,
          seuil_level: a.threshold || 0,
          alert_text: a.text,
          status: a.status
        });
      }
    }

    // 7. Synchronisation des Comptes Utilisateurs
    if (Array.isArray(state.users)) {
      for (const u of state.users) {
        await supabaseClient.from("users").upsert({
          email: u.email.toLowerCase().trim(),
          password_hash: u.password,
          role: u.role,
          full_name: u.name,
          updated_at: new Date()
        });
      }
    }

    // 8. Synchronisation de l'Annuaire Clients
    if (Array.isArray(state.clients)) {
      try {
        for (const cl of state.clients) {
          await supabaseClient.from("clients").upsert({
            id: cl.id,
            name: cl.name,
            company_name: cl.companyName,
            email: cl.email,
            phone: cl.phone,
            address: cl.address,
            registered_date: cl.registeredDate,
            category: cl.category,
            updated_at: new Date()
          });
        }
      } catch (clErr) {
        console.log("[Alvin Sync] Table 'clients' non détectée ou non migrée. Skip.");
      }
    }
    console.log("[Alvin Sync] Synchronisation relationnelle effectuée avec succès !");
  } catch (error: any) {
    console.warn("[Alvin Sync Warning] Impossible d'effectuer la sync relationnelle fine (des tables individuelles manquent de migration) :", error.message || error);
  }
}

app.post(["/api/database/update", "/api/database"], async (req, res) => {
  const updatedData = req.body;
  if (!updatedData || typeof updatedData !== "object") {
    return res.status(400).json({ error: "Invalid database payload." });
  }

  // Ecrire la sauvegarde locale d'abord
  const successLocal = writeDB(updatedData);
  let successSupabase = false;

  if (supabase) {
    try {
      const { error } = await supabase
        .from("alvin_agro_erp")
        .upsert({ id: 1, state: updatedData, updated_at: new Date() });
      if (!error) {
        successSupabase = true;
        // Executer la synchronisation detaillee de la base de donnees relationnelle comme tache non bloquante
        syncRelationalTables(supabase, updatedData).catch(err => {
          console.error("[Alvin Sync Error] Erreur asynchrone lors de la sync relationnelle :", err);
        });
      } else {
        console.error("[Alvin Supabase] Erreur d'écriture :", error.message);
      }
    } catch (e: any) {
      console.error("[Alvin Supabase] Exception d'écriture :", e.message || e);
    }
  }

  if (successLocal || successSupabase) {
    res.json({ 
      message: "Database updated successfully.", 
      data: updatedData,
      supabaseSync: successSupabase,
      localBackup: successLocal
    });
  } else {
    res.status(500).json({ error: "Failed to write database snapshot." });
  }
});

// Point de terminaison de televersement pour les photos de profil des employes ou machines
app.post("/api/storage/upload", async (req, res) => {
  const { file, filename } = req.body;
  if (!file) {
    return res.status(400).json({ error: "No file content specified" });
  }

  if (supabase) {
    try {
      // Decoder le contenu de l'image en Base64
      const base64Clean = file.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Clean, "base64");
      
      const mimeMatch = file.match(/^data:(image\/\w+);base64,/);
      const contentType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      
      const bucketName = "alvin-agro-images";
      const cleanFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.]/g, "_")}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(cleanFilename, buffer, {
          contentType,
          upsert: true
        });

      if (error) {
        // Le dossier de stockage (bucket) peut ne pas exister, journalisons l'erreur et utilisons le repli
        console.warn("[Alvin Supabase Storage] Échec d'envoi. Bucket 'alvin-agro-images' inexistant ou erreur :", error.message);
        // Utiliser le repli en renvoyant l'URL base64 d'origine pour preserver le bon fonctionnement
        return res.json({ url: file });
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(cleanFilename);

      console.log("[Alvin Supabase Storage] Image téléversée avec succès :", publicUrlData.publicUrl);
      return res.json({ url: publicUrlData.publicUrl });
    } catch (e: any) {
      console.error("[Alvin Supabase Storage] Exception durant l'envoi :", e.message || e);
    }
  }

  // Repli dynamique pour renvoyer la valeur base64 originale afin d'eviter un blocage
  res.json({ url: file });
});

// Point de terminaison pour la discussion avec Gemini
app.post("/api/gemini/chat", async (req, res) => {
  const { message, customData } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  // Obtenir l'etat courant de la base de donnees pour l'injecter en tant que contexte
  const currentDB = customData || readDB() || {};

  // Resoudre la cle d'API. Controler d'abord l'environnement, puis utiliser la cle de secours
  const apiKey = process.env.GEMINI_API_KEY || "AIzaSyCuvlLvG5moLAD4_6LS18prScy47-xAECw";

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const systemInstructions = `Tu es Alvin Agent AI, l'expert conseiller et assistant stratégique d'une grande firme agricole à Lubumbashi, RDC.
Ton rôle est de scruter minutieusement le snapshot JSON de la base de données (que le serveur t'envoie automatiquement en contexte à chaque message) pour extraire de réelles conclusions d'affaires :
1. Calculer avec précision les dates critiques de rupture de stocks pour les emballages (Sacs d'emballage vides 25kg et Bouteilles plastiques vides 1L) en fonction des vitesses de production ("productionRates") et des commandes (achats) en transit :
   - Formule : Jours restant = Quantité restante / Consommation journalière.
   - Attention: Vérifie s'il y a des commandes "En Cours" et ajoute-les à la quantité totale dès leur date de livraison prévue.
   - Rends cela visuel avec des chiffres précis !
2. Repérer les machines "En Maintenance" ou en panne (ex: Broyeur Alvan Blanch BM12) ou ayant un grand nombre d'heures de fonctionnement et suggérer des actions techniques préventives claires.
3. Repérer les déséquilibres financiers (ex: Factures clients "En Attente" de paiement, dépenses importantes de consommables) et proposer aux gérants de Lubumbashi des conseils pratiques d'optimisation de trésorerie locale.
4. Parle avec une posture de haut conseiller exécutif : professionnelle, rigoureuse, ancrée dans la réalité économique de Lubumbashi (monnaie de transaction USD fréquente, logistique d'importation, pannes de courant locales, saisonnalité).
5. Réponds exclusivement en Français avec des tableaux, listes à puces soignées et des titres en gras, et propose une section finale claire intitulée "Résumé de la Réunion Stratégique" idéale pour l'impression en PDF.`;

    const completePrompt = `${systemInstructions}\n\n[SNAPSHOT TEMPS RÉEL (DATABASE)] :\n${JSON.stringify(
      currentDB,
      null,
      2
    )}\n\n[COMMANDE DU GÉRANT DE LUBUMBASHI] : ${message}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: completePrompt,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini server integration error:", error);
    res.status(500).json({
      error: "Impossible de joindre l'Agent Alvin. Détails de l'erreur interne.",
      details: error?.message || "Erreur de connexion",
    });
  }
});

// ----------------------------------------------------
// INTEGRATION DE VITE / SERVICE SPA
// ----------------------------------------------------

async function serveApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        host: '0.0.0.0'
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Alvin Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

serveApp().catch((err) => {
  console.error("Failed to bootstrap industrial fullstack server:", err);
});
