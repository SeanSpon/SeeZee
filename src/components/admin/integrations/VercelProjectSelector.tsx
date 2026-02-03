"use client";

import { useState, useEffect } from "react";
import { Globe, ExternalLink, Loader2 } from "lucide-react";

interface VercelProject {
  id: string;
  name: string;
  framework: string | null;
  link: string;
  productionUrl: string | null;
  gitRepo: string | null;
}

interface VercelProjectSelectorProps {
  value?: string;
  onChange: (projectName: string, projectUrl: string) => void;
  label?: string;
  placeholder?: string;
}

export function VercelProjectSelector({
  value,
  onChange,
  label = "Vercel Project",
  placeholder = "Select a Vercel project...",
}: VercelProjectSelectorProps) {
  const [projects, setProjects] = useState<VercelProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/integrations/vercel/projects");
        const data = await res.json();

        if (data.error) {
          setError(data.error);
        } else {
          setProjects(data.projects || []);
        }
      } catch (err) {
        setError("Failed to load Vercel projects");
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectName = e.target.value;
    const project = projects.find((p) => p.name === projectName);
    if (project) {
      onChange(project.name, project.link);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/70">
          {label}
        </label>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/40">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading Vercel projects...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/70">
          {label}
        </label>
        <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/70">
          {label}
        </label>
        <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm">
          No Vercel projects found. Add VERCEL_TOKEN to your environment.
        </div>
      </div>
    );
  }

  const selectedProject = projects.find((p) => p.name === value);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white/70">
        {label}
      </label>
      <div className="relative">
        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
        <select
          value={value || ""}
          onChange={handleChange}
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white appearance-none cursor-pointer hover:border-white/20 focus:border-[#ef4444]/50 outline-none transition-colors"
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {projects.map((project) => (
            <option key={project.id} value={project.name}>
              {project.name}
              {project.framework ? ` (${project.framework})` : ""}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-4 h-4 text-white/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {selectedProject && (
        <a
          href={selectedProject.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-[#ef4444] hover:text-white transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          View on Vercel
        </a>
      )}
    </div>
  );
}
