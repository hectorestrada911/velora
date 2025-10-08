import type { NextApiRequest, NextApiResponse } from 'next';
import { detectFollowup } from '../../lib/followupDetector';

// Inbound Email Webhook Handler
// Receives emails from Resend/Postmark and creates followups

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify webhook signature (implement based on email provider)
    // For now, check a simple secret
    const webhookSecret = process.env.INBOUND_WEBHOOK_SECRET;
    const providedSecret = req.headers['x-webhook-secret'];
    
    if (webhookSecret && providedSecret !== webhookSecret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Parse inbound email payload (normalize from provider format)
    const payload = normalizeInboundEmail(req.body);
    
    if (!payload) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Extract user from alias (e.g., hector+2d@in.velora.cc → hector)
    const userEmail = extractUserEmail(payload.to, payload.bcc);
    if (!userEmail) {
      console.log('No Velora alias found, skipping');
      return res.status(200).json({ ok: true, skipped: true });
    }

    // Parse alias to get due time
    const { AliasParser } = await import('../../lib/aliasParser');
    const parser = new AliasParser('America/Los_Angeles'); // TODO: Get from user profile
    
    let dueAt: number | undefined;
    let aliasType: string = 'smart';
    
    // Check each recipient for Velora aliases
    const allRecipients = [...payload.to, ...payload.bcc, ...payload.cc];
    for (const email of allRecipients) {
      if (isVeloraAlias(email)) {
        const parseResult = parser.parse(email);
        if (parseResult.matched) {
          dueAt = parseResult.dueAt;
          aliasType = parseResult.aliasType;
          break;
        }
      }
    }

    // If no explicit due time and alias is "follow@", detect from content
    if (!dueAt && aliasType === 'smart') {
      // Try to infer deadline from body (simple heuristic for now)
      dueAt = inferDueTime(payload.text);
    }

    // If still no due time, default to 2 days
    if (!dueAt) {
      dueAt = Date.now() + (2 * 24 * 60 * 60 * 1000);
    }

    // Detect followup obligation
    const detection = await detectFollowup(
      payload.subject,
      payload.text,
      payload.from,
      payload.to.join(', '),
      userEmail,
      process.env.OPENAI_API_KEY
    );

    if (!detection || !detection.direction) {
      console.log('No followup detected, skipping');
      return res.status(200).json({ ok: true, skipped: true });
    }

    // Generate thread key for deduplication
    const participants = [payload.from, ...payload.to].sort();
    const threadKey = generateThreadKey(payload.messageId, participants);

    // Create followup in Firestore
    const { radarService } = await import('../../lib/radarService');
    
    // Check if followup already exists for this thread
    const existingFollowup = await radarService.findByThreadKey(userEmail, threadKey);
    
    if (existingFollowup) {
      console.log('Followup already exists for thread, skipping');
      return res.status(200).json({ ok: true, exists: true });
    }

    // Build followup object
    const followup = {
      userId: userEmail,
      threadKey,
      subject: payload.subject,
      participants: [
        { email: payload.from, name: payload.fromName, role: 'them' as const },
        { email: userEmail, role: 'me' as const }
      ],
      direction: detection.direction,
      dueAt,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'PENDING' as const,
      source: {
        provider: 'email' as const,
        messageId: payload.messageId,
        snippet: detection.quote || payload.text.slice(0, 200)
      },
      detection: {
        method: detection.method,
        confidence: detection.confidence,
        extractedDueText: detection.extractedDueText,
        promiseDetected: detection.promiseDetected,
        askDetected: detection.askDetected
      }
    };

    const followupId = await radarService.createFollowup(followup);

    console.log(`Created followup ${followupId} for user ${userEmail}`);

    return res.status(200).json({ 
      ok: true, 
      followupId,
      direction: detection.direction,
      dueAt
    });

  } catch (error) {
    console.error('Inbound email handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Normalize inbound email from provider format to standard format
 */
function normalizeInboundEmail(body: any): any {
  // Handle Resend format
  if (body.from && body.to && body.subject) {
    return {
      to: Array.isArray(body.to) ? body.to : [body.to],
      cc: Array.isArray(body.cc) ? body.cc : (body.cc ? [body.cc] : []),
      bcc: Array.isArray(body.bcc) ? body.bcc : (body.bcc ? [body.bcc] : []),
      from: body.from,
      fromName: body.from_name || body.fromName,
      subject: body.subject,
      text: body.text || body.body || '',
      html: body.html || '',
      messageId: body.message_id || body.messageId || `msg_${Date.now()}`,
      inReplyTo: body.in_reply_to || body.inReplyTo,
      date: body.date || new Date().toISOString(),
      headers: body.headers || {}
    };
  }

  // Handle Postmark format
  if (body.From && body.To) {
    return {
      to: [body.To],
      cc: body.Cc ? [body.Cc] : [],
      bcc: body.Bcc ? [body.Bcc] : [],
      from: body.From,
      fromName: body.FromName,
      subject: body.Subject,
      text: body.TextBody || '',
      html: body.HtmlBody || '',
      messageId: body.MessageID || `msg_${Date.now()}`,
      inReplyTo: body.Headers?.find((h: any) => h.Name === 'In-Reply-To')?.Value,
      date: body.Date || new Date().toISOString(),
      headers: body.Headers?.reduce((acc: any, h: any) => {
        acc[h.Name] = h.Value;
        return acc;
      }, {}) || {}
    };
  }

  return null;
}

/**
 * Extract user email from recipients (look for Velora aliases)
 */
function extractUserEmail(to: string[], bcc: string[]): string | null {
  const allRecipients = [...to, ...bcc];
  
  for (const email of allRecipients) {
    if (isVeloraAlias(email)) {
      // Extract user part: hector+2d@in.velora.cc → hector
      const match = email.match(/^([^+@]+)(?:\+[^@]*)?@/);
      if (match) {
        return match[1] + '@sdsu.edu'; // TODO: Map to actual user email from database
      }
    }
  }
  
  return null;
}

/**
 * Check if email is a Velora alias
 */
function isVeloraAlias(email: string): boolean {
  return email.includes('@in.velora.cc') || email.includes('@velora.cc');
}

/**
 * Generate thread key for deduplication
 */
function generateThreadKey(messageId: string, participants: string[]): string {
  const raw = `${messageId}:${participants.join(',')}`;
  
  // Simple hash
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return `thread_${Math.abs(hash).toString(36)}`;
}

/**
 * Infer due time from email body (simple heuristic)
 */
function inferDueTime(text: string): number | undefined {
  const patterns = [
    { regex: /by tomorrow/i, offset: 1 * 24 * 60 * 60 * 1000 },
    { regex: /by (eod|end of day)/i, offset: 8 * 60 * 60 * 1000 },
    { regex: /by friday/i, offset: getDaysUntilFriday() * 24 * 60 * 60 * 1000 },
    { regex: /by end of week/i, offset: getDaysUntilFriday() * 24 * 60 * 60 * 1000 },
    { regex: /by next week/i, offset: 7 * 24 * 60 * 60 * 1000 },
  ];

  for (const pattern of patterns) {
    if (pattern.regex.test(text)) {
      return Date.now() + pattern.offset;
    }
  }

  return undefined;
}

function getDaysUntilFriday(): number {
  const today = new Date().getDay();
  const friday = 5;
  let days = friday - today;
  if (days <= 0) days += 7;
  return days;
}

