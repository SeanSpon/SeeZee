"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { SidebarProvider } from "@/components/shared/SidebarContext";
import { DialogProvider } from "@/lib/dialog";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <SidebarProvider>
          <DialogProvider>
            {children}
          </DialogProvider>
        </SidebarProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}