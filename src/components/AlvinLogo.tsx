import React from "react";

interface AlvinLogoProps {
  className?: string;
  size?: number | string;
}

export default function AlvinLogo({ className = "", size = "100%" }: AlvinLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
    >
      <rect width="100" height="100" fill="none" />

      <defs>
        <linearGradient id="alvinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A370FF" stopOpacity="1" />
          <stop offset="100%" stopColor="#8A4FFF" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="glowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8A4FFF" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#8A4FFF" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      <path
        d="M50 8 C35 8 18 18 10 35 Q5 50 10 65 C18 82 35 92 50 92 C65 92 82 82 90 65 Q95 50 90 35 C82 18 65 8 50 8 Z"
        fill="none"
        stroke="url(#alvinGrad)"
        strokeWidth="2.5"
        opacity="0.6"
      />

      <path
        d="M50 15 
           L50 15 
           C45 25 40 35 35 45 
           C30 55 25 65 20 75 
           M50 15 
           C55 25 60 35 65 45 
           C70 55 75 65 80 75 
           M30 55
           Q50 50 70 55
           M50 15
           C50 35 40 50 30 65
           C20 80 30 90 50 90
           C70 90 80 80 70 65
           C60 50 50 35 50 15 Z"
        fill="none"
        stroke="url(#alvinGrad)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="50" cy="15" r="4.5" fill="url(#alvinGrad)" />
      <circle cx="20" cy="75" r="3.5" fill="#A370FF" />
      <circle cx="80" cy="75" r="3.5" fill="#8A4FFF" />
      <circle cx="50" cy="90" r="2.5" fill="#8A4FFF" opacity="0.5" />

      <path
        d="M50 15 Q55 25 60 35"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />
      <circle cx="50" cy="15" r="1.5" fill="#FFFFFF" />
    </svg>
  );
}
