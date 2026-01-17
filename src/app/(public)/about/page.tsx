'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import ScrollAnimation from '@/components/shared/ScrollAnimation'
import ImageLightbox from '@/components/shared/ImageLightbox'
import { 
  FiArrowRight, 
  FiCheck, 
  FiHeart, 
  FiUsers, 
  FiShield, 
  FiEye,
  FiTool,
  FiAward,
  FiBook,
  FiZap,
  FiMail
} from 'react-icons/fi'
import { FaInstagram, FaGithub, FaLinkedin } from 'react-icons/fa'

export default function AboutPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gray-900 py-24 lg:py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
          <ScrollAnimation>
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-[56px] font-heading font-bold text-white mb-6 leading-tight"
              >
                Built by Sean and Zach — two developers who build systems that work.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl md:text-2xl text-gray-300 leading-relaxed"
              >
                SeeZee Studio is a development team from Louisville building modern web platforms for businesses that need reliable technology without enterprise complexity.
              </motion.p>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold text-white mb-8 text-center">
                How SeeZee Started
              </h2>
            </ScrollAnimation>
            <ScrollAnimation delay={0.1}>
              <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                <p>
                  SeeZee didn't start as a typical web agency.
                </p>
                <p>
                  We began with two high school friends — Sean and Zach — building websites for FBLA competitions and real client projects. We learned fast by working on complex systems with real requirements: payment processing, user management, automated workflows, and scalable architecture.
                </p>
                <p className="text-xl text-white font-semibold pt-4">
                  But we kept seeing the same problem:
                </p>
                <p>
                  Growing businesses and service organizations needed custom platforms, but traditional agencies were charging $50k+ and taking months just to deliver a basic MVP.
                </p>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start">
                    <span className="text-trinity-red mr-3">•</span>
                    <span>Enterprise agencies wanted huge budgets and endless meetings.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-trinity-red mr-3">•</span>
                    <span>DIY platforms couldn't handle custom business logic.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-trinity-red mr-3">•</span>
                    <span>And freelancers would build it, then disappear.</span>
                  </li>
                </ul>
                <p className="text-xl text-white font-semibold pt-4">
                  So we built SeeZee differently.
                </p>
                <p>
                  We build fast, we price transparently, and we stick around. Modern tech stack, clean code, and real support — without the enterprise price tag.
                </p>
                <p>
                  We don't disappear after launch — we maintain, optimize, and scale your platform as your business grows.
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Our Roots Section - Trinity High School, FBLA, Beta Club */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold text-white mb-8 text-center">
                Our Roots
              </h2>
            </ScrollAnimation>
            <ScrollAnimation delay={0.1}>
              <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                <p>
                  SeeZee was born at <span className="text-white font-semibold">Trinity High School</span>, where Sean and Zach first discovered their passion for building technology that actually works.
                </p>
                <p>
                  Through our involvement with <span className="text-white font-semibold">FBLA (Future Business Leaders of America)</span>, we learned how to build professional systems under pressure. FBLA competitions taught us to scope projects realistically, deliver on tight deadlines, and present technical work clearly to non-technical stakeholders.
                </p>
                <p>
                  Our early projects — full-stack platforms built for FBLA competitions and real clients — showed us there was a gap in the market. Growing businesses needed custom solutions but couldn't afford enterprise agencies.
                </p>
                <p className="text-xl text-white font-semibold pt-4">
                  That's when SeeZee became more than a school project — it became a real business.
                </p>
                <p>
                  Today, we build production-ready platforms for clients who need reliable technology fast. We've worked on donation systems processing real payments, user management platforms serving hundreds of people, and custom business tools that actually get used daily.
                </p>
              </div>
            </ScrollAnimation>
            
            {/* Logos Section */}
            <ScrollAnimation delay={0.2}>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 md:gap-12">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center bg-white rounded-xl p-4 shadow-lg"
                >
                  <Image
                    src="/logos/trinity-logo.png"
                    alt="Trinity High School"
                    width={140}
                    height={140}
                    className="h-24 w-auto object-contain"
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center bg-white rounded-xl p-4 shadow-lg"
                >
                  <Image
                    src="/logos/fbla-logo.png"
                    alt="FBLA - Future Business Leaders of America"
                    width={180}
                    height={100}
                    className="h-20 w-auto object-contain"
                  />
                </motion.div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Sean & Zach Photo Section */}
      <section className="py-16 bg-[#1a2332]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <ScrollAnimation>
            <h2 className="text-3xl text-white text-center mb-12 font-heading font-bold">
              Sean & Zach
            </h2>
          </ScrollAnimation>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-5 gap-8 items-start">
              {/* Left Column - Photo (40%) */}
              <div className="md:col-span-2">
                <ScrollAnimation delay={0.1}>
                  <div className="relative">
                    <ImageLightbox
                      src="/sean-zach-photo.png"
                      alt="Zach, Sean, and Gabe at prom"
                      width={600}
                      height={800}
                      className="rounded-[20px] shadow-2xl w-full h-auto object-cover"
                      caption="Left to right: Zach, Sean, Gabe"
                    />
                    <p className="mt-3 text-sm font-mono text-cyan-400 text-center">
                      Left to right: Zach, Sean, Gabe
                    </p>
                  </div>
                </ScrollAnimation>
              </div>
              
              {/* Right Column - Text (60%) */}
              <div className="md:col-span-3">
                <ScrollAnimation delay={0.2}>
                  <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                    <p>
                      We're Sean and Zach — two developers from Louisville who started building together through FBLA competitions at Trinity High School.
                    </p>
                    <p>
                      What began as school projects quickly became something more serious: a mission to build technology that's calm, accessible, and actually works for people who struggle with typical websites.
                    </p>
                    <p>
                      Gabe rounds out our team, bringing hands-on problem-solving when projects get complicated.
                    </p>
                    <p>
                      We're early-stage, but we build like professionals. We ship working prototypes, explain everything in plain English, and we're committed to sticking around after launch.
                    </p>
                  </div>
                </ScrollAnimation>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <ScrollAnimation>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold text-white mb-4">
                Meet the Team
              </h2>
            </div>
          </ScrollAnimation>

          <div className="max-w-5xl mx-auto space-y-16">
            {/* Sean */}
            <ScrollAnimation delay={0.1}>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className="flex flex-col md:flex-row gap-8 items-start p-8 md:p-10 rounded-2xl hover:shadow-xl transition-all bg-gray-800 border-2 border-gray-700 hover:border-trinity-red"
              >
                <div className="w-32 h-32 rounded-full mx-auto md:mx-0 flex-shrink-0 shadow-lg overflow-hidden border-4 border-trinity-red relative group">
                  <Image
                    src="/sean-profile.png"
                    alt="Sean McCulloch"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                  {/* Hover Overlay with Social Icons */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <a
                      href="https://www.instagram.com/sean.mcculloch7/?hl=en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-pink-400 transition-colors"
                      aria-label="Instagram"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaInstagram className="w-6 h-6" />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/sean-mcculloch-58a3761a9/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-blue-400 transition-colors"
                      aria-label="LinkedIn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaLinkedin className="w-6 h-6" />
                    </a>
                    <a
                      href="https://github.com/SeanSpon"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-gray-300 transition-colors"
                      aria-label="GitHub"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaGithub className="w-6 h-6" />
                    </a>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-2">
                    Sean McCulloch
                  </h3>
                  <p className="text-trinity-red font-semibold mb-4 text-lg">Co-Founder & Technical Director</p>
                  <div className="space-y-4 text-base md:text-lg text-gray-300 leading-relaxed mb-6">
                    <p>
                      Sean builds the systems that power SeeZee — full-stack platforms with clean architecture and scalable design.
                    </p>
                    <p>
                      He specializes in modern web development: Next.js, React, TypeScript, PostgreSQL, and building systems that are fast, maintainable, and actually work under real-world conditions.
                    </p>
                    <p className="text-white font-semibold">
                      Every system he builds follows one principle: "If it's not production-ready, it's not done."
                    </p>
                  </div>
                  <div className="mb-6">
                    <h4 className="text-white font-semibold mb-3">Sean handles:</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-trinity-red mr-2 flex-shrink-0 mt-0.5" />
                        <span>Frontend & backend development</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-trinity-red mr-2 flex-shrink-0 mt-0.5" />
                        <span>Database architecture</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-trinity-red mr-2 flex-shrink-0 mt-0.5" />
                        <span>Admin dashboard design</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-trinity-red mr-2 flex-shrink-0 mt-0.5" />
                        <span>Payment & donation integrations</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-trinity-red mr-2 flex-shrink-0 mt-0.5" />
                        <span>Performance optimization</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-trinity-red mr-2 flex-shrink-0 mt-0.5" />
                        <span>Accessible UI/UX design</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-gray-300 italic mb-4">
                    Sean builds technology that lifts people up — not locks them out.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <motion.a
                      href="https://github.com/SeanSpon"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="GitHub"
                    >
                      <FaGithub className="w-5 h-5" />
                      <span className="font-semibold">GitHub</span>
                    </motion.a>
                    <motion.a
                      href="https://www.linkedin.com/in/sean-mcculloch-58a3761a9/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="LinkedIn"
                    >
                      <FaLinkedin className="w-5 h-5" />
                      <span className="font-semibold">LinkedIn</span>
                    </motion.a>
                    <motion.a
                      href="https://www.instagram.com/sean.mcculloch7/?hl=en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Instagram"
                    >
                      <FaInstagram className="w-5 h-5" />
                      <span className="font-semibold">Follow @sean.mcculloch7</span>
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            </ScrollAnimation>

            {/* Zach */}
            <ScrollAnimation delay={0.2}>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className="flex flex-col md:flex-row gap-8 items-start p-8 md:p-10 rounded-2xl hover:shadow-xl transition-all bg-gray-800 border-2 border-gray-700 hover:border-trinity-red"
              >
                <div className="w-32 h-32 rounded-full mx-auto md:mx-0 flex-shrink-0 shadow-lg overflow-hidden border-4 border-trinity-red relative group">
                  <Image
                    src="/zach-profile.png"
                    alt="Zach Robards"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                  {/* Hover Overlay with Social Icons */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <a
                      href="https://www.instagram.com/zachrobards/?hl=en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-pink-400 transition-colors"
                      aria-label="Instagram"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaInstagram className="w-6 h-6" />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/zachary-robards-b51457337/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-blue-400 transition-colors"
                      aria-label="LinkedIn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaLinkedin className="w-6 h-6" />
                    </a>
                    <a
                      href="https://github.com/zrobards"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-gray-300 transition-colors"
                      aria-label="GitHub"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaGithub className="w-6 h-6" />
                    </a>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-2">
                    Zach Robards
                  </h3>
                  <p className="text-trinity-red font-semibold mb-4 text-lg">Co-Founder & Client Experience Director</p>
                  <div className="space-y-4 text-base md:text-lg text-gray-300 leading-relaxed mb-6">
                    <p>
                      Zach handles the business side and client experience.
                    </p>
                    <p>
                      He works directly with clients to scope projects realistically, set clear expectations, and translate business requirements into technical specifications that Sean can build.
                    </p>
                    <p>
                      He also codes — contributing to frontend development, content management systems, and ensuring every project ships on time and on budget.
                    </p>
                  </div>
                  <div className="mb-6">
                    <h4 className="text-white font-semibold mb-3">Zach handles:</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-trinity-red mr-2 flex-shrink-0 mt-0.5" />
                        <span>Client communication & project scoping</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-trinity-red mr-2 flex-shrink-0 mt-0.5" />
                        <span>Project management & timelines</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-trinity-red mr-2 flex-shrink-0 mt-0.5" />
                        <span>Frontend development & UI</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-trinity-red mr-2 flex-shrink-0 mt-0.5" />
                        <span>Content strategy & copywriting</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-trinity-red mr-2 flex-shrink-0 mt-0.5" />
                        <span>Business development</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-trinity-red mr-2 flex-shrink-0 mt-0.5" />
                        <span>Long-term client partnerships</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-gray-300 italic mb-4">
                    Zach ensures every project ships on time, on budget, and actually solves the problem it was built to solve.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <motion.a
                      href="https://github.com/zrobards"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="GitHub"
                    >
                      <FaGithub className="w-5 h-5" />
                      <span className="font-semibold">GitHub</span>
                    </motion.a>
                    <motion.a
                      href="https://www.linkedin.com/in/zachary-robards-b51457337/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="LinkedIn"
                    >
                      <FaLinkedin className="w-5 h-5" />
                      <span className="font-semibold">LinkedIn</span>
                    </motion.a>
                    <motion.a
                      href="https://www.instagram.com/zachrobards/?hl=en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaInstagram className="w-5 h-5" />
                      <span className="font-semibold">Follow @zachrobards</span>
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold text-white mb-12 text-center">
                What We Believe
              </h2>
            </ScrollAnimation>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: <FiEye className="w-8 h-8" />,
                  title: 'Clean Code, Fast Performance',
                  description: 'We build with modern tools and best practices: Next.js for performance, TypeScript for reliability, and PostgreSQL for data integrity. Every system is built to scale as your business grows.',
                },
                {
                  icon: <FiUsers className="w-8 h-8" />,
                  title: 'Transparent Pricing, Real Timelines',
                  description: 'No hidden fees. No surprise invoices. You know exactly what you\'re paying for, and we deliver on the timeline we promise. Hour-based billing means you only pay for actual work done.',
                },
                {
                  icon: <FiHeart className="w-8 h-8" />,
                  title: 'Built for Real-World Use',
                  description: 'We don\'t build MVPs that fall apart under real traffic. We build production-ready platforms with proper error handling, security, testing, and monitoring from day one.',
                },
                {
                  icon: <FiShield className="w-8 h-8" />,
                  title: 'Support Doesn\'t Disappear After Launch',
                  description: 'Most developers build it and vanish. We stick around. Maintenance plans, quarterly check-ins, and ongoing support — because your platform needs to evolve as your business grows.',
                },
                {
                  icon: <FiHeart className="w-8 h-8" />,
                  title: 'Partnerships, Not Projects',
                  description: 'We build relationships that last years — not because you\'re locked into a contract, but because we deliver quality work and actually respond when you need us.',
                },
                {
                  icon: <FiAward className="w-8 h-8" />,
                  title: 'Proven Under Pressure',
                  description: 'Our FBLA competition background taught us to build fast, present clearly, and deliver under tight deadlines. That competitive edge shows up in every client project we ship.',
                },
              ].map((value, index) => (
                <ScrollAnimation key={index} delay={index * 0.1}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="p-6 rounded-xl border-2 border-gray-700 hover:border-trinity-red transition-all duration-300 glass-effect"
                  >
                    <div className="text-trinity-red mb-4">{value.icon}</div>
                    <h3 className="text-xl font-heading font-semibold text-white mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {value.description}
                    </p>
                  </motion.div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who We Serve Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold text-white mb-12 text-center">
                Who We Build For
              </h2>
            </ScrollAnimation>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { emoji: '🚀', title: 'Growing Businesses', desc: 'SMBs that need custom platforms without enterprise pricing' },
                { emoji: '🏥', title: 'Service Organizations', desc: 'Healthcare, consulting, professional services, legal firms' },
                { emoji: '🎯', title: 'Startups & Founders', desc: 'Early-stage companies building their first scalable platform' },
                { emoji: '💼', title: 'B2B Companies', desc: 'Businesses that need internal tools, CRMs, or client portals' },
                { emoji: '🏢', title: 'Local Businesses', desc: 'Louisville-area companies ready to modernize their web presence' },
                { emoji: '❤️', title: 'Community Organizations', desc: 'Nonprofits and local groups doing meaningful work' },
              ].map((group, index) => (
                <ScrollAnimation key={index} delay={index * 0.1}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="p-6 rounded-xl border-2 border-gray-700 hover:border-trinity-red transition-all duration-300 glass-effect"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl flex-shrink-0">{group.emoji}</div>
                      <div>
                        <h3 className="text-xl font-heading font-semibold text-white mb-2">
                          {group.title}
                        </h3>
                        <p className="text-gray-300 leading-relaxed text-sm">
                          {group.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold text-white mb-12 text-center">
                How We Work
              </h2>
            </ScrollAnimation>
            <div className="space-y-6">
              {[
                {
                  icon: <FiHeart className="w-8 h-8" />,
                  title: 'We Design With Empathy First',
                  description: 'Every website we build is tested for cognitive accessibility. We ask: "Can someone with memory challenges use this? Can someone with anxiety navigate this without stress?" If the answer is no, we redesign it.',
                },
                {
                  icon: <FiTool className="w-8 h-8" />,
                  title: 'We Build Systems, Not Just Websites',
                  description: 'Donations. Events. RSVPs. Email reminders. Admin dashboards. Analytics. We don\'t just make things look good — we make them work.',
                },
                {
                  icon: <FiMail className="w-8 h-8" />,
                  title: 'We Communicate Clearly & Patiently',
                  description: 'No jargon. No tech-speak. No assumptions. We explain everything in plain language and walk clients through the process step by step.',
                },
                {
                  icon: <FiShield className="w-8 h-8" />,
                  title: 'We Stay With You Long-Term',
                  description: 'We don\'t build a site and disappear. We\'re committed to maintaining, updating, and supporting your platform as your organization evolves. Your success is our success.',
                },
              ].map((principle, index) => (
                <ScrollAnimation key={index} delay={index * 0.1}>
                  <div className="p-6 rounded-xl border-2 border-gray-700 glass-effect">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-trinity-red flex-shrink-0">{principle.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-heading font-semibold text-white mb-2">
                          {principle.title}
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                          {principle.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold text-white mb-8 text-center">
                Why We Do This
              </h2>
            </ScrollAnimation>
            <ScrollAnimation delay={0.1}>
              <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                <p>
                  SeeZee exists because growing businesses deserve reliable technology without enterprise complexity.
                </p>
                <p>
                  Too many companies are stuck between overpriced agencies that take forever, and cheap freelancers who disappear. You need a development partner who can build fast, price transparently, and actually stick around.
                </p>
                <p className="text-xl text-white font-semibold">
                  That's what we do.
                </p>
                <p>We build:</p>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start">
                    <FiCheck className="w-6 h-6 text-trinity-red mr-3 flex-shrink-0 mt-0.5" />
                    <span>Full-stack platforms with modern tech stacks</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="w-6 h-6 text-trinity-red mr-3 flex-shrink-0 mt-0.5" />
                    <span>Custom business systems that actually scale</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="w-6 h-6 text-trinity-red mr-3 flex-shrink-0 mt-0.5" />
                    <span>Production-ready code with proper testing and documentation</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="w-6 h-6 text-trinity-red mr-3 flex-shrink-0 mt-0.5" />
                    <span>Long-term partnerships with ongoing support</span>
                  </li>
                </ul>
                <p className="text-xl text-white font-semibold pt-4">
                  We're not just building websites.
                </p>
                <p className="text-2xl text-trinity-red font-bold">
                  We're building systems that grow with your business.
                </p>
                <p className="text-lg text-gray-300 pt-4">
                  And we're proving that you don't need a $100k budget to get professional, scalable technology.
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-trinity-red relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading font-bold text-white mb-6">
                Let's Build Something Powerful Together
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed">
                Whether you're a startup, growing business, service organization, or company that needs custom technology — we'd love to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/start"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-trinity-red rounded-xl hover:bg-gray-100 transition-all duration-200 font-semibold text-lg shadow-lg transform hover:-translate-y-1"
                >
                  Start Your Project
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/philosophy"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white rounded-xl hover:border-white hover:bg-white/10 transition-all duration-200 font-semibold text-lg"
                >
                  Read Our Philosophy
                </Link>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  )
}
