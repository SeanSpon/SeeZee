'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import ScrollAnimation from '@/components/shared/ScrollAnimation'
import StickyCTA from '@/components/shared/StickyCTA'
import ImageLightbox from '@/components/shared/ImageLightbox'
import { TechStrip } from '@/components/sections/tech-strip'
import { 
  FiArrowRight, 
  FiCheck, 
  FiBook, 
  FiHeart, 
  FiUsers, 
  FiShield,
  FiEye,
  FiTool,
  FiCalendar,
  FiMapPin
} from 'react-icons/fi'

export default function HomePage() {
  const [isBuffMode, setIsBuffMode] = useState(false)
  const [particles, setParticles] = useState<Array<{left: number, top: number, duration: number, delay: number}>>([])
  
  // Generate particles only on client to avoid hydration mismatch
  useEffect(() => {
    setParticles(
      [...Array(15)].map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 5,
      }))
    )
  }, [])
  
  return (
    <div className="w-full">
      <StickyCTA />
      
      {/* Hero Section - Enhanced Artistic Design */}
      <section className="bg-[#050914] py-20 sm:py-32 lg:py-40 relative overflow-hidden min-h-[85vh] sm:min-h-[90vh] flex items-center">
        {/* Multi-layer Animated Background */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-[#0a1128] via-[#0f172a] to-[#0a1128]"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ backgroundSize: '400% 400%' }}
        />
        
        {/* Animated Mesh Gradient Overlay */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-blue-500/10 via-transparent to-transparent blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.35, 0.2],
              x: ['-20%', '20%', '-20%'],
              y: ['-20%', '20%', '-20%'],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div 
            className="absolute bottom-0 right-0 w-full h-full bg-gradient-radial from-cyan-400/8 via-transparent to-transparent blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.15, 0.3, 0.15],
              x: ['20%', '-20%', '20%'],
              y: ['20%', '-20%', '20%'],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </div>
        
        {/* Dynamic Grid Pattern */}
        <motion.div 
          className="absolute inset-0 bg-grid-pattern bg-grid"
          animate={{
            opacity: [0.02, 0.06, 0.02],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Floating Elements */}
        {/* Big Red Bus Logo - Top Right */}
        <motion.div
          className="absolute top-20 right-[10%] hidden lg:block opacity-25"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Image
            src="/logos/seezee-logo.png"
            alt=""
            width={300}
            height={225}
            className="select-none"
            style={{ imageRendering: 'crisp-edges', width: 'auto', height: 'auto' }}
            priority
          />
        </motion.div>

        {/* Teal Circle - Bottom Left */}
        <motion.div
          className="absolute bottom-32 left-[8%] w-64 h-64 bg-gradient-to-br from-teal-500/12 to-cyan-500/12 rounded-full blur-3xl hidden lg:block"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.25, 0.4, 0.25],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Blue Glow - Top Left */}
        <motion.div
          className="absolute top-20 left-[5%] w-96 h-96 bg-gradient-to-br from-blue-500/15 to-indigo-500/12 rounded-full blur-3xl hidden lg:block"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.18, 0.32, 0.18],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        {/* Floating UI Screenshot - Left */}
        <motion.div
          className="absolute left-[5%] top-1/2 -translate-y-1/2 opacity-20 hidden xl:block"
          animate={{
            y: [-20, 20, -20],
            rotate: [-2, 2, -2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-64 h-48 bg-gray-800/70 rounded-lg border border-white/30 p-4">
            <div className="w-full h-3 bg-white/50 rounded mb-2"></div>
            <div className="w-3/4 h-3 bg-white/50 rounded mb-4"></div>
            <div className="w-full h-20 bg-white/30 rounded"></div>
          </div>
        </motion.div>

        {/* Floating Code Snippet - Right */}
        <motion.div
          className="absolute right-[5%] top-1/3 opacity-25 hidden xl:block"
          animate={{
            y: [20, -20, 20],
            rotate: [2, -2, 2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          <div className="w-72 h-40 bg-gray-900/70 rounded-lg border border-cyan-500/40 p-4 font-mono text-xs text-cyan-300">
            <div className="mb-1">{'<section className="...">'}</div>
            <div className="ml-4 mb-1">{'<h1>Build Tech</h1>'}</div>
            <div className="ml-4 mb-1">{'<p>That Works</p>'}</div>
            <div className="mb-1">{'</section>'}</div>
          </div>
        </motion.div>

        {/* Floating Math Formulas & Code Symbols */}
        {/* Math Formula 1 - Top Center */}
        <motion.div
          className="absolute top-32 left-[20%] opacity-15 hidden lg:block font-serif text-white/40 text-2xl"
          animate={{
            y: [0, -30, 0],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          ∫ f(x)dx = F(x) + C
        </motion.div>

        {/* Math Formula 2 - Right Side */}
        <motion.div
          className="absolute top-[45%] right-[15%] opacity-12 hidden lg:block font-serif text-purple-300/30 text-xl"
          animate={{
            x: [0, 20, 0],
            y: [0, -15, 0],
            opacity: [0.12, 0.2, 0.12],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        >
          lim<sub>x→∞</sub> (1 + 1/x)<sup>x</sup> = e
        </motion.div>

        {/* Math Formula 3 - Bottom Right */}
        <motion.div
          className="absolute bottom-[25%] right-[8%] opacity-10 hidden xl:block font-serif text-cyan-300/40 text-lg"
          animate={{
            y: [0, 25, 0],
            rotate: [0, 3, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
        >
          ∇²φ = ∂²φ/∂x² + ∂²φ/∂y²
        </motion.div>

        {/* Math Formula 4 - Left Side */}
        <motion.div
          className="absolute top-[60%] left-[12%] opacity-12 hidden lg:block font-serif text-red-300/30 text-xl"
          animate={{
            x: [-10, 10, -10],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        >
          E = mc² = γm₀c²
        </motion.div>

        {/* Code Symbol 1 - Top Left */}
        <motion.div
          className="absolute top-[35%] left-[8%] opacity-15 hidden xl:block font-mono text-green-300/40 text-sm"
          animate={{
            y: [0, -25, 0],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        >
          const build = (idea) =&gt; reality;
        </motion.div>

        {/* Math Symbol 5 - Bottom Left */}
        <motion.div
          className="absolute bottom-[35%] left-[18%] opacity-10 hidden lg:block font-serif text-orange-300/30 text-3xl"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          Σ
        </motion.div>

        {/* Math Formula 6 - Center Right */}
        <motion.div
          className="absolute top-[25%] right-[25%] opacity-12 hidden xl:block font-serif text-blue-300/35 text-lg"
          animate={{
            y: [0, 20, 0],
            x: [0, -15, 0],
          }}
          transition={{
            duration: 17,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 6,
          }}
        >
          ∂u/∂t = α∇²u
        </motion.div>

        {/* Code Symbol 2 - Middle Right */}
        <motion.div
          className="absolute top-[55%] right-[20%] opacity-15 hidden lg:block font-mono text-pink-300/40 text-xs"
          animate={{
            y: [0, -30, 0],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 19,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 7,
          }}
        >
          {'{ accessible: true, beautiful: true }'}
        </motion.div>

        {/* Math Symbol 7 - Top Right Corner */}
        <motion.div
          className="absolute top-[15%] right-[30%] opacity-10 hidden lg:block font-serif text-yellow-300/30 text-2xl"
          animate={{
            rotate: [0, -10, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 13,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          π ≈ 3.14159
        </motion.div>

        {/* Math Formula 8 - Lower Left */}
        <motion.div
          className="absolute bottom-[45%] left-[25%] opacity-12 hidden xl:block font-serif text-indigo-300/35 text-base"
          animate={{
            x: [0, 15, 0],
            opacity: [0.12, 0.22, 0.12],
          }}
          transition={{
            duration: 21,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 8,
          }}
        >
          √(a² + b²) = c
        </motion.div>

        {/* Code Symbol 3 - Bottom Center */}
        <motion.div
          className="absolute bottom-[30%] left-[40%] opacity-10 hidden lg:block font-mono text-teal-300/40 text-sm"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 9,
          }}
        >
          npm install empathy
        </motion.div>

        {/* Math Symbol 9 - Far Right */}
        <motion.div
          className="absolute top-[70%] right-[10%] opacity-15 hidden xl:block font-serif text-purple-300/40 text-4xl"
          animate={{
            rotate: [0, 5, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10,
          }}
        >
          ∞
        </motion.div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 0.5, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Main Content - Enhanced Typography */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-5xl">
          <div className="text-center">
            
            {/* Location Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-blue-500/10 border border-blue-400/25 rounded-full backdrop-blur-sm"
            >
              <FiMapPin className="w-4 h-4 text-blue-300" />
              <span className="text-blue-300 font-mono text-sm tracking-wide">Louisville, Kentucky</span>
            </motion.div>

            {/* Main Headline - Bold & Dramatic */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-heading font-black mb-6 sm:mb-8 leading-[1.1] px-2"
              style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
            >
              <span className="text-white">Your Community</span>
              <span className="text-white block mt-2">Technology Partner</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed font-light px-4"
            >
              Technical support, consulting, web development, and automation solutions for schools, nonprofits, and community organizations that need technology to be{' '}
              <span className="text-white font-semibold">reliable, accessible, and human</span>.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-4"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/start"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-10 py-4 sm:py-5 bg-[#ef4444] text-white rounded-lg font-bold text-base sm:text-lg shadow-lg hover:bg-[#dc2626] hover:shadow-xl transition-all duration-200 min-h-[48px] w-full sm:w-auto"
                >
                  Start Your Project
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/projects"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-10 py-4 sm:py-5 border-2 border-white/20 text-white rounded-lg hover:border-white hover:bg-white/5 transition-all duration-300 font-semibold text-base sm:text-lg backdrop-blur-sm min-h-[48px] w-full sm:w-auto"
                >
                  See Our Work
                </Link>
              </motion.div>
            </motion.div>

            {/* Proof Points - Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-wrap gap-4 justify-center max-w-3xl mx-auto"
            >
              {[
                { icon: <FiTool className="w-4 h-4" />, text: 'Hands-On Support' },
                { icon: <FiEye className="w-4 h-4" />, text: 'Accessibility-First' },
                { icon: <FiUsers className="w-4 h-4" />, text: 'Community Focused' },
                { icon: <FiHeart className="w-4 h-4" />, text: 'Long-Term Partnerships' },
              ].map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm hover:border-blue-400/40 transition-all duration-300"
                >
                  <span className="text-blue-400">{badge.icon}</span>
                  <span className="text-gray-300 text-sm font-medium">{badge.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="mt-20"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="inline-flex flex-col items-center gap-2 text-gray-500"
              >
                <span className="text-xs uppercase tracking-wider font-mono">Scroll to explore</span>
                <div className="w-6 h-10 border-2 border-gray-600 rounded-full p-1">
                  <motion.div
                    animate={{ y: [0, 12, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-1.5 h-3 bg-blue-400 rounded-full mx-auto"
                  />
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>

        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0f172a] to-transparent"></div>
      </section>

      {/* Built by Sean & Zach Section */}
      <section className="py-16 sm:py-20 bg-[#0f172a]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <ScrollAnimation>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
              {/* Photo */}
              <div className="flex justify-center lg:justify-start">
                <div className="relative w-full max-w-2xl">
                  <motion.div 
                    className="rounded-2xl overflow-hidden border-2 border-[#ef4444]/30 shadow-2xl hover:shadow-[#ef4444]/40 transition-all duration-300"
                    animate={{
                      scale: isBuffMode ? [1, 1.02, 1] : 1,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                  >
                    <ImageLightbox
                      src={isBuffMode ? "/sean-zach-gabe-buff.png" : "/sean-zach-photo.png"}
                      alt="Sean, Zach & Gabe"
                      width={700}
                      height={500}
                      className="w-full h-auto object-cover"
                      caption={isBuffMode ? "Zach (left), Sean (middle), BUFF Gabe (right) 💪" : "Zach (left), Sean (middle), Gabe (right)"}
                    />
                  </motion.div>
                  <p className="text-center text-gray-400 text-sm mt-3 italic">
                    Zach (left), Sean (middle), {isBuffMode ? "BUFF Gabe 💪" : "Gabe (right)"}
                  </p>
                </div>
              </div>

              {/* Text */}
              <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-gray-300 leading-relaxed px-2">
                <p className="text-xl text-white font-semibold">
                  We're Sean and Zach — your local technology partners based in Louisville.
                </p>
                <p>
                  We provide hands-on technical support, consulting, and custom solutions for organizations that need technology to work for real people.
                </p>
                <p>
                  <span className="text-white font-semibold">Sean leads technical support and system development</span>, with experience solving real-world technology problems, building accessible platforms, and providing on-site and remote support.
                </p>
                <p>
                  <span className="text-white font-semibold">Zach handles consulting and client relationships</span>, helping organizations make smart technology decisions and ensuring every solution actually fits their needs.
                </p>
                <p className="pt-2 border-t border-white/10">
                  We don't disappear after setup. We provide ongoing support, answer questions when you need help, and treat your organization like a long-term partner — not a one-time project.
                </p>
                <p className="text-sm text-gray-400 italic">
                  Gabe (the guy on the right) brings the{' '}
                  <motion.span
                    onClick={() => setIsBuffMode(!isBuffMode)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-[#ef4444] font-bold cursor-pointer hover:text-[#dc2626] transition-colors underline decoration-dotted"
                    title="Click me! 💪"
                  >
                    muscle
                  </motion.span>
                  {' '}to the team — handling the heavy lifting when projects need extra hands.
                </p>
              </div>
            </div>

            {/* Stats Cards - Enhanced */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto px-4">
              {[
                { icon: '🤝', title: 'Community Focused', subtitle: 'Serving schools & nonprofits' },
                { icon: '⚡', title: '<24 Hour', subtitle: 'Average response time' },
                { icon: '✅', title: 'Available Now', subtitle: 'Accepting new partners' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -8, scale: 1.05 }}
                  className="group p-8 rounded-2xl bg-gradient-to-br from-[#0a1128]/80 to-[#1a2332]/60 border-2 border-white/10 hover:border-[#ef4444]/60 transition-all duration-500 text-center shadow-2xl hover:shadow-[#ef4444]/30 backdrop-blur-xl relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#ef4444]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                  <motion.div 
                    className="text-6xl mb-4"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {stat.icon}
                  </motion.div>
                  <h3 className="text-xl font-heading font-bold text-white mb-2">{stat.title}</h3>
                  <p className="text-gray-400 text-sm">{stat.subtitle}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Who We Serve Section - Enhanced */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-[#0f172a] via-[#0a1128] to-[#0a1128] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/6 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-16 px-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-heading font-bold mb-4 sm:mb-6 text-white">
                Who We Partner With
              </h2>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                We work with community-focused organizations that need a trusted technology partner — not just a one-time vendor.
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto px-4">
            {[
              {
                icon: <FiBook className="w-12 h-12" />,
                title: 'Schools & Education',
                description: 'Technology support and systems for learning environments',
                color: 'text-sky-400',
                bgColor: 'bg-sky-400/10'
              },
              {
                icon: <FiHeart className="w-12 h-12" />,
                title: 'Nonprofits',
                description: 'Accessible solutions for mission-driven organizations',
                color: 'text-indigo-400',
                bgColor: 'bg-indigo-400/10'
              },
              {
                icon: <FiUsers className="w-12 h-12" />,
                title: 'Local Organizations',
                description: 'Community groups that need reliable technology help',
                color: 'text-emerald-400',
                bgColor: 'bg-emerald-400/10'
              },
              {
                icon: <FiShield className="w-12 h-12" />,
                title: 'Community Businesses',
                description: 'Local businesses serving their neighborhoods',
                color: 'text-teal-400',
                bgColor: 'bg-teal-400/10'
              },
            ].map((group, index) => (
              <ScrollAnimation key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="group p-8 rounded-xl border border-white/10 bg-white/5 hover:border-white/20 transition-all duration-300 hover:shadow-xl relative overflow-hidden"
                >
                  {/* Inner glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                  <div className="relative z-10">
                  <div className={`${group.color} ${group.bgColor} w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-transform duration-300 hover:scale-110`}>
                    {group.icon}
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-white mb-3">
                    {group.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    {group.description}
                  </p>
                  </div>
                </motion.div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* What We Provide Section - Enhanced */}
      <section className="py-16 sm:py-20 bg-[#0a1128] relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div 
          className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/8 to-blue-500/8 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/4 left-0 w-96 h-96 bg-gradient-to-br from-indigo-500/8 to-teal-500/8 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.18, 0.35, 0.18] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-16 px-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-heading font-bold mb-4 sm:mb-6 text-white">
                How We Help
              </h2>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                From hands-on support to custom software — technology solutions that actually work for your organization.
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto px-4">
            {[
              {
                icon: <FiTool className="w-14 h-14" />,
                title: 'Technical Support & Consulting',
                description: 'On-site and remote support for your technology needs. We help you make smart decisions, troubleshoot problems, and keep your systems running smoothly.',
                color: 'text-sky-400',
                borderColor: 'border-t-sky-400'
              },
              {
                icon: <FiEye className="w-14 h-14" />,
                title: 'Web Development & Systems',
                description: 'Custom websites, platforms, and business systems designed for accessibility and ease of use. Built with modern tools that are maintainable long-term.',
                color: 'text-emerald-400',
                borderColor: 'border-t-emerald-400'
              },
              {
                icon: <FiCalendar className="w-14 h-14" />,
                title: 'Automation & AI Solutions',
                description: 'Practical tools that save time and reduce manual work. Automated workflows, smart integrations, and AI-powered solutions built on trust and real-world needs.',
                color: 'text-indigo-400',
                borderColor: 'border-t-indigo-400'
              },
            ].map((item, index) => (
              <ScrollAnimation key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className={`group p-8 rounded-xl border border-white/10 border-t-4 ${item.borderColor} bg-white/5 hover:shadow-xl hover:border-white/20 transition-all duration-300 relative overflow-hidden`}
                >
                  <div className="relative z-10">
                  <div className={`${item.color} mb-6 flex justify-center`}>{item.icon}</div>
                  <h3 className="text-xl font-heading font-semibold text-white mb-4 text-center">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-center">
                    {item.description}
                  </p>
                  </div>
                </motion.div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <TechStrip />

      {/* Featured Project - Big Red Bus */}
      <section className="py-16 sm:py-20 bg-[#0f172a] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] to-[#0a1128]/50 opacity-50"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <ScrollAnimation>
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/15 border border-blue-400/30 rounded-full text-blue-300 text-sm font-semibold mb-6">
                    <FiHeart className="w-4 h-4" />
                    <span>Featured Project</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-heading font-bold text-white mb-4 sm:mb-6">
                    Big Red Bus
                  </h2>
                  <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-4 sm:mb-6">
                    Big Red Bus needed a platform that wouldn't overwhelm users dealing with mental health and brain health challenges. We designed everything for clarity first — not complexity.
                  </p>
                  <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-4 sm:mb-6">
                    A mental health and neuro-inclusive community platform connecting people with brain health challenges to resources, support groups, and community events.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      'Cognitive accessibility design (WCAG AA+)',
                      'Support group directory & scheduling',
                      'Event calendar with reminders',
                      'Resource library for mental health',
                      'Simple navigation, large fonts, minimal distractions'
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-300">
                        <FiCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/case-studies/big-red-bus"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-blue-600/50 transform hover:scale-105"
                  >
                    Read the Full Story
                    <FiArrowRight className="w-5 h-5" />
                  </Link>
                </div>
                <div className="rounded-xl p-8 bg-white/5 border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="aspect-video bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-xl flex items-center justify-center border border-slate-600/40 p-6">
                    <ImageLightbox
                      src="/logos/Stylized Red Bus Logo with Integrated Text.png"
                      alt="Big Red Bus Platform"
                      width={600}
                      height={450}
                      className="w-full h-auto"
                      priority
                      caption="Big Red Bus — Mental Health Community Platform"
                    />
                  </div>
                  <p className="text-center text-gray-400 text-sm mt-4 font-semibold">
                    Big Red Bus — Mental Health Community Platform
                  </p>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Featured Project 2: A Vision For You */}
      <section className="py-16 sm:py-20 bg-[#0a1128] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1128] to-[#0f172a]/50 opacity-50"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <ScrollAnimation>
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Screenshots First */}
                <div className="order-2 lg:order-1">
                  <div className="space-y-4">
                    {/* Main Screenshot */}
                    <div className="rounded-2xl overflow-hidden border-2 border-indigo-500/40 shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300">
                      <ImageLightbox 
                        src="/avfy-home.png" 
                        alt="A Vision For You Recovery Platform"
                        width={800}
                        height={600}
                        className="w-full h-auto"
                        caption="A Vision For You Recovery Platform - Homepage"
                      />
                    </div>
                    {/* Mini Gallery */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg overflow-hidden border border-indigo-500/30">
                        <ImageLightbox src="/avfy-programs.png" alt="Programs" width={300} height={200} className="w-full h-auto" caption="Recovery Programs Directory" />
                      </div>
                      <div className="rounded-lg overflow-hidden border border-indigo-500/30">
                        <ImageLightbox src="/avfy-donate.png" alt="Donation System" width={300} height={200} className="w-full h-auto" caption="Stripe Donation System" />
                      </div>
                      <div className="rounded-lg overflow-hidden border border-indigo-500/30">
                        <ImageLightbox src="/avfy-contact.png" alt="Contact" width={300} height={200} className="w-full h-auto" caption="Contact & Support" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="order-1 lg:order-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/15 border border-indigo-400/30 rounded-full text-indigo-300 text-sm font-semibold mb-6">
                    <FiHeart className="w-4 h-4" />
                    <span>Launching December 20, 2024</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-heading font-bold text-white mb-4">
                    A Vision For You Recovery
                  </h2>
                  <p className="text-xl text-[#b6e41f] font-mono mb-4">
                    Louisville, Kentucky 501(c)(3)
                  </p>
                  <p className="text-lg text-gray-300 leading-relaxed mb-6">
                    A comprehensive recovery center management platform serving 500+ individuals annually. We built a full-stack system with Stripe donations, program matching, meeting RSVPs, and automated email workflows.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      'Stripe payment system with impact visualization',
                      'Four recovery programs with detailed pathways',
                      'Department-routed contact system',
                      'Meeting management & automated reminders',
                      'Real-time donation impact calculator',
                      'Admin dashboard for staff operations'
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-300">
                        <FiCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-indigo-600/50 transform hover:scale-105"
                  >
                    View Full Project Details
                    <FiArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Our Approach Section */}
      <section className="py-16 sm:py-20 bg-[#0f172a]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-16 px-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-heading font-bold mb-4 sm:mb-6 text-white">
                Our Approach
              </h2>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                Three principles that guide how we work with every organization.
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto px-4">
            {[
              {
                emoji: '🤝',
                title: 'Support First',
                description: 'We start by understanding your real needs and providing hands-on help. Technology solutions work best when built on trust and genuine problem-solving.',
                bgColor: 'bg-sky-400/10',
                titleColor: 'text-sky-300'
              },
              {
                emoji: '💬',
                title: 'Clear Communication',
                description: 'No tech jargon, no confusing proposals. We explain everything in plain language and make sure you understand what we\'re doing and why it matters.',
                bgColor: 'bg-rose-400/10',
                titleColor: 'text-rose-300'
              },
              {
                emoji: '🛠️',
                title: 'Long-Term Partnership',
                description: 'We don\'t disappear after setup. We provide ongoing support, answer questions when you need help, and evolve your systems as your organization grows.',
                bgColor: 'bg-slate-400/10',
                titleColor: 'text-slate-300'
              },
            ].map((principle, index) => (
              <ScrollAnimation key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="p-8 rounded-xl border border-white/10 bg-white/5 hover:border-white/20 transition-all duration-300 hover:shadow-xl text-center"
                >
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={`text-7xl mb-6 inline-block w-24 h-24 flex items-center justify-center rounded-full ${principle.bgColor} transition-all duration-300`}
                  >
                    {principle.emoji}
                  </motion.div>
                  <h3 className={`text-xl font-heading font-semibold ${principle.titleColor} mb-3`}>
                    {principle.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {principle.description}
                  </p>
                </motion.div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Supporting Your Community Section */}
      <section className="py-16 sm:py-20 bg-[#0a1128]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <ScrollAnimation>
            <div className="max-w-4xl mx-auto text-center px-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-heading font-bold mb-4 sm:mb-6 text-white">
                Your organization deserves technology that actually works.
              </h2>
              <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-gray-300 leading-relaxed mb-8 sm:mb-10">
                <p>
                  Too many schools, nonprofits, and community organizations struggle with unreliable systems, confusing technology, and vendors who disappear after the sale.
                </p>
                <p>
                  We provide hands-on support, practical solutions, and long-term partnership — so you can focus on your mission, not your technology problems.
                </p>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-24 lg:py-32 bg-[#ef4444] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center px-2">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 sm:mb-6 text-white">
                Ready for a technology partner you can trust?
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-white/95 mb-8 sm:mb-12 leading-relaxed">
                Tell us about your organization. We'll listen, ask good questions, and show you how we can help — no pressure, no jargon, no sales pitch.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                <Link
                  href="/start"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-10 py-4 sm:py-5 bg-white text-[#ef4444] rounded-lg hover:bg-gray-100 transition-all duration-200 font-bold text-base sm:text-lg shadow-lg min-h-[48px] w-full sm:w-auto"
                >
                  Start Your Project
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/projects"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-10 py-4 sm:py-5 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-all duration-200 font-semibold text-base sm:text-lg min-h-[48px] w-full sm:w-auto"
                >
                  View Our Work
                </Link>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  )
}
