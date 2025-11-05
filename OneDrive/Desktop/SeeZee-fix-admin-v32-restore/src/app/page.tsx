import { Hero } from '../components/sections/hero'
import { DashboardShowcase } from '../components/sections/dashboard-showcase'
import { Services } from '../components/sections/services-new'
import { About } from '../components/sections/about'
import { Portfolio } from '../components/sections/portfolio'
import { Testimonials } from '../components/sections/testimonials'
import { CtaBand } from '../components/sections/cta-band'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <DashboardShowcase />
      <Services />
      <About />
      <Portfolio />
      <Testimonials />
      <CtaBand />
    </div>
  )
}