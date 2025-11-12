"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTestProject } from "@/server/actions/test";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function CreateTestProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: "Test Client",
    email: "test@example.com",
    company: "Test Company Inc",
    phone: "+1 (555) 123-4567",
    packageType: "starter" as "starter" | "pro" | "elite",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await createTestProject({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        phone: formData.phone,
        packageType: formData.packageType,
      });

      setResult({
        success: true,
        message: response.message || "Test project created successfully!",
      });

      // Redirect to project after 2 seconds
      setTimeout(() => {
        router.push(`/admin/pipeline/projects/${response.projectId}`);
      }, 2000);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || "Failed to create test project",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red">
          Sandbox Tools
        </span>
        <h1 className="text-3xl font-heading font-bold text-white">Create Test Project</h1>
        <p className="max-w-2xl text-sm text-gray-400">
          Spin up a full mock engagement to verify automations, invoices, and onboarding flows without charging a card.
        </p>
      </header>

      <div className="max-w-2xl rounded-2xl border border-white/10 bg-gray-900/70 p-6 shadow-lg shadow-gray-900/20 backdrop-blur">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-slate-300">
              Client Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="John Doe"
              className="w-full rounded-lg border border-gray-800 bg-gray-900/70 px-4 py-3 text-white shadow-inner focus:border-trinity-red focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
              Email *
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="client@example.com"
              className="w-full rounded-lg border border-gray-800 bg-gray-900/70 px-4 py-3 text-white shadow-inner focus:border-trinity-red focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="company" className="block text-sm font-medium text-slate-300">
              Company
            </label>
            <input
              id="company"
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Company Name Inc"
              className="w-full rounded-lg border border-gray-800 bg-gray-900/70 px-4 py-3 text-white shadow-inner focus:border-trinity-red focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium text-slate-300">
              Phone
            </label>
            <input
              id="phone"
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="w-full rounded-lg border border-gray-800 bg-gray-900/70 px-4 py-3 text-white shadow-inner focus:border-trinity-red focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="packageType" className="block text-sm font-medium text-slate-300">
              Package Type *
            </label>
            <select
              id="packageType"
              value={formData.packageType}
              onChange={(e) =>
                setFormData({ ...formData, packageType: e.target.value as "starter" | "pro" | "elite" })
              }
              className="w-full rounded-lg border border-gray-800 bg-gray-900/70 px-4 py-3 text-white focus:border-trinity-red focus:outline-none"
            >
              <option value="starter">Starter Package ($1,200)</option>
              <option value="pro">Pro Package ($1,999)</option>
              <option value="elite">Elite Package ($2,999)</option>
            </select>
          </div>

          {result && (
            <div
              className={`p-4 rounded-lg flex items-start gap-3 ${
                result.success
                  ? "bg-green-500/10 border border-green-500/20"
                  : "bg-red-500/10 border border-red-500/20"
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    result.success ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {result.success ? result.message : result.error}
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-trinity-red px-4 py-2 font-medium text-white transition hover:bg-trinity-maroon disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Test Project...
              </>
            ) : (
              "Create Test Project"
            )}
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-200">
          <p className="font-semibold">What gets generated:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-blue-100">
            <li>Organization & client portal access</li>
            <li>Converted lead with linked project</li>
            <li>Project scaffold with default milestones</li>
            <li>Deposit (paid) + balance (draft) invoices</li>
            <li>Payment record and onboarding notifications</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

