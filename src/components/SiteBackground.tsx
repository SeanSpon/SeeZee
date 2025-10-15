"use client";

/**
 * SiteBackground - Reusable background component matching the landing page
 * 
 * This component provides the exact same background used across the site:
 * - Main gradient from layout.tsx
 * - Particle layer (rendered via ClientAnimations in layout)
 * - Vignette overlay
 * - Noise texture
 * 
 * Note: Particles are rendered globally in layout.tsx via #particles div
 * This component just provides the gradient/vignette/noise layers
 */
export default function SiteBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Main gradient - exact copy from layout.tsx body tag */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      
      {/* Vignette overlay - darkens edges */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_70%,rgba(0,0,0,0.3)_100%)]"
        aria-hidden="true"
      />
      
      {/* Noise texture overlay - subtle film grain */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')"
        }}
        aria-hidden="true"
      />
      
      {/* Particles are rendered globally via #particles div in layout.tsx */}
      {/* They sit at z-0, this component sits at -z-10, content at z-10 */}
    </div>
  );
}
