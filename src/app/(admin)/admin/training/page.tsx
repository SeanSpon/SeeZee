export default function TrainingPage() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">training</h1>
        <p className="text-white/60 text-sm">assign lessons to teammates.</p>
      </div>
      
      <div className="backdrop-blur-xl bg-white/[0.08] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Training Portal Coming Soon</h3>
          <p className="text-white/60 text-sm max-w-md mx-auto">
            Assignment and tracking system for team training modules and skill development.
          </p>
        </div>
      </div>
    </main>
  );
}