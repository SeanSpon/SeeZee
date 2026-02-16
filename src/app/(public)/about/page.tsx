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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
              >
                Your community technology partner — built on trust and real support.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl md:text-2xl text-gray-300 leading-relaxed"
              >
                SeeZee Studio provides hands-on technical support, consulting, and custom solutions for schools, nonprofits, and community organizations in Louisville and beyond.
              </motion.p>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-[#1a2332]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
                How SeeZee Started
              </h2>
            </ScrollAnimation>
            <ScrollAnimation delay={0.1}>
              <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                <p>
                  SeeZee started with a simple idea: community organizations deserve better technology support.
                </p>
                <p>
                  We began as two high school friends — Sean and Zach — helping local organizations with their technology needs. Through FBLA competitions and real client projects, we learned how to solve problems, explain technology clearly, and build systems that actually work for real people.
                </p>
                <p className="text-xl text-white font-semibold pt-4">
                  We kept seeing the same problem:
                </p>
                <p>
                  Schools, nonprofits, and local organizations needed reliable technology help, but their options were limited.
                </p>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start">
                    <span className="text-cyan-400 mr-3">•</span>
                    <span>Big IT companies wanted enterprise contracts and didn't understand community needs.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-400 mr-3">•</span>
                    <span>DIY solutions led to frustration and wasted time.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-400 mr-3">•</span>
                    <span>Freelancers would fix one thing and disappear.</span>
                  </li>
                </ul>
                <p className="text-xl text-white font-semibold pt-4">
                  So we built SeeZee differently.
                </p>
                <p>
                  We provide hands-on support, clear communication, and long-term partnerships. From fixing everyday problems to building custom solutions, we're here to help community organizations thrive.
                </p>
                <p>
                  We don't disappear after setup — we stick around, answer questions, and evolve your systems as your organization grows.
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Our Roots Section - Trinity High School, FBLA, Beta Club */}
      <section className="py-20 bg-[#0a1128]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
                Our Roots
              </h2>
            </ScrollAnimation>
            <ScrollAnimation delay={0.1}>
              <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                <p>
                  SeeZee was born at <span className="text-white font-semibold">Trinity High School</span>, where Sean and Zach first discovered their passion for helping people with technology.
                </p>
                <p>
                  Through our involvement with <span className="text-white font-semibold">FBLA (Future Business Leaders of America)</span>, we learned how to solve real problems under pressure. FBLA competitions taught us to listen carefully, communicate clearly, and deliver solutions that actually work for the people using them.
                </p>
                <p>
                  Our early work — helping local organizations with technology challenges — showed us there was a real need. Community organizations wanted a technology partner they could trust, not just a vendor who would take their money and disappear.
                </p>
                <p className="text-xl text-white font-semibold pt-4">
                  That's when SeeZee became more than a school project — it became a mission.
                </p>
                <p>
                  Today, we provide hands-on support and custom solutions for schools, nonprofits, and community organizations. From everyday technology help to building accessible platforms that serve hundreds of people, we're here to make technology work for our community.
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
      <section className="py-20 bg-[#1a2332]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <ScrollAnimation>
            <h2 className="text-3xl md:text-4xl text-white text-center mb-12 font-bold">
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
                      We're Sean and Zach — your local technology partners from Louisville who started working together through FBLA at Trinity High School.
                    </p>
                    <p>
                      What began as school projects became a mission: helping community organizations get the technology support they deserve, with solutions that are accessible, reliable, and built for real people.
                    </p>
                    <p>
                      Gabe rounds out our team, bringing hands-on problem-solving when situations require extra support.
                    </p>
                    <p>
                      We treat every organization like a long-term partner. We explain everything in plain language, respond quickly when you need help, and we're committed to being there for the long haul.
                    </p>
                  </div>
                </ScrollAnimation>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section className="py-20 bg-[#0a1128]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <ScrollAnimation>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Meet the Team
              </h2>
            </div>
          </ScrollAnimation>

          <div className="max-w-5xl mx-auto space-y-16">
            {/* Sean */}
            <ScrollAnimation delay={0.1}>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className="flex flex-col md:flex-row gap-8 items-start p-8 md:p-10 rounded-xl hover:shadow-xl transition-all bg-gray-900/50 border border-gray-700 hover:border-cyan-500/40 backdrop-blur-sm"
              >
                <div className="w-32 h-32 rounded-full mx-auto md:mx-0 flex-shrink-0 shadow-lg overflow-hidden border-4 border-cyan-500 relative group">
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
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Sean McCulloch
                  </h3>
                  <p className="text-trinity-red font-semibold mb-4 text-lg">Co-Founder & Technical Lead</p>
                  <div className="space-y-4 text-base md:text-lg text-gray-300 leading-relaxed mb-6">
                    <p>
                      Sean leads technical support and system development for SeeZee — solving real-world problems and building solutions that actually work.
                    </p>
                    <p>
                      He provides hands-on support (on-site and remote), builds accessible web platforms, and creates automation tools that save time and reduce frustration.
                    </p>
                    <p className="text-white font-semibold">
                      His approach: understand the real problem first, then build the right solution.
                    </p>
                  </div>
                  <div className="mb-6">
                    <h4 className="text-white font-semibold mb-3">Sean handles:</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Technical support (on-site & remote)</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span>System troubleshooting & problem-solving</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Web development & accessible design</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Automation & workflow tools</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Database & system architecture</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span>AI-powered solutions</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-gray-300 italic mb-4">
                    Sean builds technology that helps people — not confuses them.
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
                className="flex flex-col md:flex-row gap-8 items-start p-8 md:p-10 rounded-xl hover:shadow-xl transition-all bg-gray-900/50 border border-gray-700 hover:border-cyan-500/40 backdrop-blur-sm"
              >
                <div className="w-32 h-32 rounded-full mx-auto md:mx-0 flex-shrink-0 shadow-lg overflow-hidden border-4 border-cyan-500 relative group">
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
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Zach Robards
                  </h3>
                  <p className="text-trinity-red font-semibold mb-4 text-lg">Co-Founder & Consulting Lead</p>
                  <div className="space-y-4 text-base md:text-lg text-gray-300 leading-relaxed mb-6">
                    <p>
                      Zach handles consulting and partner relationships.
                    </p>
                    <p>
                      He works directly with organizations to understand their needs, explain options clearly, and help them make smart technology decisions that fit their budget and goals.
                    </p>
                    <p>
                      He also contributes to development — ensuring every solution is practical, user-friendly, and actually serves the people who will use it.
                    </p>
                  </div>
                  <div className="mb-6">
                    <h4 className="text-white font-semibold mb-3">Zach handles:</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Technology consulting & decision support</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Partner communication & relationship building</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Project planning & coordination</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Content & user experience</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Training & documentation</span>
                      </li>
                      <li className="flex items-start">
                        <FiCheck className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Long-term partnership management</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-gray-300 italic mb-4">
                    Zach ensures every organization gets solutions that actually fit their needs and budget.
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
      <section className="py-20 bg-[#1a2332]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
                What We Believe
              </h2>
            </ScrollAnimation>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: <FiTool className="w-8 h-8" />,
                  title: 'Hands-On Support',
                  description: 'We provide real technical help — on-site when needed, remote when convenient. When you have a problem, you get a person who cares, not a ticket number.',
                },
                {
                  icon: <FiUsers className="w-8 h-8" />,
                  title: 'Clear Communication',
                  description: 'No tech jargon. No confusing proposals. We explain everything in plain language and make sure you understand your options before making decisions.',
                },
                {
                  icon: <FiHeart className="w-8 h-8" />,
                  title: 'Community Focused',
                  description: 'We prioritize organizations doing meaningful work — schools, nonprofits, and community groups. Technology should help your mission, not get in the way.',
                },
                {
                  icon: <FiShield className="w-8 h-8" />,
                  title: 'Long-Term Partnership',
                  description: 'We don\'t disappear after setup. We provide ongoing support, answer questions when you need help, and evolve your systems as your organization grows.',
                },
                {
                  icon: <FiEye className="w-8 h-8" />,
                  title: 'Accessibility First',
                  description: 'Every solution we build is designed for real people — including those who struggle with typical technology. Clean interfaces, clear navigation, and thoughtful design.',
                },
                {
                  icon: <FiAward className="w-8 h-8" />,
                  title: 'Trust Through Results',
                  description: 'We build trust by showing up, solving problems, and delivering on our promises. Our FBLA background taught us to work hard and earn every relationship.',
                },
              ].map((value, index) => (
                <ScrollAnimation key={index} delay={index * 0.1}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="p-6 rounded-xl bg-gray-900/50 border border-gray-700 hover:border-cyan-500/40 transition-all duration-300 backdrop-blur-sm"
                  >
                    <div className="text-cyan-400 mb-4">{value.icon}</div>
                    <h3 className="text-xl font-semibold text-white mb-3">
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
      <section className="py-20 bg-[#0a1128]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
                Who We Build For
              </h2>
            </ScrollAnimation>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { emoji: '🏫', title: 'Schools & Education', desc: 'Technology support and systems for learning environments' },
                { emoji: '❤️', title: 'Nonprofits', desc: 'Accessible solutions for mission-driven organizations' },
                { emoji: '🏛️', title: 'Community Organizations', desc: 'Local groups that need reliable technology help' },
                { emoji: '🏪', title: 'Local Businesses', desc: 'Louisville-area businesses serving their communities' },
                { emoji: '⛪', title: 'Faith-Based Organizations', desc: 'Churches and religious groups building community connections' },
                { emoji: '🤝', title: 'Service Providers', desc: 'Healthcare, social services, and professional practices' },
              ].map((group, index) => (
                <ScrollAnimation key={index} delay={index * 0.1}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="p-6 rounded-xl bg-gray-900/50 border border-gray-700 hover:border-cyan-500/40 transition-all duration-300 backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl flex-shrink-0">{group.emoji}</div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">
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
      <section className="py-20 bg-[#1a2332]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
                How We Work
              </h2>
            </ScrollAnimation>
            <div className="space-y-6">
              {[
                {
                  icon: <FiTool className="w-8 h-8" />,
                  title: 'We Start With Support',
                  description: 'Before building anything new, we understand your current situation. We provide hands-on help with existing problems and earn trust through real problem-solving.',
                },
                {
                  icon: <FiHeart className="w-8 h-8" />,
                  title: 'We Design For Real People',
                  description: 'Every solution is tested for accessibility and ease of use. We ask: "Can someone who struggles with technology use this comfortably?" If not, we improve it.',
                },
                {
                  icon: <FiMail className="w-8 h-8" />,
                  title: 'We Communicate Clearly & Patiently',
                  description: 'No jargon. No tech-speak. No assumptions. We explain everything in plain language and make sure you\'re comfortable every step of the way.',
                },
                {
                  icon: <FiShield className="w-8 h-8" />,
                  title: 'We Stay With You Long-Term',
                  description: 'We don\'t set up and disappear. We\'re committed to ongoing support, answering questions, and helping your organization grow. Your success is our success.',
                },
              ].map((principle, index) => (
                <ScrollAnimation key={index} delay={index * 0.1}>
                  <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-700 backdrop-blur-sm">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-cyan-400 flex-shrink-0">{principle.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">
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
      <section className="py-20 bg-[#0a1128]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="max-w-4xl mx-auto">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
                Why We Do This
              </h2>
            </ScrollAnimation>
            <ScrollAnimation delay={0.1}>
              <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                <p>
                  SeeZee exists because community organizations deserve a technology partner they can trust.
                </p>
                <p>
                  Too many schools, nonprofits, and local groups are stuck with unreliable technology, confusing systems, and vendors who disappear after the sale. You need a partner who shows up, solves problems, and sticks around.
                </p>
                <p className="text-xl text-white font-semibold">
                  That's what we do.
                </p>
                <p>We provide:</p>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start">
                    <FiCheck className="w-6 h-6 text-cyan-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Hands-on technical support (on-site and remote)</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="w-6 h-6 text-cyan-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Technology consulting and decision support</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="w-6 h-6 text-cyan-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Custom web development and accessible platforms</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="w-6 h-6 text-cyan-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Automation and AI solutions that save time</span>
                  </li>
                </ul>
                <p className="text-xl text-white font-semibold pt-4">
                  We're not just a technology vendor.
                </p>
                <p className="text-2xl text-cyan-400 font-bold">
                  We're your community technology partner.
                </p>
                <p className="text-lg text-gray-300 pt-4">
                  Built on trust, real support, and a genuine commitment to helping your organization succeed.
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-red-500 py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Ready for a Technology Partner You Can Trust?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Whether you're a school, nonprofit, community organization, or local business — we'd love to learn about your needs.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/start"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-red-500 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl"
              >
                Start a Project
              </Link>
              <Link
                href="/start/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-[1.03] hover:bg-white/10"
              >
                Book a Consult
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
