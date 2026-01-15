interface Step {
  id: number
  title: string
  description: string
}

interface CheckoutProgressProps {
  steps: Step[]
  currentStep: number
  onStepClick: (step: number) => void
}

export function CheckoutProgress({ steps, currentStep, onStepClick }: CheckoutProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep
          const isCompleted = step.id < currentStep
          const isAccessible = step.id <= currentStep

          return (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <button
                onClick={() => isAccessible && onStepClick(step.id)}
                disabled={!isAccessible}
                className={`
                  relative flex items-center justify-center w-10 h-10 rounded-full
                  font-semibold text-sm transition-all duration-200
                  ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isActive
                      ? 'bg-blue-500 text-white ring-4 ring-blue-500/20'
                      : isAccessible
                      ? 'bg-white/10 text-white/60 hover:bg-white/20'
                      : 'bg-white/5 text-white/30 cursor-not-allowed'
                  }
                `}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.id
                )}
              </button>

              {/* Step Content */}
              <div className="ml-3 hidden md:block">
                <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/60'}`}>
                  {step.title}
                </div>
                <div className="text-xs text-white/40">
                  {step.description}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-0.5 mx-4
                  ${isCompleted ? 'bg-emerald-500' : 'bg-white/10'}
                `} />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile Step Info */}
      <div className="md:hidden mt-4 text-center">
        <div className="text-white font-medium">
          {steps.find(s => s.id === currentStep)?.title}
        </div>
        <div className="text-white/60 text-sm">
          {steps.find(s => s.id === currentStep)?.description}
        </div>
      </div>
    </div>
  )
}