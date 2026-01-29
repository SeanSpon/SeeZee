# Verify Migration Deployment Script (PowerShell)
# Run this after deploying migrations to verify everything is correct

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Migration Deployment Verification" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking migration status..." -ForegroundColor Yellow
Write-Host "================================================"
npx prisma migrate status
Write-Host ""

Write-Host "Verifying new columns in 'todos' table..." -ForegroundColor Yellow
Write-Host "================================================"
$sql = @"
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'todos' 
  AND column_name IN (
    'milestoneId', 
    'aiGenerated', 
    'aiContext',
    'changeRequestId',
    'assignedToRole',
    'assignedToTeamId'
  )
ORDER BY column_name;
"@
$sql | npx prisma db execute --stdin
Write-Host ""

Write-Host "Verifying 'task_materials' table..." -ForegroundColor Yellow
Write-Host "================================================"
$sql = @"
SELECT COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'task_materials';
"@
$sql | npx prisma db execute --stdin
Write-Host ""

Write-Host "Verifying 'TaskMaterialType' enum..." -ForegroundColor Yellow
Write-Host "================================================"
$sql = @"
SELECT enumlabel 
FROM pg_enum e 
JOIN pg_type t ON e.enumtypid = t.oid 
WHERE t.typname = 'TaskMaterialType'
ORDER BY enumsortorder;
"@
$sql | npx prisma db execute --stdin
Write-Host ""

Write-Host "Checking indexes..." -ForegroundColor Yellow
Write-Host "================================================"
$sql = @"
SELECT tablename, indexname
FROM pg_indexes
WHERE tablename IN ('todos', 'task_materials')
  AND (
    indexname LIKE '%milestone%' OR
    indexname LIKE '%material%' OR
    indexname LIKE '%changeRequest%' OR
    indexname LIKE '%assigned%'
  )
ORDER BY tablename, indexname;
"@
$sql | npx prisma db execute --stdin
Write-Host ""

Write-Host "Checking applied migrations..." -ForegroundColor Yellow
Write-Host "================================================"
$sql = @"
SELECT 
    migration_name,
    finished_at,
    CASE 
        WHEN logs IS NULL OR logs = '' THEN 'Success'
        ELSE 'Check logs'
    END as status
FROM _prisma_migrations 
WHERE migration_name LIKE '20260123%'
ORDER BY finished_at DESC;
"@
$sql | npx prisma db execute --stdin
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Verification Complete!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your application"
Write-Host "2. Test the task detail page"
Write-Host "3. Try creating a task with materials"
Write-Host "4. Link a task to a milestone"
Write-Host ""
