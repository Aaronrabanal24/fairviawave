# 📅 Week 1 Shakedown Plan

## Pre-Launch (Day 0)

### Final Checks
- [ ] All environment variables set in Vercel
- [ ] Supabase auth redirects configured
- [ ] Health check endpoint responding
- [ ] Security headers verified
- [ ] GitHub Actions monitoring active
- [ ] Secrets rotated for production
- [ ] Backups enabled in Supabase
- [ ] PITR (Point-in-Time Recovery) confirmed

---

## Day 1-2: Smoke Testing

### Morning & Evening Runs (2x daily)

**E2E Smoke Test Flow:**
```bash
# 1. Login
curl -X POST https://your-app.vercel.app/api/auth/send-magic-link \
  -H "Content-Type: application/json" \
  -d '{"email":"test@yourdomain.com"}'

# 2. Check health
curl https://your-app.vercel.app/api/health

# 3. Create unit (after auth)
curl -X POST https://your-app.vercel.app/api/units \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{"name":"Smoke Test Unit","description":"Automated test"}'

# 4. Publish unit
curl -X POST https://your-app.vercel.app/api/units/[id]/publish \
  -H "Authorization: Bearer [token]"

# 5. Add event
curl -X POST https://your-app.vercel.app/api/units/[id]/events \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{"type":"inquiry","content":"Test inquiry","visibility":"public"}'

# 6. Check public timeline
curl https://your-app.vercel.app/api/units/[id]/timeline/public
```

**Automated Script:**
```bash
#!/bin/bash
# save as: smoke-test.sh

echo "🧪 Running smoke test..."

# Health check
echo "1. Health check..."
curl -s https://your-app.vercel.app/api/health | jq '.ok'

# Public timeline test (use existing unit)
echo "2. Public timeline..."
UNIT_ID="your-test-unit-id"
TIMELINE=$(curl -s https://your-app.vercel.app/api/units/$UNIT_ID/timeline/public)
echo $TIMELINE | jq '.events | length'

# Verify PII filtering
echo "3. PII check..."
if echo $TIMELINE | grep -q "email\|phone\|ssn"; then
  echo "❌ FAIL: PII detected in public timeline!"
  exit 1
fi

echo "✅ Smoke test passed"
```

**Run twice daily:**
```bash
chmod +x smoke-test.sh
./smoke-test.sh
```

**Track Results:**
- [ ] Morning run - Day 1: ✅/❌
- [ ] Evening run - Day 1: ✅/❌
- [ ] Morning run - Day 2: ✅/❌
- [ ] Evening run - Day 2: ✅/❌

---

## Day 3-4: Load Testing

### Setup Load Test

**Install k6:**
```bash
# macOS
brew install k6

# Linux
sudo apt-get install k6

# Or use Docker
docker pull grafana/k6
```

**Create load-test.js:**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 200 },  // Stay at 200 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(50)<300', 'p(95)<1000'], // p50 < 300ms, p95 < 1s
    http_req_failed: ['rate<0.005'],  // Error rate < 0.5%
  },
};

export default function () {
  // Test public timeline (most critical endpoint)
  const unitId = 'your-published-unit-id';
  const res = http.get(`https://your-app.vercel.app/api/units/${unitId}/timeline/public`);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response has events': (r) => JSON.parse(r.body).events !== undefined,
    'no PII in response': (r) => !r.body.includes('email'),
  });

  sleep(1);
}
```

**Run Load Test:**
```bash
k6 run load-test.js
```

**Success Criteria:**
- [ ] Error rate < 0.5%
- [ ] p50 response time < 300ms
- [ ] p95 response time < 1s
- [ ] No PII leaks detected
- [ ] No 5xx errors

**If fails:**
1. Check database indexes
2. Review query performance in Supabase
3. Enable caching if needed
4. Consider CDN for static assets

---

## Day 5-7: Pilot Testing

### Real User Validation

**Pilot Users: 3-5 trusted users**

**Provide Access:**
1. Send invitation emails
2. Guide through onboarding
3. Ask to create 1-2 real units
4. Monitor their usage

**Pilot Checklist:**
- [ ] User 1: Can login successfully
- [ ] User 1: Creates unit
- [ ] User 1: Publishes unit
- [ ] User 1: Adds events
- [ ] User 1: Views public timeline
- [ ] User 2: (repeat above)
- [ ] User 3: (repeat above)

**Feedback Collection:**
```markdown
## Pilot Feedback Form

**User:** [Name]
**Date:** [Date]

### Experience
- Login experience: [1-5 stars]
- Unit creation: [1-5 stars]
- Publishing flow: [1-5 stars]
- Adding events: [1-5 stars]
- Public timeline: [1-5 stars]

### Issues Encountered
- [List any problems]

### Suggestions
- [List improvements]

### Would you use this?
- [ ] Yes
- [ ] Maybe
- [ ] No

**Notes:** [Additional feedback]
```

---

## 🎯 Success Metrics (Week 1)

### Usage Metrics

**Target:**
- Units created: 5-10
- Units published: 3-7
- Events appended: 15-30
- Public timeline views: 20-50

**Track:**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM v_kpi_dashboard;

-- Daily activity
SELECT * FROM mv_daily_activity
WHERE day >= CURRENT_DATE - 7
ORDER BY day DESC;
```

### Performance Metrics

**Target:**
- Public timeline p50: < 300ms
- Public timeline p95: < 1s
- Event append success: ≥ 99.9%
- Health check uptime: ≥ 99.9%

**Monitor:**
- Vercel Analytics dashboard
- GitHub Actions uptime results
- Supabase performance tab

### Error Metrics

**Target:**
- 5xx error rate: < 0.1%
- Failed auth attempts: < 1%
- Database errors: 0
- Failed event writes: < 0.1%

**Check:**
```bash
# Vercel logs
vercel logs --since 24h | grep -E "5[0-9]{2}"

# Count errors
vercel logs --since 24h | grep "500" | wc -l
```

---

## 🔍 Quality Checks

### PII Verification

**Manual Check (Daily):**
```bash
# Get random published unit
UNIT_ID=$(curl -s https://your-app.vercel.app/api/units | jq -r '.[0].id')

# Check public timeline
curl -s https://your-app.vercel.app/api/units/$UNIT_ID/timeline/public | \
  grep -iE "email|phone|ssn|passport|license|credit.*card"

# Should return nothing
```

**Automated Check:**
```javascript
// Add to smoke test
const piiPatterns = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // email
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // phone
  /\b\d{3}-?\d{2}-?\d{4}\b/, // SSN
];

const checkPII = (response) => {
  for (const pattern of piiPatterns) {
    if (pattern.test(response)) {
      console.error('❌ PII DETECTED:', pattern);
      return false;
    }
  }
  return true;
};
```

### Token Expiry Test

**Create Short-Lived Unit:**
1. Publish unit with short expiry (if implemented)
2. Wait for expiry time
3. Try to access public timeline
4. Should return 404 or 403

**Test Script:**
```bash
# If you implement expiry
# Publish with 5 min expiry
curl -X POST .../publish \
  -d '{"expiresIn":300}'

# Wait 6 minutes
sleep 360

# Should fail
curl https://.../timeline/public
# Expected: 404 or 403
```

---

## 📊 Daily Dashboard Check

**Morning Routine (10 min):**

1. **Check GitHub Actions:**
   - Uptime check: ✅/❌
   - Security headers: ✅/❌

2. **Review Vercel Logs:**
   ```bash
   vercel logs --since 24h | head -50
   ```

3. **Check KPIs:**
   ```sql
   SELECT * FROM v_kpi_dashboard;
   ```

4. **Review Error Rate:**
   ```bash
   vercel logs --since 24h | grep -c "5[0-9]{2}"
   ```

5. **Test Health:**
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

**Evening Routine (10 min):**
- Repeat morning checks
- Compare metrics to morning
- Note any anomalies
- Update shakedown log

---

## 🚨 Incident Scenarios

### Practice These

**Scenario 1: Database Down**
- Trigger: Stop database (in test env)
- Response: Follow OPS_RUNBOOK.md
- Verify: Alerts fire, health check fails
- Recovery: < 5 minutes

**Scenario 2: High Error Rate**
- Trigger: Deploy bad code (in preview)
- Response: Rollback procedure
- Verify: Error rate drops
- Recovery: < 2 minutes

**Scenario 3: PII Leak**
- Trigger: Add PII to test unit
- Response: Verify it's NOT in public timeline
- Verify: Filter working correctly
- Action: If leaked, immediate hotfix

---

## ✅ Week 1 Completion Checklist

### Technical
- [ ] All smoke tests passed (8/8 runs)
- [ ] Load test passed (< 0.5% error rate)
- [ ] No PII leaks detected
- [ ] Token expiry working (if implemented)
- [ ] Performance targets met
- [ ] Zero critical incidents
- [ ] Backup restore tested

### User Validation
- [ ] 3-5 pilot users onboarded
- [ ] Real units created and published
- [ ] Positive user feedback
- [ ] No blocking issues reported
- [ ] Users can complete full workflow

### Monitoring
- [ ] GitHub Actions running smoothly
- [ ] Metrics collection working
- [ ] Error tracking operational
- [ ] Alerts tested and working

### Documentation
- [ ] Incident log maintained
- [ ] Shakedown results documented
- [ ] Issues logged and prioritized
- [ ] Next steps identified

---

## 📈 Week 2 Planning

Based on Week 1 results:

**If all green:**
- [ ] Gradual user rollout (10-20 users)
- [ ] Monitor metrics closely
- [ ] Implement quick wins from feedback
- [ ] Plan feature additions

**If issues found:**
- [ ] Prioritize critical fixes
- [ ] Re-run failed tests
- [ ] Extend shakedown period
- [ ] Hold on broader rollout

---

## 📝 Daily Log Template

```markdown
## Week 1 Shakedown - Day [X]

**Date:** YYYY-MM-DD

### Morning Check (HH:MM)
- Smoke test: ✅/❌
- Health check: ✅/❌
- Error count: [number]
- Units created: [number]

### Load Test (if Day 3-4)
- Error rate: [percentage]
- p50 latency: [ms]
- p95 latency: [ms]
- Result: ✅/❌

### Pilot Activity (if Day 5-7)
- Active users: [number]
- Units created: [number]
- Issues reported: [number]

### Evening Check (HH:MM)
- Smoke test: ✅/❌
- Health check: ✅/❌
- Error count: [number]
- Delta from morning: [+/-]

### Issues/Notes
- [List any issues or observations]

### Action Items
- [ ] Item 1
- [ ] Item 2
```

---

**Stay disciplined with this plan - it will catch issues before users do!** 🎯
