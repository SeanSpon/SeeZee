'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import { useSidebar } from './SidebarContext'
import {
  FiHome,
  FiBriefcase,
  FiFolder,
  FiInfo,
  FiLayout,
  FiLogOut,
  FiMenu,
  FiX,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiSettings,
  FiShield,
  FiZap,
  FiPlus,
} from 'react-icons/fi'
import LogoHeader from './LogoHeader'
import { fetchJson } from '@/lib/client-api'
import './Sidebar.css'

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false) // Mobile menu state
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false) // Profile dropdown state
  const { collapsed, setCollapsed } = useSidebar() // Desktop collapse state
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const profileDropdownRef = useRef<HTMLDivElement>(null)

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
    setSidebarOpen(false)
    setProfileDropdownOpen(false)
    router.push('/')
    router.refresh()
  }

  const isActive = (path: string) => pathname === path

  const navLinks = [
    { path: '/', label: 'Home', icon: FiHome },
    { path: '/services', label: 'Services', icon: FiBriefcase },
    { path: '/projects', label: 'Projects', icon: FiFolder },
    { path: '/about', label: 'About', icon: FiInfo },
  ]

  const isAuthenticated = !!session
  const user = session?.user
  const userRole = user?.role as string | undefined
  const isAdmin = userRole === 'CEO' || userRole === 'CFO' || 
                  ['FRONTEND', 'BACKEND', 'OUTREACH', 'ADMIN'].includes(userRole || '')
  const [hasActiveRequest, setHasActiveRequest] = useState(false)
  const [checkingRequests, setCheckingRequests] = useState(true)

  // Check for active project requests (only for clients)
  useEffect(() => {
    if (!isAuthenticated || isAdmin) {
      setCheckingRequests(false)
      return
    }

    fetchJson<any>('/api/client/requests')
      .then((data) => {
        const requests = data?.requests || []
        const active = requests.filter((req: any) => {
          const status = String(req.status || '').toUpperCase()
          return ['DRAFT', 'SUBMITTED', 'REVIEWING', 'NEEDS_INFO'].includes(status)
        })
        setHasActiveRequest(active.length > 0)
      })
      .catch((err) => {
        console.error('Failed to check active requests:', err)
        setHasActiveRequest(false)
      })
      .finally(() => {
        setCheckingRequests(false)
      })
  }, [isAuthenticated, isAdmin])

  // Role badge configuration
  const getRoleBadgeConfig = (role?: string) => {
    const roleUpper = role?.toUpperCase()
    switch (roleUpper) {
      case 'CEO':
        return { color: 'bg-purple-500', label: 'CEO', icon: FiShield, glow: 'shadow-purple-500/50' }
      case 'ADMIN':
        return { color: 'bg-red-500', label: 'Admin', icon: FiShield, glow: 'shadow-red-500/50' }
      case 'CFO':
        return { color: 'bg-blue-500', label: 'CFO', icon: FiShield, glow: 'shadow-blue-500/50' }
      case 'FRONTEND':
      case 'BACKEND':
      case 'OUTREACH':
      case 'STAFF':
        return { color: 'bg-green-500', label: 'Staff', icon: FiShield, glow: 'shadow-green-500/50' }
      case 'CLIENT':
        return { color: 'bg-trinity-red', label: 'Client', icon: FiUser, glow: 'shadow-trinity-red/50' }
      default:
        return { color: 'bg-gray-500', label: 'User', icon: FiUser, glow: 'shadow-gray-500/50' }
    }
  }

  const roleBadge = getRoleBadgeConfig(userRole)

  return (
    <>
      {/* Mobile menu button - fixed top left */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="fixed top-4 left-4 z-50 lg:hidden p-3 rounded-lg bg-gray-900/90 backdrop-blur-sm text-gray-300 hover:text-trinity-red hover:bg-gray-800 border border-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={sidebarOpen}
      >
        <motion.div
          animate={{ rotate: sidebarOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {sidebarOpen ? (
            <FiX className="h-6 w-6" />
          ) : (
            <FiMenu className="h-6 w-6" />
          )}
        </motion.div>
      </motion.button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 bg-gray-900 border-r border-gray-800 transform transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20 lg:w-20' : 'w-64 lg:w-64'
        } ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Toggle */}
          <div className={`p-4 lg:p-6 border-b border-gray-800 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
            {!collapsed && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/"
                  className="flex items-center focus:outline-none focus:ring-2 focus:ring-trinity-red focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="SeeZee Studio Home"
                >
                  <LogoHeader />
                </Link>
              </motion.div>
            )}
            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-[color,background-color] duration-150 ease-in-out"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <FiChevronRight className="w-5 h-5" />
              ) : (
                <FiChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="main-sidebar-nav flex-1 p-4 space-y-2 overflow-y-auto">
            {navLinks.map((link, index) => {
              const Icon = link.icon
              const active = isActive(link.path)
              return (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-[background-color] duration-150 ease-in-out ${
                      collapsed ? 'justify-center' : ''
                    } ${
                      active
                        ? 'bg-trinity-red border border-trinity-red shadow-lg'
                        : 'hover:bg-gray-800'
                    }`}
                    aria-current={active ? 'page' : undefined}
                    title={collapsed ? link.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="font-medium">{link.label}</span>}
                  </Link>
                </motion.div>
              )
            })}

            {/* Login (when not authenticated) */}
            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.05 }}
                className="pt-2"
              >
                <Link
                  href="/login"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-[background-color] duration-150 ease-in-out ${
                    collapsed ? 'justify-center' : ''
                  }`}
                  title={collapsed ? 'Login' : undefined}
                >
                  <FiUser className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="font-medium">Login</span>}
                </Link>
              </motion.div>
            )}

            {/* Quick Access Section (when authenticated) */}
            {isAuthenticated && !checkingRequests && (
              <div className="pt-4 mt-4 border-t border-gray-800">
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-2 mb-3 flex items-center gap-2"
                  >
                    <FiZap className="w-4 h-4 text-trinity-red" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Quick Access
                    </span>
                  </motion.div>
                )}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: navLinks.length * 0.05 }}
                >
                  {/* Show "Start Project" if no active request, otherwise show Dashboard */}
                  {!hasActiveRequest && !isAdmin ? (
                    <Link
                      href="/start"
                      onClick={() => setSidebarOpen(false)}
                      className={`dashboard-quick-access group relative flex items-center gap-3 px-4 py-4 rounded-xl font-semibold overflow-hidden ${
                        collapsed ? 'justify-center' : ''
                      }`}
                      aria-label="Start Project"
                      title={collapsed ? 'Start Project' : undefined}
                    >
                      {/* Animated background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-[length:200%_100%] animate-gradient"></div>
                      
                      {/* Content */}
                      <div className="relative flex items-center gap-3 w-full">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                          <FiPlus className="w-5 h-5 text-white" />
                        </div>
                        {!collapsed && (
                          <div className="flex-1">
                            <div className="text-white text-sm font-bold">
                              Start Project
                            </div>
                            <div className="text-white/70 text-xs">
                              Begin your new project
                            </div>
                          </div>
                        )}
                        {!collapsed && (
                          <FiZap className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
                        )}
                      </div>
                    </Link>
                  ) : (
                    <Link
                      href={isAdmin ? '/admin' : '/client'}
                      onClick={() => setSidebarOpen(false)}
                      className={`dashboard-quick-access group relative flex items-center gap-3 px-4 py-4 rounded-xl font-semibold overflow-hidden ${
                        collapsed ? 'justify-center' : ''
                      }`}
                      aria-label={isAdmin ? 'Admin Dashboard' : 'Client Dashboard'}
                      title={collapsed ? (isAdmin ? 'Admin Dashboard' : 'Client Dashboard') : undefined}
                    >
                      {/* Animated background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-trinity-red via-red-600 to-trinity-red bg-[length:200%_100%] animate-gradient"></div>
                      
                      {/* Content */}
                      <div className="relative flex items-center gap-3 w-full">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                          <FiLayout className="w-5 h-5 text-white" />
                        </div>
                        {!collapsed && (
                          <div className="flex-1">
                            <div className="text-white text-sm font-bold">
                              {isAdmin ? 'Admin Dashboard' : 'Client Dashboard'}
                            </div>
                            <div className="text-white/70 text-xs">
                              Manage your workspace
                            </div>
                          </div>
                        )}
                        {!collapsed && (
                          <FiZap className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
                        )}
                      </div>
                    </Link>
                  )}
                </motion.div>
              </div>
            )}
          </nav>

          {/* User Profile Section (when authenticated) */}
          {isAuthenticated && (
            <div className="p-4 border-t border-gray-800">
              {!collapsed ? (
                <div className="relative" ref={profileDropdownRef}>
                  {/* Profile Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-[background-color] duration-150 ease-in-out group"
                  >
                    {/* Avatar with role badge */}
                    <div className="relative">
                      <div className={`w-11 h-11 ${roleBadge.color} rounded-full flex items-center justify-center text-white font-bold shadow-lg ${roleBadge.glow} overflow-hidden`}>
                        {user?.image ? (
                          <img 
                            src={user.image} 
                            alt={user?.name || 'User'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'
                        )}
                      </div>
                      {/* Role Badge Icon */}
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${roleBadge.color} rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg`}>
                        {(() => {
                          const BadgeIcon = roleBadge.icon
                          return <BadgeIcon className="w-3 h-3 text-white" />
                        })()}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-semibold text-white truncate flex items-center gap-2">
                        {user?.name || 'User'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${roleBadge.color} text-white`}>
                          {roleBadge.label}
                        </span>
                      </div>
                    </div>

                    {/* Dropdown Arrow */}
                    <motion.div
                      animate={{ rotate: profileDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FiChevronDown className="w-4 h-4 text-gray-400 group-hover:text-white transition-[color] duration-150 ease-in-out" />
                    </motion.div>
                  </motion.button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50"
                      >
                        {/* User Email */}
                        <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50">
                          <p className="text-xs text-gray-400 truncate">
                            {user?.email || ''}
                          </p>
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
              ) : (
                /* Collapsed View */
                <div className="relative" ref={profileDropdownRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="relative mx-auto block"
                    title={`${user?.name || 'User'} (${roleBadge.label})`}
                  >
                    <div className={`w-11 h-11 ${roleBadge.color} rounded-full flex items-center justify-center text-white font-bold shadow-lg ${roleBadge.glow} overflow-hidden`}>
                      {user?.image ? (
                        <img 
                          src={user.image} 
                          alt={user?.name || 'User'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'
                      )}
                    </div>
                    {/* Role Badge Icon */}
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${roleBadge.color} rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg`}>
                      {(() => {
                        const BadgeIcon = roleBadge.icon
                        return <BadgeIcon className="w-3 h-3 text-white" />
                      })()}
                    </div>
                  </motion.button>

                  {/* Collapsed Dropdown Menu */}
                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, x: -10, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-0 left-full ml-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50 min-w-[200px]"
                      >
                        {/* User Info in collapsed dropdown */}
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
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

