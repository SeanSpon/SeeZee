'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function Testimonials() {
  const testimonials = [
    {
      name: 'Mary Mason',
      role: 'CEO, The Big Red Bus',
      initials: 'MM',
      gradient: 'from-pink-500 to-purple-600',
      text: 'Sean and Zach completely transformed how we handle bookings. The new system is so much faster and our clients love how easy it is to use. Great work!'
    },
    {
      name: 'Tina Eith',
      role: 'Owner, Red Head Printings',
      initials: 'TE',
      gradient: 'from-blue-500 to-green-600',
      text: 'The e-commerce site they built handles everything we need - orders, quotes, customer management. It\'s been a game changer for our business operations.'
    },
    {
      name: 'Your Project',
      role: 'Coming Soon',
      initials: '?',
      gradient: 'from-gray-500 to-gray-600',
      text: 'Ready to join our satisfied clients? Let\'s build something amazing together.',
      cta: true
    }
  ]

  return (
    <section id="testimonials" className="py-32 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2 
            className="text-5xl md:text-6xl font-black mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Client Feedback
            </span>
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            What our clients say about working with SeeZee Studio
          </motion.p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={testimonial.name}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.15,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                y: -8,
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className="group relative p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/8 hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300"
            >
              <div className="flex items-center mb-6">
                <motion.div 
                  className={`w-16 h-16 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center text-white text-xl font-bold mr-4 flex-shrink-0`}
                  whileHover={{ 
                    scale: 1.15,
                    rotate: 360,
                    transition: { duration: 0.6 }
                  }}
                >
                  {testimonial.initials}
                </motion.div>
                <div>
                  <h4 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all">
                    {testimonial.name}
                  </h4>
                  <p className="text-gray-400">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex mb-4">
                <span className="text-yellow-400">★★★★★</span>
              </div>
              <motion.p 
                className="text-gray-300 text-lg leading-relaxed mb-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                &ldquo;{testimonial.text}&rdquo;
              </motion.p>
              {testimonial.cta && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Link
                    href="/start"
                    className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 w-full justify-center"
                  >
                    Start Your Project
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              )}
              {/* Hover glow */}
              <motion.div 
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${testimonial.gradient} opacity-0 blur-xl -z-10`}
                whileHover={{ opacity: 0.1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
