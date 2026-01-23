import { getCurrentUser } from "@/lib/auth/requireRole";
import { getOrganizations, getInvoices, getProjects } from "@/server/actions";
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

  const [orgsResult, projectsResult, invoicesResult] = await Promise.all([
    getOrganizations(),
    getProjects(),
    getInvoices(),
  ]);

  const organizations = orgsResult.success ? orgsResult.organizations : [];
  const projects = projectsResult.success ? projectsResult.projects : [];
  const invoices = invoicesResult.success ? invoicesResult.invoices : [];

  const clientsMap = new Map<string, ClientRow & { rawStatuses: string[] }>();

  // Add all organizations (even if they have no projects/invoices yet)
  // Only include organizations that have a valid email address
  organizations.forEach((org: any) => {
    // Skip organizations without email or with placeholder email
    if (!org.email || org.email === "not-provided@seezeestudios.com") {
      return;
    }

    const projectCount = org.projects?.length ?? 0;
    const invoiceCount = org.invoices?.length ?? 0;
    // Invoice totals are stored in dollars
    const revenue = (org.invoices?.reduce((sum: number, inv: any) => {
      return inv.status === "PAID" ? sum + Number(inv.total ?? 0) : sum;
    }, 0) ?? 0);

    clientsMap.set(org.id, {
      id: org.id,
      name: org.name,
      email: org.email,
      company: org.name,
      projects: projectCount,
      invoices: invoiceCount,
      revenue: revenue,
      statuses: org.invoices?.map((inv: any) => String(inv.status).toLowerCase()) ?? [],
      rawStatuses: org.invoices?.map((inv: any) => String(inv.status).toLowerCase()) ?? [],
    });
  });

  projects.forEach((project: any) => {
    const key = project.organizationId ?? project.lead?.id ?? project.id;
    const existing = clientsMap.get(key);

    if (existing) {
      // Update existing organization's project count and status
      existing.projects += 1;
      if (project.status) {
        existing.rawStatuses.push(String(project.status).toLowerCase());
      }
      clientsMap.set(key, existing);
    } else {
      // This is a project without a linked organization - skip if no valid email
      const organization = project.organization ?? {};
      const lead = project.lead ?? {};
      const email = organization.email ?? lead.email ?? project.clientEmail;

      // Skip if no valid email
      if (!email || email === "not-provided@seezeestudios.com") {
        return;
      }

      clientsMap.set(key, {
        id: key,
        name: organization.name ?? lead.name ?? project.name ?? "Unnamed Client",
        email: email,
        company: organization.name ?? lead.company ?? project.clientCompany ?? "N/A",
        projects: 1,
        invoices: 0,
        revenue: 0,
        statuses: project.status ? [String(project.status).toLowerCase()] : [],
        rawStatuses: project.status ? [String(project.status).toLowerCase()] : [],
      });
    }
  });

  invoices.forEach((invoice: any) => {
    const key = invoice.organizationId ?? invoice.project?.organizationId ?? invoice.projectId ?? invoice.id;
    const existing = clientsMap.get(key);

    if (existing) {
      // Update existing client
      existing.invoices += 1;
      if (invoice.status === "PAID") {
        // Invoice totals are stored in dollars
        existing.revenue += Number(invoice.total ?? 0);
      }
      if (invoice.status) {
        existing.rawStatuses.push(String(invoice.status).toLowerCase());
      }
      clientsMap.set(key, existing);
    } else {
      // This is an invoice without a linked organization or project
      const organization = invoice.organization ?? {};
      const project = invoice.project ?? {};
      const email = organization.email ?? project.clientEmail;

      // Skip if no valid email
      if (!email || email === "not-provided@seezeestudios.com") {
        return;
      }

      clientsMap.set(key, {
        id: key,
        name: organization.name ?? project.name ?? "Unnamed Client",
        email: email,
        company: organization.name ?? project.clientCompany ?? "N/A",
        projects: project ? 1 : 0,
        invoices: 1,
        // Invoice totals are stored in dollars
        revenue: Number(invoice.status === "PAID" ? invoice.total ?? 0 : 0),
        statuses: invoice.status ? [String(invoice.status).toLowerCase()] : [],
        rawStatuses: invoice.status ? [String(invoice.status).toLowerCase()] : [],
      });
    }
  });

  const rows = Array.from(clientsMap.values()).map(({ rawStatuses, ...row }) => ({
    ...row,
    statuses: [...new Set(rawStatuses)], // Remove duplicate statuses
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
