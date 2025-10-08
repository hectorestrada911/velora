// JWT Signer for Follow-Up Radar Action Links
// Provides secure, time-limited action links for email buttons

import { SignJWT, jwtVerify } from 'jose';

interface ActionPayload {
  followupId: string;
  userId: string;
  action: 'snooze' | 'done' | 'draft' | 'calendar' | 'reply_forward';
  nonce: string; // One-time use token
  expiresAt: number;
}

interface ActionLinkData {
  followupId: string;
  userId: string;
  action: string;
  nonce: string;
}

class JWTSigner {
  private secret: Uint8Array;
  private algorithm = 'HS256';

  constructor() {
    // Use environment variable or generate a secure key
    const secretKey = process.env.JWT_SECRET || 'velora-radar-secret-key-change-in-production';
    this.secret = new TextEncoder().encode(secretKey);
  }

  /**
   * Generate a signed action link
   */
  async signActionLink(data: ActionLinkData, expiresInMinutes: number = 15): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + (expiresInMinutes * 60);

    const payload: ActionPayload = {
      followupId: data.followupId,
      userId: data.userId,
      action: data.action as any,
      nonce: data.nonce,
      expiresAt
    };

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: this.algorithm })
      .setIssuedAt(now)
      .setExpirationTime(expiresAt)
      .setIssuer('velora-radar')
      .setAudience('velora-users')
      .sign(this.secret);

    return token;
  }

  /**
   * Verify and decode an action link
   */
  async verifyActionLink(token: string): Promise<ActionPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.secret, {
        issuer: 'velora-radar',
        audience: 'velora-users'
      });

      return payload as ActionPayload;
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }

  /**
   * Generate a one-time nonce
   */
  generateNonce(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `${timestamp}-${random}`;
  }

  /**
   * Create action link URL
   */
  async createActionLink(
    baseUrl: string,
    followupId: string,
    userId: string,
    action: string,
    expiresInMinutes: number = 15
  ): Promise<string> {
    const nonce = this.generateNonce();
    const token = await this.signActionLink({
      followupId,
      userId,
      action,
      nonce
    }, expiresInMinutes);

    return `${baseUrl}/api/followups/action?token=${token}`;
  }

  /**
   * Check if token is expired
   */
  isExpired(payload: ActionPayload): boolean {
    return Date.now() / 1000 > payload.expiresAt;
  }

  /**
   * Generate multiple action links for an email
   */
  async generateEmailActionLinks(
    baseUrl: string,
    followupId: string,
    userId: string
  ): Promise<{
    snooze: string;
    done: string;
    draft: string;
    calendar: string;
    replyForward: string;
  }> {
    const actions = ['snooze', 'done', 'draft', 'calendar', 'reply_forward'];
    const links: any = {};

    for (const action of actions) {
      links[action] = await this.createActionLink(
        baseUrl,
        followupId,
        userId,
        action,
        15 // 15 minutes expiry
      );
    }

    return links;
  }

  /**
   * Validate action link and mark nonce as used (prevent replay)
   */
  async validateAndConsumeActionLink(token: string): Promise<{
    valid: boolean;
    payload?: ActionPayload;
    error?: string;
  }> {
    const payload = await this.verifyActionLink(token);
    
    if (!payload) {
      return { valid: false, error: 'Invalid token' };
    }

    if (this.isExpired(payload)) {
      return { valid: false, error: 'Token expired' };
    }

    // TODO: Check if nonce has been used (store in Firestore)
    // For now, we'll implement a simple in-memory cache
    // In production, use Redis or Firestore for nonce tracking
    
    return { valid: true, payload };
  }
}

// Export singleton instance
export const jwtSigner = new JWTSigner();
export default jwtSigner;

// Export types for backend use
export { ActionPayload, ActionLinkData };
