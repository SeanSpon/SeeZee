import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/ceo',
          '/client',
          '/portal',
          '/api/',
          '/onboarding',
          '/billing',
          '/settings',
          '/login',
          '/signin',
          '/signup',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/set-password',
          '/verify-email',
          '/verify-request',
          '/clear-cookies',
          '/refresh-session',
          '/checkout',
          '/no-access',
          '/account-status',
        ],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  }
}
