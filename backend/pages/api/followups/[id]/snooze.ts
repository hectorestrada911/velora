import type { NextApiRequest, NextApiResponse } from 'next';

// Snooze a followup until a specific time

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { until } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid followup ID' });
    }

    if (!until || typeof until !== 'number') {
      return res.status(400).json({ error: 'Invalid snooze time' });
    }

    // Update followup
    const { radarService } = await import('../../../../lib/radarService');
    await radarService.snoozeFollowup(id, until);

    return res.status(200).json({ ok: true, snoozeUntil: until });

  } catch (error) {
    console.error('Snooze error:', error);
    return res.status(500).json({ error: 'Failed to snooze' });
  }
}

