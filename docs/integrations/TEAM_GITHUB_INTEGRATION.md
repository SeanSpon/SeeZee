# Team GitHub Activity Integration

## Overview

The admin dashboard now displays real-time GitHub activity for all team members, showing commits, pull requests, issues, and more.

## Features

### 1. **Team Activity Feed**
- Real-time feed of all team GitHub activity
- Filter by individual team member or view combined feed
- Visual indicators for different event types (commits, PRs, issues, etc.)
- Time-ago formatting for recent activity

### 2. **Statistics Dashboard**
- Commits today across all team members
- Weekly commit count
- Total repository stars
- Individual and combined team metrics

### 3. **User Profiles**
Currently tracking:
- **Sean** (SeanSpon)
- **Zach** (zrobards)

## Setup Instructions

### 1. Create GitHub Personal Access Token

1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select the following scopes:
   - `repo` - Full control of private repositories
   - `read:user` - Read user profile data
   - `read:org` - Read org and team membership (if tracking org activity)
4. Copy the generated token

### 2. Add to Environment Variables

Add the following to your `.env` file:

```env
GITHUB_TOKEN=ghp_your_personal_access_token_here
GITHUB_USERNAME=SeanSpon
```

### 3. Deploy to Production

In Vercel (or your hosting platform):

1. Go to **Settings > Environment Variables**
2. Add `GITHUB_TOKEN` with your token value
3. Redeploy the application

## Component Architecture

### Components

1. **`TeamGitActivity.tsx`**
   - Main component displaying team Git activity
   - Located at: `src/components/admin/dashboard/TeamGitActivity.tsx`
   - Features:
     - User filtering (All Team, Sean, Zach)
     - View toggle (Feed vs Stats)
     - Real-time refresh
     - Activity feed with icons and formatting

2. **`GitDashboard.tsx`**
   - Full Git dashboard with detailed stats
   - Located at: `src/components/admin/git/GitDashboard.tsx`
   - Used in dedicated `/admin/git` page

### API Routes

1. **`/api/integrations/github/activity`**
   - Fetches GitHub events for a specific user
   - Parameters: `username`, `per_page`
   - Returns: events, repos, stats

2. **`/api/admin/git/stats`**
   - Comprehensive Git statistics
   - Returns: commits, PRs, issues, rate limits, repo activity

## Usage

### Dashboard Integration

The Team GitHub Activity widget is automatically displayed on the admin dashboard at the top of the main content area.

**Features:**
- Click user tabs to filter by team member
- Toggle between Feed and Stats views
- Click refresh to update activity
- Click on activity items to view on GitHub

### Full Git Dashboard

Access the full Git dashboard at `/admin/git` for:
- Detailed commit history
- Repository browsing
- Pull request tracking
- Workflow status
- Issue management

## Rate Limits

GitHub API has rate limits:
- **Without token**: 60 requests per hour
- **With token**: 5,000 requests per hour

The application caches requests for 60 seconds to minimize API calls.

## Adding New Team Members

To track additional team members:

1. Edit `src/components/admin/dashboard/TeamGitActivity.tsx`
2. Add to the `TEAM_MEMBERS` array:

```typescript
const TEAM_MEMBERS: GitHubUser[] = [
  {
    username: "SeanSpon",
    displayName: "Sean",
    profileUrl: "https://github.com/SeanSpon",
  },
  {
    username: "zrobards",
    displayName: "Zach",
    profileUrl: "https://github.com/zrobards",
  },
  // Add new member here
  {
    username: "github_username",
    displayName: "Display Name",
    profileUrl: "https://github.com/github_username",
  },
];
```

## Troubleshooting

### Activity Not Showing

1. **Check GitHub Token**
   - Verify `GITHUB_TOKEN` is set in environment variables
   - Ensure token has correct permissions
   - Check token hasn't expired

2. **Rate Limit Issues**
   - Check the rate limit indicator in the Git Dashboard
   - Add or refresh your GitHub token
   - Wait for rate limit to reset

3. **User Not Found**
   - Verify GitHub username is correct
   - Ensure user profile is public or token has access

### Debugging

Check browser console and server logs for:
```
[TeamGitActivity] Error: ...
[GET /api/integrations/github/activity] ...
```

## Future Enhancements

Potential improvements:
- Team contribution graphs
- Code review statistics
- Commit heatmap visualization
- PR merge time analytics
- Issue resolution tracking
- Multi-organization support
- Webhook integration for real-time updates
- Detailed code statistics (lines added/removed)

## Related Files

- `src/components/admin/dashboard/TeamGitActivity.tsx` - Main component
- `src/components/admin/git/GitDashboard.tsx` - Full dashboard
- `src/app/api/integrations/github/activity/route.ts` - API endpoint
- `src/app/api/admin/git/stats/route.ts` - Stats endpoint
- `src/lib/git/github-service.ts` - GitHub API service
- `src/app/admin/git/page.tsx` - Full Git page

## Security Notes

⚠️ **Important Security Considerations:**

1. Never commit `.env` files with real tokens
2. Store tokens securely in environment variables
3. Use tokens with minimal required permissions
4. Rotate tokens periodically
5. Consider using GitHub Apps for production (more secure than personal tokens)

## Support

For issues or questions, contact the development team or create an issue in the repository.
