import DashboardStatsCards from "@/components/admin/dashboard-stats";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PortalDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">Welcome to your SeeZee portal</p>
      </div>

      {/* Stats Cards */}
      <DashboardStatsCards />
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-6 text-white">Performance Overview</h3>
          <div className="bg-slate-900/60 rounded-2xl p-6">
            <svg viewBox="0 0 400 200" className="w-full h-48">
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{stopColor:"#2563EB", stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:"#9333EA", stopOpacity:1}} />
                </linearGradient>
              </defs>
              <polyline fill="none" stroke="url(#chartGradient)" strokeWidth="3" points="0,150 50,120 100,100 150,80 200,90 250,60 300,40 350,30 400,20"/>
              <circle cx="400" cy="20" r="4" fill="#9333EA"/>
            </svg>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-6 text-white">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold">ZR</div>
              <div className="flex-1">
                <p className="text-sm text-white">Zach completed the homepage design for TechCorp</p>
                <p className="text-xs text-slate-400">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">$</div>
              <div className="flex-1">
                <p className="text-sm text-white">Invoice #INV-2024-001 was paid</p>
                <p className="text-xs text-slate-400">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold">SM</div>
              <div className="flex-1">
                <p className="text-sm text-white">Sean started a new project for StartupXYZ</p>
                <p className="text-xs text-slate-400">6 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">📧</div>
              <div className="flex-1">
                <p className="text-sm text-white">New client inquiry received</p>
                <p className="text-xs text-slate-400">8 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <a href="/portal/leads" className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors">
          <h3 className="font-semibold">Manage Leads</h3>
          <p className="text-sm opacity-90">View and manage customer leads</p>
        </a>
        <a href="/portal/projects" className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-colors">
          <h3 className="font-semibold">Projects</h3>
          <p className="text-sm opacity-90">Track project progress</p>
        </a>
        <a href="/portal/invoices" className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition-colors">
          <h3 className="font-semibold">Invoices</h3>
          <p className="text-sm opacity-90">Manage billing and payments</p>
        </a>
        <a href="/portal/messages" className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg transition-colors">
          <h3 className="font-semibold">Messages</h3>
          <p className="text-sm opacity-90">View customer messages</p>
        </a>
      </div>
    </div>
  );
}