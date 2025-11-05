'use client'

import { motion } from 'framer-motion'
import { Code, BarChart3, Zap, ArrowRight } from 'lucide-react'

export function Services() {
  const services = [
    {
      icon: Zap,
      title: 'Speed + Quality',
      description: `We ship in weeks, not months. You'll see progress every day.`,
      highlight: 'Fast delivery without cutting corners.',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      textColor: 'text-blue-400'
    },
    {
      icon: Code,
      title: 'Low Cost, High Skill',
      description: `We're students and builders who actually love this. We charge what's fair, not inflated.`,
      highlight: 'Fair pricing from passionate developers.',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      textColor: 'text-green-400'
    },
    {
      icon: BarChart3,
      title: 'The Dashboard',
      description: 'Your control center. Track progress, tasks, payments, and chat directly with us — all in one place.',
      highlight: 'Everything you need, right at your fingertips.',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      textColor: 'text-purple-400'
    }
  ]

  return (
    <section id="services" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              What We're About
            </span>
          </h2>
          <p className="text-3xl md:text-4xl font-bold text-white mb-4">
            We build like we care.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className={`
                h-full p-6 rounded-2xl backdrop-blur-xl border transition-all duration-300
                ${service.bgColor} ${service.borderColor} border
                hover:border-opacity-40 hover:shadow-2xl hover:shadow-${service.color.split('-')[0]}-500/20
                hover:-translate-y-2
              `}>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all">
                  {service.title}
                </h3>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  {service.description}
                </p>
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium ${service.textColor}`}>
                    {service.highlight}
                  </p>
                  <ArrowRight className={`w-4 h-4 ${service.textColor} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300`} />
                </div>
                
                {/* Hover glow effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300 -z-10`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}