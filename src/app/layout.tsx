import React from 'react'
import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import '../styles/globals.css'
import { Providers } from './providers'
import DebugHUD from '../components/ui/debug-hud'
import { ClientAnimations } from '../components/ui/client-animations'
import SidebarWrapper from '../components/shared/SidebarWrapper'
import { Toaster } from '../components/ui/toaster'
import { PasswordSetupPrompt } from '../components/PasswordSetupPrompt'
import { CookieConsent } from '../components/shared/CookieConsent'
import { Analytics } from '@vercel/analytics/next'
import { site, serviceAreas } from '@/lib/site'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' })
const heading = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['500', '600', '700', '800'],
  variable: '--font-heading',
})

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  title: {
    default: 'Louisville Web Design & Development | SeeZee Studio',
    template: '%s | SeeZee Studio',
  },
  description:
    'Louisville, KY web design and development studio building fast, custom websites and web apps for small businesses and nonprofits in Louisville, Southern Indiana, Northern Kentucky and Cincinnati. Free consultation.',
  applicationName: site.name,
  authors: [{ name: 'SeeZee Studio', url: site.url }],
  creator: site.name,
  publisher: site.name,
  metadataBase: new URL(site.url),
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'Louisville Web Design & Development | SeeZee Studio',
    description:
      'Fast, custom websites and web apps for Louisville and Cincinnati businesses. Design, development, local SEO, hosting and support from one local team.',
    url: site.url,
    siteName: site.name,
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'SeeZee Studio — Louisville web design and development',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Louisville Web Design & Development | SeeZee Studio',
    description: 'Fast, custom websites and web apps for Louisville and Cincinnati businesses.',
    images: ['/opengraph-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_VERIFICATION
      ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION }
      : undefined,
  },
  category: 'technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Site-wide structured data. Page-specific schema (services, FAQ,
  // breadcrumbs) lives on the pages themselves.
  const schemaOrg = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'ProfessionalService'],
        '@id': `${site.url}/#organization`,
        name: site.name,
        alternateName: ['SeeZee', 'SeeZee Studios'],
        url: site.url,
        logo: {
          '@type': 'ImageObject',
          url: `${site.url}/icon.png`,
          width: 512,
          height: 512,
        },
        image: `${site.url}/opengraph-image.png`,
        description: site.description,
        email: site.email,
        telephone: '+1-502-435-2986',
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          addressLocality: site.city,
          addressRegion: site.region,
          addressCountry: site.country,
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: site.geo.latitude,
          longitude: site.geo.longitude,
        },
        areaServed: serviceAreas.map((area) => ({ '@type': 'Place', name: area.name })),
        founder: site.founders.map((f) => ({ '@type': 'Person', name: f.name, jobTitle: f.role })),
        sameAs: Object.values(site.social),
        knowsAbout: ['Web design', 'Web development', 'Local SEO', 'Next.js', 'E-commerce', 'Web applications'],
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '18:00',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${site.url}/#website`,
        url: site.url,
        name: site.name,
        inLanguage: 'en-US',
        publisher: { '@id': `${site.url}/#organization` },
      },
    ],
  };

  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Flash-prevention: apply theme/preferences before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var mode = localStorage.getItem('themeMode');
                  var theme = localStorage.getItem('theme');
                  var resolved = 'dark';
                  if (mode === 'system') {
                    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  } else if (mode === 'light' || mode === 'dark') {
                    resolved = mode;
                  } else if (theme === 'light' || theme === 'dark') {
                    resolved = theme;
                  }
                  document.documentElement.classList.add(resolved);
                  if (resolved === 'dark') document.documentElement.classList.remove('light');
                  else document.documentElement.classList.remove('dark');

                  if (localStorage.getItem('reduceAnimations') === 'true') {
                    document.documentElement.setAttribute('data-reduce-motion', 'true');
                  }
                  if (localStorage.getItem('compactMode') === 'true') {
                    document.documentElement.setAttribute('data-density', 'compact');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" href="/icon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0b0b0c" />
        
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-0KV89H26Z9"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-0KV89H26Z9');
            `,
          }}
        />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body className={`${inter.className} ${inter.variable} ${heading.variable}`} suppressHydrationWarning>
        <Providers>
          {/* Check if user needs to set password (OAuth-only users) */}
          <PasswordSetupPrompt />
          
          {/* Sidebar and content wrapper */}
          <SidebarWrapper>
            {children}
          </SidebarWrapper>
          
          <ClientAnimations />
          {process.env.NODE_ENV === 'development' && <DebugHUD />}
          <Toaster />
          <CookieConsent />
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}