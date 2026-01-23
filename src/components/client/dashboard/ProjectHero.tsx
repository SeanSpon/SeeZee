"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import type { Project, ProjectMilestone } from "@prisma/client";

interface ProjectHeroProps {
  project: Project & {
    organization: { id: string; name: string } | null;
    milestones: ProjectMilestone[];
  };
}

export default function ProjectHero({ project }: ProjectHeroProps) {
  // Calculate progress based on completed milestones
  const totalMilestones = project.milestones.length;
  const completedMilestones = project.milestones.filter(m => m.completed).length;
  const progress = totalMilestones > 0 
    ? Math.round((completedMilestones / totalMilestones) * 100)
    : 0;
  
  // Get estimated launch date (last milestone or end date)
  const estimatedLaunch = project.endDate || 
    project.milestones.find(m => !m.completed)?.dueDate;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/10 bg-gradient-to-br from-gray-900 to-gray-900/50 p-8 shadow-2xl backdrop-blur-sm"
    >
      {/* Project Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-2xl">
              🎨
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-white sm:text-3xl">
                {project.name}
              </h1>
              {project.organization && (
                <p className="text-sm text-slate-400">
                  {project.organization.name}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <StatusBadge status={project.status} size="md" />
        </div>
      </div>
      
      {/* Progress Section */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-400">
            Project Progress
          </span>
          <span className="text-lg font-bold text-white">
            {progress}%
          </span>
        </div>
        <ProgressBar value={progress} animated gradient />
      </div>
      
      {/* Metadata */}
      <div className="mb-6 flex flex-wrap gap-4 text-sm text-slate-400">
        {estimatedLaunch && (
          <div className="flex items-center gap-2">
            <span className="text-slate-500">📅</span>
            <span>
              Estimated Launch: {new Date(estimatedLaunch).toLocaleDateString()}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-slate-500">✅</span>
          <span>
            {completedMilestones} of {totalMilestones} milestones completed
          </span>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/client/projects/${project.id}`}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10/50 px-4 py-2 text-sm font-medium text-white transition-all hover:border-gray-600 hover:bg-white/10"
        >
          📋 View Project
        </Link>
        <Link
          href={`/client/projects/${project.id}?tab=messages`}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10/50 px-4 py-2 text-sm font-medium text-white transition-all hover:border-gray-600 hover:bg-white/10"
        >
          💬 Contact Team
        </Link>
        <Link
          href="/client/invoices"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10/50 px-4 py-2 text-sm font-medium text-white transition-all hover:border-gray-600 hover:bg-white/10"
        >
          💰 View Invoices
        </Link>
      </div>
    </motion.div>
  );
}

