import { generatePageMetadata } from '@/lib/metadata'
import { services, site } from '@/lib/site'

export const metadata = generatePageMetadata({
  title: 'Web Design, Development & SEO Services in Louisville',
  description:
    'Custom website design, web apps, e-commerce, local SEO, redesigns and hosting/care plans from SeeZee Studio in Louisville, KY. Fixed quotes, one local team, support after launch.',
  path: '/services',
  keywords: [
    'web design services Louisville',
    'website development Louisville KY',
    'local SEO Louisville',
    'website redesign',
    'e-commerce website',
    'website maintenance plans',
    'web app development',
  ],
})

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'SeeZee Studio services',
    itemListElement: services.map((service, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Service',
        name: service.title,
        description: service.description,
        url: `${site.url}/services#${service.slug}`,
        provider: { '@id': `${site.url}/#organization` },
        areaServed: ['Louisville, KY', 'Cincinnati, OH', 'Northern Kentucky', 'Southern Indiana'],
      },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      {children}
    </>
  )
}
