import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock invoices data
    const invoices = [
      {
        id: 1,
        number: "INV-2024-001",
        title: "E-commerce Website - Phase 1",
        total: 2500,
        status: "PAID",
        dueDate: "2024-01-15",
        createdAt: "2024-01-01"
      },
      {
        id: 2,
        number: "INV-2024-002", 
        title: "Portfolio Website - Complete",
        total: 1800,
        status: "PAID",
        dueDate: "2024-02-15",
        createdAt: "2024-02-01"
      },
      {
        id: 3,
        number: "INV-2024-003",
        title: "E-commerce Website - Phase 2",
        total: 3200,
        status: "SENT",
        dueDate: "2024-03-15",
        createdAt: "2024-03-01"
      }
    ]

    return NextResponse.json({ invoices })
  } catch (error) {
    console.error('Invoices API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}