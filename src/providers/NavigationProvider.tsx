"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export type AdminNavMode = "sidebar" | "explorer" | "dashboard";
export type FolderClickMode = "zoom" | "list" | "tabs";

interface NavigationContextType {
  adminNavMode: AdminNavMode;
  folderClickMode: FolderClickMode;
  openFolderId: string | null;
  setAdminNavMode: (mode: AdminNavMode) => void;
  setFolderClickMode: (mode: FolderClickMode) => void;
  setOpenFolderId: (id: string | null) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: React.ReactNode;
  initialNavMode?: AdminNavMode;
  initialClickMode?: FolderClickMode;
}

export function NavigationProvider({
  children,
  initialNavMode = "sidebar",
  initialClickMode = "zoom",
}: NavigationProviderProps) {
  const router = useRouter();
  const [adminNavMode, setAdminNavModeState] = useState<AdminNavMode>(initialNavMode);
  const [folderClickMode, setFolderClickModeState] = useState<FolderClickMode>(initialClickMode);
  const [openFolderId, setOpenFolderIdState] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Hydrate from localStorage if available, else use server-provided initial values
    const storedNavMode = localStorage.getItem("adminNavMode") as AdminNavMode | null;
    const storedClickMode = localStorage.getItem("folderClickMode") as FolderClickMode | null;

    if (storedNavMode && ["sidebar", "explorer", "dashboard"].includes(storedNavMode)) {
      setAdminNavModeState(storedNavMode);
    }
    if (storedClickMode && ["zoom", "list", "tabs"].includes(storedClickMode)) {
      setFolderClickModeState(storedClickMode);
    }

    setMounted(true);
  }, []);

  const persistPreference = useCallback((key: string, value: string) => {
    localStorage.setItem(key, value);
    // Fire-and-forget PATCH to persist server-side
    fetch("/api/settings/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    }).catch(() => {});
  }, []);

  const setAdminNavMode = useCallback(
    (mode: AdminNavMode) => {
      setAdminNavModeState(mode);
      persistPreference("adminNavMode", mode);
      // Refresh to re-run server layout with new shell
      router.refresh();
    },
    [persistPreference, router]
  );

  const setFolderClickMode = useCallback(
    (mode: FolderClickMode) => {
      setFolderClickModeState(mode);
      persistPreference("folderClickMode", mode);
    },
    [persistPreference]
  );

  const setOpenFolderId = useCallback((id: string | null) => {
    setOpenFolderIdState(id);
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        adminNavMode,
        folderClickMode,
        openFolderId,
        setAdminNavMode,
        setFolderClickMode,
        setOpenFolderId,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
}
