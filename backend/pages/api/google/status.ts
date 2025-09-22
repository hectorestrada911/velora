import { NextApiRequest, NextApiResponse } from 'next';

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
    // Get tokens from request body (sent from frontend)
    const { tokens } = req.body || {};
    
    if (!tokens || !tokens.access_token) {
      return res.status(200).json({
        connected: false,
        message: 'No Google tokens found'
      });
    }

    // Validate tokens by making a test API call
    const { google } = require('googleapis');
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials(tokens);

    try {
      // Test with Gmail API
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      const profile = await gmail.users.getProfile({ userId: 'me' });
      
      res.status(200).json({
        connected: true,
        message: 'Google Workspace connected successfully',
        userEmail: profile.data.emailAddress,
        tokens: {
          hasAccessToken: !!tokens.access_token,
          hasRefreshToken: !!tokens.refresh_token,
          expiresAt: tokens.expiry_date
        }
      });
    } catch (tokenError) {
      console.error('Token validation failed:', tokenError);
      res.status(200).json({
        connected: false,
        message: 'Google tokens expired or invalid',
        error: 'Token validation failed'
      });
    }

  } catch (error) {
    console.error('Error checking Google status:', error);
    res.status(500).json({ 
      error: 'Failed to check Google Workspace status',
      connected: false
    });
  }
}
