// Real client and studio projects highlighted on the marketing pages.
// The full portfolio lives on /projects.

export type WorkItem = {
  slug: string
  name: string
  client: string
  location: string
  category: string
  summary: string
  results: string[]
  image?: string
  href: string
  liveUrl?: string
}

export const featuredWork: WorkItem[] = [
  {
    slug: 'a-vision-for-you',
    name: 'A Vision For You',
    client: '501(c)(3) nonprofit',
    location: 'Louisville, KY',
    category: 'Nonprofit platform',
    summary:
      'A full operations platform: public website, online donations, program intake, meeting RSVPs and a staff dashboard — replacing a patchwork of tools.',
    results: ['Online donations 24/7', '4 program pathways', '500+ members supported yearly'],
    image: '/avfy-home.png',
    href: '/case-studies/a-vision-for-you',
    liveUrl: 'https://www.avisionforyourecovery.org',
  },
  {
    slug: 'big-red-bus',
    name: 'Big Red Bus',
    client: 'Community directory',
    location: 'Louisville, KY',
    category: 'Web app',
    summary:
      'A directory connecting people with local nonprofits and community businesses, designed for clarity first with large type and simple navigation.',
    results: ['Searchable directory', 'Deals & reviews', 'WCAG-minded design'],
    image: '/big-red-bus-1.png',
    href: '/case-studies/big-red-bus',
  },
  {
    slug: 'frosty-snoballs',
    name: 'Frosty Sno-Balls',
    client: 'Mobile shaved ice',
    location: 'Louisville & Shelbyville, KY',
    category: 'Small business website',
    summary:
      'A bright, mobile-first site with a filterable flavor menu, event services and a booking request form so customers can book from their phone.',
    results: ['Event booking requests', 'Filterable menu', 'Mobile-first'],
    href: '/projects',
    liveUrl: 'https://frostysnoballs.com',
  },
  {
    slug: 'taxfeeder',
    name: 'TaxFeeder Software',
    client: 'Tax preparation SaaS',
    location: 'United States',
    category: 'SaaS product site',
    summary:
      'Marketing site and product platform for tax professionals — from solo preparers to multi-office firms — with tiered plans and a reseller program.',
    results: ['50-state e-file', '3 user tiers', 'Stripe billing'],
    href: '/projects',
    liveUrl: 'https://www.taxfeedersoftware.com',
  },
]
