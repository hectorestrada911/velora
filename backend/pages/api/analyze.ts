import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(200).end()
  }

  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { content } = req.body

    if (!content) {
      return res.status(400).json({ error: 'Content is required' })
    }

    // Comprehensive system prompt for AI analysis
    const systemPrompt = `You are an intelligent productivity assistant. Analyze the given content and extract:

1. **Content Type**: Determine if this is a task, meeting, reminder, note, or other
2. **Priority**: high, medium, or low based on urgency and importance
3. **Summary**: A concise summary of the content
4. **Tags**: Relevant tags for organization
5. **Extracted Data**:
   - People mentioned
   - Dates and times
   - Actions required
   - Topics discussed
6. **Calendar Event**: If applicable, create a calendar event with:
   - title, startTime, endTime, description
7. **Reminder**: If applicable, create a reminder with:
   - title, dueDate, priority, description
8. **AI Response**: A conversational response acknowledging the analysis
9. **Follow-up Questions**: 2-3 relevant follow-up questions

Return ONLY valid JSON in this exact format:
{
  "type": "task|meeting|reminder|note|other",
  "priority": "high|medium|low",
  "confidence": 0.0-1.0,
  "summary": "Brief summary",
  "tags": ["tag1", "tag2"],
  "extractedData": {
    "people": ["John Doe"],
    "dates": ["2024-01-15"],
    "actions": ["call John about Q4 deadline"],
    "topics": ["Q4 deadline"]
  },
  "calendarEvent": {
    "title": "Call John about Q4 deadline",
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T11:00:00Z",
    "description": "Discuss Q4 deadline with John"
  },
  "reminder": {
    "title": "Call John about Q4 deadline",
    "dueDate": "2024-01-15T10:00:00Z",
    "priority": "high",
    "description": "Important deadline discussion"
  },
  "aiResponse": "I'll add 'Call John about Q4 deadline' to your calendar for tomorrow. This sounds important!",
  "followUpQuestions": ["What time would you like to call John?", "Should I set a reminder 15 minutes before?"]
}`

    const userPrompt = `Please analyze this document content:

${content}

Return only valid JSON, no other text.`

    // Call OpenAI API using the new responses API for gpt-5-mini
    const response = await openai.responses.create({
      model: "gpt-5-mini", // Using GPT-5 mini as per your platform
      input: `${systemPrompt}\n\n${userPrompt}`,
      temperature: 0.3, // Lower temperature for more consistent analysis
    })

    const aiResponse = response.output_text
    
    if (!aiResponse) {
      throw new Error('No response from AI')
    }

    // Parse the AI response
    let analysis
    try {
      // Try to extract JSON from the response
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

    // Validate and enhance the analysis
    const enhancedAnalysis = {
      type: analysis.type || 'document',
      priority: analysis.priority || 'medium',
      confidence: analysis.confidence || 0.8,
      summary: analysis.summary || content.substring(0, 150) + '...',
      tags: analysis.tags || ['document', 'uploaded'],
      extractedData: {
        people: analysis.extractedData?.people || [],
        dates: analysis.extractedData?.dates || [],
        actions: analysis.extractedData?.actions || [],
        topics: analysis.extractedData?.topics || []
      },
      calendarEvent: analysis.calendarEvent || null,
      reminder: analysis.reminder || null,
      aiResponse: analysis.aiResponse || "I've analyzed your content and organized it for you!",
      followUpQuestions: analysis.followUpQuestions || ["Is there anything else you'd like me to help with?", "Would you like me to set any reminders?"],
      aiModel: 'gpt-5-mini',
      analysisTimestamp: new Date().toISOString()
    }

    // Log successful analysis
    console.log(`AI analysis completed for content length: ${content.length}`)
    console.log('Analysis result:', enhancedAnalysis)

    return res.status(200).json(enhancedAnalysis)

  } catch (error) {
    console.error('AI analysis error:', error)
    
    // Return a fallback analysis if AI fails
    const fallbackAnalysis = {
      type: 'document',
      priority: 'medium',
      confidence: 0.6,
      summary: 'AI analysis failed, using fallback parsing',
      tags: ['document', 'fallback'],
      extractedData: {
        people: [],
        dates: [],
        actions: [],
        topics: []
      },
      calendarEvent: null,
      reminder: null,
      aiResponse: "I'm having trouble analyzing this right now, but I've saved it for you.",
      followUpQuestions: ["Would you like to try again?", "Can I help you organize it manually?"],
      error: 'AI analysis failed, using fallback',
      fallback: true
    }

    return res.status(500).json(fallbackAnalysis)
  }
}
