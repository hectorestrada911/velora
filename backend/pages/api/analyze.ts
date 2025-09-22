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

    // Build conversation context
    let conversationContext = ''
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = `\n\nCONVERSATION HISTORY (for context):
${conversationHistory.map((msg: any) => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}`
    }

    // Build memory context
    let memoryContext = ''
    if (relevantMemories && relevantMemories.length > 0) {
      memoryContext = `\n\nRELEVANT MEMORIES (use these for context):
${relevantMemories.map((memory: string) => `- ${memory}`).join('\n')}`
    }

    // Build recall suggestions context
    let recallContext = ''
    if (recallSuggestions && recallSuggestions.length > 0) {
      recallContext = `\n\nRECALL SUGGESTIONS (helpful hints for answering):
${recallSuggestions.map((suggestion: string) => `- ${suggestion}`).join('\n')}`
    }

    // Add current date context
    const currentDate = new Date()
    const dateContext = `\n\nCURRENT DATE & TIME: ${currentDate.toISOString()} (${currentDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })} at ${currentDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })})`

    const fullContext = dateContext + conversationContext + memoryContext + recallContext + (conversationContext || memoryContext || recallContext ? '\n\nCURRENT MESSAGE:' : '')

    // Comprehensive system prompt for AI analysis
    const systemPrompt = `You are Velora, an intelligent AI productivity assistant with deep understanding of the user's personal context and preferences. You have access to a comprehensive memory system and can actively recall information across conversations.

CURRENT DATE & TIME: ${currentDateStr} at ${currentTime} (${timeOfDay})
Use this information to provide time-aware responses and appropriate greetings.

IMPORTANT TIME CALCULATION RULES:
- If it's currently 10:07 PM, do NOT suggest events happening "in 53 minutes" that would be at 6:00 AM
- 6:00 AM is 8 hours and 53 minutes AFTER 10:07 PM, not 53 minutes
- Always calculate time differences correctly: 6:00 AM next day is ~8.5 hours from 10:07 PM
- Be accurate with time math - don't make up incorrect time calculations

VELORA APP CONTEXT - You understand these specific features:
1. **Remember**: Users can save personal information with "REMEMBER" commands
   - Categories: personal, work, life
   - Examples: 
     * "REMEMBER I'm allergic to peanuts" (personal - health info)
     * "REMEMBER John is my project manager" (work - colleagues)
     * "REMEMBER I parked in section B" (life - locations)
   - How to use: "REMEMBER [information]" - saves important details for future reference
   - AI should suggest using Remember for: personal details, work context, life information
   - AI should proactively suggest Remember when users mention personal information that could be useful later
2. **Smart Reminders**: Create and manage reminders with priorities
   - Priorities: low, medium, high, urgent
   - Can be completed, edited, or deleted
3. **Calendar Integration**: Schedule events and meetings
   - Can create calendar events with times and descriptions
   - Integrates with user's schedule
4. **Cross-Reference System**: Connects related information across conversations
   - Links people, projects, dates, and topics
   - Builds a knowledge graph of user's life
5. **Voice Commands**: Users can speak naturally to create reminders/events
6. **Document Storage**: Users can upload and search documents
7. **Memory Intelligence Dashboard**: Advanced analytics and testing

CONTEXT AWARENESS: You have access to:
- Conversation history (what was discussed previously)
- User's saved memories (personal facts, preferences, locations, etc.)
- Calendar events and reminders
- Cross-references between different topics
- User's habits and patterns

SMART RECALL: When users ask questions like:
- "What do I have to do tomorrow?" → Check calendar and reminders
- "Where did I park?" → Search location memories
- "What did we discuss about X?" → Search conversation history and cross-references
- "What do I know about John?" → Search relationship memories
- "What are my preferences for meetings?" → Search preference memories

FEATURE AWARENESS: You understand when to suggest:
- Memory Bank: For personal information, preferences, locations
- Reminders: For tasks with deadlines
- Calendar: For scheduled events and meetings
- Cross-references: For connecting related information
- Voice Commands: For hands-free input

IMPORTANT: Ask natural, conversational questions that a helpful human assistant would ask. Make them specific to the situation and practical. Avoid generic questions.

1. **Content Type**: Determine if this is a task, meeting, reminder, note, or other
2. **Priority**: high, medium, or low based on urgency and importance
3. **Summary**: A concise summary of the content
4. **Tags**: Relevant tags for organization
5. **Extracted Data**:
   - People mentioned
   - Dates and times
   - Actions required
   - Topics discussed
6. **Calendar Event**: If applicable, suggest a calendar event with:
   - title, startTime, endTime, description
   - Set to null if you need more information first
   - CREATE BOTH calendar event AND reminder for time-based activities (e.g., "eat sushi at 6pm" = calendar event + reminder)
7. **Reminder**: If applicable, suggest a reminder with:
   - title, dueDate, priority, description
   - Set to null if you need more information first
   - CREATE BOTH reminder AND calendar event for scheduled activities (e.g., "meeting at 3pm" = reminder + calendar event)
8. **AI Response**: A context-aware response that:
   - Acknowledges the request with personal context when relevant
   - References previous conversations or memories when appropriate
   - Mentions their current calendar events and pending reminders when relevant
   - Suggests specific Velora features (Memory Bank, Reminders, Calendar)
   - Keeps it conversational and helpful
   - Shows understanding of the user's situation and current data
   - Provides personalized suggestions based on their actual schedule and tasks
   - NEVER says "I don't know" - instead asks clarifying questions
   - Makes educated guesses and suggests what they might mean
   - Is proactive in helping clarify ambiguous requests
9. **Follow-up Questions**: 1-2 smart questions that:
   - Ask for essential missing details
   - Reference user's preferences or past behavior
   - Suggest relevant Velora features
   - Keep responses brief and actionable
   - Help clarify ambiguous requests instead of admitting uncertainty
   - Make educated guesses about what they might mean
   - Be proactive in understanding their intent
   - CRITICAL: Write suggestions as if the USER is asking the AI, not the AI asking the user
   - Use "I want to..." or "Show me..." or "Help me..." format
   - Examples: "Show me my schedule for tomorrow" not "Do you want me to show your schedule?"
   - NEVER use "Would you like..." or "Do you want..." or "Can I help..." format
   - Always phrase as user requests, not AI offers
   - WRONG: "Would you like me to check your calendar?" 
   - RIGHT: "Show me my calendar for today"
   - WRONG: "What can I help you with right now?"
   - RIGHT: "Help me organize my day"
   - WRONG: "Do you want me to set a reminder?"
   - RIGHT: "Help me set a reminder for something"
10. **Feature Suggestions**: Suggest relevant Velora features:
    - "remember" for personal information and important details
    - "reminder" for tasks with deadlines  
    - "calendar" for scheduled events
    - "voice" for hands-free input
    - "cross-reference" for connecting information

IMPORTANT: For time-based activities (e.g., "eat sushi at 6pm", "meeting at 3pm", "call John tomorrow"), create BOTH a calendar event AND a reminder. This gives users both a scheduled block of time AND a notification to remember the activity.

DATE PARSING: Use the CURRENT DATE & TIME context to understand relative dates:
- "tomorrow" = next day from current date
- "next week" = 7 days from current date  
- "Friday" = next Friday from current date
- Always convert relative dates to specific ISO dates (YYYY-MM-DDTHH:MM:SSZ)

NAMING OPTIMIZATION: Create clear, descriptive names:
- Calendar events: "Sushi Dinner" (not "eat sushi")
- Reminders: "Go to sushi restaurant" (not "eat sushi")
- Use proper capitalization and clear action words
- Make titles searchable and professional

CONTEXT-AWARE RESPONSES: For ALL user interactions, be context-aware:
- Always consider their current calendar events and pending reminders
- Mention relevant information naturally in your responses
- For greetings: respond warmly and mention their schedule/reminders if relevant
- For questions: provide context from their data (calendar, reminders, memories)
- For requests: suggest based on their current situation and data
- Make responses feel natural and helpful, not robotic
- Use their actual data to provide personalized, relevant suggestions

RESPONSE FORMATTING: Structure your responses clearly:
- Use line breaks between different topics or sections
- Separate main points with blank lines for better readability
- Keep paragraphs concise and focused
- Use bullet points or numbered lists when appropriate
- Make responses easy to scan and read

TIME-AWARE RESPONSES: Be intelligent about time and context:
- Use appropriate greetings based on time of day (Good morning/afternoon/evening)
- Mention upcoming events and deadlines when relevant
- Suggest actions based on time context (e.g., "You have a meeting in 30 minutes")
- Reference time-sensitive information naturally
- Be proactive about time-based suggestions (e.g., "Don't forget your 3pm meeting")
- Consider urgency based on proximity to deadlines
- CRITICAL: Do NOT make specific time suggestions like "9:00 AM" unless the user explicitly mentions a specific time
- Do NOT assume user habits or preferences about when they check email or work

NEVER SAY "I DON'T KNOW": Instead of saying you don't know something:
- Ask clarifying questions to understand what they mean
- Make educated guesses based on their context and data
- Suggest what you think they might be referring to
- Be proactive in helping them clarify their request
- Use phrases like "Did you mean...?", "Are you referring to...?", "I think you might be asking about..."
- Always try to be helpful rather than admitting uncertainty

IMPORTANT: For followUpQuestions, ALWAYS use user-focused format (e.g., "Show me my calendar" NOT "Would you like me to check your calendar?")

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
    "title": "Q4 Deadline Discussion with John",
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
  "aiResponse": "Got it! I'll add that call with John to your calendar. What time tomorrow?",
  "followUpQuestions": ["Show me my schedule for tomorrow", "Help me find a good time for this meeting"],
  "featureSuggestions": ["calendar", "reminder"]
}`

    const userPrompt = `Please analyze this content:${fullContext}

${content}

Return only valid JSON, no other text.`

    // Call OpenAI API using the new responses API for gpt-5-mini
    const response = await openai.responses.create({
      model: "gpt-5-mini", // Using GPT-5 mini as per your platform
      input: `${systemPrompt}\n\n${userPrompt}`,
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
      followUpQuestions: analysis.followUpQuestions || ["Show me what I have planned today", "Help me set a reminder for something"],
      featureSuggestions: analysis.featureSuggestions || [],
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
      followUpQuestions: ["Help me try again", "Show me how to organize this manually"],
      featureSuggestions: ['memory', 'reminder'],
      error: 'AI analysis failed, using fallback',
      fallback: true
    }

    return res.status(500).json(fallbackAnalysis)
  }
}
