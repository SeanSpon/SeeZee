-- Add change request and assignment fields to todos table
-- AlterTable
ALTER TABLE "todos" ADD COLUMN IF NOT EXISTS "changeRequestId" TEXT;
ALTER TABLE "todos" ADD COLUMN IF NOT EXISTS "assignedToRole" "UserRole";
ALTER TABLE "todos" ADD COLUMN IF NOT EXISTS "assignedToTeamId" TEXT;

-- CreateIndex (unique partial index - also serves as regular index)
CREATE UNIQUE INDEX IF NOT EXISTS "todos_changeRequestId_key" ON "todos"("changeRequestId") WHERE "changeRequestId" IS NOT NULL;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "todos_assignedToRole_idx" ON "todos"("assignedToRole");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "todos_assignedToTeamId_idx" ON "todos"("assignedToTeamId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'todos_changeRequestId_fkey'
  ) THEN
    ALTER TABLE "todos" 
    ADD CONSTRAINT "todos_changeRequestId_fkey" 
    FOREIGN KEY ("changeRequestId") 
    REFERENCES "change_requests"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
