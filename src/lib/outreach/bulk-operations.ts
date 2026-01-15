/**
 * Bulk Operations for Prospect Management
 * 
 * Handles mass operations on prospects including:
 * - Bulk delete (with safety checks)
 * - Bulk status updates
 * - Bulk tagging
 * - Bulk email sending
 * - Bulk assignment
 * - Bulk export
 */

import { prisma } from '@/lib/prisma';
import { Prospect, ProspectStatus } from '@prisma/client';

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
  message: string;
}

export interface ProspectFilters {
  search?: string;
  status?: ProspectStatus[];
  leadScoreMin?: number;
  leadScoreMax?: number;
  hasWebsite?: boolean;
  websiteQuality?: string[];
  city?: string[];
  state?: string[];
  category?: string[];
  tags?: string[];
  source?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
  emailSent?: boolean;
  responded?: boolean;
  archived?: boolean;
}

/**
 * Build Prisma where clause from filters
 */
export function buildProspectWhereClause(filters: ProspectFilters) {
  const where: any = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { company: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { city: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.status && filters.status.length > 0) {
    where.status = { in: filters.status };
  }

  if (filters.leadScoreMin !== undefined || filters.leadScoreMax !== undefined) {
    where.leadScore = {};
    if (filters.leadScoreMin !== undefined) where.leadScore.gte = filters.leadScoreMin;
    if (filters.leadScoreMax !== undefined) where.leadScore.lte = filters.leadScoreMax;
  }

  if (filters.hasWebsite !== undefined) {
    where.hasWebsite = filters.hasWebsite;
  }

  if (filters.websiteQuality && filters.websiteQuality.length > 0) {
    where.websiteQuality = { in: filters.websiteQuality };
  }

  if (filters.city && filters.city.length > 0) {
    where.city = { in: filters.city };
  }

  if (filters.state && filters.state.length > 0) {
    where.state = { in: filters.state };
  }

  if (filters.category && filters.category.length > 0) {
    where.category = { in: filters.category };
  }

  if (filters.tags && filters.tags.length > 0) {
    where.tags = { hasSome: filters.tags };
  }

  if (filters.source && filters.source.length > 0) {
    where.source = { in: filters.source };
  }

  if (filters.createdAfter || filters.createdBefore) {
    where.createdAt = {};
    if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
    if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
  }

  if (filters.emailSent !== undefined) {
    if (filters.emailSent) {
      where.emailSentAt = { not: null };
    } else {
      where.emailSentAt = null;
    }
  }

  if (filters.responded !== undefined) {
    if (filters.responded) {
      where.emailRepliedAt = { not: null };
    } else {
      where.emailRepliedAt = null;
    }
  }

  if (filters.archived !== undefined) {
    where.archived = filters.archived;
  }

  return where;
}

/**
 * Get count of prospects matching filters
 */
export async function getProspectCount(filters: ProspectFilters): Promise<number> {
  const where = buildProspectWhereClause(filters);
  return await prisma.prospect.count({ where });
}

/**
 * Get filtered prospects with pagination
 */
export async function getFilteredProspects(
  filters: ProspectFilters,
  page: number = 1,
  pageSize: number = 50,
  orderBy: string = 'leadScore',
  orderDirection: 'asc' | 'desc' = 'desc'
): Promise<{ prospects: Prospect[]; total: number; pages: number }> {
  const where = buildProspectWhereClause(filters);
  const skip = (page - 1) * pageSize;

  const [prospects, total] = await Promise.all([
    prisma.prospect.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [orderBy]: orderDirection },
    }),
    prisma.prospect.count({ where }),
  ]);

  return {
    prospects,
    total,
    pages: Math.ceil(total / pageSize),
  };
}

/**
 * Bulk delete prospects (with safety limit)
 */
export async function bulkDeleteProspects(
  prospectIds: string[],
  safetyLimit: number = 500
): Promise<BulkOperationResult> {
  if (prospectIds.length === 0) {
    return {
      success: false,
      processed: 0,
      failed: 0,
      errors: ['No prospect IDs provided'],
      message: 'No prospects selected for deletion',
    };
  }

  if (prospectIds.length > safetyLimit) {
    return {
      success: false,
      processed: 0,
      failed: 0,
      errors: [`Cannot delete more than ${safetyLimit} prospects at once`],
      message: `Bulk delete safety limit (${safetyLimit}) exceeded`,
    };
  }

  try {
    const result = await prisma.prospect.deleteMany({
      where: { id: { in: prospectIds } },
    });

    return {
      success: true,
      processed: result.count,
      failed: 0,
      errors: [],
      message: `Successfully deleted ${result.count} prospects`,
    };
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

/**
 * Bulk archive prospects (safer than delete)
 */
export async function bulkArchiveProspects(prospectIds: string[]): Promise<BulkOperationResult> {
  if (prospectIds.length === 0) {
    return {
      success: false,
      processed: 0,
      failed: 0,
      errors: ['No prospect IDs provided'],
      message: 'No prospects selected for archiving',
    };
  }

  try {
    const result = await prisma.prospect.updateMany({
      where: { id: { in: prospectIds } },
      data: { archived: true },
    });

    return {
      success: true,
      processed: result.count,
      failed: 0,
      errors: [],
      message: `Successfully archived ${result.count} prospects`,
    };
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

/**
 * Bulk update prospect status
 */
export async function bulkUpdateStatus(
  prospectIds: string[],
  status: ProspectStatus
): Promise<BulkOperationResult> {
  if (prospectIds.length === 0) {
    return {
      success: false,
      processed: 0,
      failed: 0,
      errors: ['No prospect IDs provided'],
      message: 'No prospects selected for status update',
    };
  }

  try {
    const result = await prisma.prospect.updateMany({
      where: { id: { in: prospectIds } },
      data: { status },
    });

    return {
      success: true,
      processed: result.count,
      failed: 0,
      errors: [],
      message: `Successfully updated ${result.count} prospects to ${status}`,
    };
  } catch (error) {
    return {
      success: false,
      processed: 0,
      failed: prospectIds.length,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      message: 'Failed to update prospect status',
    };
  }
}

/**
 * Bulk add tags to prospects
 */
export async function bulkAddTags(prospectIds: string[], tagsToAdd: string[]): Promise<BulkOperationResult> {
  if (prospectIds.length === 0) {
    return {
      success: false,
      processed: 0,
      failed: 0,
      errors: ['No prospect IDs provided'],
      message: 'No prospects selected for tagging',
    };
  }

  let processed = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const id of prospectIds) {
    try {
      const prospect = await prisma.prospect.findUnique({
        where: { id },
        select: { tags: true },
      });

      if (!prospect) {
        failed++;
        continue;
      }

      const existingTags = prospect.tags || [];
      const newTags = Array.from(new Set([...existingTags, ...tagsToAdd]));

      await prisma.prospect.update({
        where: { id },
        data: { tags: newTags },
      });

      processed++;
    } catch (error) {
      failed++;
      errors.push(`Failed to tag prospect ${id}: ${error}`);
    }
  }

  return {
    success: processed > 0,
    processed,
    failed,
    errors,
    message: `Successfully tagged ${processed} prospects${failed > 0 ? `, ${failed} failed` : ''}`,
  };
}

/**
 * Bulk remove tags from prospects
 */
export async function bulkRemoveTags(prospectIds: string[], tagsToRemove: string[]): Promise<BulkOperationResult> {
  if (prospectIds.length === 0) {
    return {
      success: false,
      processed: 0,
      failed: 0,
      errors: ['No prospect IDs provided'],
      message: 'No prospects selected',
    };
  }

  let processed = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const id of prospectIds) {
    try {
      const prospect = await prisma.prospect.findUnique({
        where: { id },
        select: { tags: true },
      });

      if (!prospect) {
        failed++;
        continue;
      }

      const existingTags = prospect.tags || [];
      const newTags = existingTags.filter(tag => !tagsToRemove.includes(tag));

      await prisma.prospect.update({
        where: { id },
        data: { tags: newTags },
      });

      processed++;
    } catch (error) {
      failed++;
      errors.push(`Failed to remove tags from prospect ${id}: ${error}`);
    }
  }

  return {
    success: processed > 0,
    processed,
    failed,
    errors,
    message: `Successfully removed tags from ${processed} prospects${failed > 0 ? `, ${failed} failed` : ''}`,
  };
}

/**
 * Bulk export prospects to CSV
 */
export async function exportProspectsToCSV(prospectIds: string[]): Promise<string> {
  const prospects = await prisma.prospect.findMany({
    where: { id: { in: prospectIds } },
    orderBy: { leadScore: 'desc' },
  });

  // CSV header
  const headers = [
    'Name',
    'Company',
    'Email',
    'Phone',
    'Address',
    'City',
    'State',
    'ZIP',
    'Website',
    'Lead Score',
    'Status',
    'Category',
    'Source',
    'Google Rating',
    'Annual Revenue',
    'Employees',
    'Tags',
    'Created At',
  ];

  // CSV rows
  const rows = prospects.map(p => [
    p.name,
    p.company || '',
    p.email,
    p.phone || '',
    p.address || '',
    p.city || '',
    p.state || '',
    p.zipCode || '',
    p.websiteUrl || '',
    p.leadScore,
    p.status,
    p.category || '',
    p.source,
    p.googleRating || '',
    p.annualRevenue || '',
    p.employeeCount || '',
    (p.tags || []).join('; '),
    p.createdAt.toISOString(),
  ]);

  // Build CSV string
  const csvLines = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(',')),
  ];

  return csvLines.join('\n');
}

/**
 * Escape CSV field
 */
function escapeCSV(field: any): string {
  const str = String(field ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Get unique filter values for dropdown population
 */
export async function getFilterOptions(): Promise<{
  cities: string[];
  states: string[];
  categories: string[];
  tags: string[];
  sources: string[];
}> {
  const prospects = await prisma.prospect.findMany({
    select: {
      city: true,
      state: true,
      category: true,
      tags: true,
      source: true,
    },
  });

  const cities = new Set<string>();
  const states = new Set<string>();
  const categories = new Set<string>();
  const tags = new Set<string>();
  const sources = new Set<string>();

  for (const p of prospects) {
    if (p.city) cities.add(p.city);
    if (p.state) states.add(p.state);
    if (p.category) categories.add(p.category);
    if (p.source) sources.add(p.source);
    if (p.tags) p.tags.forEach(t => tags.add(t));
  }

  return {
    cities: Array.from(cities).sort(),
    states: Array.from(states).sort(),
    categories: Array.from(categories).sort(),
    tags: Array.from(tags).sort(),
    sources: Array.from(sources).sort(),
  };
}

/**
 * Bulk update follow-up dates
 */
export async function bulkSetFollowUpDate(
  prospectIds: string[],
  followUpDate: Date
): Promise<BulkOperationResult> {
  if (prospectIds.length === 0) {
    return {
      success: false,
      processed: 0,
      failed: 0,
      errors: ['No prospect IDs provided'],
      message: 'No prospects selected',
    };
  }

  try {
    const result = await prisma.prospect.updateMany({
      where: { id: { in: prospectIds } },
      data: { followUpDate },
    });

    return {
      success: true,
      processed: result.count,
      failed: 0,
      errors: [],
      message: `Successfully set follow-up date for ${result.count} prospects`,
    };
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
