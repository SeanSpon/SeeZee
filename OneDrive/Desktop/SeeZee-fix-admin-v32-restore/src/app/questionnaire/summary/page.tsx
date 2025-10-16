import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, CreditCard } from 'lucide-react';
import {
  getQuestionnaireId,
  getQuestionnaireWithPricing,
} from '@/lib/questionnaire';
import { StepLabels, StepSlugs, type StepSlug } from '@/lib/steps';
import { formatPrice, getPricingBreakdown } from '@/lib/pricing';

export default async function SummaryPage() {
  const qId = await getQuestionnaireId();
  
  if (!qId) {
    redirect('/questionnaire');
  }

  const questionnaire = await getQuestionnaireWithPricing(qId);

  if (!questionnaire) {
    redirect('/questionnaire');
  }

  const { data, estimate, deposit } = questionnaire;

  // Calculate pricing breakdown if available
  let breakdown: string[] = [];
  if (estimate && deposit) {
    // Create a mock PricingResult for display
    // In production, we'd store the full breakdown in the database
    const mockResult = {
      estimate,
      deposit,
      breakdown: {
        base: Math.round(estimate * 0.6), // rough approximation
        addons: Math.round(estimate * 0.25),
        rush: Math.round(estimate * 0.15),
        total: estimate
      }
    };
    breakdown = getPricingBreakdown(mockResult);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Review Your Project
        </h1>
        <p className="text-white/60">
          Review your answers and see your project estimate
        </p>
      </div>

      {/* Answers */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Your Answers</h2>
        <div className="space-y-4">
          {StepSlugs.map((slug) => {
            const value = data[slug];
            if (!value) return null;

            return (
              <div
                key={slug}
                className="flex items-start justify-between gap-4 p-4 bg-black/20 rounded-xl"
              >
                <div className="flex-1">
                  <div className="text-sm text-white/60 mb-1">
                    {StepLabels[slug as StepSlug]}
                  </div>
                  <div className="text-white">
                    {Array.isArray(value) ? value.join(', ') : String(value)}
                  </div>
                </div>
                <Link
                  href={`/questionnaire/step/${slug}`}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4 text-white/60" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pricing */}
      {estimate && deposit && (
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Your Project Estimate
          </h2>
          
          <div className="space-y-3 mb-6">
            {breakdown.map((line, idx) => (
              <div key={idx} className="text-white/80">
                {line}
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-4 space-y-2">
            <div className="flex justify-between text-lg">
              <span className="text-white/80">Total Estimate:</span>
              <span className="text-white font-semibold">
                {formatPrice(estimate)}
              </span>
            </div>
            <div className="flex justify-between text-xl font-bold">
              <span className="text-cyan-300">Deposit Required:</span>
              <span className="text-cyan-300">{formatPrice(deposit)}</span>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <Link
              href="/questionnaire/step/name"
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-semibold transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Edit Answers
            </Link>
            <form action="/api/checkout/questionnaire" method="POST" className="flex-1">
              <input type="hidden" name="questionnaireId" value={qId} />
              <input type="hidden" name="amount" value={deposit} />
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl text-white font-bold shadow-lg shadow-cyan-500/25 transition-all"
              >
                <CreditCard className="w-5 h-5" />
                Continue to Secure Checkout
              </button>
            </form>
          </div>
        </div>
      )}

      {/* No pricing fallback */}
      {(!estimate || !deposit) && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6">
          <p className="text-yellow-200">
            Complete all required fields to see your project estimate.
          </p>
          <Link
            href="/questionnaire/step/name"
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-semibold transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Questions
          </Link>
        </div>
      )}
    </div>
  );
}
