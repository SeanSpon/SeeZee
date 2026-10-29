import Link from 'next/link'
import { FaGithub, FaInstagram, FaLinkedin } from 'react-icons/fa'
import LogoHeader from './LogoHeader'
import { serviceAreas, services, site } from '@/lib/site'

const company = [
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Work' },
  { href: '/case-studies', label: 'Case studies' },
  { href: '/blog', label: 'Blog' },
  { href: '/partners', label: 'Partners' },
  { href: '/contact', label: 'Contact' },
  { href: '/login', label: 'Client login' },
]

const legal = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/accessibility', label: 'Accessibility' },
  { href: '/cookies', label: 'Cookies' },
]

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-white/[0.08] bg-[#0b0b0c] text-white">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" aria-label={`${site.name} home`} className="inline-block">
              <LogoHeader />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/55">
              Web design and development studio in Louisville, Kentucky — serving Southern Indiana, Northern Kentucky and
              Cincinnati.
            </p>
            <address className="mt-6 space-y-1 text-sm not-italic text-white/70">
              <p>
                {site.name} · {site.city}, {site.region}
              </p>
              <p>
                <a href={site.phoneHref} className="hover:text-white">
                  {site.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${site.email}`} className="hover:text-white">
                  {site.email}
                </a>
              </p>
            </address>
            <div className="mt-6 flex gap-3">
              {[
                { href: site.social.instagram, label: 'Instagram', Icon: FaInstagram },
                { href: site.social.linkedin, label: 'LinkedIn', Icon: FaLinkedin },
                { href: site.social.github, label: 'GitHub', Icon: FaGithub },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="rounded-full border border-white/10 p-2.5 text-white/60 transition hover:border-white/40 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Services" links={services.map((s) => ({ href: `/services#${s.slug}`, label: s.title }))} />
          <FooterColumn
            title="Areas we serve"
            links={serviceAreas.map((a) => ({ href: `/web-design/${a.slug}`, label: `Web design ${a.shortName}` }))}
          />
          <FooterColumn title="Company" links={company} />
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/[0.08] pt-8 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legal.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: Array<{ href: string; label: string }> }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <ul className="mt-5 space-y-3 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-white/55 transition-colors hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
