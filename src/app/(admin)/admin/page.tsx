import { getSession } from "../../../server/auth/session";
import { GlassCard } from "../../../components/ui/glass-card";

export default async function AdminDashboard() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pt-20 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Admin Dashboard</h1>
          <p className="text-white/70">Welcome to the SeeZee admin panel</p>
        </div>

        {/* User Info */}
        <GlassCard className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Session Information</h2>
          <div className="space-y-2 text-white/80">
            <p><span className="font-medium">Name:</span> {session?.user?.name || 'Not provided'}</p>
            <p><span className="font-medium">Email:</span> {session?.user?.email}</p>
            <p><span className="font-medium">Image:</span> {session?.user?.image ? 'Available' : 'Not provided'}</p>
          </div>
        </GlassCard>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <GlassCard className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">12</div>
            <div className="text-white/70">Active Projects</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">8</div>
            <div className="text-white/70">New Leads</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">24</div>
            <div className="text-white/70">Total Clients</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">$45k</div>
            <div className="text-white/70">Monthly Revenue</div>
          </GlassCard>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GlassCard hover className="cursor-pointer">
            <h3 className="text-lg font-semibold text-white mb-2">📊 Leads Management</h3>
            <p className="text-white/70 text-sm">View and manage incoming leads and client inquiries.</p>
          </GlassCard>
          
          <GlassCard hover className="cursor-pointer">
            <h3 className="text-lg font-semibold text-white mb-2">🚀 Projects</h3>
            <p className="text-white/70 text-sm">Track project progress and milestones.</p>
          </GlassCard>
          
          <GlassCard hover className="cursor-pointer">
            <h3 className="text-lg font-semibold text-white mb-2">💰 Invoices</h3>
            <p className="text-white/70 text-sm">Create and manage client invoices.</p>
          </GlassCard>
          
          <GlassCard hover className="cursor-pointer">
            <h3 className="text-lg font-semibold text-white mb-2">📁 Files</h3>
            <p className="text-white/70 text-sm">Upload and organize project files.</p>
          </GlassCard>
          
          <GlassCard hover className="cursor-pointer">
            <h3 className="text-lg font-semibold text-white mb-2">⚙️ Settings</h3>
            <p className="text-white/70 text-sm">Configure system settings and preferences.</p>
          </GlassCard>
          
          <GlassCard hover className="cursor-pointer">
            <h3 className="text-lg font-semibold text-white mb-2">📈 Analytics</h3>
            <p className="text-white/70 text-sm">View performance metrics and insights.</p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}