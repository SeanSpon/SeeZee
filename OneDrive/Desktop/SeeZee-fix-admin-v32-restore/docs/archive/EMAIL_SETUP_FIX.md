# 🚨 Email Setup Fix - Gmail App Password Required

## Problem
You're getting a 500 Internal Server Error when trying to send invitation emails because:

**❌ You're using your regular Gmail password (`Trinity2026!!`)**  
**✅ Gmail requires an App Password for nodemailer**

## Solution: Generate Gmail App Password

### Step 1: Enable 2-Factor Authentication (if not already)
1. Go to https://myaccount.google.com/security
2. Find "2-Step Verification"
3. Enable it if not already enabled

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. **App name**: Enter `SeeZee Nodemailer`
3. Click "Create"
4. **Copy the 16-character password** (format: `xxxx xxxx xxxx xxxx`)

### Step 3: Update `.env.local`
Replace this line:
```env
EMAIL_PASS=Trinity2026!!
```

With your app password (remove spaces):
```env
EMAIL_PASS=xxxxxxxxxxxxxxxx
```

**Example** (yours will be different):
```env
EMAIL_PASS=abcdwxyzpqrs1234
```

### Step 4: Restart Dev Server
```bash
# Stop the dev server (Ctrl+C)
npm run dev
```

---

## Alternative: Use Resend Instead (Recommended for Production)

Gmail App Passwords work but have limitations. I can update the code to use **Resend** (which you already have configured):

**Current:**
```env
RESEND_API_KEY=re_9twxr144_L2ivtd4jBx1paEcKAQ8KuRAn
```

**Benefits of Resend:**
- ✅ No 2FA required
- ✅ Better deliverability
- ✅ Email analytics
- ✅ Production-ready
- ✅ Free tier: 3,000 emails/month

Would you like me to:
1. **Wait for you to set up Gmail App Password** (quick fix)
2. **Switch to Resend** (better long-term solution)

Let me know which you prefer!

---

## Current Error Details

**Terminal Error:**
```
:3000/api/invitations/code:1 Failed to load resource: 
the server responded with a status of 500 (Internal Server Error)
```

**Cause:**
Gmail is rejecting the login because:
- Using regular password instead of App Password
- Gmail requires OAuth2 or App Passwords for third-party apps

**Fix:** Follow steps above to generate App Password

---

## Testing After Fix

1. Go to `/admin/team`
2. Click "Invite Staff"
3. Enter email and select role
4. Click "Send Invitation"
5. ✅ Should see: "Invitation email sent to {email}! They'll receive a 6-digit code."
6. Check email inbox for invitation with 6-digit code

---

## Need Help?

If you continue getting errors after setting up App Password:
1. Check `.env.local` has correct `EMAIL_FROM` and `EMAIL_PASS`
2. Restart dev server completely
3. Check terminal for specific error messages
4. Let me know and I can switch to Resend instead
