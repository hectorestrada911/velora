// Rate Limiting Service for Follow-Up Radar
// Prevents abuse and ensures reliable email delivery

import { doc, getDoc, setDoc, increment, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

interface RateLimitConfig {
  maxPerDay: number;
  maxPerHour: number;
  maxPerMinute: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      maxPerDay: 50,      // Max 50 followups per user per day
      maxPerHour: 10,     // Max 10 followups per user per hour  
      maxPerMinute: 3,    // Max 3 followups per user per minute
      windowMs: 60 * 1000, // 1 minute window
      ...config
    };
  }

  /**
   * Check if user can create a followup
   */
  async checkRateLimit(userId: string, action: 'create_followup' | 'send_reminder'): Promise<RateLimitResult> {
    try {
      const now = Date.now();
      const minuteKey = Math.floor(now / (60 * 1000));
      const hourKey = Math.floor(now / (60 * 60 * 1000));
      const dayKey = Math.floor(now / (24 * 60 * 60 * 1000));

      // Check minute rate limit
      const minuteLimit = await this.getAndIncrement(`rate_limit:${userId}:minute:${minuteKey}`, 60);
      if (minuteLimit.count > this.config.maxPerMinute) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: (minuteKey + 1) * 60 * 1000,
          retryAfter: 60
        };
      }

      // Check hour rate limit
      const hourLimit = await this.getAndIncrement(`rate_limit:${userId}:hour:${hourKey}`, 60 * 60);
      if (hourLimit.count > this.config.maxPerHour) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: (hourKey + 1) * 60 * 60 * 1000,
          retryAfter: 60 * 60
        };
      }

      // Check day rate limit
      const dayLimit = await this.getAndIncrement(`rate_limit:${userId}:day:${dayKey}`, 24 * 60 * 60);
      if (dayLimit.count > this.config.maxPerDay) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: (dayKey + 1) * 24 * 60 * 60 * 1000,
          retryAfter: 24 * 60 * 60
        };
      }

      // Calculate remaining quota (use the most restrictive)
      const remaining = Math.min(
        this.config.maxPerMinute - minuteLimit.count,
        this.config.maxPerHour - hourLimit.count,
        this.config.maxPerDay - dayLimit.count
      );

      return {
        allowed: true,
        remaining: Math.max(0, remaining),
        resetTime: Math.min(
          (minuteKey + 1) * 60 * 1000,
          (hourKey + 1) * 60 * 60 * 1000,
          (dayKey + 1) * 24 * 60 * 60 * 1000
        )
      };

    } catch (error) {
      console.error('Rate limit check failed:', error);
      // Fail open for reliability
      return {
        allowed: true,
        remaining: this.config.maxPerDay,
        resetTime: Date.now() + 24 * 60 * 60 * 1000
      };
    }
  }

  /**
   * Get current count and increment atomically
   */
  private async getAndIncrement(key: string, ttlSeconds: number): Promise<{ count: number }> {
    const docRef = doc(db, 'rate_limits', key);
    
    try {
      // Try to increment
      await setDoc(docRef, {
        count: increment(1),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + ttlSeconds * 1000))
      }, { merge: true });

      // Get the current count
      const docSnap = await getDoc(docRef);
      return { count: docSnap.data()?.count || 1 };
    } catch (error) {
      console.error('Rate limit increment failed:', error);
      return { count: 1 };
    }
  }

  /**
   * Check if email address is rate limited
   */
  async checkEmailRateLimit(emailAddress: string): Promise<RateLimitResult> {
    // Extract user from alias
    const userId = this.extractUserIdFromAlias(emailAddress);
    if (!userId) {
      return { allowed: false, remaining: 0, resetTime: Date.now() };
    }

    return this.checkRateLimit(userId, 'create_followup');
  }

  /**
   * Extract user ID from alias for rate limiting
   */
  private extractUserIdFromAlias(emailAddress: string): string | null {
    // User-bound format: alias+userId@domain
    const userBoundMatch = emailAddress.match(/^[^+]+\+([^@]+)@/);
    if (userBoundMatch) {
      return userBoundMatch[1];
    }

    // Legacy format: userId+alias@domain
    const legacyMatch = emailAddress.match(/^([^+@]+)(?:\+[^@]*)?@/);
    return legacyMatch ? legacyMatch[1] : null;
  }

  /**
   * Clean up expired rate limit entries (run periodically)
   */
  async cleanupExpiredEntries(): Promise<void> {
    // This would be implemented as a scheduled function
    // For now, we rely on Firestore TTL if configured
    console.log('Rate limit cleanup would run here');
  }

  /**
   * Get user's current rate limit status
   */
  async getUserStatus(userId: string): Promise<{
    minuteCount: number;
    hourCount: number;
    dayCount: number;
    limits: RateLimitConfig;
  }> {
    const now = Date.now();
    const minuteKey = Math.floor(now / (60 * 1000));
    const hourKey = Math.floor(now / (60 * 60 * 1000));
    const dayKey = Math.floor(now / (24 * 60 * 60 * 1000));

    const [minuteDoc, hourDoc, dayDoc] = await Promise.all([
      getDoc(doc(db, 'rate_limits', `rate_limit:${userId}:minute:${minuteKey}`)),
      getDoc(doc(db, 'rate_limits', `rate_limit:${userId}:hour:${hourKey}`)),
      getDoc(doc(db, 'rate_limits', `rate_limit:${userId}:day:${dayKey}`))
    ]);

    return {
      minuteCount: minuteDoc.data()?.count || 0,
      hourCount: hourDoc.data()?.count || 0,
      dayCount: dayDoc.data()?.count || 0,
      limits: this.config
    };
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();
export default rateLimiter;

// Export for backend use
export { RateLimiter };
export type { RateLimitResult, RateLimitConfig };
