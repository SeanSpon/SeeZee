'use client'

import { useState } from 'react'

interface ServiceData {
  type: string
  features: string[]
  customRequirements?: string
}

interface ServiceStepProps {
  data: ServiceData
  onUpdate: (data: ServiceData) => void
  onNext: () => void
}

const SERVICE_TYPES = [
  {
    id: 'website',
    name: 'Business Website',
    description: 'Professional website for your business',
    icon: '🌐',
    features: [
      'responsive',
      'cms',
      'contact_form',
      'seo',
      'analytics',
      'blog',
      'gallery',
      'social_media'
    ]
  },
  {
    id: 'ecommerce',
    name: 'E-commerce Store',
    description: 'Online store with payment processing',
    icon: '🛒',
    features: [
      'responsive',
      'product_catalog',
      'shopping_cart',
      'payment_processing',
      'inventory_management',
      'order_management',
      'customer_accounts',
      'analytics',
      'seo',
      'reviews'
    ]
  },
  {
    id: 'webapp',
    name: 'Web Application',
    description: 'Custom web application',
    icon: '⚡',
    features: [
      'user_authentication',
      'database_integration',
      'api_development',
      'admin_dashboard',
      'real_time_features',
      'third_party_integrations',
      'automated_testing',
      'deployment'
    ]
  },
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'High-converting single page',
    icon: '📄',
    features: [
      'responsive',
      'contact_form',
      'analytics',
      'a_b_testing',
      'lead_capture',
      'social_proof'
    ]
  }
]

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

export function ServiceStep({ data, onUpdate, onNext }: ServiceStepProps) {
  const [selectedService, setSelectedService] = useState(data.type)
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(data.features)
  const [customRequirements, setCustomRequirements] = useState(data.customRequirements || '')

  const selectedServiceData = SERVICE_TYPES.find(s => s.id === selectedService)

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId)
    // Reset features when service changes
    const service = SERVICE_TYPES.find(s => s.id === serviceId)
    if (service) {
      setSelectedFeatures(service.features.filter(f => f === 'responsive' || f === 'contact_form'))
    }
  }

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    )
  }

  const handleNext = () => {
    onUpdate({
      type: selectedService,
      features: selectedFeatures,
      customRequirements: customRequirements.trim() || undefined
    })
    onNext()
  }

  const canProceed = selectedService && selectedFeatures.length > 0

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">What type of project do you need?</h2>
        <p className="text-white/60">Select the type of website or application you're looking to build.</p>
      </div>

      {/* Service Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {SERVICE_TYPES.map((service) => (
          <button
            key={service.id}
            onClick={() => handleServiceSelect(service.id)}
            className={`
              p-6 rounded-xl border-2 text-left transition-all duration-200
              ${selectedService === service.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
              }
            `}
          >
            <div className="flex items-start space-x-4">
              <div className="text-3xl">{service.icon}</div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-1">{service.name}</h3>
                <p className="text-white/60 text-sm">{service.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Feature Selection */}
      {selectedServiceData && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Select features you need:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedServiceData.features.map((feature) => (
              <button
                key={feature}
                onClick={() => handleFeatureToggle(feature)}
                className={`
                  p-3 rounded-lg border text-left transition-all duration-200
                  ${selectedFeatures.includes(feature)
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-white/10 bg-white/5 text-white/80 hover:border-white/20'
                  }
                `}
              >
                <div className="flex items-center space-x-2">
                  <div className={`
                    w-4 h-4 rounded border-2 flex items-center justify-center
                    ${selectedFeatures.includes(feature)
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-white/30'
                    }
                  `}>
                    {selectedFeatures.includes(feature) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    {FEATURE_LABELS[feature] || feature}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Requirements */}
      <div className="mb-8">
        <label className="block text-white font-medium mb-3">
          Any specific requirements or additional details?
        </label>
        <textarea
          value={customRequirements}
          onChange={(e) => setCustomRequirements(e.target.value)}
          placeholder="Tell us about any specific features, integrations, or requirements you have in mind..."
          className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-blue-500 focus:outline-none resize-none"
        />
      </div>

      {/* Continue Button */}
      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className={`
            px-8 py-3 rounded-lg font-semibold transition-all duration-200
            ${canProceed
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-white/10 text-white/40 cursor-not-allowed'
            }
          `}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}