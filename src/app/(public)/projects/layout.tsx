import { generatePageMetadata } from '@/lib/metadata'

export const metadata = generatePageMetadata({
  title: 'Our Projects & Portfolio',
  description:
    'Explore SeeZee Studio\'s active web development projects. See real examples of our e-commerce stores, business websites, and custom web applications built with Next.js and React. Louisville-based web development with nationwide service.',
  path: '/projects',
  keywords: [
    'web development portfolio',
    'SeeZee projects',
    'Next.js websites',
    'e-commerce examples',
    'business website examples',
    'Louisville web design portfolio',
    'React web applications',
  ],
})

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Structured data for Portfolio
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'SeeZee Studio Portfolio',
    description: 'Active web development projects by SeeZee Studio',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'CreativeWork',
          position: 1,
          name: 'ClipBot - AI Video Director',
          description:
            'An AI-powered system that analyzes long-form video, detects the strongest moments, generates scene-by-scene editing directions, and scores clips for virality automatically.',
          creator: {
            '@type': 'Organization',
            name: 'SeeZee Studio',
          },
        },
        {
          '@type': 'CreativeWork',
          position: 2,
          name: 'SeeZee Studios Platform',
          description:
            'Internal operations system managing client projects, workflows, financial tracking, and team operations with 40+ admin modules and role-based portals.',
          creator: {
            '@type': 'Organization',
            name: 'SeeZee Studio',
          },
        },
        {
          '@type': 'CreativeWork',
          position: 3,
          name: 'A Vision For You - Nonprofit Operations Dashboard',
          description:
            'Operations dashboard and data platform for a 501(c)(3) nonprofit in Louisville, Kentucky, featuring donation processing, member management, and program coordination.',
          creator: {
            '@type': 'Organization',
            name: 'SeeZee Studio',
          },
        },
        {
          '@type': 'CreativeWork',
          position: 4,
          name: 'Big Red Bus Community Platform',
          description:
            'Community resource and accessibility platform for a Louisville-based nonprofit initiative, featuring organization directory, event discovery, and cognitive-friendly design.',
          creator: {
            '@type': 'Organization',
            name: 'SeeZee Studio',
          },
        },
      ],
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  )
}
















