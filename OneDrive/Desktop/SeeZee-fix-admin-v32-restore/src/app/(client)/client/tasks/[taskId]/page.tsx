import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/requireRole';
import { prisma } from '@/lib/prisma';
import { SimpleQuestionnaireForm } from '@/components/client/SimpleQuestionnaireForm';

export const metadata = {
  title: 'Complete Task | Client Dashboard',
  description: 'Complete your project task',
};

interface PageProps {
  params: Promise<{ taskId: string }>;
}

export default async function TaskDetailPage({ params }: PageProps) {
  const { taskId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?returnUrl=/client/tasks/' + taskId);
  }

  // Get the task and verify user has access to it
  const task = await prisma.clientTask.findUnique({
    where: { id: taskId },
    include: {
      project: {
        include: {
          organization: {
            include: {
              members: {
                where: { userId: user.id },
              },
            },
          },
          projectQuestionnaire: true,
        },
      },
    },
  });

  if (!task) {
    return (
      <div className="p-6">
        <div className="bg-red-900/30 border border-red-700 text-red-300 px-6 py-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Task Not Found</h2>
          <p>The task you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  // Check if user has access to this project
  if (task.project.organization.members.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-red-900/30 border border-red-700 text-red-300 px-6 py-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
          <p>You don't have permission to view this task.</p>
        </div>
      </div>
    );
  }

  // Check if task is already completed
  if (task.status === 'completed') {
    return (
      <div className="p-6">
        <div className="bg-green-900/30 border border-green-700 text-green-300 px-6 py-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-2">Task Completed</h2>
          <p>You've already completed this task on {new Date(task.completedAt!).toLocaleDateString()}.</p>
        </div>

        {task.project.projectQuestionnaire && (
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Your Responses</h3>
            <pre className="text-white/60 text-sm overflow-auto">
              {JSON.stringify(task.project.projectQuestionnaire.responses, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  // Render questionnaire form if task type is questionnaire
  if (task.type === 'questionnaire') {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">{task.title}</h1>
          <p className="text-white/60">{task.description}</p>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="text-white/60">Project: <span className="text-white">{task.project.name}</span></span>
            {task.dueDate && (
              <span className="text-white/60">
                Due: <span className="text-white">{new Date(task.dueDate).toLocaleDateString()}</span>
              </span>
            )}
          </div>
        </div>

        <SimpleQuestionnaireForm
          taskId={task.id}
          projectId={task.project.id}
        />
      </div>
    );
  }

  // Default task view for non-questionnaire tasks
  return (
    <div className="p-6">
      <div className="bg-slate-900 border border-white/10 rounded-xl p-8">
        <h1 className="text-2xl font-bold text-white mb-4">{task.title}</h1>
        <p className="text-white/60 mb-6">{task.description}</p>
        <div className="text-sm text-white/40">
          <p>Task Type: {task.type}</p>
          <p>Status: {task.status}</p>
          {task.dueDate && <p>Due Date: {new Date(task.dueDate).toLocaleDateString()}</p>}
        </div>
      </div>
    </div>
  );
}

