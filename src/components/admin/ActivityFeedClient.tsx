"use client";

/**
 * Activity Feed Client Component with Real-time Polling
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SectionCard } from "@/components/admin/SectionCard";
import { markActivityAsRead, markAllActivitiesAsRead, getActivityFeed } from "@/server/actions";
import { formatRelativeTime } from "@/lib/ui";
import {
  Bell,
  CheckCheck,
  User,
  FileText,
  CheckSquare,
  DollarSign,
  Wrench,
  AlertTriangle,
  RefreshCw,
  Search,
  Mail,
  MailOpen,
  MessageCircle,
  Archive,
  ArrowRightLeft,
  StickyNote,
  BookOpen,
  BarChart2,
  PlusCircle,
} from "lucide-react";

type Activity = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  read: boolean;
  createdAt: Date;
  metadata?: any;
  projectId?: string | null;
};

interface ActivityFeedClientProps {
  initialActivities: Activity[];
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "LEAD_CREATED":
    case "LEAD_UPDATED":
    case "LEAD_DELETED":
      return <User className="w-4 h-4" />;
    case "PROJECT_CREATED":
    case "PROJECT_UPDATED":
    case "STATUS_CHANGE":
      return <FileText className="w-4 h-4" />;
    case "TASK_CREATED":
      return <PlusCircle className="w-4 h-4" />;
    case "TASK_COMPLETED":
      return <CheckSquare className="w-4 h-4" />;
    case "INVOICE_PAID":
    case "PAYMENT":
      return <DollarSign className="w-4 h-4" />;
    case "MAINTENANCE_DUE":
      return <Wrench className="w-4 h-4" />;
    case "SYSTEM_ALERT":
      return <AlertTriangle className="w-4 h-4" />;
    case "USER_JOINED":
      return <User className="w-4 h-4" />;
    case "FILE_UPLOAD":
      return <FileText className="w-4 h-4" />;
    case "MESSAGE":
      return <MessageCircle className="w-4 h-4" />;
    case "MILESTONE":
      return <CheckSquare className="w-4 h-4" />;
    // Prospect / pipeline types
    case "DISCOVERED":
      return <Search className="w-4 h-4" />;
    case "ANALYZED":
      return <BarChart2 className="w-4 h-4" />;
    case "REFRESHED_DETAILS":
      return <RefreshCw className="w-4 h-4" />;
    case "STATUS_CHANGED":
      return <ArrowRightLeft className="w-4 h-4" />;
    case "EMAIL_DRAFTED":
      return <Mail className="w-4 h-4" />;
    case "EMAIL_SENT":
      return <Mail className="w-4 h-4" />;
    case "EMAIL_OPENED":
      return <MailOpen className="w-4 h-4" />;
    case "EMAIL_REPLIED":
      return <MessageCircle className="w-4 h-4" />;
    case "NOTE_ADDED":
      return <StickyNote className="w-4 h-4" />;
    case "ARCHIVED":
      return <Archive className="w-4 h-4" />;
    case "CONVERTED":
      return <ArrowRightLeft className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case "LEAD_CREATED":
    case "LEAD_UPDATED":
    case "LEAD_DELETED":
      return "text-blue-400";
    case "PROJECT_CREATED":
    case "PROJECT_UPDATED":
    case "STATUS_CHANGE":
      return "text-purple-400";
    case "TASK_CREATED":
      return "text-blue-300";
    case "TASK_COMPLETED":
    case "MILESTONE":
      return "text-green-400";
    case "INVOICE_PAID":
    case "PAYMENT":
      return "text-emerald-400";
    case "MAINTENANCE_DUE":
      return "text-orange-400";
    case "SYSTEM_ALERT":
      return "text-red-400";
    case "USER_JOINED":
      return "text-cyan-400";
    case "FILE_UPLOAD":
      return "text-indigo-400";
    case "MESSAGE":
      return "text-yellow-400";
    // Prospect / pipeline types
    case "DISCOVERED":
    case "ANALYZED":
    case "REFRESHED_DETAILS":
      return "text-sky-400";
    case "STATUS_CHANGED":
    case "CONVERTED":
      return "text-purple-400";
    case "EMAIL_DRAFTED":
    case "EMAIL_SENT":
      return "text-indigo-400";
    case "EMAIL_OPENED":
    case "EMAIL_REPLIED":
      return "text-teal-400";
    case "NOTE_ADDED":
      return "text-amber-400";
    case "ARCHIVED":
      return "text-slate-500";
    default:
      return "text-slate-400";
  }
};

/**
 * Get the navigation route for an activity based on its type and metadata
 */
const getActivityRoute = (activity: Activity): string | null => {
  const { type, metadata, projectId } = activity;

  // Check metadata first, then fall back to projectId
  const metaProjectId = metadata?.projectId || projectId;
  const leadId = metadata?.leadId;
  const invoiceId = metadata?.invoiceId;
  const taskId = metadata?.taskId;
  const maintenancePlanId = metadata?.maintenancePlanId;
  const messageThreadId = metadata?.messageThreadId;
  const prospectId = metadata?.prospectId;
  const entityType = metadata?.entityType;

  // Route based on activity type
  switch (type) {
    case "LEAD_CREATED":
    case "LEAD_UPDATED":
    case "LEAD_DELETED":
      // Learning/tool assignments use LEAD_UPDATED but should route to learning
      if (entityType === "LearningResource" || entityType === "Tool") {
        return `/admin/learning`;
      }
      if (leadId) {
        return `/admin/pipeline/leads/${leadId}`;
      }
      return `/admin/pipeline`;

    case "PROJECT_CREATED":
    case "PROJECT_UPDATED":
    case "STATUS_CHANGE":
      if (metaProjectId) {
        return `/admin/projects/${metaProjectId}`;
      }
      return `/admin/projects`;

    case "TASK_CREATED":
    case "TASK_COMPLETED":
      if (taskId) {
        return `/admin/tasks/${taskId}`;
      }
      if (metaProjectId) {
        return `/admin/projects/${metaProjectId}`;
      }
      return `/admin/tasks`;

    case "INVOICE_PAID":
    case "PAYMENT":
      if (invoiceId) {
        return `/admin/pipeline/invoices/${invoiceId}`;
      }
      if (metaProjectId) {
        return `/admin/projects/${metaProjectId}`;
      }
      return `/admin/finance/transactions`;

    case "MAINTENANCE_DUE":
      return `/admin/maintenance`;

    case "FILE_UPLOAD":
    case "MILESTONE":
      if (metaProjectId) {
        return `/admin/projects/${metaProjectId}`;
      }
      return `/admin/projects`;

    case "MESSAGE":
      if (messageThreadId) {
        return `/admin/chat/${messageThreadId}`;
      }
      if (metaProjectId) {
        return `/admin/projects/${metaProjectId}`;
      }
      return `/admin/chat`;

    case "SYSTEM_ALERT":
      // Route to relevant page based on metadata context
      if (taskId) return `/admin/tasks`;
      if (metaProjectId) return `/admin/projects/${metaProjectId}`;
      return null;

    case "USER_JOINED":
      return `/admin/team`;

    // Prospect / pipeline types
    case "DISCOVERED":
    case "ANALYZED":
    case "REFRESHED_DETAILS":
    case "STATUS_CHANGED":
    case "NOTE_ADDED":
    case "ARCHIVED":
    case "CONVERTED":
      if (prospectId) {
        return `/admin/pipeline`;
      }
      return `/admin/pipeline`;

    case "EMAIL_DRAFTED":
    case "EMAIL_SENT":
    case "EMAIL_OPENED":
    case "EMAIL_REPLIED":
      return `/admin/pipeline`;

    default:
      if (metaProjectId) {
        return `/admin/projects/${metaProjectId}`;
      }
      return null;
  }
};

export function ActivityFeedClient({ initialActivities }: ActivityFeedClientProps) {
  const [activities, setActivities] = useState(initialActivities);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Auto-refresh every 30 seconds
  const refreshActivities = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await getActivityFeed({ limit: 100 });
      if (result.success && result.activities) {
        setActivities(result.activities);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error("Failed to refresh activities:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshActivities, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [refreshActivities]);

  const filteredActivities = activities.filter((a) => {
    if (filter === "unread") return !a.read;
    return true;
  });

  const handleMarkAsRead = async (activityId: string) => {
    const result = await markActivityAsRead(activityId);
    if (result.success) {
      setActivities((prev) =>
        prev.map((a) => (a.id === activityId ? { ...a, read: true } : a))
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllActivitiesAsRead();
    if (result.success) {
      setActivities((prev) => prev.map((a) => ({ ...a, read: true })));
    }
  };

  return (
    <SectionCard className="h-full flex flex-col">
      {/* Filter buttons */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${
                filter === "all"
                  ? "bg-seezee-red/20 text-seezee-red"
                  : "text-slate-400 hover:text-white hover:bg-seezee-card-bg"
              }
            `}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${
                filter === "unread"
                  ? "bg-seezee-red/20 text-seezee-red"
                  : "text-slate-400 hover:text-white hover:bg-seezee-card-bg"
              }
            `}
          >
            Unread ({activities.filter((a) => !a.read).length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshActivities}
            disabled={isRefreshing}
            className="
              flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
              text-slate-400 hover:text-white hover:bg-slate-800/40
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all
            "
            title="Refresh activities"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleMarkAllAsRead}
            disabled={!activities.some((a) => !a.read)}
            className="
              flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
              text-slate-400 hover:text-white hover:bg-slate-800/40
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all
            "
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        </div>
      </div>

      {/* Activities list */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">
              {filter === "unread" ? "No unread activities" : "No activities yet"}
            </p>
          </div>
        ) : (
          filteredActivities.map((activity) => {
            const route = getActivityRoute(activity);
            const onClick = () => {
              if (!activity.read) {
                handleMarkAsRead(activity.id);
              }
            };
            const className = `
              block p-4 rounded-xl border transition-all cursor-pointer
              ${
                activity.read
                  ? "bg-seezee-card-bg border-white/5"
                  : "bg-seezee-red/5 border-seezee-red/20 hover:bg-seezee-red/10"
              }
              ${route ? "hover:border-seezee-red/40" : ""}
            `;
            
            const content = (
              <div className="flex items-start gap-3">
                  <div
                    className={`
                    w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                    ${activity.read ? "bg-seezee-card-bg" : "bg-seezee-red/20"}
                    ${getActivityColor(activity.type)}
                  `}
                  >
                    {getActivityIcon(activity.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={`
                        text-sm font-medium
                        ${activity.read ? "text-slate-300" : "text-white"}
                      `}
                      >
                        {activity.title}
                      </h3>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {formatRelativeTime(new Date(activity.createdAt))}
                      </span>
                    </div>

                    {activity.description && (
                      <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                        {activity.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      {!activity.read && (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-seezee-red/20 text-seezee-red text-xs">
                          New
                        </span>
                      )}
                      {route && (
                        <span className="text-xs text-slate-500">
                          Click to view →
                        </span>
                      )}
                    </div>
                  </div>
                </div>
            );
            
            return route ? (
              <Link key={activity.id} href={route} onClick={onClick} className={className}>
                {content}
              </Link>
            ) : (
              <div key={activity.id} onClick={onClick} className={className}>
                {content}
              </div>
            );
          })
        )}
      </div>
    </SectionCard>
  );
}
