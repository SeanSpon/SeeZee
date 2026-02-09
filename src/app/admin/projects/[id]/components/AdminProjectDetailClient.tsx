"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  FileText, 
  Target, 
  ListTodo, 
  Folder, 
  MessageSquare, 
  Send, 
  CreditCard, 
  Github, 
  Settings, 
  Plus, 
  ExternalLink, 
  Globe,
  User,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  Users,
  DollarSign,
  TrendingUp,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminProjectTasks } from "./AdminProjectTasks";
import { RepositoryTab } from "@/app/(client)/client/components/RepositoryTab";
import { SettingsTab } from "@/app/(client)/client/components/SettingsTab";
import { AdminChangeRequestsSection } from "./AdminChangeRequestsSection";
import { GitIntegrationPanel } from "@/components/admin/projects/GitIntegrationPanel";
import { VercelDeploymentsPanel } from "@/components/admin/projects/VercelDeploymentsPanel";

interface AdminProjectDetailClientProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    budget: number | null;
    monthlyRecurringRevenue: number | null;
    startDate: Date | null;
    endDate: Date | null;
    createdAt: Date;
    githubRepo: string | null;
    vercelUrl: string | null;
    assignee: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    } | null;
    organization: {
      id: string;
      name: string;
      members: Array<{
        userId: string;
        user: {
          id: string;
          name: string | null;
          email: string | null;
        };
      }>;
    };
    milestones: Array<{
      id: string;
      name: string;
      description: string | null;
      completed: boolean;
      dueDate: Date | null;
      createdAt: Date;
    }>;
    clientTasks: Array<any>;
    adminTasks: Array<any>;
    files: Array<any>;
    requests: Array<any>;
    messageThreads: Array<any>;
    invoices: Array<any>;
    questionnaire: any;
  };
}

// Hub tabs - focused on what matters
type TabType = "overview" | "tasks" | "activity" | "client" | "financials" | "more";

export function AdminProjectDetailClient({ project }: AdminProjectDetailClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [showAddTask, setShowAddTask] = useState(false);
  const [mrrValue, setMrrValue] = useState<string>(
    project.monthlyRecurringRevenue ? String(project.monthlyRecurringRevenue) : ""
  );
  const [mrrLoading, setMrrLoading] = useState(false);
  const [mrrError, setMrrError] = useState<string>("");

  // =============================================
  // MRR MANAGEMENT
  // =============================================
  const handleUpdateMrr = async () => {
    setMrrError("");
    setMrrLoading(true);

    try {
      const mrrNum = mrrValue ? parseFloat(mrrValue) : null;

      if (mrrNum !== null && (isNaN(mrrNum) || mrrNum < 0)) {
        setMrrError("Please enter a valid positive number");
        setMrrLoading(false);
        return;
      }

      const response = await fetch(`/api/admin/projects/${project.id}/mrr`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyRecurringRevenue: mrrNum }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMrrError(data.error || "Failed to update MRR");
        setMrrLoading(false);
        return;
      }

      // Success - update local state to reflect the change
      setMrrValue(mrrNum ? String(mrrNum) : "");
      setMrrError("");
      // In a real app, you might refetch the project data or update context
    } catch (error) {
      setMrrError("An error occurred while updating MRR");
      console.error("MRR update error:", error);
    } finally {
      setMrrLoading(false);
    }
  };

  // =============================================
  // STATUS & RISK HELPERS
  // =============================================
  const getStatusConfig = (status: string) => {
    const config: Record<string, { bg: string; text: string; border: string; label: string; risk: "on-track" | "at-risk" | "blocked" }> = {
      COMPLETED: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30", label: "Completed", risk: "on-track" },
      ACTIVE: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30", label: "Active", risk: "on-track" },
      IN_PROGRESS: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30", label: "In Progress", risk: "on-track" },
      DESIGN: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30", label: "Design", risk: "on-track" },
      BUILD: { bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/30", label: "Build", risk: "on-track" },
      REVIEW: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30", label: "Review", risk: "at-risk" },
      ON_HOLD: { bg: "bg-slate-500/20", text: "text-slate-400", border: "border-slate-500/30", label: "On Hold", risk: "blocked" },
      PLANNING: { bg: "bg-indigo-500/20", text: "text-indigo-400", border: "border-indigo-500/30", label: "Planning", risk: "on-track" },
      PAID: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30", label: "Paid", risk: "on-track" },
      LEAD: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30", label: "Lead", risk: "on-track" },
      LAUNCH: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30", label: "Launch", risk: "on-track" },
    };
    return config[status] || { bg: "bg-slate-500/20", text: "text-slate-400", border: "border-slate-500/30", label: status, risk: "on-track" as const };
  };

  const getRiskBadge = (risk: "on-track" | "at-risk" | "blocked") => {
    switch (risk) {
      case "on-track":
        return { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30", label: "On Track", icon: CheckCircle };
      case "at-risk":
        return { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30", label: "At Risk", icon: AlertTriangle };
      case "blocked":
        return { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30", label: "Blocked", icon: AlertTriangle };
    }
  };

  const statusConfig = getStatusConfig(project.status);
  
  // Calculate risk based on overdue tasks and status
  const overdueTasks = [...project.adminTasks, ...project.clientTasks].filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE" && t.status !== "completed"
  );
  const calculatedRisk = overdueTasks.length > 2 ? "at-risk" : statusConfig.risk;
  const riskBadge = getRiskBadge(calculatedRisk);
  const RiskIcon = riskBadge.icon;

  // =============================================
  // COMPUTED DATA
  // =============================================
  const completedMilestones = project.milestones.filter((m) => m.completed).length;
  const totalMilestones = project.milestones.length;
  const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // Next tasks (not done, sorted by due date)
  const allTasks = [...project.adminTasks, ...project.clientTasks];
  const pendingTasks = allTasks
    .filter((t) => t.status !== "DONE" && t.status !== "completed")
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  const nextTasks = pendingTasks.slice(0, 3);

  // Financial summary (invoice totals are stored in dollars)
  const totalInvoiced = project.invoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  const paidInvoices = project.invoices.filter((inv) => inv.status === "PAID");
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  const outstandingAmount = totalInvoiced - totalPaid;

  // Format deadline
  const deadline = project.endDate ? new Date(project.endDate) : null;
  const daysUntilDeadline = deadline ? Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

  // Hub tabs - 5 focused tabs + More
  const tabs = [
    { id: "overview" as TabType, label: "Overview", icon: FileText },
    { id: "tasks" as TabType, label: "Tasks", icon: ListTodo, badge: pendingTasks.length > 0 ? pendingTasks.length : undefined },
    { id: "activity" as TabType, label: "Activity", icon: Activity },
    { id: "client" as TabType, label: "Client", icon: Users },
    { id: "financials" as TabType, label: "Financials", icon: DollarSign },
    { id: "more" as TabType, label: "More", icon: MoreHorizontal },
  ];

  // =============================================
  // TAB CONTENT RENDERERS
  // =============================================
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Project Summary */}
      {project.description && (
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/80 text-sm leading-relaxed">{project.description}</p>
        </div>
      )}

      {/* Status & Risk Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Status</p>
          <p className={`text-lg font-semibold ${statusConfig.text}`}>{statusConfig.label}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Risk Level</p>
          <div className="flex items-center gap-2">
            <RiskIcon className={`w-4 h-4 ${riskBadge.text}`} />
            <p className={`text-lg font-semibold ${riskBadge.text}`}>{riskBadge.label}</p>
          </div>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Progress</p>
          <div className="flex items-center gap-3">
            <p className="text-lg font-semibold text-white">{progress}%</p>
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#ef4444] rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Next Tasks - The important part */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide">Next Up</h3>
          <button
            onClick={() => setActiveTab("tasks")}
            className="text-xs text-[#ef4444] hover:text-white transition-colors"
          >
            View all tasks →
          </button>
        </div>
        {nextTasks.length === 0 ? (
          <p className="text-white/40 text-sm py-4">No pending tasks</p>
        ) : (
          <div className="space-y-2">
            {nextTasks.map((task) => {
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
              return (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg border transition-all ${
                    isOverdue
                      ? "bg-red-500/10 border-red-500/30"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isOverdue ? "bg-red-400" : "bg-white/30"}`} />
                      <span className="text-sm text-white truncate">{task.title}</span>
                    </div>
                    {task.dueDate && (
                      <span className={`text-xs flex-shrink-0 ${isOverdue ? "text-red-400" : "text-white/50"}`}>
                        {isOverdue ? "Overdue" : new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Last Activity */}
      <div className="pt-4 border-t border-white/10">
        <p className="text-xs text-white/40">
          Last updated: {new Date(project.createdAt).toLocaleDateString()} {/* Would be updatedAt in real app */}
        </p>
      </div>
    </div>
  );

  const renderTasksTab = () => (
    <AdminProjectTasks 
      projectId={project.id} 
      clientTasks={project.clientTasks} 
      adminTasks={project.adminTasks}
      milestones={project.milestones}
    />
  );

  const renderActivityTab = () => {
    // Combine all activity-like items
    const activities: Array<{ id: string; type: string; title: string; date: Date }> = [];
    
    // Add task completions
    [...project.adminTasks, ...project.clientTasks]
      .filter((t) => t.completedAt)
      .forEach((t) => {
        activities.push({
          id: `task-${t.id}`,
          type: "task_completed",
          title: `Task completed: ${t.title}`,
          date: new Date(t.completedAt),
        });
      });

    // Add milestone completions
    project.milestones
      .filter((m) => m.completed)
      .forEach((m) => {
        activities.push({
          id: `milestone-${m.id}`,
          type: "milestone_completed",
          title: `Milestone completed: ${m.name}`,
          date: new Date(m.createdAt),
        });
      });

    // Add change requests
    project.requests.forEach((r) => {
      activities.push({
        id: `request-${r.id}`,
        type: "change_request",
        title: `Change request: ${r.title || "Request submitted"}`,
        date: new Date(r.createdAt),
      });
    });

    // Sort by date, most recent first
    activities.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Only show last 14 days
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const recentActivities = activities.filter((a) => a.date >= twoWeeksAgo).slice(0, 15);

    return (
      <div className="space-y-4">
        <p className="text-xs text-white/50 uppercase tracking-wide">Last 14 days</p>
        {recentActivities.length === 0 ? (
          <p className="text-white/40 text-sm py-8 text-center">No recent activity</p>
        ) : (
          <div className="space-y-2">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  {activity.type === "task_completed" && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  {activity.type === "milestone_completed" && <Target className="w-4 h-4 text-purple-400" />}
                  {activity.type === "change_request" && <MessageSquare className="w-4 h-4 text-amber-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{activity.title}</p>
                  <p className="text-xs text-white/40">{activity.date.toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderClientTab = () => {
    // Get the primary client contact (first member of organization)
    const primaryClient = project.organization.members.length > 0 
      ? project.organization.members[0].user 
      : null;

    return (
      <div className="space-y-6">
        {/* Primary Client Profile Card */}
        {primaryClient && (
          <div className="p-6 bg-gradient-to-br from-white/10 to-white/5 rounded-xl border border-white/20 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ef4444] to-[#dc2626] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {primaryClient.name ? primaryClient.name.charAt(0).toUpperCase() : (primaryClient.email ? primaryClient.email.charAt(0).toUpperCase() : '?')}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-1">Primary Contact</h3>
                <p className="text-2xl font-bold text-white mb-1">{primaryClient.name || "Unnamed Client"}</p>
                <p className="text-sm text-white/60 mb-3">{primaryClient.email}</p>
                
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`mailto:${primaryClient.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    Email Client
                  </a>
                  <Link
                    href={`/admin/clients/${primaryClient.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    <User className="w-3 h-3" />
                    View Full Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Client Organization */}
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">Organization</h3>
          <p className="text-xl font-semibold text-white mb-2">{project.organization.name}</p>
          
          {project.organization.members.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-white/50 uppercase tracking-wide mb-3">
                Team Members ({project.organization.members.length})
              </p>
              <div className="space-y-2">
                {project.organization.members.slice(0, 5).map((member, index) => (
                  <div key={member.userId} className="flex items-center justify-between p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-semibold">
                        {member.user.name ? member.user.name.charAt(0).toUpperCase() : (member.user.email ? member.user.email.charAt(0).toUpperCase() : '?')}
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{member.user.name || "Unnamed"}</p>
                        <p className="text-xs text-white/50">{member.user.email}</p>
                      </div>
                    </div>
                    {index === 0 && (
                      <span className="text-xs px-2 py-0.5 bg-[#ef4444]/20 text-[#ef4444] rounded-full font-medium">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
                {project.organization.members.length > 5 && (
                  <p className="text-xs text-white/40 text-center py-2">
                    +{project.organization.members.length - 5} more members
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Key Notes / Questionnaire */}
        {project.questionnaire && (
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">Project Brief</h3>
            <p className="text-sm text-white/60">Questionnaire responses available</p>
            <button className="mt-3 text-xs text-[#ef4444] hover:text-white transition-colors">
              View Responses →
            </button>
          </div>
        )}

        {/* Quick Links */}
        {(project.githubRepo || project.vercelUrl) && (
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">Project Links</h3>
            <div className="space-y-2">
              {project.vercelUrl && (
                <a
                  href={project.vercelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-white/5 rounded-lg hover:bg-white/10 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span className="flex-1">Live Site</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {project.githubRepo && (
                <a
                  href={project.githubRepo.startsWith("http") ? project.githubRepo : `https://github.com/${project.githubRepo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-white/5 rounded-lg hover:bg-white/10 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span className="flex-1">Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Files (compact) */}
        {project.files.length > 0 && (
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">
              Project Files ({project.files.length})
            </h3>
            <div className="space-y-1">
              {project.files.slice(0, 5).map((file) => (
                <a
                  key={file.id}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-white/5 rounded-lg hover:bg-white/10 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <Folder className="w-3 h-3" />
                  <span className="truncate flex-1">{file.originalName || file.name}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
              {project.files.length > 5 && (
                <p className="text-xs text-white/40 text-center py-2">
                  +{project.files.length - 5} more files
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFinancialsTab = () => (
    <div className="space-y-6">
      {/* MRR Input Section */}
      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">Monthly Recurring Revenue (MRR)</h3>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-white/60 mb-1 block">Custom MRR Amount</label>
            <input
              type="number"
              placeholder="0.00"
              value={mrrValue}
              onChange={(e) => setMrrValue(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#ef4444]/50"
              step="0.01"
              min="0"
            />
          </div>
          <button
            onClick={handleUpdateMrr}
            disabled={mrrLoading}
            className="mt-5 px-4 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#dd3333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {mrrLoading ? "Saving..." : "Save MRR"}
          </button>
        </div>
        {mrrError && <p className="text-xs text-red-400 mt-2">{mrrError}</p>}
        {project.monthlyRecurringRevenue && (
          <p className="text-xs text-white/60 mt-2">Current MRR: ${Number(project.monthlyRecurringRevenue).toFixed(2)}</p>
        )}
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Budget</p>
          <p className="text-2xl font-bold text-white">
            {project.budget ? `$${Number(project.budget).toLocaleString()}` : "—"}
          </p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Invoiced</p>
          <p className="text-2xl font-bold text-emerald-400">${totalInvoiced.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Outstanding</p>
          <p className={`text-2xl font-bold ${outstandingAmount > 0 ? "text-amber-400" : "text-white/40"}`}>
            ${outstandingAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Invoice List */}
      <div>
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">Invoices</h3>
        {project.invoices.length === 0 ? (
          <p className="text-white/40 text-sm py-4">No invoices yet</p>
        ) : (
          <div className="space-y-2">
            {project.invoices.map((invoice) => {
              const isPaid = invoice.status === "PAID";
              return (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className={`w-4 h-4 ${isPaid ? "text-emerald-400" : "text-white/40"}`} />
                    <div>
                      <p className="text-sm text-white font-mono">{invoice.number || "—"}</p>
                      <p className="text-xs text-white/40">
                        {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "No due date"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">${Number(invoice.total).toLocaleString()}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isPaid
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Change Requests with hours */}
      {project.requests.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">
            Change Requests ({project.requests.length})
          </h3>
          <div className="space-y-2">
            {project.requests.slice(0, 5).map((req) => (
              <div key={req.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white truncate">{req.title}</p>
                  {req.estimatedHours && (
                    <span className="text-xs text-white/50">{req.estimatedHours}h est.</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderMoreTab = () => (
    <div className="space-y-6">
      {/* Git & Vercel Integrations */}
      <div>
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">
          Development Integrations
        </h3>
        <div className="space-y-4">
          <GitIntegrationPanel 
            projectId={project.id}
            githubRepo={project.githubRepo}
            isAdmin={true}
            expanded={true}
          />
          <VercelDeploymentsPanel
            projectId={project.id}
            vercelUrl={project.vercelUrl}
            isAdmin={true}
            expanded={true}
          />
        </div>
      </div>

      {/* Milestones */}
      <div>
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">
          Milestones ({completedMilestones}/{totalMilestones})
        </h3>
        {project.milestones.length === 0 ? (
          <p className="text-white/40 text-sm">No milestones</p>
        ) : (
          <div className="space-y-2">
            {project.milestones.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/10">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${m.completed ? "bg-emerald-500/20" : "bg-white/10"}`}>
                  {m.completed && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                </div>
                <span className={`text-sm ${m.completed ? "text-white/50 line-through" : "text-white"}`}>{m.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      {project.messageThreads.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">
            Messages ({project.messageThreads.length} threads)
          </h3>
          <div className="space-y-2">
            {project.messageThreads.slice(0, 3).map((thread) => (
              <div key={thread.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm text-white">{thread.subject || "Message Thread"}</p>
                <p className="text-xs text-white/40">{thread.messages?.length || 0} messages</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legacy Repository Tab (backup) */}
      <div>
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">Repository Details</h3>
        <RepositoryTab projectId={project.id} isAdmin={true} />
      </div>

      {/* Settings */}
      <div>
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">Settings</h3>
        <SettingsTab
          project={{
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            githubRepo: project.githubRepo,
            vercelUrl: project.vercelUrl,
            questionnaire: project.questionnaire,
          }}
          assignee={project.assignee}
          isAdmin={true}
        />
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverviewTab();
      case "tasks":
        return renderTasksTab();
      case "activity":
        return renderActivityTab();
      case "client":
        return renderClientTab();
      case "financials":
        return renderFinancialsTab();
      case "more":
        return renderMoreTab();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-0">
      {/* ============================================= */}
      {/* PERSISTENT HEADER - Always visible */}
      {/* ============================================= */}
      <div className="sticky top-0 z-10 bg-[#0a1128]/95 backdrop-blur-xl border-b border-white/10 -mx-4 lg:-mx-10 px-4 lg:px-10 py-4 mb-6">
        {/* Back link */}
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft className="w-3 h-3" />
          Projects
        </Link>

        {/* Main header row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Project name + status */}
          <div className="flex items-center gap-4 min-w-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-white truncate">{project.name}</h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${riskBadge.bg} ${riskBadge.text} ${riskBadge.border} shrink-0`}>
              <RiskIcon className="w-3 h-3" />
              {riskBadge.label}
            </span>
          </div>

          {/* Right: Meta info + Primary action */}
          <div className="flex items-center gap-6 flex-shrink-0">
            {/* Owner */}
            {project.assignee && (
              <div className="hidden md:flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                  {project.assignee.image ? (
                    <img src={project.assignee.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-white/60" />
                  )}
                </div>
                <span className="text-sm text-white/70">{project.assignee.name?.split(" ")[0] || "Unassigned"}</span>
              </div>
            )}

            {/* Deadline */}
            {deadline && (
              <div className="hidden md:flex items-center gap-2">
                <Calendar className="w-4 h-4 text-white/40" />
                <span className={`text-sm ${daysUntilDeadline && daysUntilDeadline < 7 ? "text-amber-400" : "text-white/70"}`}>
                  {deadline.toLocaleDateString()}
                  {daysUntilDeadline !== null && daysUntilDeadline > 0 && (
                    <span className="text-white/40 ml-1">({daysUntilDeadline}d)</span>
                  )}
                </span>
              </div>
            )}

            {/* Primary Action */}
            <button
              onClick={() => setActiveTab("tasks")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#ef4444] hover:bg-[#dc2626] text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-[#ef4444]/20"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </div>

        {/* Mobile meta row */}
        <div className="flex md:hidden items-center gap-4 mt-3 text-sm text-white/60">
          {project.assignee && (
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {project.assignee.name?.split(" ")[0]}
            </span>
          )}
          {deadline && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {deadline.toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* ============================================= */}
      {/* TAB NAVIGATION - Clean, focused */}
      {/* ============================================= */}
      <div className="border-b border-white/10 -mx-4 lg:-mx-10 px-4 lg:px-10">
        <div className="flex gap-1 overflow-x-auto pb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative px-4 py-3 text-sm font-medium transition-all whitespace-nowrap
                  flex items-center gap-2
                  ${
                    isActive
                      ? "text-white"
                      : "text-white/50 hover:text-white/80"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.badge && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-[#ef4444]/20 text-[#ef4444] rounded-full">
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="project-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ef4444]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================= */}
      {/* TAB CONTENT */}
      {/* ============================================= */}
      <div className="pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}









