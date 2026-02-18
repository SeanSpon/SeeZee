import {
  FiHome,
  FiTrendingUp,
  FiUsers,
  FiFolder,
  FiCheckSquare,
  FiFileText,
  FiBook,
  FiLink,
  FiLayers,
  FiActivity,
  FiDollarSign,
  FiCalendar,
  FiStar,
  FiTool,
  FiDatabase,
  FiBarChart2,
  FiCreditCard,
  FiServer,
  FiUsers as FiTeamUsers,
  FiBookOpen,
  FiGitBranch,
  FiMic,
  FiPieChart,
  FiSettings,
  FiTarget,
  FiSend,
  FiGlobe,
  FiMessageSquare,
  FiBookmark,
  FiCpu,
  FiInbox,
  FiShield,
  FiMap,
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
  ceoOnly?: boolean;
  folderColor: string;
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "core",
    title: "Core",
    icon: FiHome,
    folderColor: "#ef4444",
    items: [
      { href: "/admin", label: "Dashboard", icon: FiHome, description: "Overview and quick stats" },
      { href: "/admin/projects", label: "Projects", icon: FiFolder, description: "Active work and deliverables" },
      { href: "/admin/clients", label: "Clients", icon: FiUsers, description: "Manage client relationships" },
    ],
  },
  {
    id: "work",
    title: "Work",
    icon: FiCheckSquare,
    folderColor: "#3b82f6",
    items: [
      { href: "/admin/todos", label: "My Todos", icon: FiTarget, description: "Personal task queue" },
      { href: "/admin/tasks", label: "Tasks", icon: FiCheckSquare, description: "Work items and assignments" },
      { href: "/admin/client-tasks", label: "Client Tasks", icon: FiTarget, description: "Client deliverables" },
      { href: "/admin/calendar", label: "Calendar", icon: FiCalendar, description: "Schedule overview" },
      { href: "/admin/feed", label: "Activity Feed", icon: FiActivity, description: "Recent activity" },
    ],
  },
  {
    id: "pipeline",
    title: "Pipeline",
    icon: FiTrendingUp,
    folderColor: "#8b5cf6",
    items: [
      { href: "/admin/project-requests", label: "Project Requests", icon: FiInbox, description: "Incoming client requests" },
      { href: "/admin/pipeline", label: "Pipeline Board", icon: FiTrendingUp, description: "Visual deal flow" },
      { href: "/admin/blog", label: "Blog", icon: FiBookmark, description: "Content management" },
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
    id: "team",
    title: "Team",
    icon: FiTeamUsers,
    folderColor: "#f59e0b",
    items: [
      { href: "/admin/team", label: "Team", icon: FiTeamUsers, description: "Team members" },
      { href: "/admin/goals", label: "Goals", icon: FiTarget, description: "OKRs and targets" },
      { href: "/admin/learning", label: "Learning", icon: FiBookOpen, description: "Training resources" },
    ],
  },
  {
    id: "ceo",
    title: "CEO",
    icon: FiStar,
    folderColor: "#eab308",
    ceoOnly: true,
    items: [
      { href: "/admin/command-center", label: "Hub", icon: FiLayers, description: "All-in-one access hub" },
      { href: "/admin/ceo", label: "Overview", icon: FiStar, description: "Executive overview" },
      { href: "/admin/ceo/analytics", label: "Analytics", icon: FiBarChart2, description: "Deep metrics" },
      { href: "/admin/ceo/finances", label: "Finances", icon: FiDollarSign, description: "Financial deep dive" },
      { href: "/admin/ceo/tasks", label: "Tasks", icon: FiCheckSquare, description: "Task management" },
      { href: "/admin/ceo/team-management", label: "Team Mgmt", icon: FiTeamUsers, description: "Team oversight" },
      { href: "/admin/ceo/systems", label: "Systems", icon: FiServer, description: "System health" },
      { href: "/admin/learning", label: "Learning Hub", icon: FiBookOpen, description: "Unified training & tools" },
      { href: "/admin/ceo/vault", label: "Armory", icon: FiShield, description: "API keys & secrets" },
    ],
  },
  {
    id: "system",
    title: "System",
    icon: FiSettings,
    folderColor: "#64748b",
    items: [
      { href: "/settings", label: "Settings", icon: FiSettings, description: "App configuration" },
      { href: "/admin/database", label: "Database", icon: FiDatabase, description: "Data management" },
      { href: "/admin/analytics", label: "Analytics", icon: FiPieChart, description: "Metrics dashboard" },
      { href: "/admin/recordings", label: "Recordings", icon: FiMic, description: "Meeting recordings" },
      { href: "/admin/chat", label: "AI Chat Log", icon: FiMessageSquare, description: "Conversation history" },
      { href: "/admin/links", label: "Links", icon: FiLink, description: "Resource links" },
      { href: "/admin/resources", label: "Resources", icon: FiHardDrive, description: "Google Drive documents" },
      { href: "/admin/git", label: "Git", icon: FiGitBranch, description: "Git repository management" },
    ],
  },
];

export function getVisibleGroups(isCEO: boolean): NavGroup[] {
  return NAV_GROUPS.filter((group) => !group.ceoOnly || isCEO);
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
