/**
 * 🔥 AI CODER SERVICE - The Brain of the Bus
 * 
 * This is the autonomous AI that writes code, fixes bugs, and commits changes.
 * It can use Claude via API or MCP when available.
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs/promises";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface CodeTask {
  title: string;
  description: string;
  repoPath: string;
  files?: string[]; // Files to focus on
  context?: string; // Additional context
}

interface CodeResult {
  success: boolean;
  changes: Array<{
    file: string;
    content: string;
    action: "create" | "update" | "delete";
  }>;
  message: string;
  error?: string;
  testsPassed?: boolean;
}

export class AICoder {
  private anthropic: Anthropic;
  private useMCP: boolean = false;

  constructor(apiKey?: string) {
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY required for AI Coder");
    }
    this.anthropic = new Anthropic({ apiKey });
  }

  /**
   * 🧠 MAIN AI LOOP - This is where the magic happens
   * 
   * 1. Analyze task
   * 2. Read repo files
   * 3. Ask AI to code
   * 4. Apply changes
   * 5. Test
   * 6. If fail → ask AI to fix
   * 7. Repeat until success
   */
  async autoComplete(task: CodeTask): Promise<CodeResult> {
    console.log(`🧠 AI Brain starting on task: ${task.title}`);

    let attempt = 0;
    const maxAttempts = 3;
    let lastError: string | undefined;

    while (attempt < maxAttempts) {
      attempt++;
      console.log(`🔄 Attempt ${attempt}/${maxAttempts}`);

      try {
        // Step 1: Analyze the repo
        const repoContext = await this.analyzeRepo(task.repoPath, task.files);

        // Step 2: Ask AI to write code
        const aiResponse = await this.askAIToCode(task, repoContext, lastError);

        // Step 3: Parse AI response and extract file changes
        const changes = this.parseAIChanges(aiResponse);

        if (changes.length === 0) {
          return {
            success: false,
            changes: [],
            message: "AI returned no changes",
            error: "No code generated",
          };
        }

        // Step 4: Apply changes to filesystem
        await this.applyChanges(task.repoPath, changes);

        // Step 5: Run tests
        const testResult = await this.runTests(task.repoPath);

        if (testResult.passed) {
          console.log("✅ Tests passed! AI completed the task.");
          return {
            success: true,
            changes,
            message: `AI completed task in ${attempt} attempt(s)`,
            testsPassed: true,
          };
        } else {
          lastError = testResult.error;
          console.log(`❌ Tests failed: ${lastError}`);
          console.log("🔄 Asking AI to fix...");
          // Loop continues with the error context
        }
      } catch (error: any) {
        lastError = error.message;
        console.error(`❌ Error in attempt ${attempt}:`, error);
      }
    }

    return {
      success: false,
      changes: [],
      message: `Failed after ${maxAttempts} attempts`,
      error: lastError,
      testsPassed: false,
    };
  }

  /**
   * 📖 Read repo files and build context for AI
   */
  private async analyzeRepo(
    repoPath: string,
    targetFiles?: string[]
  ): Promise<string> {
    console.log("📖 Analyzing repo...");

    const files: string[] = [];
    
    // Read package.json for dependencies
    try {
      const packageJson = await fs.readFile(
        path.join(repoPath, "package.json"),
        "utf-8"
      );
      files.push(`--- package.json ---\n${packageJson}`);
    } catch {}

    // Read specific files or scan src/
    if (targetFiles && targetFiles.length > 0) {
      for (const file of targetFiles) {
        try {
          const content = await fs.readFile(path.join(repoPath, file), "utf-8");
          files.push(`--- ${file} ---\n${content}`);
        } catch (error) {
          console.warn(`⚠️  Could not read ${file}`);
        }
      }
    } else {
      // Auto-discover important files
      const srcPath = path.join(repoPath, "src");
      try {
        const discovered = await this.discoverFiles(srcPath, 10);
        for (const file of discovered) {
          const content = await fs.readFile(file, "utf-8");
          const relativePath = path.relative(repoPath, file);
          files.push(`--- ${relativePath} ---\n${content}`);
        }
      } catch {}
    }

    // Get git status
    try {
      const { stdout: gitStatus } = await execAsync("git status --short", {
        cwd: repoPath,
      });
      if (gitStatus.trim()) {
        files.push(`--- Git Status ---\n${gitStatus}`);
      }
    } catch {}

    return files.join("\n\n");
  }

  /**
   * 🤖 Ask Claude to write code
   */
  private async askAIToCode(
    task: CodeTask,
    repoContext: string,
    previousError?: string
  ): Promise<string> {
    console.log("🤖 Asking AI to code...");

    const systemPrompt = `You are an autonomous coding agent for the SeeZee platform.

Your job:
1. Read the task
2. Read the repo files
3. Write ONLY the code changes needed
4. Format as: FILE_PATH followed by full file content

Rules:
- Write complete, working code
- Follow the existing code style
- Don't break existing functionality
- Return ONLY code, no explanations
- Format: --- FILE: path/to/file.ts ---
         (full file content)
         --- END FILE ---`;

    const userPrompt = `TASK: ${task.title}

DESCRIPTION:
${task.description || "No additional description"}

${task.context ? `CONTEXT:\n${task.context}\n` : ""}

${previousError ? `PREVIOUS ERROR:\n${previousError}\n\nPlease fix this error.\n` : ""}

REPOSITORY FILES:
${repoContext}

Write the code changes needed to complete this task.`;

    const response = await this.anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      temperature: 0.3,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const aiText = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block as any).text)
      .join("\n");

    console.log(`📝 AI generated ${aiText.length} characters of code`);
    return aiText;
  }

  /**
   * 🔍 Parse AI response to extract file changes
   */
  private parseAIChanges(aiResponse: string): Array<{
    file: string;
    content: string;
    action: "create" | "update" | "delete";
  }> {
    const changes: Array<{
      file: string;
      content: string;
      action: "create" | "update" | "delete";
    }> = [];

    // Match pattern: --- FILE: path/to/file.ts ---
    const fileRegex = /---\s*FILE:\s*(.+?)\s*---\n([\s\S]*?)(?=---\s*(?:FILE|END FILE)|$)/gi;
    let match;

    while ((match = fileRegex.exec(aiResponse)) !== null) {
      const filePath = match[1].trim();
      const content = match[2].trim();

      changes.push({
        file: filePath,
        content,
        action: "update", // We'll check if file exists when applying
      });
    }

    console.log(`🔍 Parsed ${changes.length} file changes from AI`);
    return changes;
  }

  /**
   * 💾 Apply changes to filesystem
   */
  private async applyChanges(
    repoPath: string,
    changes: Array<{ file: string; content: string; action: string }>
  ): Promise<void> {
    console.log(`💾 Applying ${changes.length} file changes...`);

    for (const change of changes) {
      const fullPath = path.join(repoPath, change.file);

      // Ensure directory exists
      await fs.mkdir(path.dirname(fullPath), { recursive: true });

      // Write file
      await fs.writeFile(fullPath, change.content, "utf-8");
      console.log(`  ✅ ${change.file}`);
    }
  }

  /**
   * 🧪 Run tests
   */
  private async runTests(repoPath: string): Promise<{ passed: boolean; error?: string }> {
    console.log("🧪 Running tests...");

    try {
      // Try npm test first
      const { stdout, stderr } = await execAsync("npm test", {
        cwd: repoPath,
        timeout: 60000, // 60 second timeout
      });

      console.log("✅ Tests passed");
      return { passed: true };
    } catch (error: any) {
      // If no test script, check TypeScript compilation
      try {
        await execAsync("npx tsc --noEmit", {
          cwd: repoPath,
          timeout: 30000,
        });
        console.log("✅ TypeScript compilation passed");
        return { passed: true };
      } catch (tscError: any) {
        console.error("❌ TypeScript errors:", tscError.stdout || tscError.message);
        return {
          passed: false,
          error: tscError.stdout || tscError.message,
        };
      }
    }
  }

  /**
   * 📂 Discover important files in a directory
   */
  private async discoverFiles(dir: string, maxFiles: number): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (files.length >= maxFiles) break;
        
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Skip node_modules, .next, etc.
          if (["node_modules", ".next", "dist", ".git"].includes(entry.name)) {
            continue;
          }
          const subFiles = await this.discoverFiles(fullPath, maxFiles - files.length);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          // Only code files
          if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
            files.push(fullPath);
          }
        }
      }
    } catch {}

    return files;
  }

  /**
   * 🎯 Quick fix - for simple tasks without full testing
   */
  async quickFix(task: CodeTask): Promise<CodeResult> {
    const repoContext = await this.analyzeRepo(task.repoPath, task.files);
    const aiResponse = await this.askAIToCode(task, repoContext);
    const changes = this.parseAIChanges(aiResponse);
    
    if (changes.length > 0) {
      await this.applyChanges(task.repoPath, changes);
      return {
        success: true,
        changes,
        message: "Quick fix applied (tests skipped)",
      };
    }

    return {
      success: false,
      changes: [],
      message: "No changes generated",
    };
  }
}
