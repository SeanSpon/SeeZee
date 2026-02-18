"use client";

import { useState, useEffect } from "react";
import { ExplorerTopBar } from "@/components/admin/explorer/ExplorerTopBar";
import { AdminNotificationBanner } from "@/components/admin/AdminNotificationBanner";
import type { CurrentUser } from "@/lib/auth/requireRole";

interface AdminDashboardShellProps {
  user: CurrentUser;
  children: React.ReactNode;
}

export function AdminDashboardShell({ user, children }: AdminDashboardShellProps) {
  const [userImage, setUserImage] = useState<string | undefined>(user.image ?? undefined);

  useEffect(() => {
    fetch("/api/user/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.image) setUserImage(data.image);
      })
      .catch(() => {});
  }, []);

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

        <div className="relative mx-auto w-full max-w-[1400px]">
          <div className="space-y-10">{children}</div>
        </div>
      </main>
    </div>
  );
}
