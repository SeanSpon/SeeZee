import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/requireRole';
import { prisma } from '@/lib/prisma';
import { BillingDashboard } from '@/components/client/BillingDashboard';

export const metadata = {
  title: 'Billing | Client Dashboard',
  description: 'Manage your subscription and billing',
};

export default async function ClientBillingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?returnUrl=/client/billing');
  }

  // Get user's projects with subscriptions
  const organizations = await prisma.organizationMember.findMany({
    where: { userId: user.id },
    include: {
      organization: {
        include: {
          projects: {
            include: {
              subscriptions: {
                orderBy: {
                  createdAt: 'desc',
                },
              },
              invoices: {
                orderBy: {
                  createdAt: 'desc',
                },
                take: 10,
              },
            },
          },
        },
      },
    },
  });

  // Flatten all projects
  const projects = organizations.flatMap((orgMember) =>
    orgMember.organization.projects.map((project) => ({
      id: project.id,
      name: project.name,
      maintenancePlan: project.maintenancePlan,
      maintenanceStatus: project.maintenanceStatus,
      nextBillingDate: project.nextBillingDate,
      subscriptions: project.subscriptions,
      invoices: project.invoices.map((invoice) => ({
        id: invoice.id,
        number: invoice.number,
        title: invoice.title,
        amount: Number(invoice.amount),
        status: invoice.status,
        dueDate: invoice.dueDate,
        paidAt: invoice.paidAt,
        createdAt: invoice.createdAt,
      })),
    }))
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscription</h1>
        <p className="text-white/60">
          Manage your maintenance plan and view invoices
        </p>
      </div>

      <BillingDashboard projects={projects} />
    </div>
  );
}

