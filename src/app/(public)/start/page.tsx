'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FiGlobe,
  FiShoppingCart,
  FiLayout,
  FiCode,
  FiArrowRight,
  FiCheck,
  FiClock,
  FiPackage,
  FiZap,
  FiInfo
} from 'react-icons/fi';
import PageShell from '@/components/PageShell';
import FloatingShapes from '@/components/shared/FloatingShapes';

interface ProjectType {
  icon: React.ReactNode;
  emoji: string;
  title: string;
  description: string;
  features: string[];
  popular?: boolean;
}

const projectTypes: ProjectType[] = [
  {
    icon: <FiGlobe className="w-8 h-8" />,
    emoji: '🌐',
    title: 'Marketing Website',
    description: 'Professional website for your business or organization. Perfect for showcasing services, building credibility, and generating leads.',
    features: [
      '5-10 custom pages',
      'Contact forms & CTAs',
      'Mobile responsive design',
      'Basic SEO optimization',
      'Content management',
      'Analytics setup',
    ],
    popular: true,
  },
  {
    icon: <FiShoppingCart className="w-8 h-8" />,
    emoji: '🛒',
    title: 'E-commerce Store',
    description: 'Full-featured online store with payment processing, inventory management, and customer accounts.',
    features: [
      'Product catalog & search',
      'Shopping cart & checkout',
      'Payment integration (Stripe)',
      'Order management',
      'Customer accounts',
      'Admin dashboard',
    ],
  },
  {
    icon: <FiLayout className="w-8 h-8" />,
    emoji: '📱',
    title: 'Web Application',
    description: 'Custom web app with user authentication, dashboards, and business logic tailored to your needs.',
    features: [
      'User authentication',
      'Custom dashboards',
      'Database integration',
      'API development',
      'Real-time features',
      'Advanced functionality',
    ],
  },
  {
    icon: <FiCode className="w-8 h-8" />,
    emoji: '⚡',
    title: 'Landing Page',
    description: 'Single-page website optimized for conversions. Great for product launches, events, or campaigns.',
    features: [
      'Single conversion-focused page',
      'Lead capture forms',
      'Fast loading speed',
      'Mobile optimized',
      'A/B testing ready',
    ],
  },
  {
    icon: <FiPackage className="w-8 h-8" />,
    emoji: '🔧',
    title: 'Maintenance Plan',
    description: 'Ongoing support with included hours each quarter/year. Priority service and unlimited change requests.',
    features: [
      'Priority 24hr response time',
      'Security & backup management',
      'Emergency same-day fixes',
      'Monthly performance reports',
      'Unlimited change requests',
    ],
  },
];


export default function StartProjectPage() {
  return (
    <PageShell>
      <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#0A0E27] to-[#1a0f2e]">
        <FloatingShapes />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>
        
        {/* Hero Section */}
        <section className="relative z-10 pt-24 pb-12 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl font-bold text-white mb-4">
                Let's Work Together
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                Whether you need hands-on support or a custom solution, we're here to help. 
                Tell us about your organization and let's find the right fit.
              </p>
              
              {/* Community Partner Explainer */}
              <div className="inline-block bg-cyan-500/10 border border-cyan-500/30 rounded-xl px-6 py-4 mb-4">
                <div className="flex items-center gap-3 text-cyan-400">
                  <FiInfo className="w-5 h-5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold">How We Work</p>
                    <p className="text-sm text-gray-300">
                      Every project starts with a conversation. Tell us what you need
                      and we'll put together a plan that fits.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <FiCheck className="text-green-400" /> Free Consultation
                </span>
                <span className="flex items-center gap-1">
                  <FiCheck className="text-green-400" /> Long-Term Support
                </span>
                <span className="flex items-center gap-1">
                  <FiCheck className="text-green-400" /> Community Focused
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Project Types Grid */}
        <section className="relative z-10 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-bold text-white mb-2">
                Choose Your Project Type
              </h2>
              <p className="text-gray-400 mb-4">Select what best fits your needs</p>
              <p className="text-gray-500 text-sm">
                Not sure what you need?{' '}
                <Link href="/contact" className="text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors">
                  Just send us a message
                </Link>{' '}
                or call <a href="tel:+15024352986" className="text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors">(502) 435-2986</a> and we'll figure it out together.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {projectTypes.map((project, index) => (
                <motion.div
                  key={project.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  <Link
                    href={project.title === 'Maintenance Plan' ? '/contact?inquiry=existing-issue' : `/contact?inquiry=new-website`}
                    className="block h-full group"
                  >
                    <div className={`bg-gray-900/50 border rounded-2xl p-6 h-full hover:shadow-xl transition-all duration-300 ${
                      project.popular 
                        ? 'border-cyan-500/50 ring-2 ring-cyan-500/20' 
                        : 'border-gray-800 hover:border-gray-700'
                    }`}>
                      {/* Popular Badge */}
                      {project.popular && (
                        <div className="absolute -top-3 -right-3 bg-cyan-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Popular
                        </div>
                      )}

                      {/* Icon */}
                      <div className="text-5xl mb-4">{project.emoji}</div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-white mb-2">
                        {project.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                        {project.description}
                      </p>

                      {/* Scoping Info */}
                      <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-300 font-medium">Scoped to your needs</p>
                      </div>

                      {/* Feature List */}
                      <ul className="space-y-1.5 mb-4">
                        {project.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-gray-500">
                            <FiCheck className="text-green-400 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Button */}
                      <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm group-hover:bg-cyan-600">
                        Let's Talk
                        <FiArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Ongoing Support CTA Section */}
        <section className="relative z-10 py-16 px-6 bg-white/5">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 mb-4">
                <FiPackage className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Ongoing Support</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Need Ongoing Help?
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                We offer flexible support plans for updates, fixes, and enhancements.
                Let's find the right arrangement for your needs.
              </p>
              <Link
                href="/contact?inquiry=existing-issue"
                className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105"
              >
                Let's Talk About Support
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>
        {/* How It Works Section */}
        <section className="relative z-10 py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                How It Works
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Simple, transparent process from start to launch
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  step: '1',
                  title: 'Tell Us What You Need',
                  description: 'Send us a message about your project',
                  icon: <FiLayout className="w-8 h-8" />,
                },
                {
                  step: '2',
                  title: "We'll Talk It Through",
                  description: 'Free consultation to understand your needs',
                  icon: <FiCheck className="w-8 h-8" />,
                },
                {
                  step: '3',
                  title: 'Get a Custom Plan',
                  description: 'Receive a tailored proposal',
                  icon: <FiClock className="w-8 h-8" />,
                },
                {
                  step: '4',
                  title: 'We Build It',
                  description: 'Track progress in real-time',
                  icon: <FiZap className="w-8 h-8" />,
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-600/20 rounded-full mb-4 text-cyan-400 border border-cyan-500/30">
                    {item.icon}
                  </div>
                  <div className="text-3xl font-bold text-cyan-500 mb-2">{item.step}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Maintenance Plan CTA */}
        <section className="relative z-10 py-16 px-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/30 rounded-full px-4 py-2 mb-6">
                <FiPackage className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-300">Recommended</span>
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">
                Keep Your Site Running Smoothly
              </h2>
              <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                Our maintenance plans include priority support, security updates,
                regular backups, and dedicated hours each quarter so your site
                stays fast, secure, and up to date.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8 text-left">
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                  <div className="text-cyan-400 mb-3">
                    <FiCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Priority Support</h3>
                  <p className="text-sm text-gray-400">
                    Fast response times and emergency same-day fixes when you need them most.
                  </p>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                  <div className="text-cyan-400 mb-3">
                    <FiZap className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Security & Performance</h3>
                  <p className="text-sm text-gray-400">
                    Regular updates, monitoring, and backups to keep everything running at its best.
                  </p>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                  <div className="text-cyan-400 mb-3">
                    <FiClock className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Included Hours</h3>
                  <p className="text-sm text-gray-400">
                    Dedicated hours each quarter for updates, improvements, and new features.
                  </p>
                </div>
              </div>

              <Link
                href="/contact?inquiry=existing-issue"
                className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105"
              >
                Learn More About Maintenance
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Questions / Support Section */}
        <section className="relative z-10 py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                Have Questions?
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                We're happy to learn about your organization, understand your challenges, and 
                discuss how we can help. No pressure, just a real conversation.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                >
                  Schedule a Call
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all duration-200"
                >
                  Send a Message
                  <FiArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
