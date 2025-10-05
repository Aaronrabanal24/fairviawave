# 🔐 Secrets Rotation Guide

## Production Security Best Practices

### ⚠️ Critical: Separate Environments

**NEVER reuse secrets across environments!**

- ✅ Production → Unique keys
- ✅ Preview → Unique keys
- ✅ Development → Unique keys (or use separate Supabase project)

---

## 🔄 Rotation Schedule

### Immediate (Before Production Launch)

- [ ] Generate new `INTERNAL_API_KEY` for production
- [ ] Use separate Supabase project for production
- [ ] Or: Generate new Supabase service role key for prod

### Regular Rotation

| Secret | Rotation Frequency | Priority |
|--------|-------------------|----------|
| INTERNAL_API_KEY | Every 90 days | High |
| SUPABASE_SERVICE_ROLE_KEY | Every 180 days | Critical |
| Database passwords | Every 90 days | High |
| API tokens | Every 90 days | Medium |

---

## 📋 Step-by-Step Rotation

### 1. Rotate INTERNAL_API_KEY

**Generate new key:**
```bash
# Generate secure random key
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Update in Vercel:**
1. Go to Vercel → Settings → Environment Variables
2. Edit `INTERNAL_API_KEY`
3. Update for **Production only** first
4. Value: `[new-generated-key]`
5. Save and redeploy

**Test:**
```bash
# Test internal timeline with new key
curl https://your-app.vercel.app/api/units/[id]/timeline/internal \
  -H "x-internal-api-key: [new-key]"
```

**Update Preview/Development:**
- Repeat for Preview environment
- Update local `.env` file
- Never use prod keys in dev!

---

### 2. Rotate Supabase Service Role Key

**⚠️ High Impact - Plan Carefully**

**Option A: Create New Project (Recommended for Prod)**
1. Create new Supabase project for production
2. Run migrations: `prisma db push`
3. Run seed data if needed
4. Update all `SUPABASE_*` env vars in Vercel
5. Test thoroughly before switching traffic
6. Migrate data if needed

**Option B: Generate New Service Role (Same Project)**
1. Supabase Dashboard → Settings → API
2. Generate new service role key
3. Update `SUPABASE_SERVICE_ROLE_KEY` in Vercel
4. Redeploy immediately
5. Old key becomes invalid

**Testing:**
```bash
# Verify new key works
curl https://your-app.vercel.app/api/units \
  -X POST \
  -H "Authorization: Bearer [supabase-auth-token]" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Unit","description":"Testing new keys"}'
```

---

### 3. Rotate Database Password

**In Supabase:**
1. Dashboard → Settings → Database
2. Reset database password
3. Copy new password

**Update DATABASE_URL:**
```bash
# Old format
postgresql://postgres.PROJECT:OLD_PASSWORD@...

# New format
postgresql://postgres.PROJECT:NEW_PASSWORD@...
```

**Update in Vercel:**
1. Settings → Environment Variables
2. Edit `DATABASE_URL` and `DIRECT_URL`
3. Replace password in both
4. Save and redeploy

**Verify:**
```bash
# Test database connection
curl https://your-app.vercel.app/api/health
# Should return: { "ok": true, "status": "healthy" }
```

---

## 🔒 Environment Separation Strategy

### Production Environment
```bash
# Vercel Production only
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[prod-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[prod-service-key]
DATABASE_URL=postgresql://[prod-db]
INTERNAL_API_KEY=[prod-api-key-32-chars]
```

### Preview Environment
```bash
# Vercel Preview only
NEXT_PUBLIC_SUPABASE_URL=https://preview-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[preview-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[preview-service-key]
DATABASE_URL=postgresql://[preview-db]
INTERNAL_API_KEY=[preview-api-key-different]
```

### Development Environment
```bash
# Local .env only
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[dev-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[dev-service-key]
DATABASE_URL=postgresql://[dev-db]
INTERNAL_API_KEY=dev-internal-key  # OK for local dev
```

---

## ✅ Rotation Checklist

### Pre-Rotation
- [ ] Schedule maintenance window (if high traffic)
- [ ] Backup current secrets securely
- [ ] Notify team of planned rotation
- [ ] Prepare rollback plan

### During Rotation
- [ ] Generate new secrets
- [ ] Update Vercel environment variables
- [ ] Deploy changes
- [ ] Monitor error rates

### Post-Rotation
- [ ] Test all critical flows
- [ ] Verify health endpoint
- [ ] Check error logs
- [ ] Confirm no auth failures
- [ ] Document rotation date
- [ ] Securely delete old secrets

---

## 🚨 Emergency Rotation (Key Compromise)

If a secret is compromised:

### Immediate Actions (< 5 minutes)
1. **Revoke compromised key immediately**
   - Supabase: Reset service role key
   - API: Generate new `INTERNAL_API_KEY`

2. **Deploy new keys**
   ```bash
   # Update Vercel env vars
   vercel env add INTERNAL_API_KEY production
   # Enter new value

   # Force redeploy
   vercel --prod --force
   ```

3. **Monitor for abuse**
   - Check Vercel logs for suspicious activity
   - Review Supabase auth logs
   - Check for unauthorized API calls

### Recovery Actions (< 1 hour)
- [ ] Rotate all related secrets
- [ ] Review access logs
- [ ] Identify breach source
- [ ] Document incident
- [ ] Update security procedures

---

## 📊 Secrets Audit Log

Keep a record of all rotations:

```markdown
## Rotation Log

### 2025-10-05
- **Secret:** INTERNAL_API_KEY
- **Environment:** Production
- **Reason:** Initial production setup
- **Rotated by:** [Name]
- **Tested:** ✅
- **Issues:** None

### YYYY-MM-DD
- **Secret:** [name]
- **Environment:** [env]
- **Reason:** [scheduled/emergency/compromise]
- **Rotated by:** [name]
- **Tested:** [✅/❌]
- **Issues:** [description]
```

---

## 🔐 Secrets Storage Best Practices

### ✅ DO
- Use Vercel environment variables for deployment secrets
- Use 1Password/Bitwarden for secret backup
- Rotate regularly on schedule
- Separate prod/preview/dev secrets
- Use strong random generators
- Document rotation dates

### ❌ DON'T
- Never commit secrets to git
- Never share prod secrets via Slack/email
- Never reuse secrets across environments
- Never use weak/guessable values
- Never log secret values
- Never store in plain text files

---

## 🛡️ Additional Security Measures

### Vault Solutions (Optional)
- **Vercel KV** - For feature flags
- **Supabase Vault** - For encrypted secrets
- **HashiCorp Vault** - Enterprise secret management

### Monitoring
- Set up alerts for auth failures
- Monitor unusual API patterns
- Track secret usage via logs
- Audit access regularly

### Compliance
- Document rotation procedures
- Maintain audit trail
- Review annually
- Update as needed

---

## 📞 Emergency Contacts

**If you suspect a key compromise:**
1. Rotate immediately (follow emergency procedure)
2. Notify team lead
3. Document in incident log
4. Review security procedures

---

**Last Updated:** 2025-10-05
**Next Review:** 2026-01-05 (Quarterly)
