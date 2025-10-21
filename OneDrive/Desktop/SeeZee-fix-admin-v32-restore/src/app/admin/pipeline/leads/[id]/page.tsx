/**
 * Lead Detail Page
 * Shows questionnaire responses, receipt, and status management
 */

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LeadDetailClient } from "@/components/admin/LeadDetailClient";

export const dynamic = "force-dynamic";

interface LeadDetailPageProps {
  params: {
    id: string;
  };
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: {
      organization: true,
      project: true,
    },
  });

  if (!lead) {
    notFound();
  }

  // Try to find the associated questionnaire
  let questionnaire = null;
  if (lead.metadata && typeof lead.metadata === 'object' && 'qid' in lead.metadata) {
    questionnaire = await prisma.questionnaire.findUnique({
      where: { id: (lead.metadata as any).qid },
    });
  }

  return (
    <div className="space-y-6">
      <LeadDetailClient lead={lead} questionnaire={questionnaire} />
    </div>
  );
}
