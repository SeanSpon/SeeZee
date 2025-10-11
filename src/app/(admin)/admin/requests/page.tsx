import ProjectTable from "./components/ProjectTable";

export const dynamic = "force-dynamic";

async function getProjects() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/projects`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch projects');
    }
    
    const data = await res.json();
    return data.projects || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export default async function ProjectRequestsPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white mb-2">project requests</h1>
        <p className="text-white/60 text-sm">view and manage all project requests from the website.</p>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center gap-6 text-sm">
          <div className="text-white/50">
            Total Requests: <span className="text-white font-medium">{projects.length}</span>
          </div>
          <div className="text-white/50">
            Pending: <span className="text-yellow-300 font-medium">
              {projects.filter((p: any) => p.status === 'pending').length}
            </span>
          </div>
          <div className="text-white/50">
            In Progress: <span className="text-blue-300 font-medium">
              {projects.filter((p: any) => p.status === 'in progress').length}
            </span>
          </div>
          <div className="text-white/50">
            Delivered: <span className="text-green-300 font-medium">
              {projects.filter((p: any) => p.status === 'delivered').length}
            </span>
          </div>
        </div>
      </div>

      <ProjectTable data={projects} />
    </div>
  );
}