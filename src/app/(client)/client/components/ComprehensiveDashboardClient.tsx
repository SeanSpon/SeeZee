"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import { HoursBank } from "@/components/client/HoursBank";
import { MaintenancePlanManager } from "@/components/client/MaintenancePlanManager";
import { ClientFinancialOverview } from "@/components/client/ClientFinancialOverview";
import type { ComprehensiveDashboardData } from "@/lib/dashboard-helpers";
import type { HoursBalanceData } from "../actions/hours";
import {
  FiArrowRight,
  FiFolder,
  FiFileText,
  FiMessageSquare,
  FiCheckCircle,
  FiPlus,
  FiClock,
  FiCalendar,
  FiAlertCircle,
  FiSun,
  FiMoon,
  FiSunset,
  FiExternalLink,
  FiChevronRight,
} from "react-icons/fi";

interface ComprehensiveDashboardClientProps {
  data: ComprehensiveDashboardData;
  userName?: string;
  hoursBalance?: HoursBalanceData | null;
}

/* ── Greeting helper ── */
function getGreeting(): { text: string; icon: typeof FiSun } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", icon: FiSun };
  if (hour < 17) return { text: "Good afternoon", icon: FiSunset };
  return { text: "Good evening", icon: FiMoon };
}

export default function ComprehensiveDashboardClient({
  data,
  userName,
  hoursBalance,
}: ComprehensiveDashboardClientProps) {
  const searchParams = useSearchParams();
  const [selectedPlanProjectId, setSelectedPlanProjectId] = useState<string | undefined>();
  const [currentHoursBalance, setCurrentHoursBalance] = useState<HoursBalanceData | null | undefined>(hoursBalance);
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);

  const activeProjects = data.projects.filter((p) => {
    const status = String(p.status || "").toUpperCase();
    return !["COMPLETED", "CANCELLED", "ARCHIVED"].includes(status);
  });

  const firstName = userName?.split(" ")[0] || "there";
  const { text: greetingText, icon: GreetingIcon } = getGreeting();

  // ── Hours balance fetch ──
  useEffect(() => {
    const fetchHoursBalance = async () => {
      const shouldRefresh = searchParams?.get("refresh") === "hours";
      if (shouldRefresh) {
        try {
          const url = selectedPlanProjectId
            ? `/api/client/hours?projectId=${selectedPlanProjectId}&_t=${Date.now()}`
            : `/api/client/hours?_t=${Date.now()}`;
          const response = await fetch(url, { cache: "no-store", headers: { "Cache-Control": "no-cache" } });
          if (response.ok) {
            const d = await response.json();
            setCurrentHoursBalance(d);
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.delete("refresh");
            window.history.replaceState({}, "", currentUrl.pathname + currentUrl.search);
          }
        } catch {}
      } else if (selectedPlanProjectId) {
        try {
          const response = await fetch(`/api/client/hours?projectId=${selectedPlanProjectId}`, { cache: "no-store" });
          if (response.ok) setCurrentHoursBalance(await response.json());
        } catch {}
      } else {
        setCurrentHoursBalance(hoursBalance);
      }
    };
    fetchHoursBalance();
  }, [selectedPlanProjectId, hoursBalance, searchParams]);

  // ── Meetings fetch ──
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/client/meetings");
        if (res.ok) {
          const d = await res.json();
          const now = new Date();
          setUpcomingMeetings(
            (d.meetings || [])
              .filter((m: any) => new Date(m.startTime) > now && ["SCHEDULED", "CONFIRMED", "PENDING"].includes(m.status))
              .slice(0, 3)
          );
        }
      } catch {}
      setLoadingMeetings(false);
    })();
  }, []);

  // ── Request breakdown ──
  const requestBreakdown = useMemo(() => {
    const pending = data.recentRequests.filter((r: any) => {
      const s = String(r.status || "").toLowerCase();
      return ["draft", "submitted", "reviewing", "needs_info", "pending"].includes(s);
    });
    const approved = data.recentRequests.filter((r: any) => {
      const s = String(r.status || "").toLowerCase();
      return ["approved", "in_progress", "completed"].includes(s);
    });
    return { pending, approved };
  }, [data.recentRequests]);

  // ── Hours for chart ──
  const hoursBalanceForChart = useMemo(() => {
    if (!currentHoursBalance) return undefined;
    return {
      monthlyUsed: currentHoursBalance.monthlyUsed,
      monthlyIncluded: currentHoursBalance.monthlyIncluded,
      rolloverHours: currentHoursBalance.rolloverTotal,
      packHours: currentHoursBalance.packHoursTotal,
      totalAvailable: currentHoursBalance.totalAvailable,
    };
  }, [currentHoursBalance]);

  const openTasks = data.actionItems.filter((a) => !a.completed).length;

  return (
    <div className="space-y-8">
      {/* ═══════ HEADER ═══════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <GreetingIcon className="w-4 h-4 text-yellow-500" />
            <span>{greetingText}</span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">
            {firstName}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/client/requests/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            New Request
          </Link>
          <Link
            href="/client/projects"
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-700 text-white rounded-lg text-sm font-medium hover:border-gray-500 transition-colors"
          >
            Projects
          </Link>
        </div>
      </motion.div>

      {/* ═══════ STAT STRIP ═══════ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-wrap gap-3"
      >
        <StatPill
          icon={<FiFolder className="w-3.5 h-3.5" />}
          label="Projects"
          value={String(data.stats.activeProjects)}
          color="text-blue-400"
        />
        <StatPill
          icon={<FiFileText className="w-3.5 h-3.5" />}
          label="Invoices"
          value={String(data.stats.pendingInvoices)}
          color={data.stats.pendingInvoices > 0 ? "text-amber-400" : "text-gray-400"}
        />
        <StatPill
          icon={<FiMessageSquare className="w-3.5 h-3.5" />}
          label="Requests"
          value={String(data.stats.activeRequests)}
          color="text-violet-400"
        />
        {currentHoursBalance && (
          <StatPill
            icon={<FiClock className="w-3.5 h-3.5" />}
            label="Hours"
            value={currentHoursBalance.isUnlimited ? "\u221e" : String(currentHoursBalance.totalAvailable)}
            color="text-cyan-400"
          />
        )}
        {openTasks > 0 && (
          <StatPill
            icon={<FiAlertCircle className="w-3.5 h-3.5" />}
            label="Action items"
            value={String(openTasks)}
            color="text-red-400"
          />
        )}
      </motion.div>

      {/* ═══════ MAIN GRID ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── LEFT COLUMN (2/3) ── */}
        <div className="lg:col-span-2 space-y-8">
          {/* Action Items */}
          {data.actionItems.length > 0 && (
            <Section title="Action Required" badge={String(openTasks)} delay={0.1}>
              <div className="space-y-2">
                {data.actionItems
                  .filter((a) => !a.completed)
                  .slice(0, 5)
                  .map((action) => (
                    <div
                      key={action.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                        action.urgent
                          ? "border-red-500/20 bg-red-500/5 hover:border-red-500/40"
                          : "border-gray-800 bg-gray-900/40 hover:border-gray-700"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          action.urgent ? "bg-red-500" : "bg-blue-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{action.title}</p>
                        {action.description && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{action.description}</p>
                        )}
                      </div>
                      {action.ctaLink && (
                        <Link
                          href={action.ctaLink}
                          className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                            action.urgent
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-white/10 text-white hover:bg-white/20"
                          }`}
                        >
                          {action.cta}
                        </Link>
                      )}
                    </div>
                  ))}
              </div>
            </Section>
          )}

          {/* Projects */}
          <Section
            title="Projects"
            delay={0.15}
            action={
              <Link href="/client/projects" className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                View all <FiArrowRight className="w-3 h-3" />
              </Link>
            }
          >
            {activeProjects.length > 0 ? (
              <div className="space-y-1">
                {activeProjects.slice(0, 6).map((project) => {
                  const completedMilestones = project.milestones.filter((m) => m.completed).length;
                  const totalMilestones = project.milestones.length;
                  const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

                  return (
                    <Link
                      key={project.id}
                      href={`/client/projects/${project.id}`}
                      className="group flex items-center gap-4 p-4 rounded-xl hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-700 transition-colors">
                        <FiFolder className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white truncate">{project.name}</p>
                          <StatusBadge status={project.status} size="sm" />
                        </div>
                        {totalMilestones > 0 && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex-1 h-1 rounded-full bg-gray-800 overflow-hidden max-w-[120px]">
                              <div
                                className="h-full bg-white/40 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-gray-500">{progress}%</span>
                          </div>
                        )}
                      </div>
                      <FiChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <EmptyState message="No active projects" cta="Start a Project" href="/start" />
            )}
          </Section>

          {/* Financial Overview */}
          {data.financialData && (
            <Section title="Financials" delay={0.2}>
              <ClientFinancialOverview data={data.financialData} />
            </Section>
          )}

          {/* Activity */}
          {data.recentActivity.length > 0 && (
            <Section title="Recent Activity" delay={0.25}>
              <div className="space-y-1">
                {data.recentActivity.slice(0, 8).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 py-3 px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-600 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300">{activity.title}</p>
                      {activity.description && (
                        <p className="text-xs text-gray-600 mt-0.5 truncate">{activity.description}</p>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-600 flex-shrink-0 tabular-nums">
                      {formatTimeAgo(activity.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* ── RIGHT COLUMN (1/3) ── */}
        <div className="space-y-6">
          {/* Hours Meter */}
          {currentHoursBalance && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <FiClock className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Support Hours</h3>
              </div>

              {currentHoursBalance.isUnlimited ? (
                <div className="text-center py-4">
                  <p className="text-4xl font-bold text-cyan-400">&infin;</p>
                  <p className="text-xs text-gray-500 mt-1">Unlimited plan</p>
                </div>
              ) : (
                <>
                  {/* Ring gauge */}
                  <div className="flex justify-center mb-4">
                    <HoursGauge
                      used={currentHoursBalance.monthlyUsed}
                      total={currentHoursBalance.monthlyIncluded}
                      available={currentHoursBalance.totalAvailable}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <MiniStat label="Monthly" value={`${currentHoursBalance.monthlyRemaining}h`} />
                    <MiniStat label="Rollover" value={`${currentHoursBalance.rolloverTotal}h`} />
                    <MiniStat label="Packs" value={`${currentHoursBalance.packHoursTotal}h`} />
                    <MiniStat label="Used" value={`${currentHoursBalance.monthlyUsed}h`} accent />
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Maintenance Plan */}
          {currentHoursBalance && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <MaintenancePlanManager
                onPlanSelect={(planId) => {
                  fetch(`/api/client/maintenance-plans/${planId}`)
                    .then((res) => res.json())
                    .then((plan) => {
                      if (plan?.project?.id) setSelectedPlanProjectId(plan.project.id);
                    })
                    .catch(console.error);
                }}
                selectedPlanId={selectedPlanProjectId}
              />
            </motion.div>
          )}

          {/* Requests */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Requests</h3>
              <Link href="/client/requests" className="text-xs text-gray-500 hover:text-white transition-colors">
                View all
              </Link>
            </div>
            <div className="flex gap-3 mb-4">
              <div className="flex-1 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-center">
                <p className="text-lg font-bold text-amber-400">{requestBreakdown.pending.length}</p>
                <p className="text-[11px] text-gray-500">Pending</p>
              </div>
              <div className="flex-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                <p className="text-lg font-bold text-emerald-400">{requestBreakdown.approved.length}</p>
                <p className="text-[11px] text-gray-500">Approved</p>
              </div>
            </div>
            {data.recentRequests.slice(0, 2).map((req) => (
              <Link
                key={req.id}
                href="/client/requests"
                className="block p-3 rounded-lg hover:bg-white/[0.03] transition-colors mb-1"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white truncate flex-1">{req.title}</p>
                  <StatusBadge status={req.status} size="sm" />
                </div>
                <p className="text-[11px] text-gray-600 mt-1">
                  {new Date(req.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
            {data.recentRequests.length === 0 && (
              <p className="text-xs text-gray-600 text-center py-4">No requests yet</p>
            )}
          </motion.div>

          {/* Upcoming Meetings */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FiCalendar className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-white">Meetings</h3>
              </div>
              <Link href="/client/meetings" className="text-xs text-gray-500 hover:text-white transition-colors">
                View all
              </Link>
            </div>
            {loadingMeetings ? (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 border-2 border-gray-700 border-t-white rounded-full animate-spin" />
              </div>
            ) : upcomingMeetings.length > 0 ? (
              <div className="space-y-2">
                {upcomingMeetings.map((meeting) => {
                  const start = new Date(meeting.startTime);
                  const isToday = start.toDateString() === new Date().toDateString();
                  return (
                    <div
                      key={meeting.id}
                      className="p-3 rounded-lg border border-gray-800 bg-gray-900/40"
                    >
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white flex-1 truncate">{meeting.title}</p>
                        {isToday && (
                          <span className="text-[10px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded font-medium">
                            Today
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {isToday
                          ? `Today at ${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                          : start.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <FiCalendar className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-2">No upcoming meetings</p>
                <Link
                  href="/client/meetings"
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Request a meeting
                </Link>
              </div>
            )}
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4"
          >
            {[
              { href: "/client/invoices", label: "Invoices", icon: FiFileText },
              { href: "/client/hours", label: "Hours & Plans", icon: FiClock },
              { href: "/client/support", label: "Support", icon: FiMessageSquare },
              { href: "/client/settings", label: "Settings", icon: FiExternalLink },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.03] transition-colors"
              >
                <link.icon className="w-3.5 h-3.5" />
                {link.label}
                <FiChevronRight className="w-3 h-3 ml-auto text-gray-700" />
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════ */

function StatPill({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-800 bg-gray-900/60 text-xs">
      <span className={color}>{icon}</span>
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function Section({
  title,
  badge,
  action,
  delay = 0,
  children,
}: {
  title: string;
  badge?: string;
  action?: React.ReactNode;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-heading font-semibold text-white">{title}</h2>
          {badge && (
            <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-xs font-semibold">
              {badge}
            </span>
          )}
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  );
}

function EmptyState({ message, cta, href }: { message: string; cta: string; href: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-800 p-10 text-center">
      <p className="text-sm text-gray-500 mb-3">{message}</p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
      >
        <FiPlus className="w-4 h-4" />
        {cta}
      </Link>
    </div>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg bg-gray-800/50 px-3 py-2">
      <p className="text-gray-500 text-[11px]">{label}</p>
      <p className={`font-semibold text-sm ${accent ? "text-red-400" : "text-white"}`}>{value}</p>
    </div>
  );
}

function HoursGauge({
  used,
  total,
  available,
}: {
  used: number;
  total: number;
  available: number;
}) {
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDash = (pct / 100) * circumference;

  return (
    <div className="relative w-28 h-28">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Background ring */}
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        {/* Used ring */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={pct > 80 ? "#ef4444" : pct > 50 ? "#f59e0b" : "#22d3ee"}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circumference}`}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-white">{available}</span>
        <span className="text-[10px] text-gray-500">hrs avail</span>
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const min = 60000;
  const hr = 3600000;
  const day = 86400000;
  if (diff < hr) return `${Math.max(1, Math.floor(diff / min))}m`;
  if (diff < day) return `${Math.floor(diff / hr)}h`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
