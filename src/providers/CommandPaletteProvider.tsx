"use client";

/**
 * Command Palette Provider for global Ctrl+K search
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { SearchCommand } from "@/lib/search";

interface CommandPaletteContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  commands: SearchCommand[];
  registerCommands: (commands: SearchCommand[]) => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextType | undefined>(
  undefined
);

export function CommandPaletteProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [commands, setCommands] = useState<SearchCommand[]>([]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const registerCommands = useCallback((newCommands: SearchCommand[]) => {
    setCommands((prev) => {
      // Merge, replacing commands with same ID
      const map = new Map(prev.map((c) => [c.id, c]));
      newCommands.forEach((c) => map.set(c.id, c));
      return Array.from(map.values());
    });
  }, []);

  // Global keyboard shortcut: Ctrl+K (or Cmd+K on Mac)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
      // Escape to close
      if (e.key === "Escape" && isOpen) {
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle, close, isOpen]);

  return (
    <CommandPaletteContext.Provider
      value={{
        isOpen,
        open,
        close,
        toggle,
        commands,
        registerCommands,
      }}
    >
      {children}
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error(
      "useCommandPalette must be used within CommandPaletteProvider"
    );
  }
  return context;
}
