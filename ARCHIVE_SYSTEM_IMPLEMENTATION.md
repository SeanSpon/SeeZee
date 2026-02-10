# Archive System & Leads Page Reorganization

## Overview
This document describes the implementation of a comprehensive archive system for tasks and projects, along with a streamlined leads page with better navigation.

## What Was Implemented

### 1. Database Schema Changes
Added archive functionality to Todo and Project models:

```prisma
model Todo {
  // ... existing fields
  archived   Boolean   @default(false)
  archivedAt DateTime?
  archivedBy String?
  @@index([archived])
}

model Project {
  // ... existing fields  
  archived   Boolean   @default(false)
  archivedAt DateTime?
  archivedBy String?
  @@index([archived])
}
```

**Migration Required**: Run `prisma db push` or `prisma migrate dev` to apply schema changes.

### 2. Archive Page (`/admin/archive`)
**Location**: `src/app/admin/archive/page.tsx`

Features:
- View all archived tasks and projects in separate tabs
- Display full metadata including archive date and user
- Restore archived items back to active state
- Permanently delete archived items
- Clean, modern UI with motion animations

**Component**: `src/components/admin/ArchiveClient.tsx`
- Tabs for Tasks and Projects
- Restore and Delete buttons for each item
- Loading states and error handling
- Date formatting and metadata display

### 3. Archive API Endpoints

#### Tasks Archive Endpoint
**Location**: `src/app/api/tasks/[id]/archive/route.ts`

```
POST /api/tasks/{id}/archive
Body: { archived: true/false }
```

- Archive or restore a task
- Updates `archived`, `archivedAt`, `archivedBy` fields
- Creates activity log entry
- Returns properly serialized task with dates as ISO strings
- Staff-only access with role checks

#### Projects Archive Endpoint
**Location**: `src/app/api/projects/[id]/archive/route.ts`

```
POST /api/projects/{id}/archive
Body: { archived: true/false }
```

- Archive or restore a project
- Updates `archived`, `archivedAt`, `archivedBy` fields
- Creates activity log entry
- Returns properly serialized project with dates as ISO strings
- Staff-only access with role checks

### 4. Kanban Board Drag-to-Archive
**Location**: `src/components/admin/tasks/TasksKanbanBoard.tsx`

Features:
- Added "Archive" drop zone at bottom of kanban board
- Drag any task to archive zone to archive it
- Confirmation dialog: "Archive this task? You can restore it from the Archive page."
- Task removed from board on successful archive
- Link to Archive page displayed above drop zone
- Visual feedback with red border on archive zone

**Technical Details**:
- Added "archive" to COLUMNS array
- Special handling in `handleDragEnd` for archive column
- Calls `/api/tasks/{id}/archive` endpoint
- Removes task from local state on success
- Prevents accidental archiving with confirmation

### 5. Updated getTasks Function
**Location**: `src/server/actions/tasks.ts`

Changed default behavior to exclude archived tasks:
```typescript
// Exclude archived tasks by default
where.archived = false;
```

This ensures archived tasks don't appear in:
- Task lists
- Kanban boards
- Dashboard widgets
- Search results

### 6. Streamlined Leads Page
**Location**: `src/app/admin/leads/page.tsx`

**Before**: 446 lines with cluttered analytics and feature descriptions
**After**: ~270 lines with clean, focused navigation

Changes:
- Removed verbose analytics (moved to separate "Full Analytics" link)
- Created card-based action grid for main features
- Added Client Portal Integration section with links to:
  - Client Dashboard (`/start`)
  - Projects
  - Archive
  - Related Tasks
- Moved system capabilities to compact feature list
- Made Quick Start Guide collapsible
- Improved visual hierarchy and spacing

**Old Version**: Backed up as `src/app/admin/leads/page-old-backup.tsx`

## User Workflows

### Archiving a Task

#### From Kanban Board:
1. Navigate to Tasks page with Kanban view
2. Drag task card to "Archive" zone at bottom
3. Confirm archiving in dialog
4. Task disappears from board

#### From Archive Page:
1. Navigate to `/admin/archive`
2. Click "Tasks" tab
3. Click "Restore" button on any task
4. Task returns to active state

### Viewing Archived Items
1. Navigate to `/admin/archive`
2. Switch between Tasks and Projects tabs
3. See all archived items with dates
4. Restore or permanently delete as needed

### Navigating Leads System
1. Go to `/admin/leads`
2. Use action cards to:
   - Discover new prospects
   - Manage existing prospects
   - Create email campaigns
   - Find clients
   - Manage emails
   - View related tasks
3. Access Archive from Client Portal Integration section
4. View full analytics via "Full Analytics" link

## Integration Points

### Archive Links Added To:
1. **Leads Page**: Client Portal Integration section
2. **Kanban Board**: Helper text above archive zone
3. **Admin Navigation**: (ready for addition)

### API Endpoints Used:
- `POST /api/tasks/{id}/archive` - Archive/restore tasks
- `POST /api/projects/{id}/archive` - Archive/restore projects
- `DELETE /api/tasks/{id}` - Permanently delete task
- `DELETE /api/projects/{id}` - Permanently delete project

### Database Queries Modified:
- `getTasks()` - Now excludes archived by default
- Archive page - Queries archived items only

## Security & Permissions

All archive operations require:
- Active authenticated session
- Staff role (CEO, ADMIN, CFO, STAFF, DEV, DESIGNER, FRONTEND, BACKEND)
- Role check via `isStaffRole()` function

Activity logs created for all archive/restore actions (non-blocking).

## Testing Checklist

After database migration:
- [ ] View `/admin/archive` page
- [ ] Archive a task via Kanban board drag
- [ ] Verify task appears in archive page
- [ ] Restore task from archive page
- [ ] Verify task reappears in task list
- [ ] Archive a project via API
- [ ] View archived project in archive page
- [ ] Test permanent deletion (with caution!)
- [ ] Verify archived items don't appear in regular lists
- [ ] Check leads page loads correctly
- [ ] Test all action card links on leads page

## Files Modified

### New Files:
- `src/app/admin/archive/page.tsx` - Archive page
- `src/components/admin/ArchiveClient.tsx` - Archive UI component
- `src/app/api/tasks/[id]/archive/route.ts` - Task archive endpoint
- `src/app/api/projects/[id]/archive/route.ts` - Project archive endpoint
- `src/app/admin/leads/page-old-backup.tsx` - Backup of old leads page

### Modified Files:
- `prisma/schema.prisma` - Added archive fields
- `src/app/admin/leads/page.tsx` - Simplified and reorganized
- `src/server/actions/tasks.ts` - Exclude archived tasks
- `src/components/admin/tasks/TasksKanbanBoard.tsx` - Drag-to-archive

## Future Enhancements

Possible additions:
- Bulk archive operations
- Auto-archive completed tasks after X days
- Archive for other entities (Leads, Prospects, etc.)
- Archive statistics and analytics
- Search within archived items
- Export archived items
- Archive retention policies

## Notes

- Archive is a "soft delete" - data remains in database
- Permanent deletion is available but requires confirmation
- All dates are properly serialized to ISO strings in API responses
- Activity logs are non-blocking to prevent operation failures
- Old leads page preserved as backup for reference
