-- CreateEnum
CREATE TYPE "DriveDocCategory" AS ENUM ('CONTRACT', 'PROPOSAL', 'DESIGN', 'INVOICE', 'LEGAL', 'MEETING_NOTES', 'CLIENT_ASSETS', 'OTHER');

-- CreateTable
CREATE TABLE "onboarding_paths" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_steps" (
    "id" TEXT NOT NULL,
    "onboardingPathId" TEXT NOT NULL,
    "trainingId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "onboarding_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drive_documents" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "driveFileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "webViewLink" TEXT NOT NULL,
    "iconLink" TEXT,
    "thumbnailLink" TEXT,
    "category" "DriveDocCategory" NOT NULL DEFAULT 'OTHER',
    "tags" TEXT[],
    "notes" TEXT,
    "addedById" TEXT NOT NULL,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drive_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_paths_toolId_key" ON "onboarding_paths"("toolId");

-- CreateIndex
CREATE UNIQUE INDEX "drive_documents_driveFileId_key" ON "drive_documents"("driveFileId");

-- AddForeignKey
ALTER TABLE "onboarding_paths" ADD CONSTRAINT "onboarding_paths_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_steps" ADD CONSTRAINT "onboarding_steps_onboardingPathId_fkey" FOREIGN KEY ("onboardingPathId") REFERENCES "onboarding_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_steps" ADD CONSTRAINT "onboarding_steps_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drive_documents" ADD CONSTRAINT "drive_documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
