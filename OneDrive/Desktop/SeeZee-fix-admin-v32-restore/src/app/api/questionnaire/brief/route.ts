import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      companyName,
      projectType,
      budgetRange,
      timelinePreference,
      keyFeatures,
      currentWebsite,
      notes,
    } = data;

    // Validate required fields
    if (!companyName || !projectType || !budgetRange || !timelinePreference || !keyFeatures) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create or update brief questionnaire
    const questionnaire = await prisma.briefQuestionnaire.upsert({
      where: { userId: session.user.id },
      update: {
        companyName,
        projectType,
        budgetRange,
        timelinePreference,
        keyFeatures,
        currentWebsite: currentWebsite || null,
        notes: notes || null,
      },
      create: {
        userId: session.user.id,
        companyName,
        projectType,
        budgetRange,
        timelinePreference,
        keyFeatures,
        currentWebsite: currentWebsite || null,
        notes: notes || null,
      },
    });

    // Update user's questionnaireCompleted timestamp
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        questionnaireCompleted: new Date(),
        briefQuestionnaireId: questionnaire.id,
      },
    });

    return NextResponse.json({ success: true, questionnaire });
  } catch (error) {
    console.error('Failed to save brief questionnaire:', error);
    return NextResponse.json(
      { error: 'Failed to save questionnaire' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const questionnaire = await prisma.briefQuestionnaire.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ questionnaire });
  } catch (error) {
    console.error('Failed to fetch brief questionnaire:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questionnaire' },
      { status: 500 }
    );
  }
}

