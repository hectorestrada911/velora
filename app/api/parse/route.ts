import { NextRequest, NextResponse } from 'next/server'

interface ParsedContent {
  reminders: Array<{
    dueAt: string
    summary: string
  }>
  tags: string[]
  entities: {
    people: string[]
    topics: string[]
  }
}

// Simple NLP rules for extracting reminders and entities
function parseContent(text: string): ParsedContent {
  const lowerText = text.toLowerCase()
  const words = text.split(/\s+/)
  
  const reminders: Array<{ dueAt: string; summary: string }> = []
  const tags: string[] = []
  const people: string[] = []
  const topics: string[] = []

  // Extract time-based reminders
  const timePatterns = [
    { pattern: /(?:tomorrow|tmr|tmrw)\s+(?:at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i, offset: 24 * 60 * 60 * 1000 },
    { pattern: /(?:next\s+)?(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, offset: 7 * 24 * 60 * 60 * 1000 },
    { pattern: /(?:in\s+)?(\d+)\s+(?:hour|hr)s?/i, offset: 60 * 60 * 1000 },
    { pattern: /(?:in\s+)?(\d+)\s+(?:day|days)/i, offset: 24 * 60 * 60 * 1000 },
    { pattern: /(?:in\s+)?(\d+)\s+(?:week|weeks)/i, offset: 7 * 24 * 60 * 60 * 1000 }
  ]

  timePatterns.forEach(({ pattern, offset }) => {
    const match = lowerText.match(pattern)
    if (match) {
      const now = new Date()
      let dueDate = new Date(now.getTime() + offset)
      
      // Handle specific time mentions
      const timeMatch = lowerText.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i)
      if (timeMatch) {
        const timeStr = timeMatch[1]
        const [hour, minute] = timeStr.replace(/\s*(am|pm)/i, '').split(':')
        let hourNum = parseInt(hour)
        const isPM = /pm/i.test(timeStr)
        
        if (isPM && hourNum !== 12) hourNum += 12
        if (!isPM && hourNum === 12) hourNum = 0
        
        dueDate.setHours(hourNum, minute ? parseInt(minute) : 0, 0, 0)
      }
      
      // Extract context for reminder summary
      const context = extractContext(text, match.index || 0)
      reminders.push({
        dueAt: dueDate.toISOString(),
        summary: context || 'Reminder from voice note'
      })
    }
  })

  // Extract people (capitalized words that might be names)
  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '')
    if (cleanWord.length > 2 && /^[A-Z]/.test(cleanWord) && !people.includes(cleanWord)) {
      people.push(cleanWord)
    }
  })

  // Extract topics (common productivity/work terms)
  const topicKeywords = [
    'project', 'meeting', 'deadline', 'task', 'todo', 'follow-up', 'followup',
    'call', 'email', 'review', 'plan', 'strategy', 'budget', 'report',
    'presentation', 'client', 'customer', 'team', 'collaboration'
  ]
  
  topicKeywords.forEach(keyword => {
    if (lowerText.includes(keyword) && !topics.includes(keyword)) {
      topics.push(keyword)
    }
  })

  // Generate tags from key terms
  const keyTerms = [...people, ...topics, ...words.filter(word => 
    word.length > 4 && /^[a-zA-Z]/.test(word) && !tags.includes(word.toLowerCase())
  )]
  
  tags.push(...keyTerms.slice(0, 5).map(term => term.toLowerCase()))

  return {
    reminders,
    tags: [...new Set(tags)], // Remove duplicates
    entities: {
      people: [...new Set(people)],
      topics: [...new Set(topics)]
    }
  }
}

function extractContext(text: string, matchIndex: number): string {
  const words = text.split(/\s+/)
  const matchWordIndex = text.substring(0, matchIndex).split(/\s+/).length - 1
  
  // Get words around the match for context
  const start = Math.max(0, matchWordIndex - 3)
  const end = Math.min(words.length, matchWordIndex + 4)
  
  return words.slice(start, end).join(' ').trim()
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      )
    }

    const parsedContent = parseContent(text)

    return NextResponse.json(parsedContent)
  } catch (error) {
    console.error('Content parsing error:', error)
    return NextResponse.json(
      { error: 'Failed to parse content' },
      { status: 500 }
    )
  }
}
