# 🚀 Quick Start: New Simplified System

## TL;DR - What Changed?

**Before:** Confusing mess with 5 ways to create invoices, 4 request types, no file organization  
**After:** Clean unified systems - ONE way to do each thing!

---

## Create an Invoice (NEW WAY)

```typescript
import { createUnifiedInvoice, createDepositInvoice } from "@/lib/invoice-unified";

// Quick way - deposit invoice
await createDepositInvoice(organizationId, projectId, 5000);

// Custom invoice with full control
await createUnifiedInvoice({
  organizationId: "org_123",
  projectId: "proj_456",
  title: "Website Development Deposit",
  description: "50% upfront payment",
  items: [
    { description: "Website Design", quantity: 1, rate: 2000 },
    { description: "Development", quantity: 1, rate: 3000 },
  ],
  dueDate: new Date("2026-02-01"),
  autoSend: true, // Sends via Stripe automatically
  metadata: {
    invoiceType: "deposit",
    milestone: "Phase 1",
  },
});
```

**Delete these old methods:**
- ❌ `/api/invoices/create-final/route.ts`
- ❌ `createInvoiceFromProject()`
- ❌ `createInvoiceWithLineItems()`
- ❌ `createAndSendInvoice()`

---

## Create a Request (NEW WAY)

```typescript
import { 
  submitNewProjectRequest,
  submitChangeRequest,
  createMaintenanceTask,
  reportBug 
} from "@/lib/request-unified";

// Client wants a new project
await submitNewProjectRequest({
  organizationId: "org_123",
  submittedBy: userId,
  title: "Need new website",
  description: "Modern nonprofit website needed",
  projectType: "nonprofit",
  budget: "5000-10000",
});

// Client wants a change
await submitChangeRequest({
  projectId: "proj_123",
  submittedBy: userId,
  title: "Change donate button color",
  description: "Make it red",
  category: "DESIGN",
  priority: "LOW",
});

// Admin creates maintenance work
await createMaintenanceTask({
  projectId: "proj_123",
  title: "Update WordPress plugins",
  estimatedHours: 0.5,
});

// Client reports bug
await reportBug({
  projectId: "proj_123",
  submittedBy: userId,
  title: "Contact form broken",
  priority: "URGENT",
});
```

**Delete these old methods:**
- ❌ `db.request.create()`
- ❌ `db.changeRequest.create()`
- ❌ `db.projectRequest.create()`
- ❌ `db.clientTask.create()`

---

## Organize Project Files (NEW!)

```typescript
import { 
  initializeProjectFolders,
  getProjectFolders,
  autoOrganizeFiles,
  moveFileToFolder 
} from "@/lib/project-organization";

// Create default folders for new project
await initializeProjectFolders(projectId);
// Creates: Contracts, Design, Client Assets, Docs, Deliverables, Invoices

// Get folder structure
const { folders } = await getProjectFolders(projectId);

// Auto-organize messy files
await autoOrganizeFiles(projectId);
// Intelligently sorts files into folders

// Move a file
await moveFileToFolder(fileId, folderId);
```

---

## Check Project Health (NEW!)

```typescript
import { getProjectHealth } from "@/lib/project-organization";

const health = await getProjectHealth(projectId);

console.log(health);
// {
//   healthScore: 85,  // 0-100
//   organization: {
//     fileOrganization: {
//       folders: 6,
//       totalFiles: 24,
//       unorganizedFiles: 3,
//       organizationRate: "87.5"
//     },
//     invoices: {
//       total: 5,
//       paid: 3,
//       overdue: 0,
//       totalRevenue: 8500
//     },
//     requests: { ... },
//     todos: { ... }
//   },
//   recommendations: [
//     "You have 3 unorganized files. Run auto-organize."
//   ]
// }
```

---

## Migration Steps

### 1. Update Database

```bash
npx prisma migrate dev --name simplification_update
```

### 2. Migrate Existing Data

```bash
npx tsx scripts/migrate-to-simplified-system.ts
```

This will:
- Create folders for all projects
- Migrate Request → UnifiedRequest
- Migrate ChangeRequest → UnifiedRequest
- Migrate ProjectRequest → UnifiedRequest
- Migrate ClientTask → UnifiedRequest

### 3. Initialize Folders for Projects

```typescript
// In a script or API route
const projects = await db.project.findMany();
for (const project of projects) {
  await initializeProjectFolders(project.id);
}
```

---

## Common Patterns

### Invoice Workflow

```typescript
// 1. Create deposit invoice
const { invoice, paymentUrl } = await createDepositInvoice(
  orgId, 
  projectId, 
  5000
);

// 2. Send payment link to client
await sendEmail({
  to: clientEmail,
  subject: "Invoice for Website Project",
  body: `Pay here: ${paymentUrl}`
});

// 3. Later, create final invoice
await createFinalInvoice(orgId, projectId, 5000);
```

### Request Workflow

```typescript
// 1. Client submits change request
const { request } = await submitChangeRequest({
  projectId,
  submittedBy: clientId,
  title: "Add new page",
  description: "Need a services page",
  category: "FEATURE",
});

// 2. Admin reviews and estimates
await updateRequestStatus(request.id, "REVIEWING");

// 3. Admin approves with hours estimate
await db.unifiedRequest.update({
  where: { id: request.id },
  data: {
    status: "APPROVED",
    estimatedHours: 4,
    assignedToId: developerId,
  }
});

// 4. Developer completes work
await updateRequestStatus(request.id, "COMPLETED", {
  actualHours: 3.5,
  completedBy: developerId,
});
```

### File Organization Workflow

```typescript
// 1. Initialize folders for new project
await initializeProjectFolders(projectId);

// 2. Files get uploaded (existing process)
const file = await uploadFile(...);

// 3. Auto-organize periodically
await autoOrganizeFiles(projectId);

// 4. Manually move specific files
await moveFileToFolder(file.id, folderId);

// 5. Check organization health
const health = await getProjectHealth(projectId);
```

---

## API Route Examples

### Invoice API

```typescript
// app/api/invoices/create/route.ts
import { createUnifiedInvoice } from "@/lib/invoice-unified";

export async function POST(req: Request) {
  const data = await req.json();
  
  const result = await createUnifiedInvoice({
    organizationId: data.organizationId,
    projectId: data.projectId,
    title: data.title,
    items: data.items,
    dueDate: new Date(data.dueDate),
    autoSend: true,
  });
  
  if (!result.success) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  
  return Response.json({
    invoice: result.invoice,
    paymentUrl: result.paymentUrl,
  });
}
```

### Request API

```typescript
// app/api/requests/create/route.ts
import { submitChangeRequest } from "@/lib/request-unified";

export async function POST(req: Request) {
  const data = await req.json();
  const session = await getSession();
  
  const result = await submitChangeRequest({
    projectId: data.projectId,
    submittedBy: session.user.id,
    title: data.title,
    description: data.description,
    category: data.category,
    priority: data.priority,
  });
  
  if (!result.success) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  
  return Response.json({ request: result.request });
}
```

### Folder Management API

```typescript
// app/api/projects/[id]/folders/route.ts
import { getProjectFolders, createProjectFolder } from "@/lib/project-organization";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const result = await getProjectFolders(params.id);
  return Response.json(result);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json();
  
  const result = await createProjectFolder(params.id, {
    name: data.name,
    description: data.description,
    color: data.color,
  });
  
  return Response.json(result);
}
```

---

## Server Action Examples

```typescript
// server/actions/invoices.ts
"use server";
import { createDepositInvoice, createFinalInvoice } from "@/lib/invoice-unified";

export async function createProjectInvoices(projectId: string, organizationId: string, totalCost: number) {
  // Create deposit
  const deposit = await createDepositInvoice(organizationId, projectId, totalCost);
  
  return {
    depositInvoice: deposit.invoice,
    depositPaymentUrl: deposit.paymentUrl,
  };
}
```

```typescript
// server/actions/requests.ts
"use server";
import { getRequestsNeedingAttention } from "@/lib/request-unified";

export async function getMyPendingRequests(projectId?: string) {
  const result = await getRequestsNeedingAttention(projectId);
  return result;
}
```

---

## What to Remember

### ✅ DO:
- Use `createUnifiedInvoice()` for all invoices
- Use `submitChangeRequest()` and other unified request functions
- Initialize folders for new projects
- Use `getProjectHealth()` to monitor project status
- Store custom data in `metadata` fields

### ❌ DON'T:
- Use old invoice creation endpoints
- Create Request/ChangeRequest/ProjectRequest directly
- Leave files unorganized
- Add new fields to models (use metadata instead)
- Forget to run migrations

---

## Need the Full Details?

Read `SIMPLIFICATION_COMPLETE.md` for:
- Complete explanation of all changes
- Database model details
- Migration instructions
- Full feature list
- Troubleshooting guide

---

**You're all set! The new system is much simpler and more powerful. 🎉**
