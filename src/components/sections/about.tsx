export function About() {
  return (
    <section id="about" className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-5xl font-bold gradient-text mb-6">Meet the Team</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Started as an FBLA project — became a real studio building modern web applications
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="glass-card p-8 rounded-2xl fade-in">
            <div className="flex items-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-6">
                S
              </div>
              <div>
                <h3 className="text-2xl font-bold">Sean</h3>
                <p className="text-blue-400">Lead Engineer & Co-Founder</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Lead Engineer focused on backend infrastructure and full-stack development. Trinity High School graduate with FBLA experience in business applications. Passionate about Raspberry Pi projects, AI automation, and building scalable systems with modern technologies.
            </p>
          </div>
          
          <div className="glass-card p-8 rounded-2xl fade-in">
            <div className="flex items-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-6">
                Z
              </div>
              <div>
                <h3 className="text-2xl font-bold">Zach</h3>
                <p className="text-green-400">Product Designer & Frontend Lead</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Product Designer and Frontend Lead specializing in user experience and interface design. Focuses on client experience, presentation polish, and ensuring every project not only works perfectly but looks amazing. Trinity High School graduate with strong FBLA background.
            </p>
          </div>
        </div>
        
        <div className="text-center mb-12 fade-in">
          <h3 className="text-3xl font-bold mb-8">Our Journey</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-6 rounded-xl">
              <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h4 className="text-xl font-bold mb-3">FBLA Projects</h4>
              <p className="text-gray-300">
                Started building business applications through Future Business Leaders of America competitions at Trinity High School, learning the importance of real-world solutions.
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-xl">
              <div className="w-16 h-16 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h4 className="text-xl font-bold mb-3">Client Launches</h4>
              <p className="text-gray-300">
                Launched our first two business websites - Red Head Printing&apos;s e-commerce platform and Big Red Bus&apos;s booking system, proving our ability to deliver real results.
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-xl">
              <div className="w-16 h-16 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="text-xl font-bold mb-3">Next Chapter</h4>
              <p className="text-gray-300">
                Now building full dashboards, automation tools, and modern web applications with Next.js, focusing on fast delivery and cutting-edge technology.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}