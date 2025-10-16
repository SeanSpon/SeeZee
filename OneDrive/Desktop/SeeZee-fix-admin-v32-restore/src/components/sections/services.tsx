import { GlassCard } from "../ui/glass-card"

const services = [
  {
    icon: "🎨",
    title: "UI/UX Design",
    description: "Beautiful, intuitive interfaces that delight users and drive conversions.",
    features: ["User Research", "Wireframing", "Prototyping", "Visual Design"]
  },
  {
    icon: "💻",
    title: "Web Development",
    description: "Fast, responsive websites built with modern technologies and best practices.",
    features: ["React/Next.js", "TypeScript", "Performance Optimization", "SEO"]
  },
  {
    icon: "📱",
    title: "Mobile Apps",
    description: "Native and cross-platform mobile applications for iOS and Android.",
    features: ["React Native", "Flutter", "App Store Deployment", "Push Notifications"]
  },
  {
    icon: "☁️",
    title: "Cloud Solutions",
    description: "Scalable cloud infrastructure and deployment strategies for your applications.",
    features: ["AWS/Azure", "DevOps", "CI/CD", "Monitoring"]
  },
  {
    icon: "🚀",
    title: "Performance",
    description: "Optimize your applications for speed, efficiency, and better user experience.",
    features: ["Code Optimization", "Caching", "CDN Setup", "Core Web Vitals"]
  },
  {
    icon: "🔧",
    title: "Maintenance",
    description: "Ongoing support and maintenance to keep your applications running smoothly.",
    features: ["Bug Fixes", "Updates", "Security", "Monitoring"]
  }
]

export function Services() {
  return (
    <section className="py-24 bg-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Our Services
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            We offer comprehensive digital solutions to help your business thrive in the modern world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <GlassCard key={index} hover className="h-full">
              <div className="text-center mb-4">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                <p className="text-white/70 mb-6">{service.description}</p>
              </div>
              
              <div className="space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center text-sm text-white/60">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3"></div>
                    {feature}
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}