import { generatePageMetadata } from '@/lib/metadata'

export const metadata = generatePageMetadata({
  title: 'Case Studies — Websites & Web Apps We Built',
  description:
    'How SeeZee Studio designed and built websites and platforms for Louisville nonprofits and community organizations — the problem, the solution and the results.',
  path: '/case-studies',
})

export default function CaseStudiesLayout({ children }: { children: React.ReactNode }) {
  return children
}
