"use client";

import { useEffect, useState } from "react";
import { UnifiedPipeline } from "@/components/admin/pipeline/UnifiedPipeline";
import { getPipeline, getProjects, getInvoices } from "@/server/actions";
import { Loader2 } from "lucide-react";

export default function PipelinePage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pipelineResult, projectsResult, invoicesResult] = await Promise.all([
        getPipeline(),
        getProjects(),
        getInvoices(),
      ]);
      
      setLeads(pipelineResult.success ? pipelineResult.leads : []);
      setProjects(projectsResult.success ? projectsResult.projects : []);
      setInvoices(invoicesResult.success ? invoicesResult.invoices : []);
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
        <header className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ef4444] inline-block">
            Growth Engine
          </span>
          <h1 className="text-4xl font-heading font-bold gradient-text">
            Pipeline
          </h1>
          <p className="text-white/60 max-w-2xl">
            Track deals from discovery to close. Drag leads between stages, take quick actions, and monitor your conversion funnel.
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
      <header className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ef4444] inline-block">
          Growth Engine
        </span>
        <h1 className="text-4xl font-heading font-bold gradient-text">
          Pipeline
        </h1>
        <p className="text-white/60 max-w-2xl">
          Track deals from discovery to close. Drag leads between stages, take quick actions, and monitor your conversion funnel.
        </p>
      </header>

      <UnifiedPipeline leads={leads} projects={projects} invoices={invoices} />
    </div>
  );
}
