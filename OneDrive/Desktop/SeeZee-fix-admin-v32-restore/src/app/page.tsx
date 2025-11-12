'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { motion } from 'framer-motion'
import ScrollAnimation from '@/components/shared/ScrollAnimation'
import AnimatedCounter from '@/components/shared/AnimatedCounter'
import FloatingShapes from '@/components/shared/FloatingShapes'
import StickyCTA from '@/components/shared/StickyCTA'
import { FiArrowRight, FiCheck, FiZap, FiDollarSign, FiClock, FiMessageSquare, FiChevronDown } from 'react-icons/fi'

export default function HomePage() {
  return (
    <div className="w-full">
      <StickyCTA />
      {/* Hero Section */}
      <section className="bg-black py-24 lg:py-40 relative overflow-hidden animated-gradient">
        <FloatingShapes />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left side - Content */}
            <div className="text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-8"
              >
                <span className="gradient-text">Your Website.</span>{' '}
                <span className="text-white">Built Fast. Maintained for Life.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-xl text-gray-300 mb-8 leading-relaxed"
              >
                SeeZee builds professional websites for small businesses — quick, affordable, and fully managed through your own dashboard.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
              >
                <Link
                  href="/services"
                  className="px-8 py-4 bg-trinity-red text-white rounded-lg hover:bg-trinity-maroon transition-all duration-200 font-semibold text-lg shadow-medium transform hover:-translate-y-1 glow-on-hover focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Get Started
                </Link>
                <Link
                  href="/services"
                  className="px-8 py-4 bg-transparent text-white rounded-lg hover:bg-gray-900 hover:text-white transition-all duration-200 font-semibold text-lg border-2 border-white hover:border-trinity-red glow-on-hover focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  See Pricing
                </Link>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-sm text-gray-300 mb-8"
              >
                Powered by two Louisville developers who make web design simple again.
              </motion.p>
              {/* Statistics */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="grid grid-cols-3 gap-6 mt-12"
              >
                <div className="text-center lg:text-left">
                  <div className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">
                    <AnimatedCounter end={48} suffix="h" duration={5000} />
                  </div>
                  <div className="text-sm text-gray-400">Build Time</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">
                    <AnimatedCounter end={100} suffix="+" />
                  </div>
                  <div className="text-sm text-gray-400">Sites Built</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">
                    <AnimatedCounter end={24} suffix="/7" />
                  </div>
                  <div className="text-sm text-gray-400">Support</div>
                </div>
              </motion.div>
            </div>
            {/* Right side - Visual/Mockup placeholder */}
            <div className="hidden lg:block relative">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative"
              >
                <div className="glass-effect rounded-2xl p-6 shadow-large animate-float border-2 border-gray-700">
                  {/* Browser Chrome */}
                  <div className="bg-gray-800 px-3 py-2 flex items-center gap-2 border-b border-gray-700 rounded-t-lg mb-4">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="flex-1 bg-gray-700 rounded px-3 py-1 text-xs text-gray-400 text-center">
                      yourbusiness.com
                    </div>
                  </div>
                  {/* Website Preview */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-trinity-red to-trinity-maroon rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="h-6 w-32 bg-white/30 rounded"></div>
                        <div className="flex gap-2">
                          <div className="h-5 w-16 bg-white/20 rounded"></div>
                          <div className="h-5 w-16 bg-white/20 rounded"></div>
                          <div className="h-5 w-16 bg-white/20 rounded"></div>
                        </div>
                      </div>
                    </div>
                    {/* Hero Section */}
                    <div className="mb-4">
                      <div className="h-24 bg-trinity-red/10 rounded-lg mb-3 flex items-center justify-center border-2 border-trinity-red/20">
                        <div className="text-center">
                          <div className="h-3 w-40 bg-trinity-red/30 rounded mx-auto mb-2"></div>
                          <div className="h-2 w-32 bg-trinity-red/20 rounded mx-auto"></div>
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
                      <div className="h-3 w-3/4 bg-gray-300 rounded"></div>
                      <div className="h-3 w-1/2 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-gray-400"
            >
              <FiChevronDown className="w-6 h-6" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section 1 — The Frustration */}
      <section className="py-24 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8">
                <span className="gradient-text">Running your business</span>{' '}
                <span className="text-white">is hard enough. Your website shouldn't be.</span>
              </h2>
              <p className="text-lg text-white leading-relaxed mb-6">
                Most business owners don't have time to mess with templates or chase down developers for every small change.
              </p>
              <p className="text-lg text-white leading-relaxed">
                That's why we built SeeZee — so you can skip the stress and get a clean, working site that's live in days, not weeks.
              </p>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Section 2 — The SeeZee Solution */}
      <section className="py-24 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
                Fast. Affordable. Hands-Off.
              </h2>
              <p className="text-lg text-white leading-relaxed">
                Every SeeZee plan includes a complete website, hosting, security, and ongoing maintenance — all managed through the SeeZee Client Dashboard.
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <ScrollAnimation delay={0.1}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                className="p-8 rounded-xl border-2 border-gray-700 hover:border-trinity-red transition-all duration-300 glass-effect text-center group shadow-medium hover:shadow-large"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 bg-trinity-red rounded-lg flex items-center justify-center mb-6 mx-auto group-hover:bg-trinity-maroon transition-colors shadow-medium"
                >
                  <FiClock className="w-8 h-8 text-white transition-colors" />
                </motion.div>
                <h3 className="text-xl font-heading font-semibold text-white mb-3">
                  Built in 48 hours
                </h3>
                <p className="text-gray-300">
                  we handle everything
                </p>
              </motion.div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.2}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                className="p-8 rounded-xl border-2 border-gray-700 hover:border-trinity-red transition-all duration-300 glass-effect text-center group shadow-medium hover:shadow-large"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 bg-trinity-red rounded-lg flex items-center justify-center mb-6 mx-auto group-hover:bg-trinity-maroon transition-colors shadow-medium"
                >
                  <FiDollarSign className="w-8 h-8 text-white transition-colors" />
                </motion.div>
                <h3 className="text-xl font-heading font-semibold text-white mb-3">
                  One simple monthly payment
                </h3>
                <p className="text-gray-300">
                  no contracts or surprises
                </p>
              </motion.div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.3}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                className="p-8 rounded-xl border-2 border-gray-700 hover:border-trinity-red transition-all duration-300 glass-effect text-center group shadow-medium hover:shadow-large"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 bg-trinity-red rounded-lg flex items-center justify-center mb-6 mx-auto group-hover:bg-trinity-maroon transition-colors shadow-medium"
                >
                  <FiMessageSquare className="w-8 h-8 text-white transition-colors" />
                </motion.div>
                <h3 className="text-xl font-heading font-semibold text-white mb-3">
                  Dashboard access
                </h3>
                <p className="text-gray-300">
                  request updates or check performance anytime
                </p>
              </motion.div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Section 3 — The Dashboard Difference */}
      <section className="py-24 bg-black relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollAnimation>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8">
                  <span className="gradient-text">Your Website HQ.</span>
                </h2>
                <p className="text-lg text-white leading-relaxed mb-6">
                  The SeeZee Dashboard keeps everything organized. Request content changes, track invoices, and message us directly — all from one login.
                </p>
                <p className="text-lg font-semibold text-trinity-red mb-10">
                  All-in-one access. All included in your monthly plan.
                </p>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-trinity-red text-white rounded-lg hover:bg-trinity-maroon transition-all duration-200 font-semibold text-lg shadow-medium transform hover:-translate-y-1 glow-on-hover focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  See How It Works
                  <FiArrowRight className="w-5 h-5" />
                </Link>
              </div>
              {/* Dashboard Mockup */}
              <div className="mt-16">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="glass-effect rounded-2xl p-6 shadow-large overflow-hidden border-2 border-gray-700"
                >
                  {/* Browser Chrome */}
                  <div className="bg-gray-800 px-3 py-2 flex items-center gap-2 border-b border-gray-700 rounded-t-lg mb-4">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="flex-1 bg-gray-700 rounded px-3 py-1 text-xs text-gray-400 text-center">
                      dashboard.seezee.com
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                    {/* Dashboard Header */}
                    <div className="bg-gradient-to-r from-gray-800 to-gray-800 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-trinity-red rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">SZ</span>
                        </div>
                        <div>
                          <span className="text-white font-semibold block">SeeZee Dashboard</span>
                          <span className="text-gray-400 text-xs">Welcome back!</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                        <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                        <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                      </div>
                    </div>
                    {/* Dashboard Content */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-trinity-red transition-colors">
                          <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Active Requests</div>
                          <div className="text-3xl font-bold text-trinity-red mb-1">3</div>
                          <div className="text-xs text-gray-500">2 pending</div>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-trinity-red transition-colors">
                          <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Invoices</div>
                          <div className="text-3xl font-bold text-white mb-1">1</div>
                          <div className="text-xs text-gray-500">Current month</div>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-trinity-red transition-colors">
                          <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Messages</div>
                          <div className="text-3xl font-bold text-white mb-1">2</div>
                          <div className="text-xs text-gray-500">Unread</div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                          <div className="flex items-center justify-between mb-3">
                            <div className="h-4 w-32 bg-gray-700 rounded"></div>
                            <div className="h-6 w-20 bg-trinity-red rounded"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-700 rounded w-full"></div>
                            <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="h-24 bg-gray-800 rounded border border-gray-700"></div>
                          <div className="h-24 bg-gray-800 rounded border border-gray-700"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Section 4 — Pricing Preview */}
      <section className="py-24 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
                  <span className="gradient-text">Simple plans.</span>{' '}
                  <span className="text-white">Real results.</span>
                </h2>
                <p className="text-lg text-white max-w-3xl mx-auto">
                  Choose the plan that fits your business — each one includes hosting, security, and lifetime maintenance through your dashboard.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full bg-gray-800 rounded-xl shadow-medium overflow-hidden border-2 border-gray-700">
                  <thead className="bg-trinity-red text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-heading font-semibold text-white">Plan</th>
                      <th className="px-6 py-4 text-left font-heading font-semibold text-white">Setup</th>
                      <th className="px-6 py-4 text-left font-heading font-semibold text-white">Monthly</th>
                      <th className="px-6 py-4 text-left font-heading font-semibold text-white">Highlights</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    <tr className="hover:bg-gray-800 hover:border-l-4 hover:border-l-trinity-red transition-all">
                      <td className="px-6 py-4 font-heading font-semibold text-white">Starter Site</td>
                      <td className="px-6 py-4 text-white">$299</td>
                      <td className="px-6 py-4 text-white">$49</td>
                      <td className="px-6 py-4 text-white">1–3 pages, fast launch, hosting & updates</td>
                    </tr>
                    <tr className="hover:bg-gray-800 hover:border-l-4 hover:border-l-trinity-red transition-all">
                      <td className="px-6 py-4 font-heading font-semibold text-white">Business Site</td>
                      <td className="px-6 py-4 text-white">$799</td>
                      <td className="px-6 py-4 text-white">$99</td>
                      <td className="px-6 py-4 text-white">5–10 pages, SEO, unlimited updates</td>
                    </tr>
                    <tr className="hover:bg-gray-800 hover:border-l-4 hover:border-l-trinity-red transition-all">
                      <td className="px-6 py-4 font-heading font-semibold text-white">E-Commerce Store</td>
                      <td className="px-6 py-4 text-white">$1,999</td>
                      <td className="px-6 py-4 text-white">$149</td>
                      <td className="px-6 py-4 text-white">Online shop, Stripe payments, product updates</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-center text-white mt-10">
                Need something custom? We build advanced sites too —{' '}
                <Link href="/services" className="text-trinity-red hover:text-trinity-maroon font-semibold underline">
                  Request a Quote
                </Link>
                .
              </p>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Section 5 — How It Works */}
      <section className="py-24 bg-gray-800 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
                  <span className="gradient-text">From call to live site</span>{' '}
                  <span className="text-white">in under a week.</span>
                </h2>
              </div>

              {/* Animated Timeline */}
              <div className="relative mb-12">
                {/* Timeline Line */}
                <div className="hidden md:block absolute top-20 left-0 right-0 h-1 bg-gray-700">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="h-full bg-trinity-red origin-left"
                    style={{ transformOrigin: 'left' }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                  <ScrollAnimation delay={0.1}>
                    <div className="text-center relative z-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-20 h-20 bg-trinity-red rounded-full flex items-center justify-center mb-6 mx-auto text-2xl font-bold text-white shadow-large relative z-10"
                      >
                        <span>1</span>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 bg-trinity-red rounded-full opacity-50 -z-10"
                        />
                      </motion.div>
                      <h3 className="text-xl font-heading font-semibold text-white mb-4">
                        Book a quick call
                      </h3>
                      <p className="text-gray-300">
                        We'll learn about your business and recommend a plan.
                      </p>
                    </div>
                  </ScrollAnimation>

                  <ScrollAnimation delay={0.2}>
                    <div className="text-center relative z-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="w-20 h-20 bg-trinity-red rounded-full flex items-center justify-center mb-6 mx-auto text-2xl font-bold text-white shadow-large relative z-10"
                      >
                        <span>2</span>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                          className="absolute inset-0 bg-trinity-red rounded-full opacity-50 -z-10"
                        />
                      </motion.div>
                      <h3 className="text-xl font-heading font-semibold text-white mb-4">
                        Send your content
                      </h3>
                      <p className="text-gray-300">
                        We design and build everything in 48 hours.
                      </p>
                    </div>
                  </ScrollAnimation>

                  <ScrollAnimation delay={0.3}>
                    <div className="text-center relative z-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="w-20 h-20 bg-trinity-red rounded-full flex items-center justify-center mb-6 mx-auto text-2xl font-bold text-white shadow-large relative z-10"
                      >
                        <span>3</span>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                          className="absolute inset-0 bg-trinity-red rounded-full opacity-50 -z-10"
                        />
                      </motion.div>
                      <h3 className="text-xl font-heading font-semibold text-white mb-4">
                        Go live
                      </h3>
                      <p className="text-gray-300">
                        Your site launches — you get dashboard access and ongoing support.
                      </p>
                    </div>
                  </ScrollAnimation>
                </div>
              </div>

              <div className="text-center">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-trinity-red text-white rounded-lg hover:bg-trinity-maroon transition-all duration-200 font-semibold text-lg shadow-medium transform hover:-translate-y-1 glow-on-hover focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  Start My Website
                  <FiArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Section 6 — Active Projects */}
      <section className="py-24 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                  <span className="gradient-text">Active Projects</span>
                </h2>
                <p className="text-lg text-white max-w-2xl mx-auto">
                  We're actively building client websites. Here's what we're working on right now.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ScrollAnimation delay={0.1}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="glass-effect rounded-xl border-2 border-gray-700 hover:border-trinity-red transition-all duration-300 overflow-hidden shadow-medium hover:shadow-large group"
                  >
                    {/* Project Image Placeholder */}
                    <div className="h-48 bg-gradient-to-br from-red-600 via-red-500 to-red-700 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-6xl font-bold text-white/40">BRP</div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-yellow-500 text-yellow-900 rounded-full text-xs font-bold">
                          IN PROGRESS
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-trinity-red transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-heading font-semibold text-white mb-2">
                        Red Head Printing
                      </h3>
                      <p className="text-sm text-gray-400 mb-3">
                        Client: Tina • E-Commerce Store
                      </p>
                      <p className="text-gray-300 mb-4">
                        Full e-commerce platform with Next.js, shopping cart, file uploads, and Stripe payments.
                      </p>
                      <Link
                        href="/projects"
                        className="text-trinity-red font-semibold hover:text-trinity-maroon transition-colors flex items-center gap-2 text-sm"
                      >
                        View Project
                        <FiArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                </ScrollAnimation>

                <ScrollAnimation delay={0.2}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="glass-effect rounded-xl border-2 border-gray-700 hover:border-trinity-red transition-all duration-300 overflow-hidden shadow-medium hover:shadow-large group"
                  >
                    {/* Project Image Placeholder */}
                    <div className="h-48 bg-gradient-to-br from-red-700 via-red-600 to-red-800 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-6xl font-bold text-white/40">BRB</div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-yellow-500 text-yellow-900 rounded-full text-xs font-bold">
                          IN PROGRESS
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-trinity-red transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-heading font-semibold text-white mb-2">
                        Big Red Bus
                      </h3>
                      <p className="text-sm text-gray-400 mb-3">
                        FBLA Project • Business Site
                      </p>
                      <p className="text-gray-300 mb-4">
                        Nonprofit directory platform for mental health and autism support organizations with filtering and search.
                      </p>
                      <Link
                        href="/projects"
                        className="text-trinity-red font-semibold hover:text-trinity-maroon transition-colors flex items-center gap-2 text-sm"
                      >
                        View Project
                        <FiArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                </ScrollAnimation>

                <ScrollAnimation delay={0.3}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="p-8 bg-trinity-red rounded-xl border-2 border-trinity-maroon shadow-large transition-all duration-300 glow-on-hover"
                  >
                    <h3 className="text-xl font-heading font-semibold text-white mb-3">
                      Your Business Here
                    </h3>
                    <p className="text-gray-100 mb-6">
                      Get your site launched in 48 hours. Join our growing list of clients.
                    </p>
                    <Link
                      href="/start"
                      className="inline-flex items-center gap-2 text-white hover:text-gray-100 font-semibold"
                    >
                      Start Your Project
                      <FiArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                </ScrollAnimation>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Section 7 — Why SeeZee */}
      <section className="py-24 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                  <span className="gradient-text">Why Choose</span>{' '}
                  <span className="text-white">SeeZee?</span>
                </h2>
                <p className="text-lg text-white max-w-2xl mx-auto">
                  We make website building simple, fast, and affordable for small businesses.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ScrollAnimation delay={0.1}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="p-8 glass-effect rounded-xl border-2 border-gray-700 hover:border-trinity-red transition-all duration-300 shadow-medium hover:shadow-large"
                  >
                    <div className="w-12 h-12 bg-trinity-red rounded-lg flex items-center justify-center mb-4">
                      <FiZap className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-heading font-semibold text-white mb-3">
                      Built in 48 Hours
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      We handle everything from design to launch. Your site goes live in just two days, not weeks or months.
                    </p>
                  </motion.div>
                </ScrollAnimation>

                <ScrollAnimation delay={0.2}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="p-8 glass-effect rounded-xl border-2 border-gray-700 hover:border-trinity-red transition-all duration-300 shadow-medium hover:shadow-large"
                  >
                    <div className="w-12 h-12 bg-trinity-red rounded-lg flex items-center justify-center mb-4">
                      <FiMessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-heading font-semibold text-white mb-3">
                      Dashboard Access
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      Request updates, check invoices, and message us directly through your SeeZee Dashboard. No more waiting weeks for changes.
                    </p>
                  </motion.div>
                </ScrollAnimation>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Section 8 — Final CTA */}
      <section className="py-24 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8">
                <span className="gradient-text">Let's launch</span>{' '}
                <span className="text-white">your site.</span>
              </h2>
              <p className="text-lg text-white mb-8 leading-relaxed">
                You run the business. We'll handle the website. Fast setup, lifetime maintenance, and a dashboard that keeps it all simple.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-trinity-red text-white rounded-lg hover:bg-trinity-maroon transition-all duration-200 font-semibold text-lg shadow-medium transform hover:-translate-y-1 glow-on-hover focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Book Free Call
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white rounded-lg hover:bg-gray-900 hover:text-white transition-all duration-200 font-semibold text-lg border-2 border-white hover:border-trinity-red glow-on-hover focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  See Pricing
                </Link>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  )
}
