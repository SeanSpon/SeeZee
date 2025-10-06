import { Hero } from '../components/sections/hero'
import { TechStrip } from '../components/sections/tech-strip'
import { Services } from '../components/sections/services-new'
import { Portfolio } from '../components/sections/portfolio'
import { Testimonials } from '../components/sections/testimonials'
import { About } from '../components/sections/about'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <TechStrip />
      <Hero />
      <Services />
      <Portfolio />
      <Testimonials />
      <About />
    </div>
  )
}