"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Code,
  Sparkles,
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  status: string;
  totalSent: number;
}

interface Template {
  id: string;
  name: string;
  category: string;
  subject: string;
  htmlContent: string;
  textContent: string | null;
  variables: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  campaigns?: Campaign[];
}

interface Props {
  mode: "create" | "edit";
  initialTemplate?: Template;
}

const categories = [
  { value: "OUTREACH", label: "Cold Outreach" },
  { value: "FOLLOW_UP", label: "Follow-Up" },
  { value: "MEETING", label: "Meeting Request" },
  { value: "PROPOSAL", label: "Proposal" },
  { value: "THANK_YOU", label: "Thank You" },
  { value: "NEWSLETTER", label: "Newsletter" },
];

const availableVariables = [
  "prospectName",
  "company",
  "email",
  "phone",
  "city",
  "state",
  "category",
  "websiteUrl",
  "leadScore",
  "yourName",
  "yourCompany",
  "yourPhone",
];

export function TemplateEditorClient({ mode, initialTemplate }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [showCodeView, setShowCodeView] = useState(false);

  const [formData, setFormData] = useState({
    name: initialTemplate?.name || "",
    category: initialTemplate?.category || "OUTREACH",
    subject: initialTemplate?.subject || "",
    htmlContent: initialTemplate?.htmlContent || "",
    textContent: initialTemplate?.textContent || "",
    active: initialTemplate?.active ?? true,
  });

  const handleSave = async () => {
    if (!formData.name || !formData.subject || !formData.htmlContent) {
      alert("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const url =
        mode === "create"
          ? "/api/templates"
          : `/api/templates/${initialTemplate?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      // Extract variables used in template
      const variableRegex = /\{\{\s*(\w+)\s*\}\}/g;
      const matches = [
        ...formData.subject.matchAll(variableRegex),
        ...formData.htmlContent.matchAll(variableRegex),
      ];
      const variables = [...new Set(matches.map((m) => m[1]))];

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          variables,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save template");
      }

      alert(
        mode === "create"
          ? "Template created successfully!"
          : "Template updated successfully!"
      );
      router.push("/admin/marketing/templates");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const insertVariable = (variable: string) => {
    const varString = `{{${variable}}}`;
    setFormData({
      ...formData,
      htmlContent: formData.htmlContent + varString,
    });
  };

  const getPreviewHtml = () => {
    let html = formData.htmlContent;
    // Replace variables with sample data for preview
    const sampleData: Record<string, string> = {
      prospectName: "John Smith",
      company: "Acme Nonprofit",
      email: "john@acmenonprofit.org",
      phone: "(555) 123-4567",
      city: "Louisville",
      state: "KY",
      category: "Education",
      websiteUrl: "https://acmenonprofit.org",
      leadScore: "85",
      yourName: "Sean (SeeZee)",
      yourCompany: "SeeZee Studio",
      yourPhone: "(555) 987-6543",
    };

    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
      html = html.replace(regex, value);
    });

    return html;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/marketing/templates"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {mode === "create" ? "Create Template" : "Edit Template"}
            </h1>
            <p className="text-slate-400 mt-1">
              {mode === "create"
                ? "Design a new email template"
                : `Editing: ${initialTemplate?.name}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all font-medium flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {previewMode ? "Edit" : "Preview"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </div>

      {/* Usage Info */}
      {mode === "edit" && initialTemplate?.campaigns && initialTemplate.campaigns.length > 0 && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
          <p className="text-sm text-cyan-300">
            This template is used in{" "}
            <strong>{initialTemplate.campaigns.length} campaign(s)</strong> with{" "}
            <strong>
              {initialTemplate.campaigns
                .reduce((sum, c) => sum + c.totalSent, 0)
                .toLocaleString()}{" "}
              emails sent
            </strong>
          </p>
        </div>
      )}

      {previewMode ? (
        /* Preview Mode */
        <div className="space-y-4">
          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
            <div className="mb-4 pb-4 border-b border-white/10">
              <div className="text-sm text-slate-400 mb-1">Subject</div>
              <div className="text-white font-medium">{formData.subject}</div>
            </div>
            <div className="bg-white rounded-lg p-6 text-slate-900">
              <div
                dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
              />
            </div>
          </div>
          <p className="text-sm text-slate-400 text-center">
            Preview shows sample data for variables
          </p>
        </div>
      ) : (
        /* Edit Mode */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Cold Outreach - Nonprofits"
                  className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Subject Line *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="e.g., Quick question about {{company}}'s website"
                  className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">
                  Use {"{"}{"{"} variable {"}"}{"}"}  syntax to insert dynamic content
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-white">
                    Email Body (HTML) *
                  </label>
                  <button
                    onClick={() => setShowCodeView(!showCodeView)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <Code className="w-3 h-3" />
                    {showCodeView ? "Rich Text" : "Code View"}
                  </button>
                </div>
                <textarea
                  value={formData.htmlContent}
                  onChange={(e) =>
                    setFormData({ ...formData, htmlContent: e.target.value })
                  }
                  placeholder={`<p>Hi {{prospectName}},</p>\n\n<p>I noticed {{company}} doesn't have a website...</p>\n\n<p>Best regards,<br>{{yourName}}</p>`}
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 font-mono text-sm"
                  rows={showCodeView ? 20 : 12}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Plain Text Version (optional)
                </label>
                <textarea
                  value={formData.textContent}
                  onChange={(e) =>
                    setFormData({ ...formData, textContent: e.target.value })
                  }
                  placeholder="Plain text fallback for email clients that don't support HTML"
                  className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 text-sm"
                  rows={6}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500"
                />
                <label htmlFor="active" className="text-sm text-white">
                  Active (available for use in campaigns)
                </label>
              </div>
            </div>
          </div>

          {/* Sidebar - Variables */}
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Variables
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Click to insert into your template
              </p>
              <div className="space-y-2">
                {availableVariables.map((variable) => (
                  <button
                    key={variable}
                    onClick={() => insertVariable(variable)}
                    className="w-full px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg text-left text-sm text-white transition-colors"
                  >
                    <code className="text-purple-400">
                      {"{"}{"{"} {variable} {"}"}
                      {"}"}
                    </code>
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-purple-400 mb-3">
                Best Practices
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>• Keep subject lines under 50 characters</li>
                <li>• Personalize with variables for better engagement</li>
                <li>• Include a clear call-to-action</li>
                <li>• Test on mobile devices</li>
                <li>• Always provide a plain text fallback</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
