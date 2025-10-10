export function Services() {
  const services = [
    {
      title: "Web Applications",
      description: "Custom full-stack apps with Next.js, React, and modern frameworks.",
      details: "Authentication, databases, payments - everything you need.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
        </svg>
      )
    },
    {
      title: "Mobile Apps",
      description: "Native and cross-platform mobile applications.",
      details: "Flutter for iOS & Android, or native development.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
        </svg>
      )
    },
    {
      title: "Database Design",
      description: "Scalable database architecture and optimization.",
      details: "PostgreSQL, Prisma ORM, real-time syncing.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
        </svg>
      )
    },
    {
      title: "API Integration",
      description: "Connect your systems with third-party services.",
      details: "REST APIs, webhooks, payment processors, automation.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path>
        </svg>
      )
    }
  ]

  return (
    <section id="services" className="py-20">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="heading-display mb-4">What we build</h2>
          <p className="text-dim text-lg max-w-2xl mx-auto">
            Custom solutions with modern tech stacks, delivered fast and built to scale.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div key={index} className="glass-panel group hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                {service.icon}
              </div>
              <h3 className="font-semibold mb-2">{service.title}</h3>
              <p className="text-dim text-sm mb-3">{service.description}</p>
              <p className="text-xs text-primary">{service.details}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <a href="/services" className="btn-ghost">
            View all services
          </a>
        </div>
      </div>
    </section>
  )
}