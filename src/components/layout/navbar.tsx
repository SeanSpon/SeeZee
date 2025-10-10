'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session, status } = useSession()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <header className="nav-sticky">
      <div className="container-custom">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 font-bold text-lg">
            <div className="logo-gradient"></div>
            <span>SeeZee Studio</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="nav-link"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {status === 'loading' ? (
              <div className="text-dim">Loading...</div>
            ) : session ? (
              <>
                {session.user?.role === 'ADMIN' || session.user?.role === 'STAFF' ? (
                  <Link href="/admin/dashboard/overview" className="btn-ghost">
                    Admin
                  </Link>
                ) : (
                  <Link href="/dashboard/overview" className="btn-ghost">
                    Dashboard
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-dim text-sm">{session.user?.name}</span>
                  <span className="pill text-xs">{session.user?.role}</span>
                </div>
                <button onClick={() => signOut()} className="btn-subtle">
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" className="btn-primary">
                Sign in with Google
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="btn-subtle p-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <div className="glass-panel">
              <div className="flex flex-col gap-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="nav-link block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="separator"></div>
                {session ? (
                  <>
                    {(session.user?.role === 'ADMIN' || session.user?.role === 'STAFF') ? (
                      <Link
                        href="/admin/dashboard/overview"
                        className="nav-link block"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin
                      </Link>
                    ) : (
                      <Link
                        href="/dashboard/overview"
                        className="nav-link block"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="text-left nav-link"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="nav-link block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}