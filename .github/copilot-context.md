# GitHub Copilot Context for SeeZee Platform

## Quick Reference

### Creating Workflow Nodes
```typescript
// CLI method
npm run seed:node -- --name "AI Agent" --type AI_AGENT

// API method
await fetch('/api/admin/nodes/create', {
  method: 'POST',
  body: JSON.stringify({
    name: 'AI Agent',
    type: 'AI_AGENT',
    capabilities: { ai: true, git: false }
  })
});
```

### Node Types
- `GIT_AGENT` - Git operations worker
- `AI_AGENT` - AI/LLM processing worker  
- `BUILD_RUNNER` - Build/compile worker
- `TEST_RUNNER` - Test execution worker

### Key Database Models
```typescript
// User with role-based access
User { role: UserRole } // CLIENT, ADMIN, CEO, STAFF, DEVELOPER, DESIGNER

// Multi-tenant organization
Organization { members: OrganizationMember[] }

// Distributed workflow system
WorkflowNode {
  apiKeyId: string        // Public key identifier
  apiKeyHash: string      // Bcrypt hash of secret
  status: NodeStatus      // ONLINE, OFFLINE, BUSY
  capabilities: Json      // { git: bool, build: bool, ai: bool }
  currentJobId: string    // Active ExecutionRun ID
}

// Project management
Project { status, client, organization }

// CRM/Marketing
Lead, Prospect { score, status, outreach }

// Billing
MaintenanceSubscription, Invoice, FinanceTransaction
```

### Authentication Patterns

```typescript
// Server component/action - use guards
import { requireAdmin, requireUser } from "@/lib/authz";

export default async function AdminPage() {
  const session = await requireAdmin(); // Throws if not admin
  // ...
}

// API route - manual check
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ...
}

// Node authentication - bearer token
import { authenticateNode, isAuthError, authErrorResponse } from "@/lib/node-auth";

export async function POST(req: NextRequest) {
  const result = await authenticateNode(req);
  if (isAuthError(result)) return authErrorResponse(result);
  const { node } = result;
  // ...
}
```

### Database Access

```typescript
// Always use singleton
import { prisma } from "@/lib/prisma";

// Example queries
const projects = await prisma.project.findMany({
  where: { status: "ACTIVE" },
  include: { client: true, organization: true }
});

const node = await prisma.workflowNode.create({
  data: { name, type, apiKeyId, apiKeyHash, status: "OFFLINE" }
});
```

### Common API Endpoints

```typescript
// Admin nodes
POST /api/admin/nodes/create  // Create workflow node
GET  /api/admin/nodes/list    // List all nodes

// Node worker endpoints  
POST /api/nodes/heartbeat     // Node health check (requires Bearer token)
GET  /api/nodes/poll          // Claim next job (requires Bearer token)

// Projects
GET  /api/projects            // List projects
POST /api/projects            // Create project

// Leads/CRM
GET  /api/leads               // List leads
POST /api/leads               // Create lead
```

### Environment Variables

```typescript
// Required for development
DATABASE_URL                  // PostgreSQL connection
AUTH_SECRET                   // NextAuth JWT secret
AUTH_GOOGLE_ID               // OAuth client ID
AUTH_GOOGLE_SECRET           // OAuth secret

// AI integrations
ANTHROPIC_API_KEY            // Claude API
OPENAI_API_KEY               // GPT API

// Worker nodes
NODE_API_KEY                 // Format: node_{id}.{secret}

// Payments
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

### File Structure Patterns

```
src/
├── app/
│   ├── (public)/           # Landing pages, no auth
│   ├── (client)/           # Client portal (CLIENT role)
│   ├── (admin)/            # Admin dashboard (ADMIN/CEO)
│   ├── (portal)/           # Shared authenticated  
│   └── api/                # API routes
├── components/
│   ├── ui/                 # Shared components
│   ├── admin/              # Admin-specific
│   └── client/             # Client-specific
└── lib/
    ├── prisma.ts           # Database client
    ├── authz.ts            # Role guards
    ├── node-auth.ts        # Worker auth
    └── ai/                 # AI integrations
```

### Styling (Glass Morphism)

```typescript
// Standard glass card
className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl"

// With glow shadow
className="shadow-glow-blue" // or shadow-glow-red

// Status colors
status === "ONLINE"  ? "text-green-400 bg-green-400/10"
status === "BUSY"    ? "text-yellow-400 bg-yellow-400/10" 
status === "OFFLINE" ? "text-gray-400 bg-gray-400/10"
```

### Common Workflows

**Creating a new admin feature:**
1. Add route in `src/app/(admin)/admin/feature/page.tsx`
2. Create API endpoint in `src/app/api/admin/feature/route.ts`
3. Use `requireAdmin()` guard
4. Update admin navigation if needed

**Creating a worker:**
1. Run `npm run seed:node` to get API key
2. Create worker in `scripts/workers/`
3. Use `authenticateNode()` for API calls
4. Poll `/api/nodes/poll` for jobs
5. Report to `/api/nodes/heartbeat`

**Adding a database model:**
1. Update `prisma/schema.prisma`
2. Run `npm run db:push` (dev) or `npm run db:migrate` (prod)
3. Run `npm run db:generate` to update types
4. Import types from `@prisma/client`

## Integration with AI Tools

### Claude Desktop (MCP)
```powershell
# 1. Install SDK
npm install @modelcontextprotocol/sdk

# 2. Build server
npm run mcp:build

# 3. Configure Claude Desktop
# Add to claude_desktop_config.json:
{
  "mcpServers": {
    "seezee": {
      "command": "node",
      "args": ["C:\\Users\\Sean\\Desktop\\steezee\\mcp-server.js"],
      "env": { "DATABASE_URL": "..." }
    }
  }
}
```

### GitHub Copilot Tasks
Use natural language in chat:
- "Create a new workflow node for AI processing"
- "Add an API endpoint to list active projects"
- "Generate a server action to update a lead status"

Copilot will use this context file to understand your patterns and suggest appropriate code.

---

For full documentation, see:
- [QUICK_START.md](../QUICK_START.md)
- [docs/AI_INTEGRATION_GUIDE.md](../docs/AI_INTEGRATION_GUIDE.md)
