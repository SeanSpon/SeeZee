import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for your frontend's request format
const quoteRequestSchema = z.object({
  packageSlug: z.enum(['WEBSITE', 'PORTAL', 'AUTOMATION']),
  pages: z.number().min(1),
  features: z.array(z.string()),
  integrations: z.array(z.string()),
  rush: z.boolean(),
})

// Pricing configuration matching your packages
const PACKAGE_BASE_PRICES: Record<string, number> = {
  WEBSITE: 2500,
  PORTAL: 5000,
  AUTOMATION: 8000,
}

const FEATURE_PRICES: Record<string, number> = {
  blog: 400,
  cms: 500,
  auth: 800,
  payments: 800,
  dashboard: 1000,
}

const INTEGRATION_PRICES: Record<string, number> = {
  stripe: 300,
  mailchimp: 200,
  google_analytics: 150,
  zapier: 400,
  airtable: 300,
}

const PAGE_PRICE = 150 // Price per additional page (over base 5)
const RUSH_MULTIPLIER = 1.5
const TAX_RATE = 0.09 // 9% tax

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { packageSlug, pages, features, integrations, rush } = quoteRequestSchema.parse(body)

    // Get or create pricing rule for this package
    let pricingRule = await prisma.pricingRule.findFirst({
      where: {
        serviceType: packageSlug.toLowerCase(),
        active: true,
        AND: [
          {
            OR: [
              { validTo: null },
              { validTo: { gte: new Date() } }
            ]
          }
        ]
      }
    })

    if (!pricingRule) {
      // Create default pricing rule if it doesn't exist
      pricingRule = await prisma.pricingRule.create({
        data: {
          name: `${packageSlug} Package`,
          serviceType: packageSlug.toLowerCase(),
          basePrice: PACKAGE_BASE_PRICES[packageSlug],
          features: {
            ...FEATURE_PRICES,
            ...INTEGRATION_PRICES,
          },
          rushMultiplier: RUSH_MULTIPLIER,
          active: true,
        }
      })
    }

    // Calculate pricing
    const basePrice = PACKAGE_BASE_PRICES[packageSlug] || 0
    
    // Add cost for additional pages (assuming base package includes 5 pages)
    const basePagesIncluded = 5
    const additionalPages = Math.max(0, pages - basePagesIncluded)
    const pagesPrice = additionalPages * PAGE_PRICE
    
    // Calculate feature pricing
    const featurePrice = features.reduce((total, feature) => {
      return total + (FEATURE_PRICES[feature] || 0)
    }, 0)
    
    // Calculate integration pricing
    const integrationPrice = integrations.reduce((total, integration) => {
      return total + (INTEGRATION_PRICES[integration] || 0)
    }, 0)

    // Calculate subtotal
    const subtotal = basePrice + pagesPrice + featurePrice + integrationPrice
    
    // Apply rush multiplier if needed
    const rushAmount = rush ? subtotal * (RUSH_MULTIPLIER - 1) : 0
    const subtotalWithRush = subtotal + rushAmount
    
    // Calculate tax
    const tax = subtotalWithRush * TAX_RATE
    
    // Calculate total
    const total = subtotalWithRush + tax

    // Return the quote in the format your frontend expects
    return NextResponse.json({
      subtotal: Number(subtotal.toFixed(2)),
      rush: Number(rushAmount.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
      pricingRuleId: pricingRule.id,
      breakdown: {
        basePrice,
        pagesPrice,
        featurePrice,
        integrationPrice,
        packageSlug,
        pages,
        features,
        integrations,
        rushMultiplier: rush ? RUSH_MULTIPLIER : 1,
      }
    })

  } catch (error) {
    console.error('Quote calculation error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate quote' },
      { status: 500 }
    )
  }
}