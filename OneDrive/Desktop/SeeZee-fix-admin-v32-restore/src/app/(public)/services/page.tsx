'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { motion } from 'framer-motion'
import ScrollAnimation from '@/components/shared/ScrollAnimation'
import ContactForm from '@/components/shared/ContactForm'
import WebsiteMockup from '@/components/shared/WebsiteMockup'
import {
  FiCheck,
  FiArrowRight,
  FiZap,
  FiDollarSign,
  FiMessageSquare,
  FiClock,
  FiGlobe,
  FiShoppingCart,
  FiTrendingUp,
} from 'react-icons/fi'

export default function ServicesPage() {
  const packages = [
    {
      id: 'starter',
      name: 'Starter Site',
      setupPrice: '$299',
      monthlyPrice: '$49',
      description: 'Perfect for small businesses getting started online',
      whoItsFor: 'Ideal for local businesses, freelancers, and startups who need a professional online presence quickly.',
      features: [
        '1–3 pages (Home, About, Contact)',
        'Mobile-responsive design',
        'Fast launch (48 hours)',
        'Hosting & security included',
        'Dashboard access for updates',
        'Basic contact form',
        'Social media integration',
        'SEO basics',
        'Monthly content updates',
      ],
      mockupType: 'starter' as const,
    },
    {
      id: 'business',
      name: 'Business Site',
      setupPrice: '$799',
      monthlyPrice: '$99',
      description: 'Ideal for growing businesses with more content needs',
      whoItsFor: 'Perfect for established businesses, service providers, and companies that need more pages and features.',
      features: [
        '5–10 pages (custom structure)',
        'Advanced SEO optimization',
        'Unlimited content updates',
        'Contact forms & lead capture',
        'Blog/news section',
        'Service/product pages',
        'Testimonials section',
        'Analytics integration',
        'Priority support',
        'Dashboard access',
        'Hosting & security included',
      ],
      mockupType: 'business' as const,
    },
    {
      id: 'ecommerce',
      name: 'E-Commerce Store',
      setupPrice: '$1,999',
      monthlyPrice: '$149',
      description: 'Complete online store with payment processing',
      whoItsFor: 'Best for businesses selling products online who need a full-featured store with secure payments.',
      features: [
        'Full online shop',
        'Stripe payment integration',
        'Product catalog management',
        'Shopping cart & checkout',
        'Inventory tracking',
        'Order management system',
        'Customer accounts',
        'Shipping calculator',
        'Product search & filters',
        'Dashboard access',
        'Hosting & security included',
        'Unlimited updates',
      ],
      mockupType: 'ecommerce' as const,
    },
  ]

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gray-900 py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>
        {/* Service-themed decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 border-2 border-trinity-red/30 rounded-lg rotate-12"></div>
          <div className="absolute top-40 right-20 w-24 h-24 border-2 border-trinity-red/20 rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 border-2 border-trinity-red/25 rounded-lg -rotate-12"></div>
          <div className="absolute bottom-40 right-1/3 w-28 h-28 border-2 border-trinity-red/20 rounded-full"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollAnimation>
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6"
              >
                <span className="gradient-text">Website Packages</span>{' '}
                <span className="text-white">Built for Your Business</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-white leading-relaxed mb-4"
              >
                Choose the perfect website package for your business. Every plan includes hosting, security, and lifetime maintenance through your SeeZee Dashboard.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg text-trinity-red font-semibold"
              >
                Fast setup. Affordable pricing. Hands-off maintenance.
              </motion.p>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Website Packages */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {packages.map((pkg, index) => (
              <ScrollAnimation key={pkg.id} delay={index * 0.1}>
                <div className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center max-w-6xl mx-auto`}>
                  {/* Content */}
                  <div className="flex-1">
                    <div className="mb-6">
                      <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-3">
                        {pkg.name}
                      </h2>
                      <p className="text-xl text-gray-100 mb-4">{pkg.description}</p>
                      <div className="flex items-baseline gap-4 mb-4">
                        <div>
                          <div className="text-3xl font-bold text-trinity-red">{pkg.setupPrice}</div>
                          <div className="text-base text-gray-100 font-medium">one-time setup</div>
                        </div>
                        <div>
                          <div className="text-2xl font-semibold text-white">
                            {pkg.monthlyPrice}
                            <span className="text-sm text-gray-100 font-normal">/month</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-100 mb-6">{pkg.whoItsFor}</p>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-4">What's Included:</h3>
                      <ul className="space-y-2">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start text-gray-100">
                            <FiCheck className="w-5 h-5 text-trinity-red mr-3 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link
                      href="/start"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-trinity-red text-white rounded-lg hover:bg-trinity-maroon transition-all duration-200 font-semibold shadow-medium transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                      Choose {pkg.name}
                      <FiArrowRight className="w-5 h-5" />
                    </Link>
                  </div>

                  {/* Mockup */}
                  <div className="flex-1 w-full max-w-md">
                    <WebsiteMockup type={pkg.mockupType} />
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              How SeeZee Works
            </h2>
            <p className="text-xl text-white max-w-2xl mx-auto">
              From your first call to a live website in under a week. Simple, fast, and stress-free.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1 */}
              <ScrollAnimation delay={0.1}>
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 bg-trinity-red rounded-full flex items-center justify-center mb-6 mx-auto text-white text-2xl font-bold shadow-large"
                  >
                    1
                  </motion.div>
                  <h3 className="text-xl font-heading font-semibold text-white mb-3">
                    Book a Call
                  </h3>
                  <p className="text-white">
                    We'll learn about your business and recommend the perfect package for your needs.
                  </p>
                </div>
              </ScrollAnimation>

              {/* Step 2 */}
              <ScrollAnimation delay={0.2}>
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 bg-trinity-red rounded-full flex items-center justify-center mb-6 mx-auto text-white text-2xl font-bold shadow-large"
                  >
                    2
                  </motion.div>
                  <h3 className="text-xl font-heading font-semibold text-white mb-3">
                    Send Your Content
                  </h3>
                  <p className="text-white">
                    Share your business info, photos, and any content you want on your site.
                  </p>
                </div>
              </ScrollAnimation>

              {/* Step 3 */}
              <ScrollAnimation delay={0.3}>
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 bg-trinity-red rounded-full flex items-center justify-center mb-6 mx-auto text-white text-2xl font-bold shadow-large"
                  >
                    3
                  </motion.div>
                  <h3 className="text-xl font-heading font-semibold text-white mb-3">
                    We Build It
                  </h3>
                  <p className="text-white">
                    We design and build everything in 48 hours. You don't need to do a thing.
                  </p>
                </div>
              </ScrollAnimation>

              {/* Step 4 */}
              <ScrollAnimation delay={0.4}>
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 bg-trinity-red rounded-full flex items-center justify-center mb-6 mx-auto text-white text-2xl font-bold shadow-large"
                  >
                    4
                  </motion.div>
                  <h3 className="text-xl font-heading font-semibold text-white mb-3">
                    Go Live
                  </h3>
                  <p className="text-white">
                    Your site launches and you get dashboard access for future updates and support.
                  </p>
                </div>
              </ScrollAnimation>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ScrollAnimation delay={0.1}>
                <div className="text-center p-6 bg-gray-900 rounded-xl border border-gray-700">
                  <FiClock className="w-8 h-8 text-trinity-red mx-auto mb-3" />
                  <h4 className="text-lg font-semibold text-white mb-2">48 Hour Build</h4>
                  <p className="text-white text-sm">Your site is live in just two days</p>
                </div>
              </ScrollAnimation>
              <ScrollAnimation delay={0.2}>
                <div className="text-center p-6 bg-gray-900 rounded-xl border border-gray-700">
                  <FiDollarSign className="w-8 h-8 text-trinity-red mx-auto mb-3" />
                  <h4 className="text-lg font-semibold text-white mb-2">Simple Pricing</h4>
                  <p className="text-white text-sm">One setup fee, one monthly payment</p>
                </div>
              </ScrollAnimation>
              <ScrollAnimation delay={0.3}>
                <div className="text-center p-6 bg-gray-900 rounded-xl border border-gray-700">
                  <FiMessageSquare className="w-8 h-8 text-trinity-red mx-auto mb-3" />
                  <h4 className="text-lg font-semibold text-white mb-2">Dashboard Access</h4>
                  <p className="text-white text-sm">Request updates anytime through your dashboard</p>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
                Ready to Start Your Project?
              </h2>
              <p className="text-xl text-white leading-relaxed">
                Let's discuss how we can help bring your vision to life. Fill out the form below and we'll get back to you soon.
              </p>
            </div>
          </ScrollAnimation>
          <ScrollAnimation delay={0.2}>
            <ContactForm />
          </ScrollAnimation>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
                Have Questions?
              </h2>
              <p className="text-xl text-white mb-8 leading-relaxed">
                We're here to help. Reach out to us anytime.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-8 py-4 bg-trinity-red text-white rounded-lg hover:bg-trinity-maroon transition-all duration-200 font-semibold text-lg shadow-medium transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Learn More About Us
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  )
}
