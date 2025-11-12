import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/requireRole';
import { prisma } from '@/lib/prisma';
import { TasksList } from '@/components/client/TasksList';

export const metadata = {
  title: 'My Tasks | Client Dashboard',
  description: 'View and complete your project tasks',
};

export default async function ClientTasksPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?returnUrl=/client/tasks');
  }

  // Get user's projects
  const organizations = await prisma.organizationMember.findMany({
    where: { userId: user.id },
    include: {
      organization: {
        include: {
          projects: {
            include: {
              clientTasks: {
                orderBy: {
                  createdAt: 'desc',
                },
              },
            },
          },
        },
      },
    },
  });

  // Flatten all tasks from all projects
  const allTasks = organizations.flatMap((orgMember) =>
    orgMember.organization.projects.flatMap((project) =>
      project.clientTasks.map((task) => ({
        ...task,
        project: {
          id: project.id,
          name: project.name,
        },
      }))
    )
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

