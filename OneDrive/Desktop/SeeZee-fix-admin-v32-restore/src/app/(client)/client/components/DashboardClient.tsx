"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { fetchJson, normalizeItems } from "@/lib/client-api";
import StatusBadge from "@/components/ui/StatusBadge";
import { shouldShowPreClientDashboard, getDashboardState, getActiveProjectRequest } from "@/lib/dashboard-state";
import { 
  FiArrowRight, 
  FiFolder, 
  FiFileText, 
  FiMessageSquare, 
  FiCheckCircle,
  FiPlus,
  FiAlertCircle,
  FiClock,
  FiEdit,
  FiTrash2,
  FiCalendar,
  FiDollarSign,
  FiBriefcase,
  FiMail
} from "react-icons/fi";

interface Project {
  id: string;
  name: string;
  status: string;
  dueDate?: string;
  phase?: string;
  milestones?: Array<{ status: string }>;
}

interface Invoice {
  id: string;
  status: string;
  total?: number;
}

interface ProjectRequest {
  id: string;
  title: string;
  description?: string;
  status: string;
  contactEmail: string;
  company?: string;
  budget?: string;
  timeline?: string;
  services?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Request {
  id: string;
  title: string;
  description?: string;
  status: string;
  createdAt: string;
}

interface Message {
  id: string;
  senderName?: string;
  message: string;
  createdAt: string;
}

export default function ClientDashboardClient() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [projectRequests, setProjectRequests] = useState<ProjectRequest[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all data in parallel
        const [projectsData, invoicesData, projectRequestsData, overviewData] = await Promise.all([
          fetchJson<any>("/api/client/projects").catch(() => ({ items: [] })),
          fetchJson<any>("/api/client/invoices").catch(() => ({ invoices: [] })),
          fetchJson<any>("/api/client/requests").catch(() => ({ requests: [] })),
          fetchJson<any>("/api/client/overview").catch(() => ({})),
        ]);

        setProjects(normalizeItems(projectsData));
        setInvoices(normalizeItems(invoicesData));
        // Project requests are returned from /api/client/requests endpoint
        const projectRequestsList = projectRequestsData?.requests || [];
        setProjectRequests(projectRequestsList);
        // Also set requests for the "Recent Requests" section (using same data)
        setRequests(projectRequestsList.map((req: ProjectRequest) => ({
          id: req.id,
          title: req.title || 'Untitled Request',
          description: req.description || undefined,
          status: req.status,
          createdAt: req.createdAt,
        })));
        
        // Messages might be in overview or separate endpoint
        if (overviewData?.messages) {
          setMessages(normalizeItems(overviewData.messages));
        } else if (overviewData?.activity?.items) {
          // Map activity items to messages format if needed
          setMessages(overviewData.activity.items.map((item: any) => ({
            id: item.id,
            senderName: item.user?.name || 'System',
            message: item.description || item.title || '',
            createdAt: item.createdAt,
          })));
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const activeProjects = projects.filter((p) => {
    const status = String(p.status || '').toUpperCase();
    return ['ACTIVE', 'IN_PROGRESS', 'DESIGN', 'BUILD', 'REVIEW', 'PLANNING', 'LAUNCH'].includes(status);
  });
  const pendingInvoices = invoices.filter((inv) => {
    const status = String(inv.status || '').toUpperCase();
    return ['SENT', 'DRAFT', 'OVERDUE'].includes(status);
  });
  const activeRequests = requests.filter((req) => {
    const status = String(req.status || '').toUpperCase();
    return ['SUBMITTED', 'REVIEWING', 'DRAFT', 'NEEDS_INFO'].includes(status);
  });
  
  // Check for active project requests (status: DRAFT, SUBMITTED, REVIEWING, NEEDS_INFO)
  const activeProjectRequests = projectRequests.filter((req) => {
    const status = String(req.status || '').toUpperCase();
    return ['DRAFT', 'SUBMITTED', 'REVIEWING', 'NEEDS_INFO'].includes(status);
  });
  
  const recentMessages = messages.slice(0, 3);

  // Determine dashboard state
  const dashboardState = getDashboardState(projectRequests, projects);
  const showPreClientDashboard = shouldShowPreClientDashboard(projectRequests, projects);
  const activeProjectRequest = getActiveProjectRequest(projectRequests);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trinity-red"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  // Pre-Client Dashboard - Show when user has active project request or only LEAD projects
  if (showPreClientDashboard) {
    return (
      <div className="space-y-8">
        {/* Pre-Client Dashboard Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-700/50 p-8"
        >
          <h1 className="text-3xl font-heading font-bold text-white mb-2">
            Welcome, {session?.user?.name || 'User'}!
          </h1>
          <p className="text-gray-300">
            Your project request is being reviewed. You'll have full dashboard access once your project is approved.
          </p>
        </motion.div>

        {/* Current Project Request Status */}
        {activeProjectRequest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 rounded-xl border border-gray-800 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold text-white">Current Project Request</h2>
              <StatusBadge status={activeProjectRequest.status} size="md" />
            </div>

            <div className="space-y-6">
              {/* Request Details */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">{activeProjectRequest.title || 'Untitled Request'}</h3>
                {activeProjectRequest.description && (
                  <p className="text-gray-300 mb-4">{activeProjectRequest.description}</p>
                )}

              {/* Request Meta Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {activeProjectRequest.company && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <FiBriefcase className="w-5 h-5 text-blue-400" />
                    <span>{activeProjectRequest.company}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-300">
                  <FiMail className="w-5 h-5 text-blue-400" />
                  <span>{activeProjectRequest.contactEmail}</span>
                </div>
                {activeProjectRequest.budget && activeProjectRequest.budget !== "UNKNOWN" && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <FiDollarSign className="w-5 h-5 text-blue-400" />
                    <span>{activeProjectRequest.budget.replace(/_/g, ' ')}</span>
                  </div>
                )}
                {activeProjectRequest.timeline && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <FiCalendar className="w-5 h-5 text-blue-400" />
                    <span>{activeProjectRequest.timeline}</span>
                  </div>
                )}
              </div>

              {/* Services */}
              {activeProjectRequest.services && activeProjectRequest.services.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeProjectRequest.services.map((service: string) => (
                      <span
                        key={service}
                        className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm font-medium rounded-lg border border-blue-500/30"
                      >
                        {service.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Timeline */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-400 mb-4">Status Timeline</h4>
                <div className="space-y-3">
                  {[
                    { status: 'DRAFT', label: 'Draft Created', completed: true },
                    { status: 'SUBMITTED', label: 'Submitted', completed: activeProjectRequest.status !== 'DRAFT' },
                    { status: 'REVIEWING', label: 'Under Review', completed: ['REVIEWING', 'NEEDS_INFO', 'APPROVED', 'REJECTED'].includes(activeProjectRequest.status) },
                    { status: activeProjectRequest.status, label: activeProjectRequest.status.replace(/_/g, ' '), completed: ['APPROVED', 'REJECTED'].includes(activeProjectRequest.status) },
                  ].map((step, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                        step.completed
                          ? 'bg-green-500/20 border-green-500/50'
                          : 'bg-white/5 border-white/20'
                      }`}>
                        {step.completed && <FiCheckCircle className="w-4 h-4 text-green-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white text-sm">{step.label}</div>
                        {step.completed && (
                          <div className="text-xs text-gray-400 mt-1">
                            {activeProjectRequest.createdAt && new Date(activeProjectRequest.createdAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-800">
                {(activeProjectRequest.status === 'DRAFT' || activeProjectRequest.status === 'SUBMITTED') && (
                  <>
                    <Link
                      href={`/start?edit=${activeProjectRequest.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      <FiEdit className="w-4 h-4" />
                      Edit Request
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this request?')) {
                          // Delete functionality will be handled in RequestsClient
                          window.location.href = `/client/requests?delete=${activeProjectRequest.id}`;
                        }
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      Delete Request
                    </button>
                  </>
                )}
                <Link
                  href="/client/requests"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  View Full Details
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
        )}

        {/* Waiting Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-xl border border-amber-700/50 p-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <FiClock className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-heading font-bold text-white mb-2">
                Waiting for Review
              </h3>
              <p className="text-gray-300">
                Your project request is currently being reviewed by our team. Once approved, you'll receive full dashboard access and can start working on your project. We typically review requests within 24 hours.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Show LEAD projects if any */}
        {dashboardState.leadProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-heading font-bold text-white mb-6">Waiting Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardState.leadProjects.map((project) => (
                <motion.div
                  key={project.id}
                  whileHover={{ y: -4 }}
                  className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-trinity-red transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-heading font-bold text-white mb-2">
                        {project.name}
                      </h3>
                      <StatusBadge status={project.status} size="sm" />
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    This project is waiting for conversion from lead to active project.
                  </p>
                  <Link
                    href={`/client/projects/${project.id}`}
                    className="inline-flex items-center gap-2 text-trinity-red hover:text-trinity-maroon transition-colors font-medium"
                  >
                    View Details
                    <FiArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  // Full Dashboard - Show when user has active projects
  return (
    <div className="space-y-8">
      {/* Start Project Section */}
      {activeProjectRequests.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-xl border border-amber-700/50 p-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <FiAlertCircle className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-heading font-bold text-white mb-2">
                You have an active project request
              </h2>
              <p className="text-gray-300 mb-4">
                You currently have a project request in progress. Please wait for it to be reviewed before submitting a new one.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {activeProjectRequests.map((req) => (
                  <div
                    key={req.id}
                    className="px-3 py-1.5 bg-amber-500/20 rounded-lg border border-amber-500/30"
                  >
                    <p className="text-sm font-medium text-white">{req.title || 'Untitled Request'}</p>
                    <p className="text-xs text-amber-300/80 mt-1">
                      Status: {req.status.replace(/_/g, ' ')}
                    </p>
                  </div>
                ))}
              </div>
              <Link
                href="/client/requests"
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
              >
                View My Requests
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-700/50 p-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-heading font-bold text-white mb-2">
                Ready to start a new project?
              </h2>
              <p className="text-gray-300">
                Get your professional website built in 48 hours. Choose your package and let's get started!
              </p>
            </div>
            <Link
              href="/start"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-blue-500/25"
            >
              <FiPlus className="w-5 h-5" />
              Start Project
            </Link>
          </div>
        </motion.div>
      )}

      {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-xl border border-gray-800 p-8"
          >
        <h1 className="text-3xl font-heading font-bold text-white mb-2">
          Welcome back, {session?.user?.name || 'User'}!
        </h1>
        <p className="text-gray-400">
          Here's an overview of your projects and account activity.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-trinity-red transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <FiFolder className="w-8 h-8 text-trinity-red" />
            <StatusBadge status="active" size="sm" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{activeProjects.length}</h3>
          <p className="text-sm text-gray-400">Active Projects</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-trinity-red transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <FiFileText className="w-8 h-8 text-yellow-500" />
            <StatusBadge status="unpaid" size="sm" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{pendingInvoices.length}</h3>
          <p className="text-sm text-gray-400">Pending Invoices</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-trinity-red transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <FiMessageSquare className="w-8 h-8 text-blue-500" />
            <StatusBadge status="in_progress" size="sm" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{activeRequests.length}</h3>
          <p className="text-sm text-gray-400">Active Requests</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-trinity-red transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <FiCheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{projects.length}</h3>
          <p className="text-sm text-gray-400">Total Projects</p>
        </motion.div>
      </div>

      {/* Active Projects */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-bold text-white">Active Projects</h2>
          <Link
            href="/client/projects"
            className="flex items-center gap-2 text-trinity-red hover:text-trinity-maroon transition-colors font-medium"
          >
            View All
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {activeProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeProjects.map((project) => (
              <motion.div
                key={project.id}
                whileHover={{ y: -4 }}
                className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-trinity-red/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-heading font-bold text-white mb-2">
                      {project.name}
                    </h3>
                    <StatusBadge status={project.status} size="sm" />
                  </div>
                </div>
                {project.dueDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
                <Link
                  href={`/client/projects/${project.id}`}
                  className="inline-flex items-center gap-2 text-trinity-red hover:text-trinity-maroon transition-colors font-medium"
                >
                  View Details
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
            <p className="text-gray-400 mb-4">No active projects</p>
            {activeProjectRequests.length > 0 ? (
              <div className="space-y-3">
                <p className="text-amber-400 text-sm mb-4">
                  You have an active project request. Please wait for it to be reviewed.
                </p>
                <Link
                  href="/client/requests"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                >
                  View My Requests
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <Link
                href="/start"
                className="inline-flex items-center gap-2 px-4 py-2 bg-trinity-red text-white rounded-lg hover:bg-trinity-maroon transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Start a New Project
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Requests</h3>
            <Link
              href="/client/requests"
              className="text-sm text-trinity-red hover:text-trinity-maroon transition-colors"
            >
              View All
            </Link>
          </div>
          {activeRequests.length > 0 ? (
            <div className="space-y-3">
              {activeRequests.slice(0, 3).map((request) => (
                <div
                  key={request.id}
                  className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-white">{request.title}</h4>
                    <StatusBadge status={request.status} size="sm" />
                  </div>
                  {request.description && (
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {request.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No recent requests</p>
          )}
        </div>

        {/* Recent Messages */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Messages</h3>
            <Link
              href="/client/messages"
              className="text-sm text-trinity-red hover:text-trinity-maroon transition-colors"
            >
              View All
            </Link>
          </div>
          {recentMessages.length > 0 ? (
            <div className="space-y-3">
              {recentMessages.map((message) => (
                <div
                  key={message.id}
                  className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      {message.senderName && (
                        <p className="font-medium text-white">{message.senderName}</p>
                      )}
                      <p className="text-sm text-gray-400">{message.message}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No recent messages</p>
          )}
        </div>
      </div>
    </div>
  );
}
