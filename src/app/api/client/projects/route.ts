import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock projects data
    const projects = [
      {
        id: 1,
        name: "E-commerce Website",
        description: "Modern e-commerce platform with payment integration",
        status: "ACTIVE",
        milestones: [
          { id: 1, title: "Design mockups", completed: true },
          { id: 2, title: "Frontend development", completed: true },
          { id: 3, title: "Backend API", completed: false },
          { id: 4, title: "Payment integration", completed: false },
          { id: 5, title: "Testing & deployment", completed: false }
        ]
      },
      {
        id: 2,
        name: "Company Portfolio",
        description: "Professional portfolio website with CMS",
        status: "COMPLETED",
        milestones: [
          { id: 6, title: "Content strategy", completed: true },
          { id: 7, title: "Design & development", completed: true },
          { id: 8, title: "CMS setup", completed: true },
          { id: 9, title: "Launch", completed: true }
        ]
      }
    ]

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Projects API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}