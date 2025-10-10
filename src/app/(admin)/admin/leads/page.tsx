import { prisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getLeads() {
  try {
    return await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: { name: true, email: true }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return [];
  }
}

async function getInquiries() {
  try {
    return await prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return [];
  }
}

export default async function LeadsPage() {
  const [leads, inquiries] = await Promise.all([getLeads(), getInquiries()]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leads & Inquiries</h1>
        <div className="text-sm text-slate-400">
          {leads.length + inquiries.length} total leads
        </div>
      </div>

      {/* Contact Form Inquiries */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Contact Form Inquiries</h2>
        <div className="grid gap-4">
          {inquiries.length === 0 ? (
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
              <p className="text-slate-400">No inquiries yet</p>
            </div>
          ) : (
            inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-blue-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{inquiry.name}</h3>
                    <p className="text-slate-400">{inquiry.email}</p>
                    {inquiry.company && (
                      <p className="text-sm text-slate-500">{inquiry.company}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      inquiry.status === 'NEW' ? 'bg-blue-500/20 text-blue-300' :
                      inquiry.status === 'PROPOSED' ? 'bg-yellow-500/20 text-yellow-300' :
                      inquiry.status === 'WON' ? 'bg-green-500/20 text-green-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {inquiry.status}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Project Type:</span>
                    <span className="ml-2 capitalize">{inquiry.projectType}</span>
                  </div>
                  {inquiry.budget && (
                    <div>
                      <span className="text-slate-400">Budget:</span>
                      <span className="ml-2">{inquiry.budget}</span>
                    </div>
                  )}
                  {inquiry.timeline && (
                    <div>
                      <span className="text-slate-400">Timeline:</span>
                      <span className="ml-2">{inquiry.timeline}</span>
                    </div>
                  )}
                  {inquiry.phone && (
                    <div>
                      <span className="text-slate-400">Phone:</span>
                      <span className="ml-2">{inquiry.phone}</span>
                    </div>
                  )}
                </div>

                {inquiry.goals && (
                  <div className="mt-4">
                    <p className="text-slate-400 text-sm mb-2">Project Goals:</p>
                    <p className="text-sm bg-slate-800/50 rounded-lg p-3">{inquiry.goals}</p>
                  </div>
                )}

                {inquiry.pages && (
                  <div className="mt-3">
                    <p className="text-slate-400 text-sm mb-2">Pages/Features:</p>
                    <p className="text-sm bg-slate-800/50 rounded-lg p-3">{inquiry.pages}</p>
                  </div>
                )}

                {inquiry.extras && (
                  <div className="mt-3">
                    <p className="text-slate-400 text-sm mb-2">Additional Requirements:</p>
                    <p className="text-sm bg-slate-800/50 rounded-lg p-3">{inquiry.extras}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Legacy Contact Form Leads */}
      {leads.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Legacy Contact Leads</h2>
          <div className="grid gap-4">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-blue-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{lead.name}</h3>
                    <p className="text-slate-400">{lead.email}</p>
                  </div>
                  <p className="text-xs text-slate-400">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-slate-400 text-sm mb-2">Message:</p>
                  <p className="text-sm bg-slate-800/50 rounded-lg p-3">{lead.message}</p>
                </div>

                {lead.details && (
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Additional Details:</p>
                    <p className="text-sm bg-slate-800/50 rounded-lg p-3">{lead.details}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}