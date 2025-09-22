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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tokens } = req.query;

    if (!tokens) {
      return res.status(400).json({ error: 'Google tokens are required' });
    }

    // Parse tokens
    const parsedTokens = typeof tokens === 'string' ? JSON.parse(tokens) : tokens;

    // Set up Google Drive API
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials(parsedTokens);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Get recent files (last 20 files)
    const response = await drive.files.list({
      pageSize: 20,
      fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, webViewLink, webContentLink)',
      orderBy: 'modifiedTime desc',
      q: "trashed=false" // Exclude trashed files
    });

    const files = response.data.files || [];

    // Filter for document types we can analyze
    const supportedTypes = [
      'application/pdf',
      'application/vnd.google-apps.document',
      'application/vnd.google-apps.spreadsheet',
      'application/vnd.google-apps.presentation',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const supportedFiles = files.filter(file => 
      supportedTypes.includes(file.mimeType || '')
    );

    // Format files for frontend
    const formattedFiles = supportedFiles.map(file => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size ? parseInt(file.size) : 0,
      modifiedTime: file.modifiedTime,
      webViewLink: file.webViewLink,
      webContentLink: file.webContentLink,
      type: getFileType(file.mimeType || ''),
      canAnalyze: true
    }));

    res.status(200).json({
      success: true,
      files: formattedFiles,
      total: formattedFiles.length
    });

  } catch (error) {
    console.error('Error fetching Google Drive files:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Google Drive files',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function getFileType(mimeType: string): string {
  const typeMap: { [key: string]: string } = {
    'application/pdf': 'PDF',
    'application/vnd.google-apps.document': 'Google Doc',
    'application/vnd.google-apps.spreadsheet': 'Google Sheet',
    'application/vnd.google-apps.presentation': 'Google Slides',
    'text/plain': 'Text',
    'application/msword': 'Word Doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Doc'
  };
  
  return typeMap[mimeType] || 'Unknown';
}
