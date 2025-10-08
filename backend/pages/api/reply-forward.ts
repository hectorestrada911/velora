import type { NextApiRequest, NextApiResponse } from 'next';

// Reply-Forward Cancel Route
// When users forward a reply to reply+<threadKey>@in.velora.cc, automatically mark followup as DONE

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify webhook signature
    const webhookSecret = process.env.INBOUND_WEBHOOK_SECRET;
    const providedSecret = req.headers['x-webhook-secret'];
    
    if (webhookSecret && providedSecret !== webhookSecret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Parse inbound email payload
    const payload = normalizeInboundEmail(req.body);
    
    if (!payload) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Extract threadKey from reply-forward address
    const threadKey = extractThreadKeyFromReplyAddress(payload.to, payload.bcc);
    if (!threadKey) {
      console.log('No reply-forward address found, skipping');
      return res.status(200).json({ ok: true, skipped: true });
    }

    console.log(`Reply-forward received for threadKey: ${threadKey}`);

    // Find and mark followup as DONE
    const { radarService } = await import('../../lib/radarService');
    
    // Find followup by threadKey
    const followup = await radarService.findByThreadKey('system', threadKey); // TODO: Get actual userId
    
    if (!followup) {
      console.log(`No followup found for threadKey: ${threadKey}`);
      return res.status(200).json({ ok: true, notFound: true });
    }

    // Mark as DONE with reply-forward reason
    await radarService.updateFollowup(followup.id, {
      status: 'DONE',
      updatedAt: Date.now(),
      analytics: {
        ...followup.analytics,
        lastReplyForwardAt: Date.now(),
        replyForwardCount: (followup.analytics?.replyForwardCount || 0) + 1
      }
    });

    console.log(`Followup ${followup.id} marked as DONE via reply-forward`);

    return res.status(200).json({ 
      ok: true, 
      followupId: followup.id,
      action: 'marked_done'
    });

  } catch (error) {
    console.error('Reply-forward handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Normalize inbound email from provider format
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
 * Extract threadKey from reply-forward address
 * Looks for reply+<threadKey>@in.velora.cc
 */
function extractThreadKeyFromReplyAddress(to: string[], bcc: string[]): string | null {
  const allRecipients = [...to, ...bcc];
  
  for (const email of allRecipients) {
    // Match reply+<threadKey>@in.velora.cc
    const match = email.match(/^reply\+([^@]+)@in\.velora\.cc$/);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}
