"use client";

/**
 * Admin Topbar with breadcrumbs and actions
 */

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { NotificationsBell } from "./NotificationsBell";
import { Command } from "lucide-react";
import { useCommandPalette } from "@/providers/CommandPaletteProvider";

interface TopbarProps {
  user: {
    name: string | null;
    email: string | null;
    image?: string | null;
  };
}

export function Topbar({ user }: TopbarProps) {
  const pathname = usePathname();
  const { open } = useCommandPalette();
  const [userImage, setUserImage] = useState<string | null>(user.image || null);

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

  // Generate breadcrumbs from pathname
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment, idx) => ({
    label: segment.charAt(0).toUpperCase() + segment.slice(1),
    href: "/" + segments.slice(0, idx + 1).join("/"),
  }));

  return (
    <header
      className="
        w-full h-full
        flex items-center justify-between
        px-6 gap-4
      "
    >
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, idx) => (
          <div key={crumb.href} className="flex items-center gap-2">
            {idx > 0 && <span className="text-slate-600">/</span>}
            <span
              className={
                idx === breadcrumbs.length - 1
                  ? "text-white font-medium"
                  : "text-slate-400"
              }
            >
              {crumb.label}
            </span>
          </div>
        ))}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Command Palette trigger */}
        <button
          onClick={open}
          className="
            flex items-center gap-2 px-3 py-1.5 rounded-lg
            bg-slate-900/40 border border-white/10
            text-xs text-slate-400
            hover:bg-slate-900/60 hover:border-white/20
            transition-all
          "
        >
          <Command className="w-3 h-3" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 font-mono text-[10px]">
            ⌘K
          </kbd>
        </button>

        <NotificationsBell />

        {/* User avatar */}
        {userImage ? (
          <img
            src={userImage}
            alt={user.name || "User"}
            className="w-8 h-8 rounded-full border border-white/10"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs text-slate-300">
            {user.name?.[0] || user.email?.[0] || "U"}
          </div>
        )}
      </div>
    </header>
  );
}
