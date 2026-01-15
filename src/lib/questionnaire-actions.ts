'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { StepSlug } from './steps';
import { computePrice } from './pricing';

/**
 * Get or create questionnaire ID - Server Action
 * This sets cookies, so it must be a server action
 */
export async function getOrCreateQuestionnaireId(email?: string): Promise<string> {
  const cookieStore = await cookies();
  const existingId = cookieStore.get('qId')?.value;

  // Check if existing ID is valid
  if (existingId) {
    const existing = await prisma.questionnaire.findUnique({
      where: { id: existingId },
    });
    if (existing) return existingId;
  }

  // Create new questionnaire
  const newQ = await prisma.questionnaire.create({
    data: {
      userEmail: email || 'draft@seezee.com',
      data: {},
    },
  });

  // Set cookie
  cookieStore.set('qId', newQ.id, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return newQ.id;
}

/**
 * Save a step and redirect to next
 */
export async function saveStepAndRedirect(
  stepSlug: StepSlug,
  value: any,
  nextSlug: string
) {
  const cookieStore = await cookies();
  let qId = cookieStore.get('qId')?.value;

  // Create questionnaire if doesn't exist
  if (!qId) {
    const email = stepSlug === 'email' ? String(value) : undefined;
    qId = await getOrCreateQuestionnaireId(email);
  }

  // Get existing questionnaire
  const q = await prisma.questionnaire.findUnique({ where: { id: qId } });
  if (!q) throw new Error('Questionnaire not found');

  const updatedData = { ...(q.data as object), [stepSlug]: value };

  // Update payload
  const updatePayload: any = {
    data: updatedData,
    updatedAt: new Date(),
  };

  // Update email if this is the email step
  if (stepSlug === 'email' && typeof value === 'string') {
    updatePayload.userEmail = value;
  }

  // Save to database
  await prisma.questionnaire.update({
    where: { id: qId },
    data: updatePayload,
  });

  // Auto-compute pricing if we have enough data
  if (updatedData['projectTypes'] && updatedData['deadline']) {
    try {
      const pricingResult = computePrice(updatedData as any);
      await prisma.questionnaire.update({
        where: { id: qId },
        data: {
          estimate: pricingResult.estimate,
          deposit: pricingResult.deposit,
        },
      });
    } catch (err) {
      console.error('Pricing calculation error:', err);
    }
  }

  return { success: true, nextSlug };
}
