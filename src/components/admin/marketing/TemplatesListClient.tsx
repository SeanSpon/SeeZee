"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  Power,
  Mail,
  Search,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: string;
  subject: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  campaigns: Array<{
    id: string;
    name: string;
    status: string;
    totalSent: number;
  }>;
}

interface Props {
  initialTemplates: Template[];
}

export function TemplatesListClient({ initialTemplates }: Props) {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  const categories = [
    "OUTREACH",
    "FOLLOW_UP",
    "MEETING",
    "PROPOSAL",
    "THANK_YOU",
    "NEWSLETTER",
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    setDeleting(id);
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete template");
      }

      setTemplates(templates.filter((t) => t.id !== id));
      alert("Template deleted successfully");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update template");
      }

      setTemplates(
        templates.map((t) =>
          t.id === id ? { ...t, active: !currentActive } : t
        )
      );
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      OUTREACH: "bg-purple-500/20 text-purple-300",
      FOLLOW_UP: "bg-blue-500/20 text-blue-300",
      MEETING: "bg-green-500/20 text-green-300",
      PROPOSAL: "bg-amber-500/20 text-amber-300",
      THANK_YOU: "bg-pink-500/20 text-pink-300",
      NEWSLETTER: "bg-cyan-500/20 text-cyan-300",
    };
    return colors[category] || "bg-slate-500/20 text-slate-300";
  };

  const stats = {
    total: templates.length,
    active: templates.filter((t) => t.active).length,
    inactive: templates.filter((t) => !t.active).length,
    totalSent: templates.reduce(
      (sum, t) => sum + t.campaigns.reduce((s, c) => s + c.totalSent, 0),
      0
    ),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/marketing"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-purple-400" />
              Email Templates
            </h1>
            <p className="text-slate-400 mt-1">
              Create and manage email templates for campaigns
            </p>
          </div>
        </div>
        <Link
          href="/admin/marketing/templates/new"
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Template
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/50 border border-white/10 rounded-xl">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-sm text-slate-400">Total Templates</p>
        </div>
        <div className="p-4 bg-slate-900/50 border border-white/10 rounded-xl">
          <p className="text-2xl font-bold text-green-400">{stats.active}</p>
          <p className="text-sm text-slate-400">Active</p>
        </div>
        <div className="p-4 bg-slate-900/50 border border-white/10 rounded-xl">
          <p className="text-2xl font-bold text-slate-400">{stats.inactive}</p>
          <p className="text-sm text-slate-400">Inactive</p>
        </div>
        <div className="p-4 bg-slate-900/50 border border-white/10 rounded-xl">
          <p className="text-2xl font-bold text-cyan-400">
            {stats.totalSent.toLocaleString()}
          </p>
          <p className="text-sm text-slate-400">Emails Sent</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Templates List */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-12 text-center">
          <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No templates found
          </h3>
          <p className="text-slate-400 mb-6">
            {searchQuery || categoryFilter !== "all"
              ? "Try adjusting your filters"
              : "Create your first email template to get started"}
          </p>
          {!searchQuery && categoryFilter === "all" && (
            <Link
              href="/admin/marketing/templates/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Template
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/80 border-b border-white/10">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">
                    Template
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">
                    Category
                  </th>
                  <th className="text-center p-4 text-sm font-medium text-slate-400">
                    Campaigns
                  </th>
                  <th className="text-center p-4 text-sm font-medium text-slate-400">
                    Emails Sent
                  </th>
                  <th className="text-center p-4 text-sm font-medium text-slate-400">
                    Status
                  </th>
                  <th className="text-center p-4 text-sm font-medium text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTemplates.map((template) => {
                  const campaignCount = template.campaigns.length;
                  const totalSent = template.campaigns.reduce(
                    (sum, c) => sum + c.totalSent,
                    0
                  );

                  return (
                    <tr
                      key={template.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-white">{template.name}</p>
                          <p className="text-sm text-slate-400 truncate max-w-md">
                            {template.subject}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                            template.category
                          )}`}
                        >
                          {template.category.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4 text-center text-white">
                        {campaignCount}
                      </td>
                      <td className="p-4 text-center text-white">
                        {totalSent.toLocaleString()}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() =>
                            handleToggleActive(template.id, template.active)
                          }
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            template.active
                              ? "bg-green-500/20 text-green-400"
                              : "bg-slate-500/20 text-slate-400"
                          }`}
                        >
                          {template.active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/admin/marketing/templates/${template.id}`}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Edit template"
                          >
                            <Edit className="w-4 h-4 text-slate-400 hover:text-white" />
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(template.id, template.name)
                            }
                            disabled={deleting === template.id}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete template"
                          >
                            <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Available Variables Info */}
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-3">
          Available Variables
        </h3>
        <p className="text-slate-300 text-sm mb-3">
          Use these variables in your templates - they'll be automatically replaced:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <code className="px-3 py-2 bg-slate-900 rounded text-cyan-400">
            {"{"}{"{"} prospectName {"}"}{"}"}
          </code>
          <code className="px-3 py-2 bg-slate-900 rounded text-cyan-400">
            {"{"}{"{"} company {"}"}{"}"}
          </code>
          <code className="px-3 py-2 bg-slate-900 rounded text-cyan-400">
            {"{"}{"{"} city {"}"}{"}"}
          </code>
          <code className="px-3 py-2 bg-slate-900 rounded text-cyan-400">
            {"{"}{"{"} state {"}"}{"}"}
          </code>
          <code className="px-3 py-2 bg-slate-900 rounded text-cyan-400">
            {"{"}{"{"} websiteUrl {"}"}{"}"}
          </code>
          <code className="px-3 py-2 bg-slate-900 rounded text-cyan-400">
            {"{"}{"{"} category {"}"}{"}"}
          </code>
          <code className="px-3 py-2 bg-slate-900 rounded text-cyan-400">
            {"{"}{"{"} leadScore {"}"}{"}"}
          </code>
          <code className="px-3 py-2 bg-slate-900 rounded text-cyan-400">
            {"{"}{"{"} yourName {"}"}{"}"}
          </code>
        </div>
      </div>
    </div>
  );
}
