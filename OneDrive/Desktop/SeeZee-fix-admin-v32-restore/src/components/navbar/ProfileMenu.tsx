"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { User, LayoutDashboard, Shield, Crown, CreditCard, Settings, Moon, Sun, Monitor, LogOut } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

interface ProfileMenuProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  } | null;
}

export function ProfileMenu({ user }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("dark");
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("dark");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isCEO = user?.role === "CEO";
  const isAdmin = user?.role === "CFO" || ["FRONTEND", "BACKEND", "OUTREACH"].includes(user?.role || "") || user?.role === "CEO";

  // Format role for display
  const getRoleDisplay = () => {
    if (!user?.role) return "Client";
    const role = user.role;
    if (role === "CEO") return "Chief Executive";
    if (role === "CFO") return "Chief Financial Officer";
    if (role === "FRONTEND") return "Frontend Developer";
    if (role === "BACKEND") return "Backend Developer";
    if (role === "OUTREACH") return "Outreach Specialist";
    return "Client";
  };

  // Detect system theme preference and load saved theme mode
  useEffect(() => {
    const savedThemeMode = localStorage.getItem("themeMode") as "light" | "dark" | "system" | null;
    if (savedThemeMode) {
      setThemeMode(savedThemeMode);
      if (savedThemeMode === "system") {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        setSystemTheme(mediaQuery.matches ? "dark" : "light");
        setTheme(mediaQuery.matches ? "dark" : "light");
      }
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemTheme(mediaQuery.matches ? "dark" : "light");
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
      if (themeMode === "system") {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeMode, setTheme]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const handleSignOut = async () => {
    try {
      setOpen(false);
      await signOut({ 
        callbackUrl: "/",
        redirect: true 
      });
    } catch (error) {
      console.error("Sign out error:", error);
      // Fallback: redirect manually if signOut fails
      window.location.href = "/";
    }
  };

  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  // If not authenticated, show sign in button
  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:from-blue-600 hover:to-purple-600 transition-all"
      >
        <User className="h-4 w-4" />
        Sign In
      </Link>
    );
  }

  return (
    <div className="relative flex items-center gap-3" ref={dropdownRef}>
      {/* Profile Banner - Always visible on desktop */}
      <div className="hidden lg:flex flex-col items-end">
        <div className="text-xs font-semibold text-slate-300 tracking-wide">
          {getRoleDisplay()}
        </div>
        <div className="text-[11px] text-slate-500 truncate max-w-[120px]">
          {user.name || user.email?.split("@")[0]}
        </div>
      </div>

      {/* Avatar Button Container */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="relative h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-white/10 overflow-hidden hover:border-white/30 hover:scale-105 transition-all flex items-center justify-center group"
          aria-label="Profile menu"
          aria-expanded={open}
        >
          {user.image ? (
            <img src={user.image} alt={user.name || "User"} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-white">{getInitials()}</span>
          )}
          
          {/* Hover ring effect */}
          <div className="absolute inset-0 rounded-full border-2 border-white/0 group-hover:border-white/20 transition-all" />
        </button>

        {/* Dropdown - Positioned relative to avatar */}
        {open && (
          <div className="absolute right-0 mt-2 w-72 rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl z-[60]">
            {/* User Info */}
            <div className="border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  {user.image ? (
                    <img src={user.image} alt={user.name || "User"} className="h-full w-full object-cover rounded-full" />
                  ) : (
                    <span className="text-sm font-bold text-white">{getInitials()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{user.name || "User"}</div>
                  <div className="text-xs text-slate-400 truncate">{user.email}</div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <Link
                href={
                  pathname?.startsWith("/admin")
                    ? "/admin/profile"
                    : "/client/profile"
                }
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-white/5 transition-colors"
              >
                <User className="h-4 w-4 text-slate-400" />
                My Profile
              </Link>

              <Link
                href="/client"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-white/5 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-slate-400" />
                Client Dashboard
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-white/5 transition-colors"
                >
                  <Shield className="h-4 w-4 text-slate-400" />
                  Admin Dashboard
                  {isCEO && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">Executive</span>
                  )}
                </Link>
              )}

              <Link
                href="/billing"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-white/5 transition-colors"
              >
                <CreditCard className="h-4 w-4 text-slate-400" />
                Billing
              </Link>

              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-white/5 transition-colors"
              >
                <Settings className="h-4 w-4 text-slate-400" />
                Settings
              </Link>
            </div>

            {/* Theme Selector */}
            <div className="border-t border-white/10 p-2">
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Theme
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setTheme("light");
                    setThemeMode("light");
                    localStorage.setItem("theme", "light");
                    localStorage.setItem("themeMode", "light");
                  }}
                  data-active={themeMode === "light"}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-white/5 transition-colors
                             data-[active=true]:bg-white/10 data-[active=true]:text-white"
                  aria-label="Light theme"
                >
                  <Sun className="h-3.5 w-3.5" />
                  Light
                </button>
                <button
                  onClick={() => {
                    setTheme("dark");
                    setThemeMode("dark");
                    localStorage.setItem("theme", "dark");
                    localStorage.setItem("themeMode", "dark");
                  }}
                  data-active={themeMode === "dark"}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-white/5 transition-colors
                             data-[active=true]:bg-white/10 data-[active=true]:text-white"
                  aria-label="Dark theme"
                >
                  <Moon className="h-3.5 w-3.5" />
                  Dark
                </button>
                <button
                  onClick={() => {
                    setThemeMode("system");
                    setTheme(systemTheme);
                    localStorage.setItem("themeMode", "system");
                    localStorage.setItem("theme", systemTheme);
                  }}
                  data-active={themeMode === "system"}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-white/5 transition-colors
                             data-[active=true]:bg-white/10 data-[active=true]:text-white"
                  aria-label="System theme"
                >
                  <Monitor className="h-3.5 w-3.5" />
                  System
                </button>
              </div>
            </div>

            {/* Sign Out */}
            <div className="border-t border-white/10 p-2">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
