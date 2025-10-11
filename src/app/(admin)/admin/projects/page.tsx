import { prisma } from "@/lib/prisma";
import { FolderOpen, Calendar, DollarSign, User, CheckCircle, Clock, Pause, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getProjects() {
  try {
    return await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        organization: {
          select: {
            name: true,
            email: true
          }
        },
        assignee: {
          select: {
            name: true,
            email: true
          }
        },
        lead: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  const statusConfig = {
    PENDING: { 
      icon: Clock, 
      color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      label: 'Pending'
    },
    ACTIVE: { 
      icon: CheckCircle, 
      color: 'bg-green-500/20 text-green-300 border-green-500/30',
      label: 'Active'
    },
    ON_HOLD: { 
      icon: Pause, 
      color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      label: 'On Hold'
    },
    COMPLETED: { 
      icon: CheckCircle, 
      color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      label: 'Completed'
    },
    CANCELLED: { 
      icon: XCircle, 
      color: 'bg-red-500/20 text-red-300 border-red-500/30',
      label: 'Cancelled'
    },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white">Projects</h1>
          <p className="text-slate-400 mt-2">Manage all client projects</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-6 py-3">
          <p className="text-3xl font-bold text-white">{projects.length}</p>
          <p className="text-xs text-slate-400">Total Projects</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = projects.filter(p => p.status === status).length;
          return (
            <div key={status} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <config.icon size={16} className="text-slate-400" />
                <p className="text-2xl font-bold text-white">{count}</p>
              </div>
              <p className="text-xs text-slate-400">{config.label}</p>
            </div>
          );
        })}
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No projects yet</p>
          </div>
        ) : (
          projects.map((project) => {
            const config = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.PENDING;
            const StatusIcon = config.icon;
            
            return (
              <div
                key={project.id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-200"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <FolderOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{project.name}</h3>
                      <p className="text-slate-400 text-sm mt-1">{project.organization.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-lg text-sm font-medium border flex items-center gap-2 ${config.color}`}>
                      <StatusIcon size={16} />
                      {config.label}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {project.description && (
                  <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                    {project.description}
                  </p>
                )}

                {/* Details Grid */}
                <div className="grid md:grid-cols-4 gap-4">
                  {project.budget && (
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                        <DollarSign size={14} />
                        <span>Budget</span>
                      </div>
                      <p className="text-white font-semibold">
                        ${Number(project.budget).toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  {project.startDate && (
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                        <Calendar size={14} />
                        <span>Start Date</span>
                      </div>
                      <p className="text-white font-semibold">
                        {new Date(project.startDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  {project.endDate && (
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                        <Calendar size={14} />
                        <span>End Date</span>
                      </div>
                      <p className="text-white font-semibold">
                        {new Date(project.endDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  {project.assignee && (
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                        <User size={14} />
                        <span>Assigned To</span>
                      </div>
                      <p className="text-white font-semibold truncate">
                        {project.assignee.name}
                      </p>
                    </div>
                  )}
                </div>

                {/* Lead Info */}
                {project.lead && (
                  <div className="mt-4 bg-white/5 rounded-xl p-3 border border-white/5">
                    <p className="text-slate-500 text-xs mb-1">Converted from Lead</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-white">{project.lead.name}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{project.lead.email}</span>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                  <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                  <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
