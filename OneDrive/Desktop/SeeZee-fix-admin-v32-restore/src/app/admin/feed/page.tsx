/**
 * Feed - Activity feed showing system events
 */

import { getActivityFeed, getUnreadActivityCount } from "@/server/actions";
import { ActivityFeedClient } from "@/components/admin/ActivityFeedClient";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const [feedResult, unreadResult] = await Promise.all([
    getActivityFeed({ limit: 100 }),
    getUnreadActivityCount(),
  ]);

  const activities = feedResult.success ? feedResult.activities : [];
  const unreadCount = unreadResult.success ? unreadResult.count : 0;

  return (
    <div className="h-full flex flex-col">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Activity Feed</h1>
        <p className="admin-page-subtitle">
          Real-time system events and notifications
          {unreadCount > 0 && (
            <span className="ml-3 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-sm">
              {unreadCount} unread
            </span>
          )}
        </p>
      </div>

      <div className="flex-1 mt-6 overflow-hidden">
        <ActivityFeedClient initialActivities={activities} />
      </div>
    </div>
  );
}


