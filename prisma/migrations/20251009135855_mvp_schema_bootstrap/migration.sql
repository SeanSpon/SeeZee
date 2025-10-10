/*
  Warnings:

  - The values [PROJECT_STATUS,INVOICE,PAYMENT,MILESTONE,GENERAL] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - The values [LEAD,QUOTED,ACCEPTED,IN_PROGRESS,REVIEW] on the enum `ProjectStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `mime_type` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `original_name` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `project_id` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `uploaded_by_id` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `client_id` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `due_date` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `org_id` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `paid_at` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `project_id` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `sent_at` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_invoice_id` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `tax_amount` on the `invoices` table. All the data in the column will be lost.
  - You are about to alter the column `total` on the `invoices` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the column `converted_at` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `estimated_value` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `project_type` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `qualified_at` on the `leads` table. All the data in the column will be lost.
  - The `status` column on the `leads` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `project_id` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `read_at` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `industry` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `failure_reason` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `invoice_id` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `processed_at` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_payment_id` on the `payments` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the column `base_price` on the `pricing_rules` table. All the data in the column will be lost.
  - You are about to drop the column `config` on the `pricing_rules` table. All the data in the column will be lost.
  - You are about to drop the column `hourly_rate` on the `pricing_rules` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `pricing_rules` table. All the data in the column will be lost.
  - You are about to drop the column `org_id` on the `pricing_rules` table. All the data in the column will be lost.
  - You are about to drop the column `tax_rate` on the `pricing_rules` table. All the data in the column will be lost.
  - You are about to drop the column `actualHours` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `client_id` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `created_by_id` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedHours` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `lead_id` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `org_id` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `phase` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `pricing_rule_id` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `progress` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_session_id` on the `projects` table. All the data in the column will be lost.
  - You are about to alter the column `budget` on the `projects` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the column `client_id` on the `signatures` table. All the data in the column will be lost.
  - You are about to drop the column `ip_address` on the `signatures` table. All the data in the column will be lost.
  - You are about to drop the column `project_id` on the `signatures` table. All the data in the column will be lost.
  - You are about to drop the column `signature` on the `signatures` table. All the data in the column will be lost.
  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `audit_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `maintenance_plans` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `milestones` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `org_memberships` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_assignments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `referrals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tasks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `team_memberships` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `teams` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[leadId]` on the table `projects` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mimeType` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalName` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dueDate` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoiceId` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `basePrice` to the `pricing_rules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceType` to the `pricing_rules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `documentId` to the `signatures` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signatureData` to the `signatures` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signerEmail` to the `signatures` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signerName` to the `signatures` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STAFF', 'CLIENT');

-- CreateEnum
CREATE TYPE "OrgRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'CONVERTED', 'LOST');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('IMAGE', 'DOCUMENT', 'VIDEO', 'OTHER');

-- CreateEnum
CREATE TYPE "VirusScanStatus" AS ENUM ('PENDING', 'CLEAN', 'INFECTED', 'ERROR');

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR');
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "NotificationType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ProjectStatus_new" AS ENUM ('PENDING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED');
ALTER TABLE "projects" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "projects" ALTER COLUMN "status" TYPE "ProjectStatus_new" USING ("status"::text::"ProjectStatus_new");
ALTER TYPE "ProjectStatus" RENAME TO "ProjectStatus_old";
ALTER TYPE "ProjectStatus_new" RENAME TO "ProjectStatus";
DROP TYPE "ProjectStatus_old";
ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_project_id_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "files" DROP CONSTRAINT "files_project_id_fkey";

-- DropForeignKey
ALTER TABLE "files" DROP CONSTRAINT "files_uploaded_by_id_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_org_id_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_project_id_fkey";

-- DropForeignKey
ALTER TABLE "maintenance_plans" DROP CONSTRAINT "maintenance_plans_org_id_fkey";

-- DropForeignKey
ALTER TABLE "milestones" DROP CONSTRAINT "milestones_project_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_project_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "org_memberships" DROP CONSTRAINT "org_memberships_org_id_fkey";

-- DropForeignKey
ALTER TABLE "org_memberships" DROP CONSTRAINT "org_memberships_user_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_invoice_id_fkey";

-- DropForeignKey
ALTER TABLE "pricing_rules" DROP CONSTRAINT "pricing_rules_org_id_fkey";

-- DropForeignKey
ALTER TABLE "project_assignments" DROP CONSTRAINT "project_assignments_project_id_fkey";

-- DropForeignKey
ALTER TABLE "project_assignments" DROP CONSTRAINT "project_assignments_team_id_fkey";

-- DropForeignKey
ALTER TABLE "project_assignments" DROP CONSTRAINT "project_assignments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_client_id_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_lead_id_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_org_id_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_pricing_rule_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_assignee_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_project_id_fkey";

-- DropForeignKey
ALTER TABLE "team_memberships" DROP CONSTRAINT "team_memberships_team_id_fkey";

-- DropForeignKey
ALTER TABLE "team_memberships" DROP CONSTRAINT "team_memberships_user_id_fkey";

-- DropForeignKey
ALTER TABLE "teams" DROP CONSTRAINT "teams_org_id_fkey";

-- AlterTable
ALTER TABLE "files" DROP COLUMN "mime_type",
DROP COLUMN "original_name",
DROP COLUMN "project_id",
DROP COLUMN "uploaded_by_id",
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "originalName" TEXT NOT NULL,
ADD COLUMN     "projectId" TEXT,
ADD COLUMN     "scanResult" TEXT,
ADD COLUMN     "type" "FileType" NOT NULL,
ADD COLUMN     "uploadedById" TEXT,
ADD COLUMN     "virusScanStatus" "VirusScanStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "invoices" DROP COLUMN "client_id",
DROP COLUMN "due_date",
DROP COLUMN "notes",
DROP COLUMN "org_id",
DROP COLUMN "paid_at",
DROP COLUMN "project_id",
DROP COLUMN "sent_at",
DROP COLUMN "stripe_invoice_id",
DROP COLUMN "subtotal",
DROP COLUMN "tax_amount",
ADD COLUMN     "amount" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "description" TEXT,
ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "projectId" TEXT,
ADD COLUMN     "sentAt" TIMESTAMP(3),
ADD COLUMN     "stripeInvoiceId" TEXT,
ADD COLUMN     "tax" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "total" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "leads" DROP COLUMN "converted_at",
DROP COLUMN "estimated_value",
DROP COLUMN "notes",
DROP COLUMN "project_type",
DROP COLUMN "qualified_at",
ADD COLUMN     "convertedAt" TIMESTAMP(3),
ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "requirements" JSONB,
ADD COLUMN     "serviceType" TEXT,
ALTER COLUMN "message" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
ALTER COLUMN "source" SET DEFAULT 'website';

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "project_id",
DROP COLUMN "read_at",
DROP COLUMN "user_id",
ADD COLUMN     "read" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "type" SET DEFAULT 'INFO';

-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "industry",
DROP COLUMN "logo",
DROP COLUMN "size",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "billingEmail" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT DEFAULT 'US',
ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "taxId" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "failure_reason",
DROP COLUMN "invoice_id",
DROP COLUMN "processed_at",
DROP COLUMN "stripe_payment_id",
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "invoiceId" TEXT NOT NULL,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "stripeChargeId" TEXT,
ADD COLUMN     "stripePaymentId" TEXT,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "pricing_rules" DROP COLUMN "base_price",
DROP COLUMN "config",
DROP COLUMN "hourly_rate",
DROP COLUMN "is_active",
DROP COLUMN "org_id",
DROP COLUMN "tax_rate",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "basePrice" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "extendedMultiplier" DECIMAL(65,30) DEFAULT 0.9,
ADD COLUMN     "features" JSONB,
ADD COLUMN     "rushMultiplier" DECIMAL(65,30) DEFAULT 1.5,
ADD COLUMN     "serviceType" TEXT NOT NULL,
ADD COLUMN     "standardMultiplier" DECIMAL(65,30) DEFAULT 1.0,
ADD COLUMN     "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "validTo" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "actualHours",
DROP COLUMN "client_id",
DROP COLUMN "completedAt",
DROP COLUMN "created_by_id",
DROP COLUMN "estimatedHours",
DROP COLUMN "lead_id",
DROP COLUMN "org_id",
DROP COLUMN "phase",
DROP COLUMN "pricing_rule_id",
DROP COLUMN "progress",
DROP COLUMN "stripe_session_id",
ADD COLUMN     "assigneeId" TEXT,
ADD COLUMN     "leadId" TEXT,
ADD COLUMN     "organizationId" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING',
ALTER COLUMN "budget" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "signatures" DROP COLUMN "client_id",
DROP COLUMN "ip_address",
DROP COLUMN "project_id",
DROP COLUMN "signature",
ADD COLUMN     "documentId" TEXT NOT NULL,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "signatureData" TEXT NOT NULL,
ADD COLUMN     "signerEmail" TEXT NOT NULL,
ADD COLUMN     "signerName" TEXT NOT NULL,
ADD COLUMN     "userAgent" TEXT,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'CLIENT';

-- DropTable
DROP TABLE "audit_logs";

-- DropTable
DROP TABLE "maintenance_plans";

-- DropTable
DROP TABLE "milestones";

-- DropTable
DROP TABLE "org_memberships";

-- DropTable
DROP TABLE "project_assignments";

-- DropTable
DROP TABLE "referrals";

-- DropTable
DROP TABLE "tasks";

-- DropTable
DROP TABLE "team_memberships";

-- DropTable
DROP TABLE "teams";

-- DropEnum
DROP TYPE "ProjectPhase";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "TaskPriority";

-- DropEnum
DROP TYPE "TaskStatus";

-- DropEnum
DROP TYPE "TeamType";

-- CreateTable
CREATE TABLE "organization_members" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "OrgRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_milestones" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "rate" DECIMAL(65,30) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "invoiceId" TEXT NOT NULL,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "timeline" TEXT NOT NULL,
    "features" JSONB,
    "requirements" JSONB,
    "basePrice" DECIMAL(65,30) NOT NULL,
    "featurePrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "timelineMultiplier" DECIMAL(65,30) NOT NULL DEFAULT 1.0,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "tax" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL,
    "customerName" TEXT,
    "customerEmail" TEXT,
    "pricingRuleId" TEXT NOT NULL,
    "convertedToLead" BOOLEAN NOT NULL DEFAULT false,
    "convertedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_members_organizationId_userId_key" ON "organization_members"("organizationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_eventId_key" ON "webhook_events"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "projects_leadId_key" ON "projects"("leadId");

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_pricingRuleId_fkey" FOREIGN KEY ("pricingRuleId") REFERENCES "pricing_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signatures" ADD CONSTRAINT "signatures_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
