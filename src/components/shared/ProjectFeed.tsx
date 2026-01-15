"use client";

import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle,
  DollarSign,
  FileText,
  GitCommit,
  MessageSquare,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

interface FeedEvent {
  id: string;
  type: string;
  payload: any;
  createdAt: Date | string;
}

interface ProjectFeedProps {
  events: FeedEvent[];
}

const eventIcons: Record<string, any> = {
  "project.created": TrendingUp,
  "project.status_changed": AlertCircle,
  "invoice.created": FileText,
  "invoice.sent": FileText,
  "payment.succeeded": DollarSign,
  "payment.failed": AlertCircle,
  "commit.summary": GitCommit,
  "message.sent": MessageSquare,
  "milestone.completed": CheckCircle,
};

const eventColors: Record<string, string> = {
  "project.created": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "project.status_changed": "text-purple-400 bg-purple-500/10 border-purple-500/20",
  "invoice.created": "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  "payment.succeeded": "text-green-400 bg-green-500/10 border-green-500/20",
  "payment.failed": "text-red-400 bg-red-500/10 border-red-500/20",
  "commit.summary": "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  "message.sent": "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  "milestone.completed": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

function getEventTitle(event: FeedEvent): string {
  const { type, payload } = event;

  switch (type) {
    case "project.created":
      return "Project Created";
    case "project.status_changed":
      return `Status: ${payload.from} → ${payload.to}`;
    case "invoice.created":
      return `Invoice Created: $${payload.amount?.toLocaleString()}`;
    case "payment.succeeded":
      return `Payment Received: $${payload.amount?.toLocaleString()}`;
    case "payment.failed":
      return "Payment Failed";
    case "commit.summary":
      return `${payload.count} New Commits`;
    case "message.sent":
      return `Message from ${payload.from}`;
    case "milestone.completed":
      return "Milestone Completed";
    default:
      return type.replace(/\./g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }
}

function getEventDescription(event: FeedEvent): string | null {
  const { type, payload } = event;

  switch (type) {
    case "project.created":
      return payload.projectName;
    case "commit.summary":
      return payload.commits?.slice(0, 3).map((c: any) => `• ${c.message}`).join("\n") || null;
    case "message.sent":
      return payload.preview;
    default:
      return null;
  }
}

export function ProjectFeed({ events }: ProjectFeedProps) {
  if (events.length === 0) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-8 text-center">
        <p className="text-slate-400">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const Icon = eventIcons[event.type] || AlertCircle;
        const colorClass = eventColors[event.type] || "text-slate-400 bg-slate-500/10 border-slate-500/20";
        const title = getEventTitle(event);
        const description = getEventDescription(event);
        const createdAt = typeof event.createdAt === "string" ? new Date(event.createdAt) : event.createdAt;

        return (
          <div
            key={event.id}
            className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg border ${colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-white">{title}</h4>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {formatDistanceToNow(createdAt, { addSuffix: true })}
                  </span>
                </div>
                {description && (
                  <p className="text-sm text-slate-400 mt-1 whitespace-pre-line">{description}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
