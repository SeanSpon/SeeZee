import { Hero } from '../components/sections/hero'
import { Services } from '../components/sections/services-new'
import { Portfolio } from '../components/sections/portfolio'
import { PortalPreview } from '../components/sections/portal-preview'
import { Testimonials } from '../components/sections/testimonials'
import { About } from '../components/sections/about'
import { CtaBand } from '../components/sections/cta-band'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Services />
      <Portfolio />
      <PortalPreview />
      <Testimonials />
      <About />
      <CtaBand />
    </div>
  )
}