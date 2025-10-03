import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://velora-beta-one.vercel.app')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(200).end()
  }

  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', 'https://velora-beta-one.vercel.app')
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

    // Build context efficiently
    const dateContext = `Current date: ${currentDateStr} at ${currentTime}`
    const conversationContext = conversationHistory ? `\nRecent conversations: ${conversationHistory.slice(-3).map((c: any) => c.content).join('; ')}` : ''
    const memoryContext = relevantMemories ? `\nRelevant memories: ${relevantMemories.slice(0, 3).map((m: any) => m.content).join('; ')}` : ''
    const recallContext = recallSuggestions ? `\nRecall suggestions: ${recallSuggestions.slice(0, 2).join('; ')}` : ''

    const fullContext = dateContext + conversationContext + memoryContext + recallContext

    // Simplified system prompt for more logical responses
    const systemPrompt = `You are Velora, an AI productivity assistant. Current time: ${currentTime} ${timeOfDay}.

CORE FEATURES:
- Remember: Save personal info with "REMEMBER [info]"
- Reminders: Tasks with priorities (low/medium/high/urgent)  
- Calendar: Schedule events and meetings
- Voice: Natural speech input

RESPONSE BEHAVIOR:
- Answer questions directly and naturally
- For greetings like "Hi" or "Hello", respond warmly and briefly
- For identity questions like "Are you Velora?", answer directly: "Yes, I'm Velora, your AI productivity assistant"
- For "What can you help me with?", explain your capabilities simply
- Only analyze calendar/reminders when the user specifically mentions them
- Don't force calendar analysis on simple greetings or questions
- Be conversational, not robotic

ANALYSIS: Return JSON with:
1. type: "task|meeting|reminder|note|other"
2. priority: "high|medium|low" 
3. summary: Brief description
4. tags: ["tag1", "tag2"]
5. extractedData: {people, dates, actions, topics}
6. calendarEvent: {title, startTime, endTime, description} or null
7. reminder: {title, dueDate, priority, description} or null
8. aiResponse: Helpful, conversational response
9. followUpQuestions: ["Show me...", "Help me..."] (user-focused format)
10. featureSuggestions: ["calendar", "reminder", "remember", "voice"]

CALENDAR DETECTION: Only for phrases like "I have a meeting this Friday" or "meeting at 3pm":
- Create BOTH calendar event AND reminder
- Extract dates: "this Friday" = this week's Friday, "next Friday" = next week's Friday
- Use current date context for relative dates

RESPONSE STYLE:
- Be helpful and conversational
- Answer questions directly
- Don't over-analyze simple greetings or questions
- Use user-focused follow-up questions ("Show me my calendar" not "Would you like me to check your calendar?")

Return ONLY valid JSON in this exact format (no markdown, no code blocks, just pure JSON):
{
  "type": "other",
  "priority": "medium", 
  "summary": "Brief description",
  "tags": ["conversation"],
  "extractedData": {
    "people": [],
    "dates": [],
    "actions": [],
    "topics": []
  },
  "calendarEvent": null,
  "reminder": null,
  "aiResponse": "Your response here",
  "followUpQuestions": ["Show me my calendar", "Help me with reminders"],
  "featureSuggestions": ["calendar", "reminder"]
}`

    const userPrompt = `Please analyze this content:${fullContext}

${content}

Return JSON with type, priority, summary, tags, extractedData, calendarEvent, reminder, aiResponse, followUpQuestions, featureSuggestions.`

    // Use GPT-4o-mini for faster responses
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000, // Reduced for faster responses
    })

    // Parse AI response, handling markdown code blocks
    let aiResponse = completion.choices[0].message.content || '{}'
    
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
