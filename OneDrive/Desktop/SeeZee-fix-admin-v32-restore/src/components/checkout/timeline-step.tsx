'use client'

import { useState } from 'react'

interface TimelineStepProps {
  data: string
  onUpdate: (data: string) => void
  onNext: () => void
  onPrev: () => void
}

const TIMELINE_OPTIONS = [
  {
    id: 'rush',
    name: 'Rush Delivery',
    description: '2-4 weeks',
    detail: 'Fast-tracked development with premium pricing',
    multiplier: 1.5,
    icon: '🚀'
  },
  {
    id: 'standard',
    name: 'Standard Timeline',
    description: '4-8 weeks',
    detail: 'Balanced timeline with thorough development process',
    multiplier: 1.0,
    icon: '⚡'
  },
  {
    id: 'extended',
    name: 'Extended Timeline',
    description: '8-12 weeks',
    detail: 'More time for complex features and revisions',
    multiplier: 0.9,
    icon: '🎯'
  },
  {
    id: 'flexible',
    name: 'Flexible Timeline',
    description: '12+ weeks',
    detail: 'No rush, focus on perfection and additional features',
    multiplier: 0.85,
    icon: '🌟'
  }
]

export function TimelineStep({ data, onUpdate, onNext, onPrev }: TimelineStepProps) {
  const [selectedTimeline, setSelectedTimeline] = useState(data)

  const handleNext = () => {
    onUpdate(selectedTimeline)
    onNext()
  }

  const canProceed = selectedTimeline !== ''

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">When do you need this completed?</h2>
        <p className="text-white/60">Choose a timeline that works best for your project. Pricing varies based on timeline.</p>
      </div>

      {/* Timeline Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {TIMELINE_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelectedTimeline(option.id)}
            className={`
              p-6 rounded-xl border-2 text-left transition-all duration-200 relative
              ${selectedTimeline === option.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
              }
            `}
          >
            <div className="flex items-start space-x-4">
              <div className="text-3xl">{option.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-semibold text-lg">{option.name}</h3>
                  {option.multiplier !== 1.0 && (
                    <span className={`
                      text-xs px-2 py-1 rounded-full font-medium
                      ${option.multiplier > 1.0
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                      }
                    `}>
                      {option.multiplier > 1.0 ? `+${Math.round((option.multiplier - 1) * 100)}%` : `-${Math.round((1 - option.multiplier) * 100)}%`}
                    </span>
                  )}
                </div>
                <p className="text-blue-400 font-medium mb-1">{option.description}</p>
                <p className="text-white/60 text-sm">{option.detail}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Timeline Details */}
      {selectedTimeline && (
        <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
          <h3 className="text-white font-semibold mb-3">What to expect:</h3>
          <div className="space-y-2 text-white/80">
            {selectedTimeline === 'rush' && (
              <>
                <p>• Priority development with dedicated team focus</p>
                <p>• Limited revisions to meet tight deadline</p>
                <p>• Premium pricing for expedited delivery</p>
                <p>• Basic testing and launch support</p>
              </>
            )}
            {selectedTimeline === 'standard' && (
              <>
                <p>• Comprehensive development process</p>
                <p>• Two rounds of revisions included</p>
                <p>• Thorough testing and optimization</p>
                <p>• Standard launch support and documentation</p>
              </>
            )}
            {selectedTimeline === 'extended' && (
              <>
                <p>• Multiple revision rounds included</p>
                <p>• Extra time for complex feature development</p>
                <p>• Comprehensive testing and optimization</p>
                <p>• Enhanced launch support and training</p>
              </>
            )}
            {selectedTimeline === 'flexible' && (
              <>
                <p>• Unlimited revisions within scope</p>
                <p>• Time for additional feature exploration</p>
                <p>• Extensive testing and performance optimization</p>
                <p>• Complete launch support, training, and documentation</p>
              </>
            )}
          </div>
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