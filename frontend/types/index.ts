// User types
export interface User {
  uid: string
  email: string
  plan: 'free' | 'pro'
  createdAt: Date
  settings: UserSettings
}

export interface UserSettings {
  deleteAudioAfterTranscription: boolean
  timezone: string
  weeklyRecapDay: number // 0-6 (Sunday-Saturday)
  emailNotifications: boolean
  pushNotifications: boolean
}

// Note types
export interface Note {
  id: string
  uid: string
  audioUrl?: string
  text: string
  title?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  language?: string
  entities?: {
    people: string[]
    topics: string[]
  }
  sentiment?: 'positive' | 'negative' | 'neutral'
  isPinned: boolean
  isFavorite: boolean
}

// Reminder types
export interface Reminder {
  id: string
  uid: string
  noteId?: string
  dueAt: Date
  status: 'scheduled' | 'sent' | 'snoozed' | 'canceled'
  channel: 'email' | 'push' | 'calendar'
  summary: string
  createdAt: Date
  updatedAt: Date
}

// Usage tracking
export interface Usage {
  uid: string
  monthKey: string // YYYY-MM format
  transcriptionsCount: number
  reminderCount: number
  lastReset: Date
}

// API Response types
export interface TranscriptionResult {
  text: string
  language: string
  confidence: number
}

export interface ParsedContent {
  reminders: Array<{
    dueAt: string
    summary: string
  }>
  tags: string[]
  entities: {
    people: string[]
    topics: string[]
  }
}

// Stripe types
export interface StripeCheckoutResponse {
  sessionId: string
  customerId: string
}

// Search and filtering
export interface SearchFilters {
  tags?: string[]
  hasReminder?: boolean
  isPinned?: boolean
  isFavorite?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}

// Weekly recap
export interface WeeklyRecap {
  id: string
  uid: string
  weekStart: Date
  weekEnd: Date
  summary: string
  keyThemes: string[]
  tasksMentioned: string[]
  unresolvedItems: string[]
  createdAt: Date
}
