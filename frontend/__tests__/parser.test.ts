import { describe, it, expect } from '@jest/globals'

// Mock the parseContent function from the API route
function parseContent(text: string) {
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

describe('Content Parser', () => {
  describe('Reminder Detection', () => {
    it('should detect "tomorrow" reminders', () => {
      const text = "Call John tomorrow at 3pm about the project"
      const result = parseContent(text)
      
      expect(result.reminders).toHaveLength(1)
      expect(result.reminders[0].summary).toContain('Call John tomorrow')
    })

    it('should detect "next week" reminders', () => {
      const text = "Follow up with the client next week"
      const result = parseContent(text)
      
      expect(result.reminders).toHaveLength(1)
      expect(result.reminders[0].summary).toContain('Follow up with the client')
    })

    it('should detect "in 2 hours" reminders', () => {
      const text = "Check the email in 2 hours"
      const result = parseContent(text)
      
      expect(result.reminders).toHaveLength(1)
      expect(result.reminders[0].summary).toContain('Check the email')
    })

    it('should handle multiple time references', () => {
      const text = "Call John tomorrow at 3pm and follow up next week"
      const result = parseContent(text)
      
      expect(result.reminders).toHaveLength(2)
    })
  })

  describe('Entity Extraction', () => {
    it('should extract people names', () => {
      const text = "Meeting with John and Sarah about the project"
      const result = parseContent(text)
      
      expect(result.entities.people).toContain('John')
      expect(result.entities.people).toContain('Sarah')
    })

    it('should extract topic keywords', () => {
      const text = "Need to review the budget and plan the strategy"
      const result = parseContent(text)
      
      expect(result.entities.topics).toContain('budget')
      expect(result.entities.topics).toContain('strategy')
    })

    it('should generate relevant tags', () => {
      const text = "Project meeting with John about the deadline"
      const result = parseContent(text)
      
      expect(result.tags).toContain('project')
      expect(result.tags).toContain('meeting')
      expect(result.tags).toContain('deadline')
    })
  })

  describe('Context Extraction', () => {
    it('should extract meaningful context around time references', () => {
      const text = "Remember to call John tomorrow at 3pm about the project deadline"
      const result = parseContent(text)
      
      expect(result.reminders[0].summary).toContain('call John tomorrow')
      expect(result.reminders[0].summary).toContain('project deadline')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty text', () => {
      const result = parseContent('')
      
      expect(result.reminders).toHaveLength(0)
      expect(result.tags).toHaveLength(0)
      expect(result.entities.people).toHaveLength(0)
      expect(result.entities.topics).toHaveLength(0)
    })

    it('should handle text without time references', () => {
      const text = "This is just a regular note without any reminders"
      const result = parseContent(text)
      
      expect(result.reminders).toHaveLength(0)
      expect(result.tags.length).toBeGreaterThan(0)
    })

    it('should handle text with only names', () => {
      const text = "John Sarah Mike"
      const result = parseContent(text)
      
      expect(result.entities.people).toContain('John')
      expect(result.entities.people).toContain('Sarah')
      expect(result.entities.people).toContain('Mike')
    })
  })
})
