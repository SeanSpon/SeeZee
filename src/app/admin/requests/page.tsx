import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
export const dynamic = "force-dynamic";
type Row = {
  id: string;
  kind: string;
  title: string;
  contact: string;
  status: string;
  description: string;
  createdAt: Date;
  href: string;
  detail?: unknown;
};
const openStatuses = new Set([
  "NEW",
  "SUBMITTED",
  "REVIEWING",
  "NEEDS_INFO",
  "PENDING",
  "new",
  "pending",
  "in_progress",
  "IN_PROGRESS",
]);
function SubmissionDetails({ value }: { value: unknown }) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const labels: Record<string, string> = {
    serviceType: "Service",
    phone: "Phone",
    budget: "Budget",
    timeline: "Timeline",
    websiteUrl: "Website",
    currentWebsite: "Current website",
    importantFeatures: "Requested features",
    maintenanceNeeds: "Maintenance needs",
    maintenanceTier: "Maintenance plan",
    additionalNotes: "Additional notes",
    specialRequirements: "Special requirements",
    contentReadiness: "Content readiness",
    bestTimeToCall: "Best time to call",
    nonprofitStatus: "Nonprofit status",
    nonprofitEIN: "EIN",
    pricingComfort: "Pricing preference",
    selectedTier: "Selected plan",
    websitePlatform: "Website platform",
    urgency: "Urgency",
    estimatedHours: "Estimated hours",
    organizationType: "Organization type",
    otherFeature: "Other features",
    role: "Contact role",
    hasAccessCredentials: "Website access",
    pricing: "Pricing",
    tier: "Plan",
  };
  const data = value as Record<string, unknown>;
  return (
    <details className="mt-4 border-t border-white/5 pt-3">
      <summary className="cursor-pointer text-sm text-slate-400">
        More submission details
      </summary>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        {Object.entries(labels).map(([key, label]) => {
          const field = data[key];
          if (
            field == null ||
            field === "" ||
            (Array.isArray(field) && !field.length)
          )
            return null;
          if (typeof field === "object" && !Array.isArray(field)) return null;
          return (
            <div key={key}>
              <dt className="text-xs text-slate-500">{label}</dt>
              <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-200">
                {Array.isArray(field)
                  ? field.join(", ")
                  : String(field).replace(/_/g, " ")}
              </dd>
            </div>
          );
        })}
      </dl>
      {Array.isArray(data.attachments) && data.attachments.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-slate-500">Attachments</p>
          <ul className="mt-2 space-y-2">
            {data.attachments
              .filter(
                (url): url is string =>
                  typeof url === "string" && url.startsWith("https://"),
              )
              .map((url, index) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-sky-400 hover:underline"
                  >
                    Open attachment {index + 1} ↗
                  </a>
                </li>
              ))}
          </ul>
        </div>
      )}
    </details>
  );
}
export default async function SubmissionInbox({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; view?: string }>;
}) {
  await requireRole([
    ROLE.CEO,
    ROLE.CFO,
    ROLE.FRONTEND,
    ROLE.BACKEND,
    ROLE.OUTREACH,
  ]);
  const { q = "", type = "all", view = "open" } = await searchParams;
  let rows: Row[];
  try {
    const [leads, intake, changes, requests, unified] = await Promise.all([
      prisma.lead.findMany({
        include: { intakeRequest: true },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      prisma.projectRequest.findMany({
        where: { leadId: null },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      prisma.changeRequest.findMany({
        include: { project: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      prisma.request.findMany({
        include: { project: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      prisma.unifiedRequest.findMany({
        include: { project: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
    ]);
    rows = [
      ...leads.map((l) => ({
        id: l.id,
        kind: "Inquiry",
        title: l.company || l.name,
        contact: l.email,
        status: l.intakeRequest?.status === "ARCHIVED" ? "ARCHIVED" : l.status,
        description: l.message || "",
        createdAt: l.createdAt,
        href: `/admin/pipeline/leads/${l.id}`,
        detail: l.metadata,
      })),
      ...intake.map((r) => ({
        id: r.id,
        kind: "Project request",
        title: r.title || r.name || "Project request",
        contact: r.contactEmail || r.email || "",
        status: r.status,
        description: r.description || r.goal || "",
        createdAt: r.createdAt,
        href: `/admin/pipeline/leads/${r.id}`,
      })),
      ...changes.map((r) => ({
        id: r.id,
        kind: "Maintenance",
        title: r.project.name,
        contact: "Existing project",
        status: r.status,
        description: r.description,
        createdAt: r.createdAt,
        href: `/admin/projects/${r.projectId}`,
      })),
      ...requests.map((r) => ({
        id: r.id,
        kind: "Project support",
        title: r.title,
        contact: r.project.name,
        status: r.state,
        description: r.details,
        createdAt: r.createdAt,
        href: `/admin/projects/${r.projectId}`,
      })),
      ...unified.map((r) => ({
        id: r.id,
        kind: "Other request",
        title: r.title,
        contact: r.project?.name || "General request",
        status: r.status,
        description: r.description,
        createdAt: r.createdAt,
        href: r.projectId ? `/admin/projects/${r.projectId}` : "/admin/tasks",
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch {
    return (
      <div
        role="alert"
        className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-6"
      >
        <h1 className="text-xl font-semibold">The inbox could not load</h1>
        <p className="mt-2 text-slate-300">
          Check the database connection and apply the intake migration to this
          environment, then reload. Submissions have not been changed.
        </p>
      </div>
    );
  }
  const openCount = rows.filter((row) => openStatuses.has(row.status)).length;
  const filtered = rows.filter(
    (row) =>
      (type === "all" || row.kind === type) &&
      (view === "all" || openStatuses.has(row.status)) &&
      `${row.title} ${row.contact} ${row.description}`
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-red-400">
            Clients & intake
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Submission inbox</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Every inquiry has a next step. Review the details, open the record,
            and qualify or assign the work.
          </p>
        </div>
        <Link
          href="/admin/workspace"
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300"
        >
          Workspace guide →
        </Link>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Needs review", openCount],
          ["Records loaded", rows.length],
          ["Matching filters", filtered.length],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-white/10 bg-slate-900 p-5"
          >
            <p className="text-xs text-slate-400">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <form className="flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-slate-900/60 p-4">
        <label className="min-w-[180px] flex-1 text-xs text-slate-400">
          Search
          <input
            name="q"
            defaultValue={q}
            placeholder="Name, email or project details"
            className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-950 p-2.5 text-sm text-white"
          />
        </label>
        <label className="text-xs text-slate-400">
          Request type
          <select
            name="type"
            defaultValue={type}
            className="mt-1 block rounded-lg border border-white/10 bg-slate-950 p-2.5 text-sm text-white"
          >
            {[
              "all",
              "Inquiry",
              "Project request",
              "Maintenance",
              "Project support",
              "Other request",
            ].map((value) => (
              <option key={value} value={value}>
                {value === "all" ? "All types" : value}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-400">
          Status
          <select
            name="view"
            defaultValue={view}
            className="mt-1 block rounded-lg border border-white/10 bg-slate-950 p-2.5 text-sm text-white"
          >
            <option value="open">Needs review</option>
            <option value="all">All statuses</option>
          </select>
        </label>
        <button className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white">
          Apply filters
        </button>
        <Link
          href="/admin/requests"
          className="px-2 py-2.5 text-sm text-slate-400"
        >
          Reset
        </Link>
      </form>
      <p className="text-xs text-slate-500">
        Showing the latest 200 records per source. Linked inquiry and
        project-request pairs appear once. Existing work stays in its original
        workflow.
      </p>
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 p-12 text-center">
          <h2 className="font-semibold">
            {q || type !== "all"
              ? "No matching submissions"
              : "No submissions need review"}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Switch to all statuses to review past submissions.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((row) => (
            <article
              key={`${row.kind}-${row.id}`}
              className="rounded-xl border border-white/10 bg-slate-900/60 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded bg-white/5 px-2 py-1 text-slate-300">
                      {row.kind}
                    </span>
                    <span className="rounded bg-amber-400/10 px-2 py-1 text-amber-200">
                      {row.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <h2 className="break-words font-semibold">{row.title}</h2>
                  <p className="mt-1 break-all text-sm text-slate-400">
                    {row.contact}
                  </p>
                </div>
                <div className="text-right">
                  <p className="mb-3 text-xs text-slate-500">
                    {row.createdAt.toLocaleDateString("en-US", {
                      timeZone: "America/New_York",
                    })}
                  </p>
                  <Link
                    href={row.href}
                    className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:border-red-400/40"
                  >
                    Open record →
                  </Link>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap break-words text-sm text-slate-300">
                {row.description}
              </p>
              <SubmissionDetails value={row.detail} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
