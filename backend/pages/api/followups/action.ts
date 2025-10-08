import type { NextApiRequest, NextApiResponse } from 'next';

// JWT Action Handler
// Handles signed action links from reminder emails (Snooze, Done, Draft, Calendar)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Missing token' });
    }

    // Verify JWT token
    const { jwtSigner } = await import('../../lib/jwtSigner');
    const validation = await jwtSigner.validateAndConsumeActionLink(token);

    if (!validation.valid) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        details: validation.error
      });
    }

    const { followupId, userId, action, nonce } = validation.payload!;

    // Handle different actions
    const { radarService } = await import('../../lib/radarService');
    
    switch (action) {
      case 'done':
        await radarService.markDone(followupId);
        return res.redirect(`/radar?action=done&followup=${followupId}`);

      case 'snooze':
        // Default snooze to 2 hours
        const snoozeUntil = Date.now() + (2 * 60 * 60 * 1000);
        await radarService.snoozeFollowup(followupId, snoozeUntil);
        return res.redirect(`/radar?action=snoozed&followup=${followupId}`);

      case 'draft':
        // Generate draft and redirect to radar
        await radarService.generateDraft(followupId);
        return res.redirect(`/radar?action=draft&followup=${followupId}`);

      case 'calendar':
        // Generate ICS file and redirect to calendar
        const followup = await radarService.getFollowup(followupId);
        if (followup) {
          const { icsGenerator } = await import('../../lib/icsGenerator');
          const icsContent = icsGenerator.generateFollowupICS(followup);
          res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
          res.setHeader('Content-Disposition', `attachment; filename="followup-${followupId}.ics"`);
          res.setHeader('Cache-Control', 'no-cache');
          return res.send(icsContent);
        }
        return res.status(404).json({ error: 'Followup not found' });

      case 'reply_forward':
        // This should not be called directly - it's handled by reply-forward endpoint
        return res.status(400).json({ error: 'Invalid action for this endpoint' });

      default:
        return res.status(400).json({ error: 'Unknown action' });
    }

  } catch (error) {
    console.error('Action handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ICS generation is now handled by icsGenerator module
