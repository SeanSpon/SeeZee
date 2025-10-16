'use client'

import { motion } from 'framer-motion'
import { Lock, FileText, CreditCard, MessageSquare } from 'lucide-react'

export function PortalPreview() {
  const features = [
    {
      icon: Lock,
      title: 'Secure Client Portal',
      description: 'Access your project dashboard 24/7'
    },
    {
      icon: FileText,
      title: 'Real-time Updates',
      description: 'Track progress and milestones'
    },
    {
      icon: CreditCard,
      title: 'Easy Payments',
      description: 'Manage invoices and payments online'
    },
    {
      icon: MessageSquare,
      title: 'Direct Communication',
      description: 'Message your team anytime'
    }
  ]

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Your Personal{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Client Portal
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Every client gets access to a dedicated portal to manage their project, 
            view progress, and communicate with the team.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/8 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/12 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
