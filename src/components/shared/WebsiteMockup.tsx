'use client'

import { motion } from 'framer-motion'

interface WebsiteMockupProps {
  type?: 'starter' | 'business' | 'ecommerce'
  className?: string
}

export default function WebsiteMockup({ type = 'starter', className = '' }: WebsiteMockupProps) {
  const mockupStyles = {
    starter: {
      header: 'bg-gradient-to-r from-gray-700 to-gray-800',
      content: 'bg-gray-50',
      accent: 'bg-#ef4444',
    },
    business: {
      header: 'bg-gradient-to-r from-#ef4444 to-#dc2626',
      content: 'bg-white',
      accent: 'bg-#ef4444',
    },
    ecommerce: {
      header: 'bg-gradient-to-r from-purple-600 to-indigo-600',
      content: 'bg-gray-50',
      accent: 'bg-purple-600',
    },
  }

  const style = mockupStyles[type] || mockupStyles.starter

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative rounded-lg overflow-hidden shadow-large border-2 border-gray-700 ${className}`}
    >
      {/* Browser Chrome */}
      <div className="bg-gray-800 px-3 py-2 flex items-center gap-2 border-b border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="flex-1 bg-gray-700 rounded px-3 py-1 text-xs text-gray-400 text-center">
          yourbusiness.com
        </div>
      </div>

      {/* Website Content */}
      <div className={`${style.content} p-4`}>
        {/* Header/Navigation */}
        <div className={`${style.header} rounded-lg p-4 mb-4`}>
          <div className="flex items-center justify-between">
            <div className="h-6 w-24 bg-white/20 rounded"></div>
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-white/20 rounded"></div>
              <div className="h-6 w-16 bg-white/20 rounded"></div>
              <div className="h-6 w-16 bg-white/20 rounded"></div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mb-4">
          <div className={`${style.accent} h-32 rounded-lg mb-3 flex items-center justify-center`}>
            <div className="text-white text-center">
              <div className="h-4 w-48 bg-white/30 rounded mx-auto mb-2"></div>
              <div className="h-3 w-32 bg-white/20 rounded mx-auto"></div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
          <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
        </div>

        {/* Footer */}
        {type === 'business' && (
          <div className="mt-4 pt-4 border-t border-gray-300">
            <div className="h-3 w-40 bg-gray-300 rounded"></div>
          </div>
        )}

        {/* E-commerce specific elements */}
        {type === 'ecommerce' && (
          <div className="mt-4 space-y-2">
            <div className="h-8 bg-purple-100 rounded flex items-center justify-center">
              <div className="h-4 w-32 bg-purple-300 rounded"></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

