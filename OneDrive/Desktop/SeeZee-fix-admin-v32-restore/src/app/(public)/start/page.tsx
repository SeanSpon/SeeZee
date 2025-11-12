'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PackageSelector } from '@/components/qwiz/PackageSelector';
import PageShell from '@/components/PageShell';
import FloatingShapes from '@/components/shared/FloatingShapes';
import { FiZap, FiDollarSign, FiClock, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import { fetchJson } from '@/lib/client-api';

function StartPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [checkingRequests, setCheckingRequests] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login?returnUrl=/start');
      return;
    }

    // Check for active project requests if authenticated
    if (status === 'authenticated' && session?.user) {
      fetchJson<any>('/api/client/requests')
        .then((data) => {
          const requests = data?.requests || [];
          const active = requests.filter((req: any) => {
            const status = String(req.status || '').toUpperCase();
            return ['DRAFT', 'SUBMITTED', 'REVIEWING', 'NEEDS_INFO'].includes(status);
          });
          setActiveRequests(active);
        })
        .catch((err) => {
          console.error('Failed to check active requests:', err);
        })
        .finally(() => {
          setCheckingRequests(false);
        });
    } else {
      setCheckingRequests(false);
    }
  }, [status, session, router]);

  // Show loading state while checking authentication and active requests
  if (status === 'loading' || checkingRequests) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-trinity-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  // Don't render package selector until authenticated
  if (!session?.user) {
    return null;
  }

  // If user has active project request, show message instead (unless editing)
  if (activeRequests.length > 0 && !editId) {
    return (
      <PageShell>
        <div className="relative overflow-hidden animated-gradient">
          <FloatingShapes />
          <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>
          
          <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-container rounded-2xl overflow-hidden shadow-large p-8 md:p-12 text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <FiAlertCircle className="w-8 h-8 text-amber-400" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
                You have an active project request
              </h1>
              <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
                You currently have a project request in progress. Please wait for it to be reviewed before submitting a new one.
              </p>
              
              <div className="space-y-4 mb-8">
                {activeRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30 text-left"
                  >
                    <h3 className="font-semibold text-white mb-2">{req.title || 'Untitled Request'}</h3>
                    <p className="text-sm text-amber-300/80">
                      Status: {req.status.replace(/_/g, ' ')}
                    </p>
                    {req.description && (
                      <p className="text-sm text-gray-400 mt-2 line-clamp-2">{req.description}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/client/requests"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
                >
                  View My Requests
                  <FiArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/client"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Back to Dashboard
                </Link>
              </div>
            </motion.div>
          </section>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Background Effects */}
      <div className="relative overflow-hidden animated-gradient">
        <FloatingShapes />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>
        
        {/* Hero Section */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
              <span className="gradient-text">Start Your Website</span>{' '}
              <span className="text-white">Today</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-6">
              Choose your perfect package and get your professional website built in 48 hours
            </p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-6 md:gap-12"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-trinity-red rounded-lg flex items-center justify-center">
                  <FiClock className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-white">48h</div>
                  <div className="text-sm text-gray-400">Build Time</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-trinity-red rounded-lg flex items-center justify-center">
                  <FiDollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-white">$1.2K-$2.8K</div>
                  <div className="text-sm text-gray-400">Typical Range</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-trinity-red rounded-lg flex items-center justify-center">
                  <FiZap className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-sm text-gray-400">Support</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-12"
          >
            <div className="glass-effect px-6 py-3 rounded-full">
              <span className="text-sm text-gray-300">✓ No Hidden Fees</span>
            </div>
            <div className="glass-effect px-6 py-3 rounded-full">
              <span className="text-sm text-gray-300">✓ Full Dashboard Access</span>
            </div>
            <div className="glass-effect px-6 py-3 rounded-full">
              <span className="text-sm text-gray-300">✓ Lifetime Maintenance</span>
            </div>
          </motion.div>
        </section>

        {/* Main Package Selection */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-container rounded-2xl overflow-hidden shadow-large"
          >
            <div className="p-6 md:p-10">
              <PackageSelector editId={editId || undefined} />
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 text-center"
          >
            <div className="glass-effect rounded-2xl p-8 max-w-3xl mx-auto">
              <h3 className="text-2xl font-heading font-bold text-white mb-4">
                Questions? We're Here to Help
              </h3>
              <p className="text-gray-300 mb-6">
                Not sure which package is right for you? Book a free 15-minute consultation and we'll help you choose the perfect fit for your business.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-trinity-red text-white rounded-lg hover:bg-trinity-maroon transition-all duration-200 font-semibold text-lg shadow-medium transform hover:-translate-y-1 glow-on-hover focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Book Free Consultation
              </a>
            </div>
          </motion.div>
        </section>
      </div>
    </PageShell>
  );
}

export default function StartPage() {
  return (
    <Suspense fallback={
      <PageShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-trinity-red border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PageShell>
    }>
      <StartPageContent />
    </Suspense>
  );
}
