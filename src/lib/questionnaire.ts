/**
 * Server actions for questionnaire CRUD operations
 */
'use server';

import { prisma } from '@/lib/prisma';
import { StepSlug } from './steps';
import { computePrice } from './pricing';
import { cookies } from 'next/headers';

type PartialData = Record<string, any>;

/**
 * Create or update questionnaire draft
 */
export async function upsertDraft(email: string, data: PartialData) {
  const existing = await prisma.questionnaire.findFirst({
    where: { userEmail: email },
    orderBy: { createdAt: 'desc' }
  });

  if (existing) {
    return prisma.questionnaire.update({
      where: { id: existing.id },
      data: {
        data: { ...(existing.data as object), ...data },
        updatedAt: new Date()
      }
    });
  }

  return prisma.questionnaire.create({
    data: {
      userEmail: email,
      data
    }
  });
}

/**
 * Get questionnaire by ID
 */
export async function getDraftById(id: string) {
  return prisma.questionnaire.findUnique({
    where: { id }
  });
}

/**
 * Get questionnaire ID from cookie (read-only, safe for page components)
 */
export async function getQuestionnaireId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('qId')?.value || null;
}

/**
 * Create new questionnaire and set cookie (only use in server actions)
 */
export async function createQuestionnaireWithCookie(email?: string): Promise<string> {
  const draft = await prisma.questionnaire.create({
    data: {
      userEmail: email || 'draft@seezee.com',
      data: {}
    }
  });

  const cookieStore = await cookies();
  cookieStore.set('qId', draft.id, {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    sameSite: 'lax'
  });

  return draft.id;
}

/**
 * Get or create questionnaire ID from cookie
 * DEPRECATED: Only use in server actions, not page components
 */
export async function getOrCreateQuestionnaireId(email?: string): Promise<string> {
  const cookieStore = await cookies();
  const qId = cookieStore.get('qId')?.value;

  if (qId) {
    const existing = await prisma.questionnaire.findUnique({ where: { id: qId } });
    if (existing) return qId;
  }

  // Create new draft
  const draft = await prisma.questionnaire.create({
    data: {
      userEmail: email || 'draft@seezee.com',
      data: {}
    }
  });

  // Set cookie
  cookieStore.set('qId', draft.id, {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    sameSite: 'lax'
  });

  return draft.id;
}

/**
 * Save a single step value
 */
export async function saveStep(qId: string, slug: StepSlug, value: any) {
  const q = await prisma.questionnaire.findUnique({ where: { id: qId } });
  if (!q) throw new Error('Questionnaire not found');

  const updatedData = { ...(q.data as object), [slug]: value };

  // Update email if this is the email step
  const updatePayload: any = {
    data: updatedData,
    updatedAt: new Date()
  };

  if (slug === 'email' && typeof value === 'string') {
    updatePayload.userEmail = value;
  }

  return prisma.questionnaire.update({
    where: { id: qId },
    data: updatePayload
  });
}

/**
 * Compute and save pricing for questionnaire
 */
export async function computeAndSavePricing(qId: string) {
  const q = await prisma.questionnaire.findUnique({ where: { id: qId } });
  if (!q) throw new Error('Questionnaire not found');

  const data = q.data as Record<string, any>;

  const pricing = computePrice({
    projectTypes: data.projectTypes || [],
    needsEcommerce: !!data.ecommerce,
    needsAuth: !!data.auth,
    integrations: data.integrations || [],
    contentStatus: data.contentStatus,
    deadline: data.deadline
  });

  return prisma.questionnaire.update({
    where: { id: qId },
    data: {
      estimate: pricing.estimate,
      deposit: pricing.deposit
    }
  });
}

/**
 * Get questionnaire with computed pricing
 */
export async function getQuestionnaireWithPricing(qId: string) {
  const q = await getDraftById(qId);
  if (!q) return null;

  // Compute pricing if not already saved
  if (!q.estimate || !q.deposit) {
    await computeAndSavePricing(qId);
    return getDraftById(qId);
  }

  return q;
}
