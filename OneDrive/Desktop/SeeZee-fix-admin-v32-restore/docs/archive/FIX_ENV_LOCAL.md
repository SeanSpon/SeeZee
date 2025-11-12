# Fix .env.local File - Remove EaLA= Encoding Issue

## Problem
Your `.env.local` file has `EaLA=` (or similar encoding) appended to the end of your environment variables, which breaks authentication.

## Solution

### Step 1: Open `.env.local` file
Open the file in your project root (same folder as `package.json`)

### Step 2: Clean up the file
Remove any `EaLA=` or encoding from the end of each variable. 

**Your file should look like this:**

```env
# Authentication
AUTH_URL=http://localhost:3000
AUTH_SECRET=your-secret-here-without-EaLA=
AUTH_GOOGLE_ID=your-google-client-id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=your-google-secret-here

# Database
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

### Step 3: Important Rules
1. **No quotes needed** - Don't wrap values in quotes unless they contain spaces
2. **No trailing spaces** - Make sure there's no space after the `=`
3. **No encoding** - Remove any `EaLA=` or similar encoding
4. **One per line** - Each variable on its own line
5. **No empty lines with `=`** - Don't have lines like `VARIABLE=`

### Step 4: Example of Correct Format

```env
AUTH_URL=http://localhost:3000
AUTH_SECRET=515546cd7937f580c385eaf823912cd180b2de751d2fe419612064d22c97565d
AUTH_GOOGLE_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
```

### Step 5: Restart Server
After fixing the file:
```bash
# Stop your dev server (Ctrl+C)
# Then restart it
npm run dev
```

## Common Issues

### Issue 1: Base64 Encoding
If you see `EaLA=` or similar base64-looking strings, remove them:
```env
# WRONG
AUTH_SECRET=mysecretEaLA=

# CORRECT
AUTH_SECRET=mysecret
```

### Issue 2: Extra Spaces
Remove spaces around the `=`:
```env
# WRONG
AUTH_URL = http://localhost:3000
AUTH_URL= http://localhost:3000
AUTH_URL =http://localhost:3000

# CORRECT
AUTH_URL=http://localhost:3000
```

### Issue 3: Quotes
Don't wrap values in quotes unless necessary:
```env
# WRONG
AUTH_URL="http://localhost:3000"
AUTH_SECRET='my-secret'

# CORRECT
AUTH_URL=http://localhost:3000
AUTH_SECRET=my-secret
```

### Issue 4: Line Endings
Make sure each variable is on its own line:
```env
# WRONG
AUTH_URL=http://localhost:3000AUTH_SECRET=secret

# CORRECT
AUTH_URL=http://localhost:3000
AUTH_SECRET=secret
```

## Verification

After fixing, verify your variables are correct:

1. Visit `/auth-check` to see if variables are loaded correctly
2. Check your terminal for any warnings about missing variables
3. Try signing in again

## If Still Not Working

1. Double-check for any hidden characters or encoding
2. Try recreating the file from scratch
3. Make sure the file is named exactly `.env.local` (not `.env.local.txt` or similar)
4. Verify the file is in the project root (same folder as `package.json`)


