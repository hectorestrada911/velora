import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Simple in-memory cache for common queries (in production, use Redis)
const responseCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const MAX_CACHE_SIZE = 100 // Limit cache size

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const requestStartTime = Date.now()
  
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
    console.log(`[${new Date().toISOString()}] API request received`)
    const { content, conversationHistory, relevantMemories, recallSuggestions, currentDate: clientCurrentDate } = req.body

    if (!content) {
      return res.status(400).json({ error: 'Content is required' })
    }

    // Check cache for exact matches (simple queries)
    const cacheCheckStart = Date.now()
    const cacheKey = content.toLowerCase().trim().substring(0, 100) // Use first 100 chars as key
    const cached = responseCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      const cacheTime = Date.now() - cacheCheckStart
      console.log(`[${new Date().toISOString()}] Cache hit (${cacheTime}ms):`, cacheKey.substring(0, 50))
      return res.status(200).json(cached.data)
    }
    const cacheCheckTime = Date.now() - cacheCheckStart
    console.log(`[${new Date().toISOString()}] Cache miss (${cacheCheckTime}ms)`)

    // Clean old cache entries if needed
    if (responseCache.size >= MAX_CACHE_SIZE) {
      const oldestKey = Array.from(responseCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0]
      responseCache.delete(oldestKey)
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

    // Optimized system prompt - concise but explicit about date parsing
    const currentYear = now.getFullYear()
    const todayISO = now.toISOString().split('T')[0]
    const tomorrowISO = new Date(now.getTime() + 24*60*60*1000).toISOString().split('T')[0]
    
    const systemPrompt = `Velora AI assistant. Date: ${todayISO} ${currentTime} ${timeOfDay}.

Rules: Answer directly. Create calendar events for meetings/appointments/scheduling.

DATE PARSING (CRITICAL):
- "February 6" → ${currentYear}-02-06 | "8 pm" → 20:00 | "2 pm" → 14:00 | "10 am" → 10:00
- Combine: "Feb 6 at 8 pm" → ${currentYear}-02-06T20:00:00Z
- "today" → ${todayISO} | "tomorrow" → ${tomorrowISO}
- Format: YYYY-MM-DDTHH:MM:SSZ | Default duration: 1 hour

CALENDAR: If user mentions meeting/appointment/event/schedule → CREATE calendarEvent with title, startTime, endTime (startTime+1h if missing).

Return JSON: {"type":"meeting|task|reminder|note|other","priority":"high|medium|low","summary":"...","tags":[],"extractedData":{"people":[],"dates":[],"actions":[],"topics":[]},"calendarEvent":{"title":"Meeting","startTime":"${currentYear}-02-06T20:00:00Z","endTime":"${currentYear}-02-06T21:00:00Z","description":"..."} or null,"reminder":null,"aiResponse":"I've added your meeting for Feb 6 at 8 PM!","followUpQuestions":["Show me my calendar"],"featureSuggestions":["calendar"]}`

    const userPrompt = `User: "${content}" | Date: ${now.toISOString().split('T')[0]}

If scheduling mentioned → CREATE calendarEvent. Parse dates/times → ISO format. Return JSON.`

    // Use GPT-5-mini with responses API (different from chat completions)
    // Add timeout to OpenAI request to prevent hanging
    const openaiStartTime = Date.now()
    console.log(`[${new Date().toISOString()}] Calling OpenAI API...`)
    
    let response: any
    let openaiTime = 0
    try {
      response = await Promise.race([
        openai.responses.create({
          model: "gpt-5-mini",
          input: `${systemPrompt}\n\n${userPrompt}`,
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('OpenAI API timeout after 8 seconds')), 8000)
        )
      ]) as any
      openaiTime = Date.now() - openaiStartTime
      console.log(`[${new Date().toISOString()}] OpenAI API completed in ${openaiTime}ms`)
    } catch (openaiError) {
      openaiTime = Date.now() - openaiStartTime
      console.error(`[${new Date().toISOString()}] OpenAI API error after ${openaiTime}ms:`, openaiError)
      throw openaiError
    }

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

    // Build response
    const responseData = {
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
    }

    // Cache simple queries (not scheduling/calendar related - those need fresh parsing)
    if (!content.toLowerCase().match(/(meeting|appointment|event|schedule|calendar|reminder|february|march|april|may|june|july|august|september|october|november|december|january|\d{1,2}\/\d{1,2}|\d{1,2}:\d{2}|am|pm)/)) {
      responseCache.set(cacheKey, { data: responseData, timestamp: Date.now() })
    }

    const totalTime = Date.now() - requestStartTime
    console.log(`[${new Date().toISOString()}] Total request time: ${totalTime}ms`)
    
    return res.status(200).json({
      ...responseData,
      processingTime: totalTime,
      openaiTime: openaiTime
    })

  } catch (error) {
    const totalTime = Date.now() - requestStartTime
    console.error(`[${new Date().toISOString()}] Analysis error after ${totalTime}ms:`, error)
    return res.status(500).json({ 
      error: 'Failed to analyze content',
      details: error instanceof Error ? error.message : 'Unknown error',
      processingTime: totalTime
    })
  }
}
