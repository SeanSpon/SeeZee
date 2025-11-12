/**
 * Feed - Activity feed showing system events
 */

import { getActivityFeed, getUnreadActivityCount } from "@/server/actions";
import { ActivityFeedClient } from "@/components/admin/ActivityFeedClient";
import { AdminAppShell } from "@/components/admin/AdminAppShell";
import { getCurrentUser } from "@/lib/auth/requireRole";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  const [feedResult, unreadResult] = await Promise.all([
    getActivityFeed({ limit: 100 }),
    getUnreadActivityCount(),
  ]);

  const activities = feedResult.success ? feedResult.activities : [];
  const unreadCount = unreadResult.success ? unreadResult.count : 0;

  return (
    <AdminAppShell user={user}>
      <div className="h-full flex flex-col space-y-6">
        <header className="space-y-3 relative">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red glow-on-hover inline-block mb-2">
            Activity Monitor
          </span>
          <h1 className="text-4xl font-heading font-bold gradient-text">Activity Feed</h1>
          <p className="max-w-2xl text-base text-gray-300 leading-relaxed">
            Real-time system events and notifications
            {unreadCount > 0 && (
              <span className="ml-3 px-2.5 py-1 rounded-full bg-trinity-red/20 text-trinity-red border border-trinity-red/30 text-sm font-semibold">
                {unreadCount} unread
              </span>
            )}
          </p>
        </header>

        <div className="flex-1 overflow-hidden">
          <ActivityFeedClient initialActivities={activities} />
        </div>
      </div>
    </AdminAppShell>
  );
}


