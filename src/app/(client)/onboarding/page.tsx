'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ClientOnboardingPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)

  useEffect(() => {
    if (sessionId) {
      // Fetch session details
      fetch('/api/stripe/session/' + sessionId)
        .then(res => res.json())
        .then(data => {
          setSessionData(data)
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch session:', err)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Success Animation */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Welcome to SeeZee Studio!</h1>
            <p className="text-xl text-white/80 mb-2">Your project has been successfully created</p>
            <p className="text-white/60">We'll be in touch within 24 hours to schedule your kick-off call</p>
          </div>

          {/* Next Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-3xl mb-3">📞</div>
              <h3 className="text-white font-semibold mb-2">Kick-off Call</h3>
              <p className="text-white/60 text-sm">We'll schedule a call to discuss your project requirements and timeline</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="text-white font-semibold mb-2">Design Phase</h3>
              <p className="text-white/60 text-sm">Our team will create initial designs and wireframes for your approval</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="text-white font-semibold mb-2">Development</h3>
              <p className="text-white/60 text-sm">We'll build your project according to the approved designs and specifications</p>
            </div>
          </div>

          {/* Client Portal Access */}
          <div className="bg-blue-500/10 rounded-xl p-8 border border-blue-500/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Your Client Portal</h2>
            <p className="text-white/80 mb-6">
              Access your project dashboard, view progress updates, and communicate with our team
            </p>
            <Link
              href="/client/dashboard"
              className="inline-flex items-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
            >
              Access Dashboard →
            </Link>
          </div>

          {/* Contact Information */}
          <div className="text-center">
            <h3 className="text-white font-semibold mb-3">Questions? We're here to help!</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-white/60">
              <a href="mailto:hello@seezee.studio" className="hover:text-white transition-colors">
                📧 hello@seezee.studio
              </a>
              <a href="tel:+1234567890" className="hover:text-white transition-colors">
                📱 (123) 456-7890
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}