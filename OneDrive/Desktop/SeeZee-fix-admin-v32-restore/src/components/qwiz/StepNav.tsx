'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useQwizStore } from '@/lib/qwiz/store';

interface StepNavProps {
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
}

export function StepNav({
  onNext,
  onBack,
  nextLabel = 'Continue',
  nextDisabled = false,
  loading = false,
}: StepNavProps) {
  const { step } = useQwizStore();

  return (
    <div className="flex items-center justify-between gap-4 pt-8">
      {step > 1 && (
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-semibold transition-all disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      )}

      <div className="flex-1" />

      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled || loading}
        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 rounded-xl text-white font-bold shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            {nextLabel}
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
}
