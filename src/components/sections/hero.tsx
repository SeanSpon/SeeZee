"use client"
import Link from "next/link"

export function Hero() {
  const scrollToContact = () => {
    window.location.href = '/contact';
  };

  const scrollToServices = () => {
    window.location.href = '/services';
  };

  return (
    <section className="pt-20 pb-16">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Main Content */}
          <div>
            <h1 className="heading-display mb-4">
              Websites, apps, and databases that ship fast and look sharp.
            </h1>
            <p className="text-dim text-lg mb-8 leading-relaxed">
              SeeZee Studio builds clean, reliable software for small teams and big ideas.
              Straight to value, no baggage.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button onClick={scrollToContact} className="btn-primary">
                Get a quote
              </button>
              <button onClick={scrollToServices} className="btn-ghost">
                View services
              </button>
            </div>
            
            {/* Tech Stack Chips */}
            <div className="flex flex-wrap gap-2">
              <span className="chip">Next.js / React</span>
              <span className="chip">Postgres / Prisma</span>
              <span className="chip">Flutter / Kotlin</span>
              <span className="chip">Integrations & APIs</span>
            </div>
          </div>
          
          {/* Side Panel */}
          <div className="glass-panel">
            <h3 className="font-semibold mb-4">Recent wins</h3>
            <div className="separator"></div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-dim text-sm">E‑commerce launch</div>
                  <div className="font-bold">+37% conversion</div>
                </div>
                <span className="pill">Case study</span>
              </div>
              
              <div className="separator"></div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-dim text-sm">Dashboard rebuild</div>
                  <div className="font-bold">‑48% load time</div>
                </div>
                <span className="pill">Performance</span>
              </div>
              
              <div className="separator"></div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-dim text-sm">Mobile app launch</div>
                  <div className="font-bold">4.8★ rating</div>
                </div>
                <span className="pill">Flutter</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}