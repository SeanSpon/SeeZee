'use client'

import { useState } from 'react'

interface BudgetStepProps {
  data: string
  onUpdate: (data: string) => void
  onNext: () => void
  onPrev: () => void
}

const BUDGET_RANGES = [
  {
    id: '1000-2500',
    name: '$1,000 - $2,500',
    description: 'Basic website or landing page',
    icon: '💚',
    recommendation: 'Perfect for simple websites and landing pages'
  },
  {
    id: '2500-5000',
    name: '$2,500 - $5,000',
    description: 'Professional business website',
    icon: '💙',
    recommendation: 'Ideal for business websites with CMS and basic features'
  },
  {
    id: '5000-10000',
    name: '$5,000 - $10,000',
    description: 'Advanced website or small e-commerce',
    icon: '💜',
    recommendation: 'Great for e-commerce sites and advanced functionality'
  },
  {
    id: '10000-25000',
    name: '$10,000 - $25,000',
    description: 'Complex web application',
    icon: '🧡',
    recommendation: 'Perfect for custom web applications and large projects'
  },
  {
    id: '25000+',
    name: '$25,000+',
    description: 'Enterprise-level solution',
    icon: '❤️',
    recommendation: 'For complex enterprise applications and systems'
  }
]

export function BudgetStep({ data, onUpdate, onNext, onPrev }: BudgetStepProps) {
  const [selectedBudget, setSelectedBudget] = useState(data)

  const handleNext = () => {
    onUpdate(selectedBudget)
    onNext()
  }

  const canProceed = selectedBudget !== ''

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">What's your budget range?</h2>
        <p className="text-white/60">
          This helps us recommend the best approach for your project. Don't worry - we'll provide a detailed quote regardless of your selection.
        </p>
      </div>

      {/* Budget Options */}
      <div className="space-y-4 mb-8">
        {BUDGET_RANGES.map((budget) => (
          <button
            key={budget.id}
            onClick={() => setSelectedBudget(budget.id)}
            className={`
              w-full p-6 rounded-xl border-2 text-left transition-all duration-200
              ${selectedBudget === budget.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
              }
            `}
          >
            <div className="flex items-center space-x-4">
              <div className="text-3xl">{budget.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-semibold text-xl">{budget.name}</h3>
                  <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${selectedBudget === budget.id
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-white/30'
                    }
                  `}>
                    {selectedBudget === budget.id && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
                <p className="text-blue-400 font-medium mb-1">{budget.description}</p>
                <p className="text-white/60 text-sm">{budget.recommendation}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Budget Information */}
      <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
        <h3 className="text-white font-semibold mb-3">💡 Budget Tips:</h3>
        <div className="space-y-2 text-white/80 text-sm">
          <p>• Your selection helps us recommend the best features for your budget</p>
          <p>• We provide transparent, itemized quotes for all projects</p>
          <p>• Payment plans and milestone-based billing available</p>
          <p>• No hidden fees - what you see is what you pay</p>
        </div>
      </div>

      {/* Selected Budget Details */}
      {selectedBudget && (
        <div className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <h3 className="text-emerald-400 font-semibold mb-2">Selected Budget Range</h3>
          <p className="text-white/80 text-sm">
            Based on your selection, we'll tailor our recommendations to fit within your {' '}
            <span className="font-semibold text-emerald-400">
              {BUDGET_RANGES.find(b => b.id === selectedBudget)?.name}
            </span> budget range.
          </p>
        </div>
      )}

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