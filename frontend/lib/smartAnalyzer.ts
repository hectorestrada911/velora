// Smart Content Analyzer - AI-powered thought organization
export interface AnalyzedContent {
  type: 'task' | 'reminder' | 'idea' | 'note' | 'meeting' | 'contact'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  confidence: number
  extractedData: {
    dueDate?: Date
    people?: string[]
    projects?: string[]
    topics?: string[]
    actions?: string[]
    locations?: string[]
    amounts?: string[]
    recurring?: {
      pattern: 'daily' | 'weekly' | 'monthly' | 'yearly'
      interval: number
    }
  }
  summary: string
  suggestedTags: string[]
  calendarEvent?: {
    title: string
    startTime: Date
    endTime?: Date
    allDay: boolean
    description?: string
  }
  reminder?: {
    title: string
    dueDate: Date
    priority: string
    description?: string
  }
  aiResponse?: string
  followUpQuestions?: string[]
}

// Priority detection patterns
const PRIORITY_PATTERNS = {
  urgent: [
    /\b(urgent|asap|immediately|right now|emergency|critical|deadline|overdue)\b/i,
    /\b(must|need to|have to|essential|vital|crucial)\b/i
  ],
  high: [
    /\b(important|priority|key|major|significant)\b/i,
    /\b(soon|quickly|fast|hurry)\b/i
  ],
  medium: [
    /\b(should|ought to|good to|nice to)\b/i,
    /\b(when you can|when possible|sometime)\b/i
  ],
  low: [
    /\b(maybe|if time|optional|low priority|not urgent)\b/i,
    /\b(eventually|someday|when convenient)\b/i
  ]
}

// Date/time extraction patterns
const DATE_PATTERNS = {
  today: /\b(today|tonight|this evening)\b/i,
  tomorrow: /\b(tomorrow|tmr|tmrw)\b/i,
  nextWeek: /\b(next week|following week)\b/i,
  nextMonth: /\b(next month|following month)\b/i,
  specificDay: /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  specificMonth: /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i,
  time: /\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/i,
  relative: /\b(in \d+ (?:days?|weeks?|months?|years?))\b/i,
  recurring: /\b(every|daily|weekly|monthly|yearly|each)\b/i
}

// Intent classification patterns
const INTENT_PATTERNS = {
  task: [
    /\b(need to|have to|must|should|want to|plan to)\b/i,
    /\b(do|complete|finish|start|work on|prepare)\b/i,
    /\b(call|email|text|message|meet|schedule)\b/i
  ],
  reminder: [
    /\b(remind|remember|don't forget|follow up|check back)\b/i,
    /\b(due|deadline|by|before|after)\b/i,
    /\b(review|approve|submit|send)\b/i
  ],
  idea: [
    /\b(idea|thought|concept|maybe|what if|consider)\b/i,
    /\b(brainstorm|explore|research|look into)\b/i,
    /\b(innovation|improvement|solution)\b/i
  ],
  meeting: [
    /\b(meeting|call|conference|discussion|sync|standup)\b/i,
    /\b(present|demo|show|walk through)\b/i,
    /\b(team|group|collaboration)\b/i
  ],
  contact: [
    /\b(contact|reach out|get in touch|connect with)\b/i,
    /\b(call|email|text|message)\s+\b([A-Z][a-z]+)\b/i,
    /\b(meet|catch up|coffee|lunch)\s+\b([A-Z][a-z]+)\b/i
  ]
}

// Project/topic extraction
const PROJECT_PATTERNS = {
  work: [
    /\b(project|client|customer|team|company|business)\b/i,
    /\b(deadline|deliverable|milestone|phase)\b/i,
    /\b(report|presentation|proposal|document)\b/i
  ],
  personal: [
    /\b(personal|family|home|health|fitness|hobby)\b/i,
    /\b(shopping|errands|appointments|travel)\b/i,
    /\b(goals|resolutions|habits)\b/i
  ]
}

export function analyzeContent(text: string): AnalyzedContent {
  const lowerText = text.toLowerCase()
  
  // Determine content type
  const type = determineContentType(lowerText)
  
  // Determine priority
  const priority = determinePriority(lowerText)
  
  // Extract dates and times
  const extractedData = extractData(text)
  
  // Generate summary
  const summary = generateSummary(text, type, extractedData)
  
  // Suggest tags
  const suggestedTags = generateTags(text, type, extractedData)
  
  // Create calendar event if applicable
  const calendarEvent = createCalendarEvent(text, extractedData, summary)
  
  // Create reminder if applicable
  const reminder = createReminder(text, extractedData, summary, priority)
  
  return {
    type,
    priority,
    confidence: calculateConfidence(text, type, extractedData),
    extractedData,
    summary,
    suggestedTags,
    calendarEvent,
    reminder,
    aiResponse: generateAIResponse(text, type, extractedData),
    followUpQuestions: generateFollowUpQuestions(text, type, extractedData)
  }
}

function determineContentType(text: string): AnalyzedContent['type'] {
  const scores = {
    task: 0,
    reminder: 0,
    idea: 0,
    note: 0,
    meeting: 0,
    contact: 0
  }
  
  // Score each intent pattern
  Object.entries(INTENT_PATTERNS).forEach(([intent, patterns]) => {
    patterns.forEach(pattern => {
      if (pattern.test(text)) {
        scores[intent as keyof typeof scores] += 1
      }
    })
  });
  
  // Find the highest scoring type
  const maxScore = Math.max(...Object.values(scores))
  const maxTypes = Object.entries(scores).filter(([_, score]) => score === maxScore)
  
  if (maxScore === 0) return 'note'
  if (maxTypes.length === 1) return maxTypes[0][0] as AnalyzedContent['type']
  
  // If tied, prioritize by business logic
  if (scores.reminder > 0) return 'reminder'
  if (scores.task > 0) return 'task'
  if (scores.meeting > 0) return 'meeting'
  if (scores.contact > 0) return 'contact'
  if (scores.idea > 0) return 'idea'
  
  return 'note'
}

function determinePriority(text: string): AnalyzedContent['priority'] {
  for (const [priority, patterns] of Object.entries(PRIORITY_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return priority as AnalyzedContent['priority']
      }
    }
  }
  
  // Default priority based on content type
  return 'medium'
}

function extractData(text: string) {
  const extractedData: AnalyzedContent['extractedData'] = {
    people: [],
    projects: [],
    topics: [],
    actions: [],
    locations: [],
    amounts: [],
  }
  
  // Extract people (capitalized names)
  const peopleMatches = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g)
  if (peopleMatches) {
    extractedData.people = peopleMatches.filter(name => 
      !['Today', 'Tomorrow', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(name)
    )
  }
  
  // Extract dates
  const dueDate = extractDueDate(text)
  if (dueDate) {
    extractedData.dueDate = dueDate
  }
  
  // Extract recurring patterns
  const recurring = extractRecurringPattern(text)
  if (recurring) {
    extractedData.recurring = recurring
  }
  
  // Extract projects/topics
  Object.entries(PROJECT_PATTERNS).forEach(([category, patterns]) => {
    patterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        if (extractedData.topics) {
          extractedData.topics.push(...matches)
        }
      }
    })
  })
  
  // Extract actions
  const actionVerbs = ['call', 'email', 'meet', 'review', 'prepare', 'submit', 'follow up', 'check']
  actionVerbs.forEach(verb => {
    if (text.toLowerCase().includes(verb)) {
      if (extractedData.actions) {
        extractedData.actions.push(verb)
      }
    }
  })
  
  return extractedData
}

function extractDueDate(text: string): Date | undefined {
  const now = new Date()
  
  // Today
  if (DATE_PATTERNS.today.test(text)) {
    return now
  }
  
  // Tomorrow
  if (DATE_PATTERNS.tomorrow.test(text)) {
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  }
  
  // Next week
  if (DATE_PATTERNS.nextWeek.test(text)) {
    const nextWeek = new Date(now)
    nextWeek.setDate(nextWeek.getDate() + 7)
    return nextWeek
  }
  
  // Specific day of week
  const dayMatch = text.match(DATE_PATTERNS.specificDay)
  if (dayMatch) {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const targetDay = dayNames.indexOf(dayMatch[0].toLowerCase())
    const currentDay = now.getDay()
    const daysToAdd = (targetDay - currentDay + 7) % 7
    const targetDate = new Date(now)
    targetDate.setDate(targetDate.getDate() + daysToAdd)
    return targetDate
  }
  
  // Time extraction
  const timeMatch = text.match(DATE_PATTERNS.time)
  if (timeMatch) {
    const timeStr = timeMatch[1]
    const [hour, minute] = timeStr.replace(/\s*(am|pm)/i, '').split(':')
    let hourNum = parseInt(hour)
    const isPM = /pm/i.test(timeStr)
    
    if (isPM && hourNum !== 12) hourNum += 12
    if (!isPM && hourNum === 12) hourNum = 0
    
    const targetDate = new Date(now)
    targetDate.setHours(hourNum, minute ? parseInt(minute) : 0, 0, 0)
    
    // If time has passed today, assume tomorrow
    if (targetDate <= now) {
      targetDate.setDate(targetDate.getDate() + 1)
    }
    
    return targetDate
  }
  
  // Relative dates
  const relativeMatch = text.match(DATE_PATTERNS.relative)
  if (relativeMatch) {
    const match = relativeMatch[1]
    const numberMatch = match.match(/(\d+)\s+(days?|weeks?|months?|years?)/)
    if (numberMatch) {
      const amount = parseInt(numberMatch[1])
      const unit = numberMatch[2]
      const targetDate = new Date(now)
      
      switch (unit) {
        case 'day':
        case 'days':
          targetDate.setDate(targetDate.getDate() + amount)
          break
        case 'week':
        case 'weeks':
          targetDate.setDate(targetDate.getDate() + (amount * 7))
          break
        case 'month':
        case 'months':
          targetDate.setMonth(targetDate.getMonth() + amount)
          break
        case 'year':
        case 'years':
          targetDate.setFullYear(targetDate.getFullYear() + amount)
          break
      }
      
      return targetDate
    }
  }
  
  return undefined
}

function extractRecurringPattern(text: string) {
  const recurringMatch = text.match(DATE_PATTERNS.recurring)
  if (recurringMatch) {
    if (text.includes('daily') || text.includes('every day')) {
      return { pattern: 'daily' as const, interval: 1 }
    }
    if (text.includes('weekly') || text.includes('every week')) {
      return { pattern: 'weekly' as const, interval: 1 }
    }
    if (text.includes('monthly') || text.includes('every month')) {
      return { pattern: 'monthly' as const, interval: 1 }
    }
    if (text.includes('yearly') || text.includes('every year')) {
      return { pattern: 'yearly' as const, interval: 1 }
    }
  }
  return undefined
}

function generateSummary(text: string, type: string, extractedData: any): string {
  const people = extractedData.people?.length > 0 ? ` with ${extractedData.people.join(', ')}` : ''
  const dueDate = extractedData.dueDate ? ` by ${extractedData.dueDate.toLocaleDateString()}` : ''
  const actions = extractedData.actions?.length > 0 ? extractedData.actions.join(', ') : ''
  
  switch (type) {
    case 'task':
      return `Task: ${actions}${people}${dueDate}`
    case 'reminder':
      return `Reminder: ${actions}${people}${dueDate}`
    case 'meeting':
      return `Meeting: ${actions}${people}${dueDate}`
    case 'contact':
      return `Contact: ${actions}${people}`
    case 'idea':
      return `Idea: ${text.substring(0, 100)}...`
    default:
      return text.substring(0, 100) + (text.length > 100 ? '...' : '')
  }
}

function generateTags(text: string, type: string, extractedData: any): string[] {
  const tags = []
  
  // Add type-based tags
  tags.push(type)
  
  // Add priority tags
  if (extractedData.dueDate) tags.push('time-sensitive')
  if (extractedData.recurring) tags.push('recurring')
  
  // Add content-based tags
  if (extractedData.people?.length > 0) tags.push('people')
  if (extractedData.projects?.length > 0) tags.push('work')
  if (extractedData.actions?.length > 0) tags.push('actionable')
  
  // Add topic tags
  if (text.includes('project') || text.includes('work') || text.includes('client')) tags.push('work')
  if (text.includes('personal') || text.includes('family') || text.includes('health')) tags.push('personal')
  if (text.includes('idea') || text.includes('brainstorm') || text.includes('innovation')) tags.push('creative')
  
  return Array.from(new Set(tags))
}

function createCalendarEvent(text: string, extractedData: any, summary: string) {
  if (!extractedData.dueDate) return undefined
  
  const startTime = extractedData.dueDate
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000) // Default 1 hour
  
  return {
    title: summary,
    startTime,
    endTime,
    allDay: false,
    description: text
  }
}

function createReminder(text: string, extractedData: any, summary: string, priority: string) {
  if (!extractedData.dueDate && !extractedData.actions?.length) return undefined
  
  return {
    title: summary,
    dueDate: extractedData.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000), // Default tomorrow
    priority,
    description: text
  }
}

function calculateConfidence(text: string, type: string, extractedData: any): number {
  let confidence = 0.5 // Base confidence
  
  // Increase confidence based on extracted data
  if (extractedData.dueDate) confidence += 0.2
  if (extractedData.people?.length > 0) confidence += 0.15
  if (extractedData.actions?.length > 0) confidence += 0.15
  if (extractedData.topics?.length > 0) confidence += 0.1
  
  // Increase confidence for longer, more detailed text
  if (text.length > 50) confidence += 0.1
  if (text.length > 100) confidence += 0.1
  
  return Math.min(confidence, 1.0)
}

function generateAIResponse(text: string, type: string, extractedData: any): string {
  const people = extractedData.people?.length > 0 ? extractedData.people.join(', ') : 'you'
  const dueDate = extractedData.dueDate ? ` by ${extractedData.dueDate.toLocaleDateString()}` : ''
  
  switch (type) {
    case 'task':
      return `I've identified this as a task for ${people}${dueDate}. This sounds important!`
    case 'reminder':
      return `I'll set a reminder for ${people}${dueDate}. Don't worry, I won't let you forget!`
    case 'meeting':
      return `I've detected a meeting with ${people}${dueDate}. Should I add it to your calendar?`
    case 'contact':
      return `I've found contact information for ${people}. Help me save this to my contacts.`
    case 'idea':
      return `Great idea! I've captured this for you. Help me create a reminder to follow up.`
    default:
      return `I've analyzed your note and organized it for you!`
  }
}

function generateFollowUpQuestions(text: string, type: string, extractedData: any): string[] {
  const questions = []
  
  if (extractedData.dueDate) {
    questions.push(`Help me set a reminder for ${extractedData.dueDate.toLocaleDateString()}`)
  }
  
  if (extractedData.people?.length > 0) {
    questions.push(`Help me add this to my contacts`)
  }
  
  if (type === 'task' || type === 'reminder') {
    questions.push(`Help me add this to my calendar`)
  }
  
  if (questions.length === 0) {
    questions.push(`Help me with something else`)
  }
  
  return questions.slice(0, 3) // Limit to 3 questions
}
