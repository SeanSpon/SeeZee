'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import ScrollAnimation from '@/components/shared/ScrollAnimation'
import ImageLightbox from '@/components/shared/ImageLightbox'
import { FiCheck, FiExternalLink, FiGithub, FiFolder, FiChevronRight, FiX, FiArrowLeft } from 'react-icons/fi'

/* ──────────────────────────────────────────────
   Project Data
   ────────────────────────────────────────────── */

interface ProjectStat {
  number: string
  label: string
  sublabel: string
}

interface ProjectScreenshot {
  src: string
  label: string
  alt: string
}

interface ProjectData {
  id: string
  name: string
  oneliner: string
  tags: string[]
  status: 'live' | 'deployed' | 'offline'
  statusLabel: string
  featured?: boolean
  accentColor: string
  accentBorder: string
  accentBg: string
  accentText: string
  pillTechs: string[]
  description: string[]
  problemText?: string
  solutionText?: string
  whyMatters?: string
  missionQuote?: { text: string; attribution: string }
  disclaimer?: string
  features: string[]
  featuresLabel?: string
  techStack: string[]
  stats?: ProjectStat[]
  screenshots?: ProjectScreenshot[]
  screenshotsLabel?: string
  liveUrl?: string
  liveLabel?: string
  githubUrl: string
  caseStudyUrl?: string
  socialLinks?: { platform: string; handle: string }[]
}

const projects: ProjectData[] = [
  {
    id: 'clipbot',
    name: 'ClipBot',
    oneliner: 'AI Video Director -- Automated Multi-Camera Editing System',
    tags: ['Featured', 'AI System', 'Open Source'],
    status: 'live',
    statusLabel: 'Live -- Active Development',
    featured: true,
    accentColor: 'purple',
    accentBorder: 'border-purple-500/30',
    accentBg: 'bg-purple-500/10',
    accentText: 'text-purple-300',
    pillTechs: ['Next.js', 'AI', 'Python'],
    description: [
      'An AI-powered system that analyzes long-form video, detects the strongest moments, generates scene-by-scene editing directions, and scores clips for virality -- automatically.',
    ],
    problemText:
      'Video and podcast content takes hours to review manually. Finding strong clips is slow and inconsistent. Editing multi-camera footage requires expensive software and expertise.',
    solutionText:
      'An AI-powered system that analyzes long-form video, detects the strongest moments, generates scene-by-scene editing directions, and scores clips for virality -- automatically.',
    whyMatters:
      'This project demonstrates our ability to build real AI-assisted tools, design automation pipelines, and integrate multiple AI providers into a production system.',
    features: [
      'Multi-provider AI Director (Anthropic, OpenAI, Gemini)',
      'Automated transcript analysis & speaker diarization',
      'Scene-by-scene shot list generation',
      'AI virality scoring (0-100)',
      'Multi-camera footage support',
      'Real-time job processing with SSE',
      'Video rendering pipeline',
      'Project management dashboard',
    ],
    techStack: [
      'Next.js',
      'Python / FastAPI',
      'Prisma',
      'Turborepo',
      'Anthropic API',
      'OpenAI API',
      'Gemini API',
      'Docker',
      'SSE Streaming',
    ],
    liveUrl: 'https://clipbot-neon.vercel.app',
    liveLabel: 'Try ClipBot',
    githubUrl: 'https://github.com/SeanSpon/clipbot',
  },
  {
    id: 'seezee',
    name: 'SeeZee Studios Platform',
    oneliner: 'Internal Operations, Client Portal & Business Management System',
    tags: ['Internal System', 'Operations Platform'],
    status: 'live',
    statusLabel: 'Live -- seezeestudios.com',
    accentColor: 'cyan',
    accentBorder: 'border-cyan-500/30',
    accentBg: 'bg-cyan-500/10',
    accentText: 'text-cyan-300',
    pillTechs: ['Next.js', 'TypeScript', 'Prisma'],
    description: [
      'The centralized system that runs SeeZee Studios. Manages client projects, internal workflows, financial tracking, team operations, and communication -- all in one platform.',
      'Built from scratch to support AI integration, automation, and long-term scalability. This is the system we use daily to manage every client engagement.',
    ],
    features: [
      'Client portal with project dashboards',
      'Admin command center (40+ admin modules)',
      'CEO analytics & financial dashboard',
      'Onboarding questionnaire system',
      'AI-powered commit analysis',
      'Real-time notification system',
      'Role-based access (client / admin / CEO)',
      'Invoice & billing management',
      'Lead pipeline & CRM',
      'Internal chat & messaging',
    ],
    techStack: [
      'Next.js 16',
      'TypeScript',
      'Prisma',
      'PostgreSQL',
      'NextAuth',
      'Tailwind CSS',
      'Framer Motion',
      'Vercel',
      'OpenAI API',
    ],
    stats: [
      { number: '39+', label: 'Database Models', sublabel: 'Full relational schema' },
      { number: '283', label: 'API Routes', sublabel: 'Server-side endpoints' },
      { number: '40+', label: 'Admin Modules', sublabel: 'Operations coverage' },
      { number: '3', label: 'Role-Based Portals', sublabel: 'Client / Admin / CEO' },
    ],
    liveUrl: 'https://seezeestudios.com',
    liveLabel: 'Visit Platform',
    githubUrl: 'https://github.com/SeanSpon/SeeZee',
  },
  {
    id: 'avisionforyou',
    name: 'A Vision For You',
    oneliner: 'Operations Dashboard & Data Platform for 501(c)(3) Nonprofit',
    tags: ['Client System', '501(c)(3) Nonprofit'],
    status: 'deployed',
    statusLabel: 'Vercel Preview',
    accentColor: 'blue',
    accentBorder: 'border-blue-500/30',
    accentBg: 'bg-blue-500/10',
    accentText: 'text-blue-300',
    pillTechs: ['Next.js', 'TypeScript', 'Square'],
    description: [
      'An accessible operations dashboard that centralizes data, automates donation processing, and gives staff clear visibility across all programs. Designed for clarity and long-term support.',
    ],
    problemText:
      'A growing nonprofit needed a modern system to manage operations, track community members, process donations, and coordinate four distinct program pathways -- without technical complexity.',
    solutionText:
      'An accessible operations dashboard that centralizes data, automates donation processing, and gives staff clear visibility across all programs. Designed for clarity and long-term support.',
    missionQuote: {
      text: 'To empower the homeless, individuals facing challenges, and those seeking support to lead productive lives through housing, education, self-help, programs, or any other available resource.',
      attribution: 'A Vision For You (Client Organization)',
    },
    disclaimer:
      'SeeZee Studio does not provide medical, mental health, or recovery services. We design and maintain software platforms for organizations that do.',
    features: [
      'Client assessment & intake system',
      'Meeting & RSVP management',
      'Donation processing (Square)',
      'Impact dashboard & reporting',
      'Admissions pipeline',
      'Content management system',
      'Email automation',
      'Member management',
      'Role-based access control',
    ],
    techStack: ['Next.js 14', 'TypeScript', 'PostgreSQL', 'Prisma', 'NextAuth', 'Square', 'Resend'],
    stats: [
      { number: '500+', label: 'Community Members', sublabel: 'Operations supported annually' },
      { number: '24/7', label: 'Donation Processing', sublabel: 'Automated acknowledgment' },
      { number: '4', label: 'Program Pathways', sublabel: 'Distinct offerings' },
      { number: '25', label: 'Database Models', sublabel: 'Full platform architecture' },
    ],
    screenshots: [
      { src: '/avfy-home.png', label: 'Homepage', alt: 'Homepage' },
      { src: '/avfy-programs.png', label: 'Programs', alt: 'Programs Dashboard' },
      { src: '/avfy-donate.png', label: 'Donations', alt: 'Donation System' },
    ],
    screenshotsLabel: 'Platform Preview',
    liveUrl: 'https://avisionforyou-57fekftr7-zach-robards-projects.vercel.app/',
    liveLabel: 'View Preview',
    githubUrl: 'https://github.com/SeanSpon/avisionforyou',
    caseStudyUrl: '/case-studies/a-vision-for-you',
  },
  {
    id: 'bigredbus',
    name: 'Big Red Bus',
    oneliner: 'Community Resource & Accessibility Platform',
    tags: ['Community Platform', 'Nonprofit Initiative'],
    status: 'live',
    statusLabel: 'Live',
    accentColor: 'blue',
    accentBorder: 'border-blue-500/30',
    accentBg: 'bg-blue-500/10',
    accentText: 'text-blue-300',
    pillTechs: ['React', 'TypeScript', 'Vite'],
    description: [
      'Big Red Bus is a Louisville-based nonprofit initiative using a physical bus to bring community resources, accessibility support, and connection directly to those who need it.',
      'We built a digital platform to help organizations like Big Red Bus connect with their communities -- organization search, event discovery, and accessible design throughout.',
    ],
    features: [
      'Organization directory and search',
      'Event discovery and community resources',
      'Support group information',
      'Review and engagement system',
      'Accessible, cognitive-friendly design',
      'Mobile-first responsive layout',
    ],
    featuresLabel: 'Platform Features',
    techStack: ['React', 'TypeScript', 'Vite', 'Accessible UI'],
    screenshots: [
      { src: '/big-red-bus-1.png', label: 'Homepage', alt: 'Homepage' },
      { src: '/big-red-bus-2.png', label: 'Directory', alt: 'Organization Directory' },
      { src: '/big-red-bus-3.png', label: 'About', alt: 'About Page' },
    ],
    screenshotsLabel: 'Platform Interface',
    liveUrl: 'https://fbla-coding-and-programming-web.vercel.app/',
    liveLabel: 'View Live Platform',
    githubUrl: 'https://github.com/SeanSpon/FBLA-Coding-And-Programming',
    caseStudyUrl: '/case-studies/big-red-bus',
    socialLinks: [
      { platform: 'Instagram', handle: '@brb.bigredbus' },
      { platform: 'TikTok', handle: '@bigredbus' },
    ],
  },
  {
    id: 'taxfeeder',
    name: 'TaxFeeder Software',
    oneliner: 'Professional Tax Preparation Software for Preparers & Firms',
    tags: ['Client System', 'SaaS Platform'],
    status: 'live',
    statusLabel: 'Live -- Production',
    accentColor: 'blue',
    accentBorder: 'border-blue-500/30',
    accentBg: 'bg-blue-500/10',
    accentText: 'text-blue-300',
    pillTechs: ['Next.js', 'TypeScript', 'Stripe'],
    description: [
      'A full-featured tax preparation software platform built for tax professionals at all levels -- from solo preparers to multi-office firms.',
      'Handles IRS-authorized e-filing across all 50 states, built-in compliance checks, office management tools, and bank product integrations.',
    ],
    problemText:
      'Tax preparation firms need reliable, scalable software that handles e-filing, compliance, multi-preparer management, and bank product integrations -- without the complexity and hidden costs of legacy solutions.',
    solutionText:
      'A modern web-based tax preparation platform with fast data entry, IRS-authorized e-filing for all 50 states, built-in compliance checks, and scalable architecture that grows with the firm.',
    features: [
      'IRS-authorized e-file (federal + all 50 states)',
      'Fast, intuitive data entry and preparation',
      'Built-in compliance checks',
      'Multi-preparer office management',
      'Bank product integrations (refund transfers, advances)',
      'White-label reseller program',
      'Reporting dashboards for office owners',
      'Year-round support',
    ],
    techStack: ['Next.js', 'TypeScript', 'Stripe', 'Vercel', 'Tailwind CSS'],
    stats: [
      { number: '50', label: 'States Supported', sublabel: 'Full federal & state coverage' },
      { number: '3', label: 'User Tiers', sublabel: 'Preparer / Owner / Reseller' },
    ],
    liveUrl: 'https://nextjs-boilerplate-six-amber-27.vercel.app/',
    liveLabel: 'Visit TaxFeeder',
    githubUrl: 'https://github.com/SeanSpon/SeeZee',
  },
]

/* ──────────────────────────────────────────────
   Status helpers
   ────────────────────────────────────────────── */

function statusDotColor(status: ProjectData['status']) {
  switch (status) {
    case 'live':
      return 'bg-emerald-400'
    case 'deployed':
      return 'bg-blue-400'
    case 'offline':
      return 'bg-amber-400'
  }
}

function statusBadge(project: ProjectData) {
  switch (project.status) {
    case 'live':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-full text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {project.statusLabel}
        </span>
      )
    case 'deployed':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 border border-blue-400/40 text-blue-300 rounded-full text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          {project.statusLabel}
        </span>
      )
    case 'offline':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 rounded-full text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          {project.statusLabel}
        </span>
      )
  }
}

/* ──────────────────────────────────────────────
   Page Component
   ────────────────────────────────────────────── */

export default function ProjectsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const expandedProject = projects.find((p) => p.id === expandedId) ?? null

  return (
    <div className="w-full bg-[#0a1128]">
      {/* ========================================
          HERO -- Terminal Path
          ======================================== */}
      <section className="bg-[#0a1128] py-20 relative overflow-hidden">
        {/* Subtle tech grid background */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, #22d3ee 1px, transparent 1px),
                linear-gradient(to bottom, #22d3ee 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.03]"
            style={{
              background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)',
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollAnimation>
            <div className="max-w-4xl mx-auto text-center">
              {/* Terminal path */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 bg-white/[0.04] border border-white/10 rounded-lg font-mono text-sm"
              >
                <span className="text-emerald-400">~</span>
                <span className="text-white/40">/</span>
                <span className="text-cyan-300">seezee-studios</span>
                <span className="text-white/40">/</span>
                <span className="text-white">projects</span>
                <span className="w-2 h-4 bg-cyan-400/80 animate-pulse ml-1" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
              >
                Project Directory
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto"
              >
                AI systems, dashboards, and automation tools we&apos;ve built.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-base text-gray-400 max-w-2xl mx-auto mt-4"
              >
                We design and integrate modern systems that organizations actually use &mdash; not just concepts.
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-6 text-sm text-gray-500 font-mono"
              >
                {projects.length} projects &middot; {projects.filter((p) => p.status === 'live').length} live
              </motion.div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* ========================================
          PROJECT DIRECTORY / EXPANDED VIEW
          ======================================== */}
      <section className="bg-[#1a2332] py-16 min-h-[60vh]">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatePresence mode="wait">
            {/* ── DIRECTORY GRID (collapsed) ── */}
            {!expandedProject && (
              <motion.div
                key="directory"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Directory header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/10 rounded-lg font-mono text-sm">
                    <FiFolder className="w-4 h-4 text-cyan-400" />
                    <span className="text-gray-300">projects/</span>
                    <span className="text-gray-500 ml-2">{projects.length} items</span>
                  </div>
                </div>

                {/* Folder cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((project, index) => (
                    <ScrollAnimation key={project.id} delay={index * 0.08}>
                      <motion.button
                        onClick={() => setExpandedId(project.id)}
                        className="w-full text-left group"
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.995 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      >
                        <div
                          className={`relative bg-white/[0.03] border ${
                            project.featured ? 'border-purple-500/30' : 'border-white/10'
                          } rounded-xl p-5 hover:border-white/25 hover:bg-white/[0.05] transition-all duration-300 overflow-hidden`}
                        >
                          {/* Featured shimmer accent */}
                          {project.featured && (
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />
                          )}

                          <div className="flex items-start gap-4">
                            {/* Folder icon */}
                            <div
                              className={`flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center ${
                                project.featured
                                  ? 'bg-purple-500/15 border border-purple-500/25'
                                  : 'bg-white/[0.06] border border-white/10'
                              } group-hover:border-white/20 transition-colors duration-300`}
                            >
                              <svg
                                width="22"
                                height="20"
                                viewBox="0 0 22 20"
                                fill="none"
                                className={`${
                                  project.featured ? 'text-purple-400' : 'text-cyan-400'
                                } group-hover:scale-110 transition-transform duration-300`}
                              >
                                <path
                                  d="M1 4C1 2.89543 1.89543 2 3 2H8.17157C8.70201 2 9.21071 2.21071 9.58579 2.58579L10.4142 3.41421C10.7893 3.78929 11.298 4 11.8284 4H19C20.1046 4 21 4.89543 21 6V16C21 17.1046 20.1046 18 19 18H3C1.89543 18 1 17.1046 1 16V4Z"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  fill="currentColor"
                                  fillOpacity="0.1"
                                />
                              </svg>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-base font-semibold text-white truncate">
                                  {project.name}
                                </h3>
                                {project.featured && (
                                  <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 border border-purple-400/30 rounded">
                                    Featured
                                  </span>
                                )}
                              </div>

                              <p className="text-sm text-gray-400 truncate mb-3">{project.oneliner}</p>

                              {/* Bottom row: status + pills */}
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  {/* Status dot */}
                                  <span
                                    className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDotColor(project.status)} ${
                                      project.status === 'live' ? 'animate-pulse' : ''
                                    }`}
                                  />
                                  <span
                                    className={`text-xs ${
                                      project.status === 'live'
                                        ? 'text-emerald-400'
                                        : project.status === 'offline'
                                          ? 'text-amber-400'
                                          : 'text-blue-400'
                                    }`}
                                  >
                                    {project.status === 'live'
                                      ? 'Live'
                                      : project.status === 'offline'
                                        ? 'Offline'
                                        : 'Deployed'}
                                  </span>
                                </div>

                                {/* Tech pills */}
                                <div className="flex items-center gap-1.5">
                                  {project.pillTechs.map((tech) => (
                                    <span
                                      key={tech}
                                      className="px-2 py-0.5 text-[11px] bg-white/[0.06] border border-white/10 text-gray-400 rounded-md font-mono"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Chevron */}
                            <FiChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all duration-300" />
                          </div>
                        </div>
                      </motion.button>
                    </ScrollAnimation>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── EXPANDED PROJECT VIEW ── */}
            {expandedProject && (
              <motion.div
                key={`expanded-${expandedProject.id}`}
                initial={{ opacity: 0, scale: 0.97, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -20 }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {/* Back / Close bar */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setExpandedId(null)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 rounded-lg transition-all duration-200 font-mono"
                  >
                    <FiArrowLeft className="w-4 h-4" />
                    projects/
                  </button>

                  <button
                    onClick={() => setExpandedId(null)}
                    className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                    aria-label="Close project details"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                {/* Breadcrumb path */}
                <div className="flex items-center gap-2 mb-6 font-mono text-sm text-gray-500">
                  <span className="text-emerald-400">~</span>
                  <span>/</span>
                  <button
                    onClick={() => setExpandedId(null)}
                    className="text-cyan-400/60 hover:text-cyan-300 transition-colors"
                  >
                    projects
                  </button>
                  <span>/</span>
                  <span className="text-white">{expandedProject.id}</span>
                </div>

                {/* Main expanded card */}
                <div
                  className={`bg-white/[0.03] border ${
                    expandedProject.featured ? 'border-purple-500/30' : 'border-white/10'
                  } rounded-2xl overflow-hidden`}
                >
                  {/* ── Header ── */}
                  <div
                    className={`p-8 ${
                      expandedProject.id === 'clipbot'
                        ? 'bg-gradient-to-br from-purple-900/80 to-[#1a2332]'
                        : expandedProject.id === 'seezee'
                          ? 'bg-gradient-to-br from-[#0a1128] to-[#1a2332]'
                          : expandedProject.id === 'avisionforyou'
                            ? 'bg-gradient-to-br from-[#3d5a7a] to-[#2d4a66]'
                            : 'bg-gradient-to-br from-[#2d4a66] to-[#3d5a7a]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      {expandedProject.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-3 py-1.5 text-xs border rounded-full ${
                            expandedProject.featured && tag === 'Featured'
                              ? 'border-purple-300/40 text-purple-200 bg-purple-500/20 font-semibold'
                              : expandedProject.id === 'clipbot'
                                ? 'border-purple-300/30 text-purple-200 bg-purple-500/10'
                                : expandedProject.id === 'seezee'
                                  ? 'border-cyan-300/30 text-cyan-200 bg-cyan-500/10'
                                  : 'border-blue-300/30 text-blue-200 bg-blue-500/10'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-2 mb-6">{statusBadge(expandedProject)}</div>

                    <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-3">
                      {expandedProject.name}
                    </h2>
                    <p
                      className={`text-xl ${
                        expandedProject.id === 'clipbot' ? 'text-purple-300' : 'text-cyan-300'
                      }`}
                    >
                      {expandedProject.oneliner}
                    </p>
                    {expandedProject.id === 'avisionforyou' && (
                      <p className="text-sm text-white/60 mt-2">Louisville, Kentucky</p>
                    )}
                  </div>

                  {/* ── Mission Quote (A Vision For You) ── */}
                  {expandedProject.missionQuote && (
                    <div className="bg-black/30 border-l-4 border-cyan-400 p-8">
                      <p className="text-lg text-white/90 italic leading-relaxed">
                        &ldquo;{expandedProject.missionQuote.text}&rdquo;
                      </p>
                      <p className="text-sm text-white/60 mt-2">
                        &mdash; {expandedProject.missionQuote.attribution}
                      </p>
                    </div>
                  )}

                  {/* ── Description / Problem / Solution ── */}
                  <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      {/* Left column */}
                      <div className="space-y-6">
                        {expandedProject.problemText && (
                          <div>
                            <h3 className="text-lg font-bold text-white mb-3">The Problem</h3>
                            <p className="text-base text-gray-300 leading-relaxed">
                              {expandedProject.problemText}
                            </p>
                          </div>
                        )}

                        {expandedProject.solutionText && (
                          <div>
                            <h3 className="text-lg font-bold text-white mb-3">The Solution</h3>
                            <p className="text-base text-gray-300 leading-relaxed">
                              {expandedProject.solutionText}
                            </p>
                          </div>
                        )}

                        {expandedProject.whyMatters && (
                          <div>
                            <h3 className="text-lg font-bold text-white mb-3">Why This Matters</h3>
                            <p className="text-base text-gray-400 leading-relaxed">
                              {expandedProject.whyMatters}
                            </p>
                          </div>
                        )}

                        {/* Generic description blocks for projects without problem/solution */}
                        {!expandedProject.problemText &&
                          expandedProject.description.map((desc, idx) => (
                            <div key={idx}>
                              {idx === 0 && !expandedProject.problemText && (
                                <h3 className="text-xl font-bold text-white mb-4">About</h3>
                              )}
                              <p className="text-base text-gray-300 leading-relaxed">{desc}</p>
                            </div>
                          ))}

                        {/* Disclaimer */}
                        {expandedProject.disclaimer && (
                          <p className="text-sm text-cyan-400 italic bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-4">
                            <strong>Note:</strong> {expandedProject.disclaimer}
                          </p>
                        )}

                        {/* Social links */}
                        {expandedProject.socialLinks && (
                          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-white mb-3">
                              Follow the Initiative
                            </h4>
                            <div className="space-y-2 text-sm text-gray-300">
                              {expandedProject.socialLinks.map((link) => (
                                <div key={link.platform}>
                                  <span className="text-gray-400">{link.platform}:</span>{' '}
                                  {link.handle}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right column */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-3">
                            {expandedProject.featuresLabel ||
                              (expandedProject.id === 'clipbot'
                                ? 'System Capabilities'
                                : 'System Features')}
                          </h3>
                          <div className="space-y-2">
                            {expandedProject.features.map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-gray-300">
                                <FiCheck
                                  className={`flex-shrink-0 w-4 h-4 ${
                                    expandedProject.id === 'clipbot'
                                      ? 'text-purple-400'
                                      : 'text-emerald-400'
                                  }`}
                                />
                                <span className="text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-base font-semibold text-white mb-3">
                            {expandedProject.id === 'clipbot' ? 'Architecture' : 'Tech Stack'}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {expandedProject.techStack.map((tech, idx) => (
                              <span
                                key={idx}
                                className={`px-3 py-1 text-xs border rounded-full ${
                                  expandedProject.id === 'clipbot'
                                    ? 'border-purple-300/20 text-gray-300 bg-purple-500/5'
                                    : 'border-white/20 text-gray-300 bg-white/5'
                                }`}
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Stats ── */}
                  {expandedProject.stats && (
                    <div
                      className={`p-8 ${
                        expandedProject.id === 'avisionforyou'
                          ? 'bg-gradient-to-br from-[#0a1128] to-[#2d4a66]/20'
                          : 'bg-black/20'
                      }`}
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {expandedProject.stats.map((stat, idx) => (
                          <div key={idx} className="text-center">
                            <div
                              className={`text-3xl md:text-4xl font-bold mb-2 ${
                                expandedProject.id === 'clipbot'
                                  ? 'text-purple-400'
                                  : 'text-cyan-400'
                              }`}
                            >
                              {stat.number}
                            </div>
                            <div className="text-sm font-medium text-white mb-1">{stat.label}</div>
                            <div className="text-xs text-gray-400">{stat.sublabel}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Screenshots ── */}
                  {expandedProject.screenshots && (
                    <div className="bg-black/30 p-8">
                      <h3 className="text-xl font-bold text-white text-center mb-6">
                        {expandedProject.screenshotsLabel || 'Screenshots'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {expandedProject.screenshots.map((screenshot, idx) => (
                          <div
                            key={idx}
                            className={`rounded-xl overflow-hidden border-2 ${
                              expandedProject.id === 'avisionforyou'
                                ? 'border-cyan-500/30 hover:border-cyan-400/60'
                                : 'border-blue-500/30 hover:border-blue-400/60'
                            } transition-colors duration-300`}
                          >
                            <div className="relative aspect-video bg-gradient-to-br from-slate-700/20 to-cyan-500/10">
                              <ImageLightbox
                                src={screenshot.src}
                                alt={screenshot.alt}
                                width={600}
                                height={400}
                                className="w-full h-full object-cover"
                                caption={
                                  expandedProject.id === 'bigredbus'
                                    ? `Big Red Bus - ${screenshot.label}`
                                    : screenshot.label
                                }
                              />
                            </div>
                            <div className="p-3 bg-white/5 text-center">
                              <span className="text-sm text-gray-300">{screenshot.label}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Access Points ── */}
                  <div className="p-8 border-t border-white/5">
                    <h4 className="text-xs uppercase tracking-widest text-gray-500 font-mono mb-4">
                      Access Points
                    </h4>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {expandedProject.liveUrl && (
                        <a
                          href={expandedProject.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 px-6 py-3 border-2 rounded-lg transition-all duration-300 font-medium text-base w-full sm:w-auto justify-center ${
                            expandedProject.id === 'clipbot'
                              ? 'border-purple-400 text-purple-300 hover:bg-purple-400 hover:text-gray-900'
                              : 'border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-gray-900'
                          }`}
                        >
                          <FiExternalLink className="w-4 h-4" />
                          {expandedProject.liveLabel || 'View Live'}
                        </a>
                      )}
                      <a
                        href={expandedProject.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-gray-300 rounded-lg hover:border-white/40 hover:text-white transition-all duration-300 font-medium text-base w-full sm:w-auto justify-center"
                      >
                        <FiGithub className="w-4 h-4" />
                        {expandedProject.id === 'clipbot' ? 'View Source' : 'GitHub'}
                      </a>
                      {expandedProject.caseStudyUrl && (
                        <Link
                          href={expandedProject.caseStudyUrl}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium text-base w-full sm:w-auto text-center shadow-lg hover:shadow-blue-600/30"
                        >
                          Read Case Study
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ========================================
          WHAT WE'RE BUILDING NEXT
          ======================================== */}
      <section className="bg-[#0a1128] py-16">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollAnimation>
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
              What We&apos;re Building Next
            </h2>
            <p className="text-gray-400 text-center mb-10 max-w-2xl mx-auto">
              We actively build and ship. Here&apos;s where the work is heading.
            </p>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'AI Integrations', desc: 'Workflow automation with modern AI' },
                { label: 'Automation Tools', desc: 'Reducing manual operations' },
                { label: 'Client Dashboards', desc: 'Accessible data platforms' },
                { label: 'Internal Systems', desc: 'Ops infrastructure at scale' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white/[0.03] border border-white/10 rounded-xl p-6 text-center"
                >
                  <h3 className="text-sm font-bold text-white mb-2">{item.label}</h3>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* ========================================
          GITHUB + VERCEL
          ======================================== */}
      <section className="bg-[#1a2332] py-16">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollAnimation>
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-10">
              Where We Build
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <a
                href="https://github.com/SeanSpon"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/[0.03] border border-white/10 rounded-xl p-8 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <FiGithub className="w-8 h-8 text-white" />
                  <h3 className="text-xl font-bold text-white">GitHub</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Open source repos, client projects, and internal tools. All code is
                  version-controlled and reviewable.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['clipbot', 'SeeZee', 'avisionforyou', 'seezeestudios-mcp'].map((repo) => (
                    <span
                      key={repo}
                      className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded text-gray-400 font-mono"
                    >
                      {repo}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-cyan-400 mt-4 group-hover:underline">
                  github.com/SeanSpon &rarr;
                </p>
              </a>

              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    viewBox="0 0 76 65"
                    fill="currentColor"
                  >
                    <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                  </svg>
                  <h3 className="text-xl font-bold text-white">Vercel</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  All projects deployed on Vercel with automatic CI/CD from GitHub. Production,
                  preview, and staging environments.
                </p>
                <div className="space-y-2">
                  {[
                    { name: 'seezeestudios.com', status: 'Production', online: true },
                    { name: 'clipbot-neon.vercel.app', status: 'Production', online: true },
                    {
                      name: 'avisionforyou (Vercel Preview)',
                      status: 'Preview',
                      online: true,
                    },
                    {
                      name: 'softwaretfs (TaxFeeder)',
                      status: 'Production',
                      online: true,
                    },
                    {
                      name: 'fbla-coding-and-programming-web.vercel.app',
                      status: 'Production',
                      online: true,
                    },
                  ].map((deploy) => (
                    <div
                      key={deploy.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-300 font-mono text-xs">{deploy.name}</span>
                      <span
                        className={`text-xs ${
                          deploy.online ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {deploy.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* ========================================
          CTA
          ======================================== */}
      <section className="bg-red-500 py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <ScrollAnimation>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Need a System Like This?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
              We design, integrate, and support AI-powered workflows and dashboards.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-block px-8 py-4 bg-white text-red-500 rounded-lg hover:scale-105 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                Get in Touch
              </Link>
              <Link
                href="/contact"
                className="inline-block px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg hover:bg-white/10 transition-all duration-300 font-semibold text-lg"
              >
                Ask a Question
              </Link>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  )
}
