"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { CheckCircle, ArrowRight } from "lucide-react"
import { CinematicBackground, GlowingText, FadeIn, MeltedCard } from "../motion"

export function Hero() {
  const scrollToContact = () => {
    window.location.href = '/start';
  };

  const scrollToServices = () => {
    window.location.href = '/services';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const chipVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };

  const panelVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center pt-32 pb-32">
      <div className="container-custom relative z-10">
        <motion.div 
          className="grid lg:grid-cols-2 gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Content */}
          <div>
            {/* Brand name with glow effect */}
            <FadeIn delay={0.2}>
              <div className="mb-6">
                <GlowingText className="text-6xl md:text-8xl font-black tracking-tight">
                  SEEZEE
                </GlowingText>
                <motion.div 
                  className="text-lg text-muted mt-2 tracking-wider"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.8 }}
                >
                  STUDIO
                </motion.div>
              </div>
            </FadeIn>

            <motion.h1 
              className="heading-display mb-4"
              variants={itemVariants}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              your community technology partner.
            </motion.h1>
            
            <motion.p 
              className="text-dim text-lg mb-6 leading-relaxed"
              variants={itemVariants}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            >
              seezee studio provides hands-on support, consulting, and custom solutions for schools, 
              nonprofits, and community organizations.
            </motion.p>

            {/* Trust badges */}
            <motion.div 
              className="flex flex-wrap gap-4 mb-8 text-sm"
              variants={itemVariants}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            >
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>2-4 week delivery</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>$0 upfront</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>satisfaction guaranteed</span>
              </div>
            </motion.div>
            
            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 mb-8"
              variants={itemVariants}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
              <motion.button 
                onClick={scrollToContact} 
                className="btn-glow group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                get a quote
                <ArrowRight className="w-4 h-4 ml-2 inline-block group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button 
                onClick={scrollToServices} 
                className="btn-ghost"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                view services
              </motion.button>
            </motion.div>
            
            {/* Tech Stack Chips */}
            <motion.div 
              className="flex flex-wrap gap-2"
              variants={itemVariants}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            >
              {["next.js / react", "postgres / prisma", "flutter / kotlin", "integrations & apis"].map((tech, index) => (
                <motion.span
                  key={tech}
                  className="chip"
                  variants={chipVariants}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                >
                  {tech}
                </motion.span>
              ))}
            </motion.div>
          </div>
          
          {/* Side Panel - Seamless Design */}
          <MeltedCard 
            className="p-6"
            delay={0.5}
          >
            <motion.h3 
              className="font-semibold mb-4 text-gradient-purple"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              recent wins
            </motion.h3>
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6"></div>
            
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              {[
                { label: "e‑commerce launch", value: "+37% conversion", tag: "case study", delay: 1.2 },
                { label: "dashboard rebuild", value: "‑48% load time", tag: "performance", delay: 1.4 },
                { label: "mobile app launch", value: "4.8★ rating", tag: "flutter", delay: 1.6 }
              ].map((item, index) => (
                <motion.div 
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: item.delay, duration: 0.5 }}
                  className="group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-dim text-sm">{item.label}</div>
                      <div className="font-bold text-gradient-cyan">{item.value}</div>
                    </div>
                    <motion.span 
                      className="pill"
                      whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(124,92,255,0.3)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      {item.tag}
                    </motion.span>
                  </div>
                  {index < 2 && <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>}
                </motion.div>
              ))}
            </motion.div>
          </MeltedCard>
        </motion.div>
      </div>
    </section>
  )
}