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

    // Optimized system prompt (shorter for faster responses)
    const systemPrompt = `You are Velora, an AI productivity assistant. Time: ${currentTime} ${timeOfDay}.

Features: Remember info, set reminders, schedule events, analyze documents.

Response rules:
- Answer directly, never generic responses like "I've analyzed your content"
- For "What can you help with?", respond: "I'm Velora! I help with: remembering info, reminders, calendar, documents. What do you need?"
- Use conversation history for context/pronouns
- Create calendar events + reminders for scheduling mentions
- Be conversational, answer questions directly

Return JSON:
{
  "type": "task|meeting|reminder|note|other",
  "priority": "high|medium|low",
  "summary": "Brief description",
  "tags": ["tag1"],
  "extractedData": {"people": [], "dates": [], "actions": [], "topics": []},
  "calendarEvent": {"title": "...", "startTime": "...", "endTime": "...", "description": "..."} or null,
  "reminder": {"title": "...", "dueDate": "...", "priority": "...", "description": "..."} or null,
  "aiResponse": "Direct, helpful response",
  "followUpQuestions": ["Show me..."],
  "featureSuggestions": ["calendar", "reminder"]
}`

    const userPrompt = `User: "${content}"${fullContext}

Instructions: Answer directly, use context for pronouns, create events for scheduling mentions. Return JSON.`

    // Use GPT-5-mini with responses API (different from chat completions)
    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: `${systemPrompt}\n\n${userPrompt}`,
    })

    // Parse AI response - GPT-5-mini uses output_text instead of choices[0].message.content
    let aiResponse = response.output_text || '{}'
    
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
      aiModel: 'gpt-5-mini',
      processingTime: Date.now() - now.getTime()
    })

  } catch (error) {
    console.error('Analysis error:', error)
    return res.status(500).json({ 
      error: 'Failed to analyze content',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
