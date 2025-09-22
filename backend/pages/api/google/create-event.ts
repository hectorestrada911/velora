import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://velora-beta-one.vercel.app')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(200).end()
  }

  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', 'https://velora-beta-one.vercel.app')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tokens, event } = req.body;

    if (!tokens || !event) {
      return res.status(400).json({ error: 'Tokens and event data are required' });
    }

    // Set up Google OAuth client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.APP_URL}/auth/google/callback`
    );

    oauth2Client.setCredentials(tokens);

    // Initialize Calendar API
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Create the calendar event
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: event.title || event.summary,
        description: event.description,
        start: {
          dateTime: event.startDateTime,
          timeZone: event.timeZone || 'UTC'
        },
        end: {
          dateTime: event.endDateTime,
          timeZone: event.timeZone || 'UTC'
        },
        attendees: event.attendees || [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 } // 30 minutes before
          ]
        }
      }
    });

    res.status(200).json({
      success: true,
      event: response.data
    });

  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ 
      error: 'Failed to create calendar event',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
