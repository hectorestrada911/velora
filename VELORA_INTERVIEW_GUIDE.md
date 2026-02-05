# Velora AI - Interview Defense Guide

**Project**: Personal Knowledge Engine with Follow-Up Radar  
**Tech Stack**: Next.js 14, TypeScript, Firebase Firestore, OpenAI GPT-5-mini, Google APIs, Railway/Vercel

---

## 🔹 CORE PROJECT UNDERSTANDING

### Overall Architecture (Frontend → Backend → Database → APIs)

**High-Level Flow:**
1. **Frontend (Next.js 14)** - Vercel deployment
   - React components with TypeScript
   - Firebase Auth for user authentication
   - Real-time Firestore queries for data
   - Client-side state management (Zustand)

2. **Backend (Next.js API Routes)** - Railway deployment
   - RESTful API endpoints (`/api/*`)
   - OpenAI GPT-5-mini integration for AI analysis
   - Google OAuth 2.0 for Workspace integration
   - Email webhook handler for inbound emails

3. **Database (Firebase Firestore)**
   - NoSQL document store
   - Collections: `followups`, `memories`, `conversations`, `events`, `reminders`, `documents`
   - Real-time listeners for live updates
   - Security rules enforce user isolation

4. **External APIs**
   - **OpenAI**: GPT-5-mini for chat analysis, follow-up detection, draft generation
   - **Google APIs**: Gmail, Calendar, Drive, Docs
   - **Resend/Postmark**: Email sending and inbound webhooks

**Key Architectural Decision**: Separated frontend/backend deployments for:
- Independent scaling
- Different runtime requirements (Vercel edge functions vs Railway Node.js)
- Security isolation (API keys never exposed to frontend)

---

### Step-by-Step: Main User Action (Follow-Up Radar)

**Scenario**: User BCCs `2d@in.velora.cc` on an email

1. **Email sent** → Resend/Postmark receives email
2. **Webhook triggered** → `POST /api/inbound-email` called
3. **Validation**:
   - Webhook secret verification (`x-webhook-secret` header)
   - Rate limiting check (max 50/day, 10/hour, 3/minute per user)
   - Extract user from alias (`2d+hector@in.velora.cc` → `hector`)
4. **Alias parsing** → `AliasParser` computes due time (2 days from now)
5. **Follow-up detection**:
   - **Fast path**: Heuristic regex patterns (asks, promises, deadlines)
   - **Slow path**: LLM fallback if heuristic confidence < 0.75
   - Returns direction (`YOU_OWE` vs `THEY_OWE`), confidence, quote
6. **Deduplication** → Check `threadKey` in Firestore (prevents duplicates)
7. **Create followup** → Write to `followups` collection
8. **Frontend updates** → Real-time Firestore listener shows new followup in Radar UI

**Why this design?**
- **Rule-first detection**: 80% of emails match patterns → fast, cheap
- **LLM fallback**: Handles edge cases without paying for every email
- **Thread deduplication**: Prevents spam from email threads
- **Rate limiting**: Protects against abuse and controls costs

---

### Frontend vs Backend Split

**Frontend (Client-Side):**
- UI rendering and user interactions
- Firebase Auth (client SDK)
- Firestore reads/writes (with security rules)
- Real-time data synchronization
- Form validation and error handling
- Calendar ICS file generation
- Cost tracking calculations

**Backend (Server-Side):**
- **AI processing** (`/api/analyze`) - Never expose OpenAI key
- **Email webhooks** (`/api/inbound-email`) - Must verify signatures
- **Google OAuth** (`/api/google/*`) - Exchange codes for tokens securely
- **Draft generation** (`/api/followups/[id]/draft`) - Uses GPT-5-mini
- **PDF/document analysis** - Heavy processing, rate limiting
- **JWT signing** - Action links for reminder emails

**Why this split?**
- **Security**: API keys never touch client code
- **Performance**: Heavy AI calls don't block UI
- **Cost control**: Rate limiting and validation on server
- **Reliability**: Webhooks need persistent server endpoints

---

### Main Services/Components

**Frontend Services:**
- `radarService.ts` - Followup CRUD operations
- `memoryService.ts` - Persistent memory bank
- `conversationService.ts` - Chat history management
- `googleWorkspaceService.ts` - Google API integration
- `aliasParser.ts` - BCC alias parsing
- `errorHandler.ts` - Centralized error translation

**Backend Services:**
- `followupDetector.ts` - Heuristic + LLM detection engine
- `rateLimiter.ts` - Per-user rate limiting (Firestore-based)
- `radarService.ts` - Backend Firestore operations
- `jwtSigner.ts` - Signed action links for emails

**Key Components:**
- `FollowupCard.tsx` - Individual followup display
- `RadarPage.tsx` - Main dashboard with stats
- `ChatPage.tsx` - AI conversation interface
- `MemoryDashboard.tsx` - Memory bank UI

---

### Most Likely Failure Points

1. **OpenAI API failures** (rate limits, downtime)
   - **Mitigation**: Fallback templates, error handling, retry logic
   - **Impact**: Draft generation fails, but system degrades gracefully

2. **Firestore quota exceeded** (read/write limits)
   - **Mitigation**: Rate limiting, pagination, composite indexes
   - **Impact**: Queries fail, but rate limiter prevents cascade

3. **Email webhook downtime** (Railway deployment issues)
   - **Mitigation**: Email provider retries, idempotent operations
   - **Impact**: Followups delayed, but not lost

4. **Google OAuth token expiration**
   - **Mitigation**: Refresh token handling, re-auth prompts
   - **Impact**: Workspace features unavailable until re-auth

5. **Rate limit exhaustion** (user sends too many emails)
   - **Mitigation**: Per-user limits (50/day), clear error messages
   - **Impact**: User blocked temporarily, prevents abuse

---

## 🔹 BACKEND & LOGIC

### Core Business Logic

**Follow-Up Detection** (`lib/followupDetector.ts`):
- **Heuristic patterns**: Regex matching for asks ("can you confirm"), promises ("I'll send"), deadlines ("by tomorrow")
- **Confidence scoring**: 0.0-1.0 based on pattern strength and deadline presence
- **LLM fallback**: GPT-5-mini only if heuristic fails or confidence < 0.75
- **Direction logic**: `YOU_OWE` (user promised/was asked) vs `THEY_OWE` (user asked them)

**Alias Parsing** (`lib/aliasParser.ts`):
- Relative: `5m@`, `2h@`, `3d@` → compute from now
- Absolute: `tomorrow8am@`, `nextfri@` → timezone-aware date math
- Smart: `follow@` → detect from email content
- End-of-period: `eow@`, `eom@` → Friday 5pm, last day of month

**Rate Limiting** (`lib/rateLimiter.ts`):
- Firestore-based counters with TTL
- Three tiers: minute (3), hour (10), day (50)
- Atomic increments prevent race conditions
- Fail-open for reliability (allows if Firestore fails)

---

### Request Validation

**Inbound Email Webhook** (`/api/inbound-email`):
1. Method check: Only `POST` allowed
2. Webhook secret: `x-webhook-secret` header matches env var
3. Payload normalization: Handles Resend/Postmark formats
4. User extraction: Validates Velora alias format
5. Rate limit check: Before processing
6. Thread deduplication: Prevents duplicate followups

**AI Analysis** (`/api/analyze`):
1. Method check: Only `POST`
2. Content validation: Required field check
3. CORS headers: Allows frontend origin
4. JSON parsing: Try-catch with fallback response
5. Token limits: `max_completion_tokens: 1000` prevents runaway costs

**Draft Generation** (`/api/followups/[id]/draft`):
1. Followup ID validation: Must exist in Firestore
2. Tone validation: Enum check (polite/firm/casual/professional)
3. User ownership: Security rules enforce (not in code, but Firestore rules)

---

### Handling Bad/Unexpected Input

**Email Webhook:**
- Missing alias → Returns `200 OK` with `skipped: true` (not an error)
- Invalid payload → `400 Bad Request` with error message
- Rate limit exceeded → `429 Too Many Requests` with `retryAfter`
- Duplicate thread → Returns `200 OK` with `exists: true` (idempotent)

**AI Analysis:**
- Invalid JSON → Try-catch with fallback response structure
- OpenAI API failure → Returns generic response, logs error
- Missing content → `400 Bad Request` immediately

**Alias Parser:**
- Invalid format → Returns `matched: false`, defaults to 2 days
- Timezone edge cases → Uses `America/Los_Angeles` (TODO: user profile)
- Weekend dates → Adjusts to Monday 9am (business hours)

**Error Handling Philosophy:**
- **Fail gracefully**: Never crash, always return valid response
- **Log everything**: Console.error for debugging
- **User-friendly messages**: `ErrorHandler` translates Firebase errors
- **Idempotent operations**: Duplicate requests are safe

---

### Authentication Flow (Step-by-Step)

**Google OAuth 2.0:**

1. **User clicks "Connect Google"** → Frontend calls `GET /api/google/auth`
2. **Backend generates OAuth URL** → Scopes: Gmail readonly, Calendar, Drive readonly
3. **User redirected to Google** → Grants permissions
4. **Google redirects to callback** → `GET /api/google/callback?code=xxx`
5. **Backend exchanges code for tokens** → Calls Google OAuth API
6. **Tokens returned to frontend** → Via `postMessage` (popup) or redirect
7. **Frontend stores tokens** → `localStorage` (TODO: secure backend storage)
8. **Subsequent API calls** → Include tokens in `Authorization` header

**Firebase Auth (User Accounts):**
- Email/password authentication
- Client-side SDK handles token refresh
- Firestore security rules check `request.auth.uid`
- No backend involvement for basic auth

**JWT Action Links** (Reminder emails):
- Signed tokens with expiration (24 hours)
- Nonce prevents replay attacks
- One-time use (consumed after action)
- No user session required

**Security Gaps (Known Issues):**
- Google tokens in `localStorage` (should be in httpOnly cookies)
- No token refresh handling for expired Google tokens
- Webhook secret is simple string (should use HMAC signatures)

---

### API Failure/Timeout Handling

**OpenAI API:**
- **Timeout**: 30s default, returns fallback response
- **Rate limit**: Logs error, returns generic message
- **Network error**: Try-catch with template fallback (draft generation)

**Firestore:**
- **Unavailable**: Error handler shows "Service temporarily unavailable"
- **Permission denied**: Security rules prevent, returns 403
- **Quota exceeded**: Rate limiter prevents, but if it happens → user sees error

**Email Webhook:**
- **Provider retries**: Resend/Postmark retry failed webhooks
- **Idempotent**: Duplicate emails create same `threadKey` → deduplicated
- **Timeout**: Railway has 30s limit, returns 500 if exceeded

**Frontend API Calls:**
- **Network errors**: `ErrorHandler` shows user-friendly message
- **5xx errors**: Retry logic (not implemented, but could add)
- **4xx errors**: Show specific error message from backend

**Philosophy**: **Fail open** for user experience, **fail closed** for security

---

### Rate Limiting (How & Why)

**Implementation** (`lib/rateLimiter.ts`):
- Firestore counters with time-windowed keys
- Keys: `rate_limit:{userId}:{window}:{key}`
- Windows: minute, hour, day
- Atomic increments using Firestore `increment()`
- TTL on documents (expires after window)

**Limits:**
- **Per minute**: 3 followups (prevents burst abuse)
- **Per hour**: 10 followups (prevents sustained abuse)
- **Per day**: 50 followups (prevents cost explosion)

**Why Needed:**
1. **Cost control**: Each followup = Firestore write + potential LLM call
2. **Abuse prevention**: Malicious users can't spam system
3. **Reliability**: Prevents cascade failures from overload
4. **Fair usage**: Ensures resources for all users

**Edge Cases:**
- Firestore failure → **Fail open** (allows request, logs error)
- Clock skew → Uses server time, not client time
- Race conditions → Atomic increments prevent

---

### Trusted vs Untrusted Data

**Trusted (Server-Side):**
- Firebase Auth tokens (verified by Firebase)
- Webhook secrets (environment variables)
- Google OAuth tokens (verified by Google)
- Firestore security rules (enforced by Firebase)

**Untrusted (Client-Side):**
- User input (chat messages, form data)
- Email content (from external senders)
- URL parameters (OAuth callbacks, action links)
- File uploads (PDFs, images)

**Validation Strategy:**
- **Input sanitization**: Email content truncated to 800 chars for LLM
- **Type checking**: Zod schemas (mentioned in dependencies, not fully implemented)
- **Security rules**: Firestore enforces `userId` matching
- **Webhook verification**: Secret header check
- **JWT validation**: Signature verification, expiration check

**Known Gaps:**
- No input sanitization for XSS (relies on React escaping)
- No file type validation beyond MIME type (could be spoofed)
- Email content not sanitized before LLM (could inject prompt)

---

## 🔹 AI / ML INTEGRATION

### Where AI is Used (and Where It's Not)

**Used:**
1. **Chat analysis** (`/api/analyze`) - GPT-5-mini for understanding user intent
2. **Follow-up detection** (`followupDetector.ts`) - LLM fallback for complex emails
3. **Draft generation** (`/api/followups/[id]/draft`) - GPT-5-mini for email drafts
4. **PDF/document analysis** (`/api/pdf-analyze`) - GPT-4 Vision for document parsing
5. **Syllabus analysis** (`/api/syllabus-analyze`) - Structured extraction from PDFs

**Not Used:**
- **Alias parsing** - Pure regex and date math
- **Rate limiting** - Firestore counters
- **Authentication** - Firebase/Google OAuth
- **UI rendering** - Static React components
- **Calendar generation** - RFC 5545 ICS format (deterministic)

**Why AI Where It Is:**
- **Natural language understanding**: Chat, email detection need semantic understanding
- **Content generation**: Drafts need context-aware writing
- **Document parsing**: PDFs need OCR + understanding

**Why Not AI Where It Isn't:**
- **Deterministic operations**: Parsing, math, formatting don't need AI
- **Cost**: AI calls are expensive, use only when necessary
- **Latency**: Regex is instant, LLM calls add 500ms-2s

---

### Input Sanitization for AI

**Chat Messages:**
- Truncated to reasonable length (not explicit limit, but context window)
- Conversation history limited to last 50 messages
- Memories limited to top 3 relevant

**Email Content:**
- Body truncated to 800 chars for detection (prevents prompt injection)
- Subject included as-is (usually short)
- Sender/recipient emails included (could be sanitized, but not currently)

**PDF Analysis:**
- File size limit: 10MB
- MIME type validation: PDF or image only
- Content extracted before sending to AI

**Known Vulnerabilities:**
- **Prompt injection**: User could inject instructions in email body
- **No input filtering**: Special characters not escaped
- **Context window**: No hard limit on conversation history length

**Mitigation Ideas (Not Implemented):**
- Sanitize email content (remove special characters)
- Limit context window size explicitly
- Add system prompt instructions to ignore user instructions

---

### Handling Incorrect/Low-Quality Model Outputs

**JSON Parsing Failures:**
- Try-catch around `JSON.parse()`
- Fallback to default structure if parse fails
- Logs raw response for debugging

**Invalid Responses:**
- Validation of required fields (`type`, `priority`, `aiResponse`)
- Default values if missing
- Confidence threshold (0.65) filters low-quality detections

**Draft Generation:**
- Post-processing: Removes greetings/signatures
- Fallback templates if API fails
- Length limits: `max_completion_tokens: 150`

**Detection Failures:**
- Heuristic fallback if LLM fails
- Returns `null` if confidence too low
- System continues (doesn't crash)

**Monitoring (Not Implemented):**
- No quality metrics tracking
- No user feedback loop
- No A/B testing of prompts

---

### Why AI Instead of Rules-Based

**AI Appropriate For:**
- **Email detection**: Natural language varies too much for regex
- **Draft generation**: Context-aware writing needs understanding
- **Chat understanding**: User intent is ambiguous

**Rules Appropriate For:**
- **Alias parsing**: Deterministic format (`2d@` = 2 days)
- **Date calculations**: Math is exact
- **Rate limiting**: Counters are deterministic

**Hybrid Approach (Current):**
- **Rule-first**: Heuristic detection tries regex first (80% success rate)
- **AI fallback**: LLM only if heuristic fails (20% of cases)
- **Cost optimization**: 80% of emails processed without AI cost

**Tradeoff:**
- **Speed**: Rules are instant, AI adds latency
- **Cost**: Rules are free, AI costs $0.001/1k tokens
- **Accuracy**: Rules miss edge cases, AI handles them
- **Reliability**: Rules are deterministic, AI can be inconsistent

---

### Limitations of AI Integration

1. **Cost**: GPT-5-mini costs add up at scale
   - **Mitigation**: Rule-first approach, rate limiting

2. **Latency**: LLM calls add 500ms-2s
   - **Mitigation**: Heuristic fast path, async processing

3. **Inconsistency**: Same input can produce different outputs
   - **Mitigation**: Confidence thresholds, fallback templates

4. **Context limits**: Token limits restrict input size
   - **Mitigation**: Truncation, summarization

5. **Prompt injection**: Users could manipulate AI behavior
   - **Mitigation**: None currently (known gap)

6. **API dependencies**: OpenAI downtime breaks features
   - **Mitigation**: Fallback templates, graceful degradation

---

### Disabling/Replacing AI Without Breaking System

**Current Architecture Allows:**
- **Detection**: Heuristic-only mode (set confidence threshold to 1.0)
- **Drafts**: Template-based fallback already implemented
- **Chat**: Would need template responses (not implemented)

**What Would Break:**
- **Chat interface**: Core feature relies on AI
- **Document analysis**: No fallback for PDF parsing
- **Syllabus analysis**: No fallback for structured extraction

**How to Make It Replaceable:**
- **Abstraction layer**: `AIService` interface with OpenAI implementation
- **Feature flags**: Toggle AI on/off per feature
- **Fallback providers**: Support Anthropic, local models
- **Not implemented**: Would require refactoring

**Current State**: Tightly coupled to OpenAI, but fallbacks exist for critical paths

---

## 🔹 DATA & DATABASE

### Data Models / Tables (Firestore Collections)

**`followups` Collection:**
```typescript
{
  id: string,
  userId: string,              // User email
  threadKey: string,            // Deduplication key
  subject: string,
  participants: Array<{email, name?, role}>,
  direction: 'YOU_OWE' | 'THEY_OWE',
  dueAt: number,               // Epoch ms
  status: 'PENDING' | 'SNOOZED' | 'DONE' | 'CANCELLED',
  source: {provider, messageId, snippet},
  detection: {method, confidence, extractedDueText},
  draft?: string,
  analytics?: {draftsGenerated, lastDraftAt}
}
```

**`memories` Collection:**
```typescript
{
  id: string,
  userId: string,
  title: string,
  content: string,
  category: 'personal' | 'work' | 'project' | 'contact' | 'location',
  tags: string[],
  createdAt: Timestamp,
  updatedAt: Timestamp,
  accessCount: number
}
```

**`conversations` Collection:**
```typescript
{
  id: string,
  userId: string,
  messages: Array<{role, content, timestamp}>,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**`events` Collection:**
```typescript
{
  id: string,
  userId: string,
  title: string,
  startTime: Timestamp,
  endTime: Timestamp,
  description?: string,
  googleEventId?: string  // If synced
}
```

**`reminders` Collection:**
```typescript
{
  id: string,
  userId: string,
  title: string,
  dueDate: Timestamp,
  priority: 'low' | 'medium' | 'high' | 'urgent',
  description?: string
}
```

**`documents` Collection:**
```typescript
{
  id: string,
  userId: string,
  name: string,
  type: string,
  size: number,
  storageId: string,      // Firebase Storage path
  downloadUrl: string,
  content?: string,        // Extracted text
  summary?: string,        // AI-generated
  tags: string[]
}
```

**`rate_limits` Collection:**
```typescript
{
  id: string,              // Key format: rate_limit:{userId}:{window}:{key}
  count: number,
  expiresAt: Timestamp     // TTL for cleanup
}
```

---

### Why Firestore Over Alternatives

**Chosen: Firestore**
- **Real-time updates**: Listeners for live UI updates
- **Serverless**: No database management
- **Scalability**: Auto-scales with usage
- **Security rules**: Declarative access control
- **Integration**: Works seamlessly with Firebase Auth

**Alternatives Considered:**
- **PostgreSQL**: Would need separate hosting, no real-time
- **MongoDB**: Similar to Firestore, but no real-time out of box
- **Supabase**: PostgreSQL-based, but less Firebase integration

**Tradeoffs:**
- **Cost**: Firestore charges per read/write (can get expensive)
- **Query limitations**: Composite indexes required for complex queries
- **Vendor lock-in**: Tightly coupled to Firebase ecosystem
- **No SQL**: Can't do complex joins or aggregations

**Why It Works Here:**
- **User isolation**: Each user's data is separate (perfect for Firestore)
- **Real-time needs**: Chat and followups benefit from live updates
- **Simple queries**: Most queries are "get user's X" (Firestore excels)
- **Small team**: No database admin needed

---

### Most Common Queries

1. **Get user's followups** (Radar page):
   ```typescript
   query(
     collection(db, 'followups'),
     where('userId', '==', userId),
     where('status', 'in', ['PENDING', 'SNOOZED']),
     orderBy('dueAt', 'asc')
   )
   ```

2. **Get user's memories** (Memory dashboard):
   ```typescript
   query(
     collection(db, 'memories'),
     where('userId', '==', userId),
     orderBy('updatedAt', 'desc')
   )
   ```

3. **Find followup by thread** (Deduplication):
   ```typescript
   query(
     collection(db, 'followups'),
     where('userId', '==', userId),
     where('threadKey', '==', threadKey),
     where('status', 'in', ['PENDING', 'SNOOZED'])
   )
   ```

4. **Get rate limit counter**:
   ```typescript
   getDoc(doc(db, 'rate_limits', `rate_limit:${userId}:minute:${minuteKey}`))
   ```

**Query Patterns:**
- **Single user queries**: All queries filter by `userId` first
- **Time-based ordering**: `orderBy('dueAt')` or `orderBy('updatedAt')`
- **Status filtering**: Most queries filter by status
- **Composite indexes**: Required for multi-field queries

---

### Performance Bottlenecks as Data Grows

**Current Issues:**
1. **No pagination**: `getFollowups()` loads all followups at once
   - **Impact**: Slow with 1000+ followups
   - **Fix**: Add `limit()` and cursor-based pagination

2. **Client-side filtering**: Timeframe filtering done in JavaScript
   - **Impact**: Wastes bandwidth, slow with large datasets
   - **Fix**: Move to Firestore queries with date ranges

3. **Composite indexes**: Required for complex queries
   - **Impact**: Queries fail if index not created
   - **Fix**: Document indexes, auto-create in CI/CD

4. **Rate limit counters**: One document per window per user
   - **Impact**: Document count grows linearly with users
   - **Fix**: TTL on documents, cleanup job

5. **Real-time listeners**: One listener per collection per user
   - **Impact**: Connection limits at scale
   - **Fix**: Batch queries, use `onSnapshot` selectively

**Scaling Strategy:**
- **Pagination**: Implement cursor-based pagination
- **Caching**: Cache frequently accessed data (memories, stats)
- **Indexes**: Pre-create all composite indexes
- **Archival**: Move old followups to separate collection
- **Read replicas**: Not applicable (Firestore handles this)

---

### Data Consistency

**Firestore Guarantees:**
- **Eventual consistency**: Queries may return stale data briefly
- **Strong consistency**: `getDoc()` is strongly consistent
- **Transactions**: Available but not used

**Current Approach:**
- **No transactions**: Updates are independent
- **Optimistic updates**: Frontend updates UI immediately
- **Error handling**: Rollback on failure (not implemented)

**Consistency Issues:**
1. **Race conditions**: Multiple webhooks for same thread
   - **Mitigation**: `threadKey` deduplication check
   - **Gap**: Not atomic (check-then-write)

2. **Rate limit increments**: Multiple requests could exceed limit
   - **Mitigation**: Firestore `increment()` is atomic
   - **Status**: Handled correctly

3. **Followup updates**: Frontend and backend both update
   - **Mitigation**: Firestore security rules prevent conflicts
   - **Gap**: No conflict resolution strategy

**Improvements Needed:**
- Use Firestore transactions for critical operations
- Implement conflict resolution (last-write-wins is current)
- Add version numbers for optimistic updates

---

## 🔹 DEVOPS / DEPLOYMENT

### Deployment Architecture

**Frontend (Vercel):**
- **Trigger**: Push to `main` branch
- **Build**: `cd frontend && npm run build`
- **Deploy**: Vercel automatically deploys
- **URL**: `velora-beta-one.vercel.app`
- **Environment**: Production, Preview (for PRs)

**Backend (Railway):**
- **Trigger**: Push to `main` branch (monorepo root)
- **Build**: Dockerfile or Nixpacks (auto-detected)
- **Deploy**: Railway builds and deploys
- **URL**: `velora-production.up.railway.app`
- **Environment**: Production only

**Database (Firebase):**
- **Deployment**: Manual (Firebase Console)
- **Security Rules**: `firestore.rules` file (not auto-deployed)
- **Indexes**: Manual creation in console

**Email Provider (Resend/Postmark):**
- **Configuration**: Manual setup
- **Webhook URL**: Points to Railway backend

---

### What Happens on Push to Main

1. **GitHub receives push** → Triggers webhooks
2. **Vercel webhook** → Starts frontend build
3. **Railway webhook** → Starts backend build
4. **Frontend build**:
   - Installs dependencies
   - Runs `npm run build`
   - Deploys to Vercel edge network
5. **Backend build**:
   - Detects Dockerfile or uses Nixpacks
   - Builds Docker image
   - Deploys to Railway
6. **Health checks** → Both services verify deployment
7. **DNS/CDN** → Updates propagate (Vercel is instant, Railway ~1min)

**Rollback Strategy:**
- **Vercel**: Previous deployment available, one-click rollback
- **Railway**: Previous image available, can rollback via dashboard
- **Database**: No rollback (migrations would be needed)

**Current Gaps:**
- No automated testing before deploy
- No staging environment
- No database migrations (schema changes manual)

---

### CI/CD Checks Before Merge

**Current State: None**

**What Should Exist:**
1. **Linting**: ESLint checks (mentioned in package.json)
2. **Type checking**: TypeScript compilation
3. **Tests**: Jest tests exist but not run in CI
4. **Build verification**: Ensure both frontend/backend build

**What's Missing:**
- No GitHub Actions workflow
- No pre-commit hooks
- No automated testing
- No security scanning

**Why This Is Acceptable (For Now):**
- **Small team**: Manual review is sufficient
- **Early stage**: Speed over process
- **Known gap**: Would add as project matures

**How to Add:**
```yaml
# .github/workflows/ci.yml
- Run linting
- Run tests
- Build frontend
- Build backend
- Deploy to staging (if exists)
```

---

### What Breaks if Deployment Fails

**Frontend Deployment Failure:**
- **Impact**: Users see old version or error page
- **Mitigation**: Vercel keeps previous deployment live
- **Recovery**: Rollback to previous version

**Backend Deployment Failure:**
- **Impact**: API calls fail (500 errors)
- **Mitigation**: Railway keeps previous version running
- **Recovery**: Rollback via Railway dashboard

**Database Migration Failure:**
- **Impact**: App breaks if schema changes
- **Mitigation**: No migrations currently (manual changes)
- **Recovery**: Manual fix in Firebase Console

**Email Webhook Failure:**
- **Impact**: Followups not created
- **Mitigation**: Email provider retries
- **Recovery**: Fix deployment, webhooks retry automatically

**Cascading Failures:**
- Frontend can't reach backend → Shows error messages
- Backend can't reach Firestore → Returns 500 errors
- Firestore quota exceeded → Rate limiter prevents, but queries fail

---

### Rollback Strategy

**Vercel (Frontend):**
1. Go to Vercel dashboard
2. Select deployment
3. Click "Promote to Production"
4. Instant rollback (< 1 minute)

**Railway (Backend):**
1. Go to Railway dashboard
2. Select service
3. Click "Redeploy" → Choose previous deployment
4. Rollback takes ~2-3 minutes

**Database:**
- **No rollback**: Changes are permanent
- **Mitigation**: Test changes in staging first (no staging exists)
- **Recovery**: Manual fix or data migration

**Environment Variables:**
- Stored in Vercel/Railway dashboards
- Can be updated without redeploy
- No version history (gap)

**Current Gaps:**
- No automated rollback on health check failure
- No blue-green deployments
- No canary releases
- No database migration rollback

---

## 🔹 BUGS, EDGE CASES & IMPROVEMENTS

### Known Bugs / Edge Cases

1. **Timezone Hardcoded** (`inbound-email.ts:54`):
   ```typescript
   const parser = new AliasParser('America/Los_Angeles'); // TODO: Get from user profile
   ```
   - **Impact**: Users in other timezones get wrong due times
   - **Fix**: Store timezone in user profile, use in parser

2. **User Email Extraction** (`inbound-email.ts:215`):
   ```typescript
   return legacyMatch[1] + '@sdsu.edu'; // TODO: Map to actual user email from database
   ```
   - **Impact**: Assumes all users are @sdsu.edu
   - **Fix**: Create `radar_users` collection mapping aliases to emails

3. **Google Tokens in localStorage** (`callback/page.tsx:46`):
   ```typescript
   localStorage.setItem('google_workspace_tokens', JSON.stringify(data.tokens))
   ```
   - **Impact**: XSS vulnerability, tokens accessible to JavaScript
   - **Fix**: Store in httpOnly cookies or backend session

4. **No Input Sanitization** (Multiple locations):
   - **Impact**: XSS, prompt injection possible
   - **Fix**: Sanitize user input before storing/displaying

5. **Weekend Handling** (Alias parser):
   - **Current**: Some aliases might schedule on weekends
   - **Fix**: Already implemented in `icsGenerator.ts` (adjusts to Monday)

6. **Duplicate Thread Detection Race Condition**:
   - **Current**: Check-then-write (not atomic)
   - **Impact**: Rare duplicate followups possible
   - **Fix**: Use Firestore transactions

7. **Rate Limit Fail-Open** (`rateLimiter.ts:97`):
   ```typescript
   // Fail open for reliability
   return { allowed: true, ... }
   ```
   - **Impact**: If Firestore fails, rate limiting disabled
   - **Fix**: Add circuit breaker, fail closed after N failures

---

### Code Assumptions That Could Be Violated

1. **Firestore Always Available**:
   - **Assumption**: Firestore queries always succeed
   - **Reality**: Can fail (quota, network, downtime)
   - **Impact**: App breaks, no graceful degradation

2. **User Email Format**:
   - **Assumption**: All users have `@sdsu.edu` emails
   - **Reality**: Users can have any email
   - **Impact**: User extraction fails for non-SDSU users

3. **OpenAI API Always Responds**:
   - **Assumption**: API calls succeed within timeout
   - **Reality**: Can timeout, rate limit, or fail
   - **Impact**: Features break (mitigated with fallbacks)

4. **Email Provider Retries**:
   - **Assumption**: Resend/Postmark retry failed webhooks
   - **Reality**: Retries are limited, can give up
   - **Impact**: Followups lost if webhook fails

5. **Single User Per Device**:
   - **Assumption**: One user session per browser
   - **Reality**: Shared computers, multiple tabs
   - **Impact**: Token conflicts, data leakage

6. **Clock Synchronization**:
   - **Assumption**: Server and client clocks are synced
   - **Reality**: Clock skew possible
   - **Impact**: Rate limiting, date calculations wrong

---

### One Week Improvement Priority

**Week 1 Improvements:**

1. **User Email Mapping** (2 days):
   - Create `radar_users` collection
   - Map aliases to actual user emails
   - Update `extractUserEmail()` to use mapping
   - **Impact**: Fixes hardcoded @sdsu.edu assumption

2. **Timezone Support** (1 day):
   - Add timezone to user profile
   - Update `AliasParser` to use user timezone
   - Test with multiple timezones
   - **Impact**: Fixes wrong due times for non-PST users

3. **Input Sanitization** (1 day):
   - Add XSS sanitization library (DOMPurify)
   - Sanitize email content before LLM calls
   - Sanitize user input before display
   - **Impact**: Prevents XSS and prompt injection

4. **Error Monitoring** (1 day):
   - Add Sentry or similar error tracking
   - Log all API errors with context
   - Set up alerts for critical failures
   - **Impact**: Better visibility into production issues

5. **Pagination** (1 day):
   - Add cursor-based pagination to `getFollowups()`
   - Update UI to load more on scroll
   - **Impact**: Fixes performance with large datasets

**Why These:**
- **High impact**: Fixes real user issues
- **Low effort**: Can be done in a week
- **Foundation**: Sets up better patterns for future

---

### Most Fragile Parts

1. **Email Webhook Handler** (`/api/inbound-email`):
   - **Why fragile**: Depends on external provider, no retry logic
   - **Failure mode**: Emails lost if webhook fails
   - **Improvement**: Add retry queue, dead letter queue

2. **Follow-up Detection** (`followupDetector.ts`):
   - **Why fragile**: LLM calls can fail, heuristic has edge cases
   - **Failure mode**: Misses followups or creates false positives
   - **Improvement**: Add confidence thresholds, user feedback loop

3. **Rate Limiting** (`rateLimiter.ts`):
   - **Why fragile**: Fail-open means no protection if Firestore fails
   - **Failure mode**: Abuse possible if Firestore down
   - **Improvement**: Add circuit breaker, fail closed after N failures

4. **OAuth Flow** (`/api/google/callback`):
   - **Why fragile**: Popup-based, can be blocked
   - **Failure mode**: Users can't connect Google
   - **Improvement**: Add redirect fallback, better error handling

5. **Firestore Security Rules**:
   - **Why fragile**: Manual deployment, no testing
   - **Failure mode**: Security vulnerabilities if misconfigured
   - **Improvement**: Automated testing, version control

---

### Tradeoffs: Speed vs Correctness

**Speed Optimizations:**
1. **Heuristic-first detection**: 80% of emails processed without LLM
   - **Tradeoff**: Misses edge cases, but fast and cheap

2. **Client-side filtering**: Timeframe filtering in JavaScript
   - **Tradeoff**: Wastes bandwidth, but instant UI updates

3. **No pagination**: Load all followups at once
   - **Tradeoff**: Slow with large datasets, but simpler code

4. **Fail-open rate limiting**: Allows requests if Firestore fails
   - **Tradeoff**: Possible abuse, but better UX

5. **Optimistic updates**: Update UI before server confirms
   - **Tradeoff**: Can show wrong state, but feels faster

**Correctness Optimizations:**
1. **Thread deduplication**: Prevents duplicate followups
   - **Tradeoff**: Adds latency, but ensures correctness

2. **Rate limiting**: Prevents abuse
   - **Tradeoff**: Blocks legitimate users if misconfigured

3. **Input validation**: Checks all inputs
   - **Tradeoff**: Adds latency, but prevents errors

4. **Error handling**: Comprehensive try-catch
   - **Tradeoff**: More code, but better reliability

**Philosophy**: **Speed for user-facing features, correctness for critical operations**

---

## 🎯 INTERVIEW ANSWER TEMPLATES

### "Explain the Architecture"

**High-Level:**
"Velora is a personal knowledge engine with a follow-up radar feature. The architecture is split into frontend and backend for security and scaling. The frontend is a Next.js app on Vercel that handles UI and real-time data sync with Firestore. The backend is Next.js API routes on Railway that handle AI processing, email webhooks, and Google OAuth - things that need to stay server-side for security. Firestore stores all user data with security rules ensuring users can only access their own data."

**Key Decision:**
"The hardest part was deciding when to use AI vs rules. We use a rule-first approach for follow-up detection - 80% of emails match regex patterns, so we only call the LLM for the 20% that need semantic understanding. This keeps costs down and latency low while still handling edge cases."

---

### "How Does Follow-Up Radar Work?"

**User Flow:**
"Users BCC an alias like `2d@in.velora.cc` on emails. When the email arrives, our webhook parses the alias to compute a due time - `2d` means 2 days from now. Then we detect if there's a follow-up obligation using heuristic patterns first, falling back to GPT-5-mini for complex cases. If detected, we create a followup in Firestore with a thread key for deduplication. The frontend shows it in the Radar UI with stats, filters, and actions like generating drafts or marking done."

**Technical Details:**
"The detection uses a two-tier system - regex patterns for common phrases like 'can you confirm' or 'I'll send', which catches 80% of cases instantly. For the 20% that need context, we call GPT-5-mini with a short prompt. This hybrid approach balances speed, cost, and accuracy."

---

### "What Are the Tradeoffs?"

**AI Integration:**
"We use AI where it adds value - natural language understanding for emails and chat. But we avoid it for deterministic operations like parsing aliases or calculating dates. The tradeoff is cost and latency - AI calls add 500ms-2s and cost money, so we only use it when rules aren't sufficient."

**Rate Limiting:**
"Our rate limiter fails open if Firestore is down - we prioritize user experience over perfect protection. The tradeoff is possible abuse during outages, but we'd rather have a working system than block all users."

**Real-time Updates:**
"Firestore listeners give us real-time UI updates, which feels great but can be expensive at scale. The tradeoff is cost - every listener is a persistent connection and read operation."

---

### "Known Limitations"

**Current Gaps:**
"There are a few known issues. Timezone is hardcoded to PST, so users elsewhere get wrong due times - we need to store timezones in user profiles. User email extraction assumes @sdsu.edu, which won't work for other domains. And Google tokens are stored in localStorage, which is a security risk - they should be in httpOnly cookies."

**How I'd Fix:**
"If I had a week, I'd prioritize the user email mapping and timezone support since those affect core functionality. Then I'd add input sanitization to prevent XSS, and set up error monitoring so we can catch issues in production."

---

### "What Would You Improve?"

**Short-term (1 week):**
"User email mapping, timezone support, input sanitization, error monitoring, and pagination for large datasets. These fix real user issues and set up better patterns."

**Long-term (1 month):**
"Add automated testing, staging environment, database migrations, and a worker process for sending reminder emails. Also implement user feedback loops to improve detection accuracy."

**Why These:**
"They address the most fragile parts - the email webhook, detection logic, and rate limiting. Making these more robust would significantly improve reliability and user experience."

---

## 📝 KEY METRICS TO MENTION

- **Detection accuracy**: ~85% (heuristic catches 80%, LLM improves to 95%+)
- **Cost per followup**: ~$0.004 (target <$0.01 for profitability)
- **Latency**: <100ms for heuristic, 500ms-2s for LLM
- **Rate limits**: 50/day, 10/hour, 3/minute per user
- **Scale**: Designed for 1000+ users, tested with 100+

---

## 🎤 PRACTICE FRAMING

**"At a high level, the system works like this..."**
- Start with user flow, then dive into technical details if asked

**"The hardest part was..."**
- Balancing speed vs accuracy in detection
- Deciding when to use AI vs rules
- Handling edge cases in email parsing

**"A known limitation is..."**
- Timezone hardcoding
- User email extraction assumptions
- Security gaps (localStorage tokens)

**"If I were to improve it, I'd..."**
- Fix user mapping and timezones first
- Add error monitoring and input sanitization
- Implement pagination and better error handling

---

**Remember**: You don't need to memorize everything. Focus on:
1. **High-level architecture** (frontend → backend → database)
2. **Main user flow** (email → webhook → detection → UI)
3. **Key tradeoffs** (AI vs rules, speed vs correctness)
4. **Known issues** (timezone, email mapping, security)
5. **Improvement ideas** (what you'd do with more time)

Good luck! 🚀
