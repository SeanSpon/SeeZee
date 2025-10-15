"use client";

/**
 * Tools Client Component
 */

import { motion } from "framer-motion";
import { ExternalLink, Plus } from "lucide-react";

type Tool = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  url: string;
  icon: string | null;
  isPublished: boolean;
  createdAt: Date;
};

interface ToolsClientProps {
  tools: Tool[];
}

export function ToolsClient({ tools }: ToolsClientProps) {
  // Group tools by category
  const categories = Array.from(new Set(tools.map((t) => t.category)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Tools Directory</h1>
          <p className="text-slate-400 text-sm">
            {tools.length} tools across {categories.length} categories
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all">
          <Plus className="w-4 h-4" />
          Add Tool
        </button>
      </div>

      {categories.map((category) => {
        const categoryTools = tools.filter((t) => t.category === category);
        return (
          <div key={category} className="space-y-3">
            <h2 className="text-lg font-semibold text-white">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoryTools.map((tool, idx) => (
                <motion.a
                  key={tool.id}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="
                    group relative overflow-hidden rounded-xl
                    bg-slate-900/40 backdrop-blur-xl
                    border border-white/5
                    hover:border-white/10 hover:shadow-xl
                    transition-all duration-300
                    p-6
                  "
                >
                  {!tool.isPublished && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                        Draft
                      </span>
                    </div>
                  )}
                  
                  <div className="text-4xl mb-3">{tool.icon || "🔧"}</div>
                  <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                    {tool.name}
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  {tool.description && (
                    <p className="text-sm text-slate-400 mb-2 line-clamp-2">
                      {tool.description}
                    </p>
                  )}
                  <span className="text-xs text-slate-500">{tool.category}</span>
                </motion.a>
              ))}
            </div>
          </div>
        );
      })}

      {tools.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">No tools yet</p>
          <button className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all">
            Add First Tool
          </button>
        </div>
      )}
    </div>
  );
}
