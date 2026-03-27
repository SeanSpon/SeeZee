# Migration Deployment Guide

This guide covers deploying the recent database migrations to production.

## Migrations to Deploy

The following migrations have been added to support the task detail page and related features:

1. **20260123_add_milestone_to_todo** - Adds milestone linking to todos
   - Adds `milestoneId` column to `todos` table
   - Adds `aiGenerated` boolean flag
   - Adds `aiContext` JSONB field
   - Creates foreign key constraint to `project_milestones`
   - Adds indexes for performance

2. **20260123000000_add_task_materials** - Creates task materials system
   - Creates `TaskMaterialType` enum (PDF, DOCUMENT, VIDEO, IMAGE, LINK, ASSIGNMENT, RESOURCE)
   - Creates `task_materials` table
   - Links materials to todos via `todoId` foreign key
   - Supports file uploads, external links, and assignments
   - Includes due dates and required flags

3. **20260123120000_add_todo_assignment_fields** - Adds advanced task assignment
   - Adds `changeRequestId` column (unique) to link tasks to change requests
   - Adds `assignedToRole` column for role-based assignments
   - Adds `assignedToTeamId` column for team-based assignments
   - Creates foreign key constraint to `change_requests`
   - Adds indexes for query performance

## Prerequisites

Before deploying migrations, ensure:

1. ✅ Production database backup is created
2. ✅ Database URL is configured in environment variables
3. ✅ All previous migrations have been applied successfully
4. ✅ Application downtime window is scheduled (if needed)

## Deployment Commands

### Option 1: Deploy via Prisma CLI (Recommended)

```bash
# 1. Connect to production environment
# Ensure DATABASE_URL environment variable points to production

# 2. Deploy all pending migrations
npx prisma migrate deploy

# 3. Generate Prisma Client with updated schema
npx prisma generate
```

### Option 2: Deploy via Manual SQL (If Prisma CLI unavailable)

If you cannot use Prisma CLI in production, you can apply migrations manually:

```bash
# Connect to production database
psql $DATABASE_URL

# Run migrations in order:
\i prisma/migrations/20260123_add_milestone_to_todo/migration.sql
\i prisma/migrations/20260123000000_add_task_materials/migration.sql
\i prisma/migrations/20260123120000_add_todo_assignment_fields/migration.sql
```

## Verification Steps

After deployment, verify the migrations were applied:

```sql
-- Check that milestoneId was added to todos
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'todos' 
  AND column_name IN ('milestoneId', 'aiGenerated', 'aiContext', 'changeRequestId', 'assignedToRole', 'assignedToTeamId');

-- Check that task_materials table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'task_materials';

-- Check that TaskMaterialType enum exists
SELECT enumlabel 
FROM pg_enum e 
JOIN pg_type t ON e.enumtypid = t.oid 
WHERE t.typname = 'TaskMaterialType';

-- Check indexes were created
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('todos', 'task_materials', 'project_milestones');
```

## Expected Results

After successful migration:

1. ✅ `todos` table should have:
   - `milestoneId` column (nullable TEXT)
   - `aiGenerated` column (BOOLEAN, default false)
   - `aiContext` column (JSONB, nullable)
   - `changeRequestId` column (nullable TEXT, unique)
   - `assignedToRole` column (nullable UserRole enum)
   - `assignedToTeamId` column (nullable TEXT)

2. ✅ `task_materials` table should exist with all columns

3. ✅ `TaskMaterialType` enum should be created

4. ✅ All foreign key constraints should be in place

5. ✅ All indexes should be created for performance

## Rollback Plan

If issues occur, rollback migrations:

```sql
-- Remove added columns from todos
ALTER TABLE "todos" DROP COLUMN IF EXISTS "milestoneId";
ALTER TABLE "todos" DROP COLUMN IF EXISTS "aiGenerated";
ALTER TABLE "todos" DROP COLUMN IF EXISTS "aiContext";
ALTER TABLE "todos" DROP COLUMN IF EXISTS "changeRequestId";
ALTER TABLE "todos" DROP COLUMN IF EXISTS "assignedToRole";
ALTER TABLE "todos" DROP COLUMN IF EXISTS "assignedToTeamId";

-- Drop task_materials table
DROP TABLE IF EXISTS "task_materials";

-- Drop TaskMaterialType enum
DROP TYPE IF EXISTS "TaskMaterialType";

-- Remove indexes
DROP INDEX IF EXISTS "todos_milestoneId_idx";
DROP INDEX IF EXISTS "todos_changeRequestId_idx";
DROP INDEX IF EXISTS "todos_changeRequestId_key";
DROP INDEX IF EXISTS "todos_assignedToRole_idx";
DROP INDEX IF EXISTS "todos_assignedToTeamId_idx";
DROP INDEX IF EXISTS "project_milestones_projectId_idx";
```

## Post-Deployment

1. **Restart Application**: Restart all application instances to pick up new Prisma Client
2. **Monitor Logs**: Check application logs for any database-related errors
3. **Test Features**: Verify task detail page and material upload functionality works
4. **Performance**: Monitor query performance on new indexed columns

## Production Database Connection

To connect to your production database for verification:

```bash
# Using psql
psql "$DATABASE_URL"

# Or using Prisma Studio (read-only recommended)
npx prisma studio
```

## Migration Order Matters

These migrations must be applied in this order:

1. First: `20260123_add_milestone_to_todo` (depends on existing `project_milestones`)
2. Second: `20260123000000_add_task_materials` (creates new table)
3. Third: `20260123120000_add_todo_assignment_fields` (depends on existing `change_requests`)

The `npx prisma migrate deploy` command will automatically apply them in the correct order.

## Need Help?

If you encounter errors:

1. Check database connection: `npx prisma db pull`
2. Verify existing schema state
3. Check migration history: `SELECT * FROM _prisma_migrations ORDER BY finished_at DESC;`
4. Review application logs for Prisma errors

## Manual Migration File

Note: The file `prisma/migrations/manual_add_task_fields.sql` was replaced by the proper migration `20260123120000_add_todo_assignment_fields`. The manual file can be deleted after successful deployment.
