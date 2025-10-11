import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Server, Database, Cpu, HardDrive, Activity, Zap } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SystemPage() {
  const session = await auth();
  
  if (session?.user?.email !== "seanspm1007@gmail.com") {
    redirect("/admin/overview");
  }

  // Mock system stats - you can replace with real metrics
  const systemStats = {
    uptime: "99.9%",
    apiCalls: "1,234",
    dbQueries: "45,678",
    activeUsers: "12",
    storage: "2.4 GB / 10 GB",
    memory: "45%",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-white">System</h1>
            <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              👑 CEO ONLY
            </span>
          </div>
          <p className="text-slate-400 mt-2">System health and performance</p>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 backdrop-blur-xl rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="text-green-400" size={24} />
            <h3 className="text-white font-semibold">Uptime</h3>
          </div>
          <p className="text-4xl font-black text-white mb-2">{systemStats.uptime}</p>
          <p className="text-green-400 text-sm">Last 30 days</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 backdrop-blur-xl rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="text-blue-400" size={24} />
            <h3 className="text-white font-semibold">API Calls</h3>
          </div>
          <p className="text-4xl font-black text-white mb-2">{systemStats.apiCalls}</p>
          <p className="text-blue-400 text-sm">Today</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-xl rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="text-purple-400" size={24} />
            <h3 className="text-white font-semibold">DB Queries</h3>
          </div>
          <p className="text-4xl font-black text-white mb-2">{systemStats.dbQueries}</p>
          <p className="text-purple-400 text-sm">Today</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 backdrop-blur-xl rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Server className="text-orange-400" size={24} />
            <h3 className="text-white font-semibold">Active Users</h3>
          </div>
          <p className="text-4xl font-black text-white mb-2">{systemStats.activeUsers}</p>
          <p className="text-orange-400 text-sm">Right now</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 backdrop-blur-xl rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <HardDrive className="text-yellow-400" size={24} />
            <h3 className="text-white font-semibold">Storage</h3>
          </div>
          <p className="text-4xl font-black text-white mb-2">24%</p>
          <p className="text-yellow-400 text-sm">{systemStats.storage}</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 backdrop-blur-xl rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Cpu className="text-pink-400" size={24} />
            <h3 className="text-white font-semibold">Memory</h3>
          </div>
          <p className="text-4xl font-black text-white mb-2">{systemStats.memory}</p>
          <p className="text-pink-400 text-sm">In use</p>
        </div>
      </div>

      {/* Environment Variables */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-bold text-xl mb-6">Environment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-1">Node Version</p>
            <p className="text-white font-mono">{process.version}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-1">Environment</p>
            <p className="text-white font-mono">{process.env.NODE_ENV}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-1">Platform</p>
            <p className="text-white font-mono">{process.platform}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-1">Architecture</p>
            <p className="text-white font-mono">{process.arch}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
