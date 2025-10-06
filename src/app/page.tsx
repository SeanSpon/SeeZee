import { Hero } from '../components/sections/hero'
import { Services } from '../components/sections/services'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Services />
    </div>
  )
}