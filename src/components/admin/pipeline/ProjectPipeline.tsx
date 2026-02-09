"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Plus,
  Building2,
  Calendar,
  DollarSign,
  Users,
  MoreVertical,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  status: string;
  organization?: { name: string } | null;
  budget?: number | null;
  createdAt?: Date | string;
  assignee?: { name: string | null; image: string | null } | null;
  description?: string | null;
  clientEmail?: string;
  clientName?: string;
}

interface ProjectPipelineProps {
  projects: Project[];
}

// Project stages with colors - matching actual database ProjectStatus enum
const PROJECT_STAGES = [
  { id: "LEAD", label: "Lead", color: "from-slate-500 to-slate-600", bgColor: "bg-slate-500/10", borderColor: "border-slate-500/30", columnBg: "bg-slate-900/40" },
  { id: "QUOTED", label: "Quoted", color: "from-purple-500 to-indigo-600", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/30", columnBg: "bg-slate-900/40" },
  { id: "DEPOSIT_PAID", label: "Deposit Paid", color: "from-amber-500 to-orange-600", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/30", columnBg: "bg-slate-900/40" },
  { id: "ACTIVE", label: "Active", color: "from-cyan-500 to-blue-600", bgColor: "bg-cyan-500/10", borderColor: "border-cyan-500/30", columnBg: "bg-slate-900/40" },
  { id: "REVIEW", label: "Review", color: "from-pink-500 to-rose-600", bgColor: "bg-pink-500/10", borderColor: "border-pink-500/30", columnBg: "bg-slate-900/40" },
  { id: "COMPLETED", label: "Completed", color: "from-emerald-500 to-green-600", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/30", columnBg: "bg-slate-900/40" },
];

export function ProjectPipeline({ projects: initialProjects }: ProjectPipelineProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  // Filter projects based on search
  const filteredProjects = useMemo(() => {
    return initialProjects.filter((project) => {
      const matchesSearch = !searchQuery ||
        project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.organization?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStage = !selectedStage || project.status === selectedStage;

      return matchesSearch && matchesStage;
    });
  }, [initialProjects, searchQuery, selectedStage]);

  // Group projects by stage
  const projectsByStage = useMemo(() => {
    const grouped: Record<string, Project[]> = {};
    PROJECT_STAGES.forEach(stage => {
      grouped[stage.id] = filteredProjects.filter(p => p.status === stage.id);
    });
    return grouped;
  }, [filteredProjects]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalBudget = initialProjects.reduce((sum, p) => {
      // Handle Decimal, string, or number budget values
      const budget = p.budget ? Number(p.budget) : 0;
      return sum + (isNaN(budget) ? 0 : budget);
    }, 0);
    
    return {
      total: initialProjects.length,
      active: initialProjects.filter(p => p.status !== "COMPLETED" && p.status !== "CANCELLED").length,
      completed: initialProjects.filter(p => p.status === "COMPLETED").length,
      totalBudget,
    };
  }, [initialProjects]);

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-8">
      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 border border-slate-800/50 rounded-lg p-4 flex items-start gap-3"
      >
        <AlertCircle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-slate-400">
          <p><span className="text-white font-semibold">Projects are created from client submissions</span> when they complete the intake form at <code className="bg-slate-800/50 px-2 py-1 rounded text-slate-300">/start</code></p>
        </div>
      </motion.div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm font-medium">Total Projects</p>
            <Building2 className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-3xl font-bold text-white">{metrics.total}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm font-medium">Active</p>
            <Clock className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-3xl font-bold text-white">{metrics.active}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm font-medium">Completed</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-white">{metrics.completed}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm font-medium">Total Budget</p>
            <DollarSign className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(metrics.totalBudget)}</p>
        </motion.div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:border-[#ef4444]/50 outline-none transition-colors"
          />
        </div>

        {/* Stage Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedStage(null)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              !selectedStage
                ? "bg-[#ef4444] text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
            }`}
          >
            All
          </button>
          {PROJECT_STAGES.map(stage => (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(selectedStage === stage.id ? null : stage.id)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedStage === stage.id
                  ? "bg-[#ef4444] text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {stage.label} ({projectsByStage[stage.id]?.length || 0})
            </button>
          ))}
        </div>

        <Link
          href="/admin/projects/create"
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white text-sm font-medium hover:shadow-lg transition-all lg:ml-auto"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 pb-4">
          {PROJECT_STAGES.map((stage) => (
            <div
              key={stage.id}
              className="flex flex-col gap-4"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${stage.color}`} />
                  <h3 className="text-sm font-semibold text-white">{stage.label}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-xs font-semibold text-slate-300">
                  {projectsByStage[stage.id]?.length || 0}
                </span>
              </div>

              {/* Project Cards Container */}
              <div className={`flex flex-col gap-3 min-h-[400px] ${stage.columnBg} rounded-xl p-4 border border-slate-800/50`}>
                {projectsByStage[stage.id]?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <AlertCircle className="w-6 h-6 text-slate-700 mb-2" />
                    <p className="text-xs text-slate-600">No projects</p>
                  </div>
                ) : (
                  projectsByStage[stage.id]?.map((project) => (
                    <ProjectCard key={project.id} project={project} stage={stage} />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {initialProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-slate-900/30 rounded-xl border border-slate-800/50"
        >
          <Building2 className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">No projects yet</h3>
          <p className="text-slate-500 mb-6">Create your first project to get started</p>
          <Link
            href="/admin/projects/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white font-medium hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </Link>
        </motion.div>
      )}
    </div>
  );
}

// Project Card Component
function ProjectCard({
  project,
  stage,
}: {
  project: Project;
  stage: typeof PROJECT_STAGES[0];
}) {
  return (
    <Link href={`/admin/projects/${project.id}`}>
      <motion.div
        whileHover={{ y: -2 }}
        className={`group relative rounded-lg bg-slate-800/60 backdrop-blur border ${stage.borderColor} p-4 cursor-pointer transition-all hover:bg-slate-800 hover:border-[#ef4444]/30`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white text-sm truncate group-hover:text-[#ef4444] transition-colors">
              {project.name}
            </h4>
            {project.organization && (
              <p className="text-xs text-slate-400 truncate mt-1 flex items-center gap-1">
                <Building2 className="w-3 h-3 flex-shrink-0" />
                {project.organization.name}
              </p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-all flex-shrink-0"
          >
            <MoreVertical className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Info */}
        <div className="space-y-2 mb-3 pb-3 border-t border-slate-700/50">
          {project.organization && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Org</span>
              <span className="text-white font-medium truncate">{project.organization.name}</span>
            </div>
          )}
          {project.clientEmail && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Contact</span>
              <span className="text-white font-medium truncate">{project.clientEmail}</span>
            </div>
          )}
          {project.budget && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Budget</span>
              <span className="text-white font-medium">
                ${Number(project.budget).toLocaleString()}
              </span>
            </div>
          )}
          {project.createdAt && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Started</span>
              <span className="text-white font-medium">
                {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}
        </div>

        {/* Stage badge */}
        <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${stage.color} text-white text-xs font-semibold opacity-80`}>
          {stage.label}
        </div>

        {/* Hover indicator */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRight className="w-4 h-4 text-[#ef4444]" />
        </div>
      </motion.div>
    </Link>
  );
}
