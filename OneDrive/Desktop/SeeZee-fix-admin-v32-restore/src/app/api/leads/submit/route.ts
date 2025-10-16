import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
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
    const { contact, totals, selectedService, selectedFeatures, questionnaire: answers } = data;

    if (!contact?.email) {
      return NextResponse.json({ error: 'Missing contact info' }, { status: 400 });
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

    // Create lead record
    const lead = await prisma.lead.create({
      data: {
        name: contact.name,
        email: contact.email,
        phone: contact.phone || '',
        company: contact.company || '',
        message: `Service: ${selectedService}\nFeatures: ${selectedFeatures?.length || 0} selected\nBudget: ${answers?.budget || 'Not specified'}\nTimeline: ${answers?.timeline || 'Not specified'}`,
        source: 'Questionnaire',
        status: 'NEW',
        metadata: {
          qid,
          service: selectedService,
          features: selectedFeatures,
          totals,
          questionnaire: answers,
          rushDelivery: contact.rushDelivery || false,
        },
      },
    });

    // TODO: Send email notifications
    // - Admin notification with quote details
    // - Client confirmation with summary

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
