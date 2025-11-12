"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import {
  FiHome,
  FiFolder,
  FiFileText,
  FiMessageSquare,
  FiSettings,
  FiMenu,
  FiX,
  FiArrowLeft,
  FiLogOut,
  FiCheckSquare,
  FiCreditCard,
  FiHelpCircle,
  FiMail,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import Avatar from "@/components/ui/Avatar";
import LogoHeader from "@/components/brand/LogoHeader";
import { fetchJson } from "@/lib/client-api";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | null;
}

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasActiveRequest, setHasActiveRequest] = useState(false);
  const [checkingRequests, setCheckingRequests] = useState(true);
  const [pendingTaskCount, setPendingTaskCount] = useState(0);

  const isActive = useCallback(
    (href: string) => {
      if (href === "/client") {
        return pathname === "/client" || pathname === "/client/overview";
      }
      if (href === "/start") {
        return pathname === "/start";
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

  // Check for active project requests
  useEffect(() => {
    if (!session?.user) {
      setCheckingRequests(false);
      return;
    }

    fetchJson<any>("/api/client/requests")
      .then((data) => {
        const requests = data?.requests || [];
        const active = requests.filter((req: any) => {
          const status = String(req.status || "").toUpperCase();
          return ["DRAFT", "SUBMITTED", "REVIEWING", "NEEDS_INFO"].includes(status);
        });
        setHasActiveRequest(active.length > 0);
      })
      .catch((err) => {
        console.error("Failed to check active requests:", err);
        setHasActiveRequest(false);
      })
      .finally(() => {
        setCheckingRequests(false);
      });
  }, [session]);

  // Fetch pending task count
  useEffect(() => {
    if (!session?.user) {
      setPendingTaskCount(0);
      return;
    }

    fetchJson<any>("/api/client/tasks")
      .then((data) => {
        const summary = data?.summary || {};
        setPendingTaskCount(summary.pending || 0);
      })
      .catch((err) => {
        console.error("Failed to fetch pending tasks:", err);
        setPendingTaskCount(0);
      });
  }, [session]);

  const navItems: NavItem[] = useMemo(
    () => [
      { href: "/client", label: "Dashboard", icon: FiHome },
      { href: "/client/projects", label: "Projects", icon: FiFolder },
      {
        href: "/client/tasks",
        label: "Tasks",
        icon: FiCheckSquare,
        badge: pendingTaskCount > 0 ? pendingTaskCount : null,
      },
      { href: "/client/files", label: "Files", icon: FiFileText },
      { href: "/client/requests", label: "Requests", icon: FiMessageSquare },
      { href: "/client/invoices", label: "Invoices", icon: FiCreditCard },
      { href: "/client/messages", label: "Messages", icon: FiMail },
      { href: "/client/support", label: "Support", icon: FiHelpCircle },
      { href: "/client/settings", label: "Settings", icon: FiSettings },
    ],
    [pendingTaskCount]
  );

  const user = session?.user;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 transform border-r border-gray-800 bg-gray-900 transition-all duration-300 ease-in-out lg:translate-x-0 ${
            isCollapsed ? "w-20 lg:w-20" : "w-64 lg:w-64"
          } ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className={`border-b border-gray-800 px-6 py-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
              {!isCollapsed && <LogoHeader href="/client" />}
              {/* Desktop Collapse Toggle */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-[color,background-color] duration-150 ease-in-out"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <FiChevronRight className="w-5 h-5" />
                ) : (
                  <FiChevronLeft className="w-5 h-5" />
                )}
              </button>
            </div>
            <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
              {navItems.map(({ href, label, icon: Icon, badge }) => (
                <motion.button
                  key={href}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleNavigate(href)}
                  className={`group relative flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-all duration-200 ${
                    isCollapsed ? 'justify-center' : ''
                  } ${
                    isActive(href)
                      ? "bg-trinity-red text-white shadow-lg"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                  title={isCollapsed ? label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">{label}</span>}
                  {!isCollapsed && badge !== undefined && badge !== null && badge > 0 && (
                    <span className="rounded-full bg-cyan-500 px-2 py-0.5 text-xs font-semibold text-white">
                      {badge}
                    </span>
                  )}
                  {isActive(href) && (
                    <motion.span
                      layoutId="client-nav-active"
                      className="absolute inset-0 rounded-lg border border-trinity-red"
                      transition={{ type: "spring", stiffness: 250, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </nav>
            <div className="border-t border-gray-800 px-4 py-4">
              {!isCollapsed ? (
                <>
                  <div className="flex items-center gap-3 rounded-lg px-3 py-2">
                    <Avatar
                      src={user?.image ?? undefined}
                      alt={user?.name ?? "User"}
                      size={40}
                      fallbackText={user?.name ?? undefined}
                      className="h-10 w-10 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{user?.name ?? "User"}</p>
                      <p className="truncate text-xs text-gray-400">{user?.email ?? ""}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <button
                      onClick={() => handleNavigate("/")}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                    >
                      <FiArrowLeft className="h-5 w-5" />
                      Back to Site
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                    >
                      <FiLogOut className="h-5 w-5" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div title={`${user?.name ?? "User"} - ${user?.email ?? ""}`}>
                    <Avatar
                      src={user?.image ?? undefined}
                      alt={user?.name ?? "User"}
                      size={40}
                      fallbackText={user?.name ?? undefined}
                      className="h-10 w-10 flex-shrink-0"
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <button
                      onClick={() => handleNavigate("/")}
                      className="flex items-center justify-center rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                      title="Back to Site"
                    >
                      <FiArrowLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
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
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className={`flex min-h-screen flex-1 flex-col transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <header className="border-b border-gray-800 bg-gray-900/80 px-4 py-4 lg:px-8">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white lg:hidden"
                aria-label="Toggle sidebar"
              >
                {isSidebarOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
              </button>
              <div className="flex flex-1 items-center justify-end gap-3">
                {!hasActiveRequest && !checkingRequests && (
                  <Link
                    href="/start"
                    className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-blue-600 hover:to-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  >
                    Start a Project
                  </Link>
                )}
                <Link
                  href="/"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Back to Site
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto animated-gradient px-4 py-6 lg:px-10 lg:py-10">
            <div className="mx-auto w-full max-w-[1200px] space-y-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
