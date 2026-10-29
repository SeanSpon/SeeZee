import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Client Login',
  description: 'Sign in to the SeeZee Studio client portal.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/login' },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
