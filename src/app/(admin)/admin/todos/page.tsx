import { prisma } from "@/lib/prisma";
import { CheckCircle, Circle, Clock, User, Plus } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// You'll need to add a Todo model to your Prisma schema
// For now, using mock data structure
type Todo = {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedTo?: { name: string; email: string } | null;
  dueDate?: Date;
  createdAt: Date;
};

async function getUsers() {
  try {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      where: {
        role: { in: ['ADMIN', 'STAFF'] }
      }
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export default async function TodosPage() {
  const users = await getUsers();

  // Mock todos - replace with actual Prisma query when you add Todo model
  const todos: Todo[] = [
    {
      id: '1',
      title: 'Complete client onboarding',
      description: 'Set up new client portal access',
      status: 'TODO',
      priority: 'HIGH',
      dueDate: new Date('2025-10-15'),
      createdAt: new Date(),
    },
    {
      id: '2',
      title: 'Review project proposal',
      description: 'Check technical requirements and timeline',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      createdAt: new Date(),
    },
  ];

  const priorityColors = {
    LOW: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    MEDIUM: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    HIGH: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  const statusColumns = {
    TODO: { title: 'To Do', icon: Circle, color: 'text-slate-400' },
    IN_PROGRESS: { title: 'In Progress', icon: Clock, color: 'text-yellow-400' },
    DONE: { title: 'Done', icon: CheckCircle, color: 'text-green-400' },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white">Tasks</h1>
          <p className="text-slate-400 mt-2">Manage team tasks and assignments</p>
        </div>
        <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300 flex items-center gap-2">
          <Plus size={18} />
          New Task
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(statusColumns).map(([status, config]) => {
          const StatusIcon = config.icon;
          const columnTodos = todos.filter(t => t.status === status);
          
          return (
            <div key={status} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              {/* Column Header */}
              <div className="flex items-center gap-3 mb-6">
                <StatusIcon className={`${config.color}`} size={20} />
                <h2 className="text-white font-bold text-lg">{config.title}</h2>
                <span className="ml-auto bg-white/10 px-2 py-1 rounded-lg text-xs text-slate-400">
                  {columnTodos.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="space-y-4">
                {columnTodos.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500 text-sm">No tasks</p>
                  </div>
                ) : (
                  columnTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-white font-semibold text-sm flex-1">{todo.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${priorityColors[todo.priority]}`}>
                          {todo.priority}
                        </span>
                      </div>
                      
                      {todo.description && (
                        <p className="text-slate-400 text-xs mb-3 leading-relaxed">{todo.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs">
                        {todo.assignedTo ? (
                          <div className="flex items-center gap-2 text-slate-400">
                            <User size={12} />
                            <span>{todo.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">Unassigned</span>
                        )}
                        
                        {todo.dueDate && (
                          <span className="text-slate-500">
                            {new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Team Members (Quick Assign) */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-bold text-lg mb-4">Team Members</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-2 bg-white/5 rounded-lg p-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-slate-300 truncate">{user.name || user.email.split('@')[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
