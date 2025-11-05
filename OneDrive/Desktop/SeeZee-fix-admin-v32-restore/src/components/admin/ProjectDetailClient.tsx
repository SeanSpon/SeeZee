"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectFeed } from "@/components/shared/ProjectFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, DollarSign, Calendar, User, Plus, Trash } from "lucide-react";
import { toggleMilestone, createMilestone, deleteMilestone } from "@/server/actions/milestones";

interface ProjectDetailClientProps {
  project: any;
}

const statusColors: Record<string, string> = {
  LEAD: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PAID: "bg-green-500/20 text-green-400 border-green-500/30",
  IN_PROGRESS: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  REVIEW: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  COMPLETED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

const statusOptions = [
  { value: "LEAD", label: "Lead" },
  { value: "PAID", label: "Paid" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "REVIEW", label: "Review" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState(project.status);
  const [updating, setUpdating] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [addingMilestone, setAddingMilestone] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const response = await fetch("/api/projects/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, status: newStatus }),
      });

      if (response.ok) {
        setStatus(newStatus);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleMilestone = async (milestoneId: string) => {
    try {
      await toggleMilestone(milestoneId);
      router.refresh();
    } catch (error) {
      console.error("Failed to toggle milestone:", error);
    }
  };

  const handleAddMilestone = async () => {
    if (!newMilestoneTitle.trim()) return;
    
    setAddingMilestone(true);
    try {
      await createMilestone({
        projectId: project.id,
        title: newMilestoneTitle,
      });
      setNewMilestoneTitle("");
      router.refresh();
    } catch (error) {
      console.error("Failed to create milestone:", error);
    } finally {
      setAddingMilestone(false);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!confirm("Delete this milestone?")) return;
    
    try {
      await deleteMilestone(milestoneId);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete milestone:", error);
    }
  };

  const handleCreateInvoice = async (type: "deposit" | "final") => {
    const amount = type === "deposit" ? 50000 : 150000; // $500 or $1500 in cents
    
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          amountCents: amount,
          label: type,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Failed to create invoice:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            <p className="text-sm text-slate-400 mt-1">
              {project.organization?.name || "No organization"}
            </p>
          </div>
        </div>

        {/* Status Selector */}
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={updating}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium border
            bg-slate-900 cursor-pointer
            ${statusColors[status] || statusColors.LEAD}
            ${updating ? "opacity-50 cursor-wait" : ""}
          `}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {project.lead && (
          <div className="glass p-4 rounded-lg">
            <div className="text-slate-400 text-xs mb-1">Lead Contact</div>
            <div className="font-medium text-white">{project.lead.name}</div>
            <div className="text-sm text-slate-400">{project.lead.email}</div>
          </div>
        )}

        {project.assignee && (
          <div className="glass p-4 rounded-lg">
            <div className="text-slate-400 text-xs mb-1 flex items-center gap-1">
              <User className="w-3 h-3" /> Assigned To
            </div>
            <div className="font-medium text-white">{project.assignee.name}</div>
            <div className="text-sm text-slate-400">{project.assignee.email}</div>
          </div>
        )}

        {project.budget && (
          <div className="glass p-4 rounded-lg">
            <div className="text-slate-400 text-xs mb-1 flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Budget
            </div>
            <div className="text-xl font-bold text-green-400">
              ${Number(project.budget).toLocaleString()}
            </div>
          </div>
        )}

        <div className="glass p-4 rounded-lg">
          <div className="text-slate-400 text-xs mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Created
          </div>
          <div className="font-medium text-white">
            {new Date(project.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-800/50 border border-white/10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="glass p-6 rounded-lg">
            <h3 className="text-lg font-bold text-white mb-4">Project Details</h3>
            {project.description && (
              <p className="text-slate-300 mb-4">{project.description}</p>
            )}
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => handleCreateInvoice("deposit")}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
              >
                Create Deposit Invoice
              </button>
              <button
                onClick={() => handleCreateInvoice("final")}
                className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
              >
                Create Final Invoice
              </button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          <div className="space-y-4">
            {project.invoices && project.invoices.length > 0 ? (
              project.invoices.map((invoice: any) => (
                <div key={invoice.id} className="glass p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">{invoice.title || "Invoice"}</div>
                    <div className="text-sm text-slate-400">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">
                      ${(Number(invoice.total) || 0).toLocaleString()}
                    </div>
                    <div className={`text-sm ${
                      invoice.status === "PAID" ? "text-green-400" : "text-yellow-400"
                    }`}>
                      {invoice.status}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass p-8 rounded-lg text-center text-slate-400">
                No invoices yet. Create one above.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ProjectFeed events={project.feedEvents || []} />
        </TabsContent>

        <TabsContent value="milestones" className="mt-6">
          <div className="space-y-4">
            {/* Add Milestone Form */}
            <div className="glass p-4 rounded-lg">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  placeholder="New milestone title..."
                  className="flex-1 px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleAddMilestone();
                  }}
                />
                <button
                  onClick={handleAddMilestone}
                  disabled={!newMilestoneTitle.trim() || addingMilestone}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>

            {/* Milestones List */}
            {project.milestones && project.milestones.length > 0 ? (
              project.milestones.map((milestone: any) => (
                <div key={milestone.id} className="glass p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={milestone.completed}
                      onChange={() => handleToggleMilestone(milestone.id)}
                      className="mt-1 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className={`font-medium text-white ${
                        milestone.completed ? "line-through opacity-60" : ""
                      }`}>
                        {milestone.title}
                      </div>
                      {milestone.description && (
                        <div className="text-sm text-slate-400 mt-1">
                          {milestone.description}
                        </div>
                      )}
                      {milestone.dueDate && (
                        <div className="text-xs text-slate-500 mt-1">
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteMilestone(milestone.id)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete milestone"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass p-8 rounded-lg text-center text-slate-400">
                No milestones yet. Add one above to track progress.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
