# 📧 Email Deliverability Guide

## Current Setup: Supabase Default SMTP

**Status:** ⚠️ Limited - OK for testing, not for production scale

**Limitations:**
- Rate limited (varies by plan)
- May land in spam
- No detailed delivery analytics
- Shared IP reputation

---

## 🚀 Production Email Setup

### Recommended: Custom SMTP Provider

**Top Options:**
1. **Postmark** - Best deliverability, dedicated to transactional email
2. **Resend** - Modern API, great DX
3. **SendGrid** - Feature-rich, established
4. **Amazon SES** - Cost-effective at scale

---

## 📋 Setup Guide: Custom SMTP

### Option 1: Postmark (Recommended)

**Step 1: Create Postmark Account**
1. Sign up: https://postmarkapp.com
2. Create server for "Transactional" emails
3. Get SMTP credentials

**Step 2: Configure in Supabase**
1. Supabase Dashboard → Auth → Email Templates
2. Settings → SMTP Settings
3. Enter Postmark credentials:
   ```
   Host: smtp.postmarkapp.com
   Port: 587
   Username: [your-server-token]
   Password: [your-server-token]
   ```

**Step 3: Verify Domain**
1. Add your domain to Postmark
2. Add DNS records (provided by Postmark)
3. Verify domain ownership

**Step 4: Configure SPF & DKIM**

Add these DNS records to your domain:

```dns
# SPF Record
Type: TXT
Name: @
Value: v=spf1 include:spf.postmarkapp.com ~all

# DKIM Record (provided by Postmark)
Type: TXT
Name: [postmark-dkim-selector]._domainkey
Value: [postmark-provides-this]

# DMARC Record (optional but recommended)
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
```

**Step 5: Test Deliverability**
```bash
# Send test email via Supabase
curl -X POST https://olrhqzvnqoymubturijo.supabase.co/auth/v1/magiclink \
  -H "apikey: [your-anon-key]" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@yourdomain.com"}'
```

---

### Option 2: Resend

**Step 1: Create Resend Account**
1. Sign up: https://resend.com
2. Get API key
3. Verify domain

**Step 2: Configure in Supabase**
1. Supabase → Auth → Email Settings
2. Custom SMTP:
   ```
   Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: [your-api-key]
   ```

**Step 3: Add DNS Records**

```dns
# SPF
v=spf1 include:spf.resend.com ~all

# DKIM (Resend provides)
[resend-dkim-selector]._domainkey

# DMARC
v=DMARC1; p=quarantine; rua=mailto:postmaster@yourdomain.com
```

---

## 🔍 Deliverability Best Practices

### 1. Domain Configuration

**Requirements:**
- ✅ SPF record configured
- ✅ DKIM signing enabled
- ✅ DMARC policy set
- ✅ Custom domain verified
- ✅ Reverse DNS (PTR) record

**Testing:**
```bash
# Check SPF
dig TXT yourdomain.com | grep spf

# Check DKIM
dig TXT default._domainkey.yourdomain.com

# Check DMARC
dig TXT _dmarc.yourdomain.com
```

### 2. Email Content

**DO:**
- Use plain text + HTML versions
- Clear subject lines (avoid spam words)
- Include unsubscribe link
- Add physical address
- Consistent from address

**DON'T:**
- Use all caps in subject
- Excessive punctuation!!!
- Image-only emails
- Suspicious links
- Spammy keywords (FREE, URGENT, etc.)

### 3. Sender Reputation

**Monitor:**
- Bounce rate (keep < 5%)
- Complaint rate (keep < 0.1%)
- Open rate (target > 20%)
- Domain reputation score

**Tools:**
- Google Postmaster Tools
- Microsoft SNDS
- SenderScore.org

---

## 📊 Monitoring & Analytics

### Key Metrics to Track

**Delivery Metrics:**
- Delivered rate (target: > 98%)
- Bounce rate (target: < 2%)
- Spam complaint rate (target: < 0.1%)

**Engagement Metrics:**
- Open rate (magic links)
- Click rate (link in email)
- Time to click (magic link latency)

**Provider-Specific:**

**Postmark Dashboard:**
- Delivery stats
- Bounce analysis
- Spam complaints
- Template performance

**Resend Analytics:**
- Email opens/clicks
- Delivery timeline
- Bounce categorization

---

## 🧪 Testing Email Deliverability

### Tools

**1. Mail Tester**
```
1. Send test email to: test@mail-tester.com
2. Check score at: https://www.mail-tester.com
3. Target score: 8/10 or higher
```

**2. GlockApps**
```
1. Send to GlockApps test address
2. Get inbox placement report
3. See spam filter results
```

**3. Litmus Spam Testing**
```
1. Send to Litmus test address
2. Check spam filter scores
3. Review across providers
```

### Manual Testing Checklist

- [ ] Test Gmail delivery
- [ ] Test Outlook/Office 365
- [ ] Test Yahoo Mail
- [ ] Test mobile clients (iOS/Android)
- [ ] Verify links work
- [ ] Check spam folder placement
- [ ] Test different timezones

---

## 🚨 Troubleshooting

### Issue: Emails Going to Spam

**Diagnosis:**
1. Check SPF/DKIM/DMARC alignment
2. Review spam score (mail-tester.com)
3. Check content for spam triggers
4. Verify sender reputation

**Solutions:**
- Fix DNS records
- Warm up new domain gradually
- Remove spam trigger words
- Use dedicated IP (if high volume)
- Authenticate domain properly

### Issue: High Bounce Rate

**Types of Bounces:**
- **Hard bounce:** Invalid email (remove from list)
- **Soft bounce:** Temporary issue (retry)

**Solutions:**
- Validate email addresses on signup
- Remove hard bounces immediately
- Monitor bounce patterns
- Check for typos in "from" address

### Issue: Poor Open Rates

**Diagnosis:**
- Magic links not being clicked
- Emails delivered but ignored

**Solutions:**
- Test subject line variations
- Send at optimal times
- Check from name/address
- Ensure mobile-friendly
- Clear call-to-action

---

## 🔐 Security Considerations

### Email Authentication

**DMARC Policies:**
```dns
# Start with monitoring
v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com

# Move to quarantine after validation
v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com

# Enforce after confidence
v=DMARC1; p=reject; rua=mailto:dmarc@yourdomain.com
```

### Rate Limiting

**Prevent Abuse:**
```javascript
// Add to magic link endpoint
const MAX_REQUESTS = 3
const WINDOW = 60 * 60 * 1000 // 1 hour

// Track attempts per email
// Reject if exceeded
```

### Email Verification

**Optional: Double Opt-In**
1. User enters email
2. Sends confirmation request
3. User clicks confirmation link
4. Email verified, can now login
5. Reduces spam, improves deliverability

---

## 📈 Scaling Considerations

### Volume Planning

| Daily Magic Links | Provider | Notes |
|------------------|----------|-------|
| < 100 | Supabase Default | OK for testing |
| 100-1,000 | Postmark/Resend | Recommended |
| 1,000-10,000 | Postmark/SendGrid | Dedicated IP |
| 10,000+ | SendGrid/SES | Enterprise support |

### Cost Estimation

**Postmark:**
- $10/month for 10,000 emails
- $0.001 per email after

**Resend:**
- Free: 3,000 emails/month
- Pro: $20/month for 50,000

**SendGrid:**
- Free: 100 emails/day
- Essentials: $19.95/month for 50,000

**Amazon SES:**
- $0.10 per 1,000 emails
- Cheapest at scale

---

## ✅ Pre-Launch Checklist

- [ ] Custom SMTP configured
- [ ] Domain verified
- [ ] SPF record added
- [ ] DKIM enabled
- [ ] DMARC policy set
- [ ] Test emails sent to multiple providers
- [ ] Spam score > 8/10
- [ ] Inbox placement > 95%
- [ ] Bounce handling configured
- [ ] Rate limiting enabled
- [ ] Monitoring/alerts set up

---

## 🔗 Resources

**Email Testing:**
- Mail Tester: https://www.mail-tester.com
- MXToolbox: https://mxtoolbox.com
- GlockApps: https://glockapps.com

**SPF/DKIM/DMARC:**
- DMARC Guide: https://dmarc.org
- SPF Wizard: https://www.spfwizard.net
- DKIM Validator: https://dkimvalidator.com

**Deliverability:**
- Return Path: https://returnpath.com
- Sender Score: https://senderscore.org
- Google Postmaster: https://postmaster.google.com

---

**Last Updated:** 2025-10-05
**Review Schedule:** Quarterly
