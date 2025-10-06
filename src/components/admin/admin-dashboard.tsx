'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

interface DashboardProps {
  initialSection?: string
}

export function AdminDashboard({ initialSection = 'overview' }: DashboardProps) {
  const [activeSection, setActiveSection] = useState(initialSection)
  const { data: session } = useSession()
  
  // Check if user has admin access for certain sections
  const isAdmin = session?.user?.email === 'sean@seezee.studio' || session?.user?.email === 'zach@seezee.studio'

  const navigation = [
    { id: 'overview', name: '📊 Overview', requiresAdmin: false },
    { id: 'projects', name: '🚀 Projects', requiresAdmin: false },
    { id: 'members', name: '👥 Team Members', requiresAdmin: true },
    { id: 'invoices', name: '💰 Invoices', requiresAdmin: true },
    { id: 'database', name: '🗄️ Database', requiresAdmin: true },
    { id: 'feed', name: '📰 Activity Feed', requiresAdmin: false },
    { id: 'files', name: '📁 Files', requiresAdmin: false },
    { id: 'todos', name: '✅ To-Do Lists', requiresAdmin: false },
  ]

  const filteredNavigation = navigation.filter(item => !item.requiresAdmin || isAdmin)

  const showSection = (sectionId: string) => {
    setActiveSection(sectionId)
  }

  const showNewProjectForm = () => {
    const form = document.getElementById('newProjectForm')
    if (form) form.classList.remove('hidden')
  }

  const hideNewProjectForm = () => {
    const form = document.getElementById('newProjectForm')
    if (form) form.classList.add('hidden')
  }

  const handleNewProject = (event: React.FormEvent) => {
    event.preventDefault()
    const form = event.target as HTMLFormElement
    const button = form.querySelector('button[type="submit"]') as HTMLButtonElement
    const originalText = button.textContent
    
    button.textContent = 'Creating...'
    button.disabled = true
    
    setTimeout(() => {
      button.textContent = 'Project Created! ✓'
      button.style.background = 'linear-gradient(135deg, #10b981, #059669)'
      
      setTimeout(() => {
        form.reset()
        hideNewProjectForm()
        if (originalText) button.textContent = originalText
        button.style.background = 'linear-gradient(135deg, #2563eb, #9333ea)'
        button.disabled = false
      }, 1500)
    }, 1000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
      <div className="h-full flex">
        {/* Sidebar */}
        <div className="w-64 glass-card m-4 rounded-2xl p-6">
          <div className="text-xl font-bold gradient-text mb-8">SeeZee Studio Admin</div>
          <nav className="space-y-2">
            {filteredNavigation.map((item) => (
              <button
                key={item.id}
                onClick={() => showSection(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg hover:bg-white/20 transition-all ${
                  activeSection === item.id ? 'bg-white/20' : ''
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 glass-card m-4 ml-0 rounded-2xl p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">
              {navigation.find(nav => nav.id === activeSection)?.name.replace(/^[^\s]* /, '') || 'Dashboard'}
            </h1>
            <button 
              onClick={() => window.location.href = '/'}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          {/* Dashboard Content Sections */}
          <div>
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div>
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  <div className="glass-card p-6 rounded-xl">
                    <div className="text-2xl font-bold gradient-text mb-2">3</div>
                    <div className="text-gray-300">Active Projects</div>
                  </div>
                  <div className="glass-card p-6 rounded-xl">
                    <div className="text-2xl font-bold gradient-text mb-2">2</div>
                    <div className="text-gray-300">Team Members</div>
                  </div>
                  <div className="glass-card p-6 rounded-xl">
                    <div className="text-2xl font-bold gradient-text mb-2">$4.5K</div>
                    <div className="text-gray-300">Monthly Revenue</div>
                  </div>
                  <div className="glass-card p-6 rounded-xl">
                    <div className="text-2xl font-bold gradient-text mb-2">100%</div>
                    <div className="text-gray-300">Client Satisfaction</div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                        <span className="text-gray-300">Big Red Bus project completed</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                        <span className="text-gray-300">New client inquiry received</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                        <span className="text-gray-300">Red Head Printings milestone reached</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                        <span className="text-gray-300">SeeZee Admin dashboard updated</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">Upcoming Tasks</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Client presentation prep</span>
                        <span className="text-yellow-400">Today</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Database optimization</span>
                        <span className="text-green-400">This week</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">New project kickoff</span>
                        <span className="text-blue-400">Next week</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Projects Section */}
            {activeSection === 'projects' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Projects</h2>
                  <button onClick={showNewProjectForm} className="glow-button px-4 py-2 rounded-lg">+ Create New Project</button>
                </div>
                
                <div className="grid gap-6">
                  <div className="glass-card p-6 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">Red Head Printings</h3>
                        <p className="text-gray-400">E-commerce Platform with Custom Quote System</p>
                      </div>
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Completed</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">Client: Tina Eith</div>
                      <div className="text-sm text-gray-400">Completed: Nov 2024</div>
                    </div>
                  </div>
                  
                  <div className="glass-card p-6 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">Big Red Bus</h3>
                        <p className="text-gray-400">Nonprofit Booking & Management System</p>
                      </div>
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Completed</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">Client: Mary Mason</div>
                      <div className="text-sm text-gray-400">Completed: Dec 2024</div>
                    </div>
                  </div>
                  
                  <div className="glass-card p-6 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">SeeZee Studio Admin</h3>
                        <p className="text-gray-400">Internal Project Management Dashboard</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">In Progress</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">Progress: 85%</div>
                      <div className="text-sm text-gray-400">Internal Project</div>
                    </div>
                  </div>
                </div>
                
                {/* New Project Form */}
                <div id="newProjectForm" className="glass-card p-6 rounded-xl mt-6 hidden">
                  <h3 className="text-xl font-bold mb-4">Create New Project</h3>
                  <form onSubmit={handleNewProject} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <input type="text" placeholder="Project Title" required
                             className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input type="text" placeholder="Client Name" required
                             className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <select required className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select Status</option>
                        <option value="planning">Planning</option>
                        <option value="in-progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Completed</option>
                      </select>
                      <input type="date" required
                             className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <textarea placeholder="Project Description" rows={3}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
                    <div className="flex space-x-4">
                      <button type="submit" className="glow-button px-6 py-2 rounded-lg">Create Project</button>
                      <button type="button" onClick={hideNewProjectForm} className="glass-card px-6 py-2 rounded-lg hover:bg-white/20 transition-all">Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {/* Continue with other sections... */}
            {activeSection === 'members' && isAdmin && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Team Members</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass-card p-6 rounded-xl text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">S</div>
                    <h3 className="text-xl font-bold">Sean</h3>
                    <p className="text-blue-400 mb-2">Lead Engineer</p>
                    <p className="text-gray-400 text-sm mb-4">Backend/Full-stack development, infrastructure, automation</p>
                    <div className="flex justify-center space-x-2 mb-4">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Next.js</span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">Node.js</span>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">Prisma</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      <div>📧 sean@seezee.studio</div>
                      <div>🎓 Trinity High School</div>
                    </div>
                  </div>
                  
                  <div className="glass-card p-6 rounded-xl text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">Z</div>
                    <h3 className="text-xl font-bold">Zach</h3>
                    <p className="text-green-400 mb-2">Frontend & Design Lead</p>
                    <p className="text-gray-400 text-sm mb-4">UI/UX Design, frontend development, client experience</p>
                    <div className="flex justify-center space-x-2 mb-4">
                      <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded text-xs">Tailwind</span>
                      <span className="px-2 py-1 bg-pink-500/20 text-pink-300 rounded text-xs">Design</span>
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">React</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      <div>📧 zach@seezee.studio</div>
                      <div>🎓 Trinity High School</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Other sections would continue here... */}
            {activeSection === 'feed' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Activity Feed</h2>
                <div className="space-y-4">
                  <div className="glass-card p-4 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      <span className="text-gray-300">New client added: TechCorp Industries</span>
                      <span className="text-gray-500 text-sm ml-auto">2 hours ago</span>
                    </div>
                  </div>
                  <div className="glass-card p-4 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      <span className="text-gray-300">Project milestone reached: Red Head Printings</span>
                      <span className="text-gray-500 text-sm ml-auto">1 day ago</span>
                    </div>
                  </div>
                  <div className="glass-card p-4 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                      <span className="text-gray-300">Invoice generated for Big Red Bus</span>
                      <span className="text-gray-500 text-sm ml-auto">3 days ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Add more sections as needed */}
          </div>
        </div>
      </div>
    </div>
  )
}