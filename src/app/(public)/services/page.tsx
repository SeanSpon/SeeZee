import { FiCheck } from 'react-icons/fi'
import { AreasServed, CtaBand, FaqList, Process } from '@/components/marketing/sections'
import { Breadcrumbs, ButtonLink, Container, Section, SectionHeading } from '@/components/marketing/ui'
import { services } from '@/lib/site'

const included = [
  'Custom design for your brand',
  'Mobile-first & accessible (WCAG-minded)',
  'Technical SEO, schema & sitemap',
  'Google Analytics & Search Console',
  'SSL, security headers & backups',
  'Client portal for feedback & invoices',
]

const plans = [
  {
    name: 'Quarterly care',
    blurb: 'Flexible support, scoped to your needs each quarter.',
    features: ['Priority 24-hour response', 'Security updates & backups', 'Content change requests', 'Emergency same-day fixes'],
    featured: false,
  },
  {
    name: 'Annual partnership',
    blurb: 'Year-round support plus a plan to keep improving.',
    features: ['Everything in Quarterly', 'Quarterly strategy & SEO reviews', 'Performance & uptime monitoring', 'Best overall value'],
    featured: true,
  },
]

export default function ServicesPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#0b0b0c] text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_85%_0%,rgba(220,38,38,0.16),transparent_70%)]" />
        <Container className="relative pb-20 pt-14 sm:pb-24 sm:pt-20">
          <Breadcrumbs
            items={[
              { name: 'Home', href: '/' },
              { name: 'Services', href: '/services' },
            ]}
          />
          <h1 className="max-w-4xl font-heading text-4xl font-extrabold !leading-[1.06] tracking-tight sm:text-6xl">
            Web design, development &amp; SEO services
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-white/65">
            From a fast five-page site to a full customer portal, every project is scoped to your goals and quoted up front.
            One local team handles it all — and stays on after launch.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/contact?inquiry=new-website" arrow>
              Get a free quote
            </ButtonLink>
            <ButtonLink href="/projects" variant="secondary">
              See examples
            </ButtonLink>
          </div>
        </Container>
      </section>

      <Section tone="raised">
        <div className="space-y-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.08]">
          {services.map((service, i) => (
            <article key={service.slug} id={service.slug} className="grid scroll-mt-24 gap-6 bg-[#0b0b0c] p-8 sm:p-10 lg:grid-cols-[auto_1fr_1fr] lg:gap-12">
              <span className="font-mono text-sm text-white/40">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h2 className="font-heading text-2xl font-semibold sm:text-3xl">{service.title}</h2>
                <p className="mt-4 leading-relaxed text-white/60">{service.description}</p>
              </div>
              <ul className="grid content-start gap-3 text-[15px] text-white/75 sm:grid-cols-2 lg:grid-cols-1">
                {service.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <FiCheck aria-hidden className="mt-1 h-4 w-4 flex-none text-red-500" />
                    {b}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <SectionHeading
            className="!mb-0"
            eyebrow="Every project includes"
            title="The essentials, never sold as add-ons."
            lead="These come standard on every website we launch."
          />
          <ul className="grid gap-4 self-center sm:grid-cols-2">
            {included.map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-2xl bg-white p-5 text-[15px] font-medium text-black/80 shadow-sm ring-1 ring-black/5">
                <FiCheck aria-hidden className="mt-0.5 h-5 w-5 flex-none text-red-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="base" id="care-plans">
        <SectionHeading
          eyebrow="After launch"
          title="Care plans that keep your site working for you."
          lead="Hosting, updates and changes handled for you. Pricing is scoped to the size of your site — ask us for a quote."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={
                plan.featured
                  ? 'relative rounded-3xl border border-red-500/50 bg-gradient-to-b from-red-600/15 to-transparent p-8 sm:p-10'
                  : 'rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 sm:p-10'
              }
            >
              {plan.featured && (
                <span className="absolute right-6 top-6 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-wider">Best value</span>
              )}
              <h3 className="font-heading text-2xl font-semibold">{plan.name}</h3>
              <p className="mt-2 text-white/60">{plan.blurb}</p>
              <ul className="mt-8 space-y-3 text-[15px] text-white/80">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <FiCheck aria-hidden className="mt-1 h-4 w-4 flex-none text-red-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <ButtonLink
                href="/contact?inquiry=existing-issue"
                variant={plan.featured ? 'primary' : 'secondary'}
                className="mt-10 w-full"
              >
                Ask about {plan.name.toLowerCase()}
              </ButtonLink>
            </div>
          ))}
        </div>
      </Section>

      <Process tone="raised" />
      <AreasServed tone="base" />
      <FaqList tone="raised" />
      <div className="h-16 bg-[#0b0b0c]" />
      <CtaBand />
    </>
  )
}
