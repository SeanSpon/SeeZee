'use client'

import { motion } from 'framer-motion'

export default function FloatingShapes() {
  const shapes = [
    { size: 60, x: '10%', y: '20%', delay: 0, duration: 8 },
    { size: 40, x: '80%', y: '30%', delay: 1, duration: 10 },
    { size: 50, x: '20%', y: '70%', delay: 2, duration: 9 },
    { size: 35, x: '75%', y: '80%', delay: 0.5, duration: 11 },
    { size: 45, x: '50%', y: '10%', delay: 1.5, duration: 8 },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((shape, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full opacity-10"
          style={{
            width: shape.size,
            height: shape.size,
            left: shape.x,
            top: shape.y,
            background: 'linear-gradient(135deg, #C41E3A, #FFD700)',
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: shape.duration,
            delay: shape.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

