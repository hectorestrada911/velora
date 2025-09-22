import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import pdf from 'pdf-parse'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for file uploads
  },
}

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
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Parse the form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      filter: ({ mimetype }) => {
        return mimetype === 'application/pdf'
      }
    })

    const [fields, files] = await form.parse(req)
    
    if (!files.file || !Array.isArray(files.file) || files.file.length === 0) {
      return res.status(400).json({ error: 'No PDF file provided' })
    }

    const file = files.file[0]
    
    // Read and parse the PDF
    const pdfBuffer = fs.readFileSync(file.filepath)
    const pdfData = await pdf(pdfBuffer)
    
    // Extract text content
    const textContent = pdfData.text
    
    if (!textContent || textContent.trim().length === 0) {
      return res.status(400).json({ error: 'No text content found in PDF' })
    }

    // Clean up the uploaded file
    fs.unlinkSync(file.filepath)

    // Get current date/time for context
    const now = new Date()
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
    const currentDateStr = now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })

    // AI analysis system prompt for PDF content
    const systemPrompt = `You are Velora, an intelligent AI assistant specialized in analyzing PDF documents and extracting actionable insights. You help users understand, organize, and act on their document content.

CURRENT DATE & TIME: ${currentDateStr} at ${currentTime}

PDF ANALYSIS TASKS:
1. **Content Understanding**: Analyze the document's main topics, key points, and purpose
2. **Information Extraction**: Identify important data like dates, names, numbers, deadlines, etc.
3. **Action Items**: Find tasks, deadlines, and actionable items
4. **Summary Generation**: Create a concise, useful summary
5. **Memory Integration**: Suggest what information should be saved to user's memory
6. **Follow-up Actions**: Recommend next steps based on the document content

ANALYSIS REQUIREMENTS:
- Extract key information: people, dates, deadlines, amounts, topics
- Identify action items and tasks
- Determine document type and importance
- Suggest relevant Velora features (reminders, calendar events, memory storage)
- Provide practical, actionable insights
- Ask clarifying questions when needed

Return ONLY valid JSON in this exact format:
{
  "documentType": "contract|report|invoice|proposal|manual|academic|other",
  "importance": "high|medium|low",
  "summary": "Concise 2-3 sentence summary of the document",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "extractedData": {
    "people": ["Name 1", "Name 2"],
    "dates": ["2024-01-15", "2024-02-01"],
    "amounts": ["$1,000", "€500"],
    "deadlines": ["2024-01-30"],
    "topics": ["Project Alpha", "Q4 Review"]
  },
  "actionItems": [
    {
      "task": "Review contract terms",
      "deadline": "2024-01-30",
      "priority": "high"
    }
  ],
  "reminders": [
    {
      "title": "Follow up on contract",
      "dueDate": "2024-01-25",
      "priority": "medium",
      "description": "Check on contract status with client"
    }
  ],
  "calendarEvents": [
    {
      "title": "Contract Review Meeting",
      "startTime": "2024-01-28T10:00:00Z",
      "endTime": "2024-01-28T11:00:00Z",
      "description": "Review contract terms and conditions"
    }
  ],
  "memorySuggestions": [
    "REMEMBER Client ABC prefers email communication",
    "REMEMBER Project Alpha budget is $50,000"
  ],
  "aiResponse": "I've analyzed your PDF and found several important items that need your attention.",
  "followUpQuestions": [
    "Help me set reminders for the deadlines",
    "Show me how to add this to my calendar",
    "Help me save key information to my memory"
  ]
}`

    const userPrompt = `Please analyze this PDF document:

FILENAME: ${file.originalFilename || 'document.pdf'}
SIZE: ${Math.round(file.size / 1024)} KB
CONTENT:
${textContent}

Provide a comprehensive analysis following the JSON format above.`

    // Call OpenAI API
    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: `${systemPrompt}\n\n${userPrompt}`,
    })

    const aiResponse = response.output_text
    
    if (!aiResponse) {
      throw new Error('No response from AI')
    }

    // Parse the AI response
    let analysis
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse)
      throw new Error('Failed to parse AI analysis')
    }

    // Enhance the analysis with metadata
    const enhancedAnalysis = {
      ...analysis,
      fileName: file.originalFilename || 'document.pdf',
      fileSize: Math.round(file.size / 1024),
      textLength: textContent.length,
      processingTime: new Date().toISOString(),
      aiModel: 'gpt-5-mini'
    }

    console.log(`PDF analysis completed for: ${file.originalFilename}`)
    console.log('Analysis result:', enhancedAnalysis)

    return res.status(200).json(enhancedAnalysis)

  } catch (error) {
    console.error('PDF analysis error:', error)
    
    // Return a fallback response
    const fallbackAnalysis = {
      documentType: 'other',
      importance: 'medium',
      summary: 'PDF processing failed, but the document has been uploaded.',
      keyPoints: ['Document uploaded successfully'],
      extractedData: {
        people: [],
        dates: [],
        amounts: [],
        deadlines: [],
        topics: []
      },
      actionItems: [],
      reminders: [],
      calendarEvents: [],
      memorySuggestions: [],
      aiResponse: "I had trouble analyzing this PDF, but it's been saved for you.",
      followUpQuestions: [
        "Help me try analyzing this again",
        "Show me how to organize this manually"
      ],
      error: 'PDF processing failed',
      fallback: true
    }

    return res.status(500).json(fallbackAnalysis)
  }
}
