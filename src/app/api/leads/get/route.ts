import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const qid = searchParams.get('qid');

    if (!qid) {
      return NextResponse.json({ error: 'Missing qid' }, { status: 400 });
    }

    // Get questionnaire data
    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id: qid },
    });

    if (!questionnaire) {
      return NextResponse.json({ error: 'Questionnaire not found' }, { status: 404 });
    }

    // Try to find associated lead
    const lead = await prisma.lead.findFirst({
      where: {
        metadata: {
          path: ['qid'],
          equals: qid,
        },
      },
    });

    return NextResponse.json({
      questionnaire,
      lead,
    });
  } catch (error) {
    console.error('Error fetching lead data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead data' },
      { status: 500 }
    );
  }
}
