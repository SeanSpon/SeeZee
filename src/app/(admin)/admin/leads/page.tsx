import { prisma } from "@/lib/prisma";
import { Mail, Phone, Building, Calendar, DollarSign } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getLeads() {
  try {
    return await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        message: true,
        serviceType: true,
        timeline: true,
        budget: true,
        status: true,
        source: true,
        createdAt: true,
        requirements: true,
      }
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return [];
  }
}

export default async function LeadsPage() {
  const leads = await getLeads();

  const statusColors = {
    NEW: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    CONTACTED: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    QUALIFIED: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    PROPOSAL_SENT: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    CONVERTED: 'bg-green-500/20 text-green-300 border-green-500/30',
    LOST: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white">Leads</h1>
          <p className="text-slate-400 mt-2">Manage all incoming leads and inquiries</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-6 py-3">
          <p className="text-3xl font-bold text-white">{leads.length}</p>
          <p className="text-xs text-slate-400">Total Leads</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {Object.entries(statusColors).map(([status, colorClass]) => {
          const count = leads.filter(l => l.status === status).length;
          return (
            <div key={status} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className="text-xs text-slate-400 capitalize">{status.toLowerCase().replace('_', ' ')}</p>
            </div>
          );
        })}
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {leads.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <Mail className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No leads yet</p>
          </div>
        ) : (
          leads.map((lead) => (
            <div
              key={lead.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-200"
            >
              {/* Header Row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {lead.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{lead.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-slate-400 text-sm">
                        <Mail size={14} />
                        {lead.email}
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-1 text-slate-400 text-sm">
                          <Phone size={14} />
                          {lead.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-lg text-sm font-medium border ${statusColors[lead.status as keyof typeof statusColors] || statusColors.NEW}`}>
                    {lead.status}
                  </span>
                  <div className="text-right">
                    <p className="text-slate-500 text-xs">
                      {new Date(lead.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                    <p className="text-slate-600 text-xs">
                      {new Date(lead.createdAt).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                {lead.company && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building size={16} className="text-slate-500" />
                    <span className="text-slate-300">{lead.company}</span>
                  </div>
                )}
                {lead.serviceType && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">Service:</span>
                    <span className="text-slate-300 capitalize">{lead.serviceType}</span>
                  </div>
                )}
                {lead.timeline && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-slate-500" />
                    <span className="text-slate-300">{lead.timeline}</span>
                  </div>
                )}
                {lead.budget && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign size={16} className="text-slate-500" />
                    <span className="text-slate-300">{lead.budget}</span>
                  </div>
                )}
                {lead.source && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">Source:</span>
                    <span className="text-slate-300 capitalize">{lead.source}</span>
                  </div>
                )}
              </div>

              {/* Message */}
              {lead.message && (
                <div className="mt-4 bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Message</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{lead.message}</p>
                </div>
              )}

              {/* Requirements */}
              {lead.requirements && typeof lead.requirements === 'object' && (
                <div className="mt-4 bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Requirements</p>
                  <pre className="text-slate-300 text-xs overflow-auto">
                    {JSON.stringify(lead.requirements, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}