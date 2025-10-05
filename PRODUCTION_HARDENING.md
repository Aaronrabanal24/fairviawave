# 🔒 Production Hardening Guide

## ✅ Implemented Security Features

### Security Headers (next.config.mjs)
- ✅ **X-Content-Type-Options: nosniff** - Prevents MIME sniffing
- ✅ **X-Frame-Options: DENY** - Prevents clickjacking
- ✅ **Referrer-Policy: strict-origin-when-cross-origin** - Controls referrer information
- ✅ **Strict-Transport-Security** - Enforces HTTPS (1 year, includeSubDomains)
- ✅ **Cache-Control: no-store** on all `/api/*` routes

### Authentication & Authorization
- ✅ All POST routes protected with Supabase auth
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Public timeline filters PII-safe fields only
- ✅ Internal timeline requires API key header

### Monitoring & Health
- ✅ `/api/health` endpoint for uptime monitoring
- ✅ GitHub Actions uptime check (every 15 min)
- ✅ GitHub Actions security headers check (daily)
- ✅ `robots.txt` - blocks indexing until ready

---

## 📋 Post-Deployment Checklist

### 1. Immediate Checks (First 5 Minutes)

**Supabase Auth Configuration:**
- [ ] Add Vercel domain to Supabase Auth redirect URLs
- [ ] Format: `https://your-app.vercel.app/auth/callback`
- [ ] URL: https://supabase.com/dashboard/project/olrhqzvnqoymubturijo/auth/url-configuration

**Magic Link Flow Test:**
1. [ ] Visit `/login`
2. [ ] Request magic link
3. [ ] Click link from email
4. [ ] Verify redirect to `/dashboard`
5. [ ] Create a unit
6. [ ] Publish unit (get QR code)
7. [ ] Add inquiry event
8. [ ] Add tour event

**Public Timeline Verification:**
- [ ] Visit public timeline URL
- [ ] Confirm only PII-safe fields shown
- [ ] Verify only public events visible (not internal)
- [ ] Check response is valid JSON

---

### 2. GitHub Actions Setup

**Add Production URL Secret:**
```bash
# Go to GitHub repo → Settings → Secrets → Actions
# Add new secret:
Name: PRODUCTION_URL
Value: https://your-app.vercel.app
```

**Enable Workflows:**
- [ ] `.github/workflows/uptime-check.yml` - Monitors `/api/health` every 15 min
- [ ] `.github/workflows/security-check.yml` - Verifies headers daily

---

### 3. Vercel Configuration

**Enable Production Logs:**
- [ ] Vercel Dashboard → Logs → Enable for Production
- [ ] Enable for Preview environments
- [ ] Monitor for 5xx errors

**Optional Enhancements:**
- [ ] Enable Vercel Analytics (Web Vitals)
- [ ] Configure custom domain
- [ ] Set up deployment protection (password)
- [ ] Enable Edge Config (for feature flags)

---

## 🧪 Testing & Performance

### Performance Targets (Week 1)

**Public Timeline:**
- [ ] Median render time < 2 seconds (Fast 3G)
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] First Input Delay (FID) < 100ms

**API Performance:**
- [ ] Event append success rate ≥ 99.9%
- [ ] Publish endpoint < 1s response time
- [ ] Health check < 100ms response time

### Accessibility Check
- [ ] Keyboard navigation works on public timeline
- [ ] Focus indicators visible
- [ ] ARIA roles and labels present
- [ ] Screen reader compatible

### Load Testing (Optional)
```bash
# Install Apache Bench or similar
ab -n 1000 -c 10 https://your-app.vercel.app/api/health

# Or use k6
k6 run load-test.js
```

---

## 📊 Key Metrics to Monitor

### Week 1 Metrics

**Usage Metrics:**
- Units published per day
- Events per unit (average)
- Magic link conversion rate
- Active users per day

**Performance Metrics:**
- Public timeline median render time (mobile)
- Event append success rate
- API response times (p50, p95, p99)
- Database query performance

**Error Metrics:**
- 5xx error rate on public endpoints
- Failed auth attempts
- Database connection errors
- Failed event writes

**Recommended Tools:**
- Vercel Analytics (built-in)
- Supabase Dashboard (database metrics)
- Sentry (error tracking - optional)
- LogRocket (session replay - optional)

---

## 🔐 Security Hardening

### Environment Variables
- [ ] Rotate `INTERNAL_API_KEY` for production
- [ ] Use strong, random values (not `dev-internal-key`)
- [ ] Consider Vercel Environment Groups
- [ ] Never log sensitive values

### Database Security
- [ ] Review RLS policies in Supabase
- [ ] Enable database connection pooling
- [ ] Set up read replicas (for high traffic)
- [ ] Regular backups configured

### API Security
- [ ] Consider rate limiting (Vercel Edge Middleware)
- [ ] Add request validation with Zod
- [ ] Implement CORS if needed
- [ ] Add API versioning for future changes

---

## 🚨 Incident Response

### If Health Check Fails

1. **Check Vercel Status:**
   - https://www.vercel-status.com/

2. **Check Supabase Status:**
   - https://status.supabase.com/

3. **Review Logs:**
   ```bash
   vercel logs --follow
   ```

4. **Common Issues:**
   - Database connection timeout → Check pooler status
   - Cold start delays → Consider warming strategy
   - Environment variables → Verify all set correctly

### If 5xx Errors Spike

1. **Check Error Logs:**
   - Vercel Dashboard → Logs → Filter by 5xx

2. **Common Causes:**
   - Database connection issues
   - Missing environment variables
   - Unhandled exceptions in API routes
   - Prisma client errors

3. **Quick Fixes:**
   - Redeploy (may fix transient issues)
   - Check database connection limits
   - Verify Prisma client generation

---

## 📈 Optimization Opportunities

### Performance
- [ ] Enable Vercel Edge Functions for API routes
- [ ] Add Redis caching for public timeline
- [ ] Implement CDN for QR codes
- [ ] Optimize database queries (add indexes)
- [ ] Use Next.js Image component for optimizations

### Features
- [ ] Real-time updates with Supabase Realtime
- [ ] Webhook notifications
- [ ] Email notifications for events
- [ ] Export timeline as PDF
- [ ] Bulk operations

### Developer Experience
- [ ] Add Prettier for code formatting
- [ ] Set up Husky for pre-commit hooks
- [ ] Add Conventional Commits
- [ ] Create development database seeds
- [ ] Document API with OpenAPI/Swagger

---

## 🎯 Success Criteria

Your production deployment is fully hardened when:

- [x] Security headers implemented
- [x] Auth guards on all write routes
- [x] RLS enabled on database
- [x] Health check endpoint live
- [x] robots.txt configured
- [ ] GitHub Actions monitoring active
- [ ] Supabase auth redirects configured
- [ ] All tests passing
- [ ] Performance targets met
- [ ] Error rate < 0.1%
- [ ] Uptime > 99.9%

---

## 📚 Additional Resources

**Security:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/going-into-prod)

**Performance:**
- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Vercel Analytics](https://vercel.com/analytics)

**Monitoring:**
- [Vercel Logs](https://vercel.com/docs/observability/logs)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Uptime Monitoring Tools](https://betteruptime.com/)

---

## ✅ Quick Deploy Bundle (Copy-Paste Ready)

All critical hardening features are now implemented:

1. ✅ Security headers → `next.config.mjs`
2. ✅ robots.txt → `public/robots.txt`
3. ✅ Health check → `/api/health`
4. ✅ Auth guards verified on all POST routes
5. ✅ GitHub Actions uptime check → `.github/workflows/uptime-check.yml`
6. ✅ GitHub Actions security check → `.github/workflows/security-check.yml`

**Ready to commit and deploy!** 🚀

```bash
git add .
git commit -m "Add production hardening: security headers, health check, monitoring"
git push origin main
```

After Vercel deployment completes, just add the `PRODUCTION_URL` secret to GitHub Actions!
