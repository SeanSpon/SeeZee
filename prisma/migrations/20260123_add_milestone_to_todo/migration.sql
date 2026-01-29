-- Add milestone connection to todos
ALTER TABLE "todos" ADD COLUMN IF NOT EXISTS "milestoneId" TEXT;
ALTER TABLE "todos" ADD COLUMN IF NOT EXISTS "aiGenerated" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "todos" ADD COLUMN IF NOT EXISTS "aiContext" JSONB;

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'todos_milestoneId_fkey'
  ) THEN
    ALTER TABLE "todos" 
    ADD CONSTRAINT "todos_milestoneId_fkey" 
    FOREIGN KEY ("milestoneId") 
    REFERENCES "project_milestones"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS "todos_milestoneId_idx" ON "todos"("milestoneId");
CREATE INDEX IF NOT EXISTS "project_milestones_projectId_idx" ON "project_milestones"("projectId");
