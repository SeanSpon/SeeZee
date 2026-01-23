-- Add milestone connection to todos
ALTER TABLE "todos" ADD COLUMN "milestoneId" TEXT;
ALTER TABLE "todos" ADD COLUMN "aiGenerated" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "todos" ADD COLUMN "aiContext" JSONB;

-- Add foreign key constraint
ALTER TABLE "todos" ADD CONSTRAINT "todos_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "project_milestones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add indexes
CREATE INDEX "todos_milestoneId_idx" ON "todos"("milestoneId");
CREATE INDEX "project_milestones_projectId_idx" ON "project_milestones"("projectId");
