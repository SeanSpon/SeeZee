/**
 * Unified Transactions Page
 * All-in-one management for invoices, payments, and subscriptions
 */

import { db } from "@/server/db";
import { TransactionsManager } from "@/components/admin/finance/TransactionsManager";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  // Fetch all transaction data in parallel
  const [invoices, payments, maintenancePlans, legacySubscriptions, organizations, projects] = await Promise.all([
    // All invoices
    db.invoice.findMany({
      include: {
        organization: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        payments: {
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    
    // All payments (including manual transactions)
    db.payment.findMany({
      include: {
        invoice: {
          select: { 
            number: true, 
            title: true,
            organization: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    
    // Maintenance plans (new subscriptions)
    db.maintenancePlan.findMany({
      include: {
        project: {
          include: {
            organization: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    
    // Legacy subscriptions
    db.subscription.findMany({
      include: {
        project: {
          include: {
            organization: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    
    // Organizations for dropdowns
    db.organization.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        stripeCustomerId: true,
      },
      orderBy: { name: "asc" },
    }),
    
    // Projects for dropdowns
    db.project.findMany({
      select: {
        id: true,
        name: true,
        organizationId: true,
        status: true,
      },
      where: {
        status: { in: ["ACTIVE", "MAINTENANCE", "COMPLETED"] },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  // Serialize invoices
  const serializedInvoices = invoices.map(inv => ({
    id: inv.id,
    number: inv.number || `INV-${inv.id.slice(0, 6)}`,
    title: inv.title,
    description: inv.description,
    organizationId: inv.organizationId,
    organizationName: inv.organization?.name || "Unknown",
    organizationEmail: inv.organization?.email || null,
    projectId: inv.projectId,
    projectName: inv.project?.name || null,
    amount: Number(inv.amount),
    tax: Number(inv.tax),
    total: Number(inv.total),
    status: inv.status,
    issueDate: inv.createdAt.toISOString(),
    dueDate: inv.dueDate?.toISOString() || null,
    paidAt: inv.paidAt?.toISOString() || null,
    createdAt: inv.createdAt.toISOString(),
    payments: inv.payments.map((p: any) => ({
      id: p.id,
      amount: Number(p.amount),
      paymentMethod: p.method,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
    })),
  }));

  // Serialize payments (mark manual entries by invoice number pattern)
  const serializedPayments = payments.map(payment => {
    const isManual = payment.invoice?.number?.startsWith("MANUAL-");
    
    return {
      id: payment.id,
      amount: Number(payment.amount),
      paymentMethod: payment.method,
      status: payment.status,
      invoiceId: payment.invoiceId,
      invoiceNumber: isManual ? "Manual Entry" : (payment.invoice?.number || "N/A"),
      invoiceTitle: payment.invoice?.title || "External Transaction",
      clientName: payment.invoice?.organization?.name || "No Client",
      stripePaymentIntentId: payment.stripePaymentId,
      createdAt: payment.createdAt.toISOString(),
    };
  });

  // Serialize maintenance plans
  const serializedPlans = maintenancePlans.map(plan => ({
    id: plan.id,
    type: "maintenance" as const,
    clientId: plan.project?.organization?.id || "",
    clientName: plan.project?.organization?.name || "Unknown",
    clientEmail: plan.project?.organization?.email || null,
    projectId: plan.projectId,
    projectName: plan.project?.name || "Unknown",
    monthlyPrice: Number(plan.monthlyPrice),
    billingCycle: "monthly",
    status: plan.status,
    stripeSubscriptionId: plan.stripeSubscriptionId,
    stripePriceId: null,
    nextBillingDate: null,
    startDate: plan.createdAt.toISOString(),
    endDate: null,
    createdAt: plan.createdAt.toISOString(),
    hourPacks: [],
  }));

  // Serialize legacy subscriptions
  const serializedLegacy = legacySubscriptions.map(sub => ({
    id: sub.id,
    type: "legacy" as const,
    clientId: sub.project?.organization?.id || "",
    clientName: sub.project?.organization?.name || "Unknown",
    clientEmail: sub.project?.organization?.email || null,
    projectId: sub.projectId,
    projectName: sub.project?.name || "Unknown",
    monthlyPrice: 0, // Legacy don't have price
    billingCycle: "monthly" as const,
    status: sub.status,
    stripeSubscriptionId: sub.stripeId,
    stripePriceId: null,
    nextBillingDate: null,
    startDate: sub.createdAt.toISOString(),
    endDate: null,
    createdAt: sub.createdAt.toISOString(),
    hourPacks: [],
  }));

  // Combine all subscriptions
  const allSubscriptions = [...serializedPlans, ...serializedLegacy];

  return (
    <TransactionsManager
      invoices={serializedInvoices}
      payments={serializedPayments}
      subscriptions={allSubscriptions}
      organizations={organizations}
      projects={projects}
    />
  );
}
