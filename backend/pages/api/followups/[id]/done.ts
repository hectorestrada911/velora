import type { NextApiRequest, NextApiResponse } from 'next';

// Mark a followup as done

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid followup ID' });
    }

    // Update followup
    const { radarService } = await import('../../../../lib/radarService');
    await radarService.markDone(id);

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error('Mark done error:', error);
    return res.status(500).json({ error: 'Failed to mark as done' });
  }
}

