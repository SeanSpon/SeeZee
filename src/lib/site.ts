// Single source of truth for public business details, service areas and
// services. Used by the marketing pages, footer, sitemap and structured data
// so name/address/phone stay consistent everywhere (important for local SEO).

export const site = {
  name: 'SeeZee Studio',
  legalName: 'SeeZee Studio',
  url: 'https://seezeestudios.com',
  email: 'contact@seezeestudios.com',
  phone: '(502) 435-2986',
  phoneHref: 'tel:+15024352986',
  city: 'Louisville',
  region: 'KY',
  regionName: 'Kentucky',
  country: 'US',
  geo: { latitude: 38.2527, longitude: -85.7585 },
  tagline: 'Websites and web apps for Louisville & Cincinnati businesses',
  description:
    'SeeZee Studio is a Louisville, KY web design and development studio. We design, build, host and maintain fast, custom websites and web apps for small businesses and nonprofits across Louisville, Southern Indiana, Northern Kentucky and Cincinnati.',
  founders: [
    { name: 'Sean McCulloch', role: 'Co-founder, Design & Development' },
    { name: 'Zach Robards', role: 'Co-founder, Consulting & Client Relationships' },
  ],
  social: {
    instagram: 'https://www.instagram.com/sean.mcculloch7/',
    linkedin: 'https://www.linkedin.com/in/sean-mcculloch-58a3761a9/',
    github: 'https://github.com/SeanSpon',
  },
} as const

export type ServiceArea = {
  slug: string
  name: string
  shortName: string
  state: string
  headline: string
  intro: string
  neighborhoods: string[]
  localNote: string
}

// Each area gets a landing page at /web-design/[slug].
export const serviceAreas: ServiceArea[] = [
  {
    slug: 'louisville-ky',
    name: 'Louisville, KY',
    shortName: 'Louisville',
    state: 'Kentucky',
    headline: 'Louisville web design for businesses that want more calls, not just a pretty site.',
    intro:
      'We are a Louisville-based studio. You work directly with the two people building your site — no account managers, no offshore hand-offs. We meet in person, build on modern code, and stay on as your web team after launch.',
    neighborhoods: [
      'Downtown',
      'NuLu',
      'The Highlands',
      'St. Matthews',
      'Middletown',
      'Jeffersontown',
      'Germantown',
      'Crescent Hill',
      'Fern Creek',
      'Shelbyville',
    ],
    localNote:
      'Coffee meeting in St. Matthews, a walkthrough at your shop on Bardstown Road, or a quick video call — whatever works for you.',
  },
  {
    slug: 'cincinnati-oh',
    name: 'Cincinnati, OH',
    shortName: 'Cincinnati',
    state: 'Ohio',
    headline: 'Cincinnati web design & development with a small-studio, one-team approach.',
    intro:
      'From Over-the-Rhine restaurants to service companies in Mason and West Chester, Cincinnati businesses hire us for fast custom websites and web apps without big-agency overhead. We are a short drive down I-71 and happy to meet on site.',
    neighborhoods: [
      'Over-the-Rhine',
      'Downtown',
      'Hyde Park',
      'Oakley',
      'Blue Ash',
      'Mason',
      'West Chester',
      'Kenwood',
      'Clifton',
      'Anderson Township',
    ],
    localNote:
      'We work remotely day-to-day and drive up for kickoffs, photo days and launch walkthroughs.',
  },
  {
    slug: 'northern-kentucky',
    name: 'Northern Kentucky',
    shortName: 'Northern Kentucky',
    state: 'Kentucky',
    headline: 'Web design for Northern Kentucky businesses — Covington, Newport, Florence & beyond.',
    intro:
      'Northern Kentucky businesses compete with all of Greater Cincinnati for search traffic. We build fast, locally-optimized websites that help you show up for the searches that matter on both sides of the river.',
    neighborhoods: ['Covington', 'Newport', 'Florence', 'Fort Thomas', 'Erlanger', 'Union', 'Independence', 'Fort Mitchell'],
    localNote: 'Kentucky-based studio, so you get a local team that understands the region.',
  },
  {
    slug: 'southern-indiana',
    name: 'Southern Indiana',
    shortName: 'Southern Indiana',
    state: 'Indiana',
    headline: 'Southern Indiana web design — New Albany, Jeffersonville & Clarksville.',
    intro:
      'Just across the bridge from our Louisville studio, we help Southern Indiana businesses get modern websites that load fast, rank locally and turn visitors into calls and bookings.',
    neighborhoods: ['New Albany', 'Jeffersonville', 'Clarksville', 'Sellersburg', 'Floyds Knobs', 'Charlestown', 'Corydon'],
    localNote: 'Ten minutes from our Louisville base — easy to meet in person.',
  },
]

export type Service = {
  slug: string
  title: string
  short: string
  description: string
  bullets: string[]
}

export const services: Service[] = [
  {
    slug: 'web-design',
    title: 'Custom Website Design',
    short: 'Hand-built marketing sites that load fast and convert.',
    description:
      'No templates or page builders. We design around your customers and your goals, then build it in modern code that scores high on Google’s Core Web Vitals.',
    bullets: ['5–15 custom pages', 'Mobile-first, accessible design', 'Copywriting help & photo direction', 'Lead forms & click-to-call'],
  },
  {
    slug: 'local-seo',
    title: 'Local SEO',
    short: 'Show up when people nearby search for what you do.',
    description:
      'Technical SEO, location pages, Google Business Profile setup and structured data so search engines understand exactly who you are and where you work.',
    bullets: ['Google Business Profile optimization', 'Schema markup & sitemaps', 'Service & location pages', 'Search Console reporting'],
  },
  {
    slug: 'web-apps',
    title: 'Web Apps & Portals',
    short: 'Booking systems, dashboards, client portals and more.',
    description:
      'When a website is not enough. We build custom software with logins, payments, scheduling and admin dashboards — the same stack that runs our own client portal.',
    bullets: ['User accounts & roles', 'Stripe / Square payments', 'Admin dashboards', 'Integrations & automation'],
  },
  {
    slug: 'ecommerce',
    title: 'E-commerce',
    short: 'Online stores and donation systems that just work.',
    description:
      'Product catalogs, checkout, donations and memberships with secure payment processing and an admin you can actually use.',
    bullets: ['Product catalog & checkout', 'Donations & recurring giving', 'Inventory & order emails', 'Secure payments'],
  },
  {
    slug: 'hosting-care',
    title: 'Hosting & Care Plans',
    short: 'We keep it fast, secure and up to date — forever.',
    description:
      'Managed hosting, backups, security updates and content changes. Text or email us and it gets done, usually within a business day.',
    bullets: ['Managed hosting & SSL', 'Backups & uptime monitoring', 'Content edits included', 'Priority support'],
  },
  {
    slug: 'redesigns',
    title: 'Website Redesigns',
    short: 'Turn an outdated or slow site into your best salesperson.',
    description:
      'We audit what you have, keep what ranks, redirect what moves and rebuild the rest — so you upgrade without losing the search traffic you have earned.',
    bullets: ['SEO-safe migration & redirects', 'Speed & accessibility audit', 'Content cleanup', 'Analytics setup'],
  },
]

export type Faq = { q: string; a: string }

export const faqs: Faq[] = [
  {
    q: 'How much does a website cost?',
    a: 'Every project is quoted up front after a free call, with no surprise invoices. Most small-business marketing sites land in the low thousands; web apps and online stores are scoped to the features you need. We also offer monthly plans that spread the cost out and include hosting and support.',
  },
  {
    q: 'How long does it take?',
    a: 'A typical marketing website takes 2–6 weeks from kickoff to launch, depending on page count and how quickly content comes together. Landing pages can go live in days. Web apps are planned in phases so you see working software early.',
  },
  {
    q: 'Do you only work with businesses in Louisville?',
    a: 'We are based in Louisville and work with businesses across Kentucky, Southern Indiana and Greater Cincinnati — in person when it helps, remotely the rest of the time. We also take projects from anywhere in the US.',
  },
  {
    q: 'Will my site show up on Google?',
    a: 'Every site we build includes technical SEO: fast load times, clean structure, metadata, schema markup, a sitemap and Search Console setup. For competitive local markets we add location pages and ongoing local SEO work.',
  },
  {
    q: 'Can I edit the site myself?',
    a: 'Yes. We can set up easy editing for the parts you change often, or you can just send us changes — content updates are included in our care plans.',
  },
  {
    q: 'What happens after launch?',
    a: 'We stick around. Hosting, security updates, backups and small changes are handled through your client portal, where you can also message us, see invoices and request new work.',
  },
]
