import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const { tokens, fileId, fileName } = req.body;

    if (!tokens || !fileId) {
      return res.status(400).json({ error: 'Google tokens and file ID are required' });
    }

    // Set up Google Drive API
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials(tokens);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Get file metadata
    const fileMetadata = await drive.files.get({
      fileId: fileId,
      fields: 'id, name, mimeType, size, modifiedTime'
    });

    const file = fileMetadata.data;
    let content = '';

    // Extract content based on file type
    if (file.mimeType === 'application/vnd.google-apps.document') {
      // Google Doc - export as plain text
      const docContent = await drive.files.export({
        fileId: fileId,
        mimeType: 'text/plain'
      });
      content = docContent.data as string;
    } else if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
      // Google Sheet - export as CSV
      const sheetContent = await drive.files.export({
        fileId: fileId,
        mimeType: 'text/csv'
      });
      content = sheetContent.data as string;
    } else if (file.mimeType === 'application/pdf') {
      // PDF - download and extract text (simplified for now)
      const pdfContent = await drive.files.get({
        fileId: fileId,
        alt: 'media'
      });
      // For now, we'll return a placeholder - in production, you'd use a PDF parser
      content = '[PDF content - text extraction not implemented yet]';
    } else {
      // Other file types - try to get as text
      try {
        const fileContent = await drive.files.get({
          fileId: fileId,
          alt: 'media'
        });
        content = fileContent.data as string;
      } catch (error) {
        content = '[File content could not be extracted]';
      }
    }

    // Analyze content with AI
    const analysisPrompt = `You are Velora AI, an AI assistant specialized in analyzing documents and extracting actionable insights. Analyze this Google Drive document and extract key information.

CURRENT DATE & TIME: ${new Date().toISOString()}

DOCUMENT ANALYSIS TASKS:
1. **Content Understanding**: Analyze the document's main topics and purpose
2. **Information Extraction**: Identify important data like dates, names, numbers, deadlines
3. **Action Items**: Find tasks, deadlines, and actionable items
4. **Summary Generation**: Create a concise, useful summary
5. **Memory Integration**: Suggest what information should be saved to user's memory
6. **Follow-up Actions**: Recommend next steps based on the document content

DOCUMENT DETAILS:
- File Name: ${fileName || file.name}
- File Type: ${file.mimeType}
- Size: ${file.size ? Math.round(parseInt(file.size) / 1024) + ' KB' : 'Unknown'}
- Modified: ${file.modifiedTime}

DOCUMENT CONTENT:
${content}

Return ONLY valid JSON in this exact format:
{
  "documentType": "contract|report|invoice|proposal|manual|academic|resume|cv|spreadsheet|presentation|other",
  "importance": "high|medium|low",
  "summary": "Concise 2-3 sentence summary of the document",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "extractedData": {
    "people": ["Name 1", "Name 2"],
    "dates": ["2024-01-15", "2024-02-01"],
    "amounts": ["$1,000", "€500"],
    "deadlines": ["2024-01-30"],
    "topics": ["Project Alpha", "Q4 Review"],
    "contactInfo": {
      "email": "email@example.com",
      "phone": "+1234567890",
      "address": "123 Main St"
    }
  },
  "actionItems": [
    {
      "task": "Review document terms",
      "deadline": "2024-01-30",
      "priority": "high"
    }
  ],
  "reminders": [
    {
      "title": "Follow up on document",
      "dueDate": "2024-01-25",
      "priority": "medium",
      "description": "Check on document status"
    }
  ],
  "calendarEvents": [
    {
      "title": "Document Review Meeting",
      "startTime": "2024-01-28T10:00:00Z",
      "endTime": "2024-01-28T11:00:00Z",
      "description": "Review document terms and conditions"
    }
  ],
  "memorySuggestions": [
    "REMEMBER Important information from this document",
    "REMEMBER Key contacts or details"
  ],
  "aiResponse": "I've analyzed your Google Drive document and found several important items that need your attention.",
  "followUpQuestions": [
    "Help me set reminders for the deadlines",
    "Show me how to add this to my calendar",
    "Help me save key information to my memory"
  ]
}`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: analysisPrompt },
        { role: "user", content: `Please analyze this Google Drive document: ${fileName || file.name}` }
      ],
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(aiResponse.choices[0].message.content || '{}');

    // Enhance the analysis with metadata
    const enhancedAnalysis = {
      ...analysis,
      fileName: fileName || file.name,
      fileId: fileId,
      fileSize: file.size ? Math.round(parseInt(file.size) / 1024) : 0,
      fileType: file.mimeType,
      modifiedTime: file.modifiedTime,
      source: 'Google Drive',
      processingTime: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      analysis: enhancedAnalysis
    });

  } catch (error) {
    console.error('Error analyzing Google Drive document:', error);
    res.status(500).json({ 
      error: 'Failed to analyze Google Drive document',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
