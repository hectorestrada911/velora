// Memory Analytics and Insights System for Velora

export interface MemoryInsight {
  type: 'pattern' | 'suggestion' | 'correlation' | 'gap'
  title: string
  description: string
  confidence: number
  actionable: boolean
  category?: string
}

export interface MemoryStats {
  totalMemories: number
  categoryBreakdown: Record<string, number>
  recentActivity: number
  mostAccessed: string[]
  correlationStrength: number
  memoryGaps: string[]
}

class MemoryAnalytics {
  private memories: any[] = []

  constructor(memories: any[]) {
    this.memories = memories
  }

  // Generate comprehensive memory insights
  generateInsights(): MemoryInsight[] {
    const insights: MemoryInsight[] = []
    
    // Pattern detection
    insights.push(...this.detectPatterns())
    
    // Memory gaps
    insights.push(...this.identifyGaps())
    
    // Correlation opportunities
    insights.push(...this.findCorrelationOpportunities())
    
    // Actionable suggestions
    insights.push(...this.generateActionableSuggestions())
    
    return insights.sort((a, b) => b.confidence - a.confidence)
  }

  // Detect patterns in user behavior and preferences
  private detectPatterns(): MemoryInsight[] {
    const insights: MemoryInsight[] = []
    
    // Time-based patterns
    const timePatterns = this.analyzeTimePatterns()
    if (timePatterns.length > 0) {
      insights.push({
        type: 'pattern',
        title: 'Time-based Preferences Detected',
        description: `I've noticed you have preferences around: ${timePatterns.join(', ')}`,
        confidence: 0.8,
        actionable: true
      })
    }
    
    // Location patterns
    const locationPatterns = this.analyzeLocationPatterns()
    if (locationPatterns.length > 0) {
      insights.push({
        type: 'pattern',
        title: 'Location Patterns Identified',
        description: `You frequently mention: ${locationPatterns.join(', ')}`,
        confidence: 0.7,
        actionable: true
      })
    }
    
    // Relationship patterns
    const relationshipPatterns = this.analyzeRelationshipPatterns()
    if (relationshipPatterns.length > 0) {
      insights.push({
        type: 'pattern',
        title: 'Relationship Insights',
        description: `I've learned about your connections with: ${relationshipPatterns.join(', ')}`,
        confidence: 0.9,
        actionable: true
      })
    }
    
    return insights
  }

  // Identify gaps in memory coverage
  private identifyGaps(): MemoryInsight[] {
    const insights: MemoryInsight[] = []
    const gaps = this.findMemoryGaps()
    
    gaps.forEach(gap => {
      insights.push({
        type: 'gap',
        title: `Memory Gap: ${gap.category}`,
        description: `I don't have much information about your ${gap.category.toLowerCase()}. Consider sharing more details.`,
        confidence: 0.6,
        actionable: true,
        category: gap.category
      })
    })
    
    return insights
  }

  // Find opportunities for better correlation
  private findCorrelationOpportunities(): MemoryInsight[] {
    const insights: MemoryInsight[] = []
    
    // Check for related memories that could be better connected
    const correlationOpportunities = this.analyzeCorrelationOpportunities()
    
    correlationOpportunities.forEach(opportunity => {
      insights.push({
        type: 'correlation',
        title: 'Correlation Opportunity',
        description: `I can better connect your memories about: ${opportunity.topics.join(', ')}`,
        confidence: 0.7,
        actionable: true
      })
    })
    
    return insights
  }

  // Generate actionable suggestions
  private generateActionableSuggestions(): MemoryInsight[] {
    const insights: MemoryInsight[] = []
    
    // Suggest memory improvements
    const suggestions = this.generateMemorySuggestions()
    
    suggestions.forEach(suggestion => {
      insights.push({
        type: 'suggestion',
        title: suggestion.title,
        description: suggestion.description,
        confidence: suggestion.confidence,
        actionable: true
      })
    })
    
    return insights
  }

  // Analyze time-based patterns
  private analyzeTimePatterns(): string[] {
    const patterns: string[] = []
    const timeKeywords = ['morning', 'afternoon', 'evening', 'night', 'weekend', 'weekday']
    
    timeKeywords.forEach(keyword => {
      const count = this.memories.filter(memory => 
        memory.content.toLowerCase().includes(keyword)
      ).length
      
      if (count >= 2) {
        patterns.push(keyword)
      }
    })
    
    return patterns
  }

  // Analyze location patterns
  private analyzeLocationPatterns(): string[] {
    const patterns: string[] = []
    const locationKeywords = ['office', 'home', 'gym', 'restaurant', 'mall', 'parking']
    
    locationKeywords.forEach(keyword => {
      const count = this.memories.filter(memory => 
        memory.content.toLowerCase().includes(keyword)
      ).length
      
      if (count >= 2) {
        patterns.push(keyword)
      }
    })
    
    return patterns
  }

  // Analyze relationship patterns
  private analyzeRelationshipPatterns(): string[] {
    const patterns: string[] = []
    const relationshipKeywords = ['boss', 'wife', 'husband', 'friend', 'colleague', 'family']
    
    relationshipKeywords.forEach(keyword => {
      const count = this.memories.filter(memory => 
        memory.content.toLowerCase().includes(keyword)
      ).length
      
      if (count >= 1) {
        patterns.push(keyword)
      }
    })
    
    return patterns
  }

  // Find memory gaps
  private findMemoryGaps(): { category: string, coverage: number }[] {
    const categories = ['personal', 'preference', 'location', 'relationship', 'context', 'habit']
    const gaps: { category: string, coverage: number }[] = []
    
    categories.forEach(category => {
      const count = this.memories.filter(memory => memory.category === category).length
      const coverage = count / this.memories.length
      
      if (coverage < 0.1) { // Less than 10% coverage
        gaps.push({ category, coverage })
      }
    })
    
    return gaps
  }

  // Analyze correlation opportunities
  private analyzeCorrelationOpportunities(): { topics: string[], strength: number }[] {
    const opportunities: { topics: string[], strength: number }[] = []
    
    // Find topics that appear together frequently
    const topicPairs = this.findTopicPairs()
    
    topicPairs.forEach(pair => {
      if (pair.strength > 0.5) {
        opportunities.push({
          topics: pair.topics,
          strength: pair.strength
        })
      }
    })
    
    return opportunities
  }

  // Find topic pairs that appear together
  private findTopicPairs(): { topics: string[], strength: number }[] {
    const pairs: { topics: string[], strength: number }[] = []
    const topics = ['work', 'personal', 'health', 'family', 'travel', 'food', 'shopping']
    
    for (let i = 0; i < topics.length; i++) {
      for (let j = i + 1; j < topics.length; j++) {
        const topic1 = topics[i]
        const topic2 = topics[j]
        
        const coOccurrence = this.memories.filter(memory => 
          memory.content.toLowerCase().includes(topic1) && 
          memory.content.toLowerCase().includes(topic2)
        ).length
        
        const totalOccurrence = this.memories.filter(memory => 
          memory.content.toLowerCase().includes(topic1) || 
          memory.content.toLowerCase().includes(topic2)
        ).length
        
        const strength = totalOccurrence > 0 ? coOccurrence / totalOccurrence : 0
        
        if (strength > 0.3) {
          pairs.push({
            topics: [topic1, topic2],
            strength
          })
        }
      }
    }
    
    return pairs
  }

  // Generate memory suggestions
  private generateMemorySuggestions(): { title: string, description: string, confidence: number }[] {
    const suggestions: { title: string, description: string, confidence: number }[] = []
    
    // Suggest based on memory gaps
    const gaps = this.findMemoryGaps()
    gaps.forEach(gap => {
      suggestions.push({
        title: `Share more about your ${gap.category}`,
        description: `I'd love to learn more about your ${gap.category.toLowerCase()} to provide better assistance.`,
        confidence: 0.8
      })
    })
    
    // Suggest based on patterns
    const patterns = this.analyzeTimePatterns()
    if (patterns.length > 0) {
      suggestions.push({
        title: 'Optimize your schedule',
        description: `Based on your time preferences, I can help optimize your daily schedule.`,
        confidence: 0.7
      })
    }
    
    return suggestions
  }

  // Get memory statistics
  getStats(): MemoryStats {
    const categoryBreakdown: Record<string, number> = {}
    const mostAccessed: string[] = []
    
    this.memories.forEach(memory => {
      categoryBreakdown[memory.category] = (categoryBreakdown[memory.category] || 0) + 1
    })
    
    // Sort by access count
    const sortedMemories = [...this.memories].sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0))
    mostAccessed.push(...sortedMemories.slice(0, 5).map(m => m.content))
    
    return {
      totalMemories: this.memories.length,
      categoryBreakdown,
      recentActivity: this.memories.filter(m => {
        const daysSinceCreated = (Date.now() - new Date(m.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        return daysSinceCreated < 7
      }).length,
      mostAccessed,
      correlationStrength: this.calculateCorrelationStrength(),
      memoryGaps: this.findMemoryGaps().map(gap => gap.category)
    }
  }

  // Calculate overall correlation strength
  private calculateCorrelationStrength(): number {
    const opportunities = this.analyzeCorrelationOpportunities()
    if (opportunities.length === 0) return 0
    
    const avgStrength = opportunities.reduce((sum, opp) => sum + opp.strength, 0) / opportunities.length
    return Math.min(avgStrength, 1)
  }
}

export default MemoryAnalytics
