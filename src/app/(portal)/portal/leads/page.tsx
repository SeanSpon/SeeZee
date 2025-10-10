import { prisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getLeads() {
  try {
    return await prisma.lead.findMany({
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return [];
  }
}

export default async function PortalLeadsPage() {
  const leads = await getLeads();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Leads</h1>
          <p className="text-gray-400">Manage customer inquiries and potential leads</p>
        </div>
        <div className="text-sm text-gray-400">
          {leads.length} total leads
        </div>
      </div>

      <div className="grid gap-4">
        {leads.length === 0 ? (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-8 text-center">
            <p className="text-gray-400">No leads yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Leads will appear here when customers submit the contact form
            </p>
          </div>
        ) : (
          leads.map((lead: any) => (
            <div
              key={lead.id}
              className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-blue-500/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{lead.name}</h3>
                  <p className="text-gray-400">{lead.email}</p>
                  {lead.company && (
                    <p className="text-sm text-gray-500">{lead.company}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    lead.status === 'NEW' ? 'bg-blue-500/20 text-blue-300' :
                    lead.status === 'CONTACTED' ? 'bg-yellow-500/20 text-yellow-300' :
                    lead.status === 'QUALIFIED' ? 'bg-green-500/20 text-green-300' :
                    lead.status === 'PROPOSAL_SENT' ? 'bg-purple-500/20 text-purple-300' :
                    lead.status === 'WON' ? 'bg-green-600/20 text-green-400' :
                    lead.status === 'LOST' ? 'bg-red-500/20 text-red-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {lead.status?.replace('_', ' ') || 'NEW'}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">Message:</p>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-sm text-gray-200">{lead.message}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                  Contact
                </button>
                <button className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors">
                  Qualify
                </button>
                <button className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors">
                  Send Proposal
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}