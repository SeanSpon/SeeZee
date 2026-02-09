-- Add monthlyRecurringRevenue field to projects table for custom MRR tracking
ALTER TABLE "projects" ADD COLUMN "monthlyRecurringRevenue" DECIMAL(19,2);

-- Create index for MRR queries
CREATE INDEX "projects_monthlyRecurringRevenue_idx" ON "projects"("monthlyRecurringRevenue");
