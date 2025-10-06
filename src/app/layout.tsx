import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { Navbar } from '../components/layout/navbar'
import { Footer } from '../components/layout/footer'
import { Providers } from './providers'
import { ClientAnimations } from '../components/ui/client-animations'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SeeZee Studio - Modern Web Development | Next.js, Tailwind, Full-Stack Solutions',
  description: 'SeeZee Studio is a small dev studio led by Sean & Zach, specializing in modern full-stack web applications with Next.js, Tailwind, Prisma, PostgreSQL, and Vercel deployment.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <ClientAnimations />
        </Providers>
      </body>
    </html>
  )
}