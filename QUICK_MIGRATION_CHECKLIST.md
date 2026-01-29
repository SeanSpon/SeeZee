# Quick Migration Deployment Checklist

## Pre-Deployment
- [ ] Backup production database
- [ ] Verify DATABASE_URL environment variable is set
- [ ] Check current migration status: `npx prisma migrate status`
- [ ] Review pending migrations in `prisma/migrations/` directory

## Deploy Migrations

Run this single command to deploy all pending migrations:

```bash
npx prisma migrate deploy
```

This will apply these migrations in order:
1. `20260123_add_milestone_to_todo` - Adds milestone linking and AI fields to todos
2. `20260123000000_add_task_materials` - Creates task materials table
3. `20260123120000_add_todo_assignment_fields` - Adds change request assignment fields

## Post-Deployment
- [ ] Verify migrations applied: Check `_prisma_migrations` table
- [ ] Regenerate Prisma Client: `npx prisma generate` (if needed)
- [ ] Restart application instances
- [ ] Test task detail page functionality
- [ ] Monitor application logs for errors

## Quick Verification SQL

```sql
-- Verify new columns exist
\d todos

-- Verify task_materials table exists
\d task_materials

-- Check migration history
SELECT migration_name, finished_at, logs 
FROM _prisma_migrations 
WHERE migration_name LIKE '20260123%' 
ORDER BY finished_at DESC;
```

## If Something Goes Wrong

1. Check logs: `SELECT logs FROM _prisma_migrations WHERE migration_name LIKE '20260123%';`
2. Verify database connection
3. See full rollback plan in MIGRATION_DEPLOYMENT_GUIDE.md
4. Contact dev team if issues persist

## Success Indicators

✅ Task detail page loads without errors
✅ Can attach materials to tasks
✅ Milestones show linked tasks
✅ Change requests auto-generate tasks
