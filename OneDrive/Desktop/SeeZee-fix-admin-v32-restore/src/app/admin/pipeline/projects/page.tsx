/**
 * Projects Management
 */

"use client";

import { DataTable, type Column } from "@/components/admin/DataTable";
import { Plus } from "lucide-react";

interface Project {
  id: string;
  name: string;
  client: string;
  status: "planning" | "in-progress" | "review" | "completed";
  progress: number;
  dueDate: Date;
}

// TODO: Fetch from Prisma
const mockProjects: Project[] = [
  {
    id: "proj-1",
    name: "E-commerce Redesign",
    client: "CloudTech Solutions",
    status: "in-progress",
    progress: 65,
    dueDate: new Date(2024, 3, 15),
  },
  {
    id: "proj-2",
    name: "Mobile App Development",
    client: "RetailCo",
    status: "planning",
    progress: 20,
    dueDate: new Date(2024, 4, 1),
  },
  {
    id: "proj-3",
    name: "Brand Identity",
    client: "Startup Inc",
    status: "review",
    progress: 90,
    dueDate: new Date(2024, 2, 28),
  },
];

const statusColors = {
  planning: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "in-progress": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  review: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
};

const columns: Column<Project>[] = [
  { key: "name", label: "Project", sortable: true },
  { key: "client", label: "Client", sortable: true },
  {
    key: "status",
    label: "Status",
    render: (project) => (
      <span
        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${
          statusColors[project.status]
        }`}
      >
        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
      </span>
    ),
  },
  {
    key: "progress",
    label: "Progress",
    render: (project) => (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${project.progress}%` }}
          />
        </div>
        <span className="text-xs text-slate-400">{project.progress}%</span>
      </div>
    ),
  },
  {
    key: "dueDate",
    label: "Due Date",
    render: (project) => project.dueDate.toLocaleDateString(),
  },
];

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <DataTable
        data={mockProjects}
        columns={columns}
        searchPlaceholder="Search projects..."
        actions={
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all">
            <Plus className="w-4 h-4" />
            New Project
          </button>
        }
        onRowClick={(project) => console.log("Open project:", project)}
      />
    </div>
  );
}


