import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://velora-beta-one.vercel.app')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(200).end()
  }

  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', 'https://velora-beta-one.vercel.app')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tokens, timeMin, timeMax, maxResults } = req.method === 'GET' ? req.query : req.body;

    if (!tokens) {
      return res.status(400).json({ error: 'Google tokens are required' });
    }

    // Parse tokens
    const parsedTokens = typeof tokens === 'string' ? JSON.parse(tokens) : tokens;

    // Set up Google Calendar API
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials(parsedTokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Set default time range (next 7 days)
    const now = new Date();
    const defaultTimeMin = timeMin || now.toISOString();
    const defaultTimeMax = timeMax || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Get calendar events
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: defaultTimeMin,
      timeMax: defaultTimeMax,
      maxResults: maxResults || 50,
      singleEvents: true,
      orderBy: 'startTime'
    });

    const events = response.data.items || [];

    // Format events for frontend
    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.summary || 'No Title',
      description: event.description || '',
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      allDay: !event.start?.dateTime, // If no time, it's all day
      location: event.location || '',
      attendees: event.attendees?.map(attendee => ({
        email: attendee.email,
        name: attendee.displayName,
        responseStatus: attendee.responseStatus
      })) || [],
      creator: event.creator?.email || '',
      organizer: event.organizer?.email || '',
      status: event.status,
      htmlLink: event.htmlLink,
      hangoutLink: event.hangoutLink
    }));

    res.status(200).json({
      success: true,
      events: formattedEvents,
      total: formattedEvents.length,
      timeRange: {
        start: defaultTimeMin,
        end: defaultTimeMax
      }
    });

  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ 
      error: 'Failed to fetch calendar events',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
