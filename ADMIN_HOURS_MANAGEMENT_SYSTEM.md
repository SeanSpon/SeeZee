# Admin Hours Management System

## Overview
A comprehensive system for admins to manage client hours, packages, and maintenance plans. This system allows you to grant hours manually, adjust existing packages, and view detailed hours breakdowns for all clients.

## Features

### 1. **Hours Management Dashboard** (`/admin/hours`)
A bird's-eye view of all client hours across the platform.

**Features:**
- Overview statistics (total plans, available hours, hours used, hour packs, expiring hours)
- Searchable and filterable client list
- Sort by name, available hours, or usage percentage
- Quick access to individual client management
- Visual health indicators for each client's hour status

**Access:** Admin → Financial → Hours & Packages

### 2. **Individual Client Hours Management** (`/admin/clients/[id]` → Hours Tab)
Detailed hours management for individual clients.

**Features:**
- **Grant Hours**: Manually give clients hour packs
  - Choose pack type (Starter, Growth, Scale, Premium, Complimentary, Custom)
  - Set expiration date or make hours never expire
  - Add cost and notes
  - Creates activity logs and maintenance records

- **Adjust Hours**: Modify existing hour packs
  - Add or remove hours from existing packs
  - Requires reason for adjustment
  - Full audit trail

- **View Details**: Comprehensive hours breakdown
  - Monthly hours (included vs used)
  - Hour packs (active and expired)
  - Rollover hours
  - Plan details and status

**Access:** Admin → Clients → [Select Client] → Hours & Packages Tab

### 3. **API Endpoints**

#### Grant Hours
```
POST /api/admin/clients/[clientId]/hours/grant
```

**Body:**
```json
{
  "projectId": "string",
  "hours": number,
  "packType": "SMALL" | "MEDIUM" | "LARGE" | "PREMIUM" | "COMPLIMENTARY" | "CUSTOM",
  "expirationDays": number | null,
  "cost": number (in cents),
  "notes": "string"
}
```

**What it does:**
1. Creates a maintenance plan if client doesn't have one
2. Creates a new hour pack with specified parameters
3. Logs the activity in the admin activity feed
4. Creates a maintenance log entry
5. Returns the created hour pack details

#### Adjust Hours
```
PATCH /api/admin/clients/[clientId]/hours/adjust
```

**Body:**
```json
{
  "hourPackId": "string",
  "adjustment": number (positive to add, negative to remove),
  "reason": "string"
}
```

**What it does:**
1. Updates both total hours and remaining hours
2. Deactivates pack if hours reach zero
3. Creates activity log
4. Creates maintenance log entry
5. Returns updated hour pack details

#### Fetch Hours Data
```
GET /api/admin/clients/[clientId]/hours?projectId=[projectId]
```

**Returns:**
- Maintenance plan details
- All active hour packs
- Rollover hours records
- Usage statistics

## Hour Pack Types

| Type | Default Hours | Description |
|------|--------------|-------------|
| SMALL | 5 | Starter Pack - Small projects |
| MEDIUM | 10 | Growth Pack - Medium projects |
| LARGE | 20 | Scale Pack - Large projects |
| PREMIUM | 40 | Premium Reserve - Enterprise clients |
| COMPLIMENTARY | Custom | Free hours (goodwill, corrections) |
| CUSTOM | Custom | Any custom amount |

## Expiration Options

- **30 Days**: Short-term hours
- **60 Days**: Standard expiration
- **90 Days**: Quarterly alignment
- **180 Days**: Half-year validity
- **1 Year**: Annual validity
- **Never Expires**: Permanent hours (use for special cases)

## Usage Flow

### Granting Hours to a Client

1. Navigate to **Admin → Clients**
2. Select the client
3. Go to **Hours & Packages** tab
4. Click **"Grant Hours"** button
5. Fill in the form:
   - Hours to grant
   - Pack type
   - Expiration period
   - Cost (0 for complimentary)
   - Notes (optional but recommended)
6. Click **"Grant Hours"**
7. Hours are immediately available to the client

### Adjusting Existing Hours

1. Navigate to client's Hours & Packages tab
2. Find the hour pack in the table
3. Click the edit icon
4. Enter adjustment amount:
   - Positive number to add hours
   - Negative number to remove hours
5. Add a reason (required)
6. Click **"Adjust Hours"**

### Viewing All Client Hours

1. Navigate to **Admin → Financial → Hours & Packages**
2. Use search to find specific clients
3. Filter by tier or status
4. Sort by hours available, name, or usage
5. Click **"Manage"** to go to client's hours page

## Important Notes

### Hours Deduction Priority
Hours are automatically deducted in this order:
1. **Monthly Hours** (included in plan)
2. **Rollover Hours** (from previous months)
3. **Hour Packs** (expiring soonest first)
4. **On-Demand** (if enabled, billed separately)

### Complimentary Hours
- Use `COMPLIMENTARY` pack type for free hours
- Set cost to $0
- Always add notes explaining why hours were granted
- Useful for:
  - Goodwill gestures
  - Error corrections
  - Special promotions
  - Beta testing rewards

### Automatic Features
- **Activity Logging**: All grants and adjustments are logged
- **Maintenance Records**: Full audit trail in maintenance logs
- **Client Notifications**: Clients can see their hours in real-time
- **Expiration Tracking**: System tracks and warns about expiring hours

## Security

- Only users with `ADMIN`, `CEO`, `CFO`, or `STAFF` roles can access
- All actions are logged with user ID
- Cannot grant negative hours
- Cannot adjust hours to negative values
- Full audit trail for compliance

## Client Dashboard Integration

Clients can view their hours balance in:
- **Dashboard home** (if they have a maintenance plan)
- **Hours Bank** component (detailed breakdown)
- Automatic refresh when purchasing hours
- Real-time updates when hours are granted by admin

## Future Enhancements

Potential future features:
- Bulk hour grants to multiple clients
- Scheduled hour grants (e.g., monthly bonuses)
- Hour pack templates for quick grants
- Export hours reports to CSV
- Client hour usage analytics and trends
- Automated hour pack recommendations based on usage

## Troubleshooting

### Client doesn't see granted hours
1. Check if the project has a maintenance plan (system creates one automatically)
2. Verify the hour pack is marked as `isActive: true`
3. Check expiration date hasn't passed
4. Ask client to refresh their dashboard

### Cannot grant hours
1. Verify you have admin role
2. Check that projectId is valid
3. Ensure hours amount is greater than 0
4. Verify client organization exists

### Hour pack not showing in table
1. Check if pack is still active (`isActive: true`)
2. Verify it hasn't expired
3. Check if hours remaining is greater than 0

## Technical Details

### Database Schema

**HourPack Model:**
- `id`: Unique identifier
- `planId`: Reference to MaintenancePlan
- `packType`: Type of pack (SMALL, MEDIUM, etc.)
- `hours`: Total hours in pack
- `hoursRemaining`: Unused hours
- `cost`: Cost in cents
- `purchasedAt`: Purchase date
- `expiresAt`: Expiration date (null for never)
- `neverExpires`: Boolean flag
- `stripePaymentId`: Payment reference (or admin grant ID)
- `isActive`: Whether pack is still usable

### Components

1. **ClientHoursManager** (`src/components/admin/ClientHoursManager.tsx`)
   - Main hours management interface
   - Grant and adjust modals
   - Hour packs table
   - Statistics cards

2. **HoursOverviewClient** (`src/app/admin/hours/HoursOverviewClient.tsx`)
   - Overview dashboard
   - Search and filtering
   - Statistics overview
   - Quick navigation

## Success Indicators

You'll know the system is working when:
- ✅ Admins can grant hours without payment
- ✅ Hour adjustments reflect immediately
- ✅ Activity feed shows all hour-related actions
- ✅ Clients see updated hours in their dashboard
- ✅ Hour packs expire correctly
- ✅ Full audit trail is maintained

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify API responses in Network tab
3. Check database records directly
4. Review activity logs for the operation
5. Ensure all migrations are run

---

**Created**: January 2026
**Version**: 1.0
**Status**: Production Ready ✅
