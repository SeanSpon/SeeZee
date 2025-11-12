'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import ScrollAnimation from '@/components/shared/ScrollAnimation'
import { FiArrowRight } from 'react-icons/fi'

export default function AboutPage() {
  return (
    <div className="w-full">
      {/* Intro Section */}
      <section className="bg-gray-900 py-24 lg:py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>
        {/* Team/about-themed decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-24 left-20 w-40 h-40 border-2 border-trinity-red/30 rounded-full"></div>
          <div className="absolute top-40 right-24 w-32 h-32 border-2 border-trinity-red/25 rounded-full"></div>
          <div className="absolute bottom-24 left-1/4 w-36 h-36 border-2 border-trinity-red/20 rounded-full"></div>
          <div className="absolute bottom-40 right-1/4 w-28 h-28 border-2 border-trinity-red/25 rounded-full"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollAnimation>
            <div className="max-w-4xl mx-auto">
              {/* Logos Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-16"
              >
                <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <Image 
                    src="/logos/trinity-logo.png" 
                    alt="Trinity High School" 
                    width={400}
                    height={150}
                    className="h-24 md:h-32 w-auto object-contain"
                  />
                </div>
                <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <Image 
                    src="/logos/fbla-logo.png" 
                    alt="Future Business Leaders of America" 
                    width={400}
                    height={120}
                    className="h-20 md:h-28 w-auto object-contain"
                  />
                </div>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6 text-center"
              >
                The Team Behind SeeZee
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-5 text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto"
              >
                <p>
                  We're Sean and Zach — two developers from Louisville, Kentucky who wanted to make web design simple, fast, and affordable for small businesses.
                </p>
                <p>
                  We started SeeZee Studio because we saw too many people stuck paying thousands for websites that were slow to build and impossible to maintain.
                </p>
                <p>
                  So we built something better — websites that launch in days, stay updated for life, and give business owners full control through their own dashboard.
                </p>
              </motion.div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Meet the Founders Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4">
                Meet the Founders
              </h2>
            </div>
          </ScrollAnimation>

          <div className="max-w-5xl mx-auto space-y-16">
            {/* Sean */}
            <ScrollAnimation delay={0.1}>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className="flex flex-col md:flex-row gap-8 items-start p-8 md:p-10 rounded-2xl hover:shadow-xl transition-all bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-trinity-red/50"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-trinity-red to-trinity-maroon rounded-full mx-auto md:mx-0 flex items-center justify-center text-white text-5xl font-bold flex-shrink-0 shadow-lg border-2 border-trinity-red/20">
                  S
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-2">
                    Sean McCulloch
                  </h3>
                  <p className="text-trinity-red font-semibold mb-4 text-lg">Lead Developer & Designer</p>
                  <div className="space-y-3 text-base md:text-lg text-gray-300 leading-relaxed">
                    <p>
                      Sean's a developer, designer, and problem solver based in Louisville.
                    </p>
                    <p>
                      He's the brains behind the code — building SeeZee's custom dashboards, website templates, and automation tools.
                    </p>
                    <p>
                      He's been coding since middle school, and by high school was running full client projects, creating apps, and designing full-stack systems on Raspberry Pi, Android, and the web.
                    </p>
                    <p>
                      Sean leads the technical direction of SeeZee, making sure every project runs fast, looks sharp, and stays easy to manage.
                    </p>
                  </div>
                </div>
              </motion.div>
            </ScrollAnimation>

            {/* Zach */}
            <ScrollAnimation delay={0.2}>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className="flex flex-col md:flex-row gap-8 items-start p-8 md:p-10 rounded-2xl hover:shadow-xl transition-all bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-trinity-red/50"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-trinity-red to-trinity-maroon rounded-full mx-auto md:mx-0 flex items-center justify-center text-white text-5xl font-bold flex-shrink-0 shadow-lg border-2 border-trinity-red/20">
                  Z
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-2">
                    Zach
                  </h3>
                  <p className="text-trinity-red font-semibold mb-4 text-lg">Operations & Client Experience</p>
                  <div className="space-y-3 text-base md:text-lg text-gray-300 leading-relaxed">
                    <p>
                      Zach handles client relationships, onboarding, and project management.
                    </p>
                    <p>
                      He makes sure every website runs smoothly from start to finish — from the first call to launch day.
                    </p>
                    <p>
                      He's the one ensuring SeeZee's customer experience stays as personal and friendly as possible, keeping our process simple, transparent, and stress-free.
                    </p>
                  </div>
                </div>
              </motion.div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Our Philosophy Section */}
      <section className="py-20 bg-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-8 text-center"
            >
              What We Believe
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-5 text-lg md:text-xl text-gray-300 leading-relaxed mb-12"
            >
              <p>
                We believe small businesses deserve more than just a website — they deserve a partner.
              </p>
              <p>
                That's why SeeZee was built on three principles:
              </p>
            </motion.div>

            <div className="mt-12 space-y-6">
              {[
                { title: 'Speed', desc: 'We launch fast, so your business starts growing faster.' },
                { title: 'Simplicity', desc: 'One setup, one monthly payment, no hidden fees.' },
                { title: 'Support', desc: 'You\'ll always have real people (us) keeping your site updated and secure.' }
              ].map((principle, index) => (
                <motion.div
                  key={principle.title}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-trinity-red/50 transition-all"
                >
                  <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-2">
                    {principle.title}
                  </h3>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    {principle.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 pt-8 border-t border-gray-700"
            >
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed text-center">
                With SeeZee, you don't just get a website — you get a long-term team that makes sure it stays live, modern, and effective.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollAnimation>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-8">
                Let's Build Your Next Website Together
              </h2>
              <p className="text-lg text-white mb-8 leading-relaxed">
                Whether you're starting fresh or need to rebuild your current site, SeeZee makes it simple. You focus on your business — we'll take care of everything else.
              </p>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-8 py-4 bg-trinity-red text-white rounded-lg hover:bg-trinity-maroon transition-all duration-200 font-semibold text-lg shadow-medium transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Start My Website
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  )
}
