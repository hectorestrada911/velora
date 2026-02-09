# Follow-Up Radar Setup Guide

## Overview

Follow-Up Radar is Velora's flagship feature that tracks email follow-ups automatically. Users BCC Velora on emails, and we remind them at the right time with a pre-drafted reply and the exact quote that triggered it.

## Architecture

```
User BCCs email → Email Provider (Resend) → Webhook → /api/inbound-email
                                                   ↓
                                            Parse alias + Detect obligation
                                                   ↓
                                            Create followup in Firestore
                                                   ↓
                                     Worker checks every minute → Send reminder email
```

## Setup Steps

### 1. Email Provider Setup (Resend - Recommended)

1. **Create Resend Account**
   - Go to [resend.com](https://resend.com)
   - Sign up and verify your account
   - Add your domain (or use resend.dev for testing)

2. **Configure Inbound Email**
   ```bash
   # In Resend dashboard:
   # Go to Domains → Inbound
   # Add inbound email rule:
   #   - Match: *@in.velora.cc
   #   - Forward to: https://velora-production.up.railway.app/api/inbound-email
   ```

3. **Get API Key**
   - Go to API Keys in Resend dashboard
   - Create new API key
   - Add to environment variables

### 2. Environment Variables

Add these to both frontend and backend `.env.local`:

```bash
# Backend (Railway)
OPENAI_API_KEY=sk-...
INBOUND_WEBHOOK_SECRET=your_secret_here
OUTBOUND_API_KEY=re_...  # Resend API key
SENDING_DOMAIN=mail.velora.cc

# Frontend (Vercel)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

### 3. Firestore Indexes

Create these indexes in Firebase Console:

```
Collection: followups
Indexes:
  1. userId (ASC) + status (ASC) + dueAt (ASC)
  2. userId (ASC) + direction (ASC) + status (ASC) + dueAt (ASC)
  3. threadKey (ASC) + status (ASC)
```

### 4. DNS Configuration

For custom domain `in.velora.cc`:

```
# Add these DNS records:
Type: MX
Host: in.velora.cc
Value: mx.resend.com
Priority: 10

Type: TXT
Host: in.velora.cc
Value: v=spf1 include:_spf.resend.com ~all
```

### 5. Testing

Test the flow:

```bash
# 1. Send test email with BCC
To: test@example.com
BCC: 2d@in.velora.cc
Subject: Test follow-up
Body: Can you confirm by Thursday?

# 2. Check logs in Railway
# Should see: "Created followup xxx for user hector@sdsu.edu"

# 3. Check Firestore
# Collection: followups
# Should have new doc with dueAt ~2 days from now

# 4. Check Radar UI
# Go to /radar
# Should see the follow-up in "Upcoming" tab
```

## Alias Grammar

Users can BCC these aliases:

| Alias | Meaning | Example |
|-------|---------|---------|
| `2d@in.velora.cc` | Remind in 2 days | `2d@in.velora.cc` |
| `5m@in.velora.cc` | Remind in 5 minutes | `5m@in.velora.cc` |
| `3h@in.velora.cc` | Remind in 3 hours | `3h@in.velora.cc` |
| `tomorrow@in.velora.cc` | Tomorrow at 9am | `tomorrow@in.velora.cc` |
| `tomorrow2pm@in.velora.cc` | Tomorrow at 2pm | `tomorrow2pm@in.velora.cc` |
| `nextfri@in.velora.cc` | Next Friday at 9am | `nextfri@in.velora.cc` |
| `eow@in.velora.cc` | End of week (Fri 5pm) | `eow@in.velora.cc` |
| `eom@in.velora.cc` | End of month | `eom@in.velora.cc` |
| `follow@in.velora.cc` | Detect deadline from email | `follow@in.velora.cc` |
| `todo@in.velora.cc` | Turn inbound email into task | `todo@in.velora.cc` |

## User Mapping

For beta, we're using a simple mapping:

```
hector+2d@in.velora.cc → hector@sdsu.edu
```

TODO: Add user mapping table in Firestore:

```typescript
// Collection: radar_users
{
  aliasId: "hector",  // part before +
  email: "hector@sdsu.edu",
  timezone: "America/Los_Angeles",
  preferences: {
    defaultTone: "polite",
    digestTime: "17:00"  // 5pm
  }
}
```

## Detection Logic

### Heuristic (Fast Path - No LLM)

Detects these patterns:
- **Asks**: "can you confirm", "please review", "let me know"
- **Promises**: "I'll send", "let me circle back", "will do"
- **Deadlines**: "by tomorrow", "by EOD", "deadline is"

Confidence threshold: 0.65

### LLM (Slow Path - GPT-5-mini)

Falls back to LLM if heuristic fails or confidence < 0.75
- Prompt keeps context under 800 chars
- Returns JSON with direction, confidence, quote
- Cost: ~$0.0001 per detection

## Worker (Reminder Sending)

TODO: Implement worker process:

```typescript
// /backend/worker/index.ts
setInterval(async () => {
  const due = await radarService.getDueFollowups()
  
  for (const followup of due) {
    const draft = await generateDraft(followup)
    await sendReminderEmail(followup.userId, followup, draft)
    await radarService.updateFollowup(followup.id, {
      'analytics.lastReminderAt': Date.now()
    })
  }
}, 60_000)  // Every minute
```

Deploy worker separately on Railway with same environment variables.

## Cost Analysis

Per 1000 active users with 50 follow-ups each:

| Item | Cost |
|------|------|
| Firestore reads | $0.18 |
| Firestore writes | $0.54 |
| LLM detections (20% fallback) | $1.00 |
| Draft generation | $1.50 |
| Email sending (Resend) | $0.50 |
| **Total** | **$3.72** |

**Target**: $0.004 per followup (profitable at $12/mo for 200 followups)

## Monitoring

Key metrics to track:

1. **Product Metrics**:
   - `followups_created_per_day`
   - `followups_closed_per_day`
   - `median_time_to_close`
   - `draft_acceptance_rate`

2. **Technical Metrics**:
   - `webhook_latency_p95`
   - `detection_accuracy`
   - `llm_fallback_rate`
   - `email_delivery_rate`

## Rollout Plan

### Week 1: Core Loop
- [x] Firestore schema
- [x] Alias parser
- [x] Detection logic
- [x] Radar UI
- [x] Inbound webhook
- [ ] Email provider setup
- [ ] User mapping

### Week 2: Polish
- [ ] Worker + reminder emails
- [ ] Snooze/Done links (JWT)
- [ ] Daily digest
- [ ] ICS calendar blocks

### Week 3: Beta
- [ ] 10 design partners
- [ ] Feedback loop
- [ ] Cost optimization
- [ ] Public launch

## Troubleshooting

### Webhook not receiving emails
1. Check DNS records for `in.velora.cc`
2. Verify webhook URL in Resend dashboard
3. Check Railway logs for errors
4. Test webhook directly with curl

### Follow-ups not appearing in UI
1. Check Firestore for new docs in `followups` collection
2. Verify user email mapping
3. Check console for API errors
4. Verify Firebase auth

### Drafts not generating
1. Check OpenAI API key
2. Verify sufficient credits
3. Check network/CORS issues
4. Fall back to template drafts

## Support

For issues:
1. Check Railway logs: `https://railway.app/project/velora/logs`
2. Check Firestore data: Firebase Console
3. Email: hector@velora.cc

---

**Status**: v1 implementation complete, awaiting email provider setup for live testing.

