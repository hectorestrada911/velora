# Email Domain Setup - Production Checklist

## Critical for Deliverability (95%+ Inbox Placement)

### 1. **Domain Configuration**

#### **Primary Domain: `velora.cc`**
```
# DNS Records to Add:
Type: A
Host: @
Value: [Your server IP]

Type: CNAME  
Host: www
Value: velora.cc
```

#### **Email Domain: `mail.velora.cc`**
```
Type: A
Host: mail
Value: [Your server IP]

Type: MX
Host: mail.velora.cc
Value: mx.resend.com
Priority: 10
```

### 2. **SPF Record**
```
Type: TXT
Host: mail.velora.cc
Value: v=spf1 include:_spf.resend.com ~all
```

### 3. **DKIM Setup**
1. **In Resend Dashboard:**
   - Go to Domains → Add Domain → `mail.velora.cc`
   - Copy the DKIM selector and public key

2. **DNS Record:**
```
Type: TXT
Host: [selector]._domainkey.mail.velora.cc
Value: [DKIM public key from Resend]
```

### 4. **DMARC Policy**
```
Type: TXT
Host: _dmarc.mail.velora.cc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@velora.cc; ruf=mailto:dmarc@velora.cc; fo=1
```

### 5. **Custom Return-Path**
```
Type: CNAME
Host: bounce.mail.velora.cc
Value: bounce.resend.com
```

### 6. **PTR/rDNS Setup**
- Contact your hosting provider to set up reverse DNS
- Ensure `mail.velora.cc` resolves back to your server IP

---

## Inbound Email Configuration

### **Resend Inbound Setup**

1. **In Resend Dashboard:**
   - Go to Domains → `mail.velora.cc` → Inbound
   - Add rule: `*@in.velora.cc` → Forward to webhook

2. **Webhook URL:**
```
https://velora-production.up.railway.app/api/inbound-email
```

3. **Webhook Secret:**
```
# Add to Railway environment variables:
INBOUND_WEBHOOK_SECRET=your-secure-secret-here
```

### **Reply-Forward Setup**

1. **Additional Inbound Rule:**
```
reply+*@in.velora.cc → Forward to: https://velora-production.up.railway.app/api/reply-forward
```

---

## Email Template Requirements

### **Consistent Headers**
```
From: Velora Radar <noreply@mail.velora.cc>
Reply-To: [user-email]
Subject: Follow-up due: [original-subject]
List-Unsubscribe: <https://velora.cc/unsubscribe?token=[jwt]>
X-Mailer: Velora-Radar/1.0
```

### **Plain-Text Part (Always Required)**
```
Follow-up due: [subject]

Hi [name],

This is a reminder about your follow-up: "[subject]"

Original context: "[receipt-quote]"

Draft reply:
[draft-text]

Actions:
- Send Draft: [signed-link]
- Mark Done: [signed-link]  
- Snooze 2h: [signed-link]
- Add to Calendar: [ics-link]

If you got a reply, forward it to: reply+[threadKey]@in.velora.cc

---
Velora Follow-Up Radar
Unsubscribe: [unsubscribe-link]
```

### **HTML Part (Optional but Recommended)**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Follow-up due: [subject]</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #f1f5f9; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 12px; padding: 24px; border: 1px solid #475569;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #3b82f6; margin: 0; font-size: 24px;">Follow-up due: [subject]</h1>
      <p style="color: #94a3b8; margin: 8px 0 0 0;">Velora Follow-Up Radar</p>
    </div>

    <!-- Receipt Quote -->
    <div style="background: #1e293b; border-left: 4px solid #ef4444; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 0; color: #94a3b8; font-size: 14px;">Triggered by:</p>
      <p style="margin: 8px 0 0 0; color: #f1f5f9; font-style: italic;">"[receipt-quote]"</p>
    </div>

    <!-- Draft -->
    <div style="background: #1e293b; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 0; color: #94a3b8; font-size: 14px;">Draft reply:</p>
      <p style="margin: 8px 0 0 0; color: #f1f5f9;">[draft-text]</p>
    </div>

    <!-- Action Buttons -->
    <div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;">
      <a href="[send-link]" style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">Send Draft</a>
      <a href="[done-link]" style="background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">Mark Done</a>
      <a href="[snooze-link]" style="background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">Snooze 2h</a>
      <a href="[calendar-link]" style="background: #8b5cf6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">Add to Calendar</a>
    </div>

    <!-- Reply Forward -->
    <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
      <p style="margin: 0; color: #94a3b8; font-size: 14px;">Got a reply? Forward it to:</p>
      <p style="margin: 8px 0 0 0; color: #3b82f6; font-family: monospace; font-size: 16px;">reply+[threadKey]@in.velora.cc</p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding-top: 20px; border-top: 1px solid #475569;">
      <p style="margin: 0; color: #64748b; font-size: 12px;">
        Velora Follow-Up Radar | 
        <a href="[unsubscribe-link]" style="color: #3b82f6;">Unsubscribe</a>
      </p>
    </div>

  </div>
</body>
</html>
```

---

## Warm-up Strategy

### **Week 1: Foundation**
- Day 1-2: Send 10 emails to internal team
- Day 3-4: Send 25 emails to known good addresses
- Day 5-7: Send 50 emails, monitor bounce rates

### **Week 2: Ramp-up**
- Day 8-10: Send 100 emails/day
- Day 11-14: Send 200 emails/day
- Monitor: bounce rate <2%, complaint rate <0.1%

### **Week 3: Production**
- Day 15+: Send up to 1000 emails/day
- Continue monitoring reputation metrics

---

## Monitoring & Alerts

### **Key Metrics**
- **Bounce rate**: <5% (alert if >5%)
- **Complaint rate**: <0.1% (alert if >0.5%)
- **Inbox placement**: >95% (test with seed accounts)
- **Open rate**: >20% (industry standard)
- **Click rate**: >5% (industry standard)

### **Alert Conditions**
```
- Bounce rate > 5% for 1 hour
- Complaint rate > 0.5% for 1 hour  
- Inbox placement < 90% for 4 hours
- Webhook failure rate > 1% for 30 minutes
```

---

## Testing Checklist

### **Pre-Launch Tests**
- [ ] SPF record validates: `dig TXT mail.velora.cc`
- [ ] DKIM signature validates: `dig TXT [selector]._domainkey.mail.velora.cc`
- [ ] DMARC policy validates: `dig TXT _dmarc.mail.velora.cc`
- [ ] PTR record resolves: `dig -x [server-ip]`
- [ ] Inbound webhook receives test emails
- [ ] Reply-forward webhook receives test forwards

### **Seed Account Tests**
- [ ] Gmail: Create test account, send reminder, check inbox
- [ ] Outlook: Create test account, send reminder, check inbox  
- [ ] Yahoo: Create test account, send reminder, check inbox
- [ ] Apple Mail: Create test account, send reminder, check inbox

### **Action Link Tests**
- [ ] JWT tokens expire after 15 minutes
- [ ] Snooze link works and updates followup
- [ ] Done link works and marks complete
- [ ] Calendar link downloads ICS file
- [ ] Reply-forward auto-cancels followup

---

## Environment Variables

### **Railway Backend**
```bash
# Email Provider
RESEND_API_KEY=re_xxxxx
SENDING_DOMAIN=mail.velora.cc
INBOUND_WEBHOOK_SECRET=your-secure-secret

# Security
JWT_SECRET=your-jwt-secret-key

# OpenAI
OPENAI_API_KEY=sk-xxxxx

# Firebase
FIREBASE_PROJECT_ID=velora-xxxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@velora-xxxxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## Success Criteria

### **Week 1 Goals**
- [ ] 95%+ inbox placement on seed accounts
- [ ] <2% bounce rate
- [ ] <0.1% complaint rate
- [ ] All action links working
- [ ] Reply-forward auto-cancel working

### **Week 2 Goals**
- [ ] 10 design partners successfully using system
- [ ] >70% reminder acceptance rate
- [ ] >50% receipt click-through rate
- [ ] <2.5s draft generation latency
- [ ] ±2 minute reminder timing accuracy

**If any metric fails, stop scaling and fix the issue before continuing.**

---

## Emergency Procedures

### **High Bounce Rate (>10%)**
1. Stop all sending immediately
2. Check DNS records for typos
3. Verify domain reputation on MXToolbox
4. Contact Resend support
5. Review recent email content for spam triggers

### **High Complaint Rate (>1%)**
1. Pause sending to affected user
2. Review email content and frequency
3. Check for unsubscribe link issues
4. Update template to be less aggressive
5. Implement better frequency capping

### **Webhook Failures**
1. Check Railway logs for errors
2. Verify webhook URL is accessible
3. Test webhook with curl
4. Check rate limiting isn't blocking legitimate requests
5. Implement retry logic with exponential backoff

---

**This setup is critical for production reliability. Do not launch without completing all items.**
