"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Home, Briefcase, FolderKanban, Rocket, LayoutDashboard, Receipt, FileText, MessageSquare, Settings, HelpCircle, X } from "lucide-react";

interface Command {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "Navigation" | "Client" | "Admin";
}

const COMMANDS: Command[] = [
  { label: "Home", href: "/", icon: Home, category: "Navigation" },
  { label: "Services", href: "/services", icon: Briefcase, category: "Navigation" },
  { label: "Projects", href: "/projects", icon: FolderKanban, category: "Navigation" },
  { label: "Start a Project", href: "/start", icon: Rocket, category: "Navigation" },
  { label: "Client Dashboard", href: "/client", icon: LayoutDashboard, category: "Client" },
  { label: "Invoices", href: "/client/invoices", icon: Receipt, category: "Client" },
  { label: "Files", href: "/client/files", icon: FileText, category: "Client" },
  { label: "Messages", href: "/client/messages", icon: MessageSquare, category: "Client" },
  { label: "Settings", href: "/client/settings", icon: Settings, category: "Client" },
  { label: "Support", href: "/client/support", icon: HelpCircle, category: "Client" },
  { label: "Admin Dashboard", href: "/admin", icon: LayoutDashboard, category: "Admin" },
];

interface CommandMenuProps {
  open: boolean;
  onClose: () => void;
}

export function CommandMenu({ open, onClose }: CommandMenuProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter commands based on query
  const filteredCommands = COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  // Group by category
  const grouped = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  // Handle navigation
  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
    setQuery("");
    setSelectedIndex(0);
  };

  // Focus input when opened
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredCommands[selectedIndex].href);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, selectedIndex, filteredCommands]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command menu"
    >
      <div
        className="mx-auto mt-24 w-[min(640px,92vw)] rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="relative flex items-center border-b border-white/10 px-4">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search commands..."
            className="w-full bg-transparent px-3 py-4 text-sm text-white placeholder:text-slate-400 outline-none"
            aria-label="Search commands"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-slate-400">
              No commands found
            </div>
          ) : (
            Object.entries(grouped).map(([category, commands]) => (
              <div key={category} className="mb-3">
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {category}
                </div>
                <div className="space-y-1">
                  {commands.map((cmd, idx) => {
                    const globalIndex = filteredCommands.indexOf(cmd);
                    const isSelected = globalIndex === selectedIndex;
                    const Icon = cmd.icon;

                    return (
                      <button
                        key={cmd.href}
                        onClick={() => handleSelect(cmd.href)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        data-selected={isSelected}
                        className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-200 transition-colors
                                   hover:bg-white/5 data-[selected=true]:bg-gradient-to-r data-[selected=true]:from-blue-500/20 data-[selected=true]:to-purple-500/20
                                   data-[selected=true]:border data-[selected=true]:border-blue-500/30"
                      >
                        <Icon className="h-4 w-4 text-slate-400" />
                        <span className="flex-1">{cmd.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-white/10 px-4 py-2 flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">↑</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">Enter</kbd>
            Select
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">Esc</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );
}
