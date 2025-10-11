import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FolderKanban, Clock, CheckCircle2 } from "lucide-react";

export default async function ClientProjectsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Only allow CLIENT role
  if (session.user.role !== "CLIENT") {
    redirect("/admin");
  }

  // Fetch client's projects via Lead relationship
  const projects = await prisma.project.findMany({
    where: {
      lead: {
        email: session.user.email!,
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      assignee: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "ACTIVE":
      case "IN_PROGRESS":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "ON_HOLD":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">My Projects</h2>
          <p className="text-slate-400 mt-1">Track your active and completed projects</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium">
          Request New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
          <FolderKanban className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Projects Yet</h3>
          <p className="text-slate-400 mb-6">Start your first project with SeeZee</p>
          <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium">
            Request Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/client/projects/${project.id}`}
              className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                    project.status
                  )}`}
                >
                  {project.status}
                </span>
              </div>

              {/* Status Badge - Progress removed as not in schema */}
              <div className="mb-4">
                <div className="text-xs text-slate-400">
                  {project.startDate && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>Started {new Date(project.startDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Assignee */}
              {project.assignee && (
                <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                  <img
                    src={project.assignee.image || "/default-avatar.png"}
                    alt={project.assignee.name || "Team"}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-xs text-slate-400">
                    {project.assignee.name}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
