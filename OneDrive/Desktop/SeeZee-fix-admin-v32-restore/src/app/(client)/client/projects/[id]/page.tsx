import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Calendar, CheckCircle2, Clock, DollarSign, User } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch project with ownership check via Lead
  const project = await prisma.project.findFirst({
    where: {
      id: id,
      lead: {
        email: session.user.email!,
      },
    },
    include: {
      assignee: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
      milestones: {
        orderBy: { createdAt: "asc" },
      },
      feedEvents: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      questionnaire: true, // Include questionnaire data
    },
  });

  if (!project) {
    notFound();
  }

  const getStatusBadge = (status: string) => {
    const config = {
      COMPLETED: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/30", label: "Completed" },
      ACTIVE: { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/30", label: "Active" },
      IN_PROGRESS: { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/30", label: "In Progress" },
      DESIGN: { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/30", label: "Design" },
      BUILD: { bg: "bg-cyan-500/20", text: "text-cyan-300", border: "border-cyan-500/30", label: "Build" },
      REVIEW: { bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/30", label: "Review" },
      ON_HOLD: { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/30", label: "On Hold" },
      PLANNING: { bg: "bg-indigo-500/20", text: "text-indigo-300", border: "border-indigo-500/30", label: "Planning" },
      PAID: { bg: "bg-green-500/20", text: "text-green-300", border: "border-green-500/30", label: "Paid" },
      LEAD: { bg: "bg-orange-500/20", text: "text-orange-300", border: "border-orange-500/30", label: "Lead" },
      LAUNCH: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/30", label: "Launch" },
    }[status] || { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/30", label: status };
    
    return config;
  };

  const badge = getStatusBadge(project.status);
  const completedMilestones = project.milestones.filter(m => m.completed).length;
  const totalMilestones = project.milestones.length;
  const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // Extract questionnaire data
  const questionnaireData = project.questionnaire?.data as any;
  const packageName = questionnaireData?.selectedPackage || 'starter';
  const selectedFeatures = questionnaireData?.selectedFeatures || [];
  const totals = questionnaireData?.totals;
  const timeline = questionnaireData?.questionnaire?.timeline || 'Flexible';
  const totalAmount = totals?.finalTotal || totals?.subtotal || project.budget || 0;

  // Active tab state (default to overview)
  const activeTab = "overview";

  return (
    <div className="space-y-6">
      {/* Back Button + Header */}
      <div>
        <Link 
          href="/client/projects" 
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="heading-xl text-white mb-2">{project.name}</h1>
            {project.description && (
              <p className="text-white/60 text-sm max-w-2xl">{project.description}</p>
            )}
          </div>
          <span
            className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
          >
            {badge.label}
          </span>
        </div>
      </div>

      {/* Package & Timeline Info Bar */}
      {questionnaireData && (
        <div className="seezee-glass p-4 rounded-2xl">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-white/80">
              <span className="text-white/50">Package:</span>
              <span className="font-semibold capitalize">{packageName}</span>
            </div>
            {selectedFeatures.length > 0 && (
              <>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-2 text-white/80">
                  <span className="text-white/50">Features:</span>
                  <span className="font-semibold">{selectedFeatures.length} selected</span>
                </div>
              </>
            )}
            {totalAmount > 0 && (
              <>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-2 text-white/80">
                  <span className="text-white/50">Total:</span>
                  <span className="font-semibold">${Number(totalAmount / 100).toLocaleString()}</span>
                </div>
              </>
            )}
            {timeline && (
              <>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-2 text-white/80">
                  <Calendar className="w-4 h-4 text-white/50" />
                  <span className="font-semibold">{timeline}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Milestones Progress */}
      {totalMilestones > 0 && (
        <div className="seezee-glass p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              <span className="font-semibold text-white">Milestones Progress</span>
            </div>
            <span className="text-2xl font-bold text-white">
              {completedMilestones} / {totalMilestones}
            </span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-white/50 mt-2 text-right">{progress}% Complete</div>
        </div>
      )}

      {/* Tabs */}
      <div className="seezee-glass rounded-2xl overflow-hidden">
        <div className="flex border-b border-white/10">
          <button className="px-6 py-3 text-sm font-medium text-white bg-cyan-500/20 border-b-2 border-cyan-400">
            Overview
          </button>
          <button className="px-6 py-3 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors">
            Tasks
          </button>
          <button className="px-6 py-3 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors">
            Timeline
          </button>
          <button className="px-6 py-3 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors">
            Files
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="heading-lg text-white mb-4">Project Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-white/60 text-sm">Status</span>
                    <span className={`font-medium ${badge.text}`}>{badge.label}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-white/60 text-sm">Milestones</span>
                    <span className="font-medium text-white">
                      {completedMilestones} / {totalMilestones}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-white/60 text-sm">Created</span>
                    <span className="font-medium text-white">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {project.startDate && (
                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-white/60 text-sm">Start Date</span>
                      <span className="font-medium text-white">
                        {new Date(project.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {project.endDate && (
                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-white/60 text-sm">End Date</span>
                      <span className="font-medium text-white">
                        {new Date(project.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Team Member */}
              {project.assignee && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
                    <User className="w-4 h-4" />
                    <span>Assigned To</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {project.assignee.image ? (
                      <img
                        src={project.assignee.image}
                        alt={project.assignee.name || "Team"}
                        className="w-10 h-10 rounded-full border-2 border-cyan-500/30"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/30 border-2 border-cyan-500/30" />
                    )}
                    <div>
                      <p className="font-medium text-white text-sm">{project.assignee.name}</p>
                      <p className="text-xs text-white/60">{project.assignee.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Budget */}
              {project.budget && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Budget</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-400">
                    ${Number(project.budget).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
