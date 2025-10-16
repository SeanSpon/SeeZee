'use client'

import { useEffect, useState } from 'react'

interface CheckoutData {
  service: {
    type: string
    features: string[]
    customRequirements?: string
  }
  timeline: string
  budget: string
  contact: {
    name: string
    email: string
    company?: string
    phone?: string
  }
  quote?: {
    subtotal: number
    tax: number
    total: number
    breakdown: any
  }
  tosAccepted: boolean
}

interface QuoteCalculatorProps {
  data: CheckoutData
  onQuoteUpdate: (quote: any) => void
}

const FEATURE_PRICES: Record<string, number> = {
  responsive: 0,
  cms: 500,
  contact_form: 0,
  seo: 300,
  analytics: 200,
  blog: 400,
  gallery: 300,
  social_media: 100,
  product_catalog: 0,
  shopping_cart: 0,
  payment_processing: 800,
  inventory_management: 600,
  order_management: 400,
  customer_accounts: 300,
  reviews: 250,
  user_authentication: 800,
  database_integration: 1200,
  api_development: 1500,
  admin_dashboard: 1000,
  real_time_features: 1200,
  third_party_integrations: 800,
  automated_testing: 600,
  deployment: 400,
  a_b_testing: 300,
  lead_capture: 250,
  social_proof: 150
}

const BASE_PRICES: Record<string, number> = {
  website: 2500,
  ecommerce: 5000,
  webapp: 8000,
  landing: 1200
}

const TIMELINE_MULTIPLIERS: Record<string, number> = {
  rush: 1.5,
  standard: 1.0,
  extended: 0.9,
  flexible: 0.85
}

const FEATURE_LABELS: Record<string, string> = {
  responsive: 'Mobile Responsive',
  cms: 'Content Management',
  contact_form: 'Contact Form',
  seo: 'SEO Optimization',
  analytics: 'Analytics Integration',
  blog: 'Blog System',
  gallery: 'Image Gallery',
  social_media: 'Social Media Integration',
  product_catalog: 'Product Catalog',
  shopping_cart: 'Shopping Cart',
  payment_processing: 'Payment Processing',
  inventory_management: 'Inventory Management',
  order_management: 'Order Management',
  customer_accounts: 'Customer Accounts',
  reviews: 'Customer Reviews',
  user_authentication: 'User Authentication',
  database_integration: 'Database Integration',
  api_development: 'API Development',
  admin_dashboard: 'Admin Dashboard',
  real_time_features: 'Real-time Features',
  third_party_integrations: 'Third-party Integrations',
  automated_testing: 'Automated Testing',
  deployment: 'Deployment & Hosting',
  a_b_testing: 'A/B Testing',
  lead_capture: 'Lead Capture',
  social_proof: 'Social Proof Elements'
}

export function QuoteCalculator({ data, onQuoteUpdate }: QuoteCalculatorProps) {
  const [quote, setQuote] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    calculateQuote()
  }, [data.service, data.timeline])

  const calculateQuote = async () => {
    if (!data.service.type) return

    setIsCalculating(true)

    try {
      // Simulate API call for live pricing
      await new Promise(resolve => setTimeout(resolve, 500))

      const basePrice = BASE_PRICES[data.service.type] || 0
      const featurePrice = data.service.features.reduce((total, feature) => {
        return total + (FEATURE_PRICES[feature] || 0)
      }, 0)

      const timelineMultiplier = TIMELINE_MULTIPLIERS[data.timeline] || 1.0
      const subtotal = (basePrice + featurePrice) * timelineMultiplier
      const tax = subtotal * 0.09 // 9% tax
      const total = subtotal + tax

      const newQuote = {
        basePrice,
        featurePrice,
        timelineMultiplier,
        subtotal,
        tax,
        total,
        breakdown: {
          service: data.service.type,
          features: data.service.features,
          timeline: data.timeline
        }
      }

      setQuote(newQuote)
      onQuoteUpdate(newQuote)
    } catch (error) {
      console.error('Failed to calculate quote:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  if (!data.service.type) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-semibold text-lg mb-4">Your Quote</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">💡</div>
          <p className="text-white/60 text-sm">
            Select your service type to see live pricing
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 sticky top-8">
      <h3 className="text-white font-semibold text-lg mb-4">Your Quote</h3>

      {isCalculating ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-white/60 text-sm">Calculating quote...</p>
        </div>
      ) : quote ? (
        <div className="space-y-4">
          {/* Service Type */}
          <div className="pb-3 border-b border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-white/80 capitalize">{quote.breakdown.service} Development</span>
              <span className="text-white font-medium">${quote.basePrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Features */}
          {quote.featurePrice > 0 && (
            <div className="pb-3 border-b border-white/10">
              <div className="text-white/60 text-sm mb-2">Selected Features:</div>
              {data.service.features.map(feature => {
                const price = FEATURE_PRICES[feature] || 0
                if (price === 0) return null
                return (
                  <div key={feature} className="flex justify-between items-center text-sm">
                    <span className="text-white/70">{FEATURE_LABELS[feature]}</span>
                    <span className="text-white/70">${price.toLocaleString()}</span>
                  </div>
                )
              })}
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                <span className="text-white/80">Features Subtotal</span>
                <span className="text-white font-medium">${quote.featurePrice.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Timeline Adjustment */}
          {quote.timelineMultiplier !== 1.0 && (
            <div className="pb-3 border-b border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-white/80 capitalize">{data.timeline} Timeline</span>
                <span className={`font-medium ${
                  quote.timelineMultiplier > 1.0 ? 'text-orange-400' : 'text-emerald-400'
                }`}>
                  {quote.timelineMultiplier > 1.0 ? '+' : ''}
                  {Math.round((quote.timelineMultiplier - 1) * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* Subtotal */}
          <div className="pb-3 border-b border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-white/80">Subtotal</span>
              <span className="text-white font-medium">${quote.subtotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Tax */}
          <div className="pb-3 border-b border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-white/80">Tax (9%)</span>
              <span className="text-white font-medium">${quote.tax.toLocaleString()}</span>
            </div>
          </div>

          {/* Total */}
          <div className="pt-3">
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold text-lg">Total</span>
              <span className="text-blue-400 font-bold text-2xl">${quote.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Note */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-400 text-sm">
              💡 This is an estimated quote. Final pricing may vary based on project complexity and requirements.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}