import {
  FiHome,
  FiUsers,
  FiFolder,
  FiDollarSign,
  FiEdit,
  FiGitBranch,
  FiDatabase,
  FiMessageSquare,
  FiPieChart,
  FiSettings,
  FiMic,
  FiHardDrive,
  FiLink,
  FiInbox,
  FiCheckSquare,
  FiCalendar,
  FiClock,
  FiTool,
  FiFileText,
  FiCreditCard,
  FiBookOpen,
  FiTarget,
} from "react-icons/fi";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  description?: string;
}
export interface NavGroup {
  id: string;
  title: string;
  icon: NavItem["icon"];
  items: NavItem[];
  folderColor: string;
}

// One directory shared by the sidebar, Explorer, page context and workspace map.
export const NAV_GROUPS: NavGroup[] = [
  {
    id: "command",
    title: "Start here",
    icon: FiHome,
    folderColor: "#ef4444",
    items: [
      {
        href: "/admin",
        label: "Overview",
        icon: FiHome,
        description: "Today's priorities and business health",
      },
      {
        href: "/admin/workspace",
        label: "Workspace guide",
        icon: FiFolder,
        description: "Find every tool and understand the workflow",
      },
    ],
  },
  {
    id: "clients",
    title: "Clients & intake",
    icon: FiUsers,
    folderColor: "#a78bfa",
    items: [
      {
        href: "/admin/requests",
        label: "Submission inbox",
        icon: FiInbox,
        description: "Review client inquiries and requests in one place",
      },
      {
        href: "/admin/pipeline/leads",
        label: "Leads",
        icon: FiTarget,
        description: "Qualify inquiries and approve projects",
      },
      {
        href: "/admin/clients",
        label: "Clients",
        icon: FiUsers,
        description: "Organizations, contacts and project history",
      },
      {
        href: "/admin/chat",
        label: "Website conversations",
        icon: FiMessageSquare,
        description: "Review AI chat and captured inquiries",
      },
    ],
  },
  {
    id: "projects",
    title: "Projects & delivery",
    icon: FiFolder,
    folderColor: "#60a5fa",
    items: [
      {
        href: "/admin/projects",
        label: "Projects",
        icon: FiFolder,
        description: "Quotes, active projects and deliverables",
      },
      {
        href: "/admin/tasks",
        label: "Team tasks",
        icon: FiCheckSquare,
        description: "Assign work and track deadlines",
      },
      {
        href: "/admin/client-tasks",
        label: "Client deliverables",
        icon: FiFileText,
        description: "Content and approvals requested from clients",
      },
      {
        href: "/admin/maintenance",
        label: "Maintenance",
        icon: FiTool,
        description: "Ongoing support plans and requests",
      },
      {
        href: "/admin/hours",
        label: "Hours",
        icon: FiClock,
        description: "Log time and review support usage",
      },
      {
        href: "/admin/calendar",
        label: "Calendar",
        icon: FiCalendar,
        description: "Meetings and scheduled work",
      },
    ],
  },
  {
    id: "finance",
    title: "Billing & finance",
    icon: FiDollarSign,
    folderColor: "#34d399",
    items: [
      {
        href: "/admin/finance",
        label: "Finance overview",
        icon: FiDollarSign,
        description: "Revenue, expenses and cash flow",
      },
      {
        href: "/admin/invoices",
        label: "Invoices",
        icon: FiFileText,
        description: "Draft, send and track client bills",
      },
      {
        href: "/admin/subscriptions",
        label: "Subscriptions",
        icon: FiCreditCard,
        description: "Recurring client billing",
      },
      {
        href: "/admin/finance/expenses",
        label: "Expenses",
        icon: FiDollarSign,
        description: "Business costs and receipts",
      },
      {
        href: "/admin/finance/transactions",
        label: "Transactions",
        icon: FiCreditCard,
        description: "Review the transaction ledger",
      },
      {
        href: "/admin/finance/bank",
        label: "Bank accounts",
        icon: FiCreditCard,
        description: "Manage connected accounts",
      },
    ],
  },
  {
    id: "blog",
    title: "Team & resources",
    icon: FiBookOpen,
    folderColor: "#fbbf24",
    items: [
      {
        href: "/admin/team",
        label: "Team",
        icon: FiUsers,
        description: "Members and responsibilities",
      },
      {
        href: "/admin/recordings",
        label: "Recordings",
        icon: FiMic,
        description: "Meetings, transcripts and decisions",
      },
      {
        href: "/admin/resources",
        label: "Documents",
        icon: FiHardDrive,
        description: "Shared Google Drive documents",
      },
      {
        href: "/admin/links",
        label: "Saved links",
        icon: FiLink,
        description: "Useful resources and references",
      },
      {
        href: "/admin/learning",
        label: "Learning",
        icon: FiBookOpen,
        description: "Training, resources and tools",
      },
      {
        href: "/admin/blog",
        label: "Blog",
        icon: FiEdit,
        description: "Publish and maintain website articles",
      },
      {
        href: "/admin/templates",
        label: "Templates",
        icon: FiFileText,
        description: "Reusable project templates",
      },
    ],
  },
  {
    id: "devtools",
    title: "Development",
    icon: FiGitBranch,
    folderColor: "#22d3ee",
    items: [
      {
        href: "/admin/git",
        label: "Repositories",
        icon: FiGitBranch,
        description: "Source code and deployment activity",
      },
      {
        href: "/admin/database",
        label: "Database",
        icon: FiDatabase,
        description: "Inspect application data",
      },
      {
        href: "/admin/analytics",
        label: "Analytics",
        icon: FiPieChart,
        description: "Website and business metrics",
      },
    ],
  },
  {
    id: "system",
    title: "Administration",
    icon: FiSettings,
    folderColor: "#94a3b8",
    items: [
      {
        href: "/admin/settings",
        label: "Admin settings",
        icon: FiSettings,
        description: "Configure the workspace",
      },
      {
        href: "/settings",
        label: "My settings",
        icon: FiSettings,
        description: "Account, security and preferences",
      },
    ],
  },
];
export function getVisibleGroups(): NavGroup[] {
  return NAV_GROUPS;
}
export function matchesNavPath(pathname: string, href: string): boolean {
  return (
    pathname === href || (href !== "/admin" && pathname.startsWith(href + "/"))
  );
}
export function findNavItemForPath(
  pathname: string,
): { group: NavGroup; item: NavItem } | undefined {
  return NAV_GROUPS.flatMap((group) =>
    group.items.map((item) => ({ group, item })),
  )
    .filter(({ item }) => matchesNavPath(pathname, item.href))
    .sort((a, b) => b.item.href.length - a.item.href.length)[0];
}
export function findGroupForPath(pathname: string): NavGroup | undefined {
  return findNavItemForPath(pathname)?.group;
}
