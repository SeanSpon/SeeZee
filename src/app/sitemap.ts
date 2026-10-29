import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { serviceAreas, site } from '@/lib/site'

// Regenerate hourly so newly published blog posts show up without a deploy.
export const revalidate = 3600

const staticRoutes: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
  { path: '', priority: 1, changeFrequency: 'weekly' },
  { path: '/services', priority: 0.95, changeFrequency: 'monthly' },
  { path: '/projects', priority: 0.85, changeFrequency: 'monthly' },
  { path: '/case-studies', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/case-studies/a-vision-for-you', priority: 0.7, changeFrequency: 'yearly' },
  { path: '/case-studies/big-red-bus', priority: 0.7, changeFrequency: 'yearly' },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.9, changeFrequency: 'yearly' },
  { path: '/start', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/partners', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/philosophy', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/accessibility', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = [
    ...staticRoutes.map((r) => ({
      url: `${site.url}${r.path}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...serviceAreas.map((area) => ({
      url: `${site.url}/web-design/${area.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
  ]

  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    })
    entries.push(
      ...posts.map((post) => ({
        url: `${site.url}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
    )
  } catch (error) {
    // The sitemap must still render if the database is unreachable at build time.
    console.error('[sitemap] Could not load blog posts:', error)
  }

  return entries
}
