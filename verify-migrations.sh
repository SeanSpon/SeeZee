#!/bin/bash
# Verify Migration Deployment Script
# Run this after deploying migrations to verify everything is correct

echo "================================================"
echo "Migration Deployment Verification"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}Checking migration status...${NC}"
echo "================================================"
npx prisma migrate status
echo ""

echo -e "${CYAN}Verifying new columns in 'todos' table...${NC}"
echo "================================================"
npx prisma migrate status
echo ""

echo "Verifying new columns in 'todos' table..."
echo "================================================"
npx prisma db execute --stdin <<EOF
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
EOF
echo ""

echo -e "${CYAN}Verifying 'task_materials' table...${NC}"
echo "================================================"
npx prisma db execute --stdin <<EOF
SELECT COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'task_materials';
EOF
echo ""

echo -e "${CYAN}Verifying 'TaskMaterialType' enum...${NC}"
echo "================================================"
npx prisma db execute --stdin <<EOF
SELECT enumlabel 
FROM pg_enum e 
JOIN pg_type t ON e.enumtypid = t.oid 
WHERE t.typname = 'TaskMaterialType'
ORDER BY enumsortorder;
EOF
echo ""

echo -e "${CYAN}Checking indexes...${NC}"
echo "================================================"
npx prisma db execute --stdin <<EOF
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
EOF
echo ""

echo -e "${CYAN}Checking applied migrations...${NC}"
echo "================================================"
npx prisma db execute --stdin <<EOF
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
EOF
echo ""

echo "================================================"
echo -e "${GREEN}Verification Complete!${NC}"
echo "================================================"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Restart your application"
echo "2. Test the task detail page"
echo "3. Try creating a task with materials"
echo "4. Link a task to a milestone"
echo ""
