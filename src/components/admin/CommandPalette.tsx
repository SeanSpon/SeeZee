"use client";

/**
 * Command Palette with fuzzy search (Ctrl+K)
 */

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { useCommandPalette } from "@/providers/CommandPaletteProvider";
import { searchCommands } from "@/lib/search";

export function CommandPalette() {
  const { isOpen, close, commands } = useCommandPalette();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    return searchCommands(query, commands);
  }, [query, commands]);

  // Reset on open/close
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, close]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Palette */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className="
            relative w-full max-w-2xl mx-4
            bg-slate-900/95 backdrop-blur-xl
            border border-white/10
            rounded-xl shadow-2xl
            overflow-hidden
          "
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for pages, actions, or entities..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              className="
                flex-1 bg-transparent
                text-white placeholder:text-slate-500
                focus:outline-none
              "
            />
            <kbd className="px-2 py-1 rounded bg-slate-800 text-slate-500 text-xs font-mono">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                {query ? "No results found" : "Start typing to search..."}
              </div>
            ) : (
              <div className="p-2">
                {filteredCommands.map((cmd, idx) => (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      cmd.action();
                      close();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3 rounded-lg
                      text-left transition-colors
                      ${
                        idx === selectedIndex
                          ? "bg-blue-500/20 text-white"
                          : "text-slate-300 hover:bg-slate-800/40"
                      }
                    `}
                  >
                    {cmd.icon && (
                      <span className="text-lg">{cmd.icon}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{cmd.label}</p>
                      {cmd.description && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {cmd.description}
                        </p>
                      )}
                    </div>
                    {cmd.category === "navigation" && (
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-slate-950/40 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono">
                  ↑↓
                </kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono">
                  ↵
                </kbd>
                Select
              </span>
            </div>
            <span>Search powered by SeeZee</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
