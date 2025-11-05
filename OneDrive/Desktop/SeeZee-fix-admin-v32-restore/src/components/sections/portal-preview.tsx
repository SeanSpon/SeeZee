'use client'

import { motion } from 'framer-motion'
import { Lock, FileText, CreditCard, MessageSquare, Shield, TrendingUp, Wallet, Headphones } from 'lucide-react'

export function PortalPreview() {
  const features = [
    {
      icon: Shield,
      title: 'Secure Client Portal',
      description: 'Access your project dashboard 24/7 with enterprise-grade security',
      gradient: 'from-blue-500 to-cyan-500',
      color: 'text-blue-400'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Updates',
      description: 'Track progress and milestones as they happen',
      gradient: 'from-purple-500 to-pink-500',
      color: 'text-purple-400'
    },
    {
      icon: Wallet,
      title: 'Easy Payments',
      description: 'Manage invoices and payments online seamlessly',
      gradient: 'from-green-500 to-emerald-500',
      color: 'text-green-400'
    },
    {
      icon: Headphones,
      title: 'Direct Communication',
      description: 'Message your team anytime with instant notifications',
      gradient: 'from-yellow-500 to-orange-500',
      color: 'text-yellow-400'
    }
  ]

  return (
    <section id="demo" className="py-32 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Your Personal{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Client Portal
            </span>
          </h2>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto leading-relaxed">
            Every client gets access to a dedicated portal to manage their project, 
            view progress, and communicate with the team.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all">
                  {feature.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
                
                {/* Hover glow effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300 -z-10`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
