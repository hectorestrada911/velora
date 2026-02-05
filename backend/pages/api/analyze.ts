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
    const { content, conversationHistory, relevantMemories, recallSuggestions, currentDate: clientCurrentDate } = req.body

    if (!content) {
      return res.status(400).json({ error: 'Content is required' })
    }

    // Get current date/time for time-aware responses
    const now = new Date(clientCurrentDate || new Date().toISOString())
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
    const hour = now.getHours()
    
    // Determine time of day for greetings
    let timeOfDay = 'day'
    if (hour < 12) timeOfDay = 'morning'
    else if (hour < 17) timeOfDay = 'afternoon'
    else timeOfDay = 'evening'

    // Build context efficiently (limit sizes for performance)
    const dateContext = `Current date: ${currentDateStr} at ${currentTime}`
    const conversationContext = conversationHistory && conversationHistory.length > 0 
      ? `\nRecent: ${conversationHistory.slice(-3).map((c: any) => (c.content || c).substring(0, 100)).join('; ')}` 
      : ''
    const memoryContext = relevantMemories && relevantMemories.length > 0
      ? `\nMemories: ${relevantMemories.slice(0, 2).map((m: any) => (typeof m === 'string' ? m : m.content || '').substring(0, 100)).join('; ')}`
      : ''
    const recallContext = recallSuggestions && recallSuggestions.length > 0
      ? `\nRecall: ${recallSuggestions.slice(0, 2).join('; ')}`
      : ''

    const fullContext = dateContext + conversationContext + memoryContext + recallContext

    // Optimized system prompt with explicit date parsing instructions
    const systemPrompt = `You are Velora, an AI productivity assistant. Current date: ${currentDateStr} at ${currentTime} ${timeOfDay}.

Features: Remember info, set reminders, schedule events, analyze documents.

Response rules:
- Answer directly, never generic responses like "I've analyzed your content"
- For "What can you help with?", respond: "I'm Velora! I help with: remembering info, reminders, calendar, documents. What do you need?"
- Use conversation history for context/pronouns
- ALWAYS create calendar events when user mentions meetings, appointments, events, or scheduling
- Be conversational, answer questions directly

CRITICAL - DATE PARSING:
- Current date context: ${currentDateStr} (${now.toISOString().split('T')[0]})
- Parse dates like "February 6" = ${now.getFullYear()}-02-06 (use current year)
- Parse times like "8 pm" = 20:00 (24-hour format)
- Combine date + time: "February 6 at 8 pm" = ${now.getFullYear()}-02-06T20:00:00Z
- For "today" use: ${now.toISOString().split('T')[0]}
- For "tomorrow" use: ${new Date(now.getTime() + 24*60*60*1000).toISOString().split('T')[0]}
- Always return dates in ISO format: YYYY-MM-DDTHH:MM:SSZ
- Default duration: 1 hour if endTime not specified

CALENDAR EVENT CREATION:
- When user says "meeting", "appointment", "event", "schedule", "add to calendar" → CREATE calendarEvent
- Extract: title (what the meeting is about), startTime (date + time), endTime (startTime + 1 hour if not specified)
- Example: "meeting at 8 pm on February 6" → calendarEvent with title="Meeting", startTime="${now.getFullYear()}-02-06T20:00:00Z", endTime="${now.getFullYear()}-02-06T21:00:00Z"

Return JSON:
{
  "type": "meeting|task|reminder|note|other",
  "priority": "high|medium|low",
  "summary": "Brief description",
  "tags": ["tag1"],
  "extractedData": {"people": [], "dates": [], "actions": [], "topics": []},
  "calendarEvent": {"title": "Meeting", "startTime": "2025-02-06T20:00:00Z", "endTime": "2025-02-06T21:00:00Z", "description": "..."} or null,
  "reminder": {"title": "...", "dueDate": "2025-02-06T20:00:00Z", "priority": "medium", "description": "..."} or null,
  "aiResponse": "I've added your meeting to your calendar for February 6 at 8 PM!",
  "followUpQuestions": ["Show me my calendar"],
  "featureSuggestions": ["calendar", "reminder"]
}`

    const userPrompt = `User message: "${content}"
Current date context: ${currentDateStr} (${now.toISOString().split('T')[0]})

Instructions:
- If user mentions a meeting, appointment, event, or scheduling → CREATE calendarEvent with proper date/time parsing
- Parse dates relative to current date: ${now.toISOString().split('T')[0]}
- Parse times: "8 pm" = 20:00, "2 pm" = 14:00, "10 am" = 10:00
- Combine date + time into ISO format: YYYY-MM-DDTHH:MM:SSZ
- For "February 6" use year ${now.getFullYear()}: ${now.getFullYear()}-02-06
- Answer directly and confirm what you're creating
- Return JSON with calendarEvent if scheduling is mentioned`

    // Use GPT-4o-mini with chat completions API (reliable and working)
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
    })

    // Parse AI response - chat completions uses choices[0].message.content
    let aiResponse = response.choices[0]?.message?.content || '{}'
    
    // Remove markdown code blocks if present
    if (aiResponse.includes('```json')) {
      aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    }
    if (aiResponse.includes('```')) {
      aiResponse = aiResponse.replace(/```\n?/g, '')
    }
    
    // Clean up any extra whitespace
    aiResponse = aiResponse.trim()
    
    let analysis
    try {
      analysis = JSON.parse(aiResponse)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Raw AI response:', aiResponse)
      // Fallback to basic response
      analysis = {
        type: 'other',
        priority: 'medium',
        summary: content.substring(0, 100),
        tags: ['conversation'],
        extractedData: { people: [], dates: [], actions: [], topics: [] },
        calendarEvent: null,
        reminder: null,
        aiResponse: "I understand. How can I help you today?",
        followUpQuestions: ["Help me organize my day", "Show me my calendar"],
        featureSuggestions: ["calendar", "reminder"]
      }
    }

    // Return optimized response
    return res.status(200).json({
      type: analysis.type || 'other',
      priority: analysis.priority || 'medium',
      confidence: analysis.confidence || 0.8,
      summary: analysis.summary || content.substring(0, 100),
      tags: analysis.tags || [],
      extractedData: {
        people: analysis.extractedData?.people || [],
        dates: analysis.extractedData?.dates || [],
        actions: analysis.extractedData?.actions || [],
        topics: analysis.extractedData?.topics || []
      },
      calendarEvent: analysis.calendarEvent || null,
      reminder: analysis.reminder || null,
      aiResponse: analysis.aiResponse || "I've analyzed your content and organized it for you!",
      followUpQuestions: analysis.followUpQuestions || ["Show me what I have planned today", "Help me set a reminder for something"],
      featureSuggestions: analysis.featureSuggestions || [],
      aiModel: 'gpt-4o-mini',
      processingTime: Date.now() - (new Date(clientCurrentDate || new Date().toISOString()).getTime())
    })

  } catch (error) {
    console.error('Analysis error:', error)
    return res.status(500).json({ 
      error: 'Failed to analyze content',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
