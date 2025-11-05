"use client"

import { motion, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion"
import { useRef } from "react"

interface Dashboard3DProps {
  children: React.ReactNode
  className?: string
}

export function Dashboard3D({ children, className = "" }: Dashboard3DProps) {
  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  // Scroll-based rotation
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // Smooth spring animations
  const springConfig = { damping: 25, stiffness: 200 }
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig)
  
  // Scroll-based rotation (subtle)
  const scrollRotateX = useTransform(scrollYProgress, [0, 1], [0, 5])
  const scrollRotateY = useTransform(scrollYProgress, [0, 1], [0, -5])
  
  // Combine mouse and scroll rotations
  const finalRotateX = useTransform(
    [rotateX, scrollRotateX],
    ([r, s]: number[]) => (r || 0) + (s || 0)
  )
  const finalRotateY = useTransform(
    [rotateY, scrollRotateY],
    ([r, s]: number[]) => (r || 0) + (s || 0)
  )

  // Scale based on scroll
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    mouseX.set((e.clientX - centerX) / rect.width)
    mouseY.set((e.clientY - centerY) / rect.height)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`perspective-1000 ${className}`}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        style={{
          rotateX: finalRotateX,
          rotateY: finalRotateY,
          scale,
          transformStyle: "preserve-3d",
        }}
        className="relative"
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Main content with glow border */}
        <div className="relative rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-blue-500/20 overflow-hidden">
          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500 blur-sm" />
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

