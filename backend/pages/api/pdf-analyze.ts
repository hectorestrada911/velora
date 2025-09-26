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
        // Support PDFs and images
        return mimetype === 'application/pdf' || mimetype.startsWith('image/')
      }
    })

    const [fields, files] = await form.parse(req)
    
    if (!files.file || !Array.isArray(files.file) || files.file.length === 0) {
      return res.status(400).json({ error: 'No file provided' })
    }

    const file = files.file[0]
    
    // Determine file type and process accordingly
    const isImage = file.mimetype.startsWith('image/')
    const isPDF = file.mimetype === 'application/pdf'
    
    let analysis;
    
    if (isPDF) {
      analysis = await processPDF(file)
    } else if (isImage) {
      analysis = await processImage(file)
    } else {
      return res.status(400).json({ error: 'Unsupported file type' })
    }

    console.log(`File analysis completed for: ${file.originalFilename}`)
    console.log('Analysis result:', analysis)

    return res.status(200).json(analysis)

  } catch (error) {
    console.error('File analysis error:', error)
    
    // Return a fallback response
    const fallbackAnalysis = {
      documentType: 'other',
      importance: 'medium',
      summary: 'File processing failed, but the document has been uploaded.',
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
      aiResponse: "I had trouble analyzing this file, but it's been saved for you.",
      followUpQuestions: [
        "Help me try analyzing this again",
        "Show me how to organize this manually"
      ],
      error: 'File processing failed',
      fallback: true
    }

    return res.status(500).json(fallbackAnalysis)
  }
}

async function processPDF(file: any) {
  try {
    // Read and parse the PDF
    const pdfBuffer = fs.readFileSync(file.filepath)
    const pdfData = await pdf(pdfBuffer)
    
    // Extract text content
    const textContent = pdfData.text
    
    console.log(`PDF processing: ${file.originalFilename}`)
    console.log(`Text length: ${textContent ? textContent.length : 0}`)
    console.log(`First 200 chars: ${textContent ? textContent.substring(0, 200) : 'No text'}`)
    
    if (!textContent || textContent.trim().length === 0) {
      console.error('No text content found in PDF')
      throw new Error('No text content found in PDF')
    }

    // Clean up the uploaded file
    fs.unlinkSync(file.filepath)

    return await analyzeContent(textContent, file, 'pdf')
  } catch (error) {
    console.error('PDF processing error:', error)
    // Clean up the uploaded file even if processing fails
    try {
      fs.unlinkSync(file.filepath)
    } catch (cleanupError) {
      console.error('Error cleaning up file:', cleanupError)
    }
    throw error
  }
}

async function processImage(file: any) {
  // Read image file
  const imageBuffer = fs.readFileSync(file.filepath)
  const base64Image = imageBuffer.toString('base64')
  
  // Clean up the uploaded file
  fs.unlinkSync(file.filepath)

  return await analyzeImage(base64Image, file)
}

async function analyzeContent(textContent: string, file: any, fileType: string) {
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

  // Enhanced AI analysis system prompt for document content
  const systemPrompt = `You are Velora, an AI assistant specialized in analyzing documents. Focus ONLY on the document content provided. Do NOT reference any external context, user habits, or personal information not explicitly mentioned in the document.

CURRENT DATE & TIME: ${currentDateStr} at ${currentTime}

DOCUMENT ANALYSIS TASKS:
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
- Focus ONLY on document content - do NOT reference external context

SPECIAL INSTRUCTIONS FOR RESUME/CV ANALYSIS:
- Extract contact information, skills, experience, education
- Identify key achievements and qualifications
- Suggest how to use this information for job applications
- Create memory suggestions for important details

SPECIAL INSTRUCTIONS FOR CONTRACT/LEGAL DOCUMENTS:
- Identify key terms, deadlines, and obligations
- Highlight important dates and amounts
- Suggest follow-up actions and reminders
- Create memory suggestions for critical information

CRITICAL: Do NOT reference any user habits, personal preferences, or external context. Focus ONLY on the document content provided.

Return ONLY valid JSON in this exact format:
{
  "documentType": "contract|report|invoice|proposal|manual|academic|resume|cv|other",
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
  "aiResponse": "I've analyzed your document and found several important items that need your attention.",
  "followUpQuestions": [
    "Help me set reminders for the deadlines",
    "Show me how to add this to my calendar",
    "Help me save key information to my memory"
  ]
}`

  const userPrompt = `Please analyze this ${fileType.toUpperCase()} document:

FILENAME: ${file.originalFilename || 'document.pdf'}
SIZE: ${Math.round(file.size / 1024)} KB
CONTENT:
${textContent}

Provide a comprehensive analysis following the JSON format above.`

  // Call OpenAI API
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    response_format: { type: "json_object" },
  })

  const aiResponse = response.choices[0].message.content
  
  if (!aiResponse) {
    throw new Error('No response from AI')
  }

  // Parse the AI response
  let analysis
  try {
    analysis = JSON.parse(aiResponse)
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
    aiModel: 'gpt-4o',
    fileType: fileType
  }

  return enhancedAnalysis
}

async function analyzeImage(base64Image: string, file: any) {
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

  const systemPrompt = `You are Velora, an AI assistant specialized in analyzing images and extracting actionable insights. Focus ONLY on the image content provided. Do NOT reference any external context, user habits, or personal information not explicitly visible in the image.

CURRENT DATE & TIME: ${currentDateStr} at ${currentTime}

IMAGE ANALYSIS TASKS:
1. **Visual Understanding**: Analyze the image content, objects, text, and context
2. **Text Extraction**: Identify and extract any text visible in the image
3. **Information Extraction**: Identify important data like dates, names, numbers, etc.
4. **Summary Generation**: Create a concise, useful summary
5. **Memory Integration**: Suggest what information should be saved to user's memory
6. **Follow-up Actions**: Recommend next steps based on the image content

CRITICAL: Do NOT reference any user habits, personal preferences, or external context. Focus ONLY on what is visible in the image.

Return ONLY valid JSON in this exact format:
{
  "documentType": "image|document|screenshot|diagram|chart|photo|other",
  "importance": "high|medium|low",
  "summary": "Concise 2-3 sentence summary of the image",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "extractedData": {
    "people": ["Name 1", "Name 2"],
    "dates": ["2024-01-15", "2024-02-01"],
    "amounts": ["$1,000", "€500"],
    "deadlines": ["2024-01-30"],
    "topics": ["Project Alpha", "Q4 Review"],
    "textContent": "Any text found in the image"
  },
  "actionItems": [
    {
      "task": "Review document in image",
      "deadline": "2024-01-30",
      "priority": "high"
    }
  ],
  "memorySuggestions": [
    "REMEMBER Important information from this image"
  ],
  "aiResponse": "I've analyzed your image and extracted the key information.",
  "followUpQuestions": [
    "Help me save this information to my memory",
    "Create reminders based on this image"
  ]
}`

  const userPrompt = `Please analyze this image:

FILENAME: ${file.originalFilename || 'image.jpg'}
SIZE: ${Math.round(file.size / 1024)} KB

Provide a comprehensive analysis following the JSON format above.`

  // Call OpenAI API with image using GPT-4o
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { 
        role: "user", 
        content: [
          { type: "text", text: userPrompt },
          {
            type: "image_url",
            image_url: {
              url: `data:${file.mimetype};base64,${base64Image}`
            }
          }
        ]
      }
    ],
    response_format: { type: "json_object" },
  })

  const aiResponse = response.choices[0].message.content
  
  if (!aiResponse) {
    throw new Error('No response from AI')
  }

  // Parse the AI response
  let analysis
  try {
    analysis = JSON.parse(aiResponse)
  } catch (parseError) {
    console.error('Failed to parse AI response:', aiResponse)
    throw new Error('Failed to parse AI analysis')
  }

  // Enhance the analysis with metadata
  const enhancedAnalysis = {
    ...analysis,
    fileName: file.originalFilename || 'image.jpg',
    fileSize: Math.round(file.size / 1024),
    processingTime: new Date().toISOString(),
    aiModel: 'gpt-4o',
    fileType: 'image'
  }

  return enhancedAnalysis
}
