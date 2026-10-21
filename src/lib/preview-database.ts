// Preview isolation for this review branch. No credentials are stored here.
// Use this Neon branch hostname (pooled or direct), never the production database.
const REVIEW_DATABASE_HOST =
  "ep-shy-boat-ad013m7s-pooler.c-2.us-east-1.aws.neon.tech";
export function previewDatabaseReady(
  env: Record<string, string | undefined> = process.env,
): boolean {
  if (env.VERCEL_ENV !== "preview") return true;
  try {
    const normalize = (host: string) => host.replace("-pooler.", ".");
    return (
      normalize(new URL(env.DATABASE_URL || "").hostname) ===
      normalize(REVIEW_DATABASE_HOST)
    );
  } catch {
    return false;
  }
}
