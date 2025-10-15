import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { Navbar } from '../components/layout/navbar'
import { Footer } from '../components/layout/footer'
import { Providers } from './providers'
import DebugHUD from '../components/ui/debug-hud'
import { ClientAnimations } from '../components/ui/client-animations'
import Background from '../components/Background'
import { ConditionalFooter } from '../components/ConditionalFooter'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SeeZee Studio - Modern Web Development | Next.js, Tailwind, Full-Stack Solutions',
  description:
    'SeeZee Studio is a small dev studio led by Sean & Zach, specializing in modern full-stack web applications with Next.js, Tailwind, Prisma, PostgreSQL, and Vercel deployment.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <Providers>
          <Background />
          
          {/* Particle background container - z-0 behind everything */}
          <div 
            id="particles" 
            className="fixed inset-0 pointer-events-none overflow-hidden"
            style={{ zIndex: 0 }}
          />

          {/* Vignette overlay - z-1 */}
          <div 
            className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,transparent_70%,rgba(0,0,0,0.3)_100%)]"
            style={{ zIndex: 1 }}
          />
          
          {/* Noise texture overlay - z-2 */}
          <div 
            className="fixed inset-0 pointer-events-none opacity-[0.015] mix-blend-overlay"
            style={{
              zIndex: 2,
              backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')"
            }}
          />

          {/* Main site navbar on its own fixed layer */}
          <div className="nav-layer">
            <Navbar />
          </div>

          {/* Main content wrapper */}
          <div className="no-admin">
            <div className="main-layer">
              {children}
            </div>
          </div>
          
          <ConditionalFooter />
          <ClientAnimations />
          <DebugHUD />
        </Providers>
      </body>
    </html>
  )
}