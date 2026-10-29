import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FiCheck, FiMapPin } from 'react-icons/fi'
import { CtaBand, FaqList, FeaturedWork, Process } from '@/components/marketing/sections'
import { Breadcrumbs, ButtonLink, Container, JsonLd, Section, SectionHeading } from '@/components/marketing/ui'
import { serviceAreas, services, site, type Faq } from '@/lib/site'

export const dynamicParams = false

export function generateStaticParams() {
  return serviceAreas.map((area) => ({ city: area.slug }))
}

type Props = { params: Promise<{ city: string }> }

function getArea(slug: string) {
  return serviceAreas.find((a) => a.slug === slug)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params
  const area = getArea(city)
  if (!area) return {}
  const title = `Web Design ${area.name} | Custom Websites & Local SEO`
  const description = `${area.shortName} web design and development by SeeZee Studio. Fast, custom websites, web apps and local SEO for businesses in ${area.neighborhoods
    .slice(0, 4)
    .join(', ')} and across ${area.state === 'Ohio' ? 'Greater Cincinnati' : area.shortName}. Free quote.`
  const path = `/web-design/${area.slug}`
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: `${site.url}${path}`, siteName: site.name, type: 'website', images: ['/opengraph-image.png'] },
    twitter: { card: 'summary_large_image', title, description, images: ['/opengraph-image.png'] },
  }
}

function areaFaqs(name: string, shortName: string): Faq[] {
  return [
    {
      q: `Do you meet with ${shortName} clients in person?`,
      a: `Yes. We are based in Louisville and regularly meet ${shortName} clients in person for kickoffs and launch walkthroughs. Day-to-day we keep things moving with quick calls, email and your client portal.`,
    },
    {
      q: `How much does a website cost in ${name}?`,
      a: 'Every project gets a fixed quote after a free consultation, so you know the full cost before we start. Most small-business marketing sites land in the low thousands, and monthly plans are available that include hosting and support.',
    },
    {
      q: `Can you help my ${shortName} business rank higher on Google?`,
      a: `Every site we build includes technical SEO, local schema markup and Search Console setup. For competitive ${shortName} searches we add service and location pages, Google Business Profile optimization and ongoing local SEO.`,
    },
    {
      q: 'Can you redesign my existing website without losing traffic?',
      a: 'Yes. We audit your current pages and rankings, keep the content that performs, and set up proper 301 redirects so search engines carry your existing authority over to the new site.',
    },
  ]
}

export default async function CityPage({ params }: Props) {
  const { city } = await params
  const area = getArea(city)
  if (!area) notFound()

  const path = `/web-design/${area.slug}`
  const others = serviceAreas.filter((a) => a.slug !== area.slug)

  return (
    <>
      <section className="relative overflow-hidden bg-[#0b0b0c] text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_85%_0%,rgba(220,38,38,0.16),transparent_70%)]" />
        <Container className="relative pb-20 pt-14 sm:pb-24 sm:pt-20">
          <Breadcrumbs
            items={[
              { name: 'Home', href: '/' },
              { name: 'Services', href: '/services' },
              { name: `Web design ${area.shortName}`, href: path },
            ]}
          />
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm text-white/70">
            <FiMapPin aria-hidden className="h-3.5 w-3.5 text-red-500" />
            Serving {area.name}
          </p>
          <h1 className="max-w-4xl font-heading text-4xl font-extrabold !leading-[1.06] tracking-tight sm:text-6xl">
            {area.shortName} Web Design &amp; Development
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-white/70">{area.headline}</p>
          <p className="mt-4 max-w-2xl leading-relaxed text-white/55">{area.intro}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/contact" arrow>
              Get a free quote
            </ButtonLink>
            <ButtonLink href={site.phoneHref} variant="secondary">
              Call {site.phone}
            </ButtonLink>
          </div>
        </Container>
      </section>

      <Section tone="raised">
        <SectionHeading
          eyebrow={`Services in ${area.shortName}`}
          title={`What we build for ${area.shortName} businesses`}
          lead="Pick one or bundle them — everything is handled by the same small team."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.slug} className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-7">
              <h3 className="font-heading text-lg font-semibold">
                {service.title}
                <span className="sr-only"> in {area.shortName}</span>
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-white/60">{service.description}</p>
              <ul className="mt-5 space-y-2 text-sm text-white/70">
                {service.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <FiCheck aria-hidden className="mt-0.5 h-4 w-4 flex-none text-red-500" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <FeaturedWork tone="base" limit={2} />

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-2">
          <SectionHeading
            className="!mb-0"
            eyebrow="Local coverage"
            title={`Areas we serve around ${area.shortName}`}
            lead={area.localNote}
          />
          <ul className="grid grid-cols-2 gap-3 self-center sm:grid-cols-3">
            {area.neighborhoods.map((n) => (
              <li key={n} className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-black/75 shadow-sm ring-1 ring-black/5">
                {n}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Process tone="base" />

      <FaqList tone="raised" items={areaFaqs(area.name, area.shortName)} title={`${area.shortName} web design FAQ`} />

      <Section tone="base" className="!py-16">
        <p className="text-sm text-white/50">Also serving:</p>
        <ul className="mt-3 flex flex-wrap gap-3">
          {others.map((o) => (
            <li key={o.slug}>
              <a href={`/web-design/${o.slug}`} className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/75 hover:border-white/40 hover:text-white">
                Web design {o.shortName}
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand title={`Ready for a better website in ${area.shortName}?`} />

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: `Web design in ${area.name}`,
          serviceType: 'Web design and development',
          url: `${site.url}${path}`,
          provider: { '@id': `${site.url}/#organization` },
          areaServed: [{ '@type': 'Place', name: area.name }, ...area.neighborhoods.map((n) => ({ '@type': 'Place', name: n }))],
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Web services',
            itemListElement: services.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.title, description: s.description } })),
          },
        }}
      />
    </>
  )
}
