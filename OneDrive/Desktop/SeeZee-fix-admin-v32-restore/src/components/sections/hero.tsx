"use client"
import { motion, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { CheckCircle, ArrowRight, Sparkles, Zap, Rocket } from "lucide-react"
import { CinematicBackground, GlowingText, FadeIn, MeltedCard, ScrollReveal } from "../motion"
import { Dashboard3D } from "../dashboard-3d"

// Count-up animation component
function CountUp({ end, duration = 2, prefix = "", suffix = "" }: { end: number, duration?: number, prefix?: string, suffix?: string }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.5 }
    )

    const element = document.getElementById('count-up-trigger')
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number | null = null
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)
      
      setCount(Math.floor(progress * end))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [isVisible, end, duration])

  return <span>{prefix}{count}{suffix}</span>
}

// Animated number component for percentage
function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: string, prefix?: string, suffix?: string }) {
  const [displayValue, setDisplayValue] = useState("0")
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.5 }
    )

    const element = document.getElementById('recent-wins-card')
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    // Extract number from value like "+37%" or "4.8"
    const numMatch = value.match(/[\d.]+/)
    if (!numMatch) {
      setDisplayValue(value)
      return
    }

    const targetNum = parseFloat(numMatch[0])
    const isNegative = value.includes("‑") || value.includes("-")
    const hasPlus = value.includes("+")
    
    let current = 0
    const increment = targetNum / 60
    const timer = setInterval(() => {
      current += increment
      if (current >= targetNum) {
        current = targetNum
        clearInterval(timer)
      }
      
      const formatted = current.toFixed(value.includes(".") ? 1 : 0)
      setDisplayValue(value.replace(/[\d.]+/, formatted))
    }, 16)

    return () => clearInterval(timer)
  }, [isVisible, value])

  return <span>{prefix}{displayValue}{suffix}</span>
}

export function Hero() {
  const scrollToContact = () => {
    window.location.href = '/start';
  };

  const scrollToDashboard = () => {
    const dashboardSection = document.getElementById('dashboard');
    if (dashboardSection) {
      dashboardSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
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

  // Parallax for floating cards
  const { scrollYProgress } = useScroll()
  const parallaxY1 = useTransform(scrollYProgress, [0, 1], [0, -50])
  const parallaxY2 = useTransform(scrollYProgress, [0, 1], [0, -80])
  const parallaxY3 = useTransform(scrollYProgress, [0, 1], [0, -30])

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center pt-32 pb-32">
      {/* Enhanced background effects - Linear style */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container-custom relative z-10">
        <motion.div 
          className="grid lg:grid-cols-2 gap-20 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Content - Linear Style: Massive typography, minimal text */}
          <div className="space-y-10">
            {/* Brand name - Linear style: Huge and confident */}
            <FadeIn delay={0.1}>
              <div className="mb-12">
                <GlowingText className="text-8xl md:text-[180px] font-black tracking-tighter leading-[0.9]">
                  SEEZEE
                </GlowingText>
                <motion.div 
                  className="text-2xl md:text-3xl text-gray-400 mt-4 tracking-[0.3em] font-light uppercase"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                >
                  STUDIO
                </motion.div>
              </div>
            </FadeIn>

            {/* Headline - Linear style: One massive line, gradient text */}
            <motion.h1 
              className="text-6xl md:text-8xl font-black mb-8 text-white leading-[1.1]"
              variants={itemVariants}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              Custom Web Apps{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Built in Weeks
              </span>
            </motion.h1>
            
            {/* Subheadline - Linear style: One punchy sentence */}
            <motion.p 
              className="text-gray-400 text-2xl md:text-3xl mb-12 leading-relaxed font-light"
              variants={itemVariants}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            >
              Powerful tech, fast delivery.
            </motion.p>

            
            {/* CTA Button - Linear style: Glowing, confident */}
            <motion.div 
              className="mb-10"
              variants={itemVariants}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              <motion.button 
                onClick={scrollToContact} 
                className="group relative px-12 py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold text-xl rounded-2xl overflow-hidden shadow-glow-lg-blue hover:shadow-glow-lg-purple transition-all"
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  Get a Quote
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </span>
                {/* Animated gradient overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                {/* Animated shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "linear"
                  }}
                />
                {/* Glow pulse */}
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 blur-xl"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.button>
            </motion.div>
          </div>
          
          {/* 3D Dashboard Mockup - Linear style: Star of the show */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <Dashboard3D>
              <div className="p-8">
                {/* Simplified dashboard preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">Dashboard Preview</h3>
                      <p className="text-sm text-gray-400">Real-time project tracking</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Rocket className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[65, 80, 45].map((progress, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="text-xs text-gray-400 mb-2">Progress</div>
                        <div className="text-2xl font-bold text-white mb-2">{progress}%</div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ delay: 0.6 + i * 0.1, duration: 1 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-sm text-gray-300">Live updates</span>
                    </div>
                    <div className="text-xs text-gray-400">Project tracking in real-time</div>
                  </div>
                </div>
              </div>
            </Dashboard3D>
          </motion.div>
        </motion.div>
        
        {/* Floating Recent Wins Cards - Linear style: Parallax at different speeds */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            style={{ y: parallaxY1 }}
            className="absolute top-20 right-10 pointer-events-auto"
          >
            <MeltedCard 
              className="p-6 bg-white/5 backdrop-blur-xl border-white/20 shadow-glow-blue"
              delay={0.6}
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div 
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center"
                  animate={{
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      "0 0 0px rgba(59, 130, 246, 0)",
                      "0 0 20px rgba(59, 130, 246, 0.5)",
                      "0 0 0px rgba(59, 130, 246, 0)"
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </motion.div>
                <h3 className="text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent uppercase tracking-wider">
                  Win
                </h3>
              </div>
              <div className="text-xs text-gray-400 mb-2">e‑commerce</div>
              <div className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                +37%
              </div>
            </MeltedCard>
          </motion.div>
          
          <motion.div
            style={{ y: parallaxY2 }}
            className="absolute top-60 right-32 pointer-events-auto"
          >
            <MeltedCard 
              className="p-6 bg-white/5 backdrop-blur-xl border-white/20 shadow-glow-purple"
              delay={0.8}
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div 
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1.5
                  }}
                >
                  <Zap className="w-4 h-4 text-white" />
                </motion.div>
                <h3 className="text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent uppercase tracking-wider">
                  Speed
                </h3>
              </div>
              <div className="text-xs text-gray-400 mb-2">dashboard</div>
              <div className="font-bold text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                -48%
              </div>
            </MeltedCard>
          </motion.div>
          
          <motion.div
            style={{ y: parallaxY3 }}
            className="absolute bottom-40 right-20 pointer-events-auto"
          >
            <MeltedCard 
              className="p-6 bg-white/5 backdrop-blur-xl border-white/20 shadow-glow-pink"
              delay={1.0}
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div 
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                >
                  <Rocket className="w-4 h-4 text-white" />
                </motion.div>
                <h3 className="text-sm font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent uppercase tracking-wider">
                  Rating
                </h3>
              </div>
              <div className="text-xs text-gray-400 mb-2">mobile app</div>
              <div className="font-bold text-xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                4.8★
              </div>
            </MeltedCard>
          </motion.div>
        </div>
        <div id="count-up-trigger" className="absolute bottom-0 left-0 w-1 h-1 opacity-0" />
      </div>
    </section>
  )
}
