export default function DatabasePage() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">database</h1>
        <p className="text-white/60 text-sm">table counts and quick actions.</p>
      </div>
      
      <div className="backdrop-blur-xl bg-white/[0.08] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Database Admin Coming Soon</h3>
          <p className="text-white/60 text-sm max-w-md mx-auto">
            Database monitoring, table counts, and administrative tools will be available in the next update.
          </p>
        </div>
      </div>
    </main>
  );
}