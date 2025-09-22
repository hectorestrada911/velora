export interface Memory {
  id: string
  content: string
  category: 'personal' | 'work' | 'life'
  tags: string[]
  createdAt: string
  lastAccessed?: string
  accessCount: number
  importance: 'high' | 'medium' | 'low'
}

export interface MemorySearchResult {
  memory: Memory
  relevanceScore: number
  matchedTerms: string[]
}

class MemoryService {
  private memories: Memory[] = []
  private readonly STORAGE_KEY = 'velora_memories'

  constructor() {
    this.loadMemories()
  }

  private loadMemories(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        this.memories = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load memories:', error)
      this.memories = []
    }
  }

  private saveMemories(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.memories))
    } catch (error) {
      console.error('Failed to save memories:', error)
    }
  }

  addMemory(content: string, category: Memory['category'] = 'personal', importance: Memory['importance'] = 'medium'): Memory {
    const memory: Memory = {
      id: Date.now().toString(),
      content: content.trim(),
      category,
      tags: this.extractTags(content),
      createdAt: new Date().toISOString(),
      accessCount: 0,
      importance
    }

    this.memories.push(memory)
    this.saveMemories()
    return memory
  }

  private extractTags(content: string): string[] {
    const tags: string[] = []
    const lowerContent = content.toLowerCase()
    
    // Extract common patterns
    if (lowerContent.includes('birthday')) tags.push('birthday')
    if (lowerContent.includes('parked') || lowerContent.includes('parking')) tags.push('parking')
    if (lowerContent.includes('allergic') || lowerContent.includes('allergy')) tags.push('health')
    if (lowerContent.includes('prefer') || lowerContent.includes('like')) tags.push('preference')
    if (lowerContent.includes('gym') || lowerContent.includes('workout')) tags.push('fitness')
    if (lowerContent.includes('meeting') || lowerContent.includes('call')) tags.push('work')
    if (lowerContent.includes('project')) tags.push('project')
    if (lowerContent.includes('address') || lowerContent.includes('location')) tags.push('location')
    
    return tags
  }

  searchMemories(query: string, limit: number = 5): MemorySearchResult[] {
    const lowerQuery = query.toLowerCase()
    const results: MemorySearchResult[] = []

    for (const memory of this.memories) {
      let relevanceScore = 0
      const matchedTerms: string[] = []

      // Check content match
      if (memory.content.toLowerCase().includes(lowerQuery)) {
        relevanceScore += 10
        matchedTerms.push('content')
      }

      // Check tag matches
      for (const tag of memory.tags) {
        if (tag.includes(lowerQuery) || lowerQuery.includes(tag)) {
          relevanceScore += 5
          matchedTerms.push(`tag:${tag}`)
        }
      }

      // Check category match
      if (memory.category.includes(lowerQuery)) {
        relevanceScore += 3
        matchedTerms.push(`category:${memory.category}`)
      }

      // Boost importance
      if (memory.importance === 'high') relevanceScore += 2
      if (memory.importance === 'medium') relevanceScore += 1

      if (relevanceScore > 0) {
        results.push({
          memory,
          relevanceScore,
          matchedTerms
        })
      }
    }

    // Sort by relevance and return top results
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)
  }

  getMemoriesByCategory(category: Memory['category']): Memory[] {
    return this.memories.filter(m => m.category === category)
  }

  getAllMemories(): Memory[] {
    return [...this.memories]
  }

  updateMemoryAccess(id: string): void {
    const memory = this.memories.find(m => m.id === id)
    if (memory) {
      memory.lastAccessed = new Date().toISOString()
      memory.accessCount++
      this.saveMemories()
    }
  }

  deleteMemory(id: string): boolean {
    const index = this.memories.findIndex(m => m.id === id)
    if (index !== -1) {
      this.memories.splice(index, 1)
      this.saveMemories()
      return true
    }
    return false
  }

  updateMemory(id: string, updates: Partial<Memory>): boolean {
    const memory = this.memories.find(m => m.id === id)
    if (memory) {
      Object.assign(memory, updates)
      memory.tags = this.extractTags(memory.content) // Re-extract tags
      this.saveMemories()
      return true
    }
    return false
  }

  // Get memories for AI context
  getContextualMemories(query: string): string[] {
    const results = this.searchMemories(query, 3)
    return results.map(result => {
      this.updateMemoryAccess(result.memory.id)
      return result.memory.content
    })
  }

  // Enhanced recall for specific question types
  recallInformation(query: string): { memories: string[], suggestions: string[] } {
    const lowerQuery = query.toLowerCase()
    const memories: string[] = []
    const suggestions: string[] = []

    // Handle specific recall patterns
    if (lowerQuery.includes('where did i park') || lowerQuery.includes('where is my car')) {
      const parkingMemories = this.searchMemories('parked parking car', 5)
      memories.push(...parkingMemories.map(r => r.memory.content))
      suggestions.push('Check your recent parking memories above')
    }

    if (lowerQuery.includes('what do i have to do') || lowerQuery.includes('what\'s on my schedule')) {
      const scheduleMemories = this.searchMemories('meeting appointment schedule task', 5)
      memories.push(...scheduleMemories.map(r => r.memory.content))
      suggestions.push('Check your calendar and reminders for scheduled items')
    }

    if (lowerQuery.includes('what did we discuss') || lowerQuery.includes('what did i say')) {
      const discussionMemories = this.searchMemories('discuss talk mention', 5)
      memories.push(...discussionMemories.map(r => r.memory.content))
      suggestions.push('Review conversation history for previous discussions')
    }

    if (lowerQuery.includes('preference') || lowerQuery.includes('like') || lowerQuery.includes('hate')) {
      const preferenceMemories = this.getMemoriesByCategory('preference')
      memories.push(...preferenceMemories.map(m => m.content))
      suggestions.push('Here are your saved preferences')
    }

    if (lowerQuery.includes('birthday') || lowerQuery.includes('anniversary')) {
      const relationshipMemories = this.getMemoriesByCategory('relationship')
      memories.push(...relationshipMemories.map(m => m.content))
      suggestions.push('Here are your saved relationship dates')
    }

    // If no specific pattern matches, do general search
    if (memories.length === 0) {
      const generalResults = this.searchMemories(query, 5)
      memories.push(...generalResults.map(r => r.memory.content))
    }

    return { memories, suggestions }
  }

  // Parse "remember" commands from user input
  parseRememberCommand(input: string): { content: string; category: Memory['category']; importance: Memory['importance'] } | null {
    const lowerInput = input.toLowerCase()
    
    if (!lowerInput.includes('remember')) {
      return null
    }

    // Extract content after "remember"
    const rememberMatch = input.match(/remember\s+(.+)/i)
    if (!rememberMatch) return null

    const content = rememberMatch[1].trim()
    if (!content) return null

    // Determine category based on content
    let category: Memory['category'] = 'personal'
    let importance: Memory['importance'] = 'medium'

    // Work-related keywords
    if (lowerInput.includes('project') || lowerInput.includes('working') || lowerInput.includes('task') || 
        lowerInput.includes('manager') || lowerInput.includes('colleague') || lowerInput.includes('meeting') ||
        lowerInput.includes('deadline') || lowerInput.includes('client') || lowerInput.includes('company')) {
      category = 'work'
    } 
    // Life-related keywords (locations, habits, general context)
    else if (lowerInput.includes('parked') || lowerInput.includes('location') || lowerInput.includes('address') ||
             lowerInput.includes('usually') || lowerInput.includes('always') || lowerInput.includes('every') ||
             lowerInput.includes('habit') || lowerInput.includes('routine')) {
      category = 'life'
    }
    // Personal (default) - health, preferences, relationships
    else {
      category = 'personal'
    }

    // Determine importance
    if (lowerInput.includes('important') || lowerInput.includes('critical') || lowerInput.includes('urgent')) {
      importance = 'high'
    } else if (lowerInput.includes('minor') || lowerInput.includes('small') || lowerInput.includes('trivial')) {
      importance = 'low'
    }

    return { content, category, importance }
  }
}

// Singleton instance
export const memoryService = new MemoryService()
