import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { Providers } from './providers'
import DebugHUD from '../components/ui/debug-hud'
import { ClientAnimations } from '../components/ui/client-animations'
import SidebarWrapper from '../components/shared/SidebarWrapper'
import { Toaster } from '../components/ui/toaster'
import { PasswordSetupPrompt } from '../components/PasswordSetupPrompt'
import { CookieConsent } from '../components/shared/CookieConsent'
import { ChatWidget } from '../components/shared/ChatWidget'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({ subsets: ['latin'] })

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  title: {
    default: 'SeeZee Studio | Professional Web Development Louisville KY',
    template: '%s | SeeZee Studio',
  },
  description:
    'Professional web development in Louisville, KY. SeeZee Studio builds fast, modern websites and custom apps for businesses and community organizations. Expert website design and development services.',
  keywords: [
    'professional web development',
    'professional web developer',
    'web development Louisville',
    'Louisville web development',
    'Louisville KY web developer',
    'website design Louisville',
    'custom website development',
    'professional website design',
    'websites Louisville KY',
    'web developer Louisville',
    'Louisville website designer',
    'app development Louisville',
    'Next.js development',
    'React developer Louisville',
    'full-stack development Louisville',
    'custom software development',
    'business websites Louisville',
    'business websites',
    'e-commerce development Louisville',
    '48 hour website',
    'fast website development',
  ],
  authors: [{ name: 'Sean & Zach', url: 'https://seezeestudios.com' }],
  creator: 'SeeZee Studio',
  publisher: 'SeeZee Studio',
  metadataBase: new URL('https://seezeestudios.com'),
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        url: '/icon.png',
      },
    ],
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SeeZee Studio | Professional Web Development Louisville KY',
    description: 'Professional web development in Louisville, KY. Fast, modern websites and custom apps for businesses and community organizations.',
    url: 'https://seezeestudios.com',
    siteName: 'SeeZee Studio',
    images: [
      {
        url: 'https://seezeestudios.com/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'SeeZee Studio - Professional Web Development Louisville KY',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SeeZee Studio | Professional Web Developer Louisville KY',
    description: 'Professional websites and apps built fast in Louisville, KY. Expert web development for businesses and organizations.',
    images: ['https://seezeestudios.com/opengraph-image.png'],
    creator: '@seezee_studio',
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
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION || '',
    },
  },
  category: 'technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Enhanced structured data for SEO
  const schemaOrg = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://seezeestudios.com/#organization',
        name: 'SeeZee Studio',
        alternateName: 'SeeZee',
        url: 'https://seezeestudios.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://seezeestudios.com/icon.png',
          width: 512,
          height: 512,
        },
        description: 'Professional web development services in Louisville, KY. Fast, modern websites and custom apps for businesses and community organizations.',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Louisville',
          addressRegion: 'KY',
          addressCountry: 'US',
        },
        founder: [
          {
            '@type': 'Person',
            name: 'Sean McCulloch',
            jobTitle: 'Lead Developer & Designer',
          },
          {
            '@type': 'Person',
            name: 'Zach',
            jobTitle: 'Operations & Client Experience',
          },
        ],
        sameAs: [
          'https://twitter.com/seezee_studio',
          'https://github.com/seezee',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Service',
          availableLanguage: 'English',
          areaServed: 'US',
        },
        priceRange: '$$',
        areaServed: [
          {
            '@type': 'City',
            name: 'Louisville',
          },
          {
            '@type': 'State',
            name: 'Kentucky',
          },
          {
            '@type': 'Country',
            name: 'United States',
          },
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://seezeestudios.com/#website',
        url: 'https://seezeestudios.com',
        name: 'SeeZee Studio',
        description: 'Professional web development in Louisville, KY. Fast, modern websites and custom apps.',
        publisher: {
          '@id': 'https://seezeestudios.com/#organization',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://seezeestudios.com/?s={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'LocalBusiness',
        '@id': 'https://seezeestudios.com/#localbusiness',
        name: 'SeeZee Studio',
        image: 'https://seezeestudios.com/opengraph-image.png',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Louisville',
          addressRegion: 'KY',
          addressCountry: 'US',
        },
        priceRange: '$$',
        url: 'https://seezeestudios.com',
        telephone: '',
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
          opens: '00:00',
          closes: '23:59',
        },
      },
    ],
  };

  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" href="/icon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#dc2626" />
        
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
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {/* Check if user needs to set password (OAuth-only users) */}
          <PasswordSetupPrompt />
          
          {/* Sidebar and content wrapper */}
          <SidebarWrapper>
            {children}
          </SidebarWrapper>
          
          <ClientAnimations />
          <DebugHUD />
          <Toaster />
          <CookieConsent />
          <ChatWidget />
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}