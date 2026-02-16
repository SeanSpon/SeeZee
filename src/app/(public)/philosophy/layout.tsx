import { generatePageMetadata } from '@/lib/metadata'

export const metadata = generatePageMetadata({
  title: 'How We Build – AI Integration Done Right',
  description:
    'AI is changing how organizations operate. We help teams integrate modern systems, automation, and AI without chaos or confusion. Not hype. Real implementation.',
  path: '/philosophy',
  keywords: [
    'AI integration',
    'business automation',
    'AI adoption',
    'system integration',
    'workflow automation',
    'practical AI',
  ],
})

export default function PhilosophyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


