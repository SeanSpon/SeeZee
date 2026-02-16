'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import ScrollAnimation from '@/components/shared/ScrollAnimation'
import {
  FiCheck,
  FiArrowRight,
  FiZap,
  FiClock,
  FiDollarSign,
  FiMessageSquare,
  FiShield,
  FiTrendingUp,
  FiAward,
  FiCode,
  FiUsers,
  FiStar,
  FiHeart,
  FiCalendar,
  FiMail,
} from 'react-icons/fi'

export default function ServicesPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-[#0a1128] py-20 overflow-hidden">
        {/* Subtle tech grid background */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, #22d3ee 1px, transparent 1px),
                linear-gradient(to bottom, #22d3ee 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.03]"
            style={{
              background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)'
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-6xl">
          <ScrollAnimation>
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-7xl font-heading font-bold text-white mb-6 leading-tight"
              >
                Technology Services & Solutions
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8"
              >
                From hands-on support to custom development. Clear pricing. Real partnership.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link
                  href="/start"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-semibold text-lg shadow-lg"
                >
                  Start Your Project
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/start/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-[1.03] hover:bg-white/10"
                >
                  Book a Consult
                </Link>
              </motion.div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Project Types Section */}
      <section className="py-20 bg-[#1a2332]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold text-white mb-4">
              What We Offer
            </h2>
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-[1.7]">
              Development projects billed at $75/hour. Pick your project type and we'll estimate the hours needed.
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Marketing Website - Featured with cyan border */}
            <ScrollAnimation delay={0.1}>
              <div className="bg-gray-900/50 border-2 border-[#22d3ee] rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl mb-4">🌐</div>
                <h3 className="text-xl font-heading font-bold text-white mb-2">
                  Marketing Website
                </h3>
                <div className="text-2xl font-bold text-[#22d3ee] mb-2">
                  $3k - $6k
                </div>
                <p className="text-white/70 mb-4 text-sm">40-80 hours</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start text-white/80 text-sm">
                    <FiCheck className="w-4 h-4 text-[#22d3ee] mr-2 flex-shrink-0 mt-0.5" />
                    <span>5-10 custom pages</span>
                  </li>
                  <li className="flex items-start text-white/80 text-sm">
                    <FiCheck className="w-4 h-4 text-[#22d3ee] mr-2 flex-shrink-0 mt-0.5" />
                    <span>Mobile responsive</span>
                  </li>
                  <li className="flex items-start text-white/80 text-sm">
                    <FiCheck className="w-4 h-4 text-[#22d3ee] mr-2 flex-shrink-0 mt-0.5" />
                    <span>Contact forms & CTAs</span>
                  </li>
                </ul>
                <Link
                  href="/start"
                  className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-transparent border-2 border-white/20 text-white rounded-lg hover:border-red-500 hover:bg-red-500 transition-all duration-200 font-semibold text-sm"
                >
                  Get Started
                </Link>
              </div>
            </ScrollAnimation>

            {/* E-commerce Store */}
            <ScrollAnimation delay={0.2}>
              <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6 hover:border-cyan-500/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl mb-4">🛒</div>
                <h3 className="text-xl font-heading font-bold text-white mb-2">
                  E-commerce Store
                </h3>
                <div className="text-2xl font-bold text-[#22d3ee] mb-2">
                  $6k - $12k
                </div>
                <p className="text-white/70 mb-4 text-sm">80-150 hours</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start text-white/80 text-sm">
                    <FiCheck className="w-4 h-4 text-[#22d3ee] mr-2 flex-shrink-0 mt-0.5" />
                    <span>Product catalog</span>
                  </li>
                  <li className="flex items-start text-white/80 text-sm">
                    <FiCheck className="w-4 h-4 text-[#22d3ee] mr-2 flex-shrink-0 mt-0.5" />
                    <span>Shopping cart & checkout</span>
                  </li>
                  <li className="flex items-start text-white/80 text-sm">
                    <FiCheck className="w-4 h-4 text-[#22d3ee] mr-2 flex-shrink-0 mt-0.5" />
                    <span>Payment processing</span>
                  </li>
                </ul>
                <Link
                  href="/start"
                  className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-transparent border-2 border-white/20 text-white rounded-lg hover:border-red-500 hover:bg-red-500 transition-all duration-200 font-semibold text-sm"
                >
                  Get Started
                </Link>
              </div>
            </ScrollAnimation>

            {/* Web Application */}
            <ScrollAnimation delay={0.3}>
              <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6 hover:border-cyan-500/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-heading font-bold text-white mb-2">
                  Web Application
                </h3>
                <div className="text-2xl font-bold text-[#22d3ee] mb-2">
                  $8k - $20k+
                </div>
                <p className="text-white/70 mb-4 text-sm">100-200+ hours</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start text-white/80 text-sm">
                    <FiCheck className="w-4 h-4 text-[#22d3ee] mr-2 flex-shrink-0 mt-0.5" />
                    <span>User authentication</span>
                  </li>
                  <li className="flex items-start text-white/80 text-sm">
                    <FiCheck className="w-4 h-4 text-[#22d3ee] mr-2 flex-shrink-0 mt-0.5" />
                    <span>Custom dashboards</span>
                  </li>
                  <li className="flex items-start text-white/80 text-sm">
                    <FiCheck className="w-4 h-4 text-[#22d3ee] mr-2 flex-shrink-0 mt-0.5" />
                    <span>Database integration</span>
                  </li>
                </ul>
                <Link
                  href="/start"
                  className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-transparent border-2 border-white/20 text-white rounded-lg hover:border-red-500 hover:bg-red-500 transition-all duration-200 font-semibold text-sm"
                >
                  Get Started
                </Link>
              </div>
            </ScrollAnimation>

            {/* Landing Page */}
            <ScrollAnimation delay={0.4}>
              <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6 hover:border-cyan-500/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-heading font-bold text-white mb-2">
                  Landing Page
                </h3>
                <div className="text-2xl font-bold text-[#22d3ee] mb-2">
                  $1.2k - $2.4k
                </div>
                <p className="text-white/70 mb-4 text-sm">15-30 hours</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start text-white/80 text-sm">
                    <FiCheck className="w-4 h-4 text-[#22d3ee] mr-2 flex-shrink-0 mt-0.5" />
                    <span>Conversion-focused</span>
                  </li>
                  <li className="flex items-start text-white/80 text-sm">
                    <FiCheck className="w-4 h-4 text-[#22d3ee] mr-2 flex-shrink-0 mt-0.5" />
                    <span>Lead capture forms</span>
                  </li>
                  <li className="flex items-start text-white/80 text-sm">
                    <FiCheck className="w-4 h-4 text-[#22d3ee] mr-2 flex-shrink-0 mt-0.5" />
                    <span>Fast loading speed</span>
                  </li>
                </ul>
                <Link
                  href="/start"
                  className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-transparent border-2 border-white/20 text-white rounded-lg hover:border-red-500 hover:bg-red-500 transition-all duration-200 font-semibold text-sm"
                >
                  Get Started
                </Link>
              </div>
            </ScrollAnimation>

            {/* Maintenance Plan */}
            <ScrollAnimation delay={0.5}>
              <div className="bg-gray-900/50 border-2 border-[#22d3ee] rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full uppercase shadow-lg">
                    Popular
                  </span>
                </div>
                <div className="text-4xl mb-4">🔧</div>
                <h3 className="text-xl font-heading font-bold text-white mb-2">
                  Maintenance Plan
                </h3>
                <div className="text-2xl font-bold text-[#22d3ee] mb-2">
                  $2k/quarter
                </div>
                <p className="text-white/70 mb-4 text-sm">30 hours included per quarter</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start text-white/80 text-sm">
                    <FiCheck className="w-4 h-4 text-[#22d3ee] mr-2 flex-shrink-0 mt-0.5" />
                    <span>Priority 24hr support</span>
                  </li>
                  <li className="flex items-start text-white/80 text-sm">
                    <FiCheck className="w-4 h-4 text-[#22d3ee] mr-2 flex-shrink-0 mt-0.5" />
                    <span>Security & backups</span>
                  </li>
                  <li className="flex items-start text-white/80 text-sm">
                    <FiCheck className="w-4 h-4 text-[#22d3ee] mr-2 flex-shrink-0 mt-0.5" />
                    <span>Unlimited change requests</span>
                  </li>
                </ul>
                <Link
                  href="/start"
                  className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-semibold text-sm"
                >
                  Learn More
                </Link>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Donation System Showcase */}
      <section className="py-20 bg-[#0a1128]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
              {/* Screenshot - Takes up 3 columns */}
              <ScrollAnimation delay={0.1} className="lg:col-span-3">
                <div className="rounded-2xl overflow-hidden border-2 border-[#22d3ee]/30 shadow-2xl hover:shadow-[#22d3ee]/40 transition-all duration-300">
                  <Image 
                    src="/avfy-donate-new.png" 
                    alt="Stripe-Integrated Donation System"
                    width={1200}
                    height={900}
                    className="w-full h-auto"
                  />
                </div>
              </ScrollAnimation>

              {/* Content - Takes up 2 columns */}
              <ScrollAnimation delay={0.2} className="lg:col-span-2">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-green-300 text-sm font-semibold mb-4">
                    <FiDollarSign className="w-4 h-4" />
                    <span>Real System in Production</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
                    Donation Systems That Actually Work
                  </h2>
                  <p className="text-lg text-gray-300 leading-relaxed mb-6">
                    This is the live donation page for A Vision For You. 
                    It processes real transactions, calculates donor impact in real-time, 
                    and handles both one-time and recurring donations.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      'Stripe integration for secure payment processing',
                      'Impact tiers ($25-$500 with clear outcomes)',
                      'Real-time impact calculator',
                      'One-time and monthly recurring donations',
                      'Custom donation amounts',
                      'Automated thank-you emails via Resend API'
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-300">
                        <FiCheck className="w-5 h-5 text-[#22d3ee] flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-base text-gray-400 italic">
                    "Every donation directly transforms lives in our community" — 
                    This system made that promise tangible with real-time impact visualization.
                  </p>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </div>
      </section>

      {/* Maintenance Plans Section */}
      <section className="py-20 bg-[#1a2332]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Ongoing Maintenance & Support
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Keep your website running smoothly with our maintenance plans
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <ScrollAnimation delay={0.1}>
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8 hover:border-cyan-500/40 transition-all duration-300">
                <h3 className="text-2xl font-heading font-bold text-white mb-2">Quarterly Plan</h3>
                <div className="text-4xl font-bold text-[#22d3ee] mb-2">$2,000</div>
                <p className="text-white/70 mb-6">per quarter · 30 hours included</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-[#22d3ee] mr-3 flex-shrink-0 mt-0.5" />
                    <span>Priority 24hr response time</span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-[#22d3ee] mr-3 flex-shrink-0 mt-0.5" />
                    <span>Security updates & backups</span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-[#22d3ee] mr-3 flex-shrink-0 mt-0.5" />
                    <span>Unlimited change requests</span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-[#22d3ee] mr-3 flex-shrink-0 mt-0.5" />
                    <span>Emergency same-day fixes</span>
                  </li>
                </ul>
                <Link
                  href="/start"
                  className="inline-flex items-center justify-center w-full px-6 py-3 bg-transparent border-2 border-white/20 text-white rounded-lg hover:border-red-500 hover:bg-red-500 transition-all duration-200 font-semibold"
                >
                  Choose Quarterly
                </Link>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.2}>
              <div className="bg-gray-900/50 border-2 border-[#22d3ee] rounded-xl p-8 relative overflow-hidden shadow-2xl shadow-[#22d3ee]/20">
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-sm font-bold rounded-full uppercase shadow-lg">
                    Save 15%
                  </span>
                </div>
                <h3 className="text-2xl font-heading font-bold text-white mb-2">Annual Plan</h3>
                <div className="text-4xl font-bold text-[#22d3ee] mb-2">$6,800</div>
                <p className="text-white/70 mb-6">per year · 120 hours included</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-[#22d3ee] mr-3 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Everything in Quarterly</strong></span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-[#22d3ee] mr-3 flex-shrink-0 mt-0.5" />
                    <span>Quarterly strategy reviews</span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-[#22d3ee] mr-3 flex-shrink-0 mt-0.5" />
                    <span>Performance monitoring</span>
                  </li>
                  <li className="flex items-start text-white/80">
                    <FiCheck className="w-5 h-5 text-[#22d3ee] mr-3 flex-shrink-0 mt-0.5" />
                    <span>$57/hour effective rate</span>
                  </li>
                </ul>
                <Link
                  href="/start"
                  className="inline-flex items-center justify-center w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 hover:scale-105 transition-all duration-200 font-semibold shadow-lg"
                >
                  Choose Annual
                </Link>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-20 bg-[#0a1128]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Every Project Includes
            </h2>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ScrollAnimation delay={0.1}>
              <div className="text-center p-6 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-cyan-500/40 transition-all duration-300">
                <FiCode className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">Professional Design</h4>
                <p className="text-white/70 text-sm">Clean, modern websites that work perfectly on all devices</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.2}>
              <div className="text-center p-6 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-cyan-500/40 transition-all duration-300">
                <FiMessageSquare className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">Your Own Dashboard</h4>
                <p className="text-white/70 text-sm">Track progress, view invoices, request changes—all in one place</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.3}>
              <div className="text-center p-6 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-cyan-500/40 transition-all duration-300">
                <FiClock className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">Fast Delivery</h4>
                <p className="text-white/70 text-sm">Most projects completed in 2-3 weeks. Rush options available</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.4}>
              <div className="text-center p-6 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-cyan-500/40 transition-all duration-300">
                <FiTrendingUp className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">SEO Basics</h4>
                <p className="text-white/70 text-sm">Set up for search engine success from day one</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.5}>
              <div className="text-center p-6 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-cyan-500/40 transition-all duration-300">
                <FiShield className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">Secure Hosting</h4>
                <p className="text-white/70 text-sm">Fast, reliable hosting included in your monthly maintenance</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.6}>
              <div className="text-center p-6 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-cyan-500/40 transition-all duration-300">
                <FiUsers className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">Ongoing Support</h4>
                <p className="text-white/70 text-sm">Monthly maintenance includes updates, backups, and support</p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Why SeeZee Section */}
      <section className="py-20 bg-[#1a2332]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Why Partner With SeeZee?
            </h2>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ScrollAnimation delay={0.1}>
              <div className="text-center p-6 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-cyan-500/40 transition-all duration-300">
                <div className="w-16 h-16 bg-[#22d3ee]/10 border border-[#22d3ee]/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FiUsers className="w-8 h-8 text-[#22d3ee]" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Real Partnership</h4>
                <p className="text-white/70">We treat you like a partner, not a project. Long-term relationships built on trust and results.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.2}>
              <div className="text-center p-6 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-cyan-500/40 transition-all duration-300">
                <div className="w-16 h-16 bg-[#22d3ee]/10 border border-[#22d3ee]/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FiMessageSquare className="w-8 h-8 text-[#22d3ee]" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Clear Communication</h4>
                <p className="text-white/70">No tech jargon. We explain everything in plain language and respond quickly when you need help.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.3}>
              <div className="text-center p-6 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-cyan-500/40 transition-all duration-300">
                <div className="w-16 h-16 bg-[#22d3ee]/10 border border-[#22d3ee]/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FiDollarSign className="w-8 h-8 text-[#22d3ee]" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Transparent Pricing</h4>
                <p className="text-white/70">No surprises, no hidden fees. You know exactly what you're paying for at every stage.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.4}>
              <div className="text-center p-6 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-cyan-500/40 transition-all duration-300">
                <div className="w-16 h-16 bg-[#22d3ee]/10 border border-[#22d3ee]/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FiShield className="w-8 h-8 text-[#22d3ee]" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Ongoing Support</h4>
                <p className="text-white/70">We don't disappear after launch. Continuous support, maintenance, and help when you need it.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.5}>
              <div className="text-center p-6 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-cyan-500/40 transition-all duration-300">
                <div className="w-16 h-16 bg-[#22d3ee]/10 border border-[#22d3ee]/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FiAward className="w-8 h-8 text-[#22d3ee]" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Community Focused</h4>
                <p className="text-white/70">We prioritize schools, nonprofits, and organizations doing meaningful work in our community.</p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[#0a1128]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Common Questions
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <ScrollAnimation delay={0.1}>
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 hover:border-cyan-500/40 transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-3">How long does it take?</h4>
                <p className="text-white/70">Most projects are completed in 2-3 weeks. Rush delivery (1 week) available for an additional fee.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.2}>
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 hover:border-cyan-500/40 transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-3">What if I don't know exactly what I need?</h4>
                <p className="text-white/70">That's okay! The project brief helps us understand your needs and recommend the right solutions. We'll guide you through the process.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.3}>
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 hover:border-cyan-500/40 transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-3">Do you offer payment plans?</h4>
                <p className="text-white/70">Yes! We offer flexible payment schedules for larger projects. Typically 50% upfront, 50% on delivery.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.4}>
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 hover:border-cyan-500/40 transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-3">What's included in monthly maintenance?</h4>
                <p className="text-white/70">Hosting, security updates, backups, minor content updates, and email support. Premium plans include priority support.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.5}>
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 hover:border-cyan-500/40 transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-3">Can you work with my budget?</h4>
                <p className="text-white/70">We create custom quotes based on your specific needs and budget. Let us know your constraints in the project brief and we'll work with you.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.6}>
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 hover:border-cyan-500/40 transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-3">What if I need changes after launch?</h4>
                <p className="text-white/70">Minor updates are included in your monthly maintenance. Larger changes can be quoted separately through your dashboard.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.7}>
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 hover:border-cyan-500/40 transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-3">Do I own the website?</h4>
                <p className="text-white/70">Yes! You own all content and design. We just maintain the hosting and technical infrastructure.</p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.8}>
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 hover:border-cyan-500/40 transition-all duration-300">
                <h4 className="text-xl font-semibold text-white mb-3">What payment methods do you accept?</h4>
                <p className="text-white/70">We use Stripe for secure payment processing. Credit cards, debit cards, and ACH transfers accepted.</p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-red-500 py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <ScrollAnimation>
            <div className="text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Tell us about your organization. We'll listen, understand your needs, and show you how we can help.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href="/start"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-red-500 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl"
                >
                  Start Your Project
                </Link>
                <Link
                  href="/start/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-[1.03] hover:bg-white/10"
                >
                  Book a Consult
                </Link>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  )
}
