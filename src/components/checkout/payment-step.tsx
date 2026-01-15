'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

interface PaymentStepProps {
  data: CheckoutData
  onPrev: () => void
}

export function PaymentStep({ data, onPrev }: PaymentStepProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('stripe')

  const handlePayment = async () => {
    setIsProcessing(true)

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkoutData: data,
          paymentMethod,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      
      // Clear saved checkout progress
      localStorage.removeItem('checkout-progress')
      
      // Redirect to Stripe checkout
      window.location.href = url
    } catch (error) {
      console.error('Payment error:', error)
      alert('Failed to process payment. Please try again.')
      setIsProcessing(false)
    }
  }

  const handleSkipPayment = async () => {
    setIsProcessing(true)

    try {
      // Create lead without payment
      const response = await fetch('/api/checkout/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkoutData: data,
          skipPayment: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save quote')
      }

      // Clear saved checkout progress
      localStorage.removeItem('checkout-progress')
      
      // Redirect to success page
      router.push('/checkout/success?type=quote')
    } catch (error) {
      console.error('Quote error:', error)
      alert('Failed to save quote. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">Secure Payment</h2>
        <p className="text-white/60">Choose how you'd like to proceed with your project.</p>
      </div>

      {/* Payment Options */}
      <div className="space-y-4 mb-8">
        {/* Pay 50% Deposit */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-6 h-6 mt-1">
              <input
                type="radio"
                id="stripe"
                name="payment"
                value="stripe"
                checked={paymentMethod === 'stripe'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-emerald-500 border-white/30 focus:ring-emerald-500"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="stripe" className="text-white font-semibold text-lg cursor-pointer">
                Pay 50% Deposit Now
              </label>
              <p className="text-emerald-400 font-semibold text-xl mt-1">
                ${data.quote ? Math.round(data.quote.total / 2).toLocaleString() : '0'} today
              </p>
              <p className="text-white/80 text-sm mt-2">
                Secure your project slot with a 50% deposit. Remaining balance due upon completion.
              </p>
              <div className="flex items-center space-x-2 mt-3">
                <span className="text-xs text-white/60">Powered by</span>
                <div className="text-blue-400 font-semibold">Stripe</div>
                <div className="text-white/40">•</div>
                <div className="text-white/60 text-xs">256-bit SSL encrypted</div>
              </div>
            </div>
          </div>
        </div>

        {/* Get Quote Only */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-6 h-6 mt-1">
              <input
                type="radio"
                id="quote"
                name="payment"
                value="quote"
                checked={paymentMethod === 'quote'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-blue-500 border-white/30 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="quote" className="text-white font-semibold text-lg cursor-pointer">
                Get Quote Only
              </label>
              <p className="text-blue-400 font-semibold text-xl mt-1">
                Free detailed quote
              </p>
              <p className="text-white/80 text-sm mt-2">
                Receive a detailed quote via email. No payment required. We'll follow up within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="mb-8 p-4 bg-white/5 rounded-lg border border-white/10">
        <h3 className="text-white font-semibold mb-2">🔒 Secure & Protected</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl mb-1">🛡️</div>
            <div className="text-white/80 text-xs">SSL Encrypted</div>
          </div>
          <div>
            <div className="text-2xl mb-1">💳</div>
            <div className="text-white/80 text-xs">Stripe Secure</div>
          </div>
          <div>
            <div className="text-2xl mb-1">✅</div>
            <div className="text-white/80 text-xs">Money Back Guarantee</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onPrev}
          disabled={isProcessing}
          className="px-8 py-3 rounded-lg font-semibold text-white/80 hover:text-white border border-white/20 hover:border-white/40 transition-all duration-200 disabled:opacity-50"
        >
          ← Back
        </button>
        
        {paymentMethod === 'stripe' ? (
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="px-8 py-3 rounded-lg font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Pay Deposit</span>
                <span>→</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleSkipPayment}
            disabled={isProcessing}
            className="px-8 py-3 rounded-lg font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Get Quote</span>
                <span>→</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}