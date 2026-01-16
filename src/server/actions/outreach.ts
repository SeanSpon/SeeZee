/**
 * Server Actions for Marketing & Outreach System
 * 
 * These actions power the marketing dashboard and handle all prospect/campaign operations.
 */

'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/requireRole';
import { ROLE } from '@/lib/role';
import { revalidatePath } from 'next/cache';
import {
  searchGooglePlaces,
  importGooglePlacesToProspects,
  searchApollo,
  importApolloToProspects,
} from '@/lib/outreach/database-integrations';
import {
  bulkDeleteProspects,
  bulkArchiveProspects,
  bulkUpdateStatus,
  bulkAddTags,
  bulkRemoveTags,
  exportProspectsToCSV,
  getFilteredProspects,
  getProspectCount,
  ProspectFilters,
  bulkSetFollowUpDate,
} from '@/lib/outreach/bulk-operations';
import {
  sendBulkEmails,
  generatePersonalizedEmail,
  BulkEmailParams,
} from '@/lib/outreach/email-campaigns';
import { ProspectStatus } from '@prisma/client';

// ============================================================================
// AUTHORIZATION HELPERS
// ============================================================================

async function requireOutreachAccess() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const allowedRoles = [ROLE.CEO, ROLE.CFO, ROLE.OUTREACH];
  if (!allowedRoles.includes(user.role as any)) {
    throw new Error('Not authorized to access outreach features');
  }

  return user;
}

// ============================================================================
// PROSPECT DISCOVERY & IMPORT
// ============================================================================

export async function discoverProspectsAction(params: {
  source: 'google_places' | 'apollo';
  query?: string;
  location?: string;
  category?: string;
  maxResults?: number;
}) {
  await requireOutreachAccess();

  try {
    if (params.source === 'google_places') {
      // Search Google Places
      const results = await searchGooglePlaces({
        query: params.query,
        location: params.location || 'Louisville, KY',
        type: params.category,
        maxResults: params.maxResults || 200,
      });

      // Import into database
      const importResult = await importGooglePlacesToProspects(results);

      revalidatePath('/admin/marketing/prospects');

      return {
        success: true,
        discovered: results.length,
        imported: importResult.imported,
        skipped: importResult.skipped,
        errors: importResult.errors,
      };
    } else if (params.source === 'apollo') {
      // Search Apollo.io
      const results = await searchApollo({
        organizationLocations: params.location ? [params.location] : undefined,
        organizationIndustryTagIds: params.category ? [params.category] : undefined,
        perPage: params.maxResults || 200,
      });

      // Import into database
      const importResult = await importApolloToProspects(results);

      revalidatePath('/admin/marketing/prospects');

      return {
        success: true,
        discovered: results.organizations.length,
        imported: importResult.imported,
        skipped: importResult.skipped,
        errors: importResult.errors,
      };
    }

    return {
      success: false,
      error: 'Invalid source specified',
    };
  } catch (error) {
    console.error('Error discovering prospects:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// PROSPECT FILTERING & RETRIEVAL
// ============================================================================

export async function getProspectsAction(params: {
  filters: ProspectFilters;
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}) {
  await requireOutreachAccess();

  try {
    const result = await getFilteredProspects(
      params.filters,
      params.page || 1,
      params.pageSize || 50,
      params.orderBy || 'leadScore',
      params.orderDirection || 'desc'
    );

    return {
      success: true,
      ...result,
    };
  } catch (error) {
    console.error('Error fetching prospects:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      prospects: [],
      total: 0,
      pages: 0,
    };
  }
}

export async function getProspectCountAction(filters: ProspectFilters) {
  await requireOutreachAccess();

  try {
    const count = await getProspectCount(filters);
    return { success: true, count };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      count: 0,
    };
  }
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export async function bulkDeleteProspectsAction(prospectIds: string[]) {
  await requireOutreachAccess();

  try {
    const result = await bulkDeleteProspects(prospectIds);
    revalidatePath('/admin/marketing/prospects');
    return result;
  } catch (error) {
    return {
      success: false,
      processed: 0,
      failed: prospectIds.length,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      message: 'Failed to delete prospects',
    };
  }
}

export async function bulkArchiveProspectsAction(prospectIds: string[]) {
  await requireOutreachAccess();

  try {
    const result = await bulkArchiveProspects(prospectIds);
    revalidatePath('/admin/marketing/prospects');
    return result;
  } catch (error) {
    return {
      success: false,
      processed: 0,
      failed: prospectIds.length,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      message: 'Failed to archive prospects',
    };
  }
}

export async function bulkUpdateStatusAction(prospectIds: string[], status: ProspectStatus) {
  await requireOutreachAccess();

  try {
    const result = await bulkUpdateStatus(prospectIds, status);
    revalidatePath('/admin/marketing/prospects');
    return result;
  } catch (error) {
    return {
      success: false,
      processed: 0,
      failed: prospectIds.length,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      message: 'Failed to update status',
    };
  }
}

export async function bulkAddTagsAction(prospectIds: string[], tags: string[]) {
  await requireOutreachAccess();

  try {
    const result = await bulkAddTags(prospectIds, tags);
    revalidatePath('/admin/marketing/prospects');
    return result;
  } catch (error) {
    return {
      success: false,
      processed: 0,
      failed: prospectIds.length,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      message: 'Failed to add tags',
    };
  }
}

export async function bulkRemoveTagsAction(prospectIds: string[], tags: string[]) {
  await requireOutreachAccess();

  try {
    const result = await bulkRemoveTags(prospectIds, tags);
    revalidatePath('/admin/marketing/prospects');
    return result;
  } catch (error) {
    return {
      success: false,
      processed: 0,
      failed: prospectIds.length,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      message: 'Failed to remove tags',
    };
  }
}

export async function bulkSetFollowUpAction(prospectIds: string[], followUpDate: Date) {
  await requireOutreachAccess();

  try {
    const result = await bulkSetFollowUpDate(prospectIds, followUpDate);
    revalidatePath('/admin/marketing/prospects');
    return result;
  } catch (error) {
    return {
      success: false,
      processed: 0,
      failed: prospectIds.length,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      message: 'Failed to set follow-up dates',
    };
  }
}

export async function bulkRecalculateScoresAction(prospectIds: string[]) {
  await requireOutreachAccess();

  try {
    const { calculateLeadScoreDetailed } = await import('@/lib/leads/scoring');

    // Fetch all prospects
    const prospects = await prisma.prospect.findMany({
      where: { id: { in: prospectIds } },
    });

    let updated = 0;
    let failed = 0;
    const errors: string[] = [];

    // Recalculate and update each prospect
    for (const prospect of prospects) {
      try {
        const scoreData = calculateLeadScoreDetailed({
          hasWebsite: prospect.hasWebsite,
          websiteQuality: prospect.websiteQuality,
          annualRevenue: prospect.annualRevenue,
          category: prospect.category,
          city: prospect.city,
          state: prospect.state,
          employeeCount: prospect.employeeCount,
          email: prospect.email,
          phone: prospect.phone,
          emailsSent: 0,
          convertedAt: prospect.convertedAt,
          googleRating: prospect.googleRating,
          googleReviews: prospect.googleReviews,
        });

        await prisma.prospect.update({
          where: { id: prospect.id },
          data: {
            leadScore: scoreData.total,
            websiteQualityScore: scoreData.breakdown.websiteScore,
            revenuePotential: scoreData.breakdown.revenueScore,
            categoryFit: scoreData.breakdown.categoryScore,
            locationScore: scoreData.breakdown.locationScore,
            organizationSize: scoreData.breakdown.sizeScore,
            googleScore: scoreData.breakdown.googleScore,
          },
        });

        updated++;
      } catch (error) {
        failed++;
        errors.push(`Failed to update ${prospect.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    revalidatePath('/admin/marketing/prospects');

    return {
      success: true,
      processed: updated,
      failed,
      errors,
      message: `Recalculated scores for ${updated} prospect(s)${failed > 0 ? `, ${failed} failed` : ''}`,
    };
  } catch (error) {
    return {
      success: false,
      processed: 0,
      failed: prospectIds.length,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      message: 'Failed to recalculate scores',
    };
  }
}

export async function exportProspectsAction(prospectIds: string[]) {
  await requireOutreachAccess();

  try {
    const csv = await exportProspectsToCSV(prospectIds);
    return {
      success: true,
      csv,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// EMAIL CAMPAIGNS
// ============================================================================

export async function sendBulkEmailsAction(params: BulkEmailParams) {
  await requireOutreachAccess();

  try {
    const result = await sendBulkEmails(params);
    revalidatePath('/admin/marketing/prospects');
    revalidatePath('/admin/marketing/campaigns');
    return result;
  } catch (error) {
    return {
      success: false,
      sent: 0,
      failed: 0,
      errors: [{ prospectId: 'all', error: error instanceof Error ? error.message : 'Unknown error' }],
      sentEmailIds: [],
    };
  }
}

export async function generateAIEmailAction(prospectId: string) {
  await requireOutreachAccess();

  try {
    const prospect = await prisma.prospect.findUnique({
      where: { id: prospectId },
    });

    if (!prospect) {
      return {
        success: false,
        error: 'Prospect not found',
      };
    }

    const email = await generatePersonalizedEmail({
      prospect,
      includeWebsiteAudit: !!prospect.websiteUrl,
      includePortfolio: true,
      includePricing: true,
    });

    return {
      success: true,
      ...email,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// ANALYTICS
// ============================================================================

export async function getMarketingAnalyticsAction() {
  await requireOutreachAccess();

  try {
    // Get prospect counts by status
    const prospectsByStatus = await prisma.prospect.groupBy({
      by: ['status'],
      _count: true,
      where: { archived: false },
    });

    // Get email stats
    const emailStats = await prisma.sentEmail.groupBy({
      by: ['status'],
      _count: true,
    });

    // Get top performing campaigns
    const topCampaigns = await prisma.emailCampaign.findMany({
      take: 10,
      orderBy: { opened: 'desc' },
      include: {
        template: {
          select: { name: true, category: true },
        },
      },
    });

    // Calculate conversion metrics
    const totalProspects = await prisma.prospect.count({ where: { archived: false } });
    const convertedProspects = await prisma.prospect.count({
      where: { status: 'CONVERTED', archived: false },
    });

    const totalEmailsSent = await prisma.sentEmail.count({ where: { status: { in: ['SENT', 'OPENED', 'CLICKED', 'REPLIED'] } } });
    const emailsOpened = await prisma.sentEmail.count({ where: { status: { in: ['OPENED', 'CLICKED', 'REPLIED'] } } });
    const emailsClicked = await prisma.sentEmail.count({ where: { status: { in: ['CLICKED', 'REPLIED'] } } });
    const emailsReplied = await prisma.sentEmail.count({ where: { status: 'REPLIED' } });

    return {
      success: true,
      prospectsByStatus,
      emailStats,
      topCampaigns,
      metrics: {
        totalProspects,
        convertedProspects,
        conversionRate: totalProspects > 0 ? (convertedProspects / totalProspects) * 100 : 0,
        totalEmailsSent,
        emailsOpened,
        emailsClicked,
        emailsReplied,
        openRate: totalEmailsSent > 0 ? (emailsOpened / totalEmailsSent) * 100 : 0,
        clickRate: emailsOpened > 0 ? (emailsClicked / emailsOpened) * 100 : 0,
        replyRate: totalEmailsSent > 0 ? (emailsReplied / totalEmailsSent) * 100 : 0,
      },
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// INDIVIDUAL PROSPECT OPERATIONS
// ============================================================================

export async function updateProspectAction(prospectId: string, data: Partial<{
  name: string;
  email: string;
  phone: string;
  company: string;
  status: ProspectStatus;
  tags: string[];
  internalNotes: string;
  followUpDate: Date;
}>) {
  await requireOutreachAccess();

  try {
    const prospect = await prisma.prospect.update({
      where: { id: prospectId },
      data,
    });

    revalidatePath('/admin/marketing/prospects');

    return {
      success: true,
      prospect,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function deleteProspectAction(prospectId: string) {
  await requireOutreachAccess();

  try {
    await prisma.prospect.delete({
      where: { id: prospectId },
    });

    revalidatePath('/admin/marketing/prospects');

    return {
      success: true,
      message: 'Prospect deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
