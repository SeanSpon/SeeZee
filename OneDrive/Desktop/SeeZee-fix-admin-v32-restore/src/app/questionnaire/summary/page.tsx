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
      <div className="glass-effect rounded-xl border-2 border-gray-700 hover:border-trinity-red transition-all duration-300 p-8 shadow-medium hover:shadow-large">
        <h1 className="text-3xl md:text-4xl font-heading font-bold gradient-text mb-2">
          Review Your Project
        </h1>
        <p className="text-white/60">
          Review your answers and see your project estimate
        </p>
      </div>

      {/* Answers */}
      <div className="glass-effect rounded-xl border-2 border-gray-700 hover:border-trinity-red transition-all duration-300 p-6 shadow-medium hover:shadow-large">
        <h2 className="text-xl font-heading font-semibold text-white mb-4">Your Answers</h2>
        <div className="space-y-4">
          {data && StepSlugs.map((slug) => {
            const value = (data as Record<string, any>)[slug];
            if (!value) return null;

            return (
              <div
                key={slug}
                className="flex items-start justify-between gap-4 p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
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
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4 text-white/60 hover:text-trinity-red" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pricing */}
      {estimate && deposit && (
        <div className="glass-effect rounded-xl border-2 border-gray-700 hover:border-trinity-red transition-all duration-300 p-8 shadow-medium hover:shadow-large">
          <h2 className="text-2xl md:text-3xl font-heading font-bold gradient-text mb-4">
            Your Project Estimate
          </h2>
          
          <div className="space-y-3 mb-6">
            {breakdown.map((line, idx) => (
              <div key={idx} className="text-white/80">
                {line}
              </div>
            ))}
          </div>

          <div className="border-t border-gray-700 pt-4 space-y-2">
            <div className="flex justify-between text-lg">
              <span className="text-white/80">Total Estimate:</span>
              <span className="text-white font-semibold">
                {formatPrice(estimate)}
              </span>
            </div>
            <div className="flex justify-between text-xl font-bold">
              <span className="text-trinity-red">Deposit Required:</span>
              <span className="text-trinity-red">{formatPrice(deposit)}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/questionnaire/step/name"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg text-white font-semibold transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Edit Answers
            </Link>
            <div className="flex-1 px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg text-center">
              <p className="text-white/80 text-sm">
                Manual project creation required. An admin will review your questionnaire and create your project.
              </p>
              <p className="text-white/60 text-xs mt-2">
                You will receive an invoice via email once your project is approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No pricing fallback */}
      {(!estimate || !deposit) && (
        <div className="glass-effect rounded-xl border-2 border-gray-700 p-6 shadow-medium">
          <p className="text-yellow-200">
            Complete all required fields to see your project estimate.
          </p>
          <Link
            href="/questionnaire/step/name"
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg text-white font-semibold transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Questions
          </Link>
        </div>
      )}
    </div>
  );
}
