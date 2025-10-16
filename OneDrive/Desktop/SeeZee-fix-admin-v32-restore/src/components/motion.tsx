"use client"
import { motion, HTMLMotionProps } from "framer-motion"
import { ReactNode } from "react"

interface FadeInProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function FadeIn({ children, delay = 0, className = "" }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface GlowingTextProps {
  children: ReactNode
  className?: string
}

export function GlowingText({ children, className = "" }: GlowingTextProps) {
  return (
    <motion.div
      className={`relative inline-block ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl"></div>
      <div className="relative bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        {children}
      </div>
    </motion.div>
  )
}

interface MeltedCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode
  delay?: number
}

export function MeltedCard({ children, delay = 0, className = "", ...props }: MeltedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface CinematicBackgroundProps {
  children: ReactNode
  className?: string
}

export function CinematicBackground({ children, className = "" }: CinematicBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        {children}
      </motion.div>
    </div>
  )
}