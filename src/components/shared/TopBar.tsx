'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { FiChevronDown, FiLayout, FiLogOut, FiMenu, FiPhone, FiSettings, FiX } from 'react-icons/fi'
import LogoHeader from './LogoHeader'
import { site } from '@/lib/site'

const navLinks = [
  { path: '/services', label: 'Services' },
  { path: '/projects', label: 'Work' },
  { path: '/about', label: 'About' },
  { path: '/blog', label: 'Blog' },
  { path: '/contact', label: 'Contact' },
]

const STAFF_ROLES = ['CEO', 'ADMIN', 'CFO', 'FRONTEND', 'BACKEND', 'OUTREACH', 'STAFF', 'DEV', 'DESIGNER', 'INTERN', 'PARTNER']

export default function TopBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const profileRef = useRef<HTMLDivElement>(null)

  const user = session?.user
  const isAuthenticated = !!user
  const isStaff = STAFF_ROLES.includes((user?.role as string) || '')
  const dashboardHref = isStaff ? '/admin' : '/client'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
    setProfileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!profileOpen) return
    const handle = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [profileOpen])

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/')
    router.refresh()
  }

  const isActive = (path: string) => pathname === path || pathname?.startsWith(`${path}/`)
  const initial = (user?.name || user?.email || 'U').charAt(0).toUpperCase()

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-200 ${
          scrolled || mobileMenuOpen ? 'border-b border-white/[0.08] bg-[#0b0b0c]/90 backdrop-blur-md' : 'border-b border-transparent bg-[#0b0b0c]'
        }`}
      >
        <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8 lg:h-[72px]">
          <Link href="/" aria-label={`${site.name} home`} className="flex items-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
            <LogoHeader />
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  href={link.path}
                  aria-current={isActive(link.path) ? 'page' : undefined}
                  className={`rounded-full px-4 py-2 text-[15px] font-medium transition-colors ${
                    isActive(link.path) ? 'text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a href={site.phoneHref} className="hidden items-center gap-2 px-3 text-sm font-medium text-white/60 hover:text-white xl:inline-flex">
              <FiPhone aria-hidden className="h-4 w-4" />
              {site.phone}
            </a>

            {!isAuthenticated ? (
              <Link href="/login" className="hidden rounded-full px-4 py-2 text-[15px] font-medium text-white/70 hover:text-white lg:inline-flex">
                Client login
              </Link>
            ) : (
              <div className="relative hidden lg:block" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-white/80 hover:bg-white/5"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">{initial}</span>
                  <FiChevronDown aria-hidden className={`h-4 w-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>
                {profileOpen && (
                  <div role="menu" className="absolute right-0 mt-2 min-w-[220px] overflow-hidden rounded-2xl border border-white/10 bg-[#161618] shadow-2xl">
                    <div className="border-b border-white/10 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-white">{user?.name || 'Account'}</p>
                      <p className="truncate text-xs text-white/50">{user?.email}</p>
                    </div>
                    <Link role="menuitem" href={dashboardHref} className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5">
                      <FiLayout aria-hidden className="h-4 w-4" /> {isStaff ? 'Admin dashboard' : 'Client portal'}
                    </Link>
                    <Link role="menuitem" href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5">
                      <FiSettings aria-hidden className="h-4 w-4" /> Settings
                    </Link>
                    <button
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 border-t border-white/10 px-4 py-2.5 text-left text-sm text-white/80 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <FiLogOut aria-hidden className="h-4 w-4" /> Log out
                    </button>
                  </div>
                )}
              </div>
            )}

            <Link
              href={isAuthenticated ? '/start' : '/contact'}
              className="hidden rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 sm:inline-flex"
            >
              {isAuthenticated ? 'Start a project' : 'Get a quote'}
            </Link>

            <button
              className="rounded-full p-2 text-white/80 hover:bg-white/5 hover:text-white lg:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </nav>

        {mobileMenuOpen && (
          <div id="mobile-menu" className="border-t border-white/[0.08] bg-[#0b0b0c] lg:hidden">
            <ul className="mx-auto max-w-6xl space-y-1 px-5 py-5 sm:px-8">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    aria-current={isActive(link.path) ? 'page' : undefined}
                    className={`block rounded-xl px-4 py-3 text-lg font-medium ${isActive(link.path) ? 'bg-white/5 text-white' : 'text-white/70'}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mx-auto grid max-w-6xl gap-3 border-t border-white/[0.08] px-5 py-5 sm:px-8">
              <Link href={isAuthenticated ? '/start' : '/contact'} className="rounded-full bg-red-600 px-5 py-3 text-center font-semibold text-white">
                {isAuthenticated ? 'Start a project' : 'Get a free quote'}
              </Link>
              <a href={site.phoneHref} className="rounded-full border border-white/15 px-5 py-3 text-center font-semibold text-white">
                Call {site.phone}
              </a>
              {isAuthenticated ? (
                <div className="flex gap-3">
                  <Link href={dashboardHref} className="flex-1 rounded-full px-5 py-3 text-center text-white/70">
                    {isStaff ? 'Admin' : 'Client portal'}
                  </Link>
                  <button onClick={handleLogout} className="flex-1 rounded-full px-5 py-3 text-center text-white/70">
                    Log out
                  </button>
                </div>
              ) : (
                <Link href="/login" className="rounded-full px-5 py-3 text-center text-white/70">
                  Client login
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
      <div aria-hidden className="h-16 lg:h-[72px]" />
    </>
  )
}
