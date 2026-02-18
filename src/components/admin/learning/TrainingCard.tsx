"use client";

import { FileText, Video, HelpCircle, ExternalLink, Clock, CheckCircle2 } from "lucide-react";

interface TrainingCardProps {
  training: {
    id: string;
    title: string;
    type: string;
    description: string | null;
    url: string | null;
    tags: string[];
  };
  dueAt?: string | null;
  completion?: {
    id: string;
    status: string;
    startedAt: string | null;
    completedAt: string | null;
  } | null;
  onMarkComplete?: () => void;
  onMarkStarted?: () => void;
  showActions?: boolean;
  loading?: boolean;
}

const typeConfig: Record<string, { icon: typeof FileText; color: string; label: string }> = {
  DOC: { icon: FileText, color: "bg-blue-500/20 text-blue-300", label: "Document" },
  VIDEO: { icon: Video, color: "bg-purple-500/20 text-purple-300", label: "Video" },
  QUIZ: { icon: HelpCircle, color: "bg-green-500/20 text-green-300", label: "Quiz" },
  LINK: { icon: ExternalLink, color: "bg-orange-500/20 text-orange-300", label: "Link" },
};

export default function TrainingCard({
  training,
  dueAt,
  completion,
  onMarkComplete,
  onMarkStarted,
  showActions = false,
  loading = false,
}: TrainingCardProps) {
  const config = typeConfig[training.type] || typeConfig.DOC;
  const Icon = config.icon;
  const status = completion?.status || "NOT_STARTED";

  const isOverdue = dueAt && new Date(dueAt) < new Date() && status !== "COMPLETE";

  return (
    <div className="seezee-glass p-5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-start gap-4">
        {/* Type Icon */}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-white truncate">{training.title}</h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${config.color}`}>
              {config.label}
            </span>
          </div>

          {training.description && (
            <p className="text-xs text-slate-400 line-clamp-2 mb-2">{training.description}</p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            {/* Due date */}
            {dueAt && (
              <span className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-400" : "text-slate-500"}`}>
                <Clock className="w-3 h-3" />
                {isOverdue ? "Overdue: " : "Due: "}
                {new Date(dueAt).toLocaleDateString()}
              </span>
            )}

            {/* Status badge */}
            {status === "COMPLETE" && (
              <span className="flex items-center gap-1 text-xs text-green-400">
                <CheckCircle2 className="w-3 h-3" />
                Completed
                {completion?.completedAt && (
                  <span className="text-slate-500 ml-1">
                    {new Date(completion.completedAt).toLocaleDateString()}
                  </span>
                )}
              </span>
            )}
            {status === "IN_PROGRESS" && (
              <span className="flex items-center gap-1 text-xs text-yellow-400">
                <Clock className="w-3 h-3" />
                In Progress
              </span>
            )}
            {status === "NOT_STARTED" && (
              <span className="text-xs text-slate-500">Not started</span>
            )}

            {/* Tags */}
            {training.tags.length > 0 && (
              <div className="flex gap-1">
                {training.tags.slice(0, 2).map((tag, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex flex-col gap-2 shrink-0">
            {training.url && (
              <a
                href={training.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Open
              </a>
            )}
            {status === "NOT_STARTED" && onMarkStarted && (
              <button
                onClick={onMarkStarted}
                disabled={loading}
                className="px-3 py-1.5 text-xs bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-colors disabled:opacity-50"
              >
                Start
              </button>
            )}
            {status !== "COMPLETE" && onMarkComplete && (
              <button
                onClick={onMarkComplete}
                disabled={loading}
                className="px-3 py-1.5 text-xs bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
              >
                Complete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
