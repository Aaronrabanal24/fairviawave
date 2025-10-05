# 🚨 VERCEL BUILD FIX - Quick Reference

## Current Issue
❌ **Build failing:** Missing environment variables during deployment

## ✅ Solution (3 Steps)

### Step 1: Add Environment Variables to Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Copy-paste these (one by one):

```bash
# Database
DATABASE_URL=postgresql://postgres.olrhqzvnqoymubturijo:X4BAJefzushZ0EJI@aws-1-us-west-1.pooler.supabase.com:5432/postgres

DIRECT_URL=postgresql://postgres:X4BAJefzushZ0EJI@db.olrhqzvnqoymubturijo.supabase.co:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://olrhqzvnqoymubturijo.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scmhxenZucW95bXVidHVyaWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MzM2MDgsImV4cCI6MjA3NTIwOTYwOH0.8ZkgIoeCU5tEJgOBID7zcXfmpgNfYQIdad-1KU99bX4

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scmhxenZucW95bXVidHVyaWpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTYzMzYwOCwiZXhwIjoyMDc1MjA5NjA4fQ.AsYgSOCZgSq1nE41ot25HT9NRn28yNqu8ySs5Vo22p4

# App Config
PUBLIC_BASE_URL=https://your-app-name.vercel.app
# ⬆️ Replace with your actual Vercel URL after you see it

INTERNAL_API_KEY=dev-internal-key
```

**Important:**
- Make sure to select **All environments** (Production, Preview, Development) when adding each variable
- Don't miss any variable!

---

### Step 2: Redeploy

After adding ALL variables:

1. Go to **Vercel → Deployments**
2. Find the failed deployment
3. Click **⋯** (three dots) → **Redeploy**

OR

```bash
# If you're using Vercel CLI
vercel --prod
```

OR

```bash
# Push a new commit to trigger auto-deploy
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

---

### Step 3: Update PUBLIC_BASE_URL

Once deployment succeeds:

1. Copy your Vercel URL (e.g., `https://fairviawave-abc123.vercel.app`)
2. Go back to **Vercel → Settings → Environment Variables**
3. Edit `PUBLIC_BASE_URL` variable
4. Replace with your actual Vercel URL
5. Redeploy one more time

---

## ✅ Verification

After successful deployment:

1. **Visit your Vercel URL** - should load the homepage
2. **Test login:** `/login` - enter email
3. **Check magic link** - click link from email
4. **Access dashboard** - should work after auth

---

## 🔐 Don't Forget!

After deployment works, update Supabase:

**Add to Supabase Auth Redirect URLs:**
- `https://your-vercel-url.vercel.app/auth/callback`

Go to: https://supabase.com/dashboard/project/olrhqzvnqoymubturijo/auth/url-configuration

---

## 📋 Checklist

- [ ] All 7 environment variables added to Vercel
- [ ] All variables set for "All environments"
- [ ] Redeployed after adding variables
- [ ] Build succeeded ✅
- [ ] Updated PUBLIC_BASE_URL with real URL
- [ ] Redeployed again
- [ ] Added Vercel URL to Supabase redirects
- [ ] Tested login flow
- [ ] Tested creating units
- [ ] Tested public timeline

---

**Status:** Follow these steps and your deployment will succeed! 🚀
