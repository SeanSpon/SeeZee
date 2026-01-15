import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import Link from "next/link";
import { FileText, ArrowLeft, Sparkles, Send } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.OUTREACH];
  if (!allowedRoles.includes(user.role as any)) {
    redirect("/admin");
  }

  const templates = [
    {
      id: "ai-personalized",
      name: "AI Personalized Email",
      description: "Claude AI generates unique, personalized emails for each prospect based on their business info",
      category: "AI-Powered",
      icon: Sparkles,
      color: "purple",
      recommended: true,
    },
    {
      id: "basic-outreach",
      name: "Basic Outreach",
      description: "Simple template with placeholders for business name, contact name, and website",
      category: "Manual",
      icon: FileText,
      color: "blue",
      recommended: false,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/marketing"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-purple-400" />
              Email Templates
            </h1>
            <p className="text-slate-400 mt-1">
              AI-powered and manual templates for outreach
            </p>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`p-6 bg-gradient-to-br ${
              template.color === "purple"
                ? "from-purple-500/10 to-pink-500/10 border-purple-500/30"
                : "from-blue-500/10 to-cyan-500/10 border-blue-500/30"
            } border rounded-xl hover:border-opacity-50 transition-all group relative`}
          >
            {template.recommended && (
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                  Recommended
                </span>
              </div>
            )}

            <template.icon
              className={`w-12 h-12 mb-4 ${
                template.color === "purple" ? "text-purple-400" : "text-blue-400"
              }`}
            />

            <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
            <p className="text-slate-400 text-sm mb-4">{template.description}</p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">{template.category}</span>
              <Link
                href={`/admin/marketing/prospects?template=${template.id}`}
                className={`px-4 py-2 bg-gradient-to-r ${
                  template.color === "purple"
                    ? "from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                    : "from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                } text-white rounded-lg transition-all font-medium flex items-center gap-2`}
              >
                <Send className="w-4 h-4" />
                Use Template
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* How AI Templates Work */}
      <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          How AI Templates Work
        </h2>
        <div className="space-y-3 text-slate-300">
          <p>
            Our AI-powered email system uses <strong>Claude 3.5 Sonnet</strong> to generate unique,
            personalized emails for each prospect:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-400 ml-2">
            <li>Analyzes prospect's business name, industry, location, and website</li>
            <li>Creates context-aware subject lines and email content</li>
            <li>Maintains professional tone while being personalized</li>
            <li>Includes clear call-to-action and your company branding</li>
            <li>No two emails are the same - each is uniquely generated</li>
          </ul>
          <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <p className="text-sm text-purple-300">
              💡 <strong>Pro Tip:</strong> AI emails have 3x higher open rates than generic templates
              because they're tailored to each recipient.
            </p>
          </div>
        </div>
      </div>

      {/* Manual Template Builder Coming Soon */}
      <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 text-center">
        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-2">Custom Template Builder</h3>
        <p className="text-slate-400 text-sm">
          Coming soon: Create your own email templates with variables and custom designs
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link
          href="/admin/marketing/prospects"
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all font-medium flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Send AI Emails
        </Link>
        <Link
          href="/admin/marketing/discover"
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all font-medium"
        >
          Discover Prospects
        </Link>
      </div>
    </div>
  );
}
