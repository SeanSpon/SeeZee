import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Users, FolderKanban, FileText, DollarSign } from "lucide-react";

export default async function AdminOverviewPage() {
  const session = await auth();

  // Fetch dashboard statistics
  const [userCount, projectCount, leadCount, invoiceCount] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.lead.count(),
    prisma.invoice.count(),
  ]);

  // Get recent activity
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  const recentProjects = await prisma.project.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {session?.user?.name || "Admin"}
        </h1>
        <p className="text-slate-400">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={userCount}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Projects"
          value={projectCount}
          icon={FolderKanban}
          color="green"
        />
        <StatCard
          title="Leads"
          value={leadCount}
          icon={FileText}
          color="yellow"
        />
        <StatCard
          title="Invoices"
          value={invoiceCount}
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Users</h3>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
              >
                <div>
                  <div className="text-white font-medium">{user.name || user.email}</div>
                  <div className="text-sm text-slate-400">{user.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    {user.role}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Projects</h3>
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
              >
                <div>
                  <div className="text-white font-medium">{project.name}</div>
                  <div className="text-sm text-slate-400">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                  {project.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Your Account</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-slate-400 mb-1">Email</div>
            <div className="text-white font-medium">{session?.user?.email}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Role</div>
            <div className="text-white font-medium">{session?.user?.role}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">User ID</div>
            <div className="text-white font-mono text-sm">{session?.user?.id}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: "blue" | "green" | "yellow" | "purple";
}) {
  const colorClasses = {
    blue: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400",
    green: "from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400",
    yellow: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-400",
    purple: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-xl rounded-xl p-6`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium text-slate-300">{title}</div>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  );
}
