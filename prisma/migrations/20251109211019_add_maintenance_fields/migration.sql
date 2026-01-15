-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "maintenancePlan" TEXT,
ADD COLUMN     "maintenanceStatus" TEXT,
ADD COLUMN     "nextBillingDate" TIMESTAMP(3);

