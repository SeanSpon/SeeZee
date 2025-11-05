"use client";

import Link from "next/link";
import { FolderKanban, Clock, CheckCircle2, Plus, ArrowRight } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  startDate: Date | null;
  assignee: { name: string | null; image: string | null } | null;
  milestones: { completed: boolean }[];
}

interface ProjectsClientProps {
  projects: Project[];
}

export function ProjectsClient({ projects }: ProjectsClientProps) {
  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; border: string; label: string; gradient: string }> = {
      COMPLETED: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/30", label: "Completed", gradient: "from-emerald-400 to-green-400" },
      ACTIVE: { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/30", label: "Active", gradient: "from-blue-400 to-cyan-400" },
      IN_PROGRESS: { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/30", label: "In Progress", gradient: "from-blue-400 to-cyan-400" },
      DESIGN: { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/30", label: "Design", gradient: "from-purple-400 to-pink-400" },
      BUILD: { bg: "bg-cyan-500/20", text: "text-cyan-300", border: "border-cyan-500/30", label: "Build", gradient: "from-cyan-400 to-blue-400" },
      REVIEW: { bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/30", label: "Review", gradient: "from-amber-400 to-orange-400" },
      ON_HOLD: { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/30", label: "On Hold", gradient: "from-slate-400 to-gray-400" },
      PLANNING: { bg: "bg-indigo-500/20", text: "text-indigo-300", border: "border-indigo-500/30", label: "Planning", gradient: "from-indigo-400 to-purple-400" },
    };
    return config[status] || { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/30", label: status, gradient: "from-slate-400 to-gray-400" };
  };

  const calculateProgress = (project: Project) => {
    if (project.milestones.length === 0) return 0;
    const completed = project.milestones.filter((m) => m.completed).length;
    return Math.round((completed / project.milestones.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Projects</h1>
          <p className="text-white/60">Track your active and completed projects</p>
        </div>
        <Link href="/start">
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="seezee-glass p-12 text-center rounded-xl">
          <FolderKanban className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Projects Yet</h3>
          <p className="text-white/60 mb-6">Start your first project with SeeZee</p>
          <Link href="/start">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
              Start Your First Project
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const badge = getStatusBadge(project.status);
            const progress = calculateProgress(project);
            
            return (
              <Link
                key={project.id}
                href={`/client/projects/${project.id}`}
                className="seezee-glass p-6 hover:bg-white/[0.08] transition-all rounded-xl group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors mb-2 truncate">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-sm text-white/60 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <span
                    className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Progress Bar */}
                {project.milestones.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-white/40 mt-2">
                      {project.milestones.filter((m) => m.completed).length}/{project.milestones.length} milestones
                    </div>
                  </div>
                )}

                {/* Project Info */}
                <div className="flex items-center gap-4 text-xs text-white/60 pt-4 border-t border-white/10">
                  {project.startDate && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(project.startDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {project.assignee && (
                    <div className="flex items-center gap-2 ml-auto">
                      {project.assignee.image ? (
                        <img
                          src={project.assignee.image}
                          alt={project.assignee.name || "Team"}
                          className="w-6 h-6 rounded-full border border-blue-500/30"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30" />
                      )}
                      <span className="text-white/80">{project.assignee.name}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

