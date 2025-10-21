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
import { Toaster } from '../components/ui/toaster'

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
          
          {/* Dark mesh gradient background */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
            {/* Base dark layer with slight gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black" />
            
            {/* Subtle accent hints - barely visible */}
            <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-blue-900/8 rounded-full blur-[120px]" />
            <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-purple-900/8 rounded-full blur-[120px]" />
            
            {/* Dark mesh overlay - lighter for better contrast */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(51, 65, 85, 0.4) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(51, 65, 85, 0.4) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }}
            />
          </div>

          {/* Stronger vignette for darker edges */}
          <div 
            className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,transparent_60%,rgba(0,0,0,0.6)_100%)]"
            style={{ zIndex: 1 }}
          />
          
          {/* Minimal noise texture */}
          <div 
            className="fixed inset-0 pointer-events-none opacity-[0.01] mix-blend-overlay"
            style={{
              zIndex: 2,
              backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')"
            }}
          />

          {/* Main site navbar on its own fixed layer */}
          <div className="nav-layer">
            <Navbar />
          </div>

          {/* Main content wrapper with flex layout */}
          <div className="flex flex-col flex-1 min-h-screen">
            {/* Main content area */}
            <div className="no-admin flex-1">
              <div className="main-layer">
                {children}
              </div>
            </div>
            
            {/* Footer at bottom */}
            <ConditionalFooter />
          </div>
          
          <ClientAnimations />
          <DebugHUD />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}