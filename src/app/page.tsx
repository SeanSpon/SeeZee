import type { Metadata } from 'next'
import Image from 'next/image'
import { FiCheck, FiMapPin, FiX } from 'react-icons/fi'
import { AreasServed, CtaBand, FaqList, FeaturedWork, Process, ServicesGrid } from '@/components/marketing/sections'
import { ButtonLink, Container, Eyebrow, Section, SectionHeading } from '@/components/marketing/ui'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: { absolute: 'Louisville Web Design & Development | SeeZee Studio' },
  description:
    'Custom websites and web apps for Louisville, Southern Indiana, Northern Kentucky and Cincinnati businesses. Fast, SEO-ready sites with hosting and support from a local team. Free quote.',
  alternates: { canonical: '/' },
}

const trust = ['Local Louisville team', 'Fixed, upfront quotes', 'Hosting & support included', 'Reply within 1 business day']

const comparison = [
  { label: 'Work directly with the people building your site', us: true, agency: false, diy: false },
  { label: 'Custom design — no templates', us: true, agency: true, diy: false },
  { label: 'Fast, modern code (not a bloated page builder)', us: true, agency: false, diy: false },
  { label: 'Local SEO built in from day one', us: true, agency: true, diy: false },
  { label: 'Ongoing updates without a new contract', us: true, agency: false, diy: false },
  { label: 'Small-business friendly pricing', us: true, agency: false, diy: true },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0b0b0c] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_10%,rgba(220,38,38,0.18),transparent_70%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]"
        />
        <Container className="relative grid items-center gap-14 pb-20 pt-16 sm:pb-28 sm:pt-24 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm text-white/70">
              <FiMapPin aria-hidden className="h-3.5 w-3.5 text-red-500" />
              Louisville, KY web design &amp; development
            </p>
            <h1 className="font-heading text-[2.6rem] font-extrabold !leading-[1.04] tracking-tight sm:text-6xl lg:text-[4.25rem]">
              Websites that bring in <span className="text-red-500">real customers.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/65 sm:text-xl">
              SeeZee Studio designs, builds and maintains fast, custom websites and web apps for small businesses and
              nonprofits in Louisville, Southern Indiana and Cincinnati.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/contact" arrow>
                Get a free quote
              </ButtonLink>
              <ButtonLink href="/projects" variant="secondary">
                See our work
              </ButtonLink>
            </div>
            <ul className="mt-10 grid max-w-lg grid-cols-1 gap-x-6 gap-y-3 text-sm text-white/60 sm:grid-cols-2">
              {trust.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <FiCheck aria-hidden className="h-4 w-4 flex-none text-red-500" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#161618] shadow-2xl shadow-black/60">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="ml-3 rounded-md bg-white/5 px-3 py-1 font-mono text-[11px] text-white/50">avisionforyourecovery.org</span>
              </div>
              <Image
                src="/avfy-home.png"
                alt="A Vision For You nonprofit website built by SeeZee Studio"
                width={1200}
                height={580}
                priority
                sizes="(min-width: 1024px) 560px, 100vw"
                className="aspect-[16/10] w-full object-cover object-top"
              />
            </div>
            <div className="absolute -bottom-8 -left-4 hidden w-[55%] overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-black/60 sm:block lg:-left-10">
              <Image
                src="/big-red-bus-1.png"
                alt="Big Red Bus community directory built by SeeZee Studio"
                width={640}
                height={320}
                sizes="300px"
                className="aspect-[16/10] w-full object-cover object-top"
              />
            </div>
          </div>
        </Container>
      </section>

      <ServicesGrid tone="raised" />

      <FeaturedWork tone="base" />

      {/* Why us */}
      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <SectionHeading
            className="!mb-0"
            eyebrow="Why SeeZee"
            title="Big-agency quality without the big-agency runaround."
            lead="Most small businesses get stuck choosing between an expensive agency and a DIY builder. We are the middle path: a small, senior team that builds custom and sticks around."
          />
          <div className="overflow-x-auto rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-wider text-black/50">
                  <th className="px-6 py-4 font-semibold">
                    <span className="sr-only">Feature</span>
                  </th>
                  <th className="px-4 py-4 text-center font-semibold text-red-600">SeeZee</th>
                  <th className="px-4 py-4 text-center font-semibold">Big agency</th>
                  <th className="px-4 py-4 text-center font-semibold">DIY builder</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.label} className="border-b border-black/5 last:border-0">
                    <td className="px-6 py-4 font-medium text-black/80">{row.label}</td>
                    {[row.us, row.agency, row.diy].map((v, i) => (
                      <td key={i} className="px-4 py-4 text-center">
                        {v ? (
                          <FiCheck aria-label="Yes" className={`mx-auto h-5 w-5 ${i === 0 ? 'text-red-600' : 'text-black/60'}`} />
                        ) : (
                          <FiX aria-label="No" className="mx-auto h-5 w-5 text-black/25" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Process tone="base" />

      {/* Team */}
      <Section tone="raised">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="overflow-hidden rounded-3xl border border-white/10">
            <Image
              src="/sean-zach-photo.png"
              alt="The SeeZee Studio team at the Louisville Water Tower"
              width={1264}
              height={848}
              sizes="(min-width: 1024px) 560px, 100vw"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <Eyebrow>Meet the team</Eyebrow>
            <h2 className="font-heading text-3xl font-bold !leading-[1.12] tracking-tight sm:text-4xl">
              Louisville builders who actually pick up the phone.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-white/65">
              We’re {site.founders[0].name.split(' ')[0]} and {site.founders[1].name.split(' ')[0]}. Sean leads design and development; Zach leads
              consulting and client relationships. When you work with SeeZee, you work with us —
              from the first call to the hundredth update.
            </p>
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
              <div>
                <dt className="text-sm text-white/50">Response time</dt>
                <dd className="mt-1 font-heading text-2xl font-bold">&lt; 24 hrs</dd>
              </div>
              <div>
                <dt className="text-sm text-white/50">Built on</dt>
                <dd className="mt-1 font-heading text-2xl font-bold">Next.js</dd>
              </div>
              <div>
                <dt className="text-sm text-white/50">Based in</dt>
                <dd className="mt-1 font-heading text-2xl font-bold">Louisville</dd>
              </div>
            </dl>
            <div className="mt-10">
              <ButtonLink href="/about" variant="secondary" arrow>
                More about us
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>

      <AreasServed tone="base" />

      <FaqList tone="raised" />

      <div className="h-16 bg-[#0b0b0c]" />
      <CtaBand />
    </>
  )
}
