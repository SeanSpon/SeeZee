# 🤖 AI Integration Guide for SeeZee

This guide shows how to integrate SeeZee with Claude/MCP and GitHub Copilot.

## 🔗 Model Context Protocol (MCP) Integration

### What is MCP?
MCP (Model Context Protocol) lets AI assistants like **Claude Desktop** and **Cline** directly access SeeZee data and trigger actions.

### Setup Steps:

#### 1. Install MCP SDK
```powershell
npm install @modelcontextprotocol/sdk
```

#### 2. Build the MCP server
```powershell
npx tsc mcp-server.ts --outDir . --module nodenext --target es2022
```

#### 3. Configure Claude Desktop

Add to `%APPDATA%\Claude\claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "seezee": {
      "command": "node",
      "args": ["C:\\Users\\Sean\\Desktop\\steezee\\mcp-server.js"],
      "env": {
        "DATABASE_URL": "postgresql://user:pass@localhost:5432/seezee"
      }
    }
  }
}
```

#### 4. Restart Claude Desktop
Now Claude can:
- Query your projects, leads, and analytics
- Create workflow nodes
- Access real-time SeeZee data

### Available MCP Tools:
- `list_projects` - Get all projects with filters
- `list_leads` - Fetch marketing leads
- `create_workflow_node` - Spawn new worker nodes
- `query_analytics` - Revenue, conversion, and project stats

---

## 🐙 GitHub Copilot Integration

### Option 1: VSCode Extension API
Create tasks directly from GitHub Copilot chat:

```powershell
# Install @octokit/rest (already in package.json)
npm install @octokit/rest
```

Your app already has GitHub service at [src/lib/git/github-service.ts](src/lib/git/github-service.ts)!

### Option 2: API Endpoint for Copilot Tasks

Create an API route that Copilot can call:

**Create:** `src/app/api/integrations/copilot/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { action, data, apiKey } = await req.json();

  // Verify API key
  if (apiKey !== process.env.COPILOT_INTEGRATION_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  switch (action) {
    case "create_task":
      const task = await prisma.task.create({
        data: {
          title: data.title,
          description: data.description,
          status: "TODO",
          // ... other fields
        },
      });
      return NextResponse.json({ success: true, task });

    case "create_node":
      // Create workflow node similar to seed-node.ts
      const bcrypt = require("bcryptjs");
      const crypto = require("crypto");
      
      const secret = crypto.randomBytes(32).toString("hex");
      const apiKeyId = `node_${crypto.randomBytes(16).toString("hex")}`;
      const apiKeyHash = await bcrypt.hash(secret, 10);

      const node = await prisma.workflowNode.create({
        data: {
          name: data.name,
          type: data.type || "AI_AGENT",
          apiKeyId,
          apiKeyHash,
          capabilities: data.capabilities || {},
          status: "OFFLINE",
        },
      });

      return NextResponse.json({
        success: true,
        node: { id: node.id, apiKey: `${apiKeyId}.${secret}` },
      });

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
```

### Option 3: GitHub Copilot Task Files

Create a `.github/copilot-instructions.md` for Copilot agents:

```markdown
# SeeZee Development Context for GitHub Copilot

## Creating Workflow Nodes
To create a new workflow node:
1. Run: `npm run seed:node -- --name "Node Name" --type GIT_AGENT`
2. Copy the generated API key
3. Store in `.env.local` as `NODE_API_KEY=node_xxx.secret`
4. Start worker: `npm run worker:git-agent`

## API Endpoints
- **Create Project:** POST /api/projects
- **Create Node:** Use seed-node script
- **Node Heartbeat:** POST /api/nodes/heartbeat (requires Bearer token)
- **Poll Jobs:** GET /api/nodes/poll (requires Bearer token)

## Database Schema
Key models: User, Project, WorkflowNode, Lead, Prospect, ExecutionRun
Use Prisma client: `import { prisma } from "@/lib/prisma"`
```

---

## 🎯 Example Use Cases

### Use Case 1: Claude Creates a Workflow Node
In Claude Desktop with MCP enabled:
```
"Create a new WorkflowNode called 'AI Content Generator' 
with type AI_AGENT and capabilities git=false, ai=true"
```
Claude will use the MCP `create_workflow_node` tool automatically.

### Use Case 2: Copilot Queries Projects
In VSCode with the API endpoint:
```typescript
// Copilot can reference this pattern
const response = await fetch('https://seezeestudios.com/api/integrations/copilot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'get_active_projects',
    apiKey: process.env.COPILOT_INTEGRATION_KEY
  })
});
```

### Use Case 3: Automated Node Creation
Create a node via your website's admin panel:

**Add to:** `src/app/(admin)/admin/nodes/create/page.tsx`
```typescript
async function createNode(name: string, type: string) {
  const response = await fetch('/api/admin/nodes/create', {
    method: 'POST',
    body: JSON.stringify({ name, type })
  });
  return response.json();
}
```

---

## 🔐 Environment Variables Needed

```env
# MCP Server
DATABASE_URL=postgresql://...

# Copilot Integration
COPILOT_INTEGRATION_KEY=sk_copilot_xxx

# Node Workers
NODE_API_KEY=node_xxx.secret

# AI Services (already configured)
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx
```

---

## 📦 Next Steps

1. **Install MCP SDK:** `npm install @modelcontextprotocol/sdk`
2. **Build MCP server:** `npx tsc mcp-server.ts`
3. **Configure Claude Desktop** (see step 3 above)
4. **Create Copilot API route** (optional)
5. **Test node creation:** `npm run seed:node -- --name "Test Node" --type AI_AGENT`

---

## 🚀 Running in Production

### Deploy with Vercel
Your [vercel.json](vercel.json) already handles deployment. Just add env vars:

```bash
vercel env add DATABASE_URL
vercel env add NODE_API_KEY
vercel env add COPILOT_INTEGRATION_KEY
```

### Node Workers
Run workers on separate servers/containers:
```powershell
# On worker machine
git clone your-repo
cd steezee
npm install
echo "NODE_API_KEY=node_xxx.secret" > .env.local
npm run worker:git-agent
```

Workers authenticate via the API key and poll `/api/nodes/poll` for jobs.

---

## 📚 Related Files
- [mcp-server.ts](../mcp-server.ts) - MCP server implementation
- [src/lib/node-auth.ts](../src/lib/node-auth.ts) - Node authentication
- [scripts/seed-node.ts](../scripts/seed-node.ts) - Node creation script
- [scripts/workers/git-agent.ts](../scripts/workers/git-agent.ts) - Example worker
- [src/lib/git/github-service.ts](../src/lib/git/github-service.ts) - GitHub integration
