-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('CLIENT', 'STAFF');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'CEO';
ALTER TYPE "UserRole" ADD VALUE 'DESIGNER';
ALTER TYPE "UserRole" ADD VALUE 'DEV';
ALTER TYPE "UserRole" ADD VALUE 'OUTREACH';
ALTER TYPE "UserRole" ADD VALUE 'INTERN';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "accountType" "AccountType" NOT NULL DEFAULT 'STAFF',
ADD COLUMN     "company" TEXT,
ADD COLUMN     "invitedById" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profileDoneAt" TIMESTAMP(3),
ADD COLUMN     "tosAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "tosVersion" TEXT,
ADD COLUMN     "twofaEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twofaSecret" TEXT,
ALTER COLUMN "role" SET DEFAULT 'STAFF';

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "token" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "redeemedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "invitations"("token");

-- CreateIndex
CREATE INDEX "invitations_email_idx" ON "invitations"("email");

-- CreateIndex
CREATE INDEX "invitations_token_idx" ON "invitations"("token");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
