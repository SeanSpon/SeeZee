import { getCurrentUser } from "@/lib/auth/requireRole";
import { getInvoices, getProjects } from "@/server/actions";
import { ClientsPageClient } from "./ClientsPageClient";

interface ClientRow {
  id: string;
  name: string;
  email: string;
  company: string;
  projects: number;
  invoices: number;
  revenue: number;
  statuses: string[];
}

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const [projectsResult, invoicesResult] = await Promise.all([
    getProjects(),
    getInvoices(),
  ]);

  const projects = projectsResult.success ? projectsResult.projects : [];
  const invoices = invoicesResult.success ? invoicesResult.invoices : [];

  const clientsMap = new Map<string, ClientRow & { rawStatuses: string[] }>();

  projects.forEach((project: any) => {
    const key = project.organizationId ?? project.lead?.id ?? project.id;
    const organization = project.organization ?? {};
    const lead = project.lead ?? {};

    const existing = clientsMap.get(key);
    const baseRow: ClientRow & { rawStatuses: string[] } = existing ?? {
      id: key,
      name: organization.name ?? lead.name ?? project.name ?? "Unnamed Client",
      email:
        organization.email ?? lead.email ?? project.clientEmail ?? "not-provided@see-zee.com",
      company: organization.name ?? lead.company ?? project.clientCompany ?? "N/A",
      projects: 0,
      invoices: 0,
      revenue: 0,
      statuses: [],
      rawStatuses: [],
    };

    baseRow.projects += 1;
    if (project.status) {
      baseRow.rawStatuses.push(String(project.status).toLowerCase());
    }

    clientsMap.set(key, baseRow);
  });

  invoices.forEach((invoice: any) => {
    const key = invoice.organizationId ?? invoice.project?.organizationId ?? invoice.projectId ?? invoice.id;
    const existing = clientsMap.get(key);

    if (!existing) {
      const organization = invoice.organization ?? {};
      const project = invoice.project ?? {};

      clientsMap.set(key, {
        id: key,
        name: organization.name ?? project.name ?? "Unnamed Client",
        email: organization.email ?? project.clientEmail ?? "not-provided@see-zee.com",
        company: organization.name ?? project.clientCompany ?? "N/A",
        projects: project ? 1 : 0,
        invoices: 1,
        revenue: Number(invoice.status === "PAID" ? invoice.total ?? 0 : 0),
        statuses: invoice.status ? [String(invoice.status).toLowerCase()] : [],
        rawStatuses: invoice.status ? [String(invoice.status).toLowerCase()] : [],
      });
    } else {
      existing.invoices += 1;
      if (invoice.status === "PAID") {
        existing.revenue += Number(invoice.total ?? 0);
      }
      if (invoice.status) {
        existing.rawStatuses.push(String(invoice.status).toLowerCase());
      }
      clientsMap.set(key, existing);
    }
  });

  const rows = Array.from(clientsMap.values()).map(({ rawStatuses, ...row }) => ({
    ...row,
    statuses: rawStatuses,
  }));

  const totalRevenue = rows.reduce((sum, client) => sum + client.revenue, 0);
  const activeClients = rows.filter((client) => client.projects > 0).length;

  return (
    <ClientsPageClient
      user={user}
      initialData={{ rows, totalRevenue, activeClients }}
    />
  );
}
