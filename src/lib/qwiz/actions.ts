'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import type { PackageTier } from './packages';
import type { QuestionAnswers, ContactInfo } from './store';

export interface QuestionnaireData {
  // Old format (backward compatible)
  selectedService?: string;
  selectedFeatures?: Array<{ id: string; quantity?: number }> | string[];
  
  // New package-based format
  package?: PackageTier;
  
  // Shared fields
  totals?: {
    packageBase?: number;
    addons?: number;
    maintenance?: number;
    rush?: number;
    subtotal?: number;
    deposit?: number;
    total?: number;
    monthly?: number;
    recurring?: boolean;
    // Old format (backward compatible)
    base?: number;
    features?: number;
  };
  questionnaire?: QuestionAnswers;
  contact?: ContactInfo;
  status?: string;
}

/**
 * Initialize a new questionnaire and set cookie
 */
export async function initQuestionnaire(): Promise<{ id: string }> {
  const cookieStore = await cookies();
  
  // Check if qid already exists
  const existingQid = cookieStore.get('qid')?.value;
  if (existingQid) {
    const existing = await prisma.questionnaire.findUnique({
      where: { id: existingQid },
    });
    if (existing) return { id: existingQid };
  }

  // Create new questionnaire
  const questionnaire = await prisma.questionnaire.create({
    data: {
      userEmail: 'pending@seezee.com',
      data: {},
    },
  });

  // Set cookie
  cookieStore.set('qid', questionnaire.id, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return { id: questionnaire.id };
}

/**
 * Update questionnaire data (idempotent)
 */
export async function updateQuestionnaire(
  qid: string,
  data: Partial<QuestionnaireData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const existing = await prisma.questionnaire.findUnique({
      where: { id: qid },
    });

    if (!existing) {
      return { success: false, error: 'Questionnaire not found' };
    }

    // Merge data
    const currentData = (existing.data || {}) as any;
    const updatedData = {
      ...currentData,
      ...data,
    };

    // Update email if contact info provided
    const updatePayload: any = {
      data: updatedData,
      updatedAt: new Date(),
    };

    if (data.contact?.email) {
      updatePayload.userEmail = data.contact.email;
    }

    // Update totals if provided
    if (data.totals) {
      updatePayload.estimate = data.totals.total;
      updatePayload.deposit = data.totals.deposit;
    }

    await prisma.questionnaire.update({
      where: { id: qid },
      data: updatePayload,
    });

    return { success: true };
  } catch (error) {
    console.error('updateQuestionnaire error:', error);
    return { success: false, error: 'Failed to update questionnaire' };
  }
}

/**
 * Get questionnaire by ID
 */
export async function getQuestionnaire(qid: string) {
  return prisma.questionnaire.findUnique({
    where: { id: qid },
  });
}

/**
 * Get qid from cookie (read-only)
 */
export async function getQidFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('qid')?.value || null;
}
