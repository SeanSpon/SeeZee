"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  Calendar,
  DollarSign,
  Target,
  Github,
  Globe,
  User,
  Building2,
  Clock,
  Zap,
  FileText,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  message?: string | null;
  budget?: string | null;
  timeline?: string | null;
  serviceType?: string | null;
  status: string;
  requirements?: any;
  metadata?: any;
  organization?: {
    id: string;
    name: string;
  } | null;
}

interface PreviewMilestone {
  title: string;
  description: string;
  dueDate: string;
  percentOfTimeline: number;
}

interface ProjectCreationWizardProps {
  lead: Lead;
  onSuccess: (projectId: string) => void;
  onCancel: () => void;
}

const TIMELINE_OPTIONS = [
  { value: "rush", label: "Rush (3 weeks)", days: 21 },
  { value: "1 month", label: "1 Month", days: 28 },
  { value: "6 weeks", label: "6 Weeks", days: 42 },
  { value: "2 months", label: "2 Months", days: 56 },
  { value: "3 months", label: "3 Months", days: 84 },
  { value: "4 months", label: "4 Months", days: 112 },
  { value: "6 months", label: "6 Months", days: 168 },
];

const SERVICE_TYPES = [
  { value: "WEBSITE", label: "Website", icon: Globe },
  { value: "WEB_APP", label: "Web Application", icon: Zap },
  { value: "ECOMMERCE", label: "E-commerce", icon: DollarSign },
  { value: "MOBILE", label: "Mobile App", icon: FileText },
  { value: "BRANDING", label: "Branding", icon: Target },
];

export function ProjectCreationWizard({ lead, onSuccess, onCancel }: ProjectCreationWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMilestones, setPreviewMilestones] = useState<PreviewMilestone[]>([]);

  // Form state
  const [projectName, setProjectName] = useState(lead.company || `Project for ${lead.name}`);
  const [description, setDescription] = useState(lead.message || "");
  const [budget, setBudget] = useState(lead.budget ? parseInt(lead.budget.replace(/\D/g, "")) || 0 : 0);
  const [timeline, setTimeline] = useState(lead.timeline || "2 months");
  const [serviceType, setServiceType] = useState(lead.serviceType || "WEBSITE");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [githubRepo, setGithubRepo] = useState("");
  const [vercelProjectId, setVercelProjectId] = useState("");
  const [generateMilestones, setGenerateMilestones] = useState(true);
  const [assigneeId, setAssigneeId] = useState("");

  // Team members for assignment
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; name: string; role: string }>>([]);

  // Fetch team members
  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await fetch("/api/admin/team");
        if (res.ok) {
          const data = await res.json();
          setTeamMembers(data.members || []);
        }
      } catch (e) {
        console.error("Failed to fetch team:", e);
      }
    }
    fetchTeam();
  }, []);

  // Fetch milestone preview when relevant fields change
  useEffect(() => {
    async function fetchPreview() {
      if (!generateMilestones) {
        setPreviewMilestones([]);
        return;
      }

      setPreviewLoading(true);
      try {
        const params = new URLSearchParams({
          serviceType,
          timeline,
          startDate,
        });
        const res = await fetch(`/api/admin/projects/create-from-lead?${params}`);
        if (res.ok) {
          const data = await res.json();
          setPreviewMilestones(data.milestones || []);
        }
      } catch (e) {
        console.error("Failed to fetch milestone preview:", e);
      } finally {
        setPreviewLoading(false);
      }
    }

    const debounce = setTimeout(fetchPreview, 300);
    return () => clearTimeout(debounce);
  }, [serviceType, timeline, startDate, generateMilestones]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/projects/create-from-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          name: projectName,
          description,
          budget: budget > 0 ? budget : null,
          timeline,
          startDate,
          githubRepo: githubRepo || null,
          vercelProjectId: vercelProjectId || null,
          assigneeId: assigneeId || null,
          generateMilestones,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create project");
      }

      onSuccess(data.project.id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden bg-[#0d1526] border border-white/10 rounded-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Create Project from Lead</h2>
              <p className="text-sm text-white/50 mt-1">
                Convert "{lead.name}" into a full project with MVP
              </p>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-8 h-1 rounded-full transition-colors ${
                    s <= step ? "bg-[#ef4444]" : "bg-white/10"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#ef4444]/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#ef4444]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Project Details</h3>
                    <p className="text-sm text-white/50">Basic information about the project</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#ef4444]/50 focus:ring-1 focus:ring-[#ef4444]/50 outline-none transition-all"
                      placeholder="Enter project name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Description / MVP Requirements
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#ef4444]/50 focus:ring-1 focus:ring-[#ef4444]/50 outline-none transition-all resize-none"
                      placeholder="Describe the project requirements, features, and goals..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Service Type
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {SERVICE_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.value}
                            onClick={() => setServiceType(type.value)}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                              serviceType === type.value
                                ? "bg-[#ef4444]/20 border-[#ef4444]/50 text-[#ef4444]"
                                : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs font-medium">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Timeline & Budget */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Timeline & Budget</h3>
                    <p className="text-sm text-white/50">Set the project schedule and pricing</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#ef4444]/50 focus:ring-1 focus:ring-[#ef4444]/50 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Project Budget ($)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="number"
                        value={budget || ""}
                        onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#ef4444]/50 focus:ring-1 focus:ring-[#ef4444]/50 outline-none transition-all"
                        placeholder="5000"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Timeline
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {TIMELINE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setTimeline(opt.value)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                          timeline === opt.value
                            ? "bg-purple-500/20 border-purple-500/50 text-purple-400"
                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{opt.label}</span>
                        <span className="text-xs opacity-60">{opt.days} days</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Assign Project Lead
                  </label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#ef4444]/50 focus:ring-1 focus:ring-[#ef4444]/50 outline-none transition-all"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.role})
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}

            {/* Step 3: Integrations */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Github className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Integrations</h3>
                    <p className="text-sm text-white/50">Connect Git and Vercel for tracking</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      <div className="flex items-center gap-2">
                        <Github className="w-4 h-4" />
                        GitHub Repository
                      </div>
                    </label>
                    <input
                      type="text"
                      value={githubRepo}
                      onChange={(e) => setGithubRepo(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#ef4444]/50 focus:ring-1 focus:ring-[#ef4444]/50 outline-none transition-all"
                      placeholder="owner/repo or https://github.com/owner/repo"
                    />
                    <p className="mt-1 text-xs text-white/40">
                      Link a GitHub repository to track commits and activity
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Vercel Project ID
                      </div>
                    </label>
                    <input
                      type="text"
                      value={vercelProjectId}
                      onChange={(e) => setVercelProjectId(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#ef4444]/50 focus:ring-1 focus:ring-[#ef4444]/50 outline-none transition-all"
                      placeholder="prj_xxxxxxxxxx"
                    />
                    <p className="mt-1 text-xs text-white/40">
                      Link a Vercel project to track deployments (optional)
                    </p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-amber-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-white font-medium">Pro Tip</p>
                        <p className="text-xs text-white/50 mt-1">
                          You can add these integrations later from the project settings. 
                          They help track commits, deployments, and overall project activity in one place.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Milestones Preview */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Milestones & Review</h3>
                    <p className="text-sm text-white/50">Auto-generated project timeline</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm text-white">Auto-generate milestones</span>
                  </div>
                  <button
                    onClick={() => setGenerateMilestones(!generateMilestones)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      generateMilestones ? "bg-emerald-500" : "bg-white/20"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        generateMilestones ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {generateMilestones && (
                  <div className="space-y-3">
                    {previewLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
                      </div>
                    ) : (
                      previewMilestones.map((milestone, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 p-3 bg-white/5 rounded-xl border border-white/10"
                        >
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-white/60">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{milestone.title}</p>
                            <p className="text-xs text-white/50 mt-0.5">{milestone.description}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-white/70">
                              {new Date(milestone.dueDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-white/40">{milestone.percentOfTimeline}%</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Summary */}
                <div className="p-4 bg-gradient-to-br from-[#ef4444]/10 to-purple-500/10 rounded-xl border border-[#ef4444]/20">
                  <h4 className="text-sm font-semibold text-white mb-3">Project Summary</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-white/50">Name:</span>
                      <span className="text-white ml-2">{projectName}</span>
                    </div>
                    <div>
                      <span className="text-white/50">Client:</span>
                      <span className="text-white ml-2">{lead.company || lead.name}</span>
                    </div>
                    <div>
                      <span className="text-white/50">Type:</span>
                      <span className="text-white ml-2">
                        {SERVICE_TYPES.find(t => t.value === serviceType)?.label || serviceType}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/50">Budget:</span>
                      <span className="text-white ml-2">
                        {budget > 0 ? `$${budget.toLocaleString()}` : "Not set"}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/50">Timeline:</span>
                      <span className="text-white ml-2">
                        {TIMELINE_OPTIONS.find(t => t.value === timeline)?.label || timeline}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/50">Milestones:</span>
                      <span className="text-white ml-2">{previewMilestones.length}</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
          <button
            onClick={step === 1 ? onCancel : () => setStep(step - 1)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 1 ? "Cancel" : "Back"}
          </button>

          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#ef4444] hover:bg-[#dc2626] text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-[#ef4444]/20"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Create Project
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
