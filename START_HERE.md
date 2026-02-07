# 🎯 START HERE - OD AI Setup

You wanted AI that codes nonstop. Here's how to set it up in 5 minutes.

## ⚡ Quick Setup

### 1. Install Dependencies (if needed)
```powershell
npm install
```

### 2. Create Worker Node
```powershell
npm run seed:node -- --name "The Bus" --type AI_AGENT
```

**COPY THE API KEY IT GIVES YOU!** It only shows once.

### 3. Add to .env.local
```env
# The API key from step 2
NODE_API_KEY=node_xxxxxxxxxx.yyyyyyyyyyyy

# Get from: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# Get from: https://github.com/settings/tokens (needs repo access)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx

# Your local dev URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Start Your Site
```powershell
npm run dev
```

### 5. Start The Bus (in a new terminal)
```powershell
npm run worker:bus
```

You should see:
```
🚌 THE BUS IS RUNNING
🤖 Autonomous AI worker online
📡 Polling for tasks...
💓 Heartbeat
```

### 6. Watch It Work
Open: **http://localhost:3000/admin/ai-control**

This is your AI control center. You'll see:
- Real-time AI activity
- Live logs
- Success/fail stats

---

## 🧪 Test It

### Quick Test Task

Option 1 - Via Database:
```powershell
npm run db:studio
```
Then create an `ExecutionRequest` with:
- repoUrl: Your GitHub repo
- branchName: "ai/test-123"
- status: "PENDING"

Option 2 - Via API (once you build the endpoint):
```typescript
fetch('/api/tasks/create', {
  method: 'POST',
  body: JSON.stringify({
    title: 'Add console.log test',
    description: 'Add console.log("test") to index.ts',
    repoUrl: 'https://github.com/your-username/test-repo'
  })
});
```

The Bus will:
1. Claim the task
2. Clone your repo
3. Use AI to write the code
4. Test it
5. Create a PR

Watch it happen in `/admin/ai-control` 🔥

---

## 📊 What You Get

### 3 Main Pages

**1. Node Management** - `/admin/nodes`
- Create workers
- See which are online
- Monitor heartbeats

**2. AI Control Center** - `/admin/ai-control`  
- Watch AI code in real-time
- See live logs
- Track success rates

**3. MCP Integration** - See [THE_BUS.md](THE_BUS.md)
- Connect Claude Desktop
- Let Claude access your data

### 1 Autonomous Worker

**The Bus** - `scripts/workers/bus-worker.ts`
- Polls every 15 seconds
- Claims work automatically
- Codes using Claude Sonnet 4
- Tests everything
- Creates PRs
- Runs forever

### 1 AI Brain

**AI Coder** - `src/lib/ai/ai-coder.ts`
- Reads repos
- Writes code
- Fixes bugs
- Loops on failures

---

## 🎮 Next Steps

1. ✅ **Set up env vars** (see step 3 above)
2. ✅ **Start The Bus** (`npm run worker:bus`)
3. ✅ **Create a test task** (via DB or API)
4. ✅ **Watch dashboard** (`/admin/ai-control`)
5. 🔥 **Scale to multiple workers** (see [THE_BUS.md](THE_BUS.md))
6. 🚀 **Leave it running 24/7**

---

## 🚨 Common Issues

**"NODE_API_KEY not found"**
→ Run `npm run seed:node` first

**"ANTHROPIC_API_KEY not found"**  
→ Get one from https://console.anthropic.com/

**"GITHUB_TOKEN invalid"**
→ Create new token with `repo` scope at https://github.com/settings/tokens

**"No tasks showing up"**
→ Create a task in the database or via API

**"Tests failing"**
→ Check your repo has a test script or TypeScript config

---

## 📚 Full Documentation

- **[THE_BUS.md](THE_BUS.md)** - Complete system guide
- **[QUICK_START.md](QUICK_START.md)** - Node creation & MCP setup
- **[docs/AI_INTEGRATION_GUIDE.md](docs/AI_INTEGRATION_GUIDE.md)** - AI integration details

---

## 💬 What You're About to See

When you start The Bus and give it work:

```
[2026-02-06 10:30:15] 🎯 CLAIMED TASK: Fix button color
[2026-02-06 10:30:16] 📦 Cloning repo...
[2026-02-06 10:30:20] 🧠 AI analyzing task and writing code...
[2026-02-06 10:30:25] 📝 AI generated 342 characters of code
[2026-02-06 10:30:25] 💾 Applying 1 file changes...
[2026-02-06 10:30:26] 🧪 Running tests...
[2026-02-06 10:30:28] ✅ Tests passed!
[2026-02-06 10:30:30] 📤 Pushing changes...
[2026-02-06 10:30:35] 🎉 PR created: github.com/you/repo/pull/42
[2026-02-06 10:30:35] ✅ TASK COMPLETE
```

**2-3 minutes from task → working PR.**

All automatic. AI did everything.

That's the "OD AI stuff" you wanted. 🚌🔥

---

**Ready? Run this:**
```powershell
npm run seed:node -- --name "The Bus" --type AI_AGENT
# Copy the API key
# Add to .env.local
npm run worker:bus
```

Then watch `/admin/ai-control` 👀
