"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiMenu,
  FiX,
  FiArrowLeft,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiCheckSquare,
  FiTrendingUp,
  FiDollarSign,
  FiUsers as FiTeamUsers,
  FiStar,
  FiSettings,
} from "react-icons/fi";
import { signOut } from "next-auth/react";
import Avatar from "@/components/ui/Avatar";
import LogoHeader from "@/components/brand/LogoHeader";
import { CollapsibleNavGroup } from "@/components/admin/CollapsibleNavGroup";
import { isCEO } from "@/lib/role";
import type { CurrentUser } from "@/lib/auth/requireRole";
import GlobalSearch from "@/components/ui/GlobalSearch";
import { AdminNotificationBanner } from "@/components/admin/AdminNotificationBanner";
import { getVisibleGroups } from "@/lib/admin/nav-data";
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
  const isUserCEO = isCEO(user.role);
  const [userImage, setUserImage] = useState<string | undefined>(user.image ?? undefined);

  let setAdminNavMode: ((mode: "explorer") => void) | null = null;
  try {
    const nav = useNavigation();
    setAdminNavMode = nav.setAdminNavMode;
  } catch {
    // NavigationProvider may not be available in all contexts
  }

  const groups = getVisibleGroups(isUserCEO);

  // Fetch user image (since it's removed from session to prevent cookie bloat)
  useEffect(() => {
    fetch('/api/user/me')
      .then(res => res.json())
      .then((data) => {
        if (data?.image) {
          setUserImage(data.image);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch user image:', err);
      });
  }, []);

  const coreGroup = groups.find(g => g.id === "core");
  const workGroup = groups.find(g => g.id === "work");
  const pipelineGroup = groups.find(g => g.id === "pipeline");
  const financeGroup = groups.find(g => g.id === "finance");
  const teamGroup = groups.find(g => g.id === "team");
  const ceoGroup = groups.find(g => g.id === "ceo");
  const systemGroup = groups.find(g => g.id === "system");

  const isActive = useCallback(
    (href: string) => {
      if (href === "/admin") {
        return pathname === "/admin";
      }
      return pathname.startsWith(href);
    },
    [pathname]
  );

  const handleNavigate = useCallback(
    (href: string) => {
      setIsSidebarOpen(false);
      router.push(href);
    },
    [router]
  );

  const handleLogout = useCallback(async () => {
    await signOut({ redirect: false });
    router.push("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a1128] text-white">
      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 transform border-r border-slate-800 bg-[#0f172a]/98 backdrop-blur-xl transition-all duration-300 ease-in-out lg:translate-x-0 ${
            isCollapsed ? "w-20 lg:w-20" : "w-64 lg:w-64"
          } ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className={`border-b border-slate-800 px-6 py-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
              {!isCollapsed && <LogoHeader href="/admin" />}
              {/* Desktop Collapse Toggle */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <FiChevronRight className="w-5 h-5" />
                ) : (
                  <FiChevronLeft className="w-5 h-5" />
                )}
              </button>
            </div>
            <nav className="flex-1 space-y-3 overflow-y-auto px-3 py-6">
              {/* CORE PAGES - Always visible, prominent */}
              {!isCollapsed && (
                <div className="mb-4 px-3">
                  <p className="text-[9px] uppercase tracking-widest text-slate-600 font-bold">Core Rooms</p>
                </div>
              )}
              {coreGroup?.items.map(({ href, label, icon: Icon }) => (
                <motion.button
                  key={href}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleNavigate(href)}
                  className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200 ${
                    isCollapsed ? 'justify-center' : ''
                  } ${
                    isActive(href)
                      ? "bg-[#ef4444]/15 text-white border-l-2 border-[#ef4444]"
                      : "text-slate-400 hover:bg-white/8 hover:text-slate-100"
                  }`}
                  title={isCollapsed ? label : undefined}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 transition-colors ${isActive(href) ? 'text-[#ef4444]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  {!isCollapsed && <span className="font-medium text-sm">{label}</span>}
                </motion.button>
              ))}

              {/* Divider */}
              <div className="my-4 border-t border-slate-800" />

              {/* WORK */}
              {workGroup && (
                <CollapsibleNavGroup
                  title="Work"
                  icon={FiCheckSquare}
                  items={workGroup.items}
                  isActive={isActive}
                  onNavigate={handleNavigate}
                  defaultOpen={workGroup.items.some(item => pathname.startsWith(item.href))}
                  collapsed={isCollapsed}
                />
              )}

              {/* PIPELINE */}
              {pipelineGroup && (
                <CollapsibleNavGroup
                  title="Pipeline"
                  icon={FiTrendingUp}
                  items={pipelineGroup.items}
                  isActive={isActive}
                  onNavigate={handleNavigate}
                  defaultOpen={pipelineGroup.items.some(item => pathname.startsWith(item.href))}
                  collapsed={isCollapsed}
                />
              )}

              {/* FINANCE */}
              {financeGroup && (
                <CollapsibleNavGroup
                  title="Finance"
                  icon={FiDollarSign}
                  items={financeGroup.items}
                  isActive={isActive}
                  onNavigate={handleNavigate}
                  defaultOpen={financeGroup.items.some(item => pathname.startsWith(item.href))}
                  collapsed={isCollapsed}
                />
              )}

              {/* TEAM */}
              {teamGroup && (
                <CollapsibleNavGroup
                  title="Team"
                  icon={FiTeamUsers}
                  items={teamGroup.items}
                  isActive={isActive}
                  onNavigate={handleNavigate}
                  defaultOpen={teamGroup.items.some(item => pathname.startsWith(item.href))}
                  collapsed={isCollapsed}
                />
              )}

              {/* CEO (CEO only) */}
              {ceoGroup && (
                <CollapsibleNavGroup
                  title="CEO"
                  icon={FiStar}
                  items={ceoGroup.items}
                  isActive={isActive}
                  onNavigate={handleNavigate}
                  defaultOpen={ceoGroup.items.some(item => pathname.startsWith(item.href))}
                  badge="CEO"
                  collapsed={isCollapsed}
                />
              )}

              {/* Divider before System */}
              <div className="my-4 border-t border-slate-800" />

              {/* SYSTEM & TOOLS */}
              {systemGroup && (
                <CollapsibleNavGroup
                  title="System"
                  icon={FiSettings}
                  items={systemGroup.items}
                  isActive={isActive}
                  onNavigate={handleNavigate}
                  defaultOpen={systemGroup.items.some(item => pathname.startsWith(item.href))}
                  collapsed={isCollapsed}
                />
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
                      <p className="truncate text-sm font-semibold text-white">{user.name ?? "Admin"}</p>
                      <p className="truncate text-xs text-slate-400">{user.email ?? ""}</p>
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

        <div className={`flex min-h-screen flex-1 flex-col transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <header className="border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-xl px-4 py-4 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                className="rounded-xl p-2 text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-white lg:hidden"
                aria-label="Toggle sidebar"
              >
                {isSidebarOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
              </button>
              <div className="flex flex-1 items-center justify-end gap-3">
                <GlobalSearch
                  variant="admin"
                  placeholder="Search projects, clients, tasks..."
                />
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

          {/* Notification Banner */}
          <AdminNotificationBanner />

          <main className="flex-1 overflow-y-auto bg-[#0a1128] px-4 py-8 lg:px-10 lg:py-12">
            {/* Subtle dot pattern background */}
            <div
              className="fixed inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }}
            />
            <div className="relative mx-auto w-full max-w-[1200px] space-y-10">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminAppShell;
