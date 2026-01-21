'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import ScrollAnimation from '@/components/shared/ScrollAnimation'
import { FiArrowRight, FiExternalLink } from 'react-icons/fi'
import { FaInstagram, FaFacebookF, FaTiktok } from 'react-icons/fa'

interface CaseStudy {
  id: string
  title: string
  subtitle: string
  description: string
  tags: string[]
  tech: string[]
  status: 'live' | 'launching-soon' | 'coming-soon'
  slug: string
  launchDate?: string
  thumbnail: {
    type: 'gradient' | 'image'
    gradient?: string
    icon?: string
    image?: string
  }
  websiteUrl?: string
}

// Client-side image component with fallback
function ClientImageWithFallback({ 
  src, 
  alt, 
  className,
  fallbackSrc = '/avatar-placeholder.svg'
}: { 
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
}) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  return (
    <Image
      src={hasError ? fallbackSrc : imgSrc}
      alt={alt}
      fill
      className={className}
      onError={() => {
        if (!hasError) {
          setHasError(true)
          setImgSrc(fallbackSrc)
        }
      }}
    />
  )
}

const caseStudies: CaseStudy[] = [
  {
    id: 'big-red-bus',
    title: 'Big Red Bus',
    subtitle: 'Community Platform for Mental Health & Recovery',
    description: 'A digital platform supporting Louisville\'s mental health community through organization discovery, event scheduling, and accessible resources. Built for FBLA competition and real community impact.',
    tags: ['FBLA Competition', 'Nonprofit Initiative'],
    tech: ['React', 'TypeScript', 'Vite', 'Accessible UI'],
    status: 'live',
    slug: 'big-red-bus',
    thumbnail: {
      type: 'gradient',
      gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)',
      icon: '🚌'
    }
  },
  {
    id: 'a-vision-for-you',
    title: 'A Vision For You',
    subtitle: 'Recovery Center Management Platform',
    description: 'Comprehensive platform helping a Louisville nonprofit serve 500+ community members through program management, donation processing, and impact tracking.',
    tags: ['Client Project', '501(c)(3) Nonprofit'],
    tech: ['Next.js 14', 'TypeScript', 'PostgreSQL', 'Prisma', 'Stripe'],
    status: 'live',
    slug: 'a-vision-for-you',
    thumbnail: {
      type: 'gradient',
      gradient: 'linear-gradient(135deg, #4c5f7a 0%, #3d5270 100%)',
      icon: '💜'
    },
    websiteUrl: 'https://avisionforyou.org'
  }
]

export default function PartnersPage() {
  return (
    <div className="w-full bg-[#0a1128]">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#0a1128] to-[#0f1825] py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollAnimation>
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              >
                Our Partners
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto"
              >
                Building meaningful connections with organizations that make a difference.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto mt-4"
              >
                We partner with mental health professionals, nonprofits, and community leaders
                to create digital solutions that truly serve their missions.
              </motion.p>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Featured Partner Section - Michael Robards */}
      <section className="bg-[#1a2332] py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-[#22d3ee]/10 to-[#0ea5e9]/5 border border-[#22d3ee]/20 rounded-[24px] p-8 lg:p-12 backdrop-blur-sm"
              >
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
                  {/* Partner Image */}
                  <div className="relative w-48 h-48 lg:w-64 lg:h-64 rounded-full overflow-hidden border-4 border-[#22d3ee]/30 shadow-2xl shadow-[#22d3ee]/10 flex-shrink-0">
                    <ClientImageWithFallback
                      src="/michael-building-1.png"
                      alt="Michael Robards - Licensed Clinical Social Worker"
                      className="object-cover"
                    />
                  </div>

                  {/* Partner Info */}
                  <div className="flex-1 text-center lg:text-left">
                    <span className="inline-block px-4 py-1.5 text-sm font-semibold bg-[#22d3ee]/20 text-[#22d3ee] rounded-full mb-4">
                      Featured Partner
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                      Michael Robards
                    </h2>
                    <p className="text-xl text-[#22d3ee] font-medium mb-4">
                      Licensed Clinical Social Worker (LCSW)
                    </p>
                    <p className="text-gray-300 leading-relaxed mb-6 max-w-2xl">
                      Michael Robards is a dedicated Licensed Clinical Social Worker specializing in 
                      mental health and recovery services. Through The Human Equation, Michael provides 
                      compassionate support and professional guidance to individuals on their journey 
                      toward wellness and personal growth.
                    </p>

                    {/* The Human Equation */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                      <h3 className="text-lg font-semibold text-white mb-2">The Human Equation</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        A mental health and wellness practice focused on providing holistic support 
                        for individuals seeking balance, healing, and personal development.
                      </p>
                    </div>

                    {/* Social & Website Links */}
                    <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                      <a
                        href="https://www.instagram.com/thehumanequation"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <FaInstagram className="w-5 h-5" />
                        <span className="text-sm font-medium">Instagram</span>
                      </a>
                      <a
                        href="https://www.facebook.com/thehumanequation"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <FaFacebookF className="w-4 h-4" />
                        <span className="text-sm font-medium">Facebook</span>
                      </a>
                      <a
                        href="https://www.tiktok.com/@thehumanequation"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:opacity-90 transition-opacity border border-white/20"
                      >
                        <FaTiktok className="w-4 h-4" />
                        <span className="text-sm font-medium">TikTok</span>
                      </a>
                    </div>

                    {/* Website Links */}
                    <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-4">
                      <a
                        href="https://humanequation.live"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[#22d3ee] hover:text-white transition-colors"
                      >
                        <FiExternalLink className="w-4 h-4" />
                        <span className="text-sm font-medium">humanequation.live</span>
                      </a>
                      <a
                        href="https://michaelarobards.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[#22d3ee] hover:text-white transition-colors"
                      >
                        <FiExternalLink className="w-4 h-4" />
                        <span className="text-sm font-medium">michaelarobards.com</span>
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="bg-[#0a1128] py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Partner Projects
              </h2>
              <p className="text-lg text-gray-400">
                Real projects built with and for our partners and community organizations.
              </p>
            </div>
          </ScrollAnimation>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {caseStudies.map((study, index) => (
                <ScrollAnimation key={study.id} delay={index * 0.1}>
                  <motion.div
                    whileHover={study.status === 'live' ? { y: -8 } : {}}
                    className={`bg-white/5 border border-white/10 rounded-[20px] overflow-hidden transition-all duration-300 ${
                      study.status === 'live' 
                        ? 'hover:shadow-2xl hover:shadow-[#22d3ee]/10 hover:border-[#22d3ee]/30' 
                        : 'opacity-90'
                    }`}
                  >
                    {/* Thumbnail Area */}
                    <div 
                      className="h-[220px] flex items-center justify-center relative"
                      style={{
                        background: study.thumbnail.gradient
                      }}
                    >
                      {study.thumbnail.type === 'gradient' && study.thumbnail.icon && (
                        <div className="text-7xl">{study.thumbnail.icon}</div>
                      )}
                      
                      {/* Status Badge Overlay */}
                      {study.status === 'live' && (
                        <div className="absolute top-4 right-4">
                          <div className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 text-green-300 rounded-full text-xs font-semibold backdrop-blur-sm">
                            Live
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content Area */}
                    <div className="p-6">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {study.tags.map((tag, idx) => (
                          <span 
                            key={idx}
                            className="px-2.5 py-1 text-xs border border-[#22d3ee]/40 text-[#22d3ee] rounded-full bg-[#22d3ee]/10"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-white mb-2">
                        {study.title}
                      </h3>

                      {/* Subtitle */}
                      <p className="text-sm text-gray-300 mb-3">
                        {study.subtitle}
                      </p>

                      {/* Description */}
                      <p className="text-sm text-gray-400 leading-relaxed mb-4">
                        {study.description}
                      </p>

                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {study.tech.slice(0, 4).map((tech, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-0.5 text-xs border border-white/20 text-gray-400 rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      {/* CTA Button */}
                      {study.status === 'live' && (
                        <Link
                          href={`/case-studies/${study.slug}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#22d3ee] hover:bg-[#06b6d4] text-[#0a1128] rounded-lg transition-all duration-300 font-semibold text-sm w-full justify-center transform hover:scale-105"
                        >
                          View Case Study
                          <FiArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </motion.div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="bg-[#1a2332] py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Become a Partner
              </h2>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Are you a mental health professional, nonprofit, or community organization 
                looking to expand your digital presence? Let's talk about how we can work together.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#22d3ee] hover:bg-[#06b6d4] text-[#0a1128] rounded-lg transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-[#22d3ee]/40 transform hover:scale-105"
              >
                Get in Touch
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Credit Footer */}
      <div className="bg-[#0a1128] py-6 text-center">
        <p className="text-xs text-gray-500/50 italic">
          page designed by gabe brown
        </p>
      </div>
    </div>
  )
}
