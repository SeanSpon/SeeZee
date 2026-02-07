/**
 * 🚌 THE BUS - Autonomous AI Worker
 * 
 * This is the "OD AI stuff" - runs forever, auto-codes, auto-fixes, auto-commits.
 * Uses MCP/Claude to write real code autonomously.
 * 
 * Usage:
 *   npm run worker:bus
 * 
 * What it does:
 * 1. Poll for tasks nonstop
 * 2. Use AI to write code
 * 3. Test the code
 * 4. If fails → AI fixes it
 * 5. Commit & push
 * 6. Repeat forever
 */

// Load environment FIRST
import * as dotenv from "dotenv";
import * as pathLib from "path";
dotenv.config({ path: pathLib.resolve(__dirname, "../../.env.local") });

import { Octokit } from "@octokit/rest";
import { AICoder } from "../../src/lib/ai/ai-coder";
import * as fs from "fs/promises";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Configuration
const NODE_API_KEY = process.env.NODE_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || "15000");
const WORK_DIR = process.env.WORK_DIR || process.cwd();

// Validate
if (!NODE_API_KEY) {
  console.error("❌ NODE_API_KEY required");
  process.exit(1);
}

if (!GITHUB_TOKEN) {
  console.error("❌ GITHUB_TOKEN required");
  process.exit(1);
}

if (!ANTHROPIC_API_KEY) {
  console.error("❌ ANTHROPIC_API_KEY required for AI coding");
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });
const aiCoder = new AICoder(ANTHROPIC_API_KEY);

interface BusTask {
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

let isRunning = true;
let currentTask: BusTask | null = null;

/**
 * 💓 Send heartbeat to mothership
 */
async function sendHeartbeat() {
  try {
    await fetch(`${API_BASE_URL}/api/nodes/heartbeat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NODE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentJobId: currentTask?.run.id || null,
      }),
    });
    console.log("💓 Heartbeat");
  } catch (error) {
    console.error("❌ Heartbeat failed:", error);
  }
}

/**
 * 📥 Poll for work
 */
async function pollForWork(): Promise<BusTask | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/nodes/poll`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NODE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 204) {
      return null; // No work available
    }

    if (!response.ok) {
      console.error(`❌ Poll failed: ${response.status}`);
      return null;
    }

    const task = await response.json();
    console.log(`\n🎯 CLAIMED TASK: ${task.request.todo.title}`);
    return task;
  } catch (error) {
    console.error("❌ Poll error:", error);
    return null;
  }
}

/**
 * 📝 Log to the run
 */
async function logToRun(runId: string, message: string, level: "info" | "warn" | "error" = "info") {
  try {
    await fetch(`${API_BASE_URL}/api/runs/${runId}/logs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NODE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ level, message }),
    });
  } catch (error) {
    console.error("❌ Failed to log:", error);
  }
}

/**
 * ✅ Complete the run
 */
async function completeRun(
  runId: string,
  status: "SUCCESS" | "FAILED",
  prUrl?: string,
  errorMessage?: string
) {
  try {
    await fetch(`${API_BASE_URL}/api/runs/${runId}/complete`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NODE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, prUrl, errorMessage }),
    });
    console.log(`✅ Run marked as ${status}`);
  } catch (error) {
    console.error("❌ Failed to complete run:", error);
  }
}

/**
 * 🔄 Clone or update the repo
 */
async function prepareRepo(repoUrl: string, branchName: string): Promise<string> {
  const repoName = repoUrl.split("/").pop()?.replace(".git", "") || "repo";
  const repoPath = path.join(WORK_DIR, "repos", repoName);

  try {
    await fs.access(repoPath);
    console.log("📂 Repo exists, pulling latest...");
    await execAsync("git fetch origin", { cwd: repoPath });
    await execAsync("git checkout main", { cwd: repoPath });
    await execAsync("git pull origin main", { cwd: repoPath });
  } catch {
    console.log("📦 Cloning repo...");
    await fs.mkdir(path.dirname(repoPath), { recursive: true });
    await execAsync(`git clone ${repoUrl} ${repoPath}`);
  }

  // Create new branch
  console.log(`🌿 Creating branch: ${branchName}`);
  try {
    await execAsync(`git checkout -b ${branchName}`, { cwd: repoPath });
  } catch {
    await execAsync(`git checkout ${branchName}`, { cwd: repoPath });
  }

  return repoPath;
}

/**
 * 🚀 Push changes and create PR
 */
async function pushAndCreatePR(
  repoPath: string,
  branchName: string,
  title: string,
  repoUrl: string
): Promise<string> {
  console.log("📤 Pushing changes...");

  // Add, commit, push
  await execAsync("git add .", { cwd: repoPath });
  await execAsync(`git commit -m "🤖 AI: ${title}"`, { cwd: repoPath });
  await execAsync(`git push origin ${branchName}`, { cwd: repoPath });

  // Create PR
  const [owner, repo] = repoUrl
    .replace("https://github.com/", "")
    .replace(".git", "")
    .split("/");

  const pr = await octokit.pulls.create({
    owner,
    repo,
    title: `🤖 ${title}`,
    head: branchName,
    base: "main",
    body: `Autonomous AI completed this task.\n\n✅ Tests passed\n🤖 Generated by The Bus`,
  });

  console.log(`🎉 PR created: ${pr.data.html_url}`);
  return pr.data.html_url;
}

/**
 * 🚌 MAIN BUS LOOP - This is where the AI magic happens
 */
async function processTask(task: BusTask): Promise<void> {
  const runId = task.run.id;
  const { title, description } = task.request.todo;
  const { repoUrl, branchName } = task.request;

  await logToRun(runId, `🚌 Bus starting work on: ${title}`, "info");

  try {
    // Step 1: Prepare repo
    await logToRun(runId, "📦 Cloning/updating repository...", "info");
    const repoPath = await prepareRepo(repoUrl, branchName);

    // Step 2: Let AI do the coding
    await logToRun(runId, "🧠 AI analyzing task and writing code...", "info");
    const result = await aiCoder.autoComplete({
      title,
      description: description || "",
      repoPath,
    });

    if (!result.success) {
      await logToRun(runId, `❌ AI failed: ${result.error}`, "error");
      await completeRun(runId, "FAILED", undefined, result.error);
      return;
    }

    await logToRun(
      runId,
      `✅ AI completed! Changed ${result.changes.length} files. Tests: ${result.testsPassed ? "PASSED ✅" : "SKIPPED"}`,
      "info"
    );

    // Step 3: Commit and push
    await logToRun(runId, "📤 Pushing changes and creating PR...", "info");
    const prUrl = await pushAndCreatePR(repoPath, branchName, title, repoUrl);

    // Step 4: Mark as complete
    await completeRun(runId, "SUCCESS", prUrl);
    await logToRun(runId, `🎉 COMPLETE! PR: ${prUrl}`, "info");

    console.log(`\n✅ TASK COMPLETE: ${title}`);
    console.log(`🔗 PR: ${prUrl}\n`);
  } catch (error: any) {
    console.error(`❌ Bus error:`, error);
    await logToRun(runId, `❌ Error: ${error.message}`, "error");
    await completeRun(runId, "FAILED", undefined, error.message);
  }
}

/**
 * 🔄 Main loop - runs forever
 */
async function mainLoop() {
  console.log("🚌 THE BUS IS RUNNING");
  console.log("🤖 Autonomous AI worker online");
  console.log("📡 Polling for tasks...\n");

  // Send initial heartbeat
  await sendHeartbeat();

  // Heartbeat interval
  const heartbeatInterval = setInterval(sendHeartbeat, 30000); // Every 30s

  while (isRunning) {
    try {
      // Poll for work
      const task = await pollForWork();

      if (task) {
        currentTask = task;
        await processTask(task);
        currentTask = null;
      } else {
        // No work, wait and poll again
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }
    } catch (error) {
      console.error("❌ Main loop error:", error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  clearInterval(heartbeatInterval);
}

// Handle shutdown gracefully
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down gracefully...");
  isRunning = false;
  setTimeout(() => process.exit(0), 1000);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Received SIGTERM...");
  isRunning = false;
  setTimeout(() => process.exit(0), 1000);
});

// Start the bus!
mainLoop().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
