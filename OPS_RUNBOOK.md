# 🚨 Operations Runbook

## Quick Reference - Common Incidents

### 🔴 Uptime Red (Service Down)

**Symptoms:** `/api/health` returns error or timeout

**Diagnosis Steps:**
1. Check health endpoint:
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

2. Check Vercel logs:
   ```bash
   vercel logs --follow
   ```

3. Look for patterns:
   - Database auth errors → env var or key rotation issue
   - Timeout errors → database connection pool exhausted
   - 503 errors → database unavailable

**Resolution:**
- **DB auth errors:** Check env vars, rotate keys if needed, redeploy
- **Connection pool:** Increase DATABASE_URL connection limit or add pooling
- **DB down:** Check Supabase status: https://status.supabase.com/
- **Vercel down:** Check status: https://www.vercel-status.com/

**Recovery Time:** 2-5 minutes

---

### 📈 Public 5xx Spike

**Symptoms:** Sudden increase in 5xx errors on public endpoints

**Immediate Actions:**
1. **Check error rate:**
   ```bash
   # Vercel logs filtered by status
   vercel logs | grep "500\|502\|503"
   ```

2. **Identify failing endpoint:**
   - `/api/units` → database query issue
   - `/api/units/[id]/publish` → QR generation or DB write
   - `/api/units/[id]/timeline/public` → query or serialization

3. **Quick Mitigation:**
   - Roll back to last known good deployment in Vercel
   - Or: disable problematic feature with feature flag
   - Consider rate limiting if traffic spike

**Resolution:**
- **Code bug:** Rollback in Vercel → Previous deployment → Promote
- **Database:** Check connection pool, query performance in Supabase
- **Traffic spike:** Add Upstash rate limiting, enable Edge caching

**Recovery Time:** 5-15 minutes

---

### 🔒 PII Leak Report

**Symptoms:** User reports PII visible in public timeline

**Immediate Actions:**
1. **Verify the report:**
   ```bash
   curl https://your-app.vercel.app/api/units/[reported-id]/timeline/public
   ```

2. **Check event by ID:**
   ```sql
   -- In Supabase SQL Editor
   SELECT * FROM events WHERE id = '[event-id]';
   ```

3. **Confirm serializer:**
   - Review: `app/api/units/[id]/timeline/public/route.ts`
   - Check fields in response mapping

**Resolution:**
1. **Hotfix:** Update allow-list in public timeline route
2. **Test locally:** Verify PII not exposed
3. **Deploy:** Push fix immediately
4. **Add test:** Create regression test for PII filtering
5. **Notify:** Inform affected users if needed

**Prevention:**
- Add automated PII detection tests
- Review all public endpoint serializers
- Add schema validation on responses

**Recovery Time:** 15-30 minutes

---

### ❌ Magic Link Not Delivered

**Symptoms:** Users not receiving magic link emails

**Diagnosis:**
1. **Check Supabase logs:**
   - Dashboard → Auth → Logs
   - Look for delivery failures

2. **Verify email provider:**
   - Default Supabase SMTP (limited)
   - Custom SMTP configured?

3. **Test delivery:**
   ```bash
   # Try with your own email
   curl -X POST https://your-app.vercel.app/api/auth/send-magic-link \
     -H "Content-Type: application/json" \
     -d '{"email":"your-email@test.com"}'
   ```

**Resolution:**
- **Supabase rate limit:** Wait or upgrade plan
- **Spam folder:** Add SPF/DKIM records
- **Custom SMTP:** Switch to Postmark/Resend (see EMAIL_DELIVERABILITY.md)

---

### 💾 Database Connection Pool Exhausted

**Symptoms:** Errors like "too many clients" or timeouts

**Diagnosis:**
```sql
-- Check active connections in Supabase
SELECT count(*) FROM pg_stat_activity;
```

**Resolution:**
1. **Immediate:** Restart app (kills connections)
   ```bash
   vercel --force  # Force new deployment
   ```

2. **Short-term:** Increase connection limit in DATABASE_URL:
   ```
   ?connection_limit=10  # Increase from 1
   ```

3. **Long-term:**
   - Use Supabase Pooler (already configured)
   - Add connection pooling middleware
   - Review long-running queries

---

### 🐌 Slow Public Timeline

**Symptoms:** p95 response time > 2s

**Diagnosis:**
1. **Check database queries:**
   - Supabase Dashboard → Performance
   - Look for slow queries on events table

2. **Profile the endpoint:**
   ```bash
   # Use curl with timing
   curl -w "@curl-format.txt" -o /dev/null -s \
     https://your-app.vercel.app/api/units/[id]/timeline/public
   ```

**Resolution:**
- **Missing index:** Add index on visibility + unitId
- **N+1 queries:** Use Prisma includes
- **Large result set:** Add pagination
- **No caching:** Add Redis or Edge caching

**Optimization:**
```sql
-- Add composite index
CREATE INDEX idx_events_visibility_unit
  ON events(visibility, "unitId", "createdAt");
```

---

## 🔧 Routine Maintenance

### Daily Tasks
- [ ] Check GitHub Actions uptime results
- [ ] Review error rate in Vercel logs
- [ ] Scan for new Dependabot alerts
- [ ] Monitor KPI dashboard

### Weekly Tasks
- [ ] Review performance metrics (p50, p95, p99)
- [ ] Check database backup status
- [ ] Test restore from backup (drill)
- [ ] Rotate API keys if needed
- [ ] Update dependencies

### Monthly Tasks
- [ ] Security audit (headers, RLS policies)
- [ ] Load testing
- [ ] Review and archive old logs
- [ ] Capacity planning review

---

## 📊 Health Indicators

### Green (Normal Operation)
- ✅ Uptime > 99.9%
- ✅ p95 response time < 500ms
- ✅ Error rate < 0.1%
- ✅ Database connections < 80% of limit
- ✅ All health checks passing

### Yellow (Degraded)
- ⚠️ Uptime 99.0-99.9%
- ⚠️ p95 response time 500ms-1s
- ⚠️ Error rate 0.1-1%
- ⚠️ Database connections 80-90% of limit
- ⚠️ Intermittent health check failures

### Red (Critical)
- 🔴 Uptime < 99.0%
- 🔴 p95 response time > 1s
- 🔴 Error rate > 1%
- 🔴 Database connections > 90% of limit
- 🔴 Health checks consistently failing

---

## 🚨 Escalation Paths

### Level 1 (On-Call Engineer)
- Timeframe: 0-15 minutes
- Actions: Immediate mitigation, rollback
- Authority: Can rollback, restart services

### Level 2 (Lead Engineer)
- Timeframe: 15-60 minutes
- Actions: Root cause analysis, hotfix
- Authority: Can modify infrastructure

### Level 3 (CTO/Founder)
- Timeframe: > 60 minutes or data breach
- Actions: Customer communication, incident review
- Authority: All decisions

---

## 📞 Important Links

**Monitoring:**
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard
- GitHub Actions: https://github.com/YOUR_REPO/actions

**Status Pages:**
- Vercel Status: https://www.vercel-status.com/
- Supabase Status: https://status.supabase.com/

**Logs:**
```bash
# Vercel logs
vercel logs --follow

# Filter by time
vercel logs --since 1h

# Filter by URL
vercel logs | grep "/api/units"
```

---

## 🔄 Rollback Procedures

### Quick Rollback (< 2 minutes)
1. Go to Vercel Dashboard → Deployments
2. Find last known good deployment
3. Click ⋯ → Promote to Production
4. Confirm

### Rollback with Git
```bash
# Find last good commit
git log --oneline

# Revert to specific commit
git revert [commit-hash]
git push origin main
```

### Database Rollback
⚠️ **Caution:** Only for critical data issues

1. Check Supabase backups
2. Restore from PITR (Point-in-Time Recovery)
3. Verify data integrity
4. Redeploy application

---

## 📝 Incident Response Template

```markdown
## Incident: [Title]
**Date:** YYYY-MM-DD HH:MM UTC
**Severity:** Critical / Major / Minor
**Status:** Investigating / Identified / Resolved

### Impact
- Affected users: [number/percentage]
- Affected endpoints: [list]
- Duration: [start time - end time]

### Timeline
- HH:MM - Incident detected
- HH:MM - Investigation started
- HH:MM - Root cause identified
- HH:MM - Fix deployed
- HH:MM - Incident resolved

### Root Cause
[Description of what caused the issue]

### Resolution
[What was done to fix it]

### Prevention
- [ ] Action item 1
- [ ] Action item 2
- [ ] Action item 3

### Lessons Learned
[Key takeaways]
```

---

## ✅ Post-Incident Checklist

After resolving any incident:

- [ ] Update status page / notify users
- [ ] Document in incident log
- [ ] Review and update runbook
- [ ] Create prevention tasks
- [ ] Schedule post-mortem (for major incidents)
- [ ] Update monitoring/alerts if needed
- [ ] Share learnings with team

---

**Keep this runbook updated as you discover new patterns!**

Last Updated: 2025-10-05
