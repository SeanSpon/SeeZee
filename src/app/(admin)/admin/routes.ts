// src/app/(admin)/admin/routes.ts
export type AdminRoute = { 
  href: string; 
  label: string; 
  icon: string; 
  ceoOnly?: boolean;
};

export const ADMIN_ROUTES: AdminRoute[] = [
  { href: "/admin/overview", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/admin/feed",      label: "Feed",      icon: "MessageSquare" },
  { href: "/admin/leads",     label: "Leads",     icon: "Users" },
  { href: "/admin/projects",  label: "Projects",  icon: "FolderOpen" },
  { href: "/admin/invoices",  label: "Invoices",  icon: "Receipt" },
  { href: "/admin/team",      label: "Team",      icon: "UsersRound" },
  { href: "/admin/tasks",     label: "Tasks",     icon: "ListChecks" },
  { href: "/admin/training",  label: "Training",  icon: "GraduationCap" },
  { href: "/admin/tools",     label: "Tools",     icon: "Wrench" },
  { href: "/admin/links",     label: "Links",     icon: "Link2" },
  { href: "/admin/database",  label: "Database",  icon: "Database" },
  { href: "/admin/settings",  label: "Settings",  icon: "Settings" },
];

// CEO-only routes (only visible to seanspm1007@gmail.com)
export const CEO_ROUTES: AdminRoute[] = [
  { href: "/admin/analytics",  label: "Analytics",  icon: "BarChart3", ceoOnly: true },
  { href: "/admin/finances",   label: "Finances",   icon: "Wallet", ceoOnly: true },
  { href: "/admin/systems",    label: "Systems",    icon: "Server", ceoOnly: true },
];