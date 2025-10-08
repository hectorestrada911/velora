// Follow-Up Radar Types
// Based on PRD v1 - Email follow-up tracking system

export type FollowDirection = 'YOU_OWE' | 'THEY_OWE';
export type FollowStatus = 'PENDING' | 'SNOOZED' | 'DONE' | 'CANCELLED';
export type DetectionMethod = 'ALIAS' | 'HEURISTIC' | 'LLM';
export type ParticipantRole = 'me' | 'them';

export interface Participant {
  name?: string;
  email: string;
  role: ParticipantRole;
}

export interface FollowupSource {
  provider: 'email';
  messageId: string;
  snippet: string;        // The receipt - exact quote that triggered follow-up
  linkHint?: string;      // Metadata, not a URL
}

export interface FollowupDetection {
  method: DetectionMethod;
  confidence: number;     // 0..1
  extractedDueText?: string;
  promiseDetected?: boolean;
  askDetected?: boolean;
}

export interface FollowupAnalytics {
  draftsGenerated: number;
  lastDraftAt?: number;
  lastReminderAt?: number;
}

export interface Followup {
  id: string;              // Firestore doc id
  userId: string;          // Owner of this follow-up
  threadKey: string;       // hash(messageId + participants) for deduplication
  subject: string;         // Email subject
  participants: Participant[];
  direction: FollowDirection;
  dueAt: number;           // Epoch ms (UTC)
  createdAt: number;       // When follow-up was created
  updatedAt: number;       // Last modification
  status: FollowStatus;
  snoozeUntil?: number;    // If snoozed, wake up at this time
  source: FollowupSource;
  detection: FollowupDetection;
  analytics?: FollowupAnalytics;
  draft?: string;          // Generated follow-up draft
  draftGeneratedAt?: number;
}

// UI/Display types
export interface RadarStats {
  overdueCount: number;
  todayCount: number;
  upcomingCount: number;
  youOweCount: number;
  theyOweCount: number;
}

export interface FollowupFilter {
  direction?: FollowDirection;
  status?: FollowStatus;
  timeframe?: 'overdue' | 'today' | 'upcoming';
}

// Inbound email payload (normalized from provider)
export interface InboundEmailPayload {
  to: string[];
  cc: string[];
  bcc: string[];
  from: string;
  fromName?: string;
  subject: string;
  text: string;
  html?: string;
  messageId: string;
  inReplyTo?: string;
  references?: string[];
  date: string;
  headers?: Record<string, string>;
}

// Alias parsing result
export interface ParsedAlias {
  userId: string;          // Resolved user
  dueAt?: number;          // Computed due time (if absolute/relative alias)
  aliasType: 'absolute' | 'relative' | 'smart' | 'capture';
  originalAlias: string;   // e.g., "2d@in.velora.cc"
  timezone: string;        // User's timezone for parsing
}

// Draft generation request
export interface DraftRequest {
  followupId: string;
  tone?: 'polite' | 'firm' | 'casual' | 'professional';
  maxLength?: number;      // Max sentences
}

// Draft generation response
export interface DraftResponse {
  draftText: string;
  generatedAt: number;
  tokensUsed: number;
}

// Action types for followup updates
export type FollowupAction = 
  | { type: 'snooze'; until: number }
  | { type: 'done' }
  | { type: 'cancel' }
  | { type: 'regenerate_draft'; tone?: string };

