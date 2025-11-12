import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/requireRole';
import { prisma } from '@/lib/prisma';
import { TasksList } from '@/components/client/TasksList';
import { buildClientProjectWhere } from '@/lib/client-access';

export const metadata = {
  title: 'My Tasks | Client Dashboard',
  description: 'View and complete your project tasks',
};

export default async function ClientTasksPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?returnUrl=/client/tasks');
  }

  // Build access control where clause using centralized helper
  const identity = { userId: user.id, email: user.email };
  const projectWhere = await buildClientProjectWhere(identity);

  // Get user's accessible projects with their tasks
  const projects = await prisma.project.findMany({
    where: projectWhere,
    select: {
      id: true,
      name: true,
      clientTasks: {
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          status: true,
          dueDate: true,
          completedAt: true,
          createdAt: true,
        },
      },
    },
  });

  // Flatten all tasks from all projects
  const allTasks = projects.flatMap((project) =>
    project.clientTasks.map((task) => ({
      ...task,
      project: {
        id: project.id,
        name: project.name,
      },
    }))
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Tasks</h1>
        <p className="text-white/60">
          Complete tasks to help us deliver your project successfully
        </p>
      </div>

      <TasksList tasks={allTasks} />
    </div>
  );
}

