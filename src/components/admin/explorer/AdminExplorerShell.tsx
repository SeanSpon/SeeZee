"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { ExplorerTopBar } from "./ExplorerTopBar";
import { FolderGrid } from "./FolderGrid";
import { FolderOpenView } from "./FolderOpenView";
import { AdminNotificationBanner } from "@/components/admin/AdminNotificationBanner";
import { useNavigation } from "@/providers/NavigationProvider";
import { getVisibleGroups, findGroupForPath, type NavGroup } from "@/lib/admin/nav-data";
import { isCEO } from "@/lib/role";
import type { CurrentUser } from "@/lib/auth/requireRole";

interface AdminExplorerShellProps {
  user: CurrentUser;
  children: React.ReactNode;
}

export function AdminExplorerShell({ user, children }: AdminExplorerShellProps) {
  const pathname = usePathname();
  const { openFolderId, setOpenFolderId } = useNavigation();
  const isUserCEO = isCEO(user.role);
  const groups = getVisibleGroups(isUserCEO);

  const [userImage, setUserImage] = useState<string | undefined>(user.image ?? undefined);

  useEffect(() => {
    fetch("/api/user/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.image) setUserImage(data.image);
      })
      .catch(() => {});
  }, []);

  const isAtRoot = pathname === "/admin";
  const currentGroup = findGroupForPath(pathname);
  const openGroup = openFolderId ? groups.find((g) => g.id === openFolderId) : null;

  // Clear openFolderId when navigating away from root
  useEffect(() => {
    if (!isAtRoot && openFolderId) {
      setOpenFolderId(null);
    }
  }, [isAtRoot, openFolderId, setOpenFolderId]);

  return (
    <div className="min-h-screen bg-[#0a1128] text-white">
      <ExplorerTopBar user={{ ...user, image: userImage }} />
      <AdminNotificationBanner />

      <main className="min-h-[calc(100vh-4rem)] px-4 py-8 lg:px-10 lg:py-12">
        {/* Subtle dot pattern background */}
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative mx-auto w-full max-w-[1200px]">
          {isAtRoot && !openGroup && (
            /* Show folder grid at /admin root with no folder zoomed */
            <div className="space-y-10">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Admin Dashboard</h1>
                <p className="text-slate-400 text-sm">Select a folder to get started</p>
              </div>
              <FolderGrid groups={groups} />
            </div>
          )}

          {isAtRoot && openGroup && (
            /* Zoomed folder view at /admin root */
            <AnimatePresence mode="wait">
              <FolderOpenView key={openGroup.id} group={openGroup} isRoot />
            </AnimatePresence>
          )}

          {!isAtRoot && (
            /* Navigated to a specific page — show folder nav + page content */
            <div className="space-y-0">
              {currentGroup && (
                <FolderOpenView group={currentGroup} isRoot={false} />
              )}
              <div className="space-y-10">{children}</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
