# Velora - Quick Interview Reference

## 🏗️ Architecture (30-second answer)

**Frontend (Vercel)**: Next.js 14, React, TypeScript, Firebase Auth, Firestore  
**Backend (Railway)**: Next.js API routes, OpenAI GPT-5-mini, Google OAuth  
**Database**: Firebase Firestore (NoSQL, real-time)  
**External**: Resend/Postmark (email), Google APIs (Gmail/Calendar/Drive)

**Why split?** Security (API keys server-side), scaling (independent), cost control (rate limiting)

---

## 🔄 Main Flow: Follow-Up Radar (60-second answer)

1. User BCCs `2d@in.velora.cc` on email
2. Email provider webhook → `POST /api/inbound-email`
3. Parse alias → compute due time (2 days)
4. Detect follow-up: **Heuristic first** (regex), **LLM fallback** (GPT-5-mini)
5. Deduplicate by `threadKey` (prevents duplicates)
6. Create followup in Firestore
7. Frontend shows in Radar UI (real-time listener)

**Key**: Rule-first (80% fast/cheap), AI fallback (20% accurate)

---

## 🔐 Authentication

**Google OAuth**: Frontend → Backend generates URL → Google → Callback → Exchange code → Store tokens  
**Firebase Auth**: Client-side SDK, security rules enforce access  
**JWT Links**: Signed action links in reminder emails (one-time use)

**Gap**: Tokens in localStorage (should be httpOnly cookies)

---

## 🤖 AI Usage

**Used**: Chat analysis, follow-up detection (fallback), draft generation, PDF analysis  
**Not Used**: Alias parsing, rate limiting, calendar generation (deterministic)

**Why**: AI for semantic understanding, rules for deterministic operations  
**Cost**: ~$0.004 per followup (heuristic-first keeps costs low)

---

## 💾 Database (Firestore)

**Collections**: `followups`, `memories`, `conversations`, `events`, `reminders`, `documents`, `rate_limits`

**Why Firestore**: Real-time updates, serverless, security rules, Firebase integration  
**Tradeoff**: Cost per read/write, query limitations, vendor lock-in

**Common Queries**: Get user's followups (filter by userId, status, order by dueAt)

---

## 🚀 Deployment

**Frontend**: Vercel (auto-deploy on push to main)  
**Backend**: Railway (Dockerfile/Nixpacks, auto-deploy)  
**Database**: Firebase Console (manual)

**Rollback**: Vercel (one-click), Railway (redeploy previous), Database (none)

**Gap**: No CI/CD checks, no staging environment

---

## 🐛 Known Issues

1. **Timezone hardcoded** → PST only (need user profile timezone)
2. **User email assumption** → @sdsu.edu hardcoded (need mapping collection)
3. **Tokens in localStorage** → XSS risk (need httpOnly cookies)
4. **No input sanitization** → XSS/prompt injection possible
5. **Race condition** → Duplicate detection not atomic (need transactions)

---

## ⚡ Tradeoffs

**Speed vs Correctness**:
- Heuristic-first: Fast but misses edge cases
- Fail-open rate limiting: Better UX but possible abuse
- Optimistic updates: Feels fast but can show wrong state

**AI vs Rules**:
- Rules: Fast, free, deterministic
- AI: Slow, expensive, handles edge cases

---

## 🎯 One Week Improvements

1. User email mapping (2 days)
2. Timezone support (1 day)
3. Input sanitization (1 day)
4. Error monitoring (1 day)
5. Pagination (1 day)

**Why**: Fixes real user issues, sets up better patterns

---

## 📊 Key Metrics

- Detection accuracy: ~85% (heuristic 80%, LLM 95%+)
- Cost per followup: ~$0.004
- Latency: <100ms (heuristic), 500ms-2s (LLM)
- Rate limits: 50/day, 10/hour, 3/minute

---

## 🎤 Interview Phrases

**"At a high level..."**: Start with user flow, then technical details  
**"The hardest part was..."**: Balancing speed vs accuracy, AI vs rules  
**"A known limitation is..."**: Timezone, email mapping, security gaps  
**"If I were to improve it..."**: User mapping, timezone, monitoring, sanitization

---

## 🔑 Core Concepts to Remember

1. **Rule-first detection** (80% fast path, 20% LLM fallback)
2. **Thread deduplication** (prevents spam)
3. **Rate limiting** (cost control, abuse prevention)
4. **Real-time updates** (Firestore listeners)
5. **Fail gracefully** (fallbacks, error handling)

---

**Full details**: See `VELORA_INTERVIEW_GUIDE.md`
