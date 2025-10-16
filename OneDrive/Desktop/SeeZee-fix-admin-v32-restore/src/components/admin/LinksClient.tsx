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
          <button className="admin-btn-primary">
            <Plus className="w-4 h-4" />
            Add Link
          </button>
        }
        onRowClick={(link) => window.open(link.url, "_blank")}
      />
    </div>
  );
}
