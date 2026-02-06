import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const ADMIN_ROLES = ["ADMIN", "CEO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH", "DESIGNER", "DEV"];

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function forbiddenResponse() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user) return null;
  if (!ADMIN_ROLES.includes(session.user.role || "")) return null;
  return session;
}

// GET - Retrieve stored API keys (masked) and connected bots
export async function GET(req: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session) return unauthorizedResponse();

    // Return integration configuration status
    // API keys are stored in environment variables - we just show connection status
    const integrations = {
      claude: {
        name: "Claude (Anthropic)",
        connected: !!process.env.ANTHROPIC_API_KEY,
        keyPreview: process.env.ANTHROPIC_API_KEY
          ? `sk-ant-...${process.env.ANTHROPIC_API_KEY.slice(-4)}`
          : null,
      },
      github: {
        name: "GitHub",
        connected: !!process.env.GITHUB_TOKEN,
        keyPreview: process.env.GITHUB_TOKEN
          ? `ghp_...${process.env.GITHUB_TOKEN.slice(-4)}`
          : null,
      },
      vercel: {
        name: "Vercel",
        connected: !!process.env.VERCEL_TOKEN,
        keyPreview: process.env.VERCEL_TOKEN
          ? `...${process.env.VERCEL_TOKEN.slice(-4)}`
          : null,
      },
      openai: {
        name: "OpenAI",
        connected: !!process.env.OPENAI_API_KEY,
        keyPreview: process.env.OPENAI_API_KEY
          ? `sk-...${process.env.OPENAI_API_KEY.slice(-4)}`
          : null,
      },
    };

    return NextResponse.json({ integrations });
  } catch (error) {
    console.error("[AI Manager] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Send message to Claude or manage bot tasks
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session) return unauthorizedResponse();

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "chat": {
        const { message, apiKey } = body;
        if (!message) {
          return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // Use provided API key or fall back to environment variable
        const claudeKey = apiKey || process.env.ANTHROPIC_API_KEY;
        if (!claudeKey) {
          return NextResponse.json(
            { error: "No Claude API key configured. Add one in the API Keys section." },
            { status: 400 }
          );
        }

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": claudeKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4096,
            messages: [{ role: "user", content: message }],
            system:
              "You are Clawd, an AI coding assistant for SeeZee Studios. You help manage development tasks, review code, coordinate deployments, and assist with project management. You are connected to the SeeZee admin dashboard and can help with VS Code/Cursor workflows, Git operations, and Vercel deployments.",
          }),
        });

        if (!response.ok) {
          const err = await response.text();
          console.error("[AI Manager] Claude API error:", err);
          return NextResponse.json(
            { error: "Failed to get response from Claude. Check your API key." },
            { status: response.status }
          );
        }

        const data = await response.json();
        const reply = data.content?.[0]?.text || "No response received.";

        return NextResponse.json({ reply, model: data.model, usage: data.usage });
      }

      case "validate-key": {
        const { provider, apiKey } = body;
        if (!apiKey || !provider) {
          return NextResponse.json({ error: "Provider and API key are required" }, { status: 400 });
        }

        // Simple validation by checking key format
        let valid = false;
        let message = "Invalid key format";

        switch (provider) {
          case "claude":
            valid = apiKey.startsWith("sk-ant-");
            message = valid ? "Valid Anthropic key format" : "Key should start with sk-ant-";
            break;
          case "github":
            valid = apiKey.startsWith("ghp_") || apiKey.startsWith("github_pat_");
            message = valid ? "Valid GitHub token format" : "Key should start with ghp_ or github_pat_";
            break;
          case "vercel":
            valid = apiKey.length > 20;
            message = valid ? "Token format looks valid" : "Token seems too short";
            break;
          case "openai":
            valid = apiKey.startsWith("sk-");
            message = valid ? "Valid OpenAI key format" : "Key should start with sk-";
            break;
          default:
            message = "Unknown provider";
        }

        return NextResponse.json({ valid, message });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[AI Manager] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
