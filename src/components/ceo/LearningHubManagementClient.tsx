"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FiBook,
  FiTool,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiLink,
  FiSearch,
  FiFilter,
} from "react-icons/fi";
import {
  createLearningResource,
  deleteLearningResource,
  createTool,
  deleteTool,
} from "@/server/actions/learning";
import { useRouter } from "next/navigation";

interface Resource {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  url: string;
  category?: string | null;
  thumbnailUrl?: string | null;
  duration?: number | null;
  difficulty?: string | null;
  tags?: string[] | null;
  createdAt: Date;
}

interface Tool {
  id: string;
  name: string;
  description?: string | null;
  url: string;
  category: string;
  logoUrl?: string | null;
  pricing?: string | null;
  tags?: string[] | null;
  createdAt: Date;
}

interface LearningHubManagementClientProps {
  resources: Resource[];
  tools: Tool[];
}

type ViewType = "resources" | "tools";

export function LearningHubManagementClient({
  resources: initialResources,
  tools: initialTools,
}: LearningHubManagementClientProps) {
  const router = useRouter();
  const [activeView, setActiveView] = useState<ViewType>("resources");
  const [resources, setResources] = useState(initialResources);
  const [tools, setTools] = useState(initialTools);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleDeleteResource = useCallback(
    async (resourceId: string) => {
      if (!confirm("Are you sure you want to delete this resource?")) return;

      setLoading(true);
      setMessage(null);

      try {
        const result = await deleteLearningResource(resourceId);
        if (result.success) {
          setResources(resources.filter((r) => r.id !== resourceId));
          setMessage({ type: "success", text: "Resource deleted successfully" });
        } else {
          setMessage({ type: "error", text: result.error || "Failed to delete resource" });
        }
      } catch (error: any) {
        setMessage({ type: "error", text: error.message || "Failed to delete resource" });
      } finally {
        setLoading(false);
      }
    },
    [resources]
  );

  const handleDeleteTool = useCallback(
    async (toolId: string) => {
      if (!confirm("Are you sure you want to delete this tool?")) return;

      setLoading(true);
      setMessage(null);

      try {
        const result = await deleteTool(toolId);
        if (result.success) {
          setTools(tools.filter((t) => t.id !== toolId));
          setMessage({ type: "success", text: "Tool deleted successfully" });
        } else {
          setMessage({ type: "error", text: result.error || "Failed to delete tool" });
        }
      } catch (error: any) {
        setMessage({ type: "error", text: error.message || "Failed to delete tool" });
      } finally {
        setLoading(false);
      }
    },
    [tools]
  );

  const filteredResources = resources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentItems = activeView === "resources" ? filteredResources : filteredTools;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-#ef4444">
          CEO Command Center
        </span>
        <h1 className="text-3xl font-heading font-bold text-white">Learning Hub Management</h1>
        <p className="max-w-2xl text-sm text-gray-400">
          Manage training resources and tools catalog. Create, edit, and delete learning materials.
        </p>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg border p-4 ${
            message.type === "success"
              ? "border-green-500/20 bg-green-500/10 text-green-400"
              : "border-red-500/20 bg-red-500/10 text-red-400"
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800">
        {[
          { id: "resources" as ViewType, label: "Learning Resources", icon: FiBook, count: resources.length },
          { id: "tools" as ViewType, label: "Tools", icon: FiTool, count: tools.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveView(tab.id);
              setSearchQuery("");
            }}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeView === tab.id
                ? "border-#ef4444 text-#ef4444"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="font-medium">{tab.label}</span>
            <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeView === "resources" ? "resources" : "tools"}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-800 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-#ef4444"
          />
        </div>
        <button
          onClick={() => {
            // Navigate to create page or open modal
            router.push(
              activeView === "resources"
                ? "/admin/learning/resources?create=true"
                : "/admin/learning/tools?create=true"
            );
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-#ef4444 text-white font-semibold transition-colors hover:bg-#ef4444/90"
        >
          <FiPlus className="h-4 w-4" />
          Add {activeView === "resources" ? "Resource" : "Tool"}
        </button>
      </div>

      {/* Items Grid */}
      {currentItems.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-12 text-center">
          <p className="text-gray-400">
            {searchQuery
              ? `No ${activeView === "resources" ? "resources" : "tools"} found matching "${searchQuery}"`
              : `No ${activeView === "resources" ? "resources" : "tools"} yet. Create one to get started.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {currentItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-gray-800 bg-gray-900/70 p-5 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {"title" in item ? item.title : item.name}
                  </h3>
                  {"description" in item && item.description && (
                    <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      router.push(
                        activeView === "resources"
                          ? `/admin/learning/resources/${item.id}?edit=true`
                          : `/admin/learning/tools/${item.id}?edit=true`
                      );
                    }}
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                    title="Edit"
                  >
                    <FiEdit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (activeView === "resources") {
                        handleDeleteResource(item.id);
                      } else {
                        handleDeleteTool(item.id);
                      }
                    }}
                    className="p-2 rounded-lg text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                {"category" in item && item.category && (
                  <span className="px-2 py-1 rounded bg-gray-800">{item.category}</span>
                )}
                {"type" in item && (
                  <span className="px-2 py-1 rounded bg-gray-800">{item.type}</span>
                )}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-#ef4444 hover:text-#ef4444/80"
                  >
                    <FiLink className="h-3 w-3" />
                    Open
                  </a>
                )}
              </div>

              {"tags" in item && item.tags && item.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-gray-800 text-xs text-gray-400"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="px-2 py-0.5 rounded bg-gray-800 text-xs text-gray-400">
                      +{item.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

