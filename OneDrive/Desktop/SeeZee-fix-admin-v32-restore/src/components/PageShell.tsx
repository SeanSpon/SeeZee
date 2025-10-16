import SiteBackground from "@/components/SiteBackground";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageShell - Shared page layout wrapper
 * 
 * Provides consistent stacking for all pages with proper navbar offset.
 * Use this wrapper for pricing, selection, dashboard, and other pages.
 * 
 * Note: Background (gradient, vignette, noise, particles) is handled globally 
 * in layout.tsx, so we don't duplicate it here.
 * 
 * Stacking order (from layout.tsx):
 * - Background gradient (body tag)
 * - Particles at z-0 (#particles div)
 * - Vignette at z-1
 * - Noise at z-2
 * - Navbar at z-100
 * - Content at z-10+ (this wrapper's children)
 * 
 * @example
 * ```tsx
 * export default function StartPage() {
 *   return (
 *     <PageShell>
 *       <section className="max-w-7xl mx-auto">...</section>
 *     </PageShell>
 *   );
 * }
 * ```
 */
export default function PageShell({ children, className = "" }: PageShellProps) {
  return (
    <main className={`min-h-screen pt-[var(--nav-h)] ${className}`}>
      {/* Background is already in layout.tsx, no need to duplicate */}
      {children}
    </main>
  );
}
