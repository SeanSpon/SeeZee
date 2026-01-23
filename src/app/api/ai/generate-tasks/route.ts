import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const ADMIN_ROLES = ["CEO", "CFO", "ADMIN", "STAFF", "DEV", "FRONTEND", "BACKEND", "DESIGNER"];

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TaskSuggestion {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  estimatedHours: number;
  dependencies?: string[];
}

/**
 * POST /api/ai/generate-tasks
 * Generate tasks using AI based on project/milestone context
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ADMIN_ROLES.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Admin role required" }, { status: 403 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: "AI not configured",
        fallback: true,
        tasks: getDefaultTasks("general"),
      });
    }

    const body = await req.json();
    const { 
      projectId, 
      milestoneId, 
      context, 
      taskType = "milestone",
      numberOfTasks = 5,
    } = body;

    // Gather context
    let projectContext = "";
    let milestoneContext = "";
    let existingTasks: string[] = [];

    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          lead: true,
          milestones: {
            orderBy: { dueDate: "asc" },
          },
          todos: {
            select: { title: true },
          },
        },
      });

      if (project) {
        projectContext = `
Project: ${project.name}
Description: ${project.description || "No description"}
Status: ${project.status}
Service Type: ${project.lead?.serviceType || "Web Development"}
Budget: ${project.budget ? `$${project.budget}` : "Not set"}
Timeline: ${project.startDate ? `${new Date(project.startDate).toLocaleDateString()} - ${project.endDate ? new Date(project.endDate).toLocaleDateString() : "Ongoing"}` : "Not set"}
Current Progress: ${project.progress || 0}%
Milestones: ${project.milestones.map(m => `${m.title} (${m.completed ? "Done" : "Pending"})`).join(", ")}
`;
        existingTasks = project.todos.map(t => t.title);
      }
    }

    if (milestoneId) {
      const milestone = await prisma.projectMilestone.findUnique({
        where: { id: milestoneId },
        include: {
          project: true,
        },
      });

      if (milestone) {
        milestoneContext = `
Current Milestone: ${milestone.title}
Milestone Description: ${milestone.description || "No description"}
Due Date: ${milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString() : "Not set"}
Status: ${milestone.completed ? "Completed" : "In Progress"}
`;
        // Get tasks for this milestone (milestoneId field may not exist yet)
        try {
          const milestoneTasks = await prisma.todo.findMany({
            where: { 
              projectId: milestone.projectId,
              // Will work once migration runs
            },
            select: { title: true },
          });
          existingTasks = [...existingTasks, ...milestoneTasks.map(t => t.title)];
        } catch (e) {
          // Field doesn't exist yet, skip
        }
      }
    }

    const existingTasksContext = existingTasks.length > 0 
      ? `\nExisting tasks (don't duplicate): ${existingTasks.join(", ")}`
      : "";

    // Build the prompt
    const systemPrompt = `You are a project management AI assistant for a web development agency. 
You help generate actionable tasks for projects and milestones.
Your tasks should be specific, measurable, and achievable.
Focus on practical development tasks that a developer or designer can execute.
Consider dependencies between tasks when relevant.`;

    const userPrompt = `Generate ${numberOfTasks} specific tasks for the following ${taskType}:

${projectContext}
${milestoneContext}
${existingTasksContext}

${context ? `Additional context: ${context}` : ""}

Return ONLY a valid JSON array with this structure (no markdown, no code blocks):
[
  {
    "title": "Task title (clear, actionable)",
    "description": "Detailed description of what needs to be done",
    "priority": "LOW" | "MEDIUM" | "HIGH",
    "estimatedHours": number (realistic estimate),
    "dependencies": ["titles of tasks this depends on"] (optional)
  }
]`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = completion.choices[0]?.message?.content || "[]";
      
      // Parse JSON from response (handle markdown code blocks)
      let jsonContent = content.trim();
      if (jsonContent.startsWith("```")) {
        jsonContent = jsonContent.replace(/```json?\n?/g, "").replace(/```/g, "");
      }
      
      const tasks: TaskSuggestion[] = JSON.parse(jsonContent);

      return NextResponse.json({
        success: true,
        tasks,
        tokensUsed: completion.usage?.total_tokens,
      });
    } catch (aiError: any) {
      console.error("AI generation error:", aiError);
      
      // Return fallback tasks
      return NextResponse.json({
        success: true,
        fallback: true,
        tasks: getDefaultTasks(taskType, milestoneContext),
        error: "AI generation failed, using templates",
      });
    }
  } catch (error) {
    console.error("[POST /api/ai/generate-tasks]", error);
    return NextResponse.json(
      { error: "Failed to generate tasks" },
      { status: 500 }
    );
  }
}

// Fallback task templates when AI isn't available
function getDefaultTasks(taskType: string, milestoneHint?: string): TaskSuggestion[] {
  const hint = milestoneHint?.toLowerCase() || "";
  
  if (hint.includes("design")) {
    return [
      { title: "Create wireframes", description: "Design low-fidelity wireframes for key pages", priority: "HIGH", estimatedHours: 4 },
      { title: "Design UI mockups", description: "Create high-fidelity mockups in Figma", priority: "HIGH", estimatedHours: 8 },
      { title: "Design system setup", description: "Define colors, typography, and components", priority: "MEDIUM", estimatedHours: 3 },
      { title: "Mobile responsive designs", description: "Create mobile versions of key screens", priority: "MEDIUM", estimatedHours: 4 },
      { title: "Design review meeting", description: "Present designs to client for feedback", priority: "HIGH", estimatedHours: 1 },
    ];
  }
  
  if (hint.includes("develop") || hint.includes("build")) {
    return [
      { title: "Set up project repository", description: "Initialize Git repo, configure CI/CD", priority: "HIGH", estimatedHours: 2 },
      { title: "Create component library", description: "Build reusable UI components", priority: "HIGH", estimatedHours: 6 },
      { title: "Implement routing", description: "Set up page routing and navigation", priority: "MEDIUM", estimatedHours: 3 },
      { title: "API integration", description: "Connect frontend to backend APIs", priority: "HIGH", estimatedHours: 8 },
      { title: "Code review", description: "Review code quality and refactor as needed", priority: "MEDIUM", estimatedHours: 2 },
    ];
  }
  
  if (hint.includes("test") || hint.includes("qa")) {
    return [
      { title: "Write unit tests", description: "Create tests for critical components", priority: "HIGH", estimatedHours: 4 },
      { title: "Cross-browser testing", description: "Test on Chrome, Firefox, Safari, Edge", priority: "HIGH", estimatedHours: 3 },
      { title: "Mobile testing", description: "Test on iOS and Android devices", priority: "HIGH", estimatedHours: 3 },
      { title: "Performance audit", description: "Run Lighthouse and optimize", priority: "MEDIUM", estimatedHours: 2 },
      { title: "Accessibility check", description: "Verify WCAG compliance", priority: "MEDIUM", estimatedHours: 2 },
    ];
  }
  
  if (hint.includes("launch") || hint.includes("deploy")) {
    return [
      { title: "Configure production environment", description: "Set up hosting, DNS, SSL", priority: "HIGH", estimatedHours: 2 },
      { title: "Final QA check", description: "Complete end-to-end testing", priority: "HIGH", estimatedHours: 2 },
      { title: "Deploy to production", description: "Push code to live server", priority: "HIGH", estimatedHours: 1 },
      { title: "Post-launch monitoring", description: "Monitor for errors and performance", priority: "HIGH", estimatedHours: 2 },
      { title: "Client handoff", description: "Training and documentation", priority: "MEDIUM", estimatedHours: 2 },
    ];
  }
  
  // General tasks
  return [
    { title: "Review requirements", description: "Analyze and document project requirements", priority: "HIGH", estimatedHours: 2 },
    { title: "Create project plan", description: "Break down work into manageable tasks", priority: "HIGH", estimatedHours: 2 },
    { title: "Set up development environment", description: "Configure tools and dependencies", priority: "MEDIUM", estimatedHours: 2 },
    { title: "Implement core features", description: "Build main functionality", priority: "HIGH", estimatedHours: 8 },
    { title: "Review and iterate", description: "Get feedback and make improvements", priority: "MEDIUM", estimatedHours: 3 },
  ];
}
