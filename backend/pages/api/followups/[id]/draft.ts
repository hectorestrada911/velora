import type { NextApiRequest, NextApiResponse } from 'next';

// Generate draft follow-up email

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { tone = 'polite' } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid followup ID' });
    }

    // Get followup from Firestore
    const { radarService } = await import('../../../../lib/radarService');
    const followup = await radarService.getFollowup(id);

    if (!followup) {
      return res.status(404).json({ error: 'Followup not found' });
    }

    // Generate draft using GPT-5-mini
    const draftText = await generateDraft(followup, tone);

    // Update followup with draft
    await radarService.updateFollowup(id, {
      draft: draftText,
      draftGeneratedAt: Date.now(),
      analytics: {
        draftsGenerated: (followup.analytics?.draftsGenerated || 0) + 1,
        lastDraftAt: Date.now()
      }
    });

    return res.status(200).json({
      draftText,
      generatedAt: Date.now(),
      tone
    });

  } catch (error) {
    console.error('Draft generation error:', error);
    return res.status(500).json({ error: 'Failed to generate draft' });
  }
}

/**
 * Generate follow-up draft using GPT-5-mini
 */
async function generateDraft(followup: any, tone: string): Promise<string> {
  const toneInstructions = {
    polite: 'polite and professional',
    firm: 'firm but respectful',
    casual: 'friendly and casual',
    professional: 'formal and professional'
  };

  const otherParticipant = followup.participants.find((p: any) => p.role === 'them');
  const firstName = otherParticipant?.name?.split(' ')[0] || 'there';

  const systemPrompt = `You write follow-up emails. Keep them SHORT (2-4 sentences max). Be ${toneInstructions[tone as keyof typeof toneInstructions] || 'polite'}.
Never invent facts. Reference the original context. Don't use greetings or signatures.`;

  const userPrompt = `Write a follow-up email for:

Subject: ${followup.subject}
Direction: ${followup.direction === 'YOU_OWE' ? 'I owe them' : 'They owe me'}
Original context: "${followup.source.snippet}"

${followup.direction === 'YOU_OWE' 
  ? `I need to follow up on something I promised or was asked to do.`
  : `I need to follow up because they haven't responded.`
}`;

  try {
    // Use GPT-5-mini with responses API
    const openai = new (await import('openai')).default({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    const response = await openai.responses.create({
      model: 'gpt-5-mini',
      input: `${systemPrompt}\n\n${userPrompt}`,
    });

    let draft = response.output_text?.trim() || '';

    // Clean up common issues
    draft = draft.replace(/^(Hi|Hey|Hello|Dear)\s+\w+,?\s*/i, '');
    draft = draft.replace(/\n\n(Best|Thanks|Regards|Sincerely).*$/is, '');

    return draft;

  } catch (error) {
    console.error('OpenAI draft generation error:', error);
    
    // Fallback template
    if (followup.direction === 'YOU_OWE') {
      return `Just following up on "${followup.source.snippet.slice(0, 50)}..." - wanted to check if you still need this or if there's anything else I can help with.`;
    } else {
      return `Following up on my previous email about "${followup.subject}" - would love to hear your thoughts when you have a moment.`;
    }
  }
}

