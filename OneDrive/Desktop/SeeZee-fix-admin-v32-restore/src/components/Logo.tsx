import React from 'react';

// Minimal "SZ" Logo - perfect for navbar/favicon
export function LogoMinimal({ className = "", size = 40 }: { className?: string; size?: number }) {
  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <text
          x="100"
          y="130"
          fontFamily="Arial, sans-serif"
          fontSize="120"
          fontWeight="900"
          fill="white"
          textAnchor="middle"
          filter="url(#glow)"
        >
          SZ
        </text>
      </svg>
    </div>
  );
}

// Full logo
export function LogoFull({ className = "", width = 300 }: { className?: string; width?: number }) {
  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width }}
    >
      <svg 
        viewBox="0 0 400 300" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        <defs>
          <filter id="glow-full">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <text
          x="200"
          y="90"
          fontFamily="Arial, sans-serif"
          fontSize="70"
          fontWeight="900"
          fill="white"
          textAnchor="middle"
          letterSpacing="8"
          filter="url(#glow-full)"
        >
          SEE
        </text>
        
        <rect
          x="90"
          y="110"
          width="220"
          height="50"
          rx="25"
          fill="white"
          filter="url(#glow-full)"
        />
        <text
          x="200"
          y="145"
          fontFamily="Arial, sans-serif"
          fontSize="32"
          fontWeight="900"
          fill="black"
          textAnchor="middle"
          letterSpacing="6"
        >
          STUDIO
        </text>
        
        <text
          x="200"
          y="230"
          fontFamily="Arial, sans-serif"
          fontSize="70"
          fontWeight="900"
          fill="white"
          textAnchor="middle"
          letterSpacing="8"
          filter="url(#glow-full)"
        >
          ZEE
        </text>
      </svg>
    </div>
  );
}
