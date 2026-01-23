/**
 * SeeZee Design Tokens
 * 
 * Centralized design system values for consistent styling across the entire site.
 * Import and use these values instead of hardcoding colors, spacing, etc.
 */

// ============================================
// COLORS
// ============================================

export const colors = {
  // Primary brand colors
  brand: {
    red: '#ef4444',       // Primary CTA buttons, accents
    redHover: '#dc2626',  // Hover state for red
    redDark: '#b91c1c',   // Darker variant
  },
  
  // Background colors (dark theme)
  bg: {
    base: '#050914',      // Deepest background
    primary: '#0a1128',   // Primary sections
    secondary: '#0f172a', // Secondary sections (slightly lighter)
    elevated: '#1a2332',  // Cards, elevated surfaces
    card: '#1e293b',      // Card backgrounds
  },
  
  // Accent colors
  accent: {
    cyan: '#22d3ee',      // Highlights, featured items
    blue: '#3b82f6',      // Links, secondary actions
    emerald: '#10b981',   // Success states
    amber: '#f59e0b',     // Warnings
    purple: '#a855f7',    // Special highlights
  },
  
  // Text colors
  text: {
    primary: '#ffffff',   // Headings, important text
    secondary: '#e2e8f0', // Body text
    muted: '#94a3b8',     // Subdued text
    dim: '#64748b',       // Very subdued text
  },
  
  // Border colors
  border: {
    default: 'rgba(255, 255, 255, 0.1)',
    hover: 'rgba(255, 255, 255, 0.2)',
    accent: 'rgba(34, 211, 238, 0.3)',
  },
} as const;

// ============================================
// SPACING
// ============================================

export const spacing = {
  // Section padding (vertical)
  section: {
    sm: 'py-12 sm:py-16',
    md: 'py-16 sm:py-20',
    lg: 'py-20 sm:py-24',
    xl: 'py-24 sm:py-32',
  },
  
  // Container padding
  container: 'px-4 sm:px-6 lg:px-8',
  
  // Max widths
  maxWidth: {
    prose: 'max-w-3xl',
    content: 'max-w-4xl',
    section: 'max-w-5xl',
    wide: 'max-w-6xl',
    full: 'max-w-7xl',
  },
} as const;

// ============================================
// TYPOGRAPHY
// ============================================

export const typography = {
  // Heading sizes
  heading: {
    hero: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold',
    page: 'text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-heading font-bold',
    section: 'text-2xl sm:text-3xl md:text-4xl font-heading font-bold',
    card: 'text-xl font-heading font-semibold',
    small: 'text-lg font-heading font-semibold',
  },
  
  // Body text
  body: {
    large: 'text-lg sm:text-xl text-slate-300 leading-relaxed',
    default: 'text-base sm:text-lg text-slate-300 leading-relaxed',
    small: 'text-sm text-slate-400 leading-relaxed',
  },
  
  // Subtitle/description
  subtitle: 'text-xl sm:text-2xl text-slate-300 leading-relaxed',
} as const;

// ============================================
// COMPONENT STYLES
// ============================================

export const components = {
  // Button styles
  button: {
    base: 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    sizes: {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-3 text-base rounded-lg',
      lg: 'px-8 py-4 text-lg rounded-lg min-h-[48px]',
    },
    variants: {
      primary: 'bg-[#ef4444] text-white hover:bg-[#dc2626] shadow-lg focus:ring-red-500',
      secondary: 'bg-white/5 border-2 border-white/20 text-white hover:border-white hover:bg-white/10',
      outline: 'bg-transparent border-2 border-white/20 text-white hover:border-[#ef4444] hover:bg-[#ef4444]',
      ghost: 'bg-white/5 text-white hover:bg-white/10',
      white: 'bg-white text-[#ef4444] hover:bg-gray-100 shadow-lg',
    },
  },
  
  // Card styles
  card: {
    base: 'rounded-xl border transition-all duration-300',
    variants: {
      default: 'bg-white/5 border-white/10 hover:border-white/20',
      elevated: 'bg-[#1a2332]/50 border-white/10 hover:border-white/20 backdrop-blur-sm',
      glass: 'bg-white/5 backdrop-blur-md border-white/10 hover:border-white/20',
      featured: 'bg-white/5 border-2 border-[#22d3ee] shadow-lg',
    },
    padding: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
    hover: 'hover:shadow-xl hover:-translate-y-1',
  },
  
  // Section backgrounds
  section: {
    primary: 'bg-[#0a1128]',
    secondary: 'bg-[#0f172a]',
    elevated: 'bg-[#1a2332]',
    gradient: 'bg-gradient-to-b from-[#0a1128] via-[#0f172a] to-[#0a1128]',
    cta: 'bg-[#ef4444]',
  },
  
  // Badge/chip styles
  badge: {
    base: 'inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full',
    variants: {
      default: 'bg-white/5 border border-white/10 text-white',
      cyan: 'bg-[#22d3ee]/10 border border-[#22d3ee]/30 text-[#22d3ee]',
      blue: 'bg-blue-500/10 border border-blue-400/30 text-blue-300',
      green: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300',
      red: 'bg-red-500/10 border border-red-500/30 text-red-300',
    },
  },
  
  // List item with check
  listItem: 'flex items-start gap-3 text-slate-300',
  listIcon: 'w-5 h-5 text-[#22d3ee] flex-shrink-0 mt-0.5',
} as const;

// ============================================
// TAILWIND CLASS HELPERS
// ============================================

// Background classes using Tailwind
export const bgClasses = {
  base: 'bg-[#050914]',
  primary: 'bg-[#0a1128]',
  secondary: 'bg-[#0f172a]',
  elevated: 'bg-[#1a2332]',
  card: 'bg-[#1e293b]',
} as const;

// Text classes using Tailwind
export const textClasses = {
  primary: 'text-white',
  secondary: 'text-slate-300',
  muted: 'text-slate-400',
  dim: 'text-slate-500',
  accent: 'text-[#22d3ee]',
  brand: 'text-[#ef4444]',
} as const;

// Border classes
export const borderClasses = {
  default: 'border-white/10',
  hover: 'hover:border-white/20',
  accent: 'border-[#22d3ee]',
  brand: 'border-[#ef4444]',
} as const;

// Export all as a single design system object
export const designSystem = {
  colors,
  spacing,
  typography,
  components,
  bgClasses,
  textClasses,
  borderClasses,
} as const;

export default designSystem;
