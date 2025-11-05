'use client';

import { Suspense } from 'react';
import { PackageSelector } from '@/components/qwiz/PackageSelector';
import PageShell from '@/components/PageShell';

function StartPageContent() {
  return (
    <PageShell>
      {/* Main content section */}
      <section className="max-w-7xl mx-auto px-6 py-12 min-h-[600px]">
        <div className="rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden">
          <div className="p-8 md:p-12">
            <PackageSelector />
          </div>
        </div>
      </section>
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
