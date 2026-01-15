/**
 * CEO Automations - Webhooks & Workflow Management
 */

import { db } from "@/server/db";
import { requireRole } from "@/lib/auth/requireRole";
import { AutomationsClient } from "@/components/ceo/AutomationsClient";
import { ROLE } from "@/lib/role";

export const dynamic = "force-dynamic";

export default async function CEOAutomationsPage() {
  await requireRole([ROLE.CEO]);

  // Fetch webhook events to show integration activity
  const rawWebhookEvents = await db.webhookEvent.findMany({
    select: {
      id: true,
      type: true,
      processed: true,
      data: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  // Transform to match client component expected shape
  const webhookEvents = rawWebhookEvents.map(w => ({
    id: w.id,
    type: w.type,
    status: w.processed ? 'SUCCESS' : 'PENDING',
    payload: w.data,
    createdAt: w.createdAt,
  }));

  // Calculate webhook stats
  const webhookStats = {
    total: webhookEvents.length,
    successful: webhookEvents.filter(w => w.status === 'SUCCESS').length,
    failed: webhookEvents.filter(w => w.status === 'FAILED').length,
    byType: webhookEvents.reduce((acc, w) => {
      acc[w.type] = (acc[w.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  // Active integrations (hardcoded for now - in production, fetch from settings)
  const integrations = [
    {
      id: 'stripe',
      name: 'Stripe Payments',
      description: 'Payment processing and subscription webhooks',
      enabled: true,
      webhooksReceived: webhookEvents.filter(w => w.type.includes('stripe')).length,
    },
    {
      id: 'resend',
      name: 'Resend Email',
      description: 'Transactional email delivery',
      enabled: true,
      webhooksReceived: webhookEvents.filter(w => w.type.includes('email')).length,
    },
    {
      id: 'google',
      name: 'Google OAuth',
      description: 'User authentication via Google',
      enabled: true,
      webhooksReceived: 0,
    },
  ];

  return (
    <AutomationsClient 
      webhookEvents={webhookEvents}
      webhookStats={webhookStats}
      integrations={integrations}
    />
  );
}
