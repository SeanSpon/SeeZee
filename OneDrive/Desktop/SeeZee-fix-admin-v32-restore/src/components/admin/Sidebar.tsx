"use client";

/**
 * Admin Sidebar with collapsible Executive section
 */

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Radio,
  GitBranch,
  CheckSquare,
  Calendar,
  Wrench,
  GraduationCap,
  Link as LinkIcon,
  Database,
  ChevronDown,
  BarChart3,
  DollarSign,
  Settings,
  FileText,
  Zap,
  Users,
  Crown,
} from "lucide-react";
import { getRoleAccent, isCEO, type Role } from "@/lib/role";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavSection {
  label?: string;
  items: NavItem[];
  collapsible?: boolean;
  requireCEO?: boolean;
}

interface SidebarProps {
  userRole: Role;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const [executiveOpen, setExecutiveOpen] = useState(true);
  const [learningOpen, setLearningOpen] = useState(false);

  // Generate breadcrumbs from pathname
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment) => 
    segment.charAt(0).toUpperCase() + segment.slice(1)
  );
  const pageTitle = breadcrumbs.slice(-1)[0] || "Dashboard";

  const sections: NavSection[] = [
    {
      items: [
        {
          label: "Dashboard",
          href: "/admin",
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
        {
          label: "Feed",
          href: "/admin/feed",
          icon: <Radio className="w-5 h-5" />,
          badge: "3",
        },
        {
          label: "Pipeline",
          href: "/admin/pipeline",
          icon: <GitBranch className="w-5 h-5" />,
        },
        {
          label: "Tasks",
          href: "/admin/tasks",
          icon: <CheckSquare className="w-5 h-5" />,
          badge: "8",
        },
        {
          label: "Calendar",
          href: "/admin/calendar",
          icon: <Calendar className="w-5 h-5" />,
        },
        {
          label: "Maintenance",
          href: "/admin/maintenance",
          icon: <Wrench className="w-5 h-5" />,
        },
        {
          label: "Team",
          href: "/admin/team",
          icon: <Users className="w-5 h-5" />,
        },
      ],
    },
    {
      label: "Learning Hub",
      items: [
        {
          label: "Training",
          href: "/admin/learning/training",
          icon: <GraduationCap className="w-4 h-4" />,
        },
        {
          label: "Tools",
          href: "/admin/learning/tools",
          icon: <Settings className="w-4 h-4" />,
        },
        {
          label: "Resources",
          href: "/admin/learning/resources",
          icon: <FileText className="w-4 h-4" />,
        },
      ],
      collapsible: true,
    },
    {
      items: [
        {
          label: "Links",
          href: "/admin/links",
          icon: <LinkIcon className="w-5 h-5" />,
        },
        {
          label: "Database",
          href: "/admin/database",
          icon: <Database className="w-5 h-5" />,
        },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === href;
    return pathname.startsWith(href);
  };

  const roleAccent = getRoleAccent(userRole);

  return (
    <aside
      className={`
        w-full h-full border-r border-white/5
        bg-slate-950/80 backdrop-blur-xl
        ring-1 ${roleAccent}
        flex flex-col
      `}
    >
      {/* Page Title Breadcrumb - Top of Sidebar (Fixed) */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-white/5 bg-slate-950/90">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
          {breadcrumbs.map((crumb, idx) => (
            <span key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <span>/</span>}
              <span>{crumb}</span>
            </span>
          ))}
        </div>
        <h2 className="text-lg font-bold text-white">{pageTitle}</h2>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-blue-500/50 scrollbar-track-transparent">
        {sections.map((section, idx) => {
          // Hide CEO-only sections for non-CEO users
          if (section.requireCEO && !isCEO(userRole)) return null;

          const isLearningSection = section.label === "Learning Hub";
          const isExecutiveSection = section.label === "Executive";
          const sectionOpen = isExecutiveSection
            ? executiveOpen
            : isLearningSection
            ? learningOpen
            : true;

          return (
            <div key={idx}>
              {section.label && (
                <button
                  onClick={() => {
                    if (isExecutiveSection) setExecutiveOpen(!executiveOpen);
                    if (isLearningSection) setLearningOpen(!learningOpen);
                  }}
                  className={`
                    w-full flex items-center justify-between
                    px-3 py-2 mb-2
                    text-xs font-semibold text-slate-400 uppercase tracking-wider
                    ${section.collapsible ? "hover:text-slate-300 cursor-pointer" : ""}
                  `}
                >
                  <span>{section.label}</span>
                  {section.collapsible && (
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${
                        sectionOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>
              )}

              <AnimatePresence>
                {sectionOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1"
                  >
                    {section.items.map((item) => {
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`
                            relative flex items-center gap-3 px-3 py-2 rounded-lg
                            text-sm font-medium
                            transition-all duration-200
                            ${
                              active
                                ? "bg-white/10 text-white shadow-lg"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                            }
                          `}
                        >
                          {active && (
                            <motion.div
                              layoutId="sidebar-active"
                              className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg"
                              transition={{ duration: 0.3 }}
                            />
                          )}
                          <span className="relative z-10">{item.icon}</span>
                          <span className="relative z-10 flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="relative z-10 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
