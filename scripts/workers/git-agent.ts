/**
 * Git Agent Worker
 * Polls for work, creates branches, makes changes, opens PRs
 * 
 * Usage:
 *   npm run worker:git-agent
 * 
 * Loads env from .env.local automatically.
 */

// Load environment FIRST (before anything reads process.env)
import * as dotenv from "dotenv";
import * as pathLib from "path";
dotenv.config({ path: pathLib.resolve(__dirname, "../../.env.local") });

import { Octokit } from "@octokit/rest";
import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Configuration from environment
const NODE_API_KEY = process.env.NODE_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || "10000");
const WORK_DIR = process.env.WORK_DIR || "/tmp/seezee-worker";

if (!NODE_API_KEY) {
  console.error("❌ NODE_API_KEY environment variable is required");
  process.exit(1);
}

if (!GITHUB_TOKEN) {
  console.error("❌ GITHUB_TOKEN environment variable is required");
  process.exit(1);
}

if (!ANTHROPIC_API_KEY) {
  console.warn("⚠️  ANTHROPIC_API_KEY not set - will create placeholder files only");
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;

interface Task {
  request: {
    id: string;
    todoId: string;
    todo: {
      id: string;
      title: string;
      description: string | null;
    };
    repoUrl: string;
    branchName: string;
    priority: string;
  };
  run: {
    id: string;
    startedAt: string;
  };
}

async function sendHeartbeat() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/nodes/heartbeat`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NODE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`❌ Heartbeat failed: ${response.status}`);
      return false;
    }

    const data = await response.json();
    console.log(`💓 Heartbeat sent at ${data.timestamp}`);
    return true;
  } catch (error) {
    console.error("❌ Heartbeat error:", error);
    return false;
  }
}

async function pollForWork(): Promise<Task | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/nodes/poll`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NODE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`❌ Poll failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (!data.available) {
      console.log("⏳ No work available");
      return null;
    }

    console.log(`✅ Claimed task: ${data.request.todo.title}`);
    return data as Task;
  } catch (error) {
    console.error("❌ Poll error:", error);
    return null;
  }
}

async function logToRun(runId: string, level: string, message: string) {
  try {
    await fetch(`${API_BASE_URL}/api/runs/${runId}/log`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NODE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ level, message }),
    });
  } catch (error) {
    console.error("❌ Log error:", error);
  }
}

async function completeRun(
  runId: string,
  status: "DONE" | "FAILED",
  prUrl?: string,
  previewUrl?: string,
  errorMessage?: string
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/runs/${runId}/complete`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NODE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, prUrl, previewUrl, errorMessage }),
    });

    if (!response.ok) {
      console.error(`❌ Complete failed: ${response.status}`);
      return false;
    }

    console.log(`✅ Run completed: ${status}`);
    return true;
  } catch (error) {
    console.error("❌ Complete error:", error);
    return false;
  }
}

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/\.]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

async function generateCodeWithAI(task: string, description: string | null): Promise<{ files: Array<{ path: string; content: string }>; summary: string }> {
  if (!anthropic) {
    // Fallback to placeholder if no AI configured
    return {
      files: [{
        path: `task-${Date.now()}.txt`,
        content: `# Task: ${task}\n\nDescription: ${description || "No description"}\n\nGenerated: ${new Date().toISOString()}\n\n(AI not configured - placeholder file only)`,
      }],
      summary: "Created placeholder file (configure ANTHROPIC_API_KEY for AI code generation)",
    };
  }

  console.log("🤖 Asking Claude to write code...");

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      messages: [{
        role: "user",
        content: `You are a senior software engineer. Generate code changes for this task:

**Task:** ${task}
**Details:** ${description || "No additional details provided"}

Respond with a JSON object in this exact format:
{
  "files": [
    {
      "path": "src/example.ts",
      "content": "// Full file content here"
    }
  ],
  "summary": "Brief description of changes made"
}

Rules:
- Provide COMPLETE, production-ready code
- Include proper TypeScript types
- Add error handling
- Include helpful comments
- Only create/modify files that are absolutely necessary
- Use modern best practices

Respond ONLY with the JSON object, no explanation before or after.`,
      }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    // Parse Claude's response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from Claude response");
    }

    const result = JSON.parse(jsonMatch[0]);
    console.log(`✅ Claude generated ${result.files.length} file(s)`);
    return result;
  } catch (error: any) {
    console.error("❌ AI generation failed:", error.message);
    // Fallback to placeholder
    return {
      files: [{
        path: `task-failed-${Date.now()}.txt`,
        content: `# AI Generation Failed\n\nTask: ${task}\nError: ${error.message}\n\nPlease implement this manually.`,
      }],
      summary: `AI generation failed: ${error.message}`,
    };
  }
}

async function executeTask(task: Task) {
  const { request, run } = task;
  const runId = run.id;

  await logToRun(runId, "info", `Starting task: ${request.todo.title}`);

  try {
    // Parse GitHub URL
    const gitHubInfo = parseGitHubUrl(request.repoUrl);
    if (!gitHubInfo) {
      throw new Error(`Invalid GitHub URL: ${request.repoUrl}`);
    }

    await logToRun(runId, "info", `Repository: ${gitHubInfo.owner}/${gitHubInfo.repo}`);

    // Get default branch
    const { data: repo } = await octokit.repos.get({
      owner: gitHubInfo.owner,
      repo: gitHubInfo.repo,
    });
    const defaultBranch = repo.default_branch;
    await logToRun(runId, "info", `Default branch: ${defaultBranch}`);

    // Get latest commit SHA from default branch
    const { data: refData } = await octokit.git.getRef({
      owner: gitHubInfo.owner,
      repo: gitHubInfo.repo,
      ref: `heads/${defaultBranch}`,
    });
    const latestSha = refData.object.sha;

    // Create new branch
    await octokit.git.createRef({
      owner: gitHubInfo.owner,
      repo: gitHubInfo.repo,
      ref: `refs/heads/${request.branchName}`,
      sha: latestSha,
    });
    await logToRun(runId, "info", `Created branch: ${request.branchName}`);

    // Use AI to generate code (or create placeholder if AI not configured)
    const aiResult = await generateCodeWithAI(request.todo.title, request.todo.description);
    await logToRun(runId, "info", `Generated ${aiResult.files.length} file(s) with AI`);

    // Create/update each file
    for (const file of aiResult.files) {
      await octokit.repos.createOrUpdateFileContents({
        owner: gitHubInfo.owner,
        repo: gitHubInfo.repo,
        path: file.path,
        message: `Task #${request.todoId}: ${request.todo.title} - Update ${file.path}`,
        content: Buffer.from(file.content).toString("base64"),
        branch: request.branchName,
      });
      await logToRun(runId, "info", `Created/updated: ${file.path}`);
    }

    // Open PR
    const { data: pr } = await octokit.pulls.create({
      owner: gitHubInfo.owner,
      repo: gitHubInfo.repo,
      title: `🤖 Task #${request.todoId}: ${request.todo.title}`,
      head: request.branchName,
      base: defaultBranch,
      body: `## Automated Task Execution

**Task ID:** ${request.todoId}  
**Request ID:** ${request.id}  
**Priority:** ${request.priority}

### Description
${request.todo.description || "No description provided"}

### Changes Made
${aiResult.summary}

### Files Modified
${aiResult.files.map(f => `- \`${f.path}\``).join('\n')}

---
*This PR was automatically generated by SeeZee AI Nodes powered by Claude*`,
    });

    await logToRun(runId, "info", `Created PR: ${pr.html_url}`);
    console.log(`✅ PR created: ${pr.html_url}`);

    // Complete the run
    await completeRun(runId, "DONE", pr.html_url);

  } catch (error: any) {
    console.error(`❌ Task failed:`, error);
    await logToRun(runId, "error", error.message);
    await completeRun(runId, "FAILED", undefined, undefined, error.message);
  }
}

async function mainLoop() {
  console.log("🚀 Git Agent Worker started");
  console.log(`📡 Polling ${API_BASE_URL} every ${POLL_INTERVAL_MS}ms`);

  // Send initial heartbeat
  await sendHeartbeat();

  // Main loop
  setInterval(async () => {
    // Send heartbeat
    await sendHeartbeat();

    // Poll for work
    const task = await pollForWork();
    if (task) {
      await executeTask(task);
    }
  }, POLL_INTERVAL_MS);
}

// Start the worker
mainLoop().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
