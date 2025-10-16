'use client';

import { Suspense, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQwizStore } from '@/lib/qwiz/store';
import { initQuestionnaire, updateQuestionnaire } from '@/lib/qwiz/actions';
import { PackageSelector } from '@/components/qwiz/PackageSelector';
import { QuestionnaireForm } from '@/components/qwiz/QuestionnaireForm';
import { ContactForm } from '@/components/qwiz/ContactForm';
import { PriceCounter } from '@/components/qwiz/PriceCounter';
import { formatPrice } from '@/lib/qwiz/pricing';
import { getPackage, getFeature, MAINTENANCE } from '@/lib/qwiz/packages';
import { QUESTIONS } from '@/lib/qwiz/questions';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import PageShell from '@/components/PageShell';

function StartPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    step,
    setStep,
    qid,
    setQid,
    package: selectedPackage,
    features,
    totals,
    questionnaire,
    contact,
    setStatus,
  } = useQwizStore();

  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize from URL or create new
  useEffect(() => {
    setMounted(true);
    const qidFromUrl = searchParams.get('q');
    
    if (qidFromUrl && !qid) {
      setQid(qidFromUrl);
    } else if (!qid) {
      initQuestionnaire().then(({ id }) => {
        setQid(id);
        router.replace(`/start?q=${id}`);
      });
    }
  }, [qid, searchParams, setQid, router]);

  // Sync to server on changes
  useEffect(() => {
    if (!qid || !mounted) return;

    const syncData = {
      package: selectedPackage || undefined,
      selectedFeatures: features,
      totals: totals || undefined,
      questionnaire,
      contact: contact || undefined,
    };

    updateQuestionnaire(qid, syncData);
  }, [qid, selectedPackage, features, totals, questionnaire, contact, mounted]);

  const handleNext = async () => {
    if (step < 2) {
      setStep((step + 1) as any);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Submit
      setLoading(true);
      try {
        const mode = process.env.NEXT_PUBLIC_QWIZ_MODE || 'quote';
        
        if (mode === 'checkout') {
          // Redirect to Stripe checkout
          const response = await fetch('/api/checkout/create-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ qid }),
          });
          
          const { url } = await response.json();
          window.location.href = url;
        } else {
          // Submit as quote/lead and redirect to client dashboard
          const response = await fetch('/api/leads/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ qid }),
          });

          if (!response.ok) {
            throw new Error('Failed to submit quote');
          }
          
          setStatus('submitted');
          
          // Redirect to client dashboard first
          await router.push('/client');
          
          // Reset the store after navigation (small delay)
          setTimeout(() => {
            useQwizStore.getState().reset();
          }, 500);
        }
      } catch (error) {
        console.error('Submit error:', error);
        setStatus('error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((step - 1) as any);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    router.push('/start');
  };

  // Validation for next button
  const canProceed = () => {
    switch (step) {
      case 0:
        return !!selectedPackage;
      case 1:
        // Check all required questions
        const requiredQuestions = [
          'goals',
          'industry', 
          'targetAudience',
          'contentStatus',
          'timeline',
          'existingWebsite'
        ];
        
        return requiredQuestions.every((qId) => {
          const answer = questionnaire[qId as keyof typeof questionnaire];
          if (qId === 'existingWebsite') {
            return answer !== undefined;
          }
          if (Array.isArray(answer)) {
            return answer.length > 0;
          }
          return !!answer;
        });
      case 2:
        return true; // Review step always ready
      default:
        return false;
    }
  };

  const getNextLabel = () => {
    switch (step) {
      case 0:
        return 'Continue to Questions';
      case 1:
        return 'Review Quote';
      case 2:
        return process.env.NEXT_PUBLIC_QWIZ_MODE === 'checkout'
          ? 'Proceed to Checkout'
          : 'Submit Quote Request';
      default:
        return 'Continue';
    }
  };

  if (!mounted) return null;

  return (
    <PageShell>
      {/* Main content section - transparent glass container to show background */}
      <section className="max-w-7xl mx-auto px-6 py-12 min-h-[600px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden"
          >
            {/* Main content area */}
            <div className="p-8 min-h-[500px]">
            {/* Step 0: Package Selection */}
            {step === 0 && (
              <div>
                <PackageSelector />
              </div>
            )}

            {/* Step 1: Questionnaire */}
            {step === 1 && (
              <div>
                <QuestionnaireForm />
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && selectedPackage && totals && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Review Your Quote
                  </h2>
                  <p className="text-gray-400">Everything look good?</p>
                </div>

                {/* Package Summary */}
                <div className="bg-transparent backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="text-3xl">{getPackage(selectedPackage).icon}</span>
                    {getPackage(selectedPackage).title} Package
                  </h3>
                  <p className="text-gray-400 mb-4">{getPackage(selectedPackage).description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-2">Base Package</div>
                      <div className="text-2xl font-bold text-blue-400">
                        {formatPrice(totals.packageBase)}
                      </div>
                    </div>
                    {totals.addons > 0 && (
                      <div>
                        <div className="text-sm text-gray-500 mb-2">Add-ons</div>
                        <div className="text-2xl font-bold text-purple-400">
                          + {formatPrice(totals.addons)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Included Features */}
                <div className="bg-transparent backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Included Features ({getPackage(selectedPackage).baseIncludedFeatures.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {getPackage(selectedPackage).baseIncludedFeatures.map((featureId) => {
                      const feature = getFeature(featureId);
                      if (!feature) return null;
                      
                      return (
                        <div key={featureId} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span>{feature.icon}</span>
                          <span className="text-gray-300">{feature.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Features */}
                {totals.addons > 0 && (
                  <div className="bg-transparent backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Additional Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {features
                        .filter((fId) => !getPackage(selectedPackage).baseIncludedFeatures.includes(fId))
                        .map((featureId) => {
                          const feature = getFeature(featureId);
                          if (!feature) return null;
                          
                          return (
                            <div key={featureId} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span>{feature.icon}</span>
                                <span className="text-sm text-gray-300">{feature.title}</span>
                              </div>
                              <span className="text-blue-400 text-sm">
                                {formatPrice(feature.price)}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Maintenance */}
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    {MAINTENANCE.title}
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                      Required
                    </span>
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">{MAINTENANCE.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">Monthly</div>
                    <div className="text-xl font-bold text-green-400">
                      {formatPrice(MAINTENANCE.monthlyPrice)}
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="bg-transparent backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                  <div className="text-sm text-white/60">
                    This quote will be linked to your account. You can view and manage it in your client dashboard.
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Total Project Cost</div>
                      <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {formatPrice(totals.total)}
                      </div>
                      <div className="text-green-400 mt-2 flex items-center gap-2">
                        <span className="text-sm">+</span>
                        <span className="text-xl font-semibold">{formatPrice(totals.monthly)}/month</span>
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <div className="text-gray-400 text-sm mb-1">Deposit to Start</div>
                      <div className="text-3xl font-bold text-green-400">
                        {formatPrice(totals.deposit)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">25% or $250 minimum</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons - Only show for step 2 (step 0 auto-advances, step 1 has internal navigation) */}
            {step === 2 && (
              <div className="flex items-center justify-end gap-4 mt-8 pt-8 border-t border-white/10">
                <button
                  onClick={handleBack}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all disabled:opacity-50"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>

                <button
                  onClick={handleNext}
                  disabled={!canProceed() || loading}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-blue-500/30"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {getNextLabel()}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}
            </div>

            {/* Progress indicator - slim bar at bottom of panel */}
            <div className="border-t border-white/10 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-md">
              <div className="max-w-3xl mx-auto px-6 py-4">
                <div className="flex items-center justify-center gap-8">
                  {[
                    { num: 1, label: 'Package', icon: '📦' },
                    { num: 2, label: 'Questions', icon: '❓' },
                    { num: 3, label: 'Review', icon: '✨' }
                  ].map((s, idx) => (
                    <div key={idx} className="flex items-center gap-4 relative">
                      {/* Connecting line */}
                      {idx < 2 && (
                        <div className="absolute left-full top-4 w-16 h-0.5">
                          <div className={`h-full rounded-full transition-all duration-500 ${
                            idx < step 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                              : 'bg-white/10'
                          }`} />
                        </div>
                      )}
                      
                      {/* Circle + Label */}
                      <div className="flex flex-col items-center relative z-10">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mb-2
                          transition-all duration-300
                          ${idx <= step 
                            ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/50' 
                            : 'bg-white/5 text-white/30 border border-white/20'
                          }
                        `}>
                          {idx < step ? '✓' : s.icon}
                        </div>
                        <span className={`
                          text-xs font-medium transition-colors whitespace-nowrap
                          ${idx <= step ? 'text-white' : 'text-white/30'}
                        `}>
                          {s.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Gap before footer */}
      <div className="mt-12 mb-20" />

      {/* Price counter (sticky on steps 0-2) */}
      <PriceCounter />
    </PageShell>
  );
}

export default function StartPage() {
  return (
    <Suspense fallback={
      <PageShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white/60">Loading...</div>
        </div>
      </PageShell>
    }>
      <StartPageContent />
    </Suspense>
  );
}
