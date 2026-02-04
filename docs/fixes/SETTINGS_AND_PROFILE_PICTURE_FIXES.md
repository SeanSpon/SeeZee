# Settings & Profile Picture Fixes

## Issues Fixed

### 1. Settings Page API Response Handling ❌ → ✅

**Problem**: The settings page was not properly loading notification and user preferences because it expected data directly from the API, but the API routes were returning data wrapped in objects.

**Files Modified**:
- `src/app/settings/page.tsx`

**Changes**:
- Fixed `fetchNotificationPreferences()` to extract data from `data.preferences` instead of directly from `data`
- Fixed `fetchUserPreferences()` to extract data from `data.preferences` instead of directly from `data`

**Result**: Settings now properly load and save notification preferences and user preferences.

---

### 2. Profile Picture Not Showing in Navbar/Sidebar ❌ → ✅

**Root Cause**: The user's profile image is intentionally removed from the session (in `src/auth.ts` line 454-456) to prevent cookie bloat issues. This means `session.user.image` is always `undefined`.

**Solution**: Updated all components that display the user avatar to fetch the image separately from the `/api/user/me` endpoint using `useEffect`.

**Files Modified**:
1. `src/components/shared/Sidebar.tsx` - Main sidebar
2. `src/app/(client)/client/components/ClientSidebar.tsx` - Client portal sidebar
3. `src/components/navbar/ProfileMenu.tsx` - Profile dropdown menu
4. `src/components/admin/AdminAppShell.tsx` - Admin sidebar
5. `src/components/admin/Topbar.tsx` - Admin topbar

**Changes Made**:
Each component now:
- Has a `userImage` state variable
- Fetches the user image from `/api/user/me` on mount
- Displays the fetched image instead of relying on `user.image` from the session

**Code Pattern Applied**:
```typescript
const [userImage, setUserImage] = useState<string | null>(null);

useEffect(() => {
  fetch('/api/user/me')
    .then(res => res.json())
    .then((data) => {
      if (data?.image) {
        setUserImage(data.image);
      }
    })
    .catch((err) => {
      console.error('Failed to fetch user image:', err);
    });
}, []);
```

**Result**: Profile pictures now display correctly in:
- Bottom left of main sidebar
- Client portal sidebar
- Profile dropdown menu in navbar
- Admin sidebar (both expanded and collapsed states)
- Admin topbar

---

## Testing

To verify the fixes:

1. **Settings Page**:
   - Navigate to `/settings`
   - Click through all tabs (Profile, Account, Security, Notifications, Preferences, etc.)
   - Make changes and save - they should persist

2. **Profile Picture**:
   - Log in to your account
   - Check the bottom left of the sidebar - your profile picture should be visible
   - Upload a new profile picture in `/settings`
   - Refresh the page - the new picture should appear everywhere

---

## Technical Notes

### Why Remove Images from Session?

As documented in `SESSION_COOKIE_BLOAT_FIX.md`, profile images from OAuth providers can be 4-20KB in size, which causes session cookies to exceed the 4KB browser limit. This leads to:
- Chunked cookies (multiple cookies for one session)
- HTTP 431 errors (Request Header Fields Too Large)
- Authentication failures

**Solution**: Store only minimal data in the session JWT and fetch additional data (like profile images) on-demand via API calls.

### Performance Considerations

Each component that displays a profile picture makes one additional API call to `/api/user/me` on mount. This is acceptable because:
1. The endpoint is lightweight and fast
2. It only happens once per component mount
3. It prevents cookie bloat issues that would affect every request
4. The browser can cache the response

### Future Improvements

Consider implementing:
1. A global state management solution (like Zustand or Context) to share the user image across components
2. Invalidation/refresh of the image when updated in settings (without page reload)
3. Caching the image in localStorage with proper expiration

---

## Related Files

- `src/auth.ts` - Session configuration and image removal
- `src/app/api/user/me/route.ts` - Endpoint that provides user data including image
- `src/app/api/profile/route.ts` - Profile update endpoint
- `src/app/api/profile/upload-image/route.ts` - Image upload endpoint
- `SESSION_COOKIE_BLOAT_FIX.md` - Documentation of why images were removed from session

---

## Status: ✅ Complete

Both issues have been resolved and tested. No linting errors were introduced.
