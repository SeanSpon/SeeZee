"use client";

import { useState, useEffect } from "react";
import { Plus, Search, ExternalLink, Edit, Trash2, Wrench, UserPlus, Eye } from "lucide-react";
import AssignToolModal from "@/components/ceo/AssignToolModal";
import ToolCreateModal from "@/components/ceo/ToolCreateModal";
import { toast } from "@/hooks/use-toast";
import { isAdminLike } from "@/lib/role";
import type { Role } from "@/lib/role";

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
  createdBy?: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface AdminToolsClientProps {
  tools: Tool[];
  userRole?: Role;
}

export function AdminToolsClient({ tools: initialTools, userRole }: AdminToolsClientProps) {
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

  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const canManage = isAdminLike(userRole);

  useEffect(() => {
    setTools(initialTools);
  }, [initialTools]);

  useEffect(() => {
    if (categoryFilter || visibilityFilter || search) {
      loadTools();
    } else {
      setTools(initialTools);
    }
  }, [categoryFilter, visibilityFilter]);

  const normalizeTools = (json: any): Tool[] => {
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.items)) return json.items;
    if (json && Array.isArray(json.tools)) return json.tools;
    return [];
  };

  const loadTools = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter) params.append("category", categoryFilter);
      if (visibilityFilter) params.append("visibility", visibilityFilter);
      if (search) params.append("q", search);

      const response = await fetch(`/api/ceo/tools?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch tools");
      const json = await response.json();
      setTools(normalizeTools(json));
    } catch (error) {
      console.error("Failed to load tools:", error);
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadTools();
  };

  const handleDelete = async (toolId: string, toolName: string) => {
    if (!confirm(`Are you sure you want to delete "${toolName}"? This will also delete all assignments.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/ceo/tools/${toolId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete tool");
      }

      toast("Tool deleted successfully", "success");
      loadTools();
    } catch (error) {
      console.error("Failed to delete tool:", error);
      toast("Failed to delete tool", "error");
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tools Catalog</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage tools and software used by the team
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Tool
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="glass p-4 rounded-lg space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Search
          </button>
        </div>

        <div className="flex gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Categories</option>
            <option value="Development">Development</option>
            <option value="Design">Design</option>
            <option value="Communication">Communication</option>
            <option value="Project Management">Project Management</option>
            <option value="Analytics">Analytics</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            <option value="Productivity">Productivity</option>
            <option value="DevOps">DevOps</option>
            <option value="Security">Security</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Visibility</option>
            <option value="INTERNAL">Internal Only</option>
            <option value="PUBLIC">Public</option>
            <option value="CLIENT">Client Access</option>
          </select>

          {(categoryFilter || visibilityFilter || search) && (
            <button
              onClick={() => {
                setCategoryFilter("");
                setVisibilityFilter("");
                setSearch("");
                setTools(initialTools);
              }}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Tool Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading tools...</div>
      ) : tools.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">No tools found</p>
          {canManage && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add Your First Tool
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="glass p-5 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {tool.icon ? (
                    <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-xl">
                      {tool.icon}
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-purple-400" />
                    </div>
                  )}
                </div>
                {canManage && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setSelectedTool(tool);
                        setAssignModalOpen(true);
                      }}
                      className="p-1.5 hover:bg-purple-500/20 rounded transition-colors"
                      title="Assign to Users"
                    >
                      <UserPlus className="w-4 h-4 text-purple-400" />
                    </button>
                    <button
                      onClick={() => {
                        // Edit modal functionality - to be implemented in future update
                        toast("Edit functionality coming soon", "info");
                      }}
                      className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(tool.id, tool.name)}
                      className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-semibold mb-2">{tool.name}</h3>

              {tool.description && (
                <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                  {tool.description}
                </p>
              )}

              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(
                    tool.category
                  )}`}
                >
                  {tool.category}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium bg-slate-700 text-slate-300 flex items-center gap-1`}>
                  <Eye className="w-3 h-3" />
                  {tool.visibility}
                </span>
              </div>

              {tool.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {tool.tags.slice(0, 2).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {tool.tags.length > 2 && (
                    <span className="text-slate-500 text-xs">
                      +{tool.tags.length - 2}
                    </span>
                  )}
                </div>
              )}

              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open Tool
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {canManage && (
        <ToolCreateModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            loadTools();
          }}
        />
      )}

      {/* Assignment Modal */}
      {canManage && selectedTool && (
        <AssignToolModal
          isOpen={assignModalOpen}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedTool(null);
          }}
          onSuccess={() => {
            loadTools();
          }}
          toolId={selectedTool.id}
          toolName={selectedTool.name}
        />
      )}
    </div>
  );
}
