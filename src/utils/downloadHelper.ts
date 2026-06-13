/**
 * Utilitaire pour télécharger n'importe quel contenu DOM sous forme de page HTML autonome, stylisée et imprimable hors ligne.
 * Il s'agit d'une alternative robuste lorsque l'appel standard window.print() est restreint dans les iframes du bac à sable.
 */
export function downloadHtmlDocument(elementId: string, fileName: string, title: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  // Cloner ou extraire le contenu, mais retirer les nœuds internes exclus de l'impression (no-print) pour une pureté absolue
  const contentClone = element.cloneNode(true) as HTMLElement;
  const noPrintElements = contentClone.querySelectorAll('.no-print');
  noPrintElements.forEach(el => el.remove());

  // Préparer une enveloppe de présentation avec tailwind et une typographie de haute qualité
  const htmlContent = `<!DOCTYPE html>
<html lang="fr" class="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
    }
    @media print {
      body {
        background-color: white;
      }
      .offline-banner {
        display: none !important;
      }
    }
  </style>
</head>
<body class="p-0 m-0 min-h-screen flex flex-col items-center justify-start">

  <!-- En-tête d'action interactif pour le fichier autonome -->
  <div class="w-full bg-slate-900 text-white py-3 px-6 flex justify-between items-center shadow-md no-print offline-banner">
    <div class="flex items-center gap-2">
      <span class="text-xs font-semibold px-2 py-0.5 bg-violet-600 rounded text-violet-100 uppercase tracking-wider">Alvin Agent AI</span>
      <h1 class="text-xs font-bold text-slate-300">${title} (Fichier Officiel Exporté)</h1>
    </div>
    <div class="flex gap-2">
      <button onclick="window.print()" class="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow">
        🖨️ Imprimer / Enregistrer PDF
      </button>
      <button onclick="window.close()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition">
        Fermer l'onglet
      </button>
    </div>
  </div>

  <!-- Zone d'affichage du document -->
  <div class="w-full max-w-2xl bg-white p-8 md:p-12 my-6 md:my-10 rounded-2xl border border-slate-200 shadow-xl overflow-hidden select-text font-sans text-xs sm:text-sm">
    ${contentClone.innerHTML}
  </div>

  <script>
    // Déclencher automatiquement la boîte de dialogue d'impression du navigateur pour plus de commodité
    window.addEventListener('load', () => {
      // Léger délai d'attente pour permettre le rendu du CSS et des polices
      setTimeout(() => {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>`;

  // Soumettre via un formulaire POST masqué pour contourner les bloqueurs de téléchargement d'iframe du bac à sable
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "/api/download";
  form.style.display = "none";

  const htmlInput = document.createElement("input");
  htmlInput.type = "hidden";
  htmlInput.name = "html";
  htmlInput.value = htmlContent;
  form.appendChild(htmlInput);

  const filenameInput = document.createElement("input");
  filenameInput.type = "hidden";
  filenameInput.name = "filename";
  filenameInput.value = fileName;
  form.appendChild(filenameInput);

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
