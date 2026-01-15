import { redirect } from 'next/navigation';

/**
 * Nonprofit Tiers route - Redirects to /start
 * We now use a simplified hour-based pricing model instead of nonprofit tiers
 */
export default function NonprofitTiersPage() {
  redirect('/start');
}
