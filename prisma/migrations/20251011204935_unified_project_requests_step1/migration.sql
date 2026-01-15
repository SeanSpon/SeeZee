/*
  Warnings:

  - The `budget` column on the `project_requests` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `project_requests` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEWING', 'NEEDS_INFO', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BudgetTier" AS ENUM ('UNKNOWN', 'MICRO', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('WEB_APP', 'WEBSITE', 'ECOMMERCE', 'AI_DATA', 'MOBILE', 'BRANDING', 'OTHER');

-- AlterTable
ALTER TABLE "project_requests" ADD COLUMN     "company" TEXT,
ADD COLUMN     "contactEmail" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "resourcesUrl" TEXT,
ADD COLUMN     "services" "ServiceType"[],
ADD COLUMN     "title" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "projectType" DROP NOT NULL,
ALTER COLUMN "goal" DROP NOT NULL,
ALTER COLUMN "timeline" DROP NOT NULL,
DROP COLUMN "budget",
ADD COLUMN     "budget" "BudgetTier" NOT NULL DEFAULT 'UNKNOWN',
DROP COLUMN "status",
ADD COLUMN     "status" "RequestStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "system_logs" ADD COLUMN     "area" TEXT,
ADD COLUMN     "message" TEXT,
ADD COLUMN     "meta" JSONB,
ADD COLUMN     "refId" TEXT;

-- CreateIndex
CREATE INDEX "system_logs_area_refId_idx" ON "system_logs"("area", "refId");

-- AddForeignKey
ALTER TABLE "project_requests" ADD CONSTRAINT "project_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
