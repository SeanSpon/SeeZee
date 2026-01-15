"use client";

/**
 * Tools Client Component - Card-based grid layout for tools
 */

import { useState, useMemo } from "react";
import { Plus, Search, ExternalLink, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type Tool = {
  id: string;
  name: string;
  description: string | null;
  url: string;
  category: string;
  logoUrl: string | null;
  pricing: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

interface ToolsClientProps {
  tools: Tool[];
}

const categoryColors: Record<string, string> = {
  Design: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  Development: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Marketing: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Tools: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Documentation: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Productivity: "bg-green-500/20 text-green-400 border-green-500/30",
  Communication: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  Analytics: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Other: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const categoryIcons: Record<string, string> = {
  Design: "🎨",
  Development: "💻",
  Marketing: "📢",
  Tools: "🔧",
  Documentation: "📚",
  Productivity: "⚡",
  Communication: "💬",
  Analytics: "📊",
  Other: "🔗",
};

export function ToolsClient({ tools: initialTools }: ToolsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [newTool, setNewTool] = useState({
    name: "",
    url: "",
    description: "",
    category: "Other",
    logoUrl: "",
    pricing: "",
  });

  // Filter and sort tools
  const filteredTools = useMemo(() => {
    let filtered = [...initialTools];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (tool) =>
          tool.name.toLowerCase().includes(searchLower) ||
          tool.description?.toLowerCase().includes(searchLower) ||
          tool.url.toLowerCase().includes(searchLower) ||
          tool.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter((tool) => tool.category === categoryFilter);
    }

    // Sort by category, then name
    return filtered.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });
  }, [initialTools, search, categoryFilter]);

  // Get unique categories from tools
  const categories = useMemo(() => {
    const cats = new Set(initialTools.map(t => t.category));
    return Array.from(cats).sort();
  }, [initialTools]);

  const handleDelete = async (toolId: string, toolName: string) => {
    if (!confirm(`Are you sure you want to delete "${toolName}"?`)) return;
    
    setDeleting(toolId);
    try {
      const response = await fetch(`/api/admin/tools/${toolId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to delete tool");
      }
    } catch (error) {
      console.error("Failed to delete tool:", error);
      alert("Failed to delete tool");
    }
    setDeleting(null);
  };

  const handleCreateTool = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/admin/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTool.name,
          url: newTool.url,
          description: newTool.description || undefined,
          category: newTool.category,
          logoUrl: newTool.logoUrl || undefined,
          pricing: newTool.pricing || undefined,
          tags: [],
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewTool({ name: "", url: "", description: "", category: "Other", logoUrl: "", pricing: "" });
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create tool");
      }
    } catch (error) {
      console.error("Failed to create tool:", error);
      alert("Failed to create tool");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Tools</h1>
            <p className="text-sm text-slate-400 mt-1">
              Quick access to all your tools and resources
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Tool
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-4 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {(search || categoryFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setCategoryFilter("");
              }}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">No tools found</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Add Your First Tool
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-5 hover:bg-slate-800/70 hover:border-white/20 transition-all duration-200"
            >
              {/* Icon and Actions */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {tool.logoUrl ? (
                    <img
                      src={tool.logoUrl}
                      alt={tool.name}
                      className="w-12 h-12 rounded-lg bg-slate-700/50 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-12 h-12 rounded-lg bg-slate-700/50 flex items-center justify-center text-xl ${tool.logoUrl ? 'hidden' : ''}`}>
                    {categoryIcons[tool.category] || "🔗"}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(tool.id, tool.name);
                    }}
                    disabled={deleting === tool.id}
                    className="p-1.5 hover:bg-red-500/20 rounded transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              {/* Title and Description */}
              <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                {tool.name}
              </h3>
              {tool.description && (
                <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                  {tool.description}
                </p>
              )}

              {/* Category Badge and Pricing */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium border ${categoryColors[tool.category] || categoryColors.Other}`}
                >
                  {tool.category}
                </span>
                {tool.pricing && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-slate-700/50 text-slate-300">
                    {tool.pricing}
                  </span>
                )}
              </div>

              {/* Tags */}
              {tool.tags && tool.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {tool.tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {tool.tags.length > 3 && (
                    <span className="text-slate-500 text-xs">
                      +{tool.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Link */}
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-4 h-4" />
                Open Tool
              </a>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Tool Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">Add New Tool</h3>
            <form onSubmit={handleCreateTool} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newTool.name}
                  onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                  required
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Figma"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={newTool.url}
                  onChange={(e) => setNewTool({ ...newTool, url: e.target.value })}
                  required
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://figma.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={newTool.description}
                  onChange={(e) =>
                    setNewTool({ ...newTool, description: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Design tool for creating interfaces"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Category
                  </label>
                  <select
                    value={newTool.category}
                    onChange={(e) =>
                      setNewTool({
                        ...newTool,
                        category: e.target.value,
                      })
                    }
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Design">Design</option>
                        <option value="Development">Development</option>
                        <option value="Tools">Tools</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Pricing (Optional)
                  </label>
                  <input
                    type="text"
                    value={newTool.pricing}
                    onChange={(e) => setNewTool({ ...newTool, pricing: e.target.value })}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Free / Paid"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Logo URL (Optional)
                </label>
                <input
                  type="url"
                  value={newTool.logoUrl}
                  onChange={(e) => setNewTool({ ...newTool, logoUrl: e.target.value })}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 rounded-lg text-white transition-opacity"
                >
                  Add Tool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
