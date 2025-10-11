'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Home, Briefcase, FolderOpen, Rocket, Search, User, Settings, LogOut } from 'lucide-react'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const { scrollY } = useScroll()
  
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.8)']
  )

  // Helper function to check if user is admin
  const isAdmin = (email?: string | null) => {
    if (!email) return false
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || ['seanspm1007@gmail.com']
    return adminEmails.includes(email)
  }

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Services', href: '/services', icon: Briefcase },
    { name: 'Projects', href: '/projects', icon: FolderOpen },
    { name: 'Start a Project', href: '/start', icon: Rocket },
  ]

  return (
    <motion.nav
      style={{ backgroundColor }}
      className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-xl border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-600 bg-clip-text text-transparent animate-pulse"
            >
              SEEZEE
            </motion.div>
          </Link>

          {/* Command Bar Style Navigation */}
          <div className="hidden md:flex items-center space-x-1 bg-black/20 backdrop-blur-sm rounded-full px-3 py-2 border border-white/10">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <button className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200">
              <Search className="h-5 w-5" />
            </button>
            
            {status === 'loading' ? (
              <div className="text-gray-400">Loading...</div>
            ) : session ? (
              <div className="flex items-center space-x-2">
                {/* User Role Indicator */}
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-gray-300">
                    {isAdmin(session.user?.email) ? 'Admin' : 'Client'}
                  </span>
                </div>
                
                {/* Navigation Links */}
                {isAdmin(session.user?.email) ? (
                  <Link 
                    href="/admin" 
                    className="flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium text-purple-300 hover:text-white hover:bg-purple-500/20 border border-purple-500/30 transition-all duration-200"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                ) : (
                  <Link 
                    href="/client" 
                    className="flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium text-cyan-300 hover:text-white hover:bg-cyan-500/20 border border-cyan-500/30 transition-all duration-200"
                  >
                    <User className="h-4 w-4" />
                    <span>Client Dashboard</span>
                  </Link>
                )}
                
                {/* User Info */}
                <div className="flex items-center space-x-2 px-3 py-2 rounded-full bg-white/5 border border-white/10">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm text-gray-300 max-w-24 truncate">
                    {session.user?.name || session.user?.email?.split('@')[0]}
                  </span>
                </div>
                
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-red-500/20 border border-red-500/30 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-full text-sm font-medium hover:from-purple-600 hover:to-cyan-600 transition-all duration-200 shadow-lg"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-black/90 backdrop-blur-xl border-t border-white/10"
        >
          <div className="px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
            <div className="border-t border-white/10 my-2"></div>
            {session ? (
              <>
                {/* Mobile Role Indicator */}
                <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-300">
                    Signed in as {isAdmin(session.user?.email) ? 'Admin' : 'Client'}
                  </span>
                </div>
                
                {isAdmin(session.user?.email) ? (
                  <Link
                    href="/admin"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-purple-300 hover:text-white hover:bg-purple-500/20 border border-purple-500/30 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Admin Dashboard</span>
                  </Link>
                ) : (
                  <Link
                    href="/client"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-cyan-300 hover:text-white hover:bg-cyan-500/20 border border-cyan-500/30 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>Client Dashboard</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-red-500/20 border border-red-500/30 transition-all duration-200 w-full text-left"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}