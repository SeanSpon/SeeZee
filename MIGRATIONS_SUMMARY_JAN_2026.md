# Database Migrations Summary - January 2026

## Overview

This document summarizes the recent database migrations that add support for the enhanced task management system, including milestone tracking, task materials, and change request integration.

## Migration Files

### 1. `20260123_add_milestone_to_todo`
**Created:** January 23, 2026  
**Purpose:** Links tasks (todos) to project milestones and adds AI generation tracking

#### Changes:
- **New Columns on `todos` table:**
  - `milestoneId` (TEXT, nullable) - Links task to a project milestone
  - `aiGenerated` (BOOLEAN, default false) - Flags AI-generated tasks
  - `aiContext` (JSONB, nullable) - Stores context used for AI task generation

- **Foreign Keys:**
  - `todos.milestoneId` → `project_milestones.id` (ON DELETE SET NULL)

- **Indexes:**
  - `todos_milestoneId_idx` - For efficient milestone queries
  - `project_milestones_projectId_idx` - For project-milestone lookups

#### Use Cases:
- Organize tasks by project milestones
- Track milestone completion progress
- Identify AI-generated tasks for learning/improvement
- Store AI generation context for transparency

---

### 2. `20260123000000_add_task_materials`
**Created:** January 23, 2026  
**Purpose:** Creates a flexible system for attaching materials, files, and resources to tasks

#### Changes:
- **New Enum:** `TaskMaterialType`
  - Values: `PDF`, `DOCUMENT`, `VIDEO`, `IMAGE`, `LINK`, `ASSIGNMENT`, `RESOURCE`

- **New Table:** `task_materials`
  ```
  id              TEXT (PK)
  todoId          TEXT (FK → todos.id)
  title           TEXT
  description     TEXT (nullable)
  type            TaskMaterialType
  fileUrl         TEXT (nullable) - For uploaded files
  linkUrl         TEXT (nullable) - For external resources
  fileName        TEXT (nullable)
  fileSize        INTEGER (nullable) - In bytes
  mimeType        TEXT (nullable)
  dueDate         TIMESTAMP (nullable) - For assignments
  isRequired      BOOLEAN (default false)
  order           INTEGER (default 0) - Display ordering
  createdById     TEXT
  createdAt       TIMESTAMP
  updatedAt       TIMESTAMP
  ```

- **Foreign Keys:**
  - `task_materials.todoId` → `todos.id` (ON DELETE CASCADE)

- **Indexes:**
  - `task_materials_todoId_idx` - For task material lookups
  - `task_materials_type_idx` - For filtering by material type
  - `task_materials_createdById_idx` - For creator queries

#### Use Cases:
- Attach reference documents to tasks
- Link video tutorials or documentation
- Add assignments with due dates
- Organize materials by importance (isRequired flag)
- Control display order of materials

---

### 3. `20260123120000_add_todo_assignment_fields`
**Created:** January 23, 2026 (12:00 PM)  
**Purpose:** Adds advanced task assignment capabilities including change request integration and role-based assignment

#### Changes:
- **New Columns on `todos` table:**
  - `changeRequestId` (TEXT, nullable, unique) - Links to auto-generated change request
  - `assignedToRole` (UserRole enum, nullable) - For role-based assignments
  - `assignedToTeamId` (TEXT, nullable) - For team-based assignments

- **Foreign Keys:**
  - `todos.changeRequestId` → `change_requests.id` (ON DELETE SET NULL)

- **Indexes:**
  - `todos_changeRequestId_key` - Unique constraint (partial index where not null)
  - `todos_changeRequestId_idx` - For change request queries
  - `todos_assignedToRole_idx` - For role-based filtering
  - `todos_assignedToTeamId_idx` - For team-based filtering

#### Use Cases:
- Auto-generate tasks from client change requests
- Assign tasks to roles (e.g., all DEVELOPERS, all DESIGNERS)
- Assign tasks to entire teams/organizations
- Track which tasks originated from change requests
- One-to-one relationship between change request and its task

---

## Migration Dependencies

These migrations have dependencies on existing tables:

1. **`20260123_add_milestone_to_todo`** requires:
   - `todos` table (created in earlier migrations)
   - `project_milestones` table (created in `20251009135855_mvp_schema_bootstrap`)

2. **`20260123000000_add_task_materials`** requires:
   - `todos` table (created in earlier migrations)

3. **`20260123120000_add_todo_assignment_fields`** requires:
   - `todos` table (created in earlier migrations)
   - `change_requests` table (created in `20251111000000_add_flexible_pricing_fields`)

## Schema Models Affected

### Todo Model (Complete Field List)
After all migrations, the `Todo` model includes:

```typescript
model Todo {
  // Core fields
  id              String
  title           String
  description     String?
  status          TodoStatus
  priority        TodoPriority
  
  // Assignment fields
  assignedToId    String?         // Individual user assignment
  assignedToRole  UserRole?       // NEW: Role-based assignment
  assignedToTeamId String?        // NEW: Team-based assignment
  
  // Project organization
  projectId       String?
  milestoneId     String?         // NEW: Milestone linking
  changeRequestId String?         // NEW: Change request linking (unique)
  
  // Dates
  dueDate         DateTime?
  completedAt     DateTime?
  submittedAt     DateTime?
  approvedAt      DateTime?
  createdAt       DateTime
  updatedAt       DateTime
  
  // AI tracking
  aiGenerated     Boolean         // NEW: AI generation flag
  aiContext       Json?           // NEW: AI generation context
  
  // Kanban fields
  column          String
  position        Int
  
  // Submission
  submissionNotes String?
  
  // Relations
  assignedTo      User?
  createdBy       User
  project         Project?
  milestone       ProjectMilestone?  // NEW
  changeRequest   ChangeRequest?     // NEW
  materials       TaskMaterial[]     // NEW
}
```

### TaskMaterial Model (New)
```typescript
model TaskMaterial {
  id          String
  todoId      String
  todo        Todo
  title       String
  description String?
  type        TaskMaterialType
  fileUrl     String?
  linkUrl     String?
  fileName    String?
  fileSize    Int?
  mimeType    String?
  dueDate     DateTime?
  isRequired  Boolean
  order       Int
  createdById String
  createdAt   DateTime
  updatedAt   DateTime
}
```

## Data Safety

All migrations use safe, idempotent patterns:

1. **IF NOT EXISTS** clauses prevent duplicate errors on re-runs
2. **CREATE TABLE IF NOT EXISTS** ensures tables aren't recreated
3. **DO $$ blocks** for conditional constraint creation
4. **ON DELETE CASCADE** for task materials (materials deleted when task deleted)
5. **ON DELETE SET NULL** for optional relationships (milestone, change request)
6. **Partial indexes** for unique constraints on nullable columns
7. **Default values** provided for new columns (no null constraint violations)

**These migrations can be safely run multiple times** - they won't fail if already applied.

## Performance Considerations

All new columns have appropriate indexes:

- **Milestone queries:** Index on `todos.milestoneId`
- **Material lookups:** Indexes on `task_materials.todoId`, `type`, `createdById`
- **Change request tasks:** Indexes on `todos.changeRequestId`
- **Role/team assignments:** Indexes on `assignedToRole`, `assignedToTeamId`

## Deployment Impact

- **Zero downtime:** All columns are nullable or have defaults
- **Backward compatible:** Existing queries continue to work
- **No data migration needed:** New columns start empty
- **Prisma Client update:** Regenerate after migration (`npx prisma generate`)

## Verification Queries

After deployment, verify with:

```sql
-- Check new columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'todos'
  AND column_name IN ('milestoneId', 'aiGenerated', 'aiContext', 
                      'changeRequestId', 'assignedToRole', 'assignedToTeamId')
ORDER BY column_name;

-- Check task_materials table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'task_materials'
ORDER BY ordinal_position;

-- Check TaskMaterialType enum values
SELECT enumlabel
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'TaskMaterialType'
ORDER BY enumsortorder;

-- Verify indexes
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE tablename IN ('todos', 'task_materials')
  AND indexname LIKE '%milestone%' 
   OR indexname LIKE '%material%'
   OR indexname LIKE '%changeRequest%'
   OR indexname LIKE '%assigned%'
ORDER BY tablename, indexname;
```

## Related Files

- **Schema:** `prisma/schema.prisma`
- **Deployment Guide:** `MIGRATION_DEPLOYMENT_GUIDE.md`
- **Quick Checklist:** `QUICK_MIGRATION_CHECKLIST.md`
- **Manual Migration (deprecated):** `prisma/migrations/manual_add_task_fields.sql`

## Notes for Production Deployment

1. These migrations are **already in the codebase** and committed
2. Run `npx prisma migrate deploy` to apply them to production
3. The application code already expects these fields (they're in the schema)
4. After deployment, the task detail page will work correctly
5. New features enabled: milestone tracking, task materials, change request integration

## Status

✅ All migrations created  
✅ Migration files validated  
✅ Dependencies verified  
✅ Prisma Client generated successfully  
✅ Ready for production deployment  

## Next Steps

1. Review this summary and the deployment guide
2. Schedule production deployment window
3. Create database backup
4. Run `npx prisma migrate deploy` in production
5. Restart application instances
6. Verify task detail page functionality
