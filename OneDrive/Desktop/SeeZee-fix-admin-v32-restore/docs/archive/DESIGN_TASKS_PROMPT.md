# 🎨 SeeZee Design Tasks - GPT Agent Instructions

## Context
You're designing components for **SeeZee Studio** - a modern web agency platform with a dark glass morphism aesthetic. The app uses Next.js 15, TypeScript, Tailwind CSS, and Framer Motion for animations.

## 🎨 Design System
- **Color Palette**: Dark backgrounds with cyan/blue accents (#6EE7FF, #00D9FF)
- **Glass Morphism**: `bg-white/5 backdrop-blur-xl border border-white/10`
- **Typography**: Clean, modern sans-serif (default system fonts)
- **Animations**: Smooth Framer Motion transitions, hover states, fade-ins
- **Spacing**: Generous padding, breathing room between elements
- **Icons**: Lucide React icons throughout

## 📋 Pages/Components That Need Design

### 1. **Executive Analytics Dashboard** ⭐ HIGH PRIORITY
**Location**: `src/app/admin/executive/analytics/page.tsx`
**Current State**: Has placeholder charts saying "Chart component coming soon"
**What to Design**:
- Revenue over time chart (line or area chart)
- Project status breakdown (pie/donut chart)  
- Monthly comparison chart (bar chart)
- Client acquisition funnel visualization
**Tech Stack**: Use Recharts library (already in project)
**Example Data**: Mock realistic agency data (revenue $5k-15k/month, 20-40 projects, 15-35 clients)

### 2. **Executive Finances Dashboard** ⭐ HIGH PRIORITY
**Location**: `src/app/admin/executive/finances/page.tsx`
**Current State**: Has placeholder saying "Financial charts coming soon"
**What to Design**:
- Revenue vs Expenses chart
- Cash flow timeline
- Invoice status breakdown (paid, pending, overdue)
- Payment method distribution
- Monthly recurring revenue (MRR) trend
**Data**: Mock financial data with realistic agency numbers

### 3. **Database Browser** ⭐ MEDIUM PRIORITY
**Location**: `src/components/admin/DatabaseClient.tsx`
**Current State**: Says "Database browser functionality coming soon"
**What to Design**:
- Table view with sortable columns
- Pagination controls
- Search/filter functionality
- Row selection and actions
- Data type indicators (string, number, date, boolean)
**Style**: Admin table with dark glass morphism aesthetic

### 4. **Client Dashboard - Empty States** 🎯 MEDIUM PRIORITY
**Location**: `src/app/(client)/client/**`
**What to Design**:
- Empty state for "No Projects Yet" with call-to-action
- Empty state for "No Invoices" 
- Empty state for "No Files Uploaded"
- Empty state for "No Messages"
**Style**: Friendly illustrations or icons, encouraging copy, clear CTAs

### 5. **Activity Feed Real-time Updates** 🎯 LOW PRIORITY
**Location**: `src/components/admin/ActivityFeed.tsx`
**What to Add**:
- Real-time pulse animation for new activities
- Filter by activity type (leads, projects, tasks, etc.)
- Mark all as read functionality
- Better timestamp formatting (e.g., "2 minutes ago")

### 6. **Homepage Hero Enhancement** 💎 ENHANCEMENT
**Location**: `src/app/(public)/page.tsx`
**What to Add**:
- Animated gradient background
- Floating 3D elements or particles
- Typing animation for headline
- Scroll indicator arrow
- Better CTA button animations

### 7. **Services Page** 💎 ENHANCEMENT
**Location**: `src/app/services/page.tsx`
**What to Add**:
- Service comparison table
- Interactive pricing calculator
- Before/After project showcases
- Technology stack icons/logos
- Process timeline visualization

### 8. **Loading States** ⚡ POLISH
**Locations**: Throughout the app
**What to Design**:
- Skeleton loaders for cards, tables, lists
- Spinner animations
- Progress bars for multi-step forms
- Shimmer effects for loading content

### 9. **Error States** ⚡ POLISH
**What to Design**:
- 404 page with fun illustration
- 500 error page
- Form validation error states
- Network error toast notifications
- Permission denied screens

### 10. **Onboarding Flow Polish** ⚡ POLISH
**Location**: `src/app/onboarding/**`
**What to Add**:
- Progress indicator dots
- Step transition animations
- Confetti on completion
- Welcome message personalization

## 🛠️ Technical Requirements

### Component Structure
```tsx
// Use this pattern for all new components
'use client';

import { motion } from 'framer-motion';
import { Icon } from 'lucide-react';

export function MyComponent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
    >
      {/* Content */}
    </motion.div>
  );
}
```

### Styling Guidelines
- Use Tailwind CSS utility classes
- Follow the existing glass morphism pattern
- Maintain consistent spacing (4, 6, 8, 12, 16, 20, 24)
- Use `text-white` for primary text, `text-white/60` or `text-slate-400` for secondary
- Hover states: `hover:bg-white/10 transition-all duration-200`

### Charts (Recharts)
```tsx
import { 
  LineChart, Line, AreaChart, Area, 
  BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Use cyan/blue theme
const COLORS = ['#6EE7FF', '#00D9FF', '#0EA5E9', '#3B82F6'];
```

### Icons
```tsx
import { 
  TrendingUp, DollarSign, Users, Activity,
  BarChart3, Calendar, Check, X 
} from 'lucide-react';
```

## 📦 Priority Order
1. **Executive Analytics** - Most visible to stakeholders
2. **Executive Finances** - Critical business metrics
3. **Database Browser** - Admin functionality
4. **Empty States** - Better UX
5. **Loading/Error States** - Polish
6. **Enhancements** - Nice-to-haves

## 🎯 Success Criteria
- Matches existing dark glass morphism aesthetic
- Smooth animations (60fps)
- Responsive on mobile/tablet/desktop
- Accessible (keyboard navigation, screen readers)
- Fast loading (optimized images, lazy loading)

## 📝 Notes
- All data should be realistic but clearly mock/demo data
- Add comments in code for future developers
- Follow existing file structure and naming conventions
- Test in both light/dark OS preferences (app is dark-only currently)

---

**Ready to design?** Start with #1 (Executive Analytics) and work your way down! 🚀
