# 🚀 Vercel Deployment Guide

## ✅ Current Status

Your app is being deployed to Vercel! The dependencies are installing successfully.

## 📋 Post-Deployment Checklist

### 1. ⚙️ Configure Environment Variables in Vercel

Once deployment completes, go to your Vercel project settings and add these environment variables:

**Database:**
```
DATABASE_URL=postgresql://postgres.olrhqzvnqoymubturijo:X4BAJefzushZ0EJI@aws-1-us-west-1.pooler.supabase.com:5432/postgres
DIRECT_URL=postgresql://postgres:X4BAJefzushZ0EJI@db.olrhqzvnqoymubturijo.supabase.co:5432/postgres
```

**Supabase:**
```
NEXT_PUBLIC_SUPABASE_URL=https://olrhqzvnqoymubturijo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scmhxenZucW95bXVidHVyaWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MzM2MDgsImV4cCI6MjA3NTIwOTYwOH0.8ZkgIoeCU5tEJgOBID7zcXfmpgNfYQIdad-1KU99bX4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scmhxenZucW95bXVidHVyaWpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTYzMzYwOCwiZXhwIjoyMDc1MjA5NjA4fQ.AsYgSOCZgSq1nE41ot25HT9NRn28yNqu8ySs5Vo22p4
```

**App Config:**
```
PUBLIC_BASE_URL=https://your-app.vercel.app
INTERNAL_API_KEY=dev-internal-key
```

**IMPORTANT:** Replace `https://your-app.vercel.app` with your actual Vercel deployment URL!

---

### 2. 🔐 Update Supabase Auth Configuration

After deployment, get your Vercel URL (e.g., `https://fairviawave.vercel.app`) and:

1. Go to [Supabase Auth Settings](https://supabase.com/dashboard/project/olrhqzvnqoymubturijo/auth/url-configuration)

2. **Update Site URL:**
   - Set to: `https://your-app.vercel.app`

3. **Add Redirect URLs:**
   - `https://your-app.vercel.app/auth/callback`
   - Keep existing: `http://localhost:3000/auth/callback`
   - Keep existing: `https://*.github.dev/auth/callback`

---

### 3. 🔄 Redeploy with Correct BASE_URL

After getting your Vercel URL:

1. Update `PUBLIC_BASE_URL` in Vercel environment variables
2. Trigger a new deployment (or wait for auto-deploy)

---

### 4. ✅ Test Production Deployment

Once deployed, test these workflows:

**Basic Test:**
- [ ] Visit your Vercel URL
- [ ] Homepage loads correctly
- [ ] Navigate to `/login`
- [ ] Request magic link
- [ ] Check email and click link
- [ ] Should redirect to `/dashboard`

**Full Workflow Test:**
- [ ] Login successfully
- [ ] Create a new unit
- [ ] Publish the unit
- [ ] Verify QR code generates
- [ ] Add inquiry event
- [ ] Add tour event
- [ ] Visit public timeline: `/api/units/[id]/timeline/public`
- [ ] Verify only public events shown

**API Test:**
```bash
# Test public timeline
curl https://your-app.vercel.app/api/units/[unit-id]/timeline/public

# Test internal timeline (should require API key)
curl https://your-app.vercel.app/api/units/[unit-id]/timeline/internal \
  -H "x-internal-api-key: dev-internal-key"
```

---

### 5. 🔒 Security Checklist

- [ ] All environment variables set in Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is NOT in NEXT_PUBLIC_ variables
- [ ] Supabase redirect URLs updated with production domain
- [ ] RLS policies enabled on database tables
- [ ] Test that unauthenticated users can't access `/dashboard`
- [ ] Test that public timeline only shows public events
- [ ] Test that internal timeline requires API key

---

### 6. 📊 Optional: Enable Monitoring

**Vercel Analytics:**
1. Go to your Vercel project → Analytics
2. Enable Web Analytics
3. Monitor real user metrics

**Error Tracking:**
Consider adding Sentry or similar:
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## 🐛 Troubleshooting Deployment Issues

### Build Fails

**Check:**
- All environment variables are set
- DATABASE_URL is correct
- No TypeScript errors locally (`npm run build`)

**Fix:**
```bash
# Test build locally first
npm run build

# Check Vercel build logs
vercel logs [deployment-url]
```

### Magic Link Not Working

**Check:**
1. Supabase redirect URLs include production domain
2. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
3. Email provider is configured in Supabase

**Fix:**
- Verify redirect URLs: https://supabase.com/dashboard/project/olrhqzvnqoymubturijo/auth/url-configuration
- Check Supabase logs for auth errors

### Database Connection Issues

**Check:**
- `DATABASE_URL` uses the pooler connection (port 5432)
- Password is correct
- Supabase database is running

**Fix:**
- Test connection locally: `node test-db.js`
- Verify connection string in Vercel env vars

### Runtime Errors

**Check Vercel Logs:**
```bash
vercel logs --follow
```

**Common Issues:**
- Missing environment variables
- CORS issues (check middleware)
- Database connection timeout

---

## 📈 Performance Optimization

### After Successful Deployment

1. **Enable Edge Functions** (optional):
   - Move API routes to Edge Runtime for faster response
   - Add `export const runtime = 'edge'` to API routes

2. **Add Caching**:
   - Enable Vercel Edge Caching for public timeline
   - Add revalidation to static pages

3. **Optimize Images**:
   - Replace `<img>` with Next.js `<Image>` component
   - Enable automatic image optimization

4. **Database Performance**:
   - Monitor Supabase query performance
   - Add indexes for frequently queried fields
   - Consider read replicas for high traffic

---

## 🎯 Next Steps

Once deployment is successful:

1. ✅ Share your production URL with team/users
2. 📱 Test on mobile devices
3. 🔔 Set up error monitoring
4. 📊 Enable analytics
5. 🚀 Plan next features

---

## 📞 Support

**Resources:**
- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Supabase Auth: https://supabase.com/docs/guides/auth

**Logs:**
```bash
# View deployment logs
vercel logs

# View realtime logs
vercel logs --follow

# View specific deployment
vercel logs [deployment-url]
```

---

## ✨ Success Criteria

Your deployment is successful when:

- ✅ Build completes without errors
- ✅ Site loads at Vercel URL
- ✅ Login/logout works
- ✅ Dashboard is accessible after auth
- ✅ Units can be created and published
- ✅ Events can be added
- ✅ Public timeline works
- ✅ Internal timeline requires API key
- ✅ No console errors in browser

**Congratulations on your deployment!** 🎊
