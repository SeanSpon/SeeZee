'use client'

import { useState } from 'react'

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

interface ReviewStepProps {
  data: CheckoutData
  onUpdate: (data: Partial<CheckoutData>) => void
  onNext: () => void
  onPrev: () => void
}

export function ReviewStep({ data, onUpdate, onNext, onPrev }: ReviewStepProps) {
  const [tosAccepted, setTosAccepted] = useState(data.tosAccepted)

  const handleNext = () => {
    onUpdate({ tosAccepted })
    onNext()
  }

  const canProceed = tosAccepted

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">Review Your Project</h2>
        <p className="text-white/60">Please review the details before proceeding to payment.</p>
      </div>

      {/* Project Summary */}
      <div className="space-y-6 mb-8">
        {/* Service */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-3">Service Details</h3>
          <div className="space-y-2">
            <p className="text-white/80">
              <span className="text-white/60">Type:</span> {data.service.type} development
            </p>
            <p className="text-white/80">
              <span className="text-white/60">Features:</span> {data.service.features.length} selected
            </p>
            {data.service.customRequirements && (
              <p className="text-white/80">
                <span className="text-white/60">Requirements:</span> {data.service.customRequirements}
              </p>
            )}
          </div>
        </div>

        {/* Timeline & Budget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-white font-semibold mb-3">Timeline</h3>
            <p className="text-white/80 capitalize">{data.timeline} delivery</p>
          </div>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-white font-semibold mb-3">Budget Range</h3>
            <p className="text-white/80">{data.budget.replace('-', ' - $')}</p>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-3">Contact Information</h3>
          <div className="space-y-1">
            <p className="text-white/80">{data.contact.name}</p>
            <p className="text-white/80">{data.contact.email}</p>
            {data.contact.company && <p className="text-white/80">{data.contact.company}</p>}
            {data.contact.phone && <p className="text-white/80">{data.contact.phone}</p>}
          </div>
        </div>

        {/* Quote */}
        {data.quote && (
          <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/20">
            <h3 className="text-white font-semibold mb-3">Project Quote</h3>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Total Investment</span>
              <span className="text-blue-400 font-bold text-2xl">${data.quote.total.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Terms of Service */}
      <div className="mb-8">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-4">Terms & Conditions</h3>
          <div className="space-y-3 text-white/80 text-sm max-h-48 overflow-y-auto">
            <p>By proceeding with this project, you agree to the following terms:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>50% deposit required to begin work</li>
              <li>Remaining balance due upon project completion</li>
              <li>2 rounds of revisions included in quoted price</li>
              <li>Additional revisions billed at $150/hour</li>
              <li>Timeline estimates are subject to scope changes</li>
              <li>Client responsible for providing content and assets</li>
              <li>Hosting and domain setup assistance included</li>
              <li>30-day warranty on technical issues</li>
            </ul>
          </div>
          
          <label className="flex items-center mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={tosAccepted}
              onChange={(e) => setTosAccepted(e.target.checked)}
              className="w-4 h-4 text-blue-500 border-white/30 rounded focus:ring-blue-500 focus:ring-2 bg-white/10"
            />
            <span className="ml-3 text-white/80">
              I agree to the terms and conditions and am ready to proceed with this project
            </span>
          </label>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-8 py-3 rounded-lg font-semibold text-white/80 hover:text-white border border-white/20 hover:border-white/40 transition-all duration-200"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className={`
            px-8 py-3 rounded-lg font-semibold transition-all duration-200
            ${canProceed
              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
              : 'bg-white/10 text-white/40 cursor-not-allowed'
            }
          `}
        >
          Proceed to Payment →
        </button>
      </div>
    </div>
  )
}