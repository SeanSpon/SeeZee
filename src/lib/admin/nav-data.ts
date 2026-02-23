import {
  FiHome,
  FiUsers,
  FiFolder,
  FiDollarSign,
  FiDatabase,
  FiCreditCard,
  FiServer,
  FiGitBranch,
  FiMic,
  FiPieChart,
  FiSettings,
  FiMessageSquare,
  FiLink,
  FiHardDrive,
} from "react-icons/fi";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  description?: string;
}

export interface NavGroup {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  items: NavItem[];
  folderColor: string;
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "command",
    title: "Command",
    icon: FiHome,
    folderColor: "#ef4444",
    items: [
      { href: "/admin", label: "Command", icon: FiHome, description: "Overview and quick stats" },
    ],
  },
  {
    id: "projects",
    title: "Projects",
    icon: FiFolder,
    folderColor: "#3b82f6",
    items: [
      { href: "/admin/projects", label: "Projects", icon: FiFolder, description: "Active work and deliverables" },
    ],
  },
  {
    id: "clients",
    title: "Clients",
    icon: FiUsers,
    folderColor: "#8b5cf6",
    items: [
      { href: "/admin/clients", label: "Clients", icon: FiUsers, description: "Manage client relationships" },
    ],
  },
  {
    id: "finance",
    title: "Finance",
    icon: FiDollarSign,
    folderColor: "#10b981",
    items: [
      { href: "/admin/finance", label: "Overview", icon: FiDollarSign, description: "Revenue and profit metrics" },
      { href: "/admin/finance/transactions", label: "Transactions", icon: FiCreditCard, description: "Invoices and payments" },
      { href: "/admin/finance/expenses", label: "Expenses", icon: FiPieChart, description: "Cost tracking" },
      { href: "/admin/service-plans", label: "Service Plans", icon: FiServer, description: "Plans, hours, and requests" },
    ],
  },
  {
    id: "system",
    title: "System",
    icon: FiSettings,
    folderColor: "#64748b",
    items: [
      { href: "/admin/chat", label: "AI Chat Log", icon: FiMessageSquare, description: "Conversation history" },
      { href: "/admin/database", label: "Database", icon: FiDatabase, description: "Data management" },
      { href: "/admin/git", label: "Git", icon: FiGitBranch, description: "Git repository management" },
      { href: "/admin/analytics", label: "Analytics", icon: FiPieChart, description: "Metrics dashboard" },
      { href: "/settings", label: "Settings", icon: FiSettings, description: "App configuration" },
      { href: "/admin/links", label: "Links", icon: FiLink, description: "Resource links" },
      { href: "/admin/resources", label: "Resources", icon: FiHardDrive, description: "Google Drive documents" },
      { href: "/admin/recordings", label: "Recordings", icon: FiMic, description: "Meeting recordings" },
    ],
  },
];

export function getVisibleGroups(): NavGroup[] {
  return NAV_GROUPS;
}

export function findGroupForPath(pathname: string): NavGroup | undefined {
  return NAV_GROUPS.find((group) =>
    group.items.some((item) => {
      if (item.href === "/admin") return pathname === "/admin";
      return pathname.startsWith(item.href);
    })
  );
}

export function findNavItemForPath(pathname: string): { group: NavGroup; item: NavItem } | undefined {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (item.href === "/admin") {
        if (pathname === "/admin") return { group, item };
      } else if (pathname.startsWith(item.href)) {
        return { group, item };
      }
    }
  }
  return undefined;
}
