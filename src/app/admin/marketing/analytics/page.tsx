import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { prisma } from "@/lib/prisma";
import { MarketingAnalyticsClient } from "@/components/admin/marketing/MarketingAnalyticsClient";

export const dynamic = "force-dynamic";

export default async function MarketingAnalyticsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.OUTREACH];
  if (!allowedRoles.includes(user.role as any)) {
    redirect("/admin");
  }

  // Fetch all marketing data for analytics
  const [
    prospects,
    templates,
    campaigns,
    dripCampaigns,
    sentEmails,
  ] = await Promise.all([
    // Prospects data
    prisma.prospect.findMany({
      where: {
        archived: false,
      },
      select: {
        id: true,
        leadScore: true,
        status: true,
        category: true,
        city: true,
        state: true,
        hasWebsite: true,
        websiteQuality: true,
        convertedAt: true,
        createdAt: true,
      },
    }),
    
    // Email templates with usage stats
    prisma.emailTemplate.findMany({
      include: {
        campaigns: {
          select: {
            totalSent: true,
            opened: true,
            replied: true,
          },
        },
        dripSteps: {
          select: {
            sent: true,
            opened: true,
            replied: true,
          },
        },
      },
    }),
    
    // Email campaigns
    prisma.emailCampaign.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        totalSent: true,
        opened: true,
        clicked: true,
        replied: true,
        sentAt: true,
        createdAt: true,
        template: {
          select: {
            name: true,
            category: true,
          },
        },
      },
    }),
    
    // Drip campaigns
    prisma.dripCampaign.findMany({
      include: {
        steps: {
          select: {
            sent: true,
            opened: true,
            clicked: true,
            replied: true,
          },
        },
        enrollments: {
          select: {
            completed: true,
            unsubscribed: true,
            totalOpened: true,
            totalClicked: true,
            repliedAt: true,
          },
        },
      },
    }),
    
    // Sent emails for detailed tracking
    prisma.sentEmail.findMany({
      where: {
        sentAt: {
          not: null,
        },
      },
      select: {
        id: true,
        sentAt: true,
        deliveredAt: true,
        openedAt: true,
        clickedAt: true,
        repliedAt: true,
        bouncedAt: true,
        status: true,
        prospect: {
          select: {
            leadScore: true,
            category: true,
            state: true,
          },
        },
      },
      orderBy: {
        sentAt: "desc",
      },
      take: 500, // Last 500 emails
    }),
  ]);

  // Calculate aggregate stats
  const stats = {
    prospects: {
      total: prospects.length,
      byScore: {
        hot: prospects.filter(p => p.leadScore >= 80).length,
        warm: prospects.filter(p => p.leadScore >= 60 && p.leadScore < 80).length,
        cold: prospects.filter(p => p.leadScore < 60).length,
      },
      byStatus: prospects.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      converted: prospects.filter(p => p.convertedAt).length,
    },
    templates: {
      total: templates.length,
      active: templates.filter(t => t.active).length,
      performance: templates.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        totalSent: t.campaigns.reduce((sum, c) => sum + c.totalSent, 0) +
                   t.dripSteps.reduce((sum, s) => sum + s.sent, 0),
        totalOpened: t.campaigns.reduce((sum, c) => sum + c.opened, 0) +
                     t.dripSteps.reduce((sum, s) => sum + s.opened, 0),
        totalReplied: t.campaigns.reduce((sum, c) => sum + c.replied, 0) +
                      t.dripSteps.reduce((sum, s) => sum + s.replied, 0),
      })).sort((a, b) => b.totalSent - a.totalSent).slice(0, 10),
    },
    campaigns: {
      total: campaigns.length,
      sent: campaigns.reduce((sum, c) => sum + c.totalSent, 0),
      opened: campaigns.reduce((sum, c) => sum + c.opened, 0),
      replied: campaigns.reduce((sum, c) => sum + c.replied, 0),
    },
    drips: {
      total: dripCampaigns.length,
      active: dripCampaigns.filter(d => d.active).length,
      enrolled: dripCampaigns.reduce((sum, d) => sum + d.totalEnrolled, 0),
      completed: dripCampaigns.reduce((sum, d) => sum + d.totalCompleted, 0),
    },
  };

  // Transform dates for client
  const analyticsData = {
    stats,
    prospects: prospects.map(p => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      convertedAt: p.convertedAt?.toISOString() || null,
    })),
    templates: templates.map(t => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
    campaigns: campaigns.map(c => ({
      ...c,
      sentAt: c.sentAt?.toISOString() || null,
      createdAt: c.createdAt.toISOString(),
    })),
    sentEmails: sentEmails.map(e => ({
      ...e,
      sentAt: e.sentAt?.toISOString() || null,
      deliveredAt: e.deliveredAt?.toISOString() || null,
      openedAt: e.openedAt?.toISOString() || null,
      clickedAt: e.clickedAt?.toISOString() || null,
      repliedAt: e.repliedAt?.toISOString() || null,
      bouncedAt: e.bouncedAt?.toISOString() || null,
    })),
  };

  return <MarketingAnalyticsClient data={analyticsData} />;
}
