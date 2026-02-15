"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  FiTrash2,
  FiMail,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiBriefcase,
  FiFileText,
  FiCheck,
  FiGlobe,
  FiTag,
  FiMessageSquare,
} from "react-icons/fi";

const STATUS_OPTIONS = [
  { value: "SUBMITTED", label: "Submitted", color: "bg-blue-500" },
  { value: "REVIEWING", label: "Reviewing", color: "bg-yellow-500" },
  { value: "NEEDS_INFO", label: "Needs Info", color: "bg-orange-500" },
  { value: "APPROVED", label: "Approved", color: "bg-green-500" },
  { value: "REJECTED", label: "Rejected", color: "bg-red-500" },
  { value: "ARCHIVED", label: "Archived", color: "bg-gray-500" },
];

function formatBudget(budget: string | null | undefined): string {
  if (!budget || budget === "UNKNOWN") return "Not specified";
  return budget.replace(/_/g, " ");
}

function formatServices(services: string[] | null | undefined): string {
  if (!services || services.length === 0) return "None specified";
  return services
    .map((s) =>
      s
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
    )
    .join(", ");
}

function formatTimeline(timeline: string | null | undefined): string {
  if (!timeline) return "Not specified";
  const map: Record<string, string> = {
    asap: "As soon as possible",
    "1-2-weeks": "1-2 weeks",
    "1-month": "Within 1 month",
    "2-3-months": "2-3 months",
    flexible: "Flexible / No rush",
  };
  return map[timeline] || timeline;
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function AdminProjectRequestsPage() {
  const { data: session } = useSession();
  const [projectRequests, setProjectRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    async function loadProjectRequests() {
      try {
        const response = await fetch("/api/admin/project-requests");
        if (response.ok) {
          const data = await response.json();
          setProjectRequests(data.projectRequests || []);
        }
      } catch (error) {
        console.error("Failed to load project requests:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProjectRequests();
  }, []);

  const handleDelete = async (requestId: string, requestTitle: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${requestTitle}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeleting(requestId);
    try {
      const response = await fetch(`/api/admin/project-requests/${requestId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete project request");
      }

      setProjectRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (error: any) {
      console.error("Failed to delete project request:", error);
      alert(`Failed to delete: ${error.message}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    setUpdatingStatus(requestId);
    try {
      const response = await fetch(`/api/admin/project-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update status");
      }

      const data = await response.json();
      setProjectRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: data.projectRequest?.status || newStatus }
            : r
        )
      );
    } catch (error: any) {
      console.error("Failed to update status:", error);
      alert(`Failed to update status: ${error.message}`);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredRequests =
    filterStatus === "ALL"
      ? projectRequests
      : projectRequests.filter((r) => r.status === filterStatus);

  const activeRequests = projectRequests.filter((r) =>
    ["DRAFT", "SUBMITTED", "REVIEWING", "NEEDS_INFO"].includes(r.status)
  ).length;

  const approvedRequests = projectRequests.filter(
    (r) => r.status === "APPROVED"
  ).length;

  if (!session?.user) return null;

  if (loading) {
    return (
      <div className="space-y-8">
        <header className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red inline-block">
            Pipeline
          </span>
          <h1 className="text-4xl font-heading font-bold gradient-text">
            Project Requests
          </h1>
        </header>
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-trinity-red border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red inline-block">
          Pipeline
        </span>
        <h1 className="text-4xl font-heading font-bold gradient-text">
          Project Requests
        </h1>
        <p className="max-w-2xl text-base text-gray-300 leading-relaxed">
          Incoming project requests from the /start questionnaire. Review
          details, update status, and manage client inquiries.
        </p>
      </header>

      {/* Stats Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active"
          value={activeRequests}
          icon={FiMail}
          color="trinity-red"
          subtitle="Awaiting review"
        />
        <StatCard
          label="Approved"
          value={approvedRequests}
          icon={FiCheck}
          color="green-500"
          subtitle="Ready to build"
        />
        <StatCard
          label="Total"
          value={projectRequests.length}
          icon={FiFileText}
          color="blue-500"
          subtitle="All time"
        />
        <StatCard
          label="This Month"
          value={
            projectRequests.filter((r) => {
              const d = new Date(r.createdAt);
              const now = new Date();
              return (
                d.getMonth() === now.getMonth() &&
                d.getFullYear() === now.getFullYear()
              );
            }).length
          }
          icon={FiCalendar}
          color="purple-500"
          subtitle={new Date().toLocaleString("default", { month: "long" })}
        />
      </section>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilterStatus("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filterStatus === "ALL"
              ? "bg-white/10 text-white"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          All ({projectRequests.length})
        </button>
        {STATUS_OPTIONS.map((s) => {
          const count = projectRequests.filter(
            (r) => r.status === s.value
          ).length;
          if (count === 0) return null;
          return (
            <button
              key={s.value}
              onClick={() => setFilterStatus(s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === s.value
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Request Cards */}
      {filteredRequests.length === 0 ? (
        <div className="rounded-2xl border-2 border-gray-700/50 p-12 text-center">
          <FiFileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-medium">
            No project requests found
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Requests from the /start questionnaire will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const isExpanded = expandedId === request.id;
            const email =
              request.contactEmail ||
              request.email ||
              request.user?.email ||
              "";
            const userName =
              request.user?.name || request.name || email.split("@")[0] || "Unknown";

            return (
              <div
                key={request.id}
                className={`rounded-2xl border-2 transition-all duration-300 ${
                  isExpanded
                    ? "border-trinity-red/40 bg-white/[0.03]"
                    : "border-gray-700/50 hover:border-gray-600"
                }`}
              >
                {/* Card Header - Always visible */}
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : request.id)
                  }
                  className="w-full text-left p-5 flex items-start gap-4"
                >
                  {/* Status indicator dot */}
                  <div className="mt-1.5 flex-shrink-0">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        request.status === "SUBMITTED"
                          ? "bg-blue-500 animate-pulse"
                          : request.status === "REVIEWING"
                          ? "bg-yellow-500"
                          : request.status === "APPROVED"
                          ? "bg-green-500"
                          : request.status === "REJECTED"
                          ? "bg-red-500"
                          : request.status === "NEEDS_INFO"
                          ? "bg-orange-500"
                          : "bg-gray-500"
                      }`}
                    />
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-white truncate">
                          {request.title || "Untitled Request"}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="flex items-center gap-1.5 text-sm text-gray-400">
                            <FiUser className="w-3.5 h-3.5" />
                            {userName}
                          </span>
                          <span className="flex items-center gap-1.5 text-sm text-gray-400">
                            <FiMail className="w-3.5 h-3.5" />
                            {email}
                          </span>
                          {request.company && (
                            <span className="flex items-center gap-1.5 text-sm text-gray-400">
                              <FiBriefcase className="w-3.5 h-3.5" />
                              {request.company}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <StatusBadge
                          status={request.status?.toLowerCase() || "draft"}
                          size="sm"
                        />
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {request.createdAt
                            ? timeAgo(request.createdAt)
                            : "—"}
                        </span>
                        {isExpanded ? (
                          <FiChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <FiChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Quick preview tags */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {request.budget && request.budget !== "UNKNOWN" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs">
                          <FiDollarSign className="w-3 h-3" />
                          {formatBudget(request.budget)}
                        </span>
                      )}
                      {request.timeline && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs">
                          <FiClock className="w-3 h-3" />
                          {formatTimeline(request.timeline)}
                        </span>
                      )}
                      {request.services && request.services.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs">
                          <FiTag className="w-3 h-3" />
                          {request.services.length} service
                          {request.services.length !== 1 ? "s" : ""}
                        </span>
                      )}
                      {request.estimatedHours && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs">
                          <FiClock className="w-3 h-3" />
                          ~{request.estimatedHours}h est.
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-700/50 px-5 pb-5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-5">
                      {/* Left Column - Project Details */}
                      <div className="space-y-4">
                        <h4 className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                          Project Details
                        </h4>

                        {/* Description */}
                        {request.description && (
                          <DetailItem
                            icon={FiFileText}
                            label="Description / Goals"
                            value={request.description}
                            multiline
                          />
                        )}

                        {/* Services */}
                        {request.services && request.services.length > 0 && (
                          <DetailItem
                            icon={FiTag}
                            label="Services Requested"
                            value={formatServices(request.services)}
                          />
                        )}

                        {/* Budget */}
                        <DetailItem
                          icon={FiDollarSign}
                          label="Budget"
                          value={formatBudget(request.budget)}
                        />

                        {/* Timeline */}
                        <DetailItem
                          icon={FiClock}
                          label="Timeline"
                          value={formatTimeline(request.timeline)}
                        />

                        {/* Project Type */}
                        {request.projectType && (
                          <DetailItem
                            icon={FiBriefcase}
                            label="Project Type"
                            value={request.projectType}
                          />
                        )}

                        {/* Goal */}
                        {request.goal && (
                          <DetailItem
                            icon={FiGlobe}
                            label="Goal"
                            value={request.goal}
                            multiline
                          />
                        )}

                        {/* Resources URL */}
                        {request.resourcesUrl && (
                          <div className="flex items-start gap-3">
                            <FiGlobe className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                                Resources URL
                              </p>
                              <a
                                href={request.resourcesUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-cyan-400 hover:text-cyan-300 underline break-all"
                              >
                                {request.resourcesUrl}
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {request.notes && (
                          <DetailItem
                            icon={FiMessageSquare}
                            label="Admin Notes"
                            value={request.notes}
                            multiline
                          />
                        )}
                      </div>

                      {/* Right Column - Contact & Hours */}
                      <div className="space-y-4">
                        <h4 className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                          Contact & Tracking
                        </h4>

                        {/* Contact Email */}
                        <DetailItem
                          icon={FiMail}
                          label="Contact Email"
                          value={email}
                        />

                        {/* Name */}
                        {request.name && (
                          <DetailItem
                            icon={FiUser}
                            label="Name"
                            value={request.name}
                          />
                        )}

                        {/* Company */}
                        {request.company && (
                          <DetailItem
                            icon={FiBriefcase}
                            label="Company"
                            value={request.company}
                          />
                        )}

                        {/* Hours Tracking */}
                        {(request.estimatedHours || request.actualHours) && (
                          <>
                            <h4 className="text-xs uppercase tracking-widest text-gray-500 font-bold pt-2">
                              Hours Tracking
                            </h4>
                            {request.estimatedHours && (
                              <DetailItem
                                icon={FiClock}
                                label="Estimated Hours"
                                value={`${request.estimatedHours} hours`}
                              />
                            )}
                            {request.actualHours && (
                              <DetailItem
                                icon={FiClock}
                                label="Actual Hours"
                                value={`${request.actualHours} hours`}
                              />
                            )}
                            {request.hoursDeducted && (
                              <DetailItem
                                icon={FiCheck}
                                label="Hours Deducted"
                                value={`${request.hoursDeducted} hours (${request.hoursSource || "N/A"})`}
                              />
                            )}
                          </>
                        )}

                        {/* Dates */}
                        <h4 className="text-xs uppercase tracking-widest text-gray-500 font-bold pt-2">
                          Dates
                        </h4>
                        <DetailItem
                          icon={FiCalendar}
                          label="Created"
                          value={
                            request.createdAt
                              ? new Date(request.createdAt).toLocaleString()
                              : "—"
                          }
                        />
                        {request.updatedAt &&
                          request.updatedAt !== request.createdAt && (
                            <DetailItem
                              icon={FiCalendar}
                              label="Last Updated"
                              value={new Date(
                                request.updatedAt
                              ).toLocaleString()}
                            />
                          )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between gap-4 pt-6 mt-6 border-t border-gray-700/50 flex-wrap">
                      {/* Status Change */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-500 mr-1">
                          Change status:
                        </span>
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s.value}
                            onClick={() =>
                              handleStatusChange(request.id, s.value)
                            }
                            disabled={
                              updatingStatus === request.id ||
                              request.status === s.value
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              request.status === s.value
                                ? "bg-white/10 text-white ring-1 ring-white/20"
                                : "text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                        {updatingStatus === request.id && (
                          <div className="w-4 h-4 border-2 border-trinity-red border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() =>
                          handleDelete(request.id, request.title || "Untitled")
                        }
                        disabled={deleting === request.id}
                        className="flex items-center gap-2 px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const STAT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "trinity-red": { bg: "bg-red-500/15", border: "border-red-500/25", text: "text-red-500" },
  "green-500": { bg: "bg-green-500/15", border: "border-green-500/25", text: "text-green-500" },
  "blue-500": { bg: "bg-blue-500/15", border: "border-blue-500/25", text: "text-blue-500" },
  "purple-500": { bg: "bg-purple-500/15", border: "border-purple-500/25", text: "text-purple-500" },
};

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  subtitle: string;
}) {
  const colors = STAT_COLORS[color] || STAT_COLORS["blue-500"];
  return (
    <div className="rounded-2xl border-2 border-gray-700/50 bg-white/[0.02] p-5 hover:border-gray-600 transition-all">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
          {label}
        </p>
        <div className={`w-9 h-9 ${colors.bg} rounded-lg flex items-center justify-center border ${colors.border}`}>
          <Icon className={`w-4 h-4 ${colors.text}`} />
        </div>
      </div>
      <p className="text-3xl font-heading font-bold text-white mb-0.5">
        {value}
      </p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  multiline,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
          {label}
        </p>
        <p
          className={`text-sm text-gray-200 mt-0.5 ${
            multiline ? "whitespace-pre-wrap" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
