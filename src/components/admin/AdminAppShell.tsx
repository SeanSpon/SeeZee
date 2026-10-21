"use client";

import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  FiMenu,
  FiX,
  FiArrowLeft,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
} from "react-icons/fi";
import { signOut } from "next-auth/react";
import Avatar from "@/components/ui/Avatar";
import LogoHeader from "@/components/brand/LogoHeader";
import type { CurrentUser } from "@/lib/auth/requireRole";
import GlobalSearch from "@/components/ui/GlobalSearch";
import { AdminNotificationBanner } from "@/components/admin/AdminNotificationBanner";
import { getVisibleGroups, findNavItemForPath } from "@/lib/admin/nav-data";
import { useNavigation } from "@/providers/NavigationProvider";

interface AdminAppShellProps {
  user: CurrentUser;
  children: React.ReactNode;
}

export function AdminAppShell({ user, children }: AdminAppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userImage, setUserImage] = useState<string | undefined>(
    user.image ?? undefined,
  );

  const { setAdminNavMode } = useNavigation();

  const groups = getVisibleGroups();

  const currentPage = findNavItemForPath(pathname);
  const [navFilter, setNavFilter] = useState("");

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!isSidebarOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsSidebarOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isSidebarOpen]);

  // Fetch user image (since it's removed from session to prevent cookie bloat)
  useEffect(() => {
    fetch("/api/user/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.image) {
          setUserImage(data.image);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user image:", err);
      });
  }, []);

  const isActive = useCallback(
    (href: string) => {
      return currentPage?.item.href === href;
    },
    [currentPage?.item.href],
  );

  const handleNavigate = useCallback(
    (href: string) => {
      setIsSidebarOpen(false);
      router.push(href);
    },
    [router],
  );

  const handleLogout = useCallback(async () => {
    await signOut({ redirect: false });
    router.push("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a1128] text-white">
      <a
        href="#admin-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:p-3 focus:text-black"
      >
        Skip to content
      </a>
      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 transform border-r border-slate-800 bg-[#0f172a]/98 backdrop-blur-xl transition-all duration-300 ease-in-out lg:translate-x-0 ${
            isCollapsed ? "w-20 lg:w-20" : "w-64 lg:w-64"
          } ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex h-full flex-col">
            <div
              className={`border-b border-slate-800 px-6 py-6 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}
            >
              {!isCollapsed && <LogoHeader href="/admin" />}
              {/* Desktop Collapse Toggle */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <FiChevronRight className="w-5 h-5" />
                ) : (
                  <FiChevronLeft className="w-5 h-5" />
                )}
              </button>
            </div>
            <nav
              aria-label="Admin navigation"
              className="flex-1 space-y-4 overflow-y-auto px-3 py-4"
            >
              {!isCollapsed && (
                <input
                  type="search"
                  aria-label="Find an admin page"
                  placeholder="Find a page…"
                  value={navFilter}
                  onChange={(event) => setNavFilter(event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              )}
              {groups.map((group) => {
                const items = group.items.filter((item) =>
                  `${item.label} ${item.description} ${group.title}`
                    .toLowerCase()
                    .includes(navFilter.toLowerCase()),
                );
                if (!items.length) return null;
                return (
                  <section key={group.id}>
                    {!isCollapsed && (
                      <h2 className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        {group.title}
                      </h2>
                    )}
                    <div className="space-y-0.5">
                      {items.map(({ href, label, icon: Icon }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setIsSidebarOpen(false)}
                          title={label}
                          aria-current={isActive(href) ? "page" : undefined}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ${isCollapsed ? "justify-center" : ""} ${isActive(href) ? "bg-red-500/15 text-white ring-1 ring-red-400/30" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                        >
                          <Icon
                            className={`h-4 w-4 shrink-0 ${isActive(href) ? "text-red-400" : ""}`}
                          />
                          {!isCollapsed && <span>{label}</span>}
                        </Link>
                      ))}
                    </div>
                  </section>
                );
              })}
              {navFilter &&
                !groups.some((group) =>
                  group.items.some((item) =>
                    `${item.label} ${item.description} ${group.title}`
                      .toLowerCase()
                      .includes(navFilter.toLowerCase()),
                  ),
                ) && (
                  <p className="px-3 text-sm text-slate-400">
                    No pages match. Try “invoices” or “tasks”.
                  </p>
                )}
            </nav>
            <div className="border-t border-slate-800 px-4 py-4">
              {!isCollapsed ? (
                <>
                  <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
                    <Avatar
                      src={userImage}
                      alt={user.name ?? "Admin"}
                      size={40}
                      fallbackText={user.name ?? undefined}
                      className="h-10 w-10 flex-shrink-0 ring-2 ring-white/10"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {user.name ?? "Admin"}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {user.email ?? ""}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <button
                      onClick={() => handleNavigate("/")}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-white"
                    >
                      <FiArrowLeft className="h-5 w-5" />
                      Back to Site
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-white"
                    >
                      <FiLogOut className="h-5 w-5" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div title={`${user.name ?? "Admin"} - ${user.email ?? ""}`}>
                    <Avatar
                      src={userImage}
                      alt={user.name ?? "Admin"}
                      size={40}
                      fallbackText={user.name ?? undefined}
                      className="h-10 w-10 flex-shrink-0 ring-2 ring-white/10"
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <button
                      onClick={() => handleNavigate("/")}
                      className="flex items-center justify-center rounded-xl p-2 text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-white"
                      title="Back to Site"
                    >
                      <FiArrowLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center rounded-xl p-2 text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-white"
                      title="Logout"
                    >
                      <FiLogOut className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-[#0a1128]/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div
          className={`flex min-h-screen flex-1 flex-col transition-all duration-300 ${isCollapsed ? "lg:ml-20" : "lg:ml-64"}`}
        >
          <header className="border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-xl px-4 py-4 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                className="rounded-xl p-2 text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-white lg:hidden"
                aria-label="Toggle sidebar"
                aria-expanded={isSidebarOpen}
              >
                {isSidebarOpen ? (
                  <FiX className="h-6 w-6" />
                ) : (
                  <FiMenu className="h-6 w-6" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400">
                  {currentPage?.group.title || "Workspace"}
                </p>
                <p className="truncate text-sm font-semibold">
                  {currentPage?.item.label || "SeeZee admin"}
                </p>
              </div>
              <div className="flex items-center justify-end gap-3">
                <div className="hidden sm:block">
                <GlobalSearch
                  variant="admin"
                  placeholder="Search projects, clients, tasks..."
                />
                </div>
                {/* Switch to Explorer */}
                {setAdminNavMode && (
                  <button
                    onClick={() => setAdminNavMode("explorer")}
                    className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Switch to Explorer view"
                    aria-label="Switch to Explorer view"
                  >
                    <FiGrid className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </header>

          {process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" && (
            <div className="border-b border-amber-400/20 bg-amber-400/10 px-4 py-2 text-center text-xs text-amber-200">
              Preview workspace · Changes here are under review
            </div>
          )}
          {/* Notification Banner */}
          <AdminNotificationBanner />

          <main
            id="admin-content"
            className="flex-1 overflow-y-auto bg-[#0a1128] px-4 py-8 lg:px-10 lg:py-12"
          >
            {/* Subtle dot pattern background */}
            <div
              className="fixed inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "32px 32px",
              }}
            />
            <div className="relative mx-auto w-full max-w-[1200px] space-y-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminAppShell;
