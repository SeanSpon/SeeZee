# 🚀 Deploying SeeZee to Vercel with Custom Domain

## ✅ Prerequisites Completed
- ✓ Vercel configuration file created
- ✓ Production environment variables template ready

---

## 📋 STEP 1: Update Google OAuth Settings

**CRITICAL**: Google OAuth will NOT work until you add your production domain!

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your project
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized JavaScript origins**, add:
   ```
   https://your-domain.com
   ```
5. Under **Authorized redirect URIs**, add:
   ```
   https://your-domain.com/api/auth/callback/google
   ```
6. Click **SAVE**

---

## 📋 STEP 2: Install Vercel CLI

Run this command in PowerShell:
```powershell
npm install -g vercel
```

---

## 📋 STEP 3: Login to Vercel

```powershell
vercel login
```

This will open your browser - login with your Vercel account (or create one).

---

## 📋 STEP 4: Deploy to Vercel

From your project directory, run:
```powershell
vercel
```

When prompted:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No (or Yes if you already have one)
- **Project name?** → seezee (or press Enter)
- **Directory?** → Press Enter (current directory)
- **Override settings?** → No

---

## 📋 STEP 5: Add Environment Variables to Vercel

After deployment, add these environment variables in Vercel Dashboard:

1. Go to https://vercel.com/dashboard
2. Select your project `seezee`
3. Go to **Settings** → **Environment Variables**
4. Add each variable from `.env.production.example`:

### Required Variables:
```
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret-here
AUTH_SECRET=your-auth-secret-here

DATABASE_URL=postgresql://user:password@host/database?sslmode=require

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
AUTH_GOOGLE_ID=your-google-client-id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=your-google-client-secret

AUTH_TRUST_HOST=true
NEXTAUTH_TRUST_HOST=true

NEXT_PUBLIC_DOMAIN=your-domain.com
NODE_ENV=production
```

---

## 📋 STEP 6: Add Custom Domain in Vercel

1. In your Vercel project, go to **Settings** → **Domains**
2. Click **Add Domain**
3. Enter: `your-domain.com`
4. Vercel will provide DNS records

---

## 📋 STEP 7: Configure DNS (at your domain registrar)

Add these DNS records where you bought your domain:

**For root domain:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Note**: DNS changes can take up to 48 hours, but usually work within 10-30 minutes.

---

## 📋 STEP 8: Deploy to Production

After adding environment variables and domain:
```powershell
vercel --prod
```

---

## 🎉 You're Done!

Your app will be live at:
- https://your-domain.com
- https://www.your-domain.com

### Test Your Deployment:
1. Visit https://your-domain.com
2. Try logging in with Google OAuth
3. Check the admin dashboard at https://your-domain.com/admin

---

## 🔧 Troubleshooting

### Google OAuth Not Working?
- Double-check you added the URLs to Google Cloud Console
- Make sure environment variables are set in Vercel
- Redeploy: `vercel --prod`

### Domain Not Working?
- Check DNS propagation: https://www.whatsmydns.net
- Verify DNS records are correct
- Wait 10-30 minutes for DNS to propagate

### Build Errors?
- Check build logs in Vercel Dashboard
- Make sure all environment variables are set
- Try rebuilding: Go to Deployments → Click "..." → Redeploy

---

## 🔄 Redeploying After Changes

Whenever you make code changes:

```powershell
git add .
git commit -m "Your commit message"
git push origin development
vercel --prod
```

Or just run:
```powershell
vercel --prod
```

Vercel will automatically deploy when you push to your connected Git repository.
