'use client'

import { usePathname } from 'next/navigation'
import TopBar from './TopBar'
import Footer from './Footer'

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Don't show top bar on dashboard/admin routes, auth pages, or login
  const isDashboardRoute = pathname?.startsWith('/client') || 
                           pathname?.startsWith('/admin') || 
                           pathname === '/login' ||
                           pathname === '/register' ||
                           pathname === '/forgot-password' ||
                           pathname === '/reset-password' ||
                           pathname?.startsWith('/onboarding') ||
                           pathname?.startsWith('/questionnaire')

  if (isDashboardRoute) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <TopBar />
      <div className="flex-1 flex flex-col min-w-0">
        <main 
          id="main-content" 
          className="flex-grow"
        >
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}

