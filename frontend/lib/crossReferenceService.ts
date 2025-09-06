import { CalendarEvent, Reminder, Document } from '@/types'

export interface Entity {
  type: 'person' | 'project' | 'date' | 'topic' | 'location' | 'company'
  value: string
  confidence: number
}

export interface CrossReference {
  id: string
  type: 'calendar' | 'reminder' | 'document' | 'conversation'
  title: string
  content: string
  entities: Entity[]
  timestamp: Date
  relevanceScore: number
  conversationId?: string
  messageId?: string
  context?: string
}

export interface SmartSuggestion {
  id: string
  type: 'related_content' | 'follow_up' | 'connection' | 'action_item'
  title: string
  description: string
  relatedItems: CrossReference[]
  action?: string
}

class CrossReferenceService {
  private entities: Map<string, Entity[]> = new Map()
  private crossReferences: CrossReference[] = []
  private currentConversationId: string | null = null
  private conversationHistory: Map<string, CrossReference[]> = new Map()

  // Extract entities from text using simple pattern matching
  // In production, this would use a more sophisticated NLP service
  extractEntities(text: string): Entity[] {
    const entities: Entity[] = []
    
    // Extract people (capitalized words that could be names)
    const peopleRegex = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g
    const people = text.match(peopleRegex) || []
    people.forEach(person => {
      entities.push({
        type: 'person',
        value: person,
        confidence: 0.8
      })
    })

    // Extract dates
    const dateRegex = /\b(?:tomorrow|today|yesterday|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4})\b/gi
    const dates = text.match(dateRegex) || []
    dates.forEach(date => {
      entities.push({
        type: 'date',
        value: date,
        confidence: 0.9
      })
    })

    // Extract projects (words with capital letters, common project terms)
    const projectRegex = /\b(?:Q[1-4]|project|campaign|budget|report|meeting|standup|sprint|milestone|deadline)\b/gi
    const projects = text.match(projectRegex) || []
    projects.forEach(project => {
      entities.push({
        type: 'project',
        value: project,
        confidence: 0.7
      })
    })

    // Extract topics (longer phrases that might be topics)
    const topicRegex = /\b(?:marketing|sales|development|design|research|analysis|strategy|planning|review|presentation)\b/gi
    const topics = text.match(topicRegex) || []
    topics.forEach(topic => {
      entities.push({
        type: 'topic',
        value: topic,
        confidence: 0.6
      })
    })

    return entities
  }

  // Start a new conversation
  startConversation(conversationId: string): void {
    this.currentConversationId = conversationId
    if (!this.conversationHistory.has(conversationId)) {
      this.conversationHistory.set(conversationId, [])
    }
  }

  // Get conversation context
  getConversationContext(conversationId?: string): CrossReference[] {
    const id = conversationId || this.currentConversationId
    if (!id) return []
    return this.conversationHistory.get(id) || []
  }

  // Get recent conversation context (last 5 messages)
  getRecentContext(conversationId?: string): string {
    const context = this.getConversationContext(conversationId)
    const recentMessages = context.slice(-5) // Last 5 messages
    return recentMessages.map(msg => `${msg.title}: ${msg.content}`).join('\n')
  }

  // Add a new item to the cross-reference system
  addCrossReference(
    type: 'calendar' | 'reminder' | 'document' | 'conversation',
    title: string,
    content: string,
    timestamp: Date = new Date(),
    conversationId?: string,
    messageId?: string,
    context?: string
  ): string {
    const entities = this.extractEntities(content)
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const convId = conversationId || this.currentConversationId
    
    const crossReference: CrossReference = {
      id,
      type,
      title,
      content,
      entities,
      timestamp,
      relevanceScore: 1.0,
      conversationId: convId,
      messageId,
      context
    }

    this.crossReferences.push(crossReference)
    
    // Add to conversation history
    if (convId) {
      if (!this.conversationHistory.has(convId)) {
        this.conversationHistory.set(convId, [])
      }
      this.conversationHistory.get(convId)!.push(crossReference)
    }
    
    // Store entities for quick lookup
    entities.forEach(entity => {
      if (!this.entities.has(entity.value.toLowerCase())) {
        this.entities.set(entity.value.toLowerCase(), [])
      }
      this.entities.get(entity.value.toLowerCase())!.push(entity)
    })

    return id
  }

  // Find related content based on entities
  findRelatedContent(content: string, limit: number = 5): CrossReference[] {
    const contentEntities = this.extractEntities(content)
    const relatedItems: CrossReference[] = []

    // Score each cross-reference based on entity overlap
    this.crossReferences.forEach(item => {
      let score = 0
      let entityMatches = 0

      contentEntities.forEach(contentEntity => {
        item.entities.forEach(itemEntity => {
          if (contentEntity.value.toLowerCase() === itemEntity.value.toLowerCase()) {
            score += contentEntity.confidence * itemEntity.confidence
            entityMatches++
          }
        })
      })

      if (entityMatches > 0) {
        // Boost score for recent items
        const daysSince = (Date.now() - item.timestamp.getTime()) / (1000 * 60 * 60 * 24)
        const recencyBoost = Math.max(0, 1 - (daysSince / 30)) // Boost for items within 30 days
        
        item.relevanceScore = score * (1 + recencyBoost * 0.3)
        relatedItems.push(item)
      }
    })

    // Sort by relevance score and return top results
    return relatedItems
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)
  }

  // Generate smart suggestions based on current context
  generateSmartSuggestions(content: string, conversationId?: string): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = []
    const relatedItems = this.findRelatedContent(content, 3)
    const conversationContext = this.getConversationContext(conversationId)
    const recentContext = this.getRecentContext(conversationId)

    // Check for conversation continuity
    if (conversationContext.length > 0) {
      const lastMessage = conversationContext[conversationContext.length - 1]
      const currentEntities = this.extractEntities(content)
      const lastEntities = lastMessage.entities

      // Check for entity continuity
      const entityOverlap = currentEntities.filter(current => 
        lastEntities.some(last => 
          current.value.toLowerCase() === last.value.toLowerCase()
        )
      )

      if (entityOverlap.length > 0) {
        suggestions.push({
          id: `continuity_${Date.now()}`,
          type: 'follow_up',
          title: 'Conversation Continuity',
          description: `Continuing discussion about: ${entityOverlap.map(e => e.value).join(', ')}`,
          relatedItems: [lastMessage],
          action: 'Building on previous context'
        })
      }
    }

    if (relatedItems.length > 0) {
      // Group related items by type
      const calendarItems = relatedItems.filter(item => item.type === 'calendar')
      const reminderItems = relatedItems.filter(item => item.type === 'reminder')
      const documentItems = relatedItems.filter(item => item.type === 'document')
      const conversationItems = relatedItems.filter(item => item.type === 'conversation')

      // Suggest related content
      if (relatedItems.length > 1) {
        suggestions.push({
          id: `related_${Date.now()}`,
          type: 'related_content',
          title: 'Related Content',
          description: `Found ${relatedItems.length} related items`,
          relatedItems: relatedItems.slice(0, 3)
        })
      }

      // Suggest follow-ups for calendar events
      if (calendarItems.length > 0) {
        const latestEvent = calendarItems[0]
        suggestions.push({
          id: `followup_${Date.now()}`,
          type: 'follow_up',
          title: 'Follow-up Suggestion',
          description: `You have a related event: "${latestEvent.title}"`,
          relatedItems: [latestEvent],
          action: 'Would you like to create a reminder for this event?'
        })
      }

      // Suggest document connections
      if (documentItems.length > 0) {
        suggestions.push({
          id: `connection_${Date.now()}`,
          type: 'connection',
          title: 'Document Connection',
          description: `This relates to ${documentItems.length} document(s)`,
          relatedItems: documentItems.slice(0, 2)
        })
      }

      // Suggest conversation history
      if (conversationItems.length > 0) {
        suggestions.push({
          id: `history_${Date.now()}`,
          type: 'related_content',
          title: 'Previous Discussions',
          description: `You've discussed this topic before`,
          relatedItems: conversationItems.slice(0, 2)
        })
      }
    }

    return suggestions
  }

  // Get all cross-references (for debugging/display)
  getAllCrossReferences(): CrossReference[] {
    return [...this.crossReferences]
  }

  // Clear all data (for testing)
  clearAll(): void {
    this.entities.clear()
    this.crossReferences = []
  }
}

export const crossReferenceService = new CrossReferenceService()
