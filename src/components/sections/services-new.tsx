export function Services() {
  return (
    <section id="services" className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-5xl font-bold gradient-text mb-6">What We Build</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Custom solutions built with modern technologies and delivered fast
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="gradient-border hover:scale-105 transition-transform fade-in">
            <div className="gradient-border-inner">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Web & App Development</h3>
              <p className="text-gray-300 mb-4">Full-stack applications with Next.js, React, and modern frameworks.</p>
              <p className="text-sm text-blue-400">Custom builds, not templates. Fast deployment with Vercel.</p>
            </div>
          </div>
          
          <div className="gradient-border hover:scale-105 transition-transform fade-in">
            <div className="gradient-border-inner">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">E-commerce Platforms</h3>
              <p className="text-gray-300 mb-4">Complete online stores with Stripe integration and admin dashboards.</p>
              <p className="text-sm text-green-400">Real payment processing. Inventory management. Mobile-first design.</p>
            </div>
          </div>
          
          <div className="gradient-border hover:scale-105 transition-transform fade-in">
            <div className="gradient-border-inner">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Dashboards & Admin Tools</h3>
              <p className="text-gray-300 mb-4">Custom admin panels and business dashboards with real-time data.</p>
              <p className="text-sm text-purple-400">PostgreSQL + Prisma. Real metrics. User management built-in.</p>
            </div>
          </div>
          
          <div className="gradient-border hover:scale-105 transition-transform fade-in">
            <div className="gradient-border-inner">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Performance & SEO</h3>
              <p className="text-gray-300 mb-4">Lightning-fast sites optimized for search engines and conversions.</p>
              <p className="text-sm text-yellow-400">Core Web Vitals optimized. Real SEO results. Speed matters.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}