"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronRight } from "react-icons/fi";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface CollapsibleNavGroupProps {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  items: NavItem[];
  defaultOpen?: boolean;
  isActive: (href: string) => boolean;
  onNavigate: (href: string) => void;
  badge?: string | number;
  className?: string;
  collapsed?: boolean;
}

export function CollapsibleNavGroup({
  title,
  icon: Icon,
  items,
  defaultOpen = false,
  isActive,
  onNavigate,
  badge,
  className = "",
  collapsed = false,
}: CollapsibleNavGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Check if any item in the group is active
  const hasActiveItem = items.some((item) => isActive(item.href));

  // Auto-open if any item is active
  const shouldBeOpen = isOpen || hasActiveItem;

  const toggle = useCallback(() => {
    if (collapsed) {
      setIsOpen((prev) => !prev);
    } else {
      setIsOpen((prev) => !prev);
    }
  }, [collapsed]);

  // When collapsed, show only icons in a vertical stack
  if (collapsed) {
    if (!Icon) return null;
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="relative group">
          <button
            onClick={toggle}
            className={`relative flex w-full items-center justify-center rounded-xl p-3 transition-all duration-200 ${
              hasActiveItem
                ? "bg-gradient-to-r from-[#ef4444]/20 to-[#ef4444]/10 text-white border border-[#ef4444]/30"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
            title={title}
          >
            <Icon className={`h-5 w-5 ${hasActiveItem ? "text-[#ef4444]" : ""}`} />
          </button>
          {/* Tooltip on hover */}
          <div className="absolute left-full ml-2 top-0 z-50 hidden group-hover:block">
            <div className="bg-[#1e293b] border border-white/10 rounded-xl shadow-xl px-3 py-2 min-w-[200px] backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-2">
                {Icon && <Icon className="h-4 w-4 text-[#ef4444]" />}
                <span className="font-medium text-white text-sm">{title}</span>
                {badge && (
                  <span className="rounded-full bg-[#ef4444]/20 px-2 py-0.5 text-xs font-semibold text-[#ef4444] border border-[#ef4444]/30">
                    {badge}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {items.map(({ href, label, icon: ItemIcon }) => {
                  const active = isActive(href);
                  if (!ItemIcon) return null;
                  return (
                    <button
                      key={href}
                      onClick={() => onNavigate(href)}
                      className={`w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-all duration-200 ${
                        active
                          ? "bg-[#ef4444]/20 text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <ItemIcon className={`h-3.5 w-3.5 ${active ? "text-[#ef4444]" : ""}`} />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!Icon) return null;
  
  return (
    <div className={`space-y-0.5 ${className}`}>
      {/* Group Header - Compact */}
      <button
        onClick={toggle}
        className={`group relative flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-all duration-200 ${
          hasActiveItem
            ? "bg-white/5 text-white"
            : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Icon className={`h-4 w-4 ${hasActiveItem ? "text-[#ef4444]" : "text-slate-500"}`} />
          <span className="font-medium text-sm">{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {badge && (
            <span className="rounded-full bg-[#ef4444]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#ef4444]">
              {badge}
            </span>
          )}
          <motion.div
            animate={{ rotate: shouldBeOpen ? 90 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <FiChevronRight className="h-3.5 w-3.5 text-slate-500" />
          </motion.div>
        </div>
      </button>

      {/* Group Items - Clean nested list */}
      <AnimatePresence initial={false}>
        {shouldBeOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="ml-3 space-y-0.5 border-l border-white/5 pl-3 py-1">
              {items.map(({ href, label, icon: ItemIcon }) => {
                const active = isActive(href);
                if (!ItemIcon) return null;
                return (
                  <motion.button
                    key={href}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onNavigate(href)}
                    className={`group relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-all duration-150 ${
                      active
                        ? "bg-[#ef4444]/10 text-white border-l-2 border-[#ef4444] -ml-[1px]"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    <ItemIcon className={`h-3.5 w-3.5 flex-shrink-0 ${active ? "text-[#ef4444]" : ""}`} />
                    <span className="text-[13px]">{label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
