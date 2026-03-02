import React from 'react';

export const CipherLogo = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`cipher-logo ${className}`}
  >
    {/* Base Database Cylinder */}
    <path d="M16 26C22.6274 26 28 24.2091 28 22V10C28 12.2091 22.6274 14 16 14C9.37258 14 4 12.2091 4 10V22C4 24.2091 9.37258 26 16 26Z" fill="url(#paint0_linear)"/>
    
    {/* Middle Ring */}
    <path d="M28 16C28 18.2091 22.6274 20 16 20C9.37258 20 4 18.2091 4 16" stroke="url(#paint1_linear)" strokeWidth="1.5"/>
    
    {/* Top Ellipse */}
    <ellipse cx="16" cy="10" rx="12" ry="4" fill="url(#paint2_linear)"/>
    
    {/* Code Brackets overlay */}
    <path d="M11 18L14 21L11 24" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 18L18 21L21 24" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>

    <defs>
      <linearGradient id="paint0_linear" x1="16" y1="10" x2="16" y2="26" gradientUnits="userSpaceOnUse">
        <stop stopColor="#58a6ff"/>
        <stop offset="1" stopColor="#1f6feb"/>
      </linearGradient>
      <linearGradient id="paint1_linear" x1="4" y1="18" x2="28" y2="18" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3fb950"/>
        <stop offset="1" stopColor="#2ea043"/>
      </linearGradient>
      <linearGradient id="paint2_linear" x1="4" y1="10" x2="28" y2="10" gradientUnits="userSpaceOnUse">
        <stop stopColor="#79c0ff"/>
        <stop offset="1" stopColor="#388bfd"/>
      </linearGradient>
    </defs>
  </svg>
);

export default CipherLogo;
