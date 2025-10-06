import { prisma } from "../../../../server/db/prisma";
import { GlassCard } from "../../../../components/ui/glass-card";
import { Badge } from "../../../../components/ui/badge";

export default async function AdminLeadsPage() {
  let leads;
  try {
    leads = await prisma.lead.findMany({ 
      orderBy: { createdAt: "desc" },
      take: 50 // Limit to prevent overload
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    leads = [];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pt-20 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Leads Management</h1>
          <p className="text-white/70">Manage and track incoming leads from your contact form</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <GlassCard className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{leads.length}</div>
            <div className="text-white/70">Total Leads</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {leads.filter(l => l.status === 'NEW').length}
            </div>
            <div className="text-white/70">New Leads</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {leads.filter(l => l.status === 'CONTACTED').length}
            </div>
            <div className="text-white/70">Contacted</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {leads.filter(l => l.status === 'QUALIFIED').length}
            </div>
            <div className="text-white/70">Qualified</div>
          </GlassCard>
        </div>

        {/* Leads List */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Leads</h2>
            <Badge variant="default">{leads.length} leads</Badge>
          </div>

          {leads.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📧</div>
              <h3 className="text-xl font-semibold text-white mb-2">No leads yet</h3>
              <p className="text-white/70">
                Leads will appear here when people submit the contact form
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <div 
                  key={lead.id} 
                  className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{lead.name}</h3>
                        <p className="text-white/70">{lead.email}</p>
                        {lead.company && (
                          <p className="text-white/60 text-sm">{lead.company}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 mt-3 md:mt-0">
                      <Badge 
                        variant={
                          lead.status === 'NEW' ? 'success' : 
                          lead.status === 'CONTACTED' ? 'warning' : 
                          'default'
                        }
                      >
                        {lead.status}
                      </Badge>
                      <span className="text-white/60 text-sm">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Message:</h4>
                    <p className="text-white/80 leading-relaxed">{lead.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}