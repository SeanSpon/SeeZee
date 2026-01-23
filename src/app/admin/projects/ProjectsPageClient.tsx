"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/table/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { EnhancedStatCard } from "@/components/admin/shared/EnhancedStatCard";
import { FiDollarSign, FiCalendar, FiUsers, FiTrash2, FiEdit, FiPlus, FiTrendingUp, FiUserPlus } from "react-icons/fi";
import { CreateProjectModal } from "@/components/admin/CreateProjectModal";
import type { CurrentUser } from "@/lib/auth/requireRole";

interface ProjectRow {
  id: string;
  name: string;
  client: string;
  status: string;
  budget: number | null;
  dueDate: string | null;
  assignee: string;
  progress: number;
}

interface Organization {
  id: string;
  name: string | null;
  email: string | null;
  website?: string | null;
  phone?: string | null;
}

interface Admin {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image?: string | null;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

interface ProjectsPageClientProps {
  user: CurrentUser;
  initialData: {
    projects: ProjectRow[];
    totalBudget: number;
    activeProjects: number;
    clients: Organization[];
    admins: Admin[];
  };
}

export function ProjectsPageClient({ user, initialData }: ProjectsPageClientProps) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialData.projects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (projectId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(projectId);
    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete project");
      }

      // Remove from local state
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (error: any) {
      console.error("Failed to delete project:", error);
      alert(`Failed to delete project: ${error.message}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleCreateProject = () => {
    setIsModalOpen(true);
  };

  const handleProjectCreated = () => {
    setIsModalOpen(false);
    router.refresh();
  };

  const columns: DataTableColumn<ProjectRow>[] = [
    {
      header: "Project",
      key: "name",
      render: (project) => (
        <div className="space-y-1">
          <p className="font-heading text-sm font-semibold text-white">{project.name}</p>
          <p className="text-xs text-gray-400">{project.client}</p>
        </div>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (project) => <StatusBadge status={project.status.toLowerCase()} size="sm" />,
    },
    {
      header: "Progress",
      key: "progress",
      render: (project) => (
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-trinity-red to-trinity-maroon"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-300 w-8 text-right">{project.progress}%</span>
        </div>
      ),
    },
    {
      header: "Budget",
      key: "budget",
      render: (project) => (
        <span className="text-sm font-semibold text-white">
          {project.budget ? currencyFormatter.format(project.budget) : "—"}
        </span>
      ),
    },
    {
      header: "Due Date",
      key: "dueDate",
      render: (project) => (
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <FiCalendar className="h-3.5 w-3.5 text-gray-500" />
          {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : "Not set"}
        </div>
      ),
    },
    {
      header: "Owner",
      key: "assignee",
      render: (project) => (
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <FiUsers className="h-3.5 w-3.5 text-gray-500" />
          {project.assignee}
        </div>
      ),
    },
    {
      header: "",
      key: "actions",
      render: (project) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/projects/${project.id}`);
            }}
            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
            title="View/Edit Project"
          >
            <FiEdit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(project.id, project.name);
            }}
            disabled={deleting === project.id}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete Project"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-3 relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red glow-on-hover inline-block mb-2">
              Delivery Operations
            </span>
            <h1 className="text-4xl font-heading font-bold gradient-text">Projects</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/projects/create"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-emerald-500/40 bg-emerald-500/10 px-5 py-2.5 text-sm font-medium text-emerald-400 transition-all hover:bg-emerald-500 hover:text-white hover:shadow-large hover:border-emerald-500"
            >
              <FiUserPlus className="h-4 w-4" />
              Create from Lead
            </Link>
            <button
              onClick={handleCreateProject}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-trinity-red/40 bg-trinity-red/10 px-5 py-2.5 text-sm font-medium text-trinity-red transition-all hover:bg-trinity-red hover:text-white hover:shadow-large hover:border-trinity-red"
            >
              <FiPlus className="h-4 w-4" />
              New Project
            </button>
          </div>
        </div>
        <p className="max-w-2xl text-base text-gray-300 leading-relaxed">
          Portfolio view of every active build, including assigned owners and projected revenue impact.
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <EnhancedStatCard
          label="Active Projects"
          value={initialData.activeProjects}
          icon={FiTrendingUp}
          iconColor="text-trinity-red"
          iconBgColor="bg-trinity-red/20"
          subtitle="In progress"
        />
        <EnhancedStatCard
          label="Total Budget"
          value={currencyFormatter.format(initialData.totalBudget)}
          icon={FiDollarSign}
          iconColor="text-green-400"
          iconBgColor="bg-green-500/20"
          subtitle="Revenue pipeline"
        />
        <EnhancedStatCard
          label="Total Projects"
          value={projects.length}
          icon={FiCalendar}
          iconColor="text-blue-400"
          iconBgColor="bg-blue-500/20"
          subtitle="All time"
        />
      </section>

      <div className="glass-effect rounded-2xl border-2 border-gray-700 p-6 hover:border-trinity-red/30 transition-all duration-300">
        <DataTable
          columns={columns}
          data={projects}
          emptyMessage="No projects found"
        />
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleProjectCreated}
        clients={initialData.clients}
        admins={initialData.admins}
      />
    </div>
  );
}
