# 🔧 UploadThing Error Fix

## The Error

```
Upload error: UploadThingError: Missing token. 
Please set the `UPLOADTHING_TOKEN` environment variable
```

## Quick Fix (2 minutes)

Since you already connected UploadThing earlier, you just need to **restart your dev server**:

### Windows (PowerShell):

1. **Stop the dev server:**
   - Press `Ctrl+C` in your terminal
   - If it doesn't stop, close the terminal window

2. **Restart:**
   ```powershell
   npm run dev
   ```

3. **Test the upload:**
   - Go to `/admin/client-tasks`
   - Click "Create Assignment"
   - Try uploading a file

## Verification Steps

### 1. Check Your .env File

Make sure `.env` (not `.env.example`) contains:

```bash
UPLOADTHING_TOKEN=sk_live_xxxxxxxxxxxxx
```

### 2. Check Token Format

UploadThing tokens start with:
- `sk_live_` (production)
- `sk_test_` (development)

### 3. Verify Token is Valid

1. Go to https://uploadthing.com/dashboard
2. Check your API keys
3. Make sure the token is active

## If Still Not Working

### Option 1: Regenerate Token

1. Go to https://uploadthing.com/dashboard/settings/api-keys
2. Create a new API key
3. Copy the token (starts with `sk_live_` or `sk_test_`)
4. Update your `.env` file:
   ```bash
   UPLOADTHING_TOKEN=sk_live_your_new_token_here
   ```
5. Restart dev server

### Option 2: Check Environment Variable

Run this in PowerShell to verify the token is loaded:

```powershell
# Check if the variable exists
node -e "console.log('Token exists:', !!process.env.UPLOADTHING_TOKEN)"
```

### Option 3: Hard Reset

```powershell
# Stop dev server (Ctrl+C)

# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Restart
npm run dev
```

## Production Deployment

When deploying to Vercel, make sure to add the environment variable:

1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add:
   - **Name:** `UPLOADTHING_TOKEN`
   - **Value:** `sk_live_xxxxxxxxxxxxx`
   - **Environment:** Production, Preview, Development
4. Redeploy

## Common Issues

### Issue: Token in .env but still getting error

**Solution:** Environment variables are only loaded when the dev server starts. Always restart after changing .env.

### Issue: Works locally but not in production

**Solution:** Add the token to Vercel environment variables.

### Issue: Getting 401 Unauthorized

**Solution:** Token might be expired. Generate a new one from UploadThing dashboard.

## File Upload Limits

Current limits in your app:

- **PDFs:** 32MB max, 10 files
- **Images:** 8MB max, 10 files  
- **Videos:** 64MB max, 5 files
- **Other files:** 32MB max, 10 files

## Test Upload

Once fixed, try uploading:

1. Go to `/admin/client-tasks`
2. Click "Create Assignment"
3. Fill in the form
4. Click "Attach Files" section
5. Upload a test file (PDF or image)
6. Should see green checkmark ✅

## Where Files Are Used

UploadThing is used for:

- ✅ Client task attachments (what you just saw)
- ✅ Project files
- ✅ Training materials
- ✅ Resource documents
- ✅ Profile images

## Quick Test Command

Test if UploadThing is working:

```powershell
# In your project directory
node -p "process.env.UPLOADTHING_TOKEN ? 'Token is set ✓' : 'Token is missing ✗'"
```

---

**TL;DR:** Restart your dev server with `Ctrl+C` then `npm run dev` 🔄
