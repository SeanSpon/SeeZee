'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import {
  FiHome,
  FiBriefcase,
  FiFileText,
  FiInfo,
  FiLayout,
  FiLogOut,
  FiMenu,
  FiX,
  FiUser,
  FiChevronDown,
  FiSettings,
  FiShield,
  FiBook,
  FiPlus,
  FiHeart,
  FiMail,
} from 'react-icons/fi'
import LogoHeader from './LogoHeader'
import { fetchJson } from '@/lib/client-api'

export default function TopBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const profileDropdownRef = useRef<HTMLDivElement>(null)
  const [userImage, setUserImage] = useState<string | null>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false)
      }
    }

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileDropdownOpen])

  const handleLogout = async () => {
    await signOut({ redirect: false })
    setMobileMenuOpen(false)
    setProfileDropdownOpen(false)
    router.push('/')
    router.refresh()
  }

  const isActive = (path: string) => pathname === path

  // Navigation links
  const navLinks = [
    { path: '/', label: 'Home', icon: FiHome },
    { path: '/services', label: 'Services', icon: FiBriefcase },
    { path: '/projects', label: 'Projects', icon: FiFileText },
    { path: '/partners', label: 'Partners', icon: FiHeart },
    { path: '/blog', label: 'Blog', icon: FiFileText },
    { path: '/philosophy', label: 'Philosophy', icon: FiBook },
    { path: '/about', label: 'About', icon: FiInfo },
    { path: '/contact', label: 'Contact', icon: FiMail },
  ]

  const isAuthenticated = !!session
  const user = session?.user
  const userRole = user?.role as string | undefined
  const isAdmin = userRole === 'CEO' || userRole === 'CFO' || 
                  ['FRONTEND', 'BACKEND', 'OUTREACH', 'ADMIN'].includes(userRole || '')

  // Fetch user image
  useEffect(() => {
    if (!isAuthenticated) return

    fetchJson<any>('/api/user/me')
      .then((data) => {
        if (data?.image) {
          setUserImage(data.image)
        }
      })
      .catch((err) => {
        console.error('Failed to fetch user image:', err)
      })
  }, [isAuthenticated])

  // Role badge configuration
  const getRoleBadgeConfig = (role?: string) => {
    const roleUpper = role?.toUpperCase()
    switch (roleUpper) {
      case 'CEO':
        return { color: 'bg-purple-500', label: 'CEO' }
      case 'ADMIN':
        return { color: 'bg-red-500', label: 'Admin' }
      case 'CFO':
        return { color: 'bg-blue-500', label: 'CFO' }
      case 'FRONTEND':
      case 'BACKEND':
      case 'OUTREACH':
      case 'STAFF':
        return { color: 'bg-green-500', label: 'Staff' }
      case 'CLIENT':
        return { color: 'bg-trinity-red', label: 'Client' }
      default:
        return { color: 'bg-gray-500', label: 'User' }
    }
  }

  const roleBadge = getRoleBadgeConfig(userRole)

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/"
                className="flex items-center focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="SeeZee Studio Home"
              >
                <LogoHeader />
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => {
                const active = isActive(link.path)
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ease-in-out ${
                      active
                        ? 'bg-trinity-red/15 text-white border-b-2 border-trinity-red'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>

            {/* Right side items */}
            <div className="flex items-center gap-3">
              {/* Desktop: Get in Touch CTA - visible to ALL users */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden lg:block"
              >
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-trinity-red hover:bg-red-700 text-white font-medium transition-all duration-150 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <FiMail className="w-4 h-4" />
                  Get in Touch
                </Link>
              </motion.div>

              {/* Desktop: Login or User Menu */}
              {!isAuthenticated ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden lg:block"
                >
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-lg border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white font-medium transition-all duration-150"
                  >
                    Login
                  </Link>
                </motion.div>
              ) : (
                <div className="hidden lg:flex items-center gap-3">
                  {/* Quick links for authenticated users */}
                  <Link
                    href={isAdmin ? '/admin' : '/client'}
                    className="px-3 py-2 text-gray-300 hover:text-white text-sm font-medium transition-colors"
                  >
                    {isAdmin ? 'Admin' : 'Portal'}
                  </Link>

                  {/* User Profile Dropdown */}
                  <div className="relative" ref={profileDropdownRef}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-all duration-150"
                    >
                      <div className={`w-8 h-8 ${roleBadge.color} rounded-full flex items-center justify-center text-white font-bold text-xs overflow-hidden`}>
                        {userImage ? (
                          <img 
                            src={userImage} 
                            alt={user?.name || 'User'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'
                        )}
                      </div>
                      <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                    </motion.button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {profileDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50 min-w-[200px]"
                        >
                          {/* User Info */}
                          <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50">
                            <p className="text-sm font-semibold text-white truncate">
                              {user?.name || 'User'}
                            </p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {user?.email || ''}
                            </p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${roleBadge.color} text-white mt-2`}>
                              {roleBadge.label}
                            </span>
                          </div>

                          {/* Menu Items */}
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setProfileDropdownOpen(false)
                                router.push('/settings')
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700 transition-[background-color] duration-150 ease-in-out text-left group"
                            >
                              <FiSettings className="w-4 h-4 text-gray-400 group-hover:text-white transition-[color] duration-150 ease-in-out" />
                              <span className="text-sm text-gray-300 group-hover:text-white transition-[color] duration-150 ease-in-out">
                                Settings
                              </span>
                            </button>
                            
                            <div className="border-t border-gray-700 my-1"></div>
                            
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-[background-color] duration-150 ease-in-out text-left group"
                            >
                              <FiLogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-[color] duration-150 ease-in-out" />
                              <span className="text-sm text-gray-300 group-hover:text-red-500 transition-[color] duration-150 ease-in-out">
                                Logout
                              </span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Mobile menu button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-150"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <FiX className="h-6 w-6" />
                ) : (
                  <FiMenu className="h-6 w-6" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm"
              >
                <div className="px-4 py-4 space-y-2">
                  {navLinks.map((link) => {
                    const Icon = link.icon
                    const active = isActive(link.path)
                    return (
                      <Link
                        key={link.path}
                        href={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ease-in-out ${
                          active
                            ? 'bg-trinity-red/15 text-white'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800'
                        }`}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon className="w-4 h-4" />
                        {link.label}
                      </Link>
                    )
                  })}

                  {/* Mobile: Contact CTA + Login or User Menu */}
                  <div className="border-t border-gray-800 pt-4 mt-4">
                    <Link
                      href="/contact"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-trinity-red text-white font-medium transition-all duration-150 mb-3"
                    >
                      <FiMail className="w-4 h-4" />
                      Get in Touch
                    </Link>
                    {!isAuthenticated ? (
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-gray-600 text-gray-300 font-medium transition-all duration-150"
                      >
                        <FiUser className="w-4 h-4" />
                        Login
                      </Link>
                    ) : (
                      <>
                        <Link
                          href={isAdmin ? '/admin' : '/client'}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white text-sm font-medium transition-colors"
                        >
                          <FiLayout className="w-4 h-4" />
                          {isAdmin ? 'Admin' : 'Client Portal'}
                        </Link>
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false)
                            router.push('/settings')
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white text-sm font-medium transition-colors mt-2"
                        >
                          <FiSettings className="w-4 h-4" />
                          Settings
                        </button>
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false)
                            handleLogout()
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-red-500 text-sm font-medium transition-colors mt-2"
                        >
                          <FiLogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Spacer to account for fixed top bar */}
      <div className="h-16" />
    </>
  )
}
