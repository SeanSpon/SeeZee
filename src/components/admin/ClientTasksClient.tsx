"use client";

import { useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/table/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { FiCalendar, FiFlag, FiUsers, FiCheckSquare, FiPlus, FiFile, FiDownload, FiPaperclip, FiSearch } from "react-icons/fi";
import { AdvancedAssignmentForm } from "./AdvancedAssignmentForm";
import { ClientTaskDetailModal } from "./ClientTaskDetailModal";

interface TaskRow {
  id: string;
  title: string;
  project: string;
  projectId?: string;
  client: string;
  organizationId?: string;
  organizationName?: string;
  status: string;
  priority: string;
  dueDate: string | null;
  type?: string;
  requiresUpload?: boolean;
  createdAt?: string;
  completedAt?: string | null;
  description?: string;
  submissionNotes?: string | null;
  data?: any;
  createdBy?: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface ClientTasksClientProps {
  rows: TaskRow[];
  overdue: number;
  openTasks: number;
}

export function ClientTasksClient({ rows, overdue, openTasks }: ClientTasksClientProps) {
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const handleTaskClick = (task: TaskRow) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const handleModalClose = () => {
    setShowDetailModal(false);
    setSelectedTask(null);
  };

  const handleTaskUpdate = () => {
    // Refresh the page to get updated data
    window.location.reload();
  };

  // Check if task has attachments
  const hasAttachments = (task: TaskRow) => {
    return task.data?.attachments && task.data.attachments.length > 0;
  };

  // Filter tasks based on search and filters
  const filteredRows = rows.filter((task) => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.client.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesType = typeFilter === "all" || task.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Get unique types for filter
  const uniqueTypes = Array.from(new Set(rows.map(r => r.type).filter(Boolean)));
  const uniqueStatuses = Array.from(new Set(rows.map(r => r.status)));

  const columns: DataTableColumn<TaskRow>[] = [
    {
      header: "Task",
      key: "title",
      render: (task) => (
        <div 
          className="space-y-1 cursor-pointer hover:text-[#ef4444] transition-colors"
          onClick={() => handleTaskClick(task)}
        >
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white">{task.title}</p>
            {hasAttachments(task) && (
              <FiPaperclip className="w-3.5 h-3.5 text-blue-400" title="Has attachments" />
            )}
            {task.requiresUpload && (
              <FiFile className="w-3.5 h-3.5 text-yellow-400" title="Requires upload" />
            )}
          </div>
          <p className="text-xs text-gray-500">{task.project}</p>
        </div>
      ),
    },
    {
      header: "Client",
      key: "client",
      render: (task) => (
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <FiUsers className="h-3.5 w-3.5 text-gray-500" />
          {task.client}
        </div>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (task) => <StatusBadge status={task.status} size="sm" />,
    },
    {
      header: "Priority",
      key: "priority",
      render: (task) => (
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400">
          <FiFlag className="h-3.5 w-3.5" />
          {task.priority || "medium"}
        </span>
      ),
    },
    {
      header: "Due",
      key: "dueDate",
      render: (task) => {
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
        return (
          <div className={`flex items-center gap-2 text-xs ${isOverdue ? 'text-red-400' : 'text-gray-300'}`}>
            <FiCalendar className="h-3.5 w-3.5" />
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
          </div>
        );
      },
    },
    {
      header: "Type",
      key: "type",
      render: (task) => (
        <span className="text-xs text-gray-400 capitalize">
          {task.type || "general"}
        </span>
      ),
    },
  ];

  return (
    <>
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-white transition-all duration-300 group hover:-translate-y-1 hover:border-white/20 hover:bg-white/10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-semibold">Open Tasks</p>
            <div className="w-10 h-10 bg-[#ef4444]/20 rounded-lg flex items-center justify-center border border-[#ef4444]/30">
              <FiCheckSquare className="w-5 h-5 text-[#ef4444]" />
            </div>
          </div>
          <p className="text-4xl font-heading font-bold text-white mb-1">{openTasks}</p>
          <p className="text-xs text-slate-500">Active deliverables</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-white transition-all duration-300 group hover:-translate-y-1 hover:border-white/20 hover:bg-white/10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-semibold">Overdue</p>
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center border border-red-500/30">
              <FiFlag className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <p className="text-4xl font-heading font-bold text-white mb-1">{overdue}</p>
          <p className="text-xs text-slate-500">Needs attention</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-white transition-all duration-300 group hover:-translate-y-1 hover:border-white/20 hover:bg-white/10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-semibold">Total Tasks</p>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
              <FiCalendar className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-4xl font-heading font-bold text-white mb-1">{rows.length}</p>
          <p className="text-xs text-slate-500">All time</p>
        </div>
      </section>

      {/* Filters Section */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search tasks, projects, or clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ef4444]/50"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#ef4444]/50"
            >
              <option value="all">All Status</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#ef4444]/50"
            >
              <option value="all">All Types</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {type?.charAt(0).toUpperCase() + type?.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
        {(searchTerm || statusFilter !== "all" || typeFilter !== "all") && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
            <span>Showing {filteredRows.length} of {rows.length} tasks</span>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setTypeFilter("all");
              }}
              className="text-[#ef4444] hover:text-[#ef4444]/80 ml-2"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white">All Client Tasks</h2>
          <p className="text-sm text-gray-400 mt-1">
            Click on any task to view details, attachments, and manage status
          </p>
        </div>
        <button
          onClick={() => setShowAssignmentForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#ef4444] hover:bg-[#ef4444]/90 text-white rounded-xl transition-all text-sm font-medium shadow-lg shadow-[#ef4444]/25"
        >
          <FiPlus className="w-4 h-4" />
          Create Assignment
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300">
        {rows.length === 0 ? (
          <div className="text-center py-12">
            <FiCheckSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No tasks found</h3>
            <p className="text-gray-400 mb-6">Create your first client assignment to get started</p>
            <button
              onClick={() => setShowAssignmentForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#ef4444] hover:bg-[#ef4444]/90 text-white rounded-xl transition-all font-medium shadow-lg shadow-[#ef4444]/25"
            >
              <FiPlus className="w-5 h-5" />
              Create First Assignment
            </button>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="text-center py-12">
            <FiCheckSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No tasks match your filters</h3>
            <p className="text-gray-400 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setTypeFilter("all");
              }}
              className="text-[#ef4444] hover:text-[#ef4444]/80"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredRows} emptyMessage="No tasks found" />
        )}
      </div>

      {showAssignmentForm && (
        <AdvancedAssignmentForm
          isOpen={showAssignmentForm}
          onClose={() => setShowAssignmentForm(false)}
          onSuccess={() => {
            setShowAssignmentForm(false);
            window.location.reload();
          }}
        />
      )}

      {selectedTask && (
        <ClientTaskDetailModal
          task={{
            id: selectedTask.id,
            title: selectedTask.title,
            description: selectedTask.description || "",
            status: selectedTask.status,
            type: selectedTask.type || "general",
            dueDate: selectedTask.dueDate,
            completedAt: selectedTask.completedAt || null,
            createdAt: selectedTask.createdAt || new Date().toISOString(),
            requiresUpload: selectedTask.requiresUpload || false,
            submissionNotes: selectedTask.submissionNotes || null,
            data: selectedTask.data || {},
            project: {
              id: selectedTask.projectId || "",
              name: selectedTask.project,
              organization: selectedTask.organizationId ? {
                id: selectedTask.organizationId,
                name: selectedTask.organizationName || selectedTask.client,
              } : undefined,
            },
            createdBy: selectedTask.createdBy || null,
          }}
          isOpen={showDetailModal}
          onClose={handleModalClose}
          onUpdate={handleTaskUpdate}
        />
      )}
    </>
  );
}

