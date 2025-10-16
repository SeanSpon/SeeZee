"use client";

export default function Background() {
  return (
    <div className="bg-layer">
      {/* Subtle top radial glow - cyan/blue accent */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 1200px 600px at 50% -200px, rgba(59, 130, 246, 0.15), transparent 50%)',
        }}
      />
      
      {/* Faint grid pattern */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #1e3a8a 1px, transparent 1px), linear-gradient(to bottom, #1e3a8a 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}
