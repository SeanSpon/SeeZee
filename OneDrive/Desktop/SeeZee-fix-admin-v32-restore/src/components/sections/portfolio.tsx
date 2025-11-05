'use client'

import { motion } from 'framer-motion'
import { ExternalLink, ArrowRight } from 'lucide-react'
import { GlowButton } from "../ui/glow-button"

export function Portfolio() {
  const projects = [
    {
      name: 'Red Head Printing',
      description: 'Live e-commerce platform with custom quote flow and client portal.',
      gradient: 'from-red-500 via-orange-500 to-red-600',
      tags: ['Next.js', 'Stripe'],
      tagColors: ['bg-blue-500/20 text-blue-300', 'bg-green-500/20 text-green-300']
    },
    {
      name: 'Big Red Bus',
      description: 'Nonprofit booking site with 300% more efficient intake process.',
      gradient: 'from-blue-500 via-indigo-500 to-red-600',
      tags: ['React', 'Forms'],
      tagColors: ['bg-purple-500/20 text-purple-300', 'bg-blue-500/20 text-blue-300']
    },
    {
      name: 'SeeZee Admin',
      description: 'Internal project dashboard with client management and analytics.',
      gradient: 'from-purple-500 via-blue-500 to-cyan-600',
      tags: ['Prisma', 'Dashboard'],
      tagColors: ['bg-indigo-500/20 text-indigo-300', 'bg-cyan-500/20 text-cyan-300']
    }
  ]

  return (
    <section id="portfolio" className="py-24 relative overflow-hidden">
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
              Live Projects
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Real websites and applications built for real clients
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.name}
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
              className="group relative"
            >
              <motion.div 
                className="h-full rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20"
                whileHover={{ 
                  boxShadow: "0 20px 60px rgba(124, 92, 255, 0.2)"
                }}
              >
                {/* Enhanced gradient header */}
                <motion.div 
                  className={`h-56 bg-gradient-to-br ${project.gradient} relative overflow-hidden`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="text-white text-2xl font-bold"
                      initial={{ scale: 1, opacity: 0.9 }}
                      whileHover={{ 
                        scale: 1.15,
                        opacity: 1,
                        rotate: [0, -2, 2, -2, 0],
                        transition: { duration: 0.5 }
                      }}
                    >
                      {project.name}
                    </motion.div>
                  </div>
                  {/* Overlay pattern */}
                  <motion.div 
                    className="absolute inset-0 opacity-20"
                    animate={{ 
                      backgroundPosition: ["0% 0%", "100% 100%"],
                    }}
                    transition={{ 
                      duration: 20, 
                      repeat: Infinity, 
                      repeatType: "reverse" 
                    }}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundSize: "60px 60px"
                    }}
                  />
                </motion.div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all">
                    {project.name}
                  </h3>
                  <p className="text-gray-300 mb-5 leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {project.tags.map((tag, tagIndex) => (
                      <span
                        key={tag}
                        className={`px-3 py-1 ${project.tagColors[tagIndex]} rounded-full text-sm font-medium`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <motion.button
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View Project
                    <motion.div
                      whileHover={{ x: 4, y: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </motion.div>
                  </motion.button>
                </div>
                {/* Hover glow */}
                <motion.div 
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${project.gradient} opacity-0 blur-xl -z-10`}
                  whileHover={{ opacity: 0.15 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.button
            onClick={() => window.location.href = '/start'}
            className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl flex items-center gap-2 mx-auto hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Your Project
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}