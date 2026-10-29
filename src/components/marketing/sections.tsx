import Image from 'next/image'
import Link from 'next/link'
import { FiArrowUpRight, FiCheck, FiPhone, FiPlus } from 'react-icons/fi'
import { faqs as defaultFaqs, serviceAreas, services, site, type Faq } from '@/lib/site'
import { featuredWork, type WorkItem } from '@/lib/work'
import { ButtonLink, Container, JsonLd, Section, SectionHeading, cx } from './ui'

export function ServicesGrid({ tone = 'base' as 'base' | 'raised' }) {
  return (
    <Section tone={tone} id="services">
      <SectionHeading
        eyebrow="What we do"
        title="Everything your website needs, from one local team."
        lead="Design, development, SEO, hosting and support under one roof — so nothing falls through the cracks between vendors."
      />
      <div className="grid gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => (
          <div key={service.slug} className="group flex flex-col bg-[#0b0b0c] p-8 transition-colors hover:bg-[#141416]">
            <span className="mb-6 font-mono text-xs text-white/55">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="font-heading text-xl font-semibold">{service.title}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-white/60">{service.short}</p>
            <ul className="mt-6 space-y-2 text-sm text-white/70">
              {service.bullets.slice(0, 3).map((b) => (
                <li key={b} className="flex gap-2">
                  <FiCheck aria-hidden className="mt-0.5 h-4 w-4 flex-none text-red-500" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <ButtonLink href="/services" variant="secondary" arrow>
          Explore services
        </ButtonLink>
      </div>
    </Section>
  )
}

function BrowserFrame({ item }: { item: WorkItem }) {
  const host = item.liveUrl ? new URL(item.liveUrl).hostname.replace(/^www\./, '') : 'Case study'
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#161618] shadow-2xl shadow-black/40">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="ml-3 truncate rounded-md bg-white/5 px-3 py-1 font-mono text-[11px] text-white/60">{host}</span>
      </div>
      {item.image ? (
        <Image
          src={item.image}
          alt={`${item.name} website screenshot`}
          width={1200}
          height={580}
          sizes="(min-width: 1024px) 560px, 100vw"
          className="aspect-[16/9] w-full object-cover object-top"
        />
      ) : (
        <div className="relative flex aspect-[16/9] w-full flex-col items-center justify-center overflow-hidden bg-[#111113] text-center">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(220,38,38,0.22),transparent_70%)]" />
          <div aria-hidden className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:40px_40px]" />
          <p className="relative font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{item.name}</p>
          <p className="relative mt-3 rounded-full border border-white/15 px-4 py-1.5 font-mono text-xs text-white/60">{host}</p>
        </div>
      )}
    </div>
  )
}

export function FeaturedWork({ limit = 4, tone = 'raised' as 'base' | 'raised' }) {
  const items = featuredWork.slice(0, limit)
  return (
    <Section tone={tone} id="work">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeading
          className="!mb-0"
          eyebrow="Recent work"
          title="Real projects for real organizations."
          lead="Nonprofits, local shops and software companies — each one designed, built and supported by us."
        />
        <ButtonLink href="/projects" variant="secondary" arrow className="flex-none">
          View all projects
        </ButtonLink>
      </div>
      <div className="mt-14 grid gap-x-8 gap-y-16 md:grid-cols-2">
        {items.map((item) => (
          <article key={item.slug} className="group">
            <Link href={item.href} className="block transition-transform duration-300 group-hover:-translate-y-1">
              <BrowserFrame item={item} />
            </Link>
            <div className="mt-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                  {item.category} · {item.location}
                </p>
                <h3 className="mt-2 font-heading text-2xl font-semibold">
                  <Link href={item.href} className="hover:text-red-400">
                    {item.name}
                  </Link>
                </h3>
              </div>
              {item.liveUrl && (
                <a
                  href={item.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${item.name} live site`}
                  className="mt-1 rounded-full border border-white/10 p-2.5 text-white/60 transition hover:border-white/40 hover:text-white"
                >
                  <FiArrowUpRight className="h-4 w-4" />
                </a>
              )}
            </div>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/60">{item.summary}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {item.results.map((r) => (
                <li key={r} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
                  {r}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Section>
  )
}

const steps = [
  {
    title: 'Free discovery call',
    body: 'A 30-minute conversation about your business, goals and budget. You leave with honest advice, even if we are not the right fit.',
  },
  {
    title: 'Plan & fixed quote',
    body: 'A clear scope, sitemap, timeline and price in writing. No hourly surprises.',
  },
  {
    title: 'Design & build',
    body: 'You see real progress every week on a private preview link and give feedback right in your client portal.',
  },
  {
    title: 'Launch & grow',
    body: 'We handle domains, redirects, SEO setup and analytics — then stay on for hosting, updates and improvements.',
  },
]

export function Process({ tone = 'base' as 'base' | 'raised' | 'light' }) {
  return (
    <Section tone={tone} id="process">
      <SectionHeading
        eyebrow="How it works"
        title="A simple process, start to finish."
        lead="No jargon and no disappearing act. You always know what is happening and what comes next."
      />
      <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className={cx(
              'relative rounded-3xl p-7',
              tone === 'light' ? 'bg-white shadow-sm ring-1 ring-black/5' : 'border border-white/[0.08] bg-white/[0.02]'
            )}
          >
            <span className="font-heading text-5xl font-extrabold text-red-600/90">{i + 1}</span>
            <h3 className="mt-6 font-heading text-lg font-semibold">{step.title}</h3>
            <p className="mt-3 text-[15px] leading-relaxed opacity-70">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}

export function FaqList({ items = defaultFaqs, tone = 'base' as 'base' | 'raised', title = 'Questions we hear a lot.' }: { items?: Faq[]; tone?: 'base' | 'raised'; title?: string }) {
  return (
    <Section tone={tone} id="faq">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <SectionHeading
          eyebrow="FAQ"
          title={title}
          lead={
            <>
              Something else on your mind? Call us at{' '}
              <a href={site.phoneHref} className="text-white underline decoration-red-500 underline-offset-4">
                {site.phone}
              </a>
              .
            </>
          }
        />
        <div className="divide-y divide-white/10 border-y border-white/10">
          {items.map((faq) => (
            <details key={faq.q} className="group py-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-heading text-lg font-semibold">
                {faq.q}
                <FiPlus aria-hidden className="h-5 w-5 flex-none text-white/60 transition-transform group-open:rotate-45" />
              </summary>
              <p className="mt-4 max-w-2xl leading-relaxed text-white/65">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: items.map((faq) => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: { '@type': 'Answer', text: faq.a },
          })),
        }}
      />
    </Section>
  )
}

export function AreasServed({ tone = 'raised' as 'base' | 'raised' }) {
  return (
    <Section tone={tone} id="areas">
      <SectionHeading
        eyebrow="Where we work"
        title="Based in Louisville. Building for the whole region."
        lead="In-person meetings across Kentuckiana and Greater Cincinnati, and remote projects anywhere in the US."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {serviceAreas.map((area) => (
          <Link
            key={area.slug}
            href={`/web-design/${area.slug}`}
            className="group flex flex-col justify-between rounded-3xl border border-white/[0.08] bg-white/[0.02] p-7 transition hover:border-red-500/40 hover:bg-white/[0.04]"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">{area.state}</p>
              <h3 className="mt-2 font-heading text-xl font-semibold">Web design in {area.shortName}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/55">{area.neighborhoods.slice(0, 4).join(' · ')}</p>
            </div>
            <span className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-red-400">
              Learn more <FiArrowUpRight aria-hidden className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </Section>
  )
}

export function CtaBand({
  title = 'Let’s build something your customers love.',
  lead = 'Tell us about your business. We’ll reply within one business day with honest next steps — no pressure, no sales pitch.',
}: {
  title?: string
  lead?: string
}) {
  return (
    <section className="bg-[#0b0b0c] pb-24 pt-4">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-red-600 px-8 py-16 text-white sm:px-14 sm:py-20">
          <div aria-hidden className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
          <div aria-hidden className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-black/20 blur-3xl" />
          <div className="relative grid items-end gap-10 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <h2 className="font-heading text-3xl font-bold !leading-[1.1] tracking-tight sm:text-5xl">{title}</h2>
              <p className="mt-5 max-w-xl text-lg text-white/85">{lead}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
              <ButtonLink href="/contact" variant="dark" arrow className="w-full sm:w-auto">
                Get a free quote
              </ButtonLink>
              <a
                href={site.phoneHref}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-6 py-3.5 text-[15px] font-semibold transition hover:bg-white/10"
              >
                <FiPhone aria-hidden className="h-4 w-4" /> {site.phone}
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
