'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface NavButtonsProps {
  backHref?: string;
  nextLabel?: string;
  isSubmitting?: boolean;
  canGoBack?: boolean;
}

export function NavButtons({ 
  backHref, 
  nextLabel = 'Continue', 
  isSubmitting = false,
  canGoBack = true 
}: NavButtonsProps) {
  return (
    <div className="mt-8 flex items-center justify-between">
      {canGoBack && backHref ? (
        <Link
          href={backHref}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-xl hover:bg-white/5"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      ) : (
        <div />
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Saving...' : nextLabel}
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
