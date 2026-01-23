-- CreateEnum
CREATE TYPE "TaskMaterialType" AS ENUM ('PDF', 'DOCUMENT', 'VIDEO', 'IMAGE', 'LINK', 'ASSIGNMENT', 'RESOURCE');

-- CreateTable
CREATE TABLE "task_materials" (
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
CREATE INDEX "task_materials_todoId_idx" ON "task_materials"("todoId");

-- CreateIndex
CREATE INDEX "task_materials_type_idx" ON "task_materials"("type");

-- CreateIndex
CREATE INDEX "task_materials_createdById_idx" ON "task_materials"("createdById");

-- AddForeignKey
ALTER TABLE "task_materials" ADD CONSTRAINT "task_materials_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "todos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
