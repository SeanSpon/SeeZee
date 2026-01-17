'use client'

import { motion } from 'framer-motion'
import ScrollAnimation from '@/components/shared/ScrollAnimation'
import { 
  FiDatabase, 
  FiCode, 
  FiServer, 
  FiLock,
  FiZap,
  FiGitBranch,
  FiBarChart,
  FiUsers,
} from 'react-icons/fi'

const techCategories = [
  {
    category: 'Frontend Framework',
    icon: <FiCode className="w-8 h-8" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    technologies: [
      { name: 'Next.js 16', description: 'Full-stack React framework' },
      { name: 'React 18', description: 'Modern UI library' },
      { name: 'TypeScript', description: 'Type-safe development' },
      { name: 'Tailwind CSS', description: 'Utility-first styling' },
    ]
  },
  {
    category: 'Database & ORM',
    icon: <FiDatabase className="w-8 h-8" />,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
    technologies: [
      { name: 'PostgreSQL', description: 'Relational database' },
      { name: 'Prisma', description: 'Modern ORM & migrations' },
      { name: 'Vercel KV', description: 'Redis for caching' },
      { name: 'UpStash', description: 'Serverless Redis' },
    ]
  },
  {
    category: 'Authentication & Security',
    icon: <FiLock className="w-8 h-8" />,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    technologies: [
      { name: 'NextAuth.js v5', description: 'Secure authentication' },
      { name: 'OAuth 2.0', description: 'Social login providers' },
      { name: 'bcryptjs', description: 'Password hashing' },
      { name: 'reCAPTCHA v3', description: 'Bot prevention' },
    ]
  },
  {
    category: 'Payment & Billing',
    icon: <FiBarChart className="w-8 h-8" />,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    technologies: [
      { name: 'Stripe', description: 'Payment processing' },
      { name: 'Stripe.js', description: 'Client-side payments' },
      { name: 'Subscription Management', description: 'Recurring billing' },
      { name: 'Invoice System', description: 'PDF generation' },
    ]
  },
  {
    category: 'Backend & APIs',
    icon: <FiServer className="w-8 h-8" />,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10',
    technologies: [
      { name: 'Next.js API Routes', description: 'RESTful endpoints' },
      { name: 'Server Actions', description: 'Direct DB mutations' },
      { name: 'Vercel Functions', description: 'Serverless backend' },
      { name: 'Nodemailer & Resend', description: 'Email delivery' },
    ]
  },
  {
    category: 'AI & Data',
    icon: <FiZap className="w-8 h-8" />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    technologies: [
      { name: 'OpenAI API', description: 'GPT models' },
      { name: 'Anthropic Claude', description: 'Advanced AI' },
      { name: 'TanStack Query', description: 'Data fetching' },
      { name: 'Recharts', description: 'Data visualization' },
    ]
  },
  {
    category: 'File Management',
    icon: <FiGitBranch className="w-8 h-8" />,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-400/10',
    technologies: [
      { name: 'Uploadthing', description: 'File uploads' },
      { name: 'Image Optimization', description: 'Next.js Image' },
      { name: 'PDF Generation', description: '@react-pdf/renderer' },
      { name: 'QR Codes', description: 'Dynamic QR generation' },
    ]
  },
  {
    category: 'External Services',
    icon: <FiUsers className="w-8 h-8" />,
    color: 'text-pink-400',
    bgColor: 'bg-pink-400/10',
    technologies: [
      { name: 'Google Maps API', description: 'Location services' },
      { name: 'Vercel Analytics', description: 'Usage tracking' },
      { name: 'Rate Limiting', description: 'UpStash protection' },
      { name: 'Calendar Integration', description: 'react-big-calendar' },
    ]
  },
]

export function TechStrip() {
  return (
    <section className="py-12 sm:py-20 bg-gradient-to-b from-[#0a1128] to-[#0f1825] relative overflow-hidden">
      {/* Decorative background elements */}
      <motion.div 
        className="absolute top-1/3 -right-48 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div 
        className="absolute -bottom-32 -left-48 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-indigo-500/8 rounded-full blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <ScrollAnimation>
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-16 px-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-heading font-bold mb-4 sm:mb-6 text-white">
              What We Specialize In
            </h2>
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
              Modern tech stack built for scale, security, and performance. We use industry-leading tools to build platforms that actually work.
            </p>
          </div>
        </ScrollAnimation>

        {/* Tech Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {techCategories.map((category, index) => (
            <ScrollAnimation key={index} delay={index * 0.05}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                className="group h-full p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a2332]/40 via-[#0a1128]/40 to-[#0a1128]/40 backdrop-blur-xl hover:border-blue-400/40 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 relative overflow-hidden"
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                
                <div className="relative z-10">
                  {/* Icon and Title */}
                  <div className={`${category.color} ${category.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                    {category.icon}
                  </div>
                  
                  <h3 className="text-lg font-heading font-semibold text-white mb-4 group-hover:text-blue-300 transition-colors duration-300">
                    {category.category}
                  </h3>
                  
                  {/* Tech List */}
                  <ul className="space-y-3">
                    {category.technologies.map((tech, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="text-sm"
                      >
                        <div className="font-semibold text-white/90 group-hover:text-blue-300 transition-colors">
                          {tech.name}
                        </div>
                        <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                          {tech.description}
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </ScrollAnimation>
          ))}
        </div>

        {/* Highlights Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-12">
          {[
            { emoji: '⚡', title: 'High Performance', description: 'Optimized for speed and scalability' },
            { emoji: '🔒', title: 'Enterprise Security', description: 'Production-grade security standards' },
            { emoji: '📊', title: 'Real-time Analytics', description: 'Track everything that matters' },
            { emoji: '🚀', title: 'Cloud Native', description: 'Deployed on Vercel Edge Network' },
          ].map((highlight, index) => (
            <ScrollAnimation key={index} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                className="p-6 rounded-xl border border-white/10 bg-[#0a1128]/50 backdrop-blur hover:border-blue-400/40 transition-all duration-300 text-center"
              >
                <div className="text-4xl mb-3">{highlight.emoji}</div>
                <h4 className="font-semibold text-white mb-2">{highlight.title}</h4>
                <p className="text-sm text-gray-400">{highlight.description}</p>
              </motion.div>
            </ScrollAnimation>
          ))}
        </div>

        {/* Why These Technologies */}
        <div className="mt-16 max-w-3xl mx-auto">
          <ScrollAnimation>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-8 sm:p-12 rounded-2xl border-2 border-blue-400/30 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent backdrop-blur-xl"
            >
              <h3 className="text-2xl font-heading font-bold text-white mb-4">Why This Stack?</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex gap-3 items-start">
                  <span className="text-blue-400 font-bold mt-0.5">✓</span>
                  <span><strong>Type Safety:</strong> TypeScript catches bugs before they reach production</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-blue-400 font-bold mt-0.5">✓</span>
                  <span><strong>Scalability:</strong> Next.js and Vercel handle everything from 100 to 100,000 users</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-blue-400 font-bold mt-0.5">✓</span>
                  <span><strong>Security:</strong> Battle-tested libraries and industry standards</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-blue-400 font-bold mt-0.5">✓</span>
                  <span><strong>Developer Experience:</strong> We can move fast and stay sane while doing it</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-blue-400 font-bold mt-0.5">✓</span>
                  <span><strong>Cost Effective:</strong> Open source & serverless means no licensing fees</span>
                </li>
              </ul>
            </motion.div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  )
}