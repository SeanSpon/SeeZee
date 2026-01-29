-- CreateEnum
CREATE TYPE "ProjectTeamType" AS ENUM ('INDIVIDUAL', 'TEAM_LEAD');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "teamType" "ProjectTeamType" NOT NULL DEFAULT 'INDIVIDUAL';
