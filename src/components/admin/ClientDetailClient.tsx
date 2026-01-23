"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Building, Mail, Phone, DollarSign, Folder, FileText, Users, Calendar, MapPin, Globe, TrendingUp, Check, X, AlertCircle, Loader2, Clock } from "lucide-react";
import Link from "next/link";
import type { CurrentUser } from "@/lib/auth/requireRole";
import { useDialogContext } from "@/lib/dialog";
import { ClientHoursManager } from "@/components/admin/ClientHoursManager";

interface ClientDetailClientProps {
  clientData: {
    id: string;
    type: "organization" | "lead" | "project";
    organization: any;
    lead: any;
    project: any;
  };
  user: CurrentUser;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

// Consistent color palette for invoice status badges
const invoiceStatusColors: Record<string, string> = {
  DRAFT: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  SENT: "bg-violet-500/10 text-violet-400 border-violet-500/30",
  PAID: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  OVERDUE: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  CANCELLED: "bg-slate-500/10 text-slate-400 border-slate-500/30",
};

// Consistent color palette for project status badges
const projectStatusColors: Record<string, string> = {
  PLANNING: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  LEAD: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  PAID: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  ACTIVE: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  IN_PROGRESS: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  REVIEW: "bg-violet-500/10 text-violet-400 border-violet-500/30",
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  CANCELLED: "bg-slate-500/10 text-slate-400 border-slate-500/30",
};

export function ClientDetailClient({ clientData, user }: ClientDetailClientProps) {
  const router = useRouter();
  const dialog = useDialogContext();
  const [assigningSubscription, setAssigningSubscription] = useState<string | null>(null);
  const [revokingSubscription, setRevokingSubscription] = useState<string | null>(null);
  
  const org = clientData.organization;
  const lead = clientData.lead;
  const project = clientData.project;

  // Determine client name and basic info
  const clientName = org?.name || lead?.name || project?.name || "Unknown Client";
  const clientEmail = org?.email || lead?.email || "No email";
  const clientCompany = org?.name || lead?.company || project?.organization?.name || "N/A";

  // Get projects and invoices
  const projects = org?.projects || (lead?.organization?.projects) || (project ? [project] : []) || [];
  const invoices = org?.invoices || (lead?.organization?.invoices) || project?.invoices || [];
  const leads = org?.leads || (lead ? [lead] : []) || [];

  // Calculate totals (invoice totals are stored in dollars)
  const totalRevenue = invoices
    .filter((inv: any) => inv.status === "PAID")
    .reduce((sum: number, inv: any) => sum + Number(inv.total || 0), 0);
  
  const totalInvoices = invoices.length;
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p: any) => 
    ["ACTIVE", "IN_PROGRESS", "REVIEW"].includes(p.status)
  ).length;

  // Handle assigning subscription to a project
  const handleAssignSubscription = async (projectId: string, projectName: string) => {
    const confirmed = await dialog.confirm(
      `Assign a quarterly maintenance subscription ($2,000/quarter) to ${projectName}? This will grant the client immediate access to their dashboard.`,
      {
        title: "Assign Subscription",
        variant: "info",
        confirmText: "Assign Subscription",
        cancelText: "Cancel",
      }
    );

    if (!confirmed) return;

    setAssigningSubscription(projectId);
    try {
      const response = await fetch("/api/admin/subscriptions/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          planName: "Quarterly Maintenance",
          changeRequestsAllowed: 6,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to assign subscription");
      }

      await dialog.alert("Subscription assigned successfully! The client now has access to their dashboard.", {
        variant: "success",
      });

      router.refresh();
    } catch (error) {
      await dialog.alert(
        error instanceof Error ? error.message : "Failed to assign subscription",
        { variant: "error" }
      );
    } finally {
      setAssigningSubscription(null);
    }
  };

  // Handle revoking subscription
  const handleRevokeSubscription = async (subscriptionId: string, projectName: string) => {
    const confirmed = await dialog.confirm(
      `Revoke the maintenance subscription for ${projectName}? The client will lose dashboard access immediately.`,
      {
        title: "Revoke Subscription",
        variant: "warning",
        confirmText: "Revoke",
        cancelText: "Cancel",
      }
    );

    if (!confirmed) return;

    setRevokingSubscription(subscriptionId);
    try {
      const response = await fetch(`/api/admin/subscriptions/assign?id=${subscriptionId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to revoke subscription");
      }

      await dialog.alert("Subscription revoked successfully.", { variant: "success" });

      router.refresh();
    } catch (error) {
      await dialog.alert(
        error instanceof Error ? error.message : "Failed to revoke subscription",
        { variant: "error" }
      );
    } finally {
      setRevokingSubscription(null);
    }
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/[0.08] rounded-lg transition-colors border border-transparent hover:border-white/[0.08]"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-3xl font-semibold text-white">{clientName}</h1>
              <p className="text-sm text-slate-400 mt-1">
                {clientData.type === "organization" && "Organization"}
                {clientData.type === "lead" && "Lead"}
                {clientData.type === "project" && "Project"}
                {" • "}
                {clientEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl p-5 transition-all duration-300 hover:border-white/[0.12]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-[0.15em] text-slate-400 font-medium">Total Projects</span>
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                <Folder className="h-4 w-4 text-sky-400" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-white">{totalProjects}</div>
            <div className="text-[11px] text-slate-500 mt-1.5">{activeProjects} active</div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl p-5 transition-all duration-300 hover:border-white/[0.12]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-[0.15em] text-slate-400 font-medium">Total Invoices</span>
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-violet-400" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-white">{totalInvoices}</div>
            <div className="text-[11px] text-slate-500 mt-1.5">
              {invoices.filter((inv: any) => inv.status === "PAID").length} paid
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl p-5 transition-all duration-300 hover:border-white/[0.12]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-[0.15em] text-slate-400 font-medium">Total Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-white">{currencyFormatter.format(totalRevenue)}</div>
            <div className="text-[11px] text-slate-500 mt-1.5">Paid invoices</div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl p-5 transition-all duration-300 hover:border-white/[0.12]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-[0.15em] text-slate-400 font-medium">Leads</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-amber-400" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-white">{leads.length}</div>
            <div className="text-[11px] text-slate-500 mt-1.5">
              {leads.filter((l: any) => l.status === "CONVERTED").length} converted
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects ({totalProjects})</TabsTrigger>
            <TabsTrigger value="invoices">Invoices ({totalInvoices})</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="hours">Hours & Packages</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Client Information */}
              <div className="rounded-xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl p-5">
                <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                  <Building className="w-4 h-4 text-sky-400" />
                  Client Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Name</div>
                    <div className="font-medium text-white">{clientName}</div>
                  </div>
                  {clientEmail && clientEmail !== "No email" && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Email
                      </div>
                      <a
                        href={`mailto:${clientEmail}`}
                        className="font-medium text-blue-400 hover:underline"
                      >
                        {clientEmail}
                      </a>
                    </div>
                  )}
                  {org?.phone && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Phone
                      </div>
                      <a
                        href={`tel:${org.phone}`}
                        className="font-medium text-blue-400 hover:underline"
                      >
                        {org.phone}
                      </a>
                    </div>
                  )}
                  {org?.website && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Website
                      </div>
                      <a
                        href={org.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-400 hover:underline"
                      >
                        {org.website}
                      </a>
                    </div>
                  )}
                  {org?.address && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Address
                      </div>
                      <div className="font-medium text-white">
                        {org.address}
                        {org.city && `, ${org.city}`}
                        {org.state && `, ${org.state}`}
                        {org.zipCode && ` ${org.zipCode}`}
                      </div>
                    </div>
                  )}
                  {org?.createdAt && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Created
                      </div>
                      <div className="font-medium text-white">
                        {new Date(org.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Organization Members */}
              {org?.members && org.members.length > 0 && (
                <div className="rounded-xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl p-5">
                  <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-violet-400" />
                    Team Members ({org.members.length})
                  </h3>
                  <div className="space-y-3">
                    {org.members.map((member: any) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-white">
                            {member.user?.name || "Unknown"}
                          </div>
                          <div className="text-sm text-gray-400">{member.user?.email}</div>
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {member.role?.toLowerCase()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            <div className="space-y-3">
              {projects.length > 0 ? (
                projects.map((proj: any) => (
                  <Link
                    key={proj.id}
                    href={`/admin/pipeline/projects/${proj.id}`}
                    className="block rounded-xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl p-5 hover:border-white/[0.15] transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-white">{proj.name}</h4>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium border ${
                              projectStatusColors[proj.status] || projectStatusColors.LEAD
                            }`}
                          >
                            {proj.status?.replace("_", " ")}
                          </span>
                        </div>
                        {proj.description && (
                          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                            {proj.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {proj.assignee && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {proj.assignee.name}
                            </div>
                          )}
                          {proj.createdAt && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(proj.createdAt).toLocaleDateString()}
                            </div>
                          )}
                          {proj.budget && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {currencyFormatter.format(Number(proj.budget))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl p-12 text-center">
                  <Folder className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No projects found for this client</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="invoices" className="mt-6">
            <div className="space-y-3">
              {invoices.length > 0 ? (
                invoices.map((invoice: any) => (
                  <Link
                    key={invoice.id}
                    href={`/admin/pipeline/invoices/${invoice.id}`}
                    className="block rounded-xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl p-5 hover:border-white/[0.15] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-white">
                            {invoice.title || invoice.number || "Invoice"}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium border ${
                              invoiceStatusColors[invoice.status] || invoiceStatusColors.DRAFT
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          {invoice.createdAt && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(invoice.createdAt).toLocaleDateString()}
                            </div>
                          )}
                          {invoice.dueDate && (
                            <div className="flex items-center gap-1">
                              Due: {new Date(invoice.dueDate).toLocaleDateString()}
                            </div>
                          )}
                          {invoice.project && (
                            <div className="flex items-center gap-1">
                              <Folder className="w-3 h-3" />
                              {invoice.project.name}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          {currencyFormatter.format(Number(invoice.total || 0))}
                        </div>
                        {invoice.paidAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            Paid {new Date(invoice.paidAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl p-12 text-center">
                  <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No invoices found for this client</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="subscriptions" className="mt-6">
            <div className="space-y-3">
              {projects.length > 0 ? (
                projects.map((proj: any) => {
                  const activeSubscription = proj.subscriptions?.find(
                    (sub: any) => sub.status === "active"
                  );
                  const isManual = activeSubscription?.stripeId?.startsWith("manual_");

                  return (
                    <div
                      key={proj.id}
                      className="rounded-xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl p-5"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white mb-1">
                            {proj.name}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {activeSubscription ? (
                              <>
                                <span className="text-green-400">●</span> Active Subscription
                                {isManual && (
                                  <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                                    Manually Assigned
                                  </span>
                                )}
                              </>
                            ) : (
                              <>
                                <span className="text-gray-500">●</span> No Active Subscription
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      {activeSubscription ? (
                        <div className="bg-white/5 rounded-lg p-4 mb-4">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="text-xs text-gray-400 mb-1">Plan</div>
                              <div className="text-sm font-medium text-white">
                                {activeSubscription.planName || "Quarterly Maintenance"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400 mb-1">Status</div>
                              <div className="text-sm font-medium capitalize text-green-400">
                                {activeSubscription.status}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400 mb-1">Change Requests</div>
                              <div className="text-sm font-medium text-white">
                                {activeSubscription.changeRequestsUsed || 0} /{" "}
                                {activeSubscription.changeRequestsAllowed || 6}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400 mb-1">Period Ends</div>
                              <div className="text-sm font-medium text-white">
                                {activeSubscription.currentPeriodEnd
                                  ? new Date(
                                      activeSubscription.currentPeriodEnd
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </div>
                            </div>
                          </div>

                          {isManual && (
                            <button
                              onClick={() =>
                                handleRevokeSubscription(activeSubscription.id, proj.name)
                              }
                              disabled={revokingSubscription === activeSubscription.id}
                              className="w-full py-2 px-4 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {revokingSubscription === activeSubscription.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Revoking...
                                </>
                              ) : (
                                <>
                                  <X className="w-4 h-4" />
                                  Revoke Subscription
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm text-yellow-400 mb-2">
                                This project doesn't have an active subscription. Assign one to grant
                                dashboard access.
                              </p>
                              <button
                                onClick={() => handleAssignSubscription(proj.id, proj.name)}
                                disabled={assigningSubscription === proj.id}
                                className="py-2 px-4 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                {assigningSubscription === proj.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Assigning...
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-4 h-4" />
                                    Assign Subscription ($2,000/quarter)
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl p-12 text-center">
                  <Folder className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm mb-1">No projects found</p>
                  <p className="text-xs text-slate-500">
                    Create a project first to assign subscriptions
                  </p>
                </div>
              )}

              <div className="bg-sky-500/5 border border-sky-500/20 rounded-xl p-5 mt-4">
                <div className="flex items-start gap-4">
                  <TrendingUp className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white font-medium mb-2 text-sm">
                      About Manual Subscriptions
                    </h4>
                    <ul className="text-sm text-slate-400 space-y-1.5">
                      <li>
                        • Manually assigned subscriptions grant immediate dashboard access
                      </li>
                      <li>
                        • Use this feature to give clients access before their first payment
                      </li>
                      <li>
                        • Clients can later upgrade to a paid plan through their dashboard
                      </li>
                      <li>
                        • Manual subscriptions can be revoked at any time
                      </li>
                      <li>
                        • Paid subscriptions (via Stripe) should be managed in the Stripe
                        dashboard
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hours" className="mt-6">
            <ClientHoursManager
              clientId={clientData.id}
              clientName={clientName}
              projects={projects.map((p: any) => ({
                id: p.id,
                name: p.name,
                status: p.status,
              }))}
            />
          </TabsContent>

          <TabsContent value="contacts" className="mt-6">
            <div className="space-y-3">
              {/* Organization Members */}
              {org?.members && org.members.length > 0 && (
                <div className="rounded-xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl p-5">
                  <h3 className="text-base font-semibold text-white mb-4">Team Members</h3>
                  <div className="space-y-3">
                    {org.members.map((member: any) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-medium text-white">
                              {member.user?.name || "Unknown"}
                            </div>
                            <div className="text-sm text-gray-400">{member.user?.email}</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {member.role?.toLowerCase()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lead Contacts */}
              {leads.length > 0 && (
                <div className="rounded-xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl p-5">
                  <h3 className="text-base font-semibold text-white mb-4">Lead Contacts</h3>
                  <div className="space-y-3">
                    {leads.map((l: any) => (
                      <div
                        key={l.id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-white">{l.name}</div>
                          <div className="text-sm text-gray-400">{l.email}</div>
                          {l.phone && <div className="text-sm text-gray-500">{l.phone}</div>}
                        </div>
                        <Link
                          href={`/admin/pipeline/leads/${l.id}`}
                          className="text-xs text-blue-400 hover:underline"
                        >
                          View Lead →
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!org?.members || org.members.length === 0) && leads.length === 0 && (
                <div className="rounded-xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-xl p-12 text-center">
                  <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No contacts found</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
  );
}

