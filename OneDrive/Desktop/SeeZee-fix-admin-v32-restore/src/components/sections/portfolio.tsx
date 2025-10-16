import { GlowButton } from "../ui/glow-button"

export function Portfolio() {
  return (
    <section id="portfolio" className="py-20 bg-transparent backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-5xl font-bold gradient-text mb-6">Live Projects</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Real websites and applications built for real clients
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="rounded-xl overflow-hidden hover:scale-105 transition-transform fade-in bg-white/8 backdrop-blur-xl shadow-[0_0_40px_rgba(124,92,255,0.05)]">
            <div className="h-48 bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <div className="text-white text-lg font-medium">Red Head Printing</div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Red Head Printing</h3>
              <p className="text-gray-300 mb-4">Live e-commerce platform with custom quote flow and client portal.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">Next.js</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Stripe</span>
              </div>
              <GlowButton size="sm" className="w-full">
                View Project
              </GlowButton>
            </div>
          </div>
          
          <div className="rounded-xl overflow-hidden hover:scale-105 transition-transform fade-in bg-white/8 backdrop-blur-xl shadow-[0_0_40px_rgba(124,92,255,0.05)]">
            <div className="h-48 bg-gradient-to-br from-blue-500 to-red-600 flex items-center justify-center">
              <div className="text-white text-lg font-medium">Big Red Bus</div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Big Red Bus</h3>
              <p className="text-gray-300 mb-4">Nonprofit booking site with 300% more efficient intake process.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">React</span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">Forms</span>
              </div>
              <GlowButton size="sm" className="w-full">
                View Project
              </GlowButton>
            </div>
          </div>
          
          <div className="rounded-xl overflow-hidden hover:scale-105 transition-transform fade-in bg-white/8 backdrop-blur-xl shadow-[0_0_40px_rgba(124,92,255,0.05)]">
            <div className="h-48 bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <div className="text-white text-lg font-medium">SeeZee Admin</div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">SeeZee Admin</h3>
              <p className="text-gray-300 mb-4">Internal project dashboard with client management and analytics.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm">Prisma</span>
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm">Dashboard</span>
              </div>
              <GlowButton size="sm" className="w-full">
                View Project
              </GlowButton>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12 fade-in">
          <GlowButton size="lg">
            Start Your Project
          </GlowButton>
        </div>
      </div>
    </section>
  )
}