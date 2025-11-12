"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface ClientTabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
}

export function ClientTabNavigation({ tabs, activeTab, onTabChange, children }: ClientTabNavigationProps) {
  return (
    <div className="seezee-glass rounded-2xl overflow-hidden">
      <div className="flex border-b border-white/10 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                px-6 py-3 text-sm font-medium transition-all whitespace-nowrap
                flex items-center gap-2
                ${
                  isActive
                    ? "text-white bg-cyan-500/20 border-b-2 border-cyan-400"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }
              `}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

