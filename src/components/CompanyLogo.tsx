import React from "react";

interface CompanyLogoProps {
  className?: string;
  size?: number | string;
}

export default function CompanyLogo({ className = "", size = "100%" }: CompanyLogoProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 500 500" 
      width={size} 
      height={size} 
      className={className}
    >
      {/* Arrière-plan transparent */}
      <rect width="100%" height="100%" fill="none"/>

      {/* Cercle Extérieur : Symbole de la distribution globale et de l'exportation en gros */}
      <circle cx="250" cy="250" r="220" fill="none" stroke="#8A4FFF" stroke-width="12" stroke-dasharray="15 10" opacity="0.8"/>

      {/* Structure Géométrique Centrale : L'Usine de Transformation */}
      <path d="M150 350 L150 220 L250 140 L350 220 L350 350 Z" fill="none" stroke="#8A4FFF" stroke-width="16" stroke-linejoin="round"/>
      
      {/* Les Lignes de Champs Agricoles (Production de matière première) */}
      <path d="M190 350 L220 250 M250 350 L250 230 M310 350 L280 250" fill="none" stroke="#A370FF" stroke-width="8" stroke-linecap="round"/>

      {/* Le Soleil / L'Essor de l'Entreprise */}
      <circle cx="250" cy="140" r="30" fill="#8A4FFF" opacity="0.2"/>
      <circle cx="250" cy="140" r="15" fill="#8A4FFF"/>

      {/* Éléments de feuille stylisée (Agro-industrie) */}
      <path d="M220 140 Q250 110 250 140 Q250 170 220 140" fill="#A370FF" opacity="0.5"/>
    </svg>
  );
}
