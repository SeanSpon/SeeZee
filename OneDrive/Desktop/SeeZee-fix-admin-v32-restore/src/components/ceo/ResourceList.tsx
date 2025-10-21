"use client";

import { useState, useEffect } from "react";
import { Plus, Search, ExternalLink, Edit, Trash2, UserPlus } from "lucide-react";
import AssignResourceModal from "./AssignResourceModal";
import ResourceCreateModal from "./ResourceCreateModal";
import { toast } from "@/hooks/use-toast";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  url: string;
  visibility: string;
  tags: string[];
  createdAt: string;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default function ResourceList() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  useEffect(() => {
    loadResources();
  }, [visibilityFilter]);

  const normalizeResources = (json: any): Resource[] => {
    // Support {items: [...]}, {resources: [...]}, or raw [...]
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.items)) return json.items;
    if (json && Array.isArray(json.resources)) return json.resources;
    return [];
  };

  const loadResources = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (visibilityFilter) params.append("visibility", visibilityFilter);
      if (search) params.append("q", search);

      const response = await fetch(`/api/ceo/resources?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch resources");
      const json = await response.json();
      setResources(normalizeResources(json));
    } catch (error) {
      console.error("Failed to load resources:", error);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadResources();
  };

  const handleDelete = async (resourceId: string, resourceTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${resourceTitle}"? This will also delete all assignments.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/ceo/resources/${resourceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete resource");
      }

      toast("Resource deleted successfully", "success");
      loadResources();
    } catch (error) {
      console.error("Failed to delete resource:", error);
      toast("Failed to delete resource", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Resources Library</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage reference materials and documentation
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Resource
        </button>
      </div>

      {/* Search and Filters */}
      <div className="glass p-4 rounded-lg space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search resources..."
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
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Visibility</option>
            <option value="INTERNAL">Internal Only</option>
            <option value="PUBLIC">Public</option>
            <option value="CLIENT">Client Access</option>
          </select>

          {(visibilityFilter || search) && (
            <button
              onClick={() => {
                setVisibilityFilter("");
                setSearch("");
              }}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Resource Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">
          Loading resources...
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">No resources found</p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Add Your First Resource
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="glass p-5 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold flex-1 pr-2">
                  {resource.title}
                </h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setSelectedResource(resource);
                      setAssignModalOpen(true);
                    }}
                    className="p-1.5 hover:bg-purple-500/20 rounded transition-colors"
                    title="Assign to Users"
                  >
                    <UserPlus className="w-4 h-4 text-purple-400" />
                  </button>
                  <button
                    onClick={() => {
                      /* TODO: Open edit modal */
                    }}
                    className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(resource.id, resource.title)}
                    className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              {resource.description && (
                <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                  {resource.description}
                </p>
              )}

              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 rounded text-xs font-medium bg-slate-700 text-slate-300">
                  {resource.visibility}
                </span>
              </div>

              {resource.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {resource.tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {resource.tags.length > 3 && (
                    <span className="text-slate-500 text-xs">
                      +{resource.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open Resource
              </a>

              <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-500">
                Added by {resource.createdBy.name || resource.createdBy.email}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <ResourceCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          loadResources();
        }}
      />

      {/* Assignment Modal */}
      {selectedResource && (
        <AssignResourceModal
          isOpen={assignModalOpen}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedResource(null);
          }}
          onSuccess={() => {
            loadResources();
          }}
          resourceId={selectedResource.id}
          resourceTitle={selectedResource.title}
        />
      )}
    </div>
  );
}
