"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface Lead {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
  message: string | null;
  source: string | null;
}

interface LeadTrackerProps {
  leads: Lead[];
  userName?: string | null;
}

const STEPS = [
  { status: "NEW", label: "Received" },
  { status: "CONTACTED", label: "Under Review" },
  { status: "QUALIFIED", label: "Qualified" },
  { status: "PROPOSAL_SENT", label: "Proposal Sent" },
  { status: "CONVERTED", label: "Project Created" },
] as const;

function getStepIndex(status: string): number {
  const idx = STEPS.findIndex((s) => s.status === status);
  return idx === -1 ? 0 : idx;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function LeadTracker({ leads, userName }: LeadTrackerProps) {
  const lead = leads[0]; // Primary / most recent lead
  const currentStep = getStepIndex(lead.status);
  const isEarlyStage = currentStep <= 1; // NEW or CONTACTED

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {userName ? `Welcome, ${userName.split(" ")[0]}` : "Welcome"}
        </h1>
        <p className="mt-1 text-slate-400">
          Here&apos;s where things stand with your inquiry.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Request Progress
        </h2>

        {/* Desktop stepper */}
        <div className="hidden sm:block">
          <div className="relative flex items-center justify-between">
            {/* Background track */}
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-slate-700" />
            {/* Filled track */}
            <motion.div
              className="absolute left-0 top-4 h-0.5 bg-red-500"
              initial={{ width: 0 }}
              animate={{
                width: `${(currentStep / (STEPS.length - 1)) * 100}%`,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />

            {STEPS.map((step, i) => {
              const isCompleted = i < currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={step.status} className="relative z-10 flex flex-col items-center">
                  <motion.div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                      isCompleted
                        ? "border-red-500 bg-red-500 text-white"
                        : isCurrent
                          ? "border-red-500 bg-slate-900 text-red-400"
                          : "border-slate-600 bg-slate-900 text-slate-500"
                    }`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: isCurrent ? 1.15 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isCompleted ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </motion.div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      isCurrent ? "text-white" : isCompleted ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile stepper (vertical) */}
        <div className="space-y-3 sm:hidden">
          {STEPS.map((step, i) => {
            const isCompleted = i < currentStep;
            const isCurrent = i === currentStep;
            return (
              <div key={step.status} className="flex items-center gap-3">
                <div
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                    isCompleted
                      ? "border-red-500 bg-red-500 text-white"
                      : isCurrent
                        ? "border-red-500 bg-slate-900 text-red-400"
                        : "border-slate-600 bg-slate-900 text-slate-500"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isCurrent ? "text-white" : isCompleted ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Waiting animation for early stages */}
      {isEarlyStage && (
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 px-6 py-8 text-center">
          {/* Bus animation */}
          <div className="relative mb-6 h-12 overflow-hidden">
            <motion.div
              className="absolute top-1 text-4xl"
              initial={{ x: "-10%" }}
              animate={{ x: "110%" }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ width: "fit-content" }}
            >
              <svg viewBox="0 0 64 32" className="h-10 w-20" fill="none">
                {/* Bus body */}
                <rect x="4" y="4" width="48" height="20" rx="4" fill="#ef4444" />
                {/* Windows */}
                <rect x="10" y="8" width="8" height="6" rx="1" fill="#1e293b" />
                <rect x="22" y="8" width="8" height="6" rx="1" fill="#1e293b" />
                <rect x="34" y="8" width="8" height="6" rx="1" fill="#1e293b" />
                {/* Windshield */}
                <rect x="46" y="6" width="6" height="10" rx="2" fill="#38bdf8" />
                {/* Wheels */}
                <circle cx="16" cy="26" r="4" fill="#334155" />
                <circle cx="16" cy="26" r="2" fill="#64748b" />
                <circle cx="40" cy="26" r="4" fill="#334155" />
                <circle cx="40" cy="26" r="2" fill="#64748b" />
                {/* Headlight */}
                <rect x="52" y="14" width="3" height="4" rx="1" fill="#fbbf24" />
              </svg>
            </motion.div>
            {/* Road line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-700" />
            <motion.div
              className="absolute bottom-0 h-px bg-slate-500"
              style={{ width: "30px" }}
              initial={{ x: "100vw" }}
              animate={{ x: "-30px" }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <p className="text-lg font-semibold text-white">
            We&apos;re reviewing your request &mdash; hang tight!
          </p>
          <p className="mt-2 text-sm text-slate-400">
            We typically respond within 24 hours.
          </p>
        </div>
      )}

      {/* Lead Details Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Your Submission
        </h2>

        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">Name</p>
              <p className="text-white">{lead.name}</p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                lead.status === "NEW"
                  ? "bg-blue-500/15 text-blue-400"
                  : lead.status === "CONTACTED"
                    ? "bg-amber-500/15 text-amber-400"
                    : lead.status === "QUALIFIED"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : lead.status === "PROPOSAL_SENT"
                        ? "bg-purple-500/15 text-purple-400"
                        : "bg-green-500/15 text-green-400"
              }`}
            >
              {STEPS.find((s) => s.status === lead.status)?.label ?? lead.status}
            </span>
          </div>

          {lead.message && (
            <div>
              <p className="text-sm text-slate-400">Message</p>
              <p className="text-sm text-slate-300">
                {lead.message.length > 200
                  ? lead.message.slice(0, 200) + "..."
                  : lead.message}
              </p>
            </div>
          )}

          <div className="flex gap-6">
            <div>
              <p className="text-sm text-slate-400">Submitted</p>
              <p className="text-sm text-white">{formatDate(lead.createdAt)}</p>
            </div>
            {lead.source && (
              <div>
                <p className="text-sm text-slate-400">Source</p>
                <p className="text-sm capitalize text-white">{lead.source}</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional leads */}
        {leads.length > 1 && (
          <div className="mt-4 border-t border-slate-800 pt-4">
            <p className="text-xs text-slate-500">
              +{leads.length - 1} other submission{leads.length > 2 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/start"
          className="inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          Start a New Project
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
