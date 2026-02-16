'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { motion } from 'framer-motion'
import ScrollAnimation from '@/components/shared/ScrollAnimation'
import ImageLightbox from '@/components/shared/ImageLightbox'
import { FiCheck, FiExternalLink, FiGithub } from 'react-icons/fi'

export default function ProjectsPage() {
  return (
    <div className="w-full bg-[#0a1128]">
      {/* ========================================
          HERO
          ======================================== */}
      <section className="bg-[#0a1128] py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollAnimation>
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-bold text-white mb-6"
              >
                Projects
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
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* ========================================
          PROJECT CARDS
          ======================================== */}
      <section className="bg-[#1a2332] py-16">
        <div className="max-w-7xl mx-auto px-6 space-y-16">

          {/* ========================================
              CLIPBOT — FEATURED / FLAGSHIP
              ======================================== */}
          <ScrollAnimation>
            <div className="bg-white/[0.03] border-2 border-purple-500/30 rounded-[24px] overflow-hidden shadow-lg shadow-purple-500/5">
              {/* Featured badge */}
              <div className="bg-gradient-to-br from-purple-900/80 to-[#1a2332] p-8 rounded-t-[24px]">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-3 py-1.5 text-xs border border-purple-300/40 text-purple-200 rounded-full bg-purple-500/20 font-semibold">
                    Featured
                  </span>
                  <span className="px-3 py-1.5 text-xs border border-purple-300/30 text-purple-200 rounded-full bg-purple-500/10">
                    AI System
                  </span>
                  <span className="px-3 py-1.5 text-xs border border-purple-300/30 text-purple-200 rounded-full bg-purple-500/10">
                    Open Source
                  </span>
                </div>

                <div className="inline-block px-4 py-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-full text-sm font-medium mt-2 mb-6">
                  Live &mdash; Active Development
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-3">
                  ClipBot
                </h2>
                <p className="text-xl text-purple-300">
                  AI Video Director &mdash; Automated Multi-Camera Editing System
                </p>
              </div>

              {/* Problem / Solution */}
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3">The Problem</h3>
                      <p className="text-base text-gray-300 leading-relaxed">
                        Video and podcast content takes hours to review manually. Finding strong clips is slow and inconsistent. Editing multi-camera footage requires expensive software and expertise.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white mb-3">The Solution</h3>
                      <p className="text-base text-gray-300 leading-relaxed">
                        An AI-powered system that analyzes long-form video, detects the strongest moments, generates scene-by-scene editing directions, and scores clips for virality &mdash; automatically.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white mb-3">Why This Matters</h3>
                      <p className="text-base text-gray-400 leading-relaxed">
                        This project demonstrates our ability to build real AI-assisted tools, design automation pipelines, and integrate multiple AI providers into a production system.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3">System Capabilities</h3>
                      <div className="space-y-2">
                        {[
                          'Multi-provider AI Director (Anthropic, OpenAI, Gemini)',
                          'Automated transcript analysis & speaker diarization',
                          'Scene-by-scene shot list generation',
                          'AI virality scoring (0-100)',
                          'Multi-camera footage support',
                          'Real-time job processing with SSE',
                          'Video rendering pipeline',
                          'Project management dashboard',
                        ].map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-gray-300">
                            <FiCheck className="text-purple-400 flex-shrink-0 w-4 h-4" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-base font-semibold text-white mb-3">Architecture</h4>
                      <div className="flex flex-wrap gap-2">
                        {['Next.js', 'Python / FastAPI', 'Prisma', 'Turborepo', 'Anthropic API', 'OpenAI API', 'Gemini API', 'Docker', 'SSE Streaming'].map((tech, idx) => (
                          <span key={idx} className="px-3 py-1 text-xs border border-purple-300/20 text-gray-300 rounded-full bg-purple-500/5">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 pt-0 flex flex-col sm:flex-row items-center gap-4">
                <a
                  href="https://clipbot-neon.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-purple-400 text-purple-300 rounded-lg hover:bg-purple-400 hover:text-gray-900 transition-all duration-300 font-medium text-base w-full sm:w-auto justify-center"
                >
                  <FiExternalLink className="w-4 h-4" />
                  Try ClipBot
                </a>
                <a
                  href="https://github.com/SeanSpon/clipbot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-gray-300 rounded-lg hover:border-white/40 hover:text-white transition-all duration-300 font-medium text-base w-full sm:w-auto justify-center"
                >
                  <FiGithub className="w-4 h-4" />
                  View Source
                </a>
              </div>
            </div>
          </ScrollAnimation>

          {/* ========================================
              SEEZEE STUDIOS — INTERNAL OPS SYSTEM
              ======================================== */}
          <ScrollAnimation>
            <div className="bg-white/[0.03] border border-white/10 rounded-[24px] overflow-hidden">
              <div className="bg-gradient-to-br from-[#0a1128] to-[#1a2332] p-8 rounded-t-[24px]">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-3 py-1.5 text-xs border border-cyan-300/30 text-cyan-200 rounded-full bg-cyan-500/10">
                    Internal System
                  </span>
                  <span className="px-3 py-1.5 text-xs border border-cyan-300/30 text-cyan-200 rounded-full bg-cyan-500/10">
                    Operations Platform
                  </span>
                </div>

                <div className="inline-block px-4 py-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-full text-sm font-medium mt-2 mb-6">
                  Live &mdash; seezeestudios.com
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-3">
                  SeeZee Studios Platform
                </h2>
                <p className="text-xl text-cyan-300">
                  Internal Operations, Client Portal &amp; Business Management System
                </p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">About</h3>
                    <p className="text-base text-gray-300 leading-relaxed mb-4">
                      The centralized system that runs SeeZee Studios. Manages client projects, internal workflows, financial tracking, team operations, and communication &mdash; all in one platform.
                    </p>
                    <p className="text-base text-gray-300 leading-relaxed">
                      Built from scratch to support AI integration, automation, and long-term scalability. This is the system we use daily to manage every client engagement.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">System Features</h3>
                    <div className="space-y-2 mb-6">
                      {[
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
                      ].map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-gray-300">
                          <FiCheck className="text-emerald-400 flex-shrink-0 w-4 h-4" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-black/20 p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { number: '39+', label: 'Database Models', sublabel: 'Full relational schema' },
                    { number: '283', label: 'API Routes', sublabel: 'Server-side endpoints' },
                    { number: '40+', label: 'Admin Modules', sublabel: 'Operations coverage' },
                    { number: '3', label: 'Role-Based Portals', sublabel: 'Client / Admin / CEO' },
                  ].map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-3xl font-bold text-cyan-400 mb-2">{stat.number}</div>
                      <div className="text-sm font-medium text-white mb-1">{stat.label}</div>
                      <div className="text-xs text-gray-400">{stat.sublabel}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8">
                <h4 className="text-base font-semibold text-white mb-3">Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {['Next.js 16', 'TypeScript', 'Prisma', 'PostgreSQL', 'NextAuth', 'Tailwind CSS', 'Framer Motion', 'Vercel', 'OpenAI API'].map((tech, idx) => (
                    <span key={idx} className="px-3 py-1 text-xs border border-white/20 text-gray-300 rounded-full bg-white/5">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-8 pt-0 flex flex-col sm:flex-row items-center gap-4">
                <a
                  href="https://seezeestudios.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-cyan-400 text-cyan-300 rounded-lg hover:bg-cyan-400 hover:text-gray-900 transition-all duration-300 font-medium text-base w-full sm:w-auto justify-center"
                >
                  <FiExternalLink className="w-4 h-4" />
                  Visit Platform
                </a>
                <a
                  href="https://github.com/SeanSpon/SeeZee"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-gray-300 rounded-lg hover:border-white/40 hover:text-white transition-all duration-300 font-medium text-base w-full sm:w-auto justify-center"
                >
                  <FiGithub className="w-4 h-4" />
                  GitHub
                </a>
              </div>
            </div>
          </ScrollAnimation>

          {/* ========================================
              A VISION FOR YOU — CLIENT SYSTEM
              ======================================== */}
          <ScrollAnimation>
            <div className="bg-white/[0.03] border border-white/10 rounded-[24px] overflow-hidden">
              <div className="bg-gradient-to-br from-[#3d5a7a] to-[#2d4a66] p-8 rounded-t-[24px]">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-3 py-1.5 text-xs border border-blue-300/30 text-blue-200 rounded-full bg-blue-500/10">
                    Client System
                  </span>
                  <span className="px-3 py-1.5 text-xs border border-blue-300/30 text-blue-200 rounded-full bg-blue-500/10">
                    501(c)(3) Nonprofit
                  </span>
                </div>

                <div className="inline-block px-4 py-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-full text-sm font-medium mt-2 mb-6">
                  Deployed &mdash; Launched 2024
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-3">
                  A Vision For You
                </h2>
                <p className="text-xl text-cyan-300 mb-2">
                  Operations Dashboard &amp; Data Platform
                </p>
                <p className="text-sm text-white/60">Louisville, Kentucky</p>
              </div>

              <div className="bg-black/30 border-l-4 border-cyan-400 p-8">
                <p className="text-lg text-white/90 italic leading-relaxed">
                  &ldquo;To empower the homeless, individuals facing challenges, and those seeking support to lead productive lives through housing, education, self-help, programs, or any other available resource.&rdquo;
                </p>
                <p className="text-sm text-white/60 mt-2">&mdash; A Vision For You (Client Organization)</p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">The Problem</h3>
                    <p className="text-base text-gray-300 leading-relaxed mb-6">
                      A growing nonprofit needed a modern system to manage operations, track community members, process donations, and coordinate four distinct program pathways &mdash; without technical complexity.
                    </p>

                    <h3 className="text-xl font-bold text-white mb-4">The Solution</h3>
                    <p className="text-base text-gray-300 leading-relaxed mb-6">
                      An accessible operations dashboard that centralizes data, automates donation processing, and gives staff clear visibility across all programs. Designed for clarity and long-term support.
                    </p>

                    <p className="text-sm text-cyan-400 italic bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-4">
                      <strong>Note:</strong> SeeZee Studio does not provide medical, mental health, or recovery services. We design and maintain software platforms for organizations that do.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">System Features</h3>
                    <div className="space-y-2 mb-6">
                      {[
                        'Client assessment & intake system',
                        'Meeting & RSVP management',
                        'Donation processing (Stripe)',
                        'Impact dashboard & reporting',
                        'Admissions pipeline',
                        'Content management system',
                        'Email automation',
                        'Member management',
                        'Role-based access control',
                      ].map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-gray-300">
                          <FiCheck className="text-emerald-400 flex-shrink-0 w-4 h-4" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <h4 className="text-base font-semibold text-white mb-3">Tech Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Next.js 14', 'TypeScript', 'PostgreSQL', 'Prisma', 'NextAuth', 'Stripe'].map((tech, idx) => (
                        <span key={idx} className="px-3 py-1 text-xs border border-white/20 text-gray-300 rounded-full bg-white/5">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-gradient-to-br from-[#0a1128] to-[#2d4a66]/20 p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { number: '500+', label: 'Community Members', sublabel: 'Operations supported annually' },
                    { number: '24/7', label: 'Donation Processing', sublabel: 'Automated acknowledgment' },
                    { number: '4', label: 'Program Pathways', sublabel: 'Distinct offerings' },
                    { number: '25', label: 'Database Models', sublabel: 'Full platform architecture' },
                  ].map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-4xl font-bold text-cyan-400 mb-2">{stat.number}</div>
                      <div className="text-sm font-medium text-white mb-1">{stat.label}</div>
                      <div className="text-xs text-gray-400">{stat.sublabel}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Screenshots */}
              <div className="bg-black/30 p-8">
                <h3 className="text-xl font-bold text-white text-center mb-6">Platform Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { src: '/avfy-home.png', label: 'Homepage', alt: 'Homepage' },
                    { src: '/avfy-programs.png', label: 'Programs', alt: 'Programs Dashboard' },
                    { src: '/avfy-donate.png', label: 'Donations', alt: 'Donation System' },
                  ].map((screenshot, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden border-2 border-cyan-500/30 hover:border-cyan-400/60 transition-colors duration-300">
                      <div className="relative aspect-video bg-gradient-to-br from-slate-700/20 to-cyan-500/10">
                        <ImageLightbox
                          src={screenshot.src}
                          alt={screenshot.alt}
                          width={600}
                          height={400}
                          className="w-full h-full object-cover"
                          caption={screenshot.label}
                        />
                      </div>
                      <div className="p-3 bg-white/5 text-center">
                        <span className="text-sm text-gray-300">{screenshot.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://avisionforyou.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-cyan-400 text-cyan-300 rounded-lg hover:bg-cyan-400 hover:text-gray-900 transition-all duration-300 font-medium text-base w-full sm:w-auto justify-center"
                >
                  <FiExternalLink className="w-4 h-4" />
                  View Platform
                </a>
                <a
                  href="https://github.com/SeanSpon/avisionforyou"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-gray-300 rounded-lg hover:border-white/40 hover:text-white transition-all duration-300 font-medium text-base w-full sm:w-auto justify-center"
                >
                  <FiGithub className="w-4 h-4" />
                  GitHub
                </a>
                <Link
                  href="/case-studies/a-vision-for-you"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium text-base w-full sm:w-auto text-center shadow-lg hover:shadow-blue-600/30"
                >
                  Read Case Study
                </Link>
              </div>
            </div>
          </ScrollAnimation>

          {/* ========================================
              REDHEAD PRINTS — CLIENT PROJECT
              ======================================== */}
          <ScrollAnimation>
            <div className="bg-white/[0.03] border border-white/10 rounded-[24px] overflow-hidden">
              <div className="bg-gradient-to-br from-rose-900/60 to-[#2d4a66] p-8 rounded-t-[24px]">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-3 py-1.5 text-xs border border-rose-300/30 text-rose-200 rounded-full bg-rose-500/10">
                    Client Project
                  </span>
                  <span className="px-3 py-1.5 text-xs border border-rose-300/30 text-rose-200 rounded-full bg-rose-500/10">
                    Small Business
                  </span>
                </div>

                <div className="inline-block px-4 py-2 bg-yellow-500/20 border border-yellow-400/40 text-yellow-300 rounded-full text-sm font-medium mt-2 mb-6">
                  In Development
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-3">
                  RedHead Prints
                </h2>
                <p className="text-xl text-rose-300">
                  Full-Stack Platform for Custom Print Business
                </p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <p className="text-base text-gray-300 leading-relaxed">
                      Full-stack website and business platform for RedHead Prints, a small business specializing in custom print work. Built to give the client a professional online presence with integrated workflows and a clean, accessible design.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-white mb-3">Tech Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {['TypeScript', 'Full-Stack', 'Vercel'].map((tech, idx) => (
                        <span key={idx} className="px-3 py-1 text-xs border border-white/20 text-gray-300 rounded-full bg-white/5">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 pt-0 flex flex-col sm:flex-row items-center gap-4">
                <a
                  href="https://github.com/zrobards/redheadprints"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-gray-300 rounded-lg hover:border-white/40 hover:text-white transition-all duration-300 font-medium text-base w-full sm:w-auto justify-center"
                >
                  <FiGithub className="w-4 h-4" />
                  GitHub
                </a>
              </div>
            </div>
          </ScrollAnimation>

          {/* ========================================
              BIG RED BUS — FBLA PROJECT
              ======================================== */}
          <ScrollAnimation>
            <div className="bg-white/[0.03] border border-white/10 rounded-[24px] overflow-hidden">
              <div className="bg-gradient-to-br from-[#2d4a66] to-[#3d5a7a] p-8 rounded-t-[24px]">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-3 py-1.5 text-xs border border-blue-300/30 text-blue-200 rounded-full bg-blue-500/10">
                    Community Platform
                  </span>
                  <span className="px-3 py-1.5 text-xs border border-blue-300/30 text-blue-200 rounded-full bg-blue-500/10">
                    Nonprofit Initiative
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-3">
                  Big Red Bus
                </h2>
                <p className="text-xl text-cyan-300">
                  Community Resource &amp; Accessibility Platform
                </p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8">
                  <div>
                    <p className="text-base text-gray-300 leading-relaxed mb-4">
                      Big Red Bus is a Louisville-based nonprofit initiative using a physical bus to bring community resources, accessibility support, and connection directly to those who need it.
                    </p>
                    <p className="text-base text-gray-300 leading-relaxed">
                      We built a digital platform to help organizations like Big Red Bus connect with their communities &mdash; organization search, event discovery, and accessible design throughout.
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-white mb-3">Follow the Initiative</h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div><span className="text-gray-400">Instagram:</span> @brb.bigredbus</div>
                      <div><span className="text-gray-400">TikTok:</span> @bigredbus</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black/20 p-8">
                <h3 className="text-xl font-bold text-white mb-6">Platform Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                  {[
                    'Organization directory and search',
                    'Event discovery and community resources',
                    'Support group information',
                    'Review and engagement system',
                    'Accessible, cognitive-friendly design',
                    'Mobile-first responsive layout',
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-300">
                      <FiCheck className="text-emerald-400 flex-shrink-0 w-4 h-4" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <h4 className="text-base font-semibold text-white mb-3">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'Vite', 'Accessible UI'].map((tech, idx) => (
                      <span key={idx} className="px-3 py-1 text-xs border border-white/20 text-gray-300 rounded-full bg-white/5">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Screenshots */}
              <div className="bg-white/[0.03] p-8">
                <h3 className="text-xl font-bold text-white text-center mb-6">Platform Interface</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { src: '/big-red-bus-1.png', label: 'Homepage', alt: 'Homepage' },
                    { src: '/big-red-bus-2.png', label: 'Directory', alt: 'Organization Directory' },
                    { src: '/big-red-bus-3.png', label: 'About', alt: 'About Page' },
                  ].map((screenshot, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden border-2 border-blue-500/30 hover:border-blue-400/60 transition-colors duration-300">
                      <ImageLightbox
                        src={screenshot.src}
                        alt={screenshot.alt}
                        width={600}
                        height={400}
                        className="w-full h-auto"
                        caption={`Big Red Bus - ${screenshot.label}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://fbla-coding-and-programming-web.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-cyan-400 text-cyan-300 rounded-lg hover:bg-cyan-400 hover:text-gray-900 transition-all duration-300 font-medium text-base w-full sm:w-auto justify-center"
                >
                  <FiExternalLink className="w-4 h-4" />
                  View Live Platform
                </a>
                <a
                  href="https://github.com/SeanSpon/FBLA-Coding-And-Programming"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-gray-300 rounded-lg hover:border-white/40 hover:text-white transition-all duration-300 font-medium text-base w-full sm:w-auto justify-center"
                >
                  <FiGithub className="w-4 h-4" />
                  GitHub
                </a>
                <Link
                  href="/case-studies/big-red-bus"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium text-base w-full sm:w-auto text-center shadow-lg hover:shadow-blue-600/30"
                >
                  Read Case Study
                </Link>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* ========================================
          WHAT WE'RE BUILDING NEXT
          ======================================== */}
      <section className="bg-[#0a1128] py-16">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollAnimation>
            <h2 className="text-3xl font-bold text-white text-center mb-4">
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
                <div key={item.label} className="bg-white/[0.03] border border-white/10 rounded-xl p-6 text-center">
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
            <h2 className="text-3xl font-bold text-white text-center mb-10">
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
                  Open source repos, client projects, and internal tools. All code is version-controlled and reviewable.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['clipbot', 'SeeZee', 'avisionforyou', 'seezeestudios-mcp'].map((repo) => (
                    <span key={repo} className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded text-gray-400 font-mono">
                      {repo}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-cyan-400 mt-4 group-hover:underline">github.com/SeanSpon &rarr;</p>
              </a>

              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 76 65" fill="currentColor">
                    <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                  </svg>
                  <h3 className="text-xl font-bold text-white">Vercel</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  All projects deployed on Vercel with automatic CI/CD from GitHub. Production, preview, and staging environments.
                </p>
                <div className="space-y-2">
                  {[
                    { name: 'seezeestudios.com', status: 'Production' },
                    { name: 'clipbot-neon.vercel.app', status: 'Production' },
                    { name: 'avisionforyou.vercel.app', status: 'Production' },
                    { name: 'fbla-coding-and-programming-web.vercel.app', status: 'Production' },
                  ].map((deploy) => (
                    <div key={deploy.name} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 font-mono text-xs">{deploy.name}</span>
                      <span className="text-emerald-400 text-xs">{deploy.status}</span>
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
      <section className="bg-red-500 py-20">
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
                href="/start"
                className="inline-block px-8 py-4 bg-white text-red-500 rounded-lg hover:scale-105 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                Start a Project
              </Link>
              <Link
                href="/start/contact"
                className="inline-block px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg hover:bg-white/10 transition-all duration-300 font-semibold text-lg"
              >
                Book a Consult
              </Link>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  )
}
