'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  dueDate: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  project: {
    id: string;
    name: string;
  };
}

interface TasksListProps {
  tasks: Task[];
}

export function TasksList({ tasks }: TasksListProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return task.status === 'pending' || task.status === 'in_progress';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  const pendingCount = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-400 animate-pulse" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <FileText className="w-5 h-5 text-white/40" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || 'bg-slate-800 text-white/60 border-white/10'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'No due date';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = (dueDate: Date | null, status: string) => {
    if (!dueDate || status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6 border-b border-white/10">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          All Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            filter === 'pending'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            filter === 'completed'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No tasks found</h3>
          <p className="text-white/60">
            {filter === 'pending' && 'You have no pending tasks at the moment.'}
            {filter === 'completed' && 'You haven\'t completed any tasks yet.'}
            {filter === 'all' && 'No tasks available. New tasks will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                href={`/client/tasks/${task.id}`}
                className="block bg-slate-900 border border-white/10 rounded-xl p-6 hover:border-blue-500/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    {getStatusIcon(task.status)}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                        {task.title}
                      </h3>
                      <p className="text-white/60 text-sm line-clamp-2 mb-2">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-white/40">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {task.project.name}
                        </span>
                        {task.dueDate && (
                          <span className={`flex items-center gap-1 ${isOverdue(task.dueDate, task.status) ? 'text-red-400' : ''}`}>
                            <Clock className="w-3 h-3" />
                            Due {formatDate(task.dueDate)}
                            {isOverdue(task.dueDate, task.status) && ' (Overdue)'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(task.status)}
                    <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>

                {isOverdue(task.dueDate, task.status) && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400">This task is overdue. Please complete it as soon as possible.</span>
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

