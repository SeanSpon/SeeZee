"use client";

import { useState, useCallback } from "react";
import {
  BookOpen,
  Library,
  Wrench,
  BarChart3,
  ClipboardList,
  ExternalLink,
  TrendingUp,
  AlertCircle,
  Trophy,
  Users,
  Clock,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TrainingCard from "@/components/admin/learning/TrainingCard";
import ToolOnboardingPath from "@/components/admin/learning/ToolOnboardingPath";
import TrainingList from "@/components/ceo/TrainingList";
import ToolGrid from "@/components/ceo/ToolGrid";
import StatsBar from "@/components/ceo/StatsBar";
import { updateCompletionStatus } from "@/server/actions/learning";
import { toast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────

interface AssignmentData {
  id: string;
  training: {
    id: string;
    title: string;
    type: string;
    description: string | null;
    url: string | null;
    tags: string[];
  };
  dueAt: string | null;
  createdAt: string;
  completion: {
    id: string;
    status: string;
    startedAt: string | null;
    completedAt: string | null;
  } | null;
}

interface ToolData {
  id: string;
  name: string;
  description: string | null;
  url: string;
  category: string;
  logoUrl: string | null;
  pricing: string | null;
  tags: string[];
  createdAt: string;
  onboardingPath: {
    id: string;
    title: string;
    description: string | null;
    steps: {
      id: string;
      order: number;
      isRequired: boolean;
      training: { id: string; title: string; type: string };
    }[];
  } | null;
}

interface LearningOverview {
  totals: {
    totalAssigned: number;
    notStarted: number;
    inProgress: number;
    completed: number;
    completionRate: number;
  };
  overdue: {
    count: number;
    list: Array<{
      id: string;
      user: { id: string; name: string | null; email: string };
      training: { id: string; title: string; type: string };
      dueAt: string;
      status: string;
      daysOverdue: number;
    }>;
  };
  roleCompletionRates: Array<{
    role: string;
    total: number;
    completed: number;
    completionRate: number;
  }>;
  leaderboard: Array<{
    user: { id: string; name: string | null; email: string };
    completed: number;
    total: number;
    completionRate: number;
  }>;
}

interface LearningHubClientProps {
  userRole: string;
  userId: string;
  isCEO: boolean;
  initialAssignments: AssignmentData[];
  initialTools: ToolData[];
}

// ─── Component ────────────────────────────────────────────────────

export default function LearningHubClient({
  userRole,
  userId,
  isCEO,
  initialAssignments,
  initialTools,
}: LearningHubClientProps) {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Analytics state (CEO only, loaded on demand)
  const [analyticsData, setAnalyticsData] = useState<LearningOverview | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const defaultTab = isCEO ? "library" : "my-learning";

  // ─── My Learning Actions ──────────────────────────────────────

  const handleMarkStatus = useCallback(
    async (assignmentId: string, status: "IN_PROGRESS" | "COMPLETE") => {
      setActionLoading(assignmentId);
      try {
        const result = await updateCompletionStatus(assignmentId, userId, status);
        if (result.success) {
          setAssignments((prev) =>
            prev.map((a) =>
              a.id === assignmentId
                ? {
                    ...a,
                    completion: {
                      id: result.completion?.id || a.completion?.id || "",
                      status,
                      startedAt:
                        status === "IN_PROGRESS"
                          ? new Date().toISOString()
                          : a.completion?.startedAt || new Date().toISOString(),
                      completedAt:
                        status === "COMPLETE" ? new Date().toISOString() : null,
                    },
                  }
                : a
            )
          );
          toast(
            status === "COMPLETE" ? "Marked as complete!" : "Marked as in progress",
            "success"
          );
        } else {
          toast(result.error || "Failed to update status", "error");
        }
      } catch {
        toast("Failed to update status", "error");
      } finally {
        setActionLoading(null);
      }
    },
    [userId]
  );

  // ─── Analytics Loader (CEO) ─────────────────────────────────

  const loadAnalytics = useCallback(async () => {
    if (analyticsData || analyticsLoading) return;
    setAnalyticsLoading(true);
    try {
      const response = await fetch("/api/admin/learning/overview");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setAnalyticsData(data);
    } catch {
      toast("Failed to load analytics", "error");
    } finally {
      setAnalyticsLoading(false);
    }
  }, [analyticsData, analyticsLoading]);

  // ─── Assignment Stats ─────────────────────────────────────────

  const myStats = {
    total: assignments.length,
    completed: assignments.filter((a) => a.completion?.status === "COMPLETE").length,
    inProgress: assignments.filter((a) => a.completion?.status === "IN_PROGRESS").length,
    notStarted: assignments.filter(
      (a) => !a.completion || a.completion.status === "NOT_STARTED"
    ).length,
    overdue: assignments.filter(
      (a) =>
        a.dueAt &&
        new Date(a.dueAt) < new Date() &&
        a.completion?.status !== "COMPLETE"
    ).length,
  };

  const myProgressPercent =
    myStats.total > 0 ? Math.round((myStats.completed / myStats.total) * 100) : 0;

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Learning Hub</h1>
        <p className="admin-page-subtitle">
          {isCEO
            ? "Manage training, tools, and team learning progress"
            : "Your training assignments, resources, and tools"}
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue={defaultTab}
        onValueChange={(val) => {
          if (val === "analytics" && isCEO) {
            loadAnalytics();
          }
        }}
      >
        <TabsList className="flex-wrap">
          {!isCEO && (
            <TabsTrigger value="my-learning" className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              My Learning
              {myStats.total > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-700 text-[10px]">
                  {myStats.completed}/{myStats.total}
                </span>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="library" className="flex items-center gap-1.5">
            <Library className="w-3.5 h-3.5" />
            Training Library
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5" />
            Tools
          </TabsTrigger>
          {isCEO && (
            <>
              <TabsTrigger value="my-learning" className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                My Learning
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                Analytics
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* ─── My Learning Tab ────────────────────────────────── */}
        <TabsContent value="my-learning">
          <div className="space-y-6">
            {/* Personal Progress */}
            {myStats.total > 0 && (
              <div className="seezee-glass p-5 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-slate-400">My Progress</h3>
                  <span className="text-2xl font-bold text-purple-400">
                    {myProgressPercent}%
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                  <div className="h-full flex">
                    <div
                      className="bg-green-500 transition-all"
                      style={{
                        width: `${myStats.total > 0 ? (myStats.completed / myStats.total) * 100 : 0}%`,
                      }}
                    />
                    <div
                      className="bg-yellow-500 transition-all"
                      style={{
                        width: `${myStats.total > 0 ? (myStats.inProgress / myStats.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 text-center text-sm">
                  <div>
                    <div className="font-bold">{myStats.total}</div>
                    <div className="text-xs text-slate-500">Total</div>
                  </div>
                  <div>
                    <div className="font-bold text-green-400">{myStats.completed}</div>
                    <div className="text-xs text-slate-500">Done</div>
                  </div>
                  <div>
                    <div className="font-bold text-yellow-400">{myStats.inProgress}</div>
                    <div className="text-xs text-slate-500">In Progress</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-400">{myStats.notStarted}</div>
                    <div className="text-xs text-slate-500">Not Started</div>
                  </div>
                </div>
              </div>
            )}

            {/* Overdue Warning */}
            {myStats.overdue > 0 && (
              <div className="seezee-glass p-4 rounded-xl border border-seezee-orange/20 bg-seezee-orange/5">
                <div className="flex items-center gap-2 text-seezee-orange text-sm font-medium">
                  <AlertCircle className="w-4 h-4" />
                  You have {myStats.overdue} overdue assignment
                  {myStats.overdue !== 1 ? "s" : ""}
                </div>
              </div>
            )}

            {/* Assignment List */}
            {assignments.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                <p className="text-slate-400 mb-2">No assignments yet</p>
                <p className="text-sm text-slate-500">
                  When training is assigned to you, it will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <TrainingCard
                    key={assignment.id}
                    training={assignment.training}
                    dueAt={assignment.dueAt}
                    completion={assignment.completion}
                    showActions
                    loading={actionLoading === assignment.id}
                    onMarkStarted={() =>
                      handleMarkStatus(assignment.id, "IN_PROGRESS")
                    }
                    onMarkComplete={() =>
                      handleMarkStatus(assignment.id, "COMPLETE")
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── Training Library Tab ───────────────────────────── */}
        <TabsContent value="library">
          {isCEO ? (
            <TrainingList />
          ) : (
            <TrainingLibraryReadOnly />
          )}
        </TabsContent>

        {/* ─── Tools Tab ──────────────────────────────────────── */}
        <TabsContent value="tools">
          {isCEO ? (
            <ToolGrid />
          ) : (
            <ToolsReadOnly tools={initialTools} />
          )}
        </TabsContent>

        {/* ─── Analytics Tab (CEO Only) ───────────────────────── */}
        {isCEO && (
          <TabsContent value="analytics">
            <AnalyticsPanel data={analyticsData} loading={analyticsLoading} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// ─── Training Library (Read-Only for Team) ──────────────────────

function TrainingLibraryReadOnly() {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loaded, setLoaded] = useState(false);

  const loadTrainings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (typeFilter) params.append("type", typeFilter);
      if (search) params.append("q", search);

      const response = await fetch(`/api/ceo/training?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const json = await response.json();
      const items = Array.isArray(json)
        ? json
        : json.items || json.trainings || [];
      setTrainings(items);
    } catch {
      setTrainings([]);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, search]);

  // Load on first render
  if (!loaded) {
    setLoaded(true);
    loadTrainings();
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "DOC": return "bg-blue-500/20 text-blue-300";
      case "VIDEO": return "bg-purple-500/20 text-purple-300";
      case "QUIZ": return "bg-green-500/20 text-green-300";
      case "LINK": return "bg-orange-500/20 text-orange-300";
      default: return "bg-slate-500/20 text-slate-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Training Library</h2>
          <p className="text-sm text-slate-400 mt-1">Browse available training materials</p>
        </div>
      </div>

      {/* Search */}
      <div className="seezee-glass p-4 rounded-xl">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search trainings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadTrainings()}
            className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setTimeout(loadTrainings, 0);
            }}
            className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="">All Types</option>
            <option value="DOC">Document</option>
            <option value="VIDEO">Video</option>
            <option value="QUIZ">Quiz</option>
            <option value="LINK">Link</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading trainings...</div>
      ) : trainings.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No trainings found</div>
      ) : (
        <div className="grid gap-4">
          {trainings.map((t: any) => (
            <div
              key={t.id}
              className="seezee-glass p-5 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-semibold">{t.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(t.type)}`}>
                      {t.type}
                    </span>
                  </div>
                  {t.description && (
                    <p className="text-sm text-slate-400 mb-2">{t.description}</p>
                  )}
                  {t.tags?.length > 0 && (
                    <div className="flex gap-2">
                      {t.tags.slice(0, 4).map((tag: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {t.url && (
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors shrink-0 ml-4"
                  >
                    Open
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tools (Read-Only for Team) ─────────────────────────────────

function ToolsReadOnly({ tools }: { tools: ToolData[] }) {
  const [search, setSearch] = useState("");

  const filtered = tools.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Development: "bg-blue-500/20 text-blue-300",
      Design: "bg-purple-500/20 text-purple-300",
      Communication: "bg-green-500/20 text-green-300",
      Project: "bg-orange-500/20 text-orange-300",
      Analytics: "bg-pink-500/20 text-pink-300",
    };
    return colors[category] || "bg-slate-500/20 text-slate-300";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Tools</h2>
          <p className="text-sm text-slate-400 mt-1">Software and tools used by the team</p>
        </div>
      </div>

      {/* Search */}
      <div className="seezee-glass p-4 rounded-xl">
        <input
          type="text"
          placeholder="Search tools..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No tools found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tool) => (
            <div
              key={tool.id}
              className="seezee-glass p-5 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-start gap-3 mb-3">
                {tool.logoUrl ? (
                  <img
                    src={tool.logoUrl}
                    alt={tool.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                    <Wrench className="w-5 h-5 text-purple-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold truncate">{tool.name}</h3>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${getCategoryColor(tool.category)}`}>
                    {tool.category}
                  </span>
                </div>
              </div>

              {tool.description && (
                <p className="text-sm text-slate-400 mb-3 line-clamp-2">{tool.description}</p>
              )}

              {tool.pricing && (
                <p className="text-xs text-slate-500 mb-3">Pricing: {tool.pricing}</p>
              )}

              {/* Onboarding Path */}
              {tool.onboardingPath && (
                <div className="mb-3">
                  <ToolOnboardingPath
                    title={tool.onboardingPath.title}
                    description={tool.onboardingPath.description}
                    steps={tool.onboardingPath.steps}
                  />
                </div>
              )}

              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open Tool
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Analytics Panel (CEO Only) ─────────────────────────────────

function AnalyticsPanel({
  data,
  loading,
}: {
  data: LearningOverview | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="text-center py-12 text-slate-400">Loading analytics...</div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-slate-400">
        No analytics data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <StatsBar
        totalAssigned={data.totals.totalAssigned}
        inProgress={data.totals.inProgress}
        completed={data.totals.completed}
        notStarted={data.totals.notStarted}
      />

      {/* Overdue Assignments Alert */}
      {data.overdue.count > 0 && (
        <div className="seezee-glass p-4 rounded-xl border border-seezee-orange/20 bg-seezee-orange/5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-seezee-orange" />
            <h3 className="text-lg font-semibold text-seezee-orange">
              {data.overdue.count} Overdue Assignment
              {data.overdue.count !== 1 ? "s" : ""}
            </h3>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.overdue.list.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-seezee-card-bg rounded-lg flex items-center justify-between border border-white/5"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">
                    {item.user.name || item.user.email}
                  </div>
                  <div className="text-xs text-slate-400">
                    {item.training.title}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-seezee-orange font-medium">
                    {item.daysOverdue} day{item.daysOverdue !== 1 ? "s" : ""}{" "}
                    overdue
                  </div>
                  <div className="text-xs text-slate-500">
                    Due: {new Date(item.dueAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role Completion Rates & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Completion Rates */}
        <div className="seezee-glass p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-seezee-purple" />
            <h3 className="text-lg font-semibold text-white">Completion by Role</h3>
          </div>
          <div className="space-y-3">
            {data.roleCompletionRates.length === 0 ? (
              <p className="text-center py-4 text-slate-500 text-sm">
                No data available
              </p>
            ) : (
              data.roleCompletionRates.map((roleData) => (
                <div key={roleData.role} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-white">{roleData.role}</span>
                    <span className="text-slate-400">
                      {roleData.completed}/{roleData.total} (
                      {roleData.completionRate}%)
                    </span>
                  </div>
                  <div className="h-2 bg-seezee-card-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-seezee-red to-seezee-blue"
                      style={{ width: `${roleData.completionRate}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Team Leaderboard */}
        <div className="seezee-glass p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-5 h-5 text-seezee-yellow" />
            <h3 className="text-lg font-semibold text-white">Top Performers</h3>
          </div>
          <div className="space-y-2">
            {data.leaderboard.length === 0 ? (
              <p className="text-center py-4 text-slate-500 text-sm">
                No completions yet
              </p>
            ) : (
              data.leaderboard.map((entry, index) => (
                <div
                  key={entry.user.id}
                  className="flex items-center gap-3 p-3 bg-seezee-card-bg rounded-lg border border-white/5"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0
                        ? "bg-seezee-yellow/20 text-seezee-yellow"
                        : index === 1
                        ? "bg-slate-400/20 text-slate-300"
                        : index === 2
                        ? "bg-seezee-orange/20 text-seezee-orange"
                        : "bg-seezee-card-bg text-slate-400"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">
                      {entry.user.name || entry.user.email}
                    </div>
                    <div className="text-xs text-slate-500">
                      {entry.completed} completed
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-seezee-green">
                      {entry.completionRate}%
                    </div>
                    <div className="text-xs text-slate-500">
                      {entry.completed}/{entry.total}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
