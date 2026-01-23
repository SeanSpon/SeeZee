"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { formatActivityTime } from "@/lib/dashboard-helpers";
import type { ActionItem } from "@/lib/dashboard-helpers";

interface ActionPanelProps {
  actions: ActionItem[];
}

export default function ActionPanel({ actions }: ActionPanelProps) {
  if (actions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-white/10 bg-white/5 p-8 text-center"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-4xl">
          🎉
        </div>
        <h3 className="mb-2 font-heading text-xl font-bold text-white">
          All caught up!
        </h3>
        <p className="text-slate-400">
          No pending actions at the moment. We'll notify you when something needs your attention.
        </p>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-xl border border-white/10 bg-white/5 p-6"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <h2 className="font-heading text-xl font-bold text-white">
            Action Required
          </h2>
          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-400">
            {actions.length}
          </span>
        </div>
      </div>
      
      {/* Action List */}
      <div className="space-y-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className={`rounded-lg border p-4 transition-all ${
              action.completed
                ? "border-white/10 bg-white/5 opacity-60"
                : action.urgent
                ? "border-[#ef4444]/30 bg-[#ef4444]/5 hover:border-[#ef4444]/50"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className={`mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                  action.completed
                    ? "bg-green-500/20 text-green-400"
                    : action.urgent
                    ? "bg-[#ef4444]/20 text-[#ef4444]"
                    : "bg-[#22d3ee]/20 text-[#22d3ee]"
                }`}
              >
                {action.completed ? "✓" : action.urgent ? "!" : "•"}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="mb-1 font-semibold text-white">
                  {action.title}
                </h3>
                {action.description && (
                  <p className="mb-2 text-sm text-slate-400">
                    {action.description}
                  </p>
                )}
                
                {/* Meta */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  {action.completed && action.completedAt && (
                    <span>Completed {formatActivityTime(action.completedAt)}</span>
                  )}
                  {!action.completed && action.dueDate && (
                    <span className={action.urgent ? "text-[#ef4444]" : ""}>
                      Due {formatActivityTime(action.dueDate)}
                    </span>
                  )}
                  {action.type && (
                    <span className="capitalize">{action.type}</span>
                  )}
                </div>
              </div>
              
              {/* CTA */}
              {!action.completed && action.ctaLink && (
                <Link
                  href={action.ctaLink}
                  className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                    action.urgent
                      ? "bg-[#ef4444] text-white hover:bg-[#dc2626]"
                      : "bg-[#ef4444] text-white hover:bg-[#dc2626]"
                  }`}
                >
                  {action.cta} →
                </Link>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

