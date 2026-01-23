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
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-lg hover:bg-gray-800 border border-gray-700 hover:border-gray-600"
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
        className="flex items-center gap-2 px-6 py-3 bg-#ef4444 text-white font-semibold rounded-lg hover:bg-#dc2626 transition-all duration-200 shadow-medium transform hover:-translate-y-1 glow-on-hover focus:outline-none focus:ring-2 focus:ring-#ef4444 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {isSubmitting ? 'Saving...' : nextLabel}
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
