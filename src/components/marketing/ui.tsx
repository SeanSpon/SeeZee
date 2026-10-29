import Link from 'next/link'
import type { ReactNode } from 'react'
import { FiArrowRight } from 'react-icons/fi'

// Shared building blocks for the public marketing pages. Server components
// only, so pages built from them render as static HTML.

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('mx-auto w-full max-w-6xl px-5 sm:px-8', className)}>{children}</div>
}

export function Section({
  children,
  className,
  id,
  tone = 'base',
}: {
  children: ReactNode
  className?: string
  id?: string
  tone?: 'base' | 'raised' | 'light'
}) {
  const tones = {
    base: 'bg-[#0b0b0c] text-white',
    raised: 'bg-[#111113] text-white border-y border-white/[0.06]',
    light: 'bg-[#f6f4f0] text-[#111113]',
  }
  return (
    <section id={id} className={cx('py-20 sm:py-28', tones[tone], className)}>
      <Container>{children}</Container>
    </section>
  )
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cx('mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-500', className)}>
      <span aria-hidden className="h-px w-6 bg-current" />
      {children}
    </p>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'left',
  as: Tag = 'h2',
  className,
}: {
  eyebrow?: string
  title: ReactNode
  lead?: ReactNode
  align?: 'left' | 'center'
  as?: 'h1' | 'h2'
  className?: string
}) {
  return (
    <div className={cx('mb-12 max-w-3xl sm:mb-16', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Tag className="font-heading text-3xl font-bold !leading-[1.12] tracking-tight sm:text-4xl lg:text-[2.75rem]">
        {title}
      </Tag>
      {lead && <p className="mt-5 text-lg leading-relaxed opacity-70">{lead}</p>}
    </div>
  )
}

type ButtonProps = {
  href: string
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'dark'
  className?: string
  arrow?: boolean
}

export function ButtonLink({ href, children, variant = 'primary', className, arrow }: ButtonProps) {
  const variants = {
    primary: 'bg-red-600 text-white hover:bg-red-500 shadow-[0_8px_30px_-8px_rgba(220,38,38,0.6)]',
    secondary: 'border border-white/15 text-white hover:border-white/40 hover:bg-white/5',
    ghost: 'text-white/80 hover:text-white',
    dark: 'bg-[#111113] text-white hover:bg-black',
  }
  const isExternal = href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')
  const classes = cx(
    'group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
    variants[variant],
    className
  )
  const content = (
    <>
      {children}
      {arrow && <FiArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
    </>
  )
  if (isExternal) {
    return (
      <a href={href} className={classes} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {content}
      </a>
    )
  }
  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  )
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}

export function Breadcrumbs({ items }: { items: Array<{ name: string; href: string }> }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-white/50">
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((item, i) => (
            <li key={item.href} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden>/</span>}
              {i === items.length - 1 ? (
                <span aria-current="page" className="text-white/80">
                  {item.name}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-white">
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            item: `https://seezeestudios.com${item.href === '/' ? '' : item.href}`,
          })),
        }}
      />
    </>
  )
}
