"use client";

import { motion } from "framer-motion";
import { Wrench, ExternalLink, Tag, Eye } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  category: string;
  url: string;
  description: string | null;
  visibility: string;
  icon: string | null;
  tags: string[];
  createdAt: string;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface AdminToolsClientProps {
  tools: Tool[];
}

export function AdminToolsClient({ tools }: AdminToolsClientProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Development: "bg-blue-500/20 text-blue-300",
      Design: "bg-purple-500/20 text-purple-300",
      Communication: "bg-green-500/20 text-green-300",
      "Project Management": "bg-orange-500/20 text-orange-300",
      Analytics: "bg-pink-500/20 text-pink-300",
      Productivity: "bg-cyan-500/20 text-cyan-300",
      Marketing: "bg-yellow-500/20 text-yellow-300",
      Sales: "bg-red-500/20 text-red-300",
      DevOps: "bg-indigo-500/20 text-indigo-300",
      Security: "bg-emerald-500/20 text-emerald-300",
      Other: "bg-slate-500/20 text-slate-300",
    };
    return colors[category] || colors.Other;
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case "PUBLIC":
        return "text-green-400";
      case "CLIENT":
        return "text-blue-400";
      case "INTERNAL":
      default:
        return "text-slate-400";
    }
  };

  if (tools.length === 0) {
    return (
      <div className="glass p-8 rounded-lg text-center">
        <Wrench className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 mb-2">No tools available yet</p>
        <p className="text-sm text-slate-500">
          Tools will appear here once they are created by the CEO
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Tools Directory</h1>
          <p className="text-slate-400 text-sm">
            {tools.length} tool{tools.length !== 1 ? 's' : ''} available • View only
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool, idx) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="
              p-5 rounded-xl
              bg-slate-900/40 backdrop-blur-xl border border-white/5
              hover:border-white/10 hover:bg-slate-900/60
              transition-all
            "
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-purple-400 flex items-center justify-center text-2xl flex-shrink-0">
                {tool.icon || <Wrench className="w-6 h-6" />}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(tool.category)}`}>
                  {tool.category}
                </span>
                <span className={`flex items-center gap-1 text-xs ${getVisibilityColor(tool.visibility)}`}>
                  <Eye className="w-3 h-3" />
                  {tool.visibility}
                </span>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">
              {tool.name}
            </h3>

            {tool.description && (
              <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                {tool.description}
              </p>
            )}

            {tool.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {tool.tags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
                {tool.tags.length > 3 && (
                  <span className="text-xs text-slate-500">
                    +{tool.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg text-sm font-medium transition-colors"
            >
              Open Tool
              <ExternalLink className="w-4 h-4" />
            </a>

            <div className="text-xs text-slate-500 mt-3 pt-3 border-t border-white/5">
              Added by {tool.createdBy.name || tool.createdBy.email}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Notice */}
      <div className="glass p-4 rounded-lg border border-slate-700">
        <p className="text-sm text-slate-400 text-center">
          This is a read-only view. To create or manage tools, visit the{" "}
          <a href="/ceo/tools" className="text-purple-400 hover:underline">
            CEO Tools Dashboard
          </a>
          .
        </p>
      </div>
    </div>
  );
}
