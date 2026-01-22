'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { 
  FiGlobe, 
  FiShoppingCart, 
  FiLayout, 
  FiCode,
  FiArrowRight,
  FiCheck,
  FiClock,
  FiDollarSign,
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
  estimatedHours: string;
  typicalCost: string;
  features: string[];
  popular?: boolean;
}

const projectTypes: ProjectType[] = [
  {
    icon: <FiGlobe className="w-8 h-8" />,
    emoji: '🌐',
    title: 'Marketing Website',
    description: 'Professional website for your business or organization. Perfect for showcasing services, building credibility, and generating leads.',
    estimatedHours: '40-80 hours',
    typicalCost: '$3,000 - $6,000',
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
    estimatedHours: '80-150 hours',
    typicalCost: '$6,000 - $12,000',
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
    estimatedHours: '100-200+ hours',
    typicalCost: '$8,000 - $20,000+',
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
    estimatedHours: '15-30 hours',
    typicalCost: '$1,200 - $2,400',
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
    estimatedHours: 'Quarterly or Annual',
    typicalCost: '$2,000/quarter',
    features: [
      '30 hours per quarter included',
      'Priority 24hr response time',
      'Security & backup management',
      'Emergency same-day fixes',
      'Monthly performance reports',
      'Unlimited change requests',
    ],
  },
];

// Hour pack add-ons (matching client/hours page pricing)
interface HourPack {
  id: string;
  name: string;
  hours: number;
  price: number;
  description: string;
  popular?: boolean;
}

const hourPacks: HourPack[] = [
  {
    id: 'SMALL',
    name: 'Starter Pack',
    hours: 5,
    price: 350,
    description: 'Quick updates & minor fixes',
  },
  {
    id: 'MEDIUM',
    name: 'Growth Pack',
    hours: 10,
    price: 650,
    description: 'Ongoing improvements',
    popular: true,
  },
  {
    id: 'LARGE',
    name: 'Scale Pack',
    hours: 20,
    price: 1200,
    description: 'Major enhancements',
  },
];

export default function StartProjectPage() {
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [showEstimator, setShowEstimator] = useState(false);

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
                      Development projects billed at <strong>$75/hour</strong>. We also offer ongoing support and consulting. 
                      Every engagement starts with understanding your real needs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <FiCheck className="text-green-400" /> Transparent Pricing
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
              <p className="text-gray-400">Select what best fits your needs</p>
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
                    href={project.title === 'Maintenance Plan' ? '/client/hours#select-plan' : `/start/questionnaire?type=${project.title.toLowerCase().replace(/\s+/g, '-')}`}
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

                      {/* Pricing Info */}
                      <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                          <FiClock className="w-3 h-3" />
                          <span>{project.estimatedHours}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-white">
                          <FiDollarSign className="w-4 h-4" />
                          <span>{project.typicalCost}</span>
                        </div>
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
                        Get Started
                        <FiArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Hour Extension Packs Section */}
        <section className="relative z-10 py-16 px-6 bg-white/5">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 mb-4">
                <FiPackage className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">No Maintenance Plan?</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Buy Hour Packs Instead
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Not ready for a monthly maintenance plan? Purchase hour packs 
                as needed for updates, fixes, and enhancements.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {hourPacks.map((pack, index) => (
                <motion.div
                  key={pack.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className={`bg-gray-900/50 border rounded-2xl p-6 ${
                    pack.popular 
                      ? 'border-purple-500/50 ring-2 ring-purple-500/20' 
                      : 'border-gray-800'
                  }`}
                >
                  {pack.popular && (
                    <div className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                      <FiZap className="w-3 h-3" />
                      Best Value
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-white mb-2">{pack.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">{pack.description}</p>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold text-white">
                      ${pack.price}
                    </span>
                    <span className="text-gray-400">/ {pack.hours} hours</span>
                  </div>

                  <div className="text-sm text-gray-500 mb-4">
                    ${Math.round(pack.price / pack.hours)}/hour effective rate
                  </div>

                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-2 text-sm text-gray-400">
                      <FiCheck className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Use anytime within {pack.hours <= 5 ? '60' : pack.hours <= 10 ? '90' : '120'} days</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-400">
                      <FiCheck className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>No recurring fees</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-400">
                      <FiCheck className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Roll unused hours to next pack</span>
                    </li>
                  </ul>

                  <Link
                    href="/client/hours#hour-packs"
                    className="block w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold px-4 py-3 rounded-lg transition-all duration-200 text-center"
                  >
                    Purchase Pack
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-400 mb-4">
                Or choose a <strong className="text-white">monthly maintenance plan</strong> for ongoing support with included hours
              </p>
              <Link
                href="/client/hours#select-plan"
                className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium"
              >
                View Maintenance Plans
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
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
                  title: 'Pick Project Type',
                  description: 'Choose what you need built',
                  icon: <FiLayout className="w-8 h-8" />,
                },
                {
                  step: '2',
                  title: 'Answer Questions',
                  description: 'Help us understand your vision',
                  icon: <FiCheck className="w-8 h-8" />,
                },
                {
                  step: '3',
                  title: 'Get Hour Estimate',
                  description: 'Receive transparent pricing',
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
                Save with a Maintenance Plan
              </h2>
              <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                Get ongoing support, priority service, and included monthly hours 
                for a lower effective rate than buying hour packs.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8 text-left">
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-2">Quarterly Plan</h3>
                  <div className="text-3xl font-bold text-white mb-1">$2,000</div>
                  <div className="text-sm text-gray-400 mb-4">per quarter (30 hours included)</div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-gray-400">
                      <FiCheck className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Priority 24hr response</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-400">
                      <FiCheck className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Security updates & backups</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-400">
                      <FiCheck className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>$67/hour effective rate</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-900/50 border border-cyan-500/50 rounded-xl p-6 ring-2 ring-cyan-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">Annual Plan</h3>
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-semibold">
                      Save 15%
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">$6,800</div>
                  <div className="text-sm text-gray-400 mb-4">per year (120 hours included)</div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-gray-400">
                      <FiCheck className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Everything in Quarterly</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-400">
                      <FiCheck className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Quarterly strategy reviews</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-400">
                      <FiCheck className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>$57/hour effective rate</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Link
                href="/start/questionnaire?showMaintenance=true"
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
                  href="/start/questionnaire"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all duration-200"
                >
                  Start Questionnaire
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
