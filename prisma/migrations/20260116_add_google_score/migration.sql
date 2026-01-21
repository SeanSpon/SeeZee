-- Add googleScore field to Prospect table
-- This field stores the Google rating/reviews component (0-5 points) of the lead score

ALTER TABLE "prospects" ADD COLUMN IF NOT EXISTS "googleScore" INTEGER;

-- Optional: Recalculate scores for existing prospects
-- This can be done via the API endpoint: POST /api/prospects/recalculate-all
