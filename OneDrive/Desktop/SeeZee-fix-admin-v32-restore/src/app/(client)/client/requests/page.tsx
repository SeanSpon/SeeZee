import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Clock, FileText, AlertCircle, CheckCircle2, XCircle, Archive, Plus } from "lucide-react";

const STATUS_CONFIG = {
  DRAFT: { icon: FileText, color: "text-slate-400", bg: "bg-slate-500/20", border: "border-slate-500/30", label: "Draft" },
  SUBMITTED: { icon: Clock, color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30", label: "Submitted" },
  REVIEWING: { icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30", label: "Under Review" },
  NEEDS_INFO: { icon: AlertCircle, color: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/30", label: "Needs Info" },
  APPROVED: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30", label: "Approved" },
  REJECTED: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30", label: "Rejected" },
  ARCHIVED: { icon: Archive, color: "text-slate-400", bg: "bg-slate-500/20", border: "border-slate-500/30", label: "Archived" },
} as const;

export default async function ClientRequests() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login?returnUrl=/client/requests");
  }

  const requests = await prisma.projectRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-xl text-white mb-1">My Project Requests</h1>
          <p className="text-white/60 text-sm">Track the status of your project submissions</p>
        </div>
        <Link href="/start">
          <button className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Submit New Request
          </button>
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="seezee-glass p-12 text-center rounded-2xl">
          <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No requests yet</h3>
          <p className="text-white/60 mb-6">Get started by submitting your first project request</p>
          <Link href="/start">
            <button className="btn-primary">
              Start a Project
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const config = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.SUBMITTED;
            const Icon = config.icon;

            return (
              <div
                key={request.id}
                className="seezee-glass p-6 hover:bg-white/[0.08] transition-all rounded-2xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-white">{request.title}</h3>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.color} ${config.border}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {config.label}
                      </span>
                    </div>
                    
                    <p className="text-white/70 text-sm line-clamp-2 mb-4">{request.description}</p>
                    
                    {/* Meta info */}
                    <div className="flex flex-wrap gap-4 text-xs text-white/60">
                      <span className="flex items-center gap-1.5">
                        📧 {request.contactEmail}
                      </span>
                      {request.company && (
                        <span className="flex items-center gap-1.5">
                          🏢 {request.company}
                        </span>
                      )}
                      {request.budget && request.budget !== "UNKNOWN" && (
                        <span className="flex items-center gap-1.5">
                          💰 {request.budget.replace(/_/g, " ")}
                        </span>
                      )}
                      {request.timeline && (
                        <span className="flex items-center gap-1.5">
                          📅 {request.timeline}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right text-xs text-white/40 ml-6 flex-shrink-0">
                    <div>{new Date(request.createdAt).toLocaleDateString()}</div>
                    <div className="mt-1">{new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>

                {/* Services */}
                {request.services && request.services.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex flex-wrap gap-2">
                      {request.services.map((service) => (
                        <span
                          key={service}
                          className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-medium rounded-lg border border-cyan-500/30"
                        >
                          {service.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Internal notes (if any) */}
                {request.notes && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-xs text-white/50 mb-1">Admin Notes:</div>
                    <div className="text-sm text-white/70 bg-white/5 rounded-lg p-3">
                      {request.notes}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
