"use client";

import { CheckCircle2, Circle, FileText, Video, HelpCircle, ExternalLink } from "lucide-react";

interface OnboardingStep {
  id: string;
  order: number;
  isRequired: boolean;
  training: {
    id: string;
    title: string;
    type: string;
  };
}

interface ToolOnboardingPathProps {
  title: string;
  description?: string | null;
  steps: OnboardingStep[];
  /** Map of trainingId -> completion status for current user */
  completionMap?: Record<string, string>;
}

const typeIcons: Record<string, typeof FileText> = {
  DOC: FileText,
  VIDEO: Video,
  QUIZ: HelpCircle,
  LINK: ExternalLink,
};

export default function ToolOnboardingPath({
  title,
  description,
  steps,
  completionMap = {},
}: ToolOnboardingPathProps) {
  const totalSteps = steps.length;
  const completedSteps = steps.filter(
    (s) => completionMap[s.training.id] === "COMPLETE"
  ).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="seezee-glass p-5 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-white">{title}</h4>
          {description && (
            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
          )}
        </div>
        <span className="text-xs text-slate-400">
          {completedSteps}/{totalSteps} steps
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-seezee-red to-seezee-blue transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps list */}
      <div className="space-y-2">
        {steps.map((step, idx) => {
          const isComplete = completionMap[step.training.id] === "COMPLETE";
          const StepIcon = typeIcons[step.training.type] || FileText;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                isComplete
                  ? "bg-green-500/5 border border-green-500/10"
                  : "bg-slate-800/30 border border-white/5"
              }`}
            >
              {/* Step number / check */}
              {isComplete ? (
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center shrink-0">
                  <span className="text-[10px] text-slate-500">{idx + 1}</span>
                </div>
              )}

              <StepIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />

              <span
                className={`text-sm flex-1 ${
                  isComplete ? "text-slate-400 line-through" : "text-white"
                }`}
              >
                {step.training.title}
              </span>

              {step.isRequired && (
                <span className="text-[10px] text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded shrink-0">
                  Required
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
