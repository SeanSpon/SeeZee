/**
 * Centralized cache tags for revalidation
 */

export const tags = {
  dashboard: ["kpi", "activity", "tasks", "projects", "leads"],
  activity: ["activity"],
  leads: ["leads"],
  tasks: ["tasks"],
  maintenance: ["maintenance"],
  training: ["learning", "training"],
  tools: ["learning", "tools"],
  links: ["links"],
  database: ["database"],
  team: ["team"],
} as const;
