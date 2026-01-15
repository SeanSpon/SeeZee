import { Metadata } from 'next'

const baseUrl = 'https://see-zee.com'

interface PageMetadataProps {
  title: string
  description: string
  path: string
  keywords?: string[]
  ogImage?: string
  type?: 'website' | 'article'
}

export function generatePageMetadata({
  title,
  description,
  path,
  keywords = [],
  ogImage = '/opengraph-image',
  type = 'website',
}: PageMetadataProps): Metadata {
  const url = `${baseUrl}${path}`
  const fullTitle = `${title} | SeeZee Studio`

  const defaultKeywords = [
    'web development',
    'app development',
    'Next.js',
    'React',
    'Louisville KY',
    'custom software',
    'full-stack development',
    'website design',
    'small business websites',
  ]

  return {
    title: fullTitle,
    description,
    keywords: [...defaultKeywords, ...keywords],
    authors: [{ name: 'Sean & Zach', url: baseUrl }],
    creator: 'SeeZee Studio',
    publisher: 'SeeZee Studio',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: 'SeeZee Studio',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
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
    },
  }
}

export const defaultMetadata: Metadata = {
  title: 'SeeZee Studio | Custom Web & App Development',
  description:
    'Fast, reliable web applications and databases for small teams and big ideas. Next.js, React, and modern tech stack. Louisville, KY.',
  metadataBase: new URL(baseUrl),
}

