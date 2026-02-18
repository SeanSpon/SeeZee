"use client";

import { useEffect, useState } from "react";
import { ProjectPipeline } from "@/components/admin/pipeline/ProjectPipeline";
import { LeadsTableClient } from "@/components/admin/LeadsTableClient";
import { getProjects, getPipeline } from "@/server/actions";
import { Loader2 } from "lucide-react";

type Tab = "leads" | "projects";

export default function PipelinePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("leads");

  const loadData = async () => {
    setLoading(true);
    try {
      const [projectsResult, leadsResult] = await Promise.all([
        getProjects(),
        getPipeline(),
      ]);
      setProjects(projectsResult.success ? projectsResult.projects : []);
      setLeads(leadsResult.success ? leadsResult.leads : []);
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

  const newLeadsCount = leads.filter((l) => l.status === "NEW").length;

  if (loading) {
    return (
      <div className="space-y-8">
        <header className="space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ef4444] inline-block mb-2">
              Pipeline
            </span>
            <h1 className="text-4xl font-heading font-bold text-white">
              Pipeline
            </h1>
          </div>
          <p className="text-slate-400 max-w-2xl">
            Manage leads and projects through each stage of delivery
          </p>
        </header>
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-white/50">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading pipeline...
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
            Pipeline
          </span>
          <h1 className="text-4xl font-heading font-bold text-white">
            Pipeline
          </h1>
        </div>
        <p className="text-slate-400 max-w-2xl">
          Manage leads and projects through each stage of delivery
        </p>
      </header>

      {/* Tab Toggle */}
      <div className="flex gap-1 rounded-lg bg-white/5 p-1 w-fit">
        <button
          onClick={() => setActiveTab("leads")}
          className={`relative flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
            activeTab === "leads"
              ? "bg-white/10 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Leads
          {newLeadsCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-[#ef4444] px-2 py-0.5 text-[10px] font-bold text-white leading-none">
              {newLeadsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
            activeTab === "projects"
              ? "bg-white/10 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Projects
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "leads" ? (
        <LeadsTableClient leads={leads} />
      ) : (
        <ProjectPipeline projects={projects} />
      )}
    </div>
  );
}
