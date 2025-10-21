"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface ProjectProgress {
  id: string;
  name: string;
  progress: number;
  status: string;
  milestones: {
    total: number;
    completed: number;
  };
}

export default function ClientProgressPage() {
  const [projects, setProjects] = useState<ProjectProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch project progress
    fetch("/api/client/progress")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.projects || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Overall Progress</h2>
          <p className="text-slate-400 mt-1">Track progress across all your projects</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Overall Progress</h2>
          <p className="text-slate-400 mt-1">Track progress across all your projects</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">No active projects yet</p>
          <p className="text-slate-500 text-sm mt-2">Projects will appear here once they are started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Overall Progress</h2>
        <p className="text-slate-400 mt-1">Track progress across all your projects</p>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {project.milestones.completed} of {project.milestones.total} milestones completed
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {project.status}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-400">Progress</span>
                <span className="text-white font-medium">{project.progress}%</span>
              </div>
              <div className="w-full h-3 bg-slate-900/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>{project.milestones.completed} completed</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4" />
                <span>{project.milestones.total - project.milestones.completed} remaining</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
