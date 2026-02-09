"use client";

import { useEffect, useState } from "react";
import { ProjectPipeline } from "@/components/admin/pipeline/ProjectPipeline";
import { getProjects } from "@/server/actions";
import { Loader2 } from "lucide-react";

export default function PipelinePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const projectsResult = await getProjects();
      setProjects(projectsResult.success ? projectsResult.projects : []);
    } catch (e) {
      console.error("Failed to load pipeline data:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Refresh data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <header className="space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ef4444] inline-block mb-2">
              Projects
            </span>
            <h1 className="text-4xl font-heading font-bold text-white">
              Pipeline
            </h1>
          </div>
          <p className="text-slate-400 max-w-2xl">
            Manage client projects through each stage of delivery
          </p>
        </header>
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-white/50">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading projects...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ef4444] inline-block mb-2">
            Projects
          </span>
          <h1 className="text-4xl font-heading font-bold text-white">
            Pipeline
          </h1>
        </div>
        <p className="text-slate-400 max-w-2xl">
          Manage client projects through each stage of delivery
        </p>
      </header>

      <ProjectPipeline projects={projects} />
    </div>
  );
}
