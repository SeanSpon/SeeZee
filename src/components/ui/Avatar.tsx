"use client";

import Image from "next/image";
import { useState } from "react";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
  fallbackText?: string;
}

export default function Avatar({ 
  src, 
  alt = "User", 
  size = 40, 
  className = "",
  fallbackText
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // If no src or error occurred, show fallback
  const shouldShowFallback = !src || imageError || typeof src !== "string";

  // For known safe hosts (whitelisted in next.config.js), use next/image
  const isKnownSafeHost = src && (
    src.includes('lh3.googleusercontent.com') ||
    src.includes('lh4.googleusercontent.com') ||
    src.includes('lh5.googleusercontent.com') ||
    src.includes('lh6.googleusercontent.com') ||
    src.includes('avatars.githubusercontent.com') ||
    src.includes('res.cloudinary.com') ||
    src.startsWith('/') // Local images
  );

  const baseClasses = `rounded-full object-cover ${className}`;

  if (shouldShowFallback) {
    return (
      <div 
        className={`${baseClasses} bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold`}
        style={{ width: size, height: size }}
      >
        {fallbackText ? (
          <span style={{ fontSize: size * 0.4 }}>
            {fallbackText.substring(0, 2).toUpperCase()}
          </span>
        ) : (
          <svg 
            width={size * 0.6} 
            height={size * 0.6} 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <circle 
              cx="12" 
              cy="7" 
              r="4" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    );
  }

  // For known safe hosts, use optimized next/image
  if (isKnownSafeHost) {
    return (
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={baseClasses}
        onError={() => setImageError(true)}
        onLoad={() => setIsLoading(false)}
        priority={size > 100} // Only prioritize larger avatars
      />
    );
  }

  // For unknown hosts, use regular img to avoid next/image constraints
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={baseClasses}
      onError={() => setImageError(true)}
      onLoad={() => setIsLoading(false)}
    />
  );
}