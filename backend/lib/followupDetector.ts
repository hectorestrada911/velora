// Followup Detection Logic - Rule-first approach
// Detects asks and promises from email content

export interface DetectionResult {
  direction: 'YOU_OWE' | 'THEY_OWE' | null;
  confidence: number;
  extractedDueText?: string;
  promiseDetected?: boolean;
  askDetected?: boolean;
  quote?: string; // The receipt - exact line that triggered detection
  method: 'HEURISTIC' | 'LLM';
}

/**
 * Heuristic detection (fast path - no LLM)
 * Returns null if no clear signal detected
 */
export function detectFollowupHeuristic(
  subject: string,
  body: string,
  fromEmail: string,
  myEmail: string
): DetectionResult | null {
  const text = `${subject} ${body}`.toLowerCase();
  const isFromMe = fromEmail.toLowerCase() === myEmail.toLowerCase();

  // Ask phrases (someone asking the user to do something)
  const askPatterns = [
    /can you (confirm|review|approve|send|share|update|check|verify)/i,
    /could you (confirm|review|approve|send|share|update|check|verify)/i,
    /please (confirm|review|approve|send|share|update|check|verify)/i,
    /would you (confirm|review|approve|send|share|update|check|verify)/i,
    /need you to (confirm|review|approve|send|share|update|check|verify)/i,
    /waiting for (your|the) (confirmation|review|approval|update|response)/i,
    /let me know (when|if|about)/i,
    /get back to (me|us)/i,
    /follow up (on|with)/i,
    /status update/i,
    /next steps/i,
    /action items/i
  ];

  // Promise phrases (user promising to do something)
  const promisePatterns = [
    /i'?ll (send|share|update|review|confirm|get back|circle back|follow up)/i,
    /let me (send|share|update|review|check|circle back|follow up)/i,
    /i will (send|share|update|review|confirm|get back|circle back|follow up)/i,
    /i can (send|share|update|review|confirm|get back)/i,
    /i'?ll make sure/i,
    /i'?ll take care of/i,
    /will do/i,
    /on it/i,
    /i'?ll handle/i
  ];

  // Deadline/time phrases
  const deadlinePatterns = [
    /by (tomorrow|today|eod|end of day|end of week|friday|monday|tuesday|wednesday|thursday)/i,
    /before (tomorrow|friday|monday|the end of)/i,
    /deadline is/i,
    /due (by|on|before)/i,
    /need (it|this|that) by/i,
    /by (\d{1,2}\/\d{1,2})/i, // dates like 12/15
    /by (\d{1,2}:\d{2})/i, // times like 5:00
    /within (\d+) (days?|hours?|weeks?)/i
  ];

  let askDetected = false;
  let promiseDetected = false;
  let deadlineText: string | undefined;
  let quote: string | undefined;

  // Check for asks
  for (const pattern of askPatterns) {
    const match = body.match(pattern);
    if (match) {
      askDetected = true;
      quote = extractQuote(body, match[0]);
      break;
    }
  }

  // Check for promises
  for (const pattern of promisePatterns) {
    const match = body.match(pattern);
    if (match) {
      promiseDetected = true;
      if (!quote) quote = extractQuote(body, match[0]);
      break;
    }
  }

  // Check for deadlines
  for (const pattern of deadlinePatterns) {
    const match = body.match(pattern);
    if (match) {
      deadlineText = match[0];
      if (!quote) quote = extractQuote(body, match[0]);
      break;
    }
  }

  // Determine direction
  let direction: 'YOU_OWE' | 'THEY_OWE' | null = null;
  let confidence = 0;

  if (askDetected && !isFromMe) {
    // They're asking me to do something
    direction = 'YOU_OWE';
    confidence = deadlineText ? 0.85 : 0.70;
  } else if (promiseDetected && isFromMe) {
    // I'm promising to do something
    direction = 'YOU_OWE';
    confidence = deadlineText ? 0.90 : 0.75;
  } else if (askDetected && isFromMe) {
    // I'm asking them to do something
    direction = 'THEY_OWE';
    confidence = deadlineText ? 0.85 : 0.70;
  }

  // Not enough signal
  if (!direction || confidence < 0.65) {
    return null;
  }

  return {
    direction,
    confidence,
    extractedDueText: deadlineText,
    promiseDetected,
    askDetected,
    quote,
    method: 'HEURISTIC'
  };
}

/**
 * Extract a quote snippet around a matched pattern
 */
function extractQuote(text: string, matchedText: string): string {
  const index = text.toLowerCase().indexOf(matchedText.toLowerCase());
  if (index === -1) return matchedText;

  // Get surrounding context (100 chars before, 100 after)
  const start = Math.max(0, index - 100);
  const end = Math.min(text.length, index + matchedText.length + 100);
  
  let quote = text.slice(start, end).trim();
  
  // Add ellipsis if truncated
  if (start > 0) quote = '...' + quote;
  if (end < text.length) quote = quote + '...';

  // Clean up
  quote = quote.replace(/\s+/g, ' ').trim();
  
  // Limit to 200 chars
  if (quote.length > 200) {
    quote = quote.slice(0, 197) + '...';
  }

  return quote;
}

/**
 * LLM-based detection (slow path - uses GPT-5-mini)
 * Only call this if heuristic detection returns null
 */
export async function detectFollowupLLM(
  subject: string,
  body: string,
  fromEmail: string,
  toEmail: string,
  myEmail: string,
  openaiApiKey: string
): Promise<DetectionResult | null> {
  try {
    // Truncate body to 800 chars to keep prompt short
    const trimmedBody = body.slice(0, 800);

    const systemPrompt = `You extract follow-up obligations from emails.
Output JSON only. Never invent facts. Prefer exact quotes. If no obligation, return {"direction":null}.

Output schema:
{
  "direction": "YOU_OWE" | "THEY_OWE" | null,
  "action": "brief description",
  "dueText": "extracted deadline phrase or null",
  "confidence": 0.0 to 1.0,
  "quote": "exact line that triggered detection (max 200 chars)"
}`;

    const userPrompt = `Subject: ${subject}
From: ${fromEmail} | To: ${toEmail} | Me: ${myEmail}
Body (trimmed):
${trimmedBody}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 200,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      return null;
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    if (!result.direction || result.confidence < 0.6) {
      return null;
    }

    return {
      direction: result.direction,
      confidence: result.confidence,
      extractedDueText: result.dueText || undefined,
      promiseDetected: result.direction === 'YOU_OWE',
      askDetected: result.direction === 'THEY_OWE',
      quote: result.quote,
      method: 'LLM'
    };
  } catch (error) {
    console.error('LLM detection error:', error);
    return null;
  }
}

/**
 * Main detection function - tries heuristic first, falls back to LLM
 */
export async function detectFollowup(
  subject: string,
  body: string,
  fromEmail: string,
  toEmail: string,
  myEmail: string,
  openaiApiKey?: string
): Promise<DetectionResult | null> {
  // Try heuristic first (fast)
  const heuristicResult = detectFollowupHeuristic(subject, body, fromEmail, myEmail);
  
  if (heuristicResult && heuristicResult.confidence >= 0.75) {
    return heuristicResult;
  }

  // Fall back to LLM if API key available
  if (openaiApiKey) {
    const llmResult = await detectFollowupLLM(subject, body, fromEmail, toEmail, myEmail, openaiApiKey);
    if (llmResult) {
      return llmResult;
    }
  }

  // Return heuristic result even if low confidence (better than nothing)
  return heuristicResult;
}

