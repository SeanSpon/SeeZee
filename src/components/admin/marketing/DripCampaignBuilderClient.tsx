"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Mail,
  Clock,
  Target,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  subject: string;
  category: string;
}

interface Step {
  id?: string;
  stepNumber: number;
  delayDays: number;
  delayHours: number;
  templateId: string;
  template?: Template;
}

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  targetStatus: string[];
  targetTags: string[];
  minLeadScore: number | null;
  maxLeadScore: number | null;
  steps: Step[];
}

interface Props {
  mode: "create" | "edit";
  templates: Template[];
  initialCampaign?: Campaign;
}

const prospectStatuses = [
  "PROSPECT",
  "REVIEWING",
  "QUALIFIED",
  "DRAFT_READY",
  "CONTACTED",
  "RESPONDED",
];

export function DripCampaignBuilderClient({ mode, templates, initialCampaign }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: initialCampaign?.name || "",
    description: initialCampaign?.description || "",
    targetStatus: initialCampaign?.targetStatus || [],
    targetTags: initialCampaign?.targetTags || [],
    minLeadScore: initialCampaign?.minLeadScore || null,
    maxLeadScore: initialCampaign?.maxLeadScore || null,
    active: initialCampaign?.active ?? false,
  });

  const [steps, setSteps] = useState<Step[]>(
    initialCampaign?.steps || [
      { stepNumber: 0, delayDays: 0, delayHours: 0, templateId: "" },
    ]
  );

  const addStep = () => {
    setSteps([
      ...steps,
      {
        stepNumber: steps.length,
        delayDays: 3,
        delayHours: 0,
        templateId: "",
      },
    ]);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // Renumber steps
    newSteps.forEach((step, i) => {
      step.stepNumber = i;
    });
    setSteps(newSteps);
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const newSteps = [...steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;

    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    
    // Renumber
    newSteps.forEach((step, i) => {
      step.stepNumber = i;
    });
    
    setSteps(newSteps);
  };

  const updateStep = (index: number, field: keyof Step, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert("Please enter a campaign name");
      return;
    }

    if (steps.some((s) => !s.templateId)) {
      alert("Please select a template for each step");
      return;
    }

    setSaving(true);
    try {
      const url =
        mode === "create"
          ? "/api/drip-campaigns"
          : `/api/drip-campaigns/${initialCampaign?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          minLeadScore: formData.minLeadScore || null,
          maxLeadScore: formData.maxLeadScore || null,
          steps: steps.map((s) => ({
            stepNumber: s.stepNumber,
            delayDays: s.delayDays,
            delayHours: s.delayHours,
            templateId: s.templateId,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save campaign");
      }

      alert(
        mode === "create"
          ? "Campaign created successfully!"
          : "Campaign updated successfully!"
      );
      router.push("/admin/marketing/drip-campaigns");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/marketing/drip-campaigns"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {mode === "create" ? "Create Drip Campaign" : "Edit Drip Campaign"}
            </h1>
            <p className="text-slate-400 mt-1">
              {mode === "create"
                ? "Build an automated email sequence"
                : `Editing: ${initialCampaign?.name}`}
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Campaign"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Campaign Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Nonprofit Welcome Sequence"
                className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="What is this campaign for?"
                className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                rows={3}
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
                Active (prospects can be enrolled)
              </label>
            </div>
          </div>

          {/* Email Sequence */}
          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-400" />
                Email Sequence
              </h3>
              <button
                onClick={addStep}
                className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => {
                const template = templates.find((t) => t.id === step.templateId);
                
                return (
                  <div
                    key={index}
                    className="p-4 bg-slate-800 border border-white/10 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-purple-600 text-white rounded text-sm font-medium">
                          Step {index + 1}
                        </span>
                        {index > 0 && (
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock className="w-3 h-3" />
                            {step.delayDays}d {step.delayHours}h after previous
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {index > 0 && (
                          <button
                            onClick={() => moveStep(index, "up")}
                            className="p-1 hover:bg-white/10 rounded"
                            title="Move up"
                          >
                            <MoveUp className="w-4 h-4 text-slate-400" />
                          </button>
                        )}
                        {index < steps.length - 1 && (
                          <button
                            onClick={() => moveStep(index, "down")}
                            className="p-1 hover:bg-white/10 rounded"
                            title="Move down"
                          >
                            <MoveDown className="w-4 h-4 text-slate-400" />
                          </button>
                        )}
                        {steps.length > 1 && (
                          <button
                            onClick={() => removeStep(index)}
                            className="p-1 hover:bg-red-500/10 rounded"
                            title="Remove step"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>

                    {index > 0 && (
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">
                            Delay (Days)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={step.delayDays}
                            onChange={(e) =>
                              updateStep(index, "delayDays", parseInt(e.target.value) || 0)
                            }
                            className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">
                            Delay (Hours)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="23"
                            value={step.delayHours}
                            onChange={(e) =>
                              updateStep(index, "delayHours", parseInt(e.target.value) || 0)
                            }
                            className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Email Template *
                      </label>
                      <select
                        value={step.templateId}
                        onChange={(e) =>
                          updateStep(index, "templateId", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                        required
                      >
                        <option value="">Select a template...</option>
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} - {t.subject}
                          </option>
                        ))}
                      </select>
                    </div>

                    {template && (
                      <div className="mt-2 p-2 bg-slate-900 rounded text-xs text-slate-400">
                        Subject: {template.subject}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar - Targeting */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Targeting
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Target Statuses
                </label>
                <div className="space-y-2">
                  {prospectStatuses.map((status) => (
                    <label key={status} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.targetStatus.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              targetStatus: [...formData.targetStatus, status],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              targetStatus: formData.targetStatus.filter((s) => s !== status),
                            });
                          }
                        }}
                        className="rounded border-slate-600 bg-slate-800 text-purple-500"
                      />
                      <span className="text-slate-300">{status.replace("_", " ")}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Lead Score Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.minLeadScore || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minLeadScore: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="Min"
                    className="px-3 py-2 bg-slate-800 border border-white/10 rounded text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.maxLeadScore || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxLeadScore: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="Max"
                    className="px-3 py-2 bg-slate-800 border border-white/10 rounded text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-purple-400 mb-3">
              Best Practices
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>• Start with 3-5 steps for best results</li>
              <li>• Space emails 2-5 days apart</li>
              <li>• Provide value in each email</li>
              <li>• End with a clear call-to-action</li>
              <li>• Test campaigns on small groups first</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
