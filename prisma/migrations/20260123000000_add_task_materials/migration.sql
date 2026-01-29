-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "TaskMaterialType" AS ENUM ('PDF', 'DOCUMENT', 'VIDEO', 'IMAGE', 'LINK', 'ASSIGNMENT', 'RESOURCE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "task_materials" (
    "id" TEXT NOT NULL,
    "todoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "TaskMaterialType" NOT NULL,
    "fileUrl" TEXT,
    "linkUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "dueDate" TIMESTAMP(3),
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_materials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "task_materials_todoId_idx" ON "task_materials"("todoId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "task_materials_type_idx" ON "task_materials"("type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "task_materials_createdById_idx" ON "task_materials"("createdById");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'task_materials_todoId_fkey'
  ) THEN
    ALTER TABLE "task_materials" 
    ADD CONSTRAINT "task_materials_todoId_fkey" 
    FOREIGN KEY ("todoId") 
    REFERENCES "todos"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
