# 🚀 Quick Start: Running SeeZee with AI Integrations

## How Your Website Runs

### Local Development
```powershell
npm run dev
```
- Runs on **http://localhost:3000**
- Hot-reload enabled
- Uses your local `.env.local` file

### Production (Vercel)
```powershell
vercel deploy --prod
```
- Deployed to **https://seezeestudios.com**
- Auto-builds from `npm run build`
- Uses Vercel environment variables

---

## 🤖 Creating & Managing Nodes

### Option 1: Command Line (Fastest)
```powershell
npm run seed:node -- --name "AI Content Agent" --type AI_AGENT
```
Generates an API key like: `node_abc123.def456secret`

### Option 2: Admin Dashboard (Visual)
1. Start dev server: `npm run dev`
2. Go to: **http://localhost:3000/admin/nodes**
3. Fill out the form and click "Create Node"
4. **Copy the API key** (shown only once!)

### Option 3: API Call (Programmatic)
```typescript
const res = await fetch('/api/admin/nodes/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Node',
    type: 'AI_AGENT',
    capabilities: { ai: true, git: false }
  })
});
```

---

## 🔗 Claude/MCP Integration

### Setup in 3 Steps:

#### 1. Install MCP SDK
```powershell
npm install @modelcontextprotocol/sdk
```

#### 2. Build MCP Server
```powershell
npm run mcp:build
```

#### 3. Configure Claude Desktop
Edit: `%APPDATA%\Claude\claude_desktop_config.json`
```json
{
  "mcpServers": {
    "seezee": {
      "command": "node",
      "args": ["C:\\Users\\Sean\\Desktop\\steezee\\mcp-server.js"],
      "env": {
        "DATABASE_URL": "your-database-url-here"
      }
    }
  }
}
```

**Restart Claude Desktop** and it can now:
- Query your projects & leads
- Create workflow nodes
- Run analytics
- Access real-time SeeZee data

---

## 🐙 GitHub Copilot Integration

### Option 1: Workspace Instructions (Easiest)
Already set up! GitHub Copilot reads:
- [.github/copilot-instructions.md](.github/copilot-instructions.md)

Copilot now understands:
- How to create nodes
- Your database schema
- API endpoints

### Option 2: API Integration
Create tasks/nodes from Copilot chat:
```typescript
// Copilot can suggest code like this:
fetch('https://seezeestudios.com/api/admin/nodes/create', {
  method: 'POST',
  body: JSON.stringify({ name: 'Test Node', type: 'AI_AGENT' })
});
```

---

## 🎯 Common Tasks

### View All Nodes
```powershell
# Option 1: Admin dashboard
http://localhost:3000/admin/nodes

# Option 2: API call
curl http://localhost:3000/api/admin/nodes/list
```

### Run a Worker
```powershell
# 1. Create node and get API key
npm run seed:node -- --name "Worker1" --type GIT_AGENT

# 2. Add to .env.local
NODE_API_KEY=node_xxx.secret

# 3. Start worker
npm run worker:git-agent
```

### Test MCP Connection
```
# In Claude Desktop with MCP enabled:
"List all active projects in SeeZee"
"Create a new workflow node called AI Agent"
"Show me revenue analytics for the last 30 days"
```

---

## 📦 Environment Variables Checklist

```env
# Database
DATABASE_URL=postgresql://...

# Auth (NextAuth)
AUTH_SECRET=your-random-secret
AUTH_URL=http://localhost:3000
AUTH_GOOGLE_ID=your-google-oauth-id
AUTH_GOOGLE_SECRET=your-google-oauth-secret

# AI Services
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Node Worker
NODE_API_KEY=node_xxx.secret
```

---

## 🛠️ Troubleshooting

### "Cannot connect to database"
```powershell
# Check if DATABASE_URL is set
npm run check:state
```

### "Node not authenticating"
```powershell
# Verify API key format: node_{id}.{secret}
# Check that the key is in .env.local
```

### "MCP not showing in Claude"
```powershell
# 1. Check claude_desktop_config.json syntax
# 2. Ensure mcp-server.js exists (run npm run mcp:build)
# 3. Restart Claude Desktop completely
```

### "Admin dashboard not loading"
```powershell
# Check auth - must be logged in as ADMIN/CEO role
# View user role in database: npm run db:studio
```

---

## 📚 Key Files Reference

| File | Purpose |
|------|---------|
| [mcp-server.ts](mcp-server.ts) | MCP server for Claude integration |
| [src/app/(admin)/admin/nodes/page.tsx](src/app/(admin)/admin/nodes/page.tsx) | Visual node management UI |
| [src/app/api/admin/nodes/create/route.ts](src/app/api/admin/nodes/create/route.ts) | Node creation API |
| [src/lib/node-auth.ts](src/lib/node-auth.ts) | Node authentication logic |
| [scripts/seed-node.ts](scripts/seed-node.ts) | CLI node creation script |
| [scripts/workers/git-agent.ts](scripts/workers/git-agent.ts) | Example worker implementation |
| [docs/AI_INTEGRATION_GUIDE.md](docs/AI_INTEGRATION_GUIDE.md) | Full integration guide |

---

## 🎉 Next Steps

1. **Create your first node:**
   ```powershell
   npm run seed:node -- --name "Test Agent" --type AI_AGENT
   ```

2. **Set up MCP (if using Claude Desktop):**
   ```powershell
   npm install @modelcontextprotocol/sdk
   npm run mcp:build
   # Then configure Claude Desktop (see above)
   ```

3. **Access admin dashboard:**
   ```
   http://localhost:3000/admin/nodes
   ```

4. **Deploy to production:**
   ```powershell
   vercel deploy --prod
   ```

---

## 💡 Tips

- **API keys are shown only once** - save them immediately!
- **Workers run on separate machines** - they authenticate via API key
- **MCP runs locally** - it connects to your database directly
- **Nodes auto-report heartbeats** - check status in admin dashboard
- **Use the admin UI** for easy visual management

---

Need help? Check the full guide: [docs/AI_INTEGRATION_GUIDE.md](docs/AI_INTEGRATION_GUIDE.md)
