import { GlowButton } from "../ui/glow-button"

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-slate-800/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-5xl font-bold gradient-text mb-6">Client Feedback</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            What our clients say about working with SeeZee Studio
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="glass-card p-8 rounded-2xl hover:scale-105 transition-transform fade-in">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">
                MM
              </div>
              <div>
                <h4 className="text-xl font-bold">Mary Mason</h4>
                <p className="text-gray-400">CEO, The Big Red Bus</p>
              </div>
            </div>
            <div className="flex mb-4">
              <span className="text-yellow-400">★★★★★</span>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">
              &ldquo;Sean and Zach completely transformed how we handle bookings. The new system is so much faster and our clients love how easy it is to use. Great work!&rdquo;
            </p>
          </div>
          
          <div className="glass-card p-8 rounded-2xl hover:scale-105 transition-transform fade-in">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">
                TE
              </div>
              <div>
                <h4 className="text-xl font-bold">Tina Eith</h4>
                <p className="text-gray-400">Owner, Red Head Printings</p>
              </div>
            </div>
            <div className="flex mb-4">
              <span className="text-yellow-400">★★★★★</span>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">
              &ldquo;The e-commerce site they built handles everything we need - orders, quotes, customer management. It&apos;s been a game changer for our business operations.&rdquo;
            </p>
          </div>
          
          <div className="glass-card p-8 rounded-2xl hover:scale-105 transition-transform fade-in border-2 border-dashed border-gray-600">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">
                ?
              </div>
              <div>
                <h4 className="text-xl font-bold">Your Project</h4>
                <p className="text-gray-400">Coming Soon</p>
              </div>
            </div>
            <div className="flex mb-4">
              <span className="text-gray-500">★★★★★</span>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">
              &ldquo;Ready to join our satisfied clients? Let&apos;s build something amazing together.&rdquo;
            </p>
            <div className="mt-6">
              <GlowButton size="sm" className="w-full">
                Start Your Project
              </GlowButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}