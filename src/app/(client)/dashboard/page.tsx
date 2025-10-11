'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ClientDashboardPage() {
  const { data: session, status } = useSession()
  const [projects, setProjects] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData()
    }
  }, [status])

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, invoicesRes] = await Promise.all([
        fetch('/api/client/projects'),
        fetch('/api/client/invoices')
      ])

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json()
        setProjects(projectsData.projects || [])
      }

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json()
        setInvoices(invoicesData.invoices || [])
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/60">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-white/60 mb-6">Please sign in to access your dashboard</p>
          <Link
            href="/api/auth/signin"
            className="inline-flex items-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Client Dashboard</h1>
              <p className="text-white/60">Welcome back, {session?.user?.name}</p>
            </div>
            <Link
              href="/api/auth/signout"
              className="text-white/60 hover:text-white transition-colors"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects Section */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-6">Your Projects</h2>
            
            {projects.length === 0 ? (
              <div className="bg-white/5 rounded-xl p-8 border border-white/10 text-center">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-white font-semibold mb-2">No Projects Yet</h3>
                <p className="text-white/60 mb-4">Your projects will appear here once they're created</p>
                <Link
                  href="/checkout"
                  className="inline-flex items-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Start New Project
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project: any) => (
                  <div key={project.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{project.name}</h3>
                        <p className="text-white/60">{project.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        project.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' :
                        project.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    
                    {project.milestones && project.milestones.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-white/80 font-medium text-sm">Project Milestones</h4>
                        {project.milestones.slice(0, 3).map((milestone: any) => (
                          <div key={milestone.id} className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              milestone.completed ? 'bg-emerald-500' : 'bg-white/20'
                            }`}></div>
                            <span className={`text-sm ${
                              milestone.completed ? 'text-white/80 line-through' : 'text-white/60'
                            }`}>
                              {milestone.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Invoices */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-semibold mb-4">Recent Invoices</h3>
              {invoices.length === 0 ? (
                <p className="text-white/60 text-sm">No invoices yet</p>
              ) : (
                <div className="space-y-3">
                  {invoices.slice(0, 3).map((invoice: any) => (
                    <div key={invoice.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-white/80 text-sm">{invoice.number}</p>
                        <p className="text-white/60 text-xs">{invoice.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/80 text-sm">${invoice.total}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          invoice.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' :
                          invoice.status === 'SENT' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-white/10 text-white/60'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/client/projects"
                  className="block w-full text-left px-4 py-3 bg-white/5 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
                >
                  📋 View All Projects
                </Link>
                <Link
                  href="/client/invoices"
                  className="block w-full text-left px-4 py-3 bg-white/5 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
                >
                  💳 View Invoices
                </Link>
                <Link
                  href="/checkout"
                  className="block w-full text-left px-4 py-3 bg-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors"
                >
                  ✨ Start New Project
                </Link>
              </div>
            </div>

            {/* Support */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-semibold mb-4">Need Help?</h3>
              <div className="space-y-3 text-sm">
                <a href="mailto:hello@seezee.studio" className="block text-white/60 hover:text-white transition-colors">
                  📧 Email Support
                </a>
                <a href="tel:+1234567890" className="block text-white/60 hover:text-white transition-colors">
                  📱 Call Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
