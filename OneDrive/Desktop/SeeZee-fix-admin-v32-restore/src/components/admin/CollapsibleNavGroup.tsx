"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";

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
      // When collapsed, clicking the icon should show a tooltip or navigate to first item
      // For now, just toggle the open state
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
            className={`relative flex w-full items-center justify-center rounded-lg p-3 transition-all duration-200 ${
              hasActiveItem
                ? "bg-trinity-red/10 text-white border border-trinity-red/20"
                : "text-gray-400 hover:bg-gray-800/50 hover:text-white hover:border hover:border-gray-700"
            }`}
            title={title}
          >
            <Icon className={`h-5 w-5 ${hasActiveItem ? "text-trinity-red" : ""}`} />
          </button>
          {/* Tooltip on hover */}
          <div className="absolute left-full ml-2 top-0 z-50 hidden group-hover:block">
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl px-3 py-2 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                {Icon && <Icon className="h-4 w-4 text-trinity-red" />}
                <span className="font-medium text-white text-sm">{title}</span>
                {badge && (
                  <span className="rounded-full bg-trinity-red/20 px-2 py-0.5 text-xs font-semibold text-trinity-red border border-trinity-red/30">
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
                      className={`w-full flex items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors ${
                        active
                          ? "bg-trinity-red/20 text-white"
                          : "text-gray-400 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      <ItemIcon className={`h-3.5 w-3.5 ${active ? "text-trinity-red" : ""}`} />
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
    <div className={`space-y-1 ${className}`}>
      <button
        onClick={toggle}
        className={`group relative flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-all duration-200 ${
          hasActiveItem
            ? "bg-trinity-red/10 text-white border border-trinity-red/20"
            : "text-gray-400 hover:bg-gray-800/50 hover:text-white hover:border hover:border-gray-700"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${hasActiveItem ? "text-trinity-red" : ""}`} />
          <span className="font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="rounded-full bg-trinity-red/20 px-2 py-0.5 text-xs font-semibold text-trinity-red border border-trinity-red/30">
              {badge}
            </span>
          )}
          <motion.div
            animate={{ rotate: shouldBeOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <FiChevronRight className="h-4 w-4" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {shouldBeOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-4 space-y-1 border-l-2 border-gray-700 pl-4">
              {items.map(({ href, label, icon: ItemIcon }) => {
                const active = isActive(href);
                if (!ItemIcon) return null;
                return (
                  <motion.button
                    key={href}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onNavigate(href)}
                    className={`group relative flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left transition-all duration-200 ${
                      active
                        ? "bg-trinity-red/20 text-white shadow-large border border-trinity-red/30"
                        : "text-gray-400 hover:bg-gray-800/50 hover:text-white hover:border hover:border-gray-700"
                    }`}
                  >
                    <ItemIcon className={`h-4 w-4 ${active ? "text-trinity-red" : ""}`} />
                    <span className="text-sm font-medium">{label}</span>
                    {active && (
                      <motion.div
                        layoutId={`admin-nav-active-${href}`}
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-trinity-red/10 to-trinity-maroon/10"
                        transition={{ type: "spring", stiffness: 250, damping: 30 }}
                      />
                    )}
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

