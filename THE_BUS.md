# 🚌 THE BUS - OD AI System

**You asked for "OD AI stuff" - here it is.**

This is a fully autonomous AI development system that runs nonstop:
- AI writes code
- AI tests code
- AI fixes bugs
- AI commits to GitHub
- **All automatically**

---

## 🔥 What You Got

### 1. **AI Coder Brain** ([src/lib/ai/ai-coder.ts](src/lib/ai/ai-coder.ts))
The core AI engine that:
- Reads your repo
- Writes code using Claude
- Runs tests
- If tests fail → asks AI to fix
- Loops until success (max 3 attempts)

### 2. **The Bus Worker** ([scripts/workers/bus-worker.ts](scripts/workers/bus-worker.ts))
Autonomous worker that runs **forever**:
```
while true:
  1. Poll for tasks
  2. Clone repo
  3. AI writes code
  4. Test code
  5. Push + create PR
  6. Repeat
```

### 3. **AI Control Center** ([admin/ai-control](http://localhost:3000/admin/ai-control))
Real-time dashboard showing:
- What AI is doing RIGHT NOW
- Live logs streaming in
- Success/fail stats
- Every commit the AI makes

---

## 🚀 How to Start The Bus

### Step 1: Create the Bus Node
```powershell
npm run seed:node -- --name "The Bus" --type AI_AGENT
```

Copy the API key it gives you.

### Step 2: Set Environment Variables
Add to `.env.local`:
```env
# Worker authentication
NODE_API_KEY=node_xxx.secret

# AI brain
ANTHROPIC_API_KEY=sk-ant-xxx

# GitHub access
GITHUB_TOKEN=ghp_xxx

# Your site URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Start The Bus
```powershell
npm run worker:bus
```

You'll see:
```
🚌 THE BUS IS RUNNING
🤖 Autonomous AI worker online
📡 Polling for tasks...
💓 Heartbeat
```

### Step 4: Watch the Dashboard
Open: `http://localhost:3000/admin/ai-control`

You'll see AI:
- Claiming tasks
- Writing code
- Running tests
- Pushing commits

**IN REAL TIME** 🔥

---

## 🎯 How to Give The Bus Work

### Option A: Via Admin Dashboard
1. Go to `/admin/tasks` (create this page or use existing)
2. Create a task with:
   - Title: "Fix navbar bug"
   - Description: "The navbar is broken on mobile"
   - Repo URL: `https://github.com/your-org/your-repo`
3. The Bus will pick it up automatically

### Option B: Via API
```typescript
await fetch('/api/tasks/create', {
  method: 'POST',
  body: JSON.stringify({
    title: 'Add dark mode toggle',
    description: 'Create a button to switch themes',
    repoUrl: 'https://github.com/your-org/repo',
    priority: 'HIGH'
  })
});
```

### Option C: Via Database
```typescript
await prisma.executionRequest.create({
  data: {
    todoId: 'some-todo-id',
    repoUrl: 'https://github.com/org/repo',
    branchName: 'ai/fix-bug-123',
    priority: 'MEDIUM',
    status: 'PENDING'
  }
});
```

The Bus polls every 15 seconds and will claim it.

---

## 🧠 How The AI Loop Works

When The Bus claims a task:

```
🚌 Clone repo
  ↓
📖 AI reads all files
  ↓
🤖 AI writes code (Claude Sonnet 4)
  ↓
💾 Apply changes to files
  ↓
🧪 Run tests (npm test or tsc)
  ↓
❌ Tests fail?
  ↓ YES
🔄 Send errors back to AI → Fix → Test again
  ↓ NO (tests passed)
✅ Commit changes
  ↓
📤 Push to GitHub
  ↓
🎉 Create PR
  ↓
✅ Mark as SUCCESS
```

All automatic. You just watch.

---

## 🔥 Running Multiple Buses

You can run multiple workers on different machines:

### Machine 1 (Coder Bus)
```powershell
NODE_API_KEY=node_coder.secret
npm run worker:bus
```

### Machine 2 (Test Bus)
```powershell
NODE_API_KEY=node_tester.secret
npm run worker:bus
```

### Machine 3 (Fix Bus)
```powershell
NODE_API_KEY=node_fixer.secret
npm run worker:bus
```

Now you have a **fleet of AI developers**.

---

## 📊 Monitor Everything

### Real-Time Dashboard
`http://localhost:3000/admin/ai-control`

Shows:
- Total runs
- Currently running (with pulse animation)
- Success count
- Failed count
- Live logs for each run

### Node Status
`http://localhost:3000/admin/nodes`

Shows:
- Which workers are online
- Last heartbeat time
- Current job ID
- Health status

---

## 🎮 What You Can Build

### Auto-Fix System
AI automatically fixes bugs as they come in:
- Users report bugs
- Bugs become tasks
- Bus picks them up
- AI fixes them
- PR created
- You just review & merge

### Auto-Feature Builder
Give AI feature specs:
```
Task: Add user profile page
- Show user avatar
- Show user bio
- Edit button
- Use Tailwind styling
```

AI builds it. You just review.

### Nonstop Development
Leave The Bus running 24/7 on a spare PC:
- Queue up 50 tasks
- Go to sleep
- Wake up to 50 PRs

---

## 🔗 When The Bus Uses MCP

The AI Coder can be enhanced to use MCP:

```typescript
// Future enhancement in ai-coder.ts
if (this.useMCP) {
  // Connect to MCP server
  // Use Claude Desktop's context
  // Access your SeeZee data directly
}
```

Right now it uses direct Claude API.
But you can modify [src/lib/ai/ai-coder.ts](src/lib/ai/ai-coder.ts) to use MCP instead.

The Bus becomes even smarter when it can:
- Query your database via MCP
- Access project files via MCP
- Use all your MCP tools

---

## 🚨 Real Talk

### What This Actually Does

✅ Auto-codes features
✅ Auto-fixes bugs  
✅ Auto-commits & PRs
✅ Runs nonstop
✅ Learns from test failures
✅ Uses Claude Sonnet 4

### What You Still Need

- Review PRs (AI isn't perfect)
- Give good task descriptions
- Set up GitHub repo access
- Monitor the dashboard

### Cost Reality

Claude API charges per token:
- Simple task: ~$0.10-0.50
- Complex feature: ~$1-5
- If AI loops 3x: multiply by 3

**But**: Way cheaper than hiring a dev.

---

## 📝 Example Task Flow

### You create task:
```
Title: Fix button color
Description: Change the submit button from blue to red
Repo: https://github.com/sean/app
```

### Bus processes:
```
💓 Heartbeat
🎯 CLAIMED TASK: Fix button color
📦 Cloning repo...
🌿 Creating branch: ai/fix-button-color-abc123
🧠 AI analyzing task and writing code...
📖 Analyzing repo...
🤖 Asking AI to code...
📝 AI generated 284 characters of code
🔍 Parsed 1 file changes from AI
💾 Applying 1 file changes...
  ✅ src/components/Button.tsx
🧪 Running tests...
✅ TypeScript compilation passed
📤 Pushing changes...
🎉 PR created: https://github.com/sean/app/pull/123
✅ Run marked as SUCCESS
```

### You see:
- PR on GitHub
- Live logs in dashboard
- Status: SUCCESS ✅

Total time: **2-3 minutes**

---

## 🛠️ Troubleshooting

### Bus not claiming tasks
- Check `NODE_API_KEY` is set
- Check worker is running (`npm run worker:bus`)
- Check tasks exist in database
- Check task status is `PENDING`

### AI returns no code
- Task description might be unclear
- Try adding more context
- Check `ANTHROPIC_API_KEY` is valid

### Tests failing repeatedly
- AI might not understand the test setup
- Add test instructions to task description
- Or use `quickFix()` to skip tests

### PR creation fails
- Check `GITHUB_TOKEN` has push access
- Check repo URL is correct
- Check branch doesn't already exist

---

## 🎉 You Now Have

🚌 **Autonomous AI worker**
🧠 **Claude-powered coding**
📊 **Real-time monitoring**
🔄 **Auto-retry on failure**
✅ **Auto-testing**
📤 **Auto-PR creation**

This is **"OD AI stuff"**.

Start The Bus and watch it code.

---

## 📚 Key Files

| File | Purpose |
|------|---------|
| [scripts/workers/bus-worker.ts](scripts/workers/bus-worker.ts) | Main autonomous worker |
| [src/lib/ai/ai-coder.ts](src/lib/ai/ai-coder.ts) | AI brain that writes code |
| [src/app/(admin)/admin/ai-control/page.tsx](src/app/(admin)/admin/ai-control/page.tsx) | Real-time dashboard |
| [src/app/api/runs/[runId]/logs/route.ts](src/app/api/runs/[runId]/logs/route.ts) | Logging API |
| [src/app/api/runs/[runId]/complete/route.ts](src/app/api/runs/[runId]/complete/route.ts) | Completion API |

---

**NOW GO START THE BUS** 🚌🔥
