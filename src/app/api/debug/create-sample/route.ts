import { NextResponse } from 'next/server';
import { prisma } from '@/server/db/prisma';

export async function POST() {
  try {
    // Create a sample project in production
    const project = await prisma.project.create({
      data: {
        title: 'Sample E-commerce Website',
        client: 'Demo Client Inc',
        status: 'IN_PROGRESS',
        progress: 45,
        description: 'A modern e-commerce platform with payment integration',
        tags: JSON.stringify(['E-Commerce', 'React', 'Stripe']),
        createdById: 'sample-user-id', // We'll handle this better later
      }
    });

    // Create a sample lead
    const lead = await prisma.lead.create({
      data: {
        name: 'John Demo',
        email: 'john.demo@example.com',
        company: 'Demo Client Inc',
        message: 'We need a modern website for our business',
        status: 'NEW'
      }
    });

    return NextResponse.json({
      status: 'success',
      message: 'Sample data created',
      data: {
        project,
        lead,
      }
    });

  } catch (error) {
    console.error('Error creating sample data:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}