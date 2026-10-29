import Image from 'next/image'
import { FaGithub, FaInstagram, FaLinkedin } from 'react-icons/fa'
import { CtaBand, FeaturedWork } from '@/components/marketing/sections'
import { Breadcrumbs, Container, Eyebrow, Section, SectionHeading } from '@/components/marketing/ui'

const team = [
  {
    name: 'Sean McCulloch',
    role: 'Co-founder · Design & Development',
    image: '/sean-profile.png',
    bio: [
      'Sean is an Information Technology student at the University of Cincinnati studying Software Application Development.',
      'At SeeZee he leads design and development — planning, building, deploying and supporting every site and web app we ship, including the client portal our customers use every day.',
    ],
    links: [
      { href: 'https://github.com/SeanSpon', label: 'GitHub', Icon: FaGithub },
      { href: 'https://www.linkedin.com/in/sean-mcculloch-58a3761a9/', label: 'LinkedIn', Icon: FaLinkedin },
      { href: 'https://www.instagram.com/sean.mcculloch7/', label: 'Instagram', Icon: FaInstagram },
    ],
  },
  {
    name: 'Zach Robards',
    role: 'Co-founder · Consulting & Client Relationships',
    image: '/zach-profile.png',
    bio: [
      'Zach is a Computer Science student in the University Honors Program at the University of Louisville.',
      'At SeeZee he leads consulting and client relationships — learning your goals, recommending the right solution for your budget, and shaping content and user experience so the finished site actually works for your customers.',
    ],
    links: [{ href: 'https://www.instagram.com/zachrobards/', label: 'Instagram', Icon: FaInstagram }],
  },
]

const values = [
  { title: 'Plain language', body: 'No jargon, no confusing proposals. You always understand what we are building and why.' },
  { title: 'Built to last', body: 'Modern, maintainable code — not a fragile theme stacked with plugins.' },
  { title: 'Accessible by default', body: 'Clear layouts, readable type and good contrast so every visitor can use your site.' },
  { title: 'We stick around', body: 'Hosting, updates and improvements after launch. You are never left on your own.' },
]

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#0b0b0c] text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_85%_0%,rgba(220,38,38,0.16),transparent_70%)]" />
        <Container className="relative grid items-center gap-12 pb-20 pt-14 sm:pb-24 sm:pt-20 lg:grid-cols-2">
          <div>
            <Breadcrumbs
              items={[
                { name: 'Home', href: '/' },
                { name: 'About', href: '/about' },
              ]}
            />
            <h1 className="font-heading text-4xl font-extrabold !leading-[1.06] tracking-tight sm:text-6xl">
              A small Louisville studio that treats your site like our own.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/65">
              SeeZee started when two friends from Trinity High School began building websites and tools for local
              organizations through FBLA. Today we design, build and support websites and web apps for businesses and
              nonprofits across Louisville, Southern Indiana and Cincinnati.
            </p>
          </div>
          <div className="overflow-hidden rounded-3xl border border-white/10">
            <Image
              src="/sean-zach-photo.png"
              alt="The SeeZee Studio team at the Louisville Water Tower"
              width={1264}
              height={848}
              priority
              sizes="(min-width: 1024px) 560px, 100vw"
              className="h-full w-full object-cover"
            />
          </div>
        </Container>
      </section>

      <Section tone="raised">
        <SectionHeading eyebrow="The team" title="You work directly with the founders." />
        <div className="grid gap-6 md:grid-cols-2">
          {team.map((person) => (
            <article key={person.name} className="rounded-3xl border border-white/[0.08] bg-[#0b0b0c] p-8 sm:p-10">
              <div className="flex items-center gap-5">
                <Image src={person.image} alt={person.name} width={80} height={80} className="h-20 w-20 rounded-full object-cover ring-2 ring-white/10" />
                <div>
                  <h3 className="font-heading text-2xl font-semibold">{person.name}</h3>
                  <p className="mt-1 text-sm text-red-400">{person.role}</p>
                </div>
              </div>
              <div className="mt-6 space-y-4 leading-relaxed text-white/65">
                {person.bio.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                {person.links.map(({ href, label, Icon }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${person.name} on ${label}`}
                    className="rounded-full border border-white/10 p-2.5 text-white/60 transition hover:border-white/40 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <Eyebrow>How we work</Eyebrow>
            <h2 className="font-heading text-3xl font-bold !leading-[1.12] tracking-tight sm:text-4xl">What you can expect from us.</h2>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                <dt className="font-heading text-lg font-semibold">{v.title}</dt>
                <dd className="mt-2 leading-relaxed text-black/65">{v.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <FeaturedWork tone="base" limit={2} />
      <CtaBand />
    </>
  )
}
