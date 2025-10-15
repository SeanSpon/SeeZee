'use client';

import { useEffect, useState } from 'react';
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
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import PageShell from '@/components/PageShell';

export default function StartPage() {
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
    if (step < 4) {
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
          // Submit as quote/lead
          await fetch('/api/leads/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ qid }),
          });
          
          setStatus('submitted');
          router.push('/start/success');
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

  // Validation for next button
  const canProceed = () => {
    switch (step) {
      case 0:
        return !!selectedPackage;
      case 1:
        // Check required questions
        return !!(
          questionnaire.goals?.length &&
          questionnaire.targetAudience?.length &&
          questionnaire.timeline &&
          questionnaire.contentReady !== undefined
        );
      case 2:
        return !!(contact?.name && contact?.email);
      case 3:
        return true;
      default:
        return false;
    }
  };

  const getNextLabel = () => {
    switch (step) {
      case 0:
        return 'Continue to Questions';
      case 1:
        return 'Continue to Contact';
      case 2:
        return 'Review Quote';
      case 3:
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
      {/* Sticky progress bar - translucent with blur */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            {[0, 1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition-all ${
                  s <= step
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                    : 'bg-gray-800'
                }`}
              />
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-400 text-center">
            {step === 0 && 'Choose Your Package'}
            {step === 1 && 'Answer Questions'}
            {step === 2 && 'Contact Information'}
            {step === 3 && 'Review & Submit'}
          </div>
        </div>
      </header>

      {/* Main content section - floating glass container */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.35)] p-8"
          >
            {/* Step 0: Package Selection */}
            {step === 0 && <PackageSelector />}

            {/* Step 1: Questionnaire */}
            {step === 1 && <QuestionnaireForm />}

            {/* Step 2: Contact Form */}
            {step === 2 && <ContactForm />}

            {/* Step 3: Review */}
            {step === 3 && selectedPackage && totals && (
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
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Name</div>
                      <div className="font-medium">{contact?.name}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Email</div>
                      <div className="font-medium">{contact?.email}</div>
                    </div>
                    {contact?.phone && (
                      <div>
                        <div className="text-gray-500">Phone</div>
                        <div className="font-medium">{contact.phone}</div>
                      </div>
                    )}
                    {contact?.company && (
                      <div>
                        <div className="text-gray-500">Company</div>
                        <div className="font-medium">{contact.company}</div>
                      </div>
                    )}
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

            {/* Navigation Buttons */}
            {step !== 0 && (
              <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-800">
                <button
                  onClick={handleBack}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all disabled:opacity-50"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>

                <button
                  onClick={handleNext}
                  disabled={!canProceed() || loading}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
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
