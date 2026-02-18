"use client";

import { usePathname, useRouter } from "next/navigation";
import { FiArrowLeft, FiArrowRight, FiGrid, FiList, FiLayout } from "react-icons/fi";
import LogoHeader from "@/components/brand/LogoHeader";
import GlobalSearch from "@/components/ui/GlobalSearch";
import Avatar from "@/components/ui/Avatar";
import { useNavigation, type AdminNavMode } from "@/providers/NavigationProvider";
import { findNavItemForPath } from "@/lib/admin/nav-data";

interface ExplorerTopBarProps {
  user: { name: string | null; email: string | null; image?: string | null };
}

const VIEW_MODES: { mode: AdminNavMode; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { mode: "explorer", icon: FiGrid, label: "Explorer" },
  { mode: "sidebar", icon: FiList, label: "Sidebar" },
  { mode: "dashboard", icon: FiLayout, label: "Dashboard" },
];

export function ExplorerTopBar({ user }: ExplorerTopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminNavMode, setAdminNavMode } = useNavigation();
  const navResult = findNavItemForPath(pathname);

  const breadcrumbs: { label: string; href?: string }[] = [{ label: "Admin", href: "/admin" }];
  if (navResult) {
    if (navResult.group.id !== "core" || navResult.item.href !== "/admin") {
      breadcrumbs.push({ label: navResult.group.title, href: navResult.group.items[0].href });
    }
    if (navResult.item.href !== "/admin") {
      breadcrumbs.push({ label: navResult.item.label });
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-slate-800 bg-[#0f172a]/95 backdrop-blur-xl px-4 lg:px-6">
      {/* Logo */}
      <div className="flex-shrink-0">
        <LogoHeader href="/admin" />
      </div>

      {/* Back / Forward */}
      <div className="flex items-center gap-1 ml-2">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/8 hover:text-white transition-colors"
          aria-label="Go back"
        >
          <FiArrowLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => window.history.forward()}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/8 hover:text-white transition-colors"
          aria-label="Go forward"
        >
          <FiArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm min-w-0 flex-1 ml-2">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1 min-w-0">
            {i > 0 && <span className="text-slate-600 mx-0.5">/</span>}
            {crumb.href && i < breadcrumbs.length - 1 ? (
              <button
                onClick={() => router.push(crumb.href!)}
                className="text-slate-400 hover:text-white transition-colors truncate"
              >
                {crumb.label}
              </button>
            ) : (
              <span className="text-white font-medium truncate">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* View Toggle */}
      <div className="flex items-center gap-0.5 rounded-lg border border-slate-700 bg-slate-800/50 p-0.5">
        {VIEW_MODES.map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => setAdminNavMode(mode)}
            className={`rounded-md p-1.5 transition-colors ${
              adminNavMode === mode
                ? "bg-white/10 text-white"
                : "text-slate-500 hover:text-slate-300"
            }`}
            title={label}
            aria-label={`Switch to ${label} view`}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="hidden sm:block">
        <GlobalSearch variant="admin" placeholder="Search..." />
      </div>

      {/* Avatar */}
      <button
        onClick={() => router.push("/settings")}
        className="flex-shrink-0"
        title="Settings"
      >
        <Avatar
          src={user.image ?? undefined}
          alt={user.name ?? "Admin"}
          size={32}
          fallbackText={user.name ?? undefined}
          className="h-8 w-8 ring-2 ring-white/10 hover:ring-white/20 transition-all"
        />
      </button>
    </header>
  );
}
