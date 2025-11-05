"use client";

/**
 * Links Client Component
 */

import { DataTable, type Column } from "@/components/admin/DataTable";
import { Plus, ExternalLink, Trash2 } from "lucide-react";
import { deleteLink } from "@/server/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Link = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  category: string;
  icon: string | null;
  color: string | null;
  order: number;
  pinned: boolean;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
};

interface LinksClientProps {
  links: Link[];
}

const typeColors: Record<string, string> = {
  GITHUB: "bg-purple-500/20 text-purple-400",
  FIGMA: "bg-pink-500/20 text-pink-400",
  NOTION: "bg-slate-500/20 text-slate-400",
  CLIENT: "bg-blue-500/20 text-blue-400",
  OTHER: "bg-slate-500/20 text-slate-400",
};

export function LinksClient({ links }: LinksClientProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    description: "",
    category: "OTHER",
    icon: "",
  });

  const handleDelete = async (linkId: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    
    setDeleting(linkId);
    const result = await deleteLink(linkId);
    
    if (result.success) {
      router.refresh();
    } else {
      alert("Failed to delete link");
    }
    setDeleting(null);
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      const response = await fetch("/api/admin/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLink),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewLink({ title: "", url: "", description: "", category: "OTHER", icon: "" });
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to create link:", error);
    } finally {
      setCreating(false);
    }
  };

  const columns: Column<Link>[] = [
    { 
      key: "title", 
      label: "Title", 
      sortable: true,
      render: (link) => (
        <div>
          <div className="font-medium text-white">{link.title}</div>
          {link.description && (
            <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
              {link.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "category",
      label: "Type",
      render: (link) => (
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
            typeColors[link.category] || typeColors.OTHER
          }`}
        >
          {link.category}
        </span>
      ),
    },
    {
      key: "icon",
      label: "Icon",
      render: (link) => (
        <div className="text-center">
          {link.icon ? (
            <span className="text-lg">{link.icon}</span>
          ) : (
            <span className="text-slate-500">—</span>
          )}
        </div>
      ),
    },
    {
      key: "url",
      label: "URL",
      render: (link) => (
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          Open
          <ExternalLink className="w-3 h-3" />
        </a>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (link) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(link.id);
          }}
          disabled={deleting === link.id}
          className="text-red-400 hover:text-red-300 disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Links</h1>
        <p className="admin-page-subtitle">
          Manage project links, repositories, and resources
        </p>
      </div>

      <DataTable
        data={links}
        columns={columns}
        searchPlaceholder="Search links..."
        actions={
          <button className="admin-btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" />
            Add Link
          </button>
        }
        onRowClick={(link) => window.open(link.url, "_blank")}
      />

      {/* Create Link Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">Add New Link</h3>
            <form onSubmit={handleCreateLink} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Title</label>
                <input
                  type="text"
                  value={newLink.title}
                  onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                  required
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white"
                  placeholder="GitHub Repository"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">URL</label>
                <input
                  type="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  required
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white"
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Description (Optional)</label>
                <input
                  type="text"
                  value={newLink.description}
                  onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white"
                  placeholder="Main project repository"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Category</label>
                  <select
                    value={newLink.category}
                    onChange={(e) => setNewLink({ ...newLink, category: e.target.value })}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="GITHUB">GitHub</option>
                    <option value="FIGMA">Figma</option>
                    <option value="NOTION">Notion</option>
                    <option value="CLIENT">Client</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Icon (Emoji)</label>
                  <input
                    type="text"
                    value={newLink.icon}
                    onChange={(e) => setNewLink({ ...newLink, icon: e.target.value })}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white text-center text-xl"
                    placeholder="📦"
                    maxLength={2}
                  />
                </div>
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
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors disabled:opacity-50"
                >
                  {creating ? "Adding..." : "Add Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
