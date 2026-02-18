-- Migrate legacy tier names to current plan names
-- ESSENTIALS, DIRECTOR, COO → QUARTERLY (all mapped to the same plan)

UPDATE "MaintenancePlan" SET tier = 'QUARTERLY' WHERE tier IN ('ESSENTIALS', 'DIRECTOR', 'COO');
