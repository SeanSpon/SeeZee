import { GlowButton } from "../ui/glow-button"

export function Hero() {
  return (
    <section className="min-h-screen hero-bg flex items-center justify-center relative overflow-hidden pt-24">
      {/* Particle Background */}
      <div className="absolute inset-0" id="particles"></div>
      
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl floating-animation"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl floating-animation" style={{ animationDelay: '-3s' }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        {/* Status Badge */}
        <div className="inline-flex items-center glass-card px-4 py-2 rounded-full mb-8 fade-in">
          <div className="w-2 h-2 bg-green-400 rounded-full pulse-dot mr-2"></div>
          <span className="text-sm">Available for new projects</span>
        </div>
        
        {/* Main Heading */}
        <h1 className="text-6xl md:text-8xl font-bold mb-6 fade-in">
          <span className="gradient-text">Fast. Modern.</span><br />
          <span className="text-white">Delivered.</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto fade-in">
          SeeZee Studio builds custom full-stack web applications with Next.js, Tailwind, and modern tech. 
          Real projects for real clients, delivered fast.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 fade-in">
          <GlowButton size="lg" className="min-w-[200px]">
            Start Your Project
          </GlowButton>
          <GlowButton variant="secondary" size="lg" className="min-w-[200px]">
            See Live Projects
          </GlowButton>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto fade-in">
          <div className="glass-card p-6 rounded-xl hover:bg-white/20 transition-all">
            <div className="text-3xl font-bold gradient-text mb-2">Real</div>
            <div className="text-gray-300">Client Projects</div>
          </div>
          <div className="glass-card p-6 rounded-xl hover:bg-white/20 transition-all">
            <div className="text-3xl font-bold gradient-text mb-2">Fast</div>
            <div className="text-gray-300">Delivery</div>
          </div>
          <div className="glass-card p-6 rounded-xl hover:bg-white/20 transition-all">
            <div className="text-3xl font-bold gradient-text mb-2">Modern</div>
            <div className="text-gray-300">Tech Stack</div>
          </div>
          <div className="glass-card p-6 rounded-xl hover:bg-white/20 transition-all">
            <div className="text-3xl font-bold gradient-text mb-2">100%</div>
            <div className="text-gray-300">Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  )
}