import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user's session
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized - please sign in' }, { status: 401 });
    }

    const { qid } = await req.json();

    if (!qid) {
      return NextResponse.json({ error: 'Missing qid' }, { status: 400 });
    }

    // Get questionnaire
    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id: qid },
    });

    if (!questionnaire) {
      return NextResponse.json({ error: 'Questionnaire not found' }, { status: 404 });
    }

    const data = questionnaire.data as any;
    const { totals, package: selectedPackage, selectedFeatures, questionnaire: answers } = data;

    // Get user details from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update status to SUBMITTED
    await prisma.questionnaire.update({
      where: { id: qid },
      data: {
        data: {
          ...data,
          status: 'SUBMITTED',
          submittedAt: new Date().toISOString(),
        },
      },
    });

    // Create lead record linked to the user
    const lead = await prisma.lead.create({
      data: {
        name: user.name || 'Unknown',
        email: user.email!,
        phone: '', // Can be added to user profile later
        company: '', // Can be added to user profile later
        message: `Package: ${selectedPackage}\nFeatures: ${selectedFeatures?.length || 0} selected\nTotal: $${totals?.total || 0}\nTimeline: ${answers?.timeline || 'Not specified'}`,
        source: 'Questionnaire',
        status: 'NEW',
        metadata: {
          qid,
          userId: user.id,
          package: selectedPackage,
          features: selectedFeatures,
          totals,
          questionnaire: answers,
        },
      },
    });

    return NextResponse.json({
      success: true,
      leadId: lead.id,
    });
  } catch (error) {
    console.error('Lead submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit lead' },
      { status: 500 }
    );
  }
}
