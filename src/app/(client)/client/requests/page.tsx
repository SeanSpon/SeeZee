import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Clock, FileText, AlertCircle, CheckCircle2, XCircle, Archive } from "lucide-react";

const STATUS_CONFIG = {
  DRAFT: { icon: FileText, color: "text-gray-400", bg: "bg-gray-900/30", label: "Draft" },
  SUBMITTED: { icon: Clock, color: "text-blue-400", bg: "bg-blue-900/30", label: "Submitted" },
  REVIEWING: { icon: AlertCircle, color: "text-yellow-400", bg: "bg-yellow-900/30", label: "Under Review" },
  NEEDS_INFO: { icon: AlertCircle, color: "text-orange-400", bg: "bg-orange-900/30", label: "Needs Info" },
  APPROVED: { icon: CheckCircle2, color: "text-green-400", bg: "bg-green-900/30", label: "Approved" },
  REJECTED: { icon: XCircle, color: "text-red-400", bg: "bg-red-900/30", label: "Rejected" },
  ARCHIVED: { icon: Archive, color: "text-gray-400", bg: "bg-gray-900/30", label: "Archived" },
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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">My Project Requests</h2>
          <p className="text-slate-400 mt-1">Track the status of your project submissions</p>
        </div>
        <Link
          href="/start"
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
        >
          + New Request
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
          <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No requests yet</h3>
          <p className="text-slate-400 mb-6">Get started by submitting your first project request</p>
          <Link
            href="/start"
            className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
          >
            Start a Project
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const config = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.SUBMITTED;
            const Icon = config.icon;

            return (
              <Link
                key={request.id}
                href={`/client/requests/${request.id}`}
                className="block bg-slate-800/50 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all rounded-xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{request.title}</h3>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.color} border border-white/10`}>
                        <Icon className="w-4 h-4" />
                        {config.label}
                      </span>
                    </div>
                    
                    <p className="text-slate-400 line-clamp-2 mb-3">{request.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      <span>📧 {request.contactEmail}</span>
                      {request.company && <span>🏢 {request.company}</span>}
                      {request.budget && <span>💰 {request.budget}</span>}
                      {request.timeline && <span>📅 {request.timeline}</span>}
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-slate-500 ml-4">
                    <div>{new Date(request.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs">{new Date(request.createdAt).toLocaleTimeString()}</div>
                  </div>
                </div>

                {request.services && request.services.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {request.services.map((service) => (
                      <span
                        key={service}
                        className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded border border-cyan-500/30"
                      >
                        {service.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
