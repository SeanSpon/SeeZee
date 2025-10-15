'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import PageShell from '@/components/PageShell';

export default function SuccessPage() {
  return (
    <PageShell>
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-block"
          >
            <CheckCircle2 className="w-24 h-24 text-green-400 mx-auto mb-6" />
          </motion.div>

          <h1 className="text-4xl font-bold text-white mb-4">
            Quote Request Received!
          </h1>

          <p className="text-xl text-white/80 mb-8">
            Thank you for choosing SeeZee! We've received your project details.
          </p>

          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-center gap-3 text-cyan-400 mb-3">
              <Mail className="w-5 h-5" />
              <span className="font-semibold">Check your email</span>
            </div>
            <p className="text-white/60 text-sm">
              We've sent a confirmation with your quote details. Our team will review
              your project and get back to you within 24 hours.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">What happens next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-cyan-400 font-bold mb-2">1. Review</div>
                <div className="text-sm text-white/60">
                  We'll review your requirements and prepare a detailed proposal
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-cyan-400 font-bold mb-2">2. Consultation</div>
                <div className="text-sm text-white/60">
                  Schedule a call to discuss your vision and timeline
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-cyan-400 font-bold mb-2">3. Get Started</div>
                <div className="text-sm text-white/60">
                  Approve the quote and we'll begin bringing your project to life
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-semibold transition-all"
            >
              Back to Home
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl text-white font-bold transition-all"
            >
              Explore Services
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </motion.div>
      </div>
    </PageShell>
  );
}
