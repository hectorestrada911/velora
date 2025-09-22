import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://velora-beta-one.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tokens, userId } = req.body;

    if (!tokens || !userId) {
      return res.status(400).json({ error: 'Tokens and userId are required' });
    }

    // Set up Google OAuth client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.APP_URL}/auth/google/callback`
    );

    oauth2Client.setCredentials(tokens);

    // Initialize Gmail API
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Get recent emails
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
      q: 'in:inbox'
    });

    const messages = response.data.messages || [];
    const emails = [];

    // Process each email
    for (const message of messages.slice(0, 10)) { // Limit to 10 emails for analysis
      try {
        const emailResponse = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        });

        const email = emailResponse.data;
        const headers = email.payload?.headers || [];
        
        const subject = headers.find(h => h.name === 'Subject')?.value || '';
        const from = headers.find(h => h.name === 'From')?.value || '';
        const date = headers.find(h => h.name === 'Date')?.value || '';

        // Extract email body
        let body = '';
        if (email.payload?.body?.data) {
          body = Buffer.from(email.payload.body.data, 'base64').toString();
        } else if (email.payload?.parts) {
          for (const part of email.payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
              body = Buffer.from(part.body.data, 'base64').toString();
              break;
            }
          }
        }

        emails.push({
          id: message.id,
          subject,
          from,
          date,
          body: body.substring(0, 1000), // Limit body length for AI analysis
          threadId: email.threadId || ''
        });
      } catch (error) {
        console.error('Error processing email:', error);
        continue;
      }
    }

    // Enhanced AI analysis using our comprehensive system
    const analysisPrompt = `You are Velora, an AI assistant specialized in analyzing emails and extracting actionable insights. Analyze these emails and extract tasks, deadlines, meetings, and important information.

CURRENT DATE & TIME: ${new Date().toISOString()}

EMAIL ANALYSIS TASKS:
1. **Task Extraction**: Find actionable items that need to be completed
2. **Deadline Identification**: Extract due dates and time-sensitive items
3. **Meeting Detection**: Identify meeting requests, appointments, and calls
4. **Priority Assessment**: Determine urgency and importance
5. **Follow-up Actions**: Find items requiring responses or follow-up
6. **Memory Suggestions**: Identify information worth remembering

ANALYSIS REQUIREMENTS:
- Extract specific tasks with clear descriptions
- Identify deadlines and due dates (convert to YYYY-MM-DD format)
- Find meeting requests with dates, times, and attendees
- Assess priority based on urgency and importance
- Suggest follow-up actions and reminders
- Focus on actionable items, not just information

EMAILS TO ANALYZE:
${emails.map(email => `
Subject: ${email.subject}
From: ${email.from}
Date: ${email.date}
Content: ${email.body}
`).join('\n---\n')}

Return ONLY valid JSON in this exact format:
{
  "tasks": [
    {
      "task": "Clear, actionable task description",
      "deadline": "YYYY-MM-DD or null",
      "priority": "high|medium|low",
      "source": "email sender name",
      "emailId": "email id"
    }
  ],
  "meetings": [
    {
      "title": "Meeting or appointment title",
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "attendees": ["attendee1", "attendee2"],
      "source": "email sender name",
      "emailId": "email id"
    }
  ],
  "reminders": [
    {
      "reminder": "Reminder description",
      "priority": "high|medium|low",
      "source": "email sender name",
      "emailId": "email id"
    }
  ],
  "memorySuggestions": [
    "REMEMBER Important information from emails",
    "REMEMBER Contact details or preferences"
  ],
  "summary": "Brief summary of email analysis findings"
}`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are Velora, an AI assistant that helps users organize their emails into actionable tasks, meetings, and reminders. Extract only concrete, actionable items from emails."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(aiResponse.choices[0].message.content || '{}');

    res.status(200).json({
      success: true,
      emails: emails.length,
      analysis
    });

  } catch (error) {
    console.error('Error analyzing emails:', error);
    res.status(500).json({ 
      error: 'Failed to analyze emails',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
