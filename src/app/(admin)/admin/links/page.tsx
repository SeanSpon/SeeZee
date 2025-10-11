export default function LinksPage() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">links</h1>
        <p className="text-white/60 text-sm">shared references and documentation.</p>
      </div>
      
      <div className="backdrop-blur-xl bg-white/[0.08] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Link Library Coming Soon</h3>
          <p className="text-white/60 text-sm max-w-md mx-auto">
            Organized collection of important links, documentation, and reference materials.
          </p>
        </div>
      </div>
    </main>
  );
}