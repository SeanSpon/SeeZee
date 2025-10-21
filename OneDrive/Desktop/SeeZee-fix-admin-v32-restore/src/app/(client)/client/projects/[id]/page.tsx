import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Timeline from "@/app/(client)/client/components/Timeline";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Allow all authenticated users to view

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
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) {
    notFound();
  }

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
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
            {project.description && (
              <p className="text-slate-400">{project.description}</p>
            )}
          </div>
          <span
            className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
              project.status
            )}`}
          >
            {project.status}
          </span>
        </div>

        {/* Milestones Progress */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-white">Milestones</span>
            <span className="text-2xl font-bold text-white">
              {project.milestones.filter(m => m.completed).length} / {project.milestones.length}
            </span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all"
              style={{ 
                width: `${project.milestones.length > 0 
                  ? (project.milestones.filter(m => m.completed).length / project.milestones.length * 100) 
                  : 0}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-800/50 border border-white/10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Project Details</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Status</dt>
                    <dd className="text-white font-medium">{project.status}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Milestones</dt>
                    <dd className="text-white font-medium">
                      {project.milestones.filter(m => m.completed).length} / {project.milestones.length}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Created</dt>
                    <dd className="text-white font-medium">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  {project.startDate && (
                    <div className="flex justify-between">
                      <dt className="text-slate-400">Start Date</dt>
                      <dd className="text-white font-medium">
                        {new Date(project.startDate).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                  {project.endDate && (
                    <div className="flex justify-between">
                      <dt className="text-slate-400">End Date</dt>
                      <dd className="text-white font-medium">
                        {new Date(project.endDate).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Team Member */}
              {project.assignee && (
                <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Assigned To</h3>
                  <div className="flex items-center gap-3">
                    <img
                      src={project.assignee.image || "/default-avatar.png"}
                      alt={project.assignee.name || "Team"}
                      className="w-12 h-12 rounded-full border-2 border-cyan-500/30"
                    />
                    <div>
                      <p className="font-medium text-white">{project.assignee.name}</p>
                      <p className="text-sm text-slate-400">{project.assignee.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Budget */}
              {project.budget && (
                <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Budget</h3>
                  <p className="text-2xl font-bold text-cyan-400">
                    ${Number(project.budget).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Project Milestones</h3>
            {project.milestones.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No milestones yet</p>
            ) : (
              <div className="space-y-3">
                {project.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-start gap-3 p-4 bg-slate-900/50 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={milestone.completed}
                      disabled
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className={`text-white font-medium ${milestone.completed ? "line-through" : ""}`}>
                        {milestone.title}
                      </p>
                      {milestone.description && (
                        <p className="text-sm text-slate-400 mt-1">{milestone.description}</p>
                      )}
                      {milestone.dueDate && (
                        <p className="text-xs text-slate-500 mt-1">
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <Timeline events={[]} />
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
            <p className="text-slate-400">File management coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
