'use client'

import { motion } from 'framer-motion'

interface ProjectMockupProps {
  projectName: string
  type?: 'big-red-prints' | 'big-red-bus' | 'default'
}

export default function ProjectMockup({ projectName, type = 'default' }: ProjectMockupProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 3)
  }

  // Red Head Printing E-Commerce Mockup
  const RedHeadPrintingMockup = () => (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Browser Chrome */}
      <div className="bg-gray-800 px-3 py-2 flex items-center gap-2 border-b border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="flex-1 bg-gray-700 rounded px-3 py-1 text-xs text-gray-400 text-center">
          redheadprinting.com
        </div>
      </div>

      {/* Website Content */}
      <div className="bg-gray-50 p-4">
        {/* Navigation */}
        <div className="bg-white rounded-lg p-3 mb-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="h-6 w-32 bg-red-600 rounded"></div>
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-gray-200 rounded"></div>
              <div className="h-5 w-16 bg-gray-200 rounded"></div>
              <div className="h-5 w-16 bg-gray-200 rounded"></div>
              <div className="h-5 w-12 bg-red-600 rounded"></div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 mb-4 border border-red-200">
          <div className="h-3 w-48 bg-red-600 rounded mx-auto mb-2"></div>
          <div className="h-2 w-64 bg-red-400 rounded mx-auto mb-3"></div>
          <div className="h-8 w-32 bg-red-600 rounded mx-auto"></div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="h-20 bg-gray-200"></div>
              <div className="p-2">
                <div className="h-2 w-20 bg-gray-300 rounded mb-1"></div>
                <div className="h-3 w-16 bg-red-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-2">
          <div className="h-12 bg-white rounded border border-gray-200"></div>
          <div className="h-12 bg-white rounded border border-gray-200"></div>
          <div className="h-12 bg-white rounded border border-gray-200"></div>
        </div>
      </div>
    </div>
  )

  // Big Red Bus Nonprofit Directory Mockup
  const BigRedBusMockup = () => (
    <div className="bg-[#FFF6E9] rounded-lg overflow-hidden">
      {/* Browser Chrome */}
      <div className="bg-gray-800 px-3 py-2 flex items-center gap-2 border-b border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="flex-1 bg-gray-700 rounded px-3 py-1 text-xs text-gray-400 text-center">
          bigredbus.org
        </div>
      </div>

      {/* Website Content */}
      <div className="p-4">
        {/* Navigation */}
        <div className="bg-white rounded-lg p-3 mb-4 border border-[#CDE1D1]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#D64545] rounded"></div>
              <div className="h-5 w-24 bg-[#2F2F2F] rounded"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-[#CDE1D1] rounded"></div>
              <div className="h-5 w-16 bg-[#CDE1D1] rounded"></div>
              <div className="h-5 w-16 bg-[#D64545] rounded"></div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-lg p-4 mb-4 border border-[#CDE1D1]">
          <div className="h-4 w-56 bg-[#D64545] rounded mx-auto mb-2"></div>
          <div className="h-3 w-48 bg-[#8C8C8C] rounded mx-auto mb-3"></div>
          <div className="flex gap-2 justify-center">
            <div className="h-7 w-24 bg-[#D64545] rounded"></div>
            <div className="h-7 w-24 bg-[#CDE1D1] rounded"></div>
          </div>
        </div>

        {/* Mission Cards */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-2 border border-[#CDE1D1]">
              <div className="w-8 h-8 bg-[#D64545] rounded-full mx-auto mb-2"></div>
              <div className="h-2 w-16 bg-[#2F2F2F] rounded mx-auto mb-1"></div>
              <div className="h-1.5 w-20 bg-[#8C8C8C] rounded mx-auto"></div>
            </div>
          ))}
        </div>

        {/* Directory Preview */}
        <div className="bg-white rounded-lg p-3 border border-[#CDE1D1]">
          <div className="h-3 w-32 bg-[#2F2F2F] rounded mb-2"></div>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-2">
                <div className="w-12 h-12 bg-[#BFD8F2] rounded"></div>
                <div className="flex-1">
                  <div className="h-2 w-24 bg-[#2F2F2F] rounded mb-1"></div>
                  <div className="h-1.5 w-32 bg-[#8C8C8C] rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const mockupStyles = {
    'big-red-prints': {
      gradient: 'from-red-600 via-red-500 to-red-700',
      accent: 'bg-red-500',
      text: 'text-red-100',
    },
    'big-red-bus': {
      gradient: 'from-red-700 via-red-600 to-red-800',
      accent: 'bg-red-600',
      text: 'text-red-100',
    },
    default: {
      gradient: 'from-gray-600 via-gray-500 to-gray-700',
      accent: 'bg-gray-500',
      text: 'text-gray-100',
    },
  }

  const style = mockupStyles[type] || mockupStyles.default

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative rounded-lg overflow-hidden shadow-large border-2 border-gray-700"
    >
      {/* Work in Progress Badge */}
      <div className="absolute top-2 right-2 z-20">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-medium"
        >
          IN PROGRESS
        </motion.div>
      </div>

      {/* Render specific mockup based on type */}
      {type === 'big-red-prints' ? (
        <RedHeadPrintingMockup />
      ) : type === 'big-red-bus' ? (
        <BigRedBusMockup />
      ) : (
        // Default mockup
        <div>
          <div className="bg-gray-800 px-3 py-2 flex items-center gap-2 border-b border-gray-700">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex-1 bg-gray-700 rounded px-3 py-1 text-xs text-gray-400 text-center">
              {projectName.toLowerCase().replace(/\s+/g, '')}.com
            </div>
          </div>
          <div className={`bg-gradient-to-br ${style.gradient} p-6 relative overflow-hidden`}>
            <div className="relative z-10 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-8 w-32 bg-white/20 rounded backdrop-blur-sm"></div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-white/20 rounded backdrop-blur-sm"></div>
                  <div className="h-6 w-16 bg-white/20 rounded backdrop-blur-sm"></div>
                </div>
              </div>
            </div>
            <div className="relative z-10 text-center mb-4">
              <div className={`inline-block px-6 py-3 ${style.accent} rounded-lg mb-3 shadow-medium`}>
                <div className="text-4xl font-bold text-white mb-2">
                  {getInitials(projectName)}
                </div>
              </div>
              <div className="h-4 w-48 bg-white/30 rounded mx-auto mb-2"></div>
              <div className="h-3 w-32 bg-white/20 rounded mx-auto"></div>
            </div>
            <div className="relative z-10 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="h-20 bg-white/20 rounded backdrop-blur-sm"></div>
                <div className="h-20 bg-white/20 rounded backdrop-blur-sm"></div>
                <div className="h-20 bg-white/20 rounded backdrop-blur-sm"></div>
              </div>
              <div className="h-24 bg-white/15 rounded backdrop-blur-sm"></div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

