-- Expand only: existing submissions and legacy request tables are preserved.
ALTER TABLE "leads" ADD COLUMN "submissionKey" TEXT;
CREATE UNIQUE INDEX "leads_submissionKey_key" ON "leads"("submissionKey");
ALTER TABLE "project_requests" ADD COLUMN "leadId" TEXT;
CREATE UNIQUE INDEX "project_requests_leadId_key" ON "project_requests"("leadId");
ALTER TABLE "project_requests" ADD CONSTRAINT "project_requests_leadId_fkey"
  FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "project_requests_userId_createdAt_idx" ON "project_requests"("userId", "createdAt");
CREATE INDEX "project_requests_contactEmail_idx" ON "project_requests"("contactEmail");
CREATE INDEX "project_requests_status_createdAt_idx" ON "project_requests"("status", "createdAt");
-- Link historical pairs only when email/time produce exactly one match on BOTH sides.
WITH candidates AS (
  SELECT r.id AS request_id, l.id AS lead_id,
    count(*) OVER (PARTITION BY r.id) AS requests_count,
    count(*) OVER (PARTITION BY l.id) AS leads_count
  FROM "project_requests" r JOIN "leads" l
    ON lower(trim(COALESCE(NULLIF(r."contactEmail", ''), r.email))) = lower(trim(l.email))
    AND abs(extract(epoch FROM (r."createdAt" - l."createdAt"))) < 60
    AND l.source IN ('Service Selection', 'Questionnaire', 'WEBSITE_INTAKE')
)
UPDATE "project_requests" r SET "leadId" = c.lead_id
FROM candidates c WHERE r.id = c.request_id AND c.requests_count = 1 AND c.leads_count = 1;

ALTER TABLE "project_requests" ADD COLUMN "projectId" TEXT;
ALTER TABLE "project_requests" ADD CONSTRAINT "project_requests_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "project_requests_projectId_idx" ON "project_requests"("projectId");
UPDATE "project_requests" r SET "projectId" = p.id, status = 'APPROVED'
FROM "projects" p WHERE r."leadId" = p."leadId" AND r."leadId" IS NOT NULL
AND r.status NOT IN ('REJECTED', 'ARCHIVED');
