// Comprehensive test scenarios for Velora's memory and correlation capabilities

export interface TestScenario {
  id: string
  category: string
  userInput: string
  expectedMemoryType: string
  expectedCorrelation: string[]
  description: string
}

export const memoryTestScenarios: TestScenario[] = [
  // Personal Information & Preferences
  {
    id: 'personal-001',
    category: 'Personal Info',
    userInput: 'REMEMBER I am allergic to peanuts and shellfish',
    expectedMemoryType: 'preference',
    expectedCorrelation: ['food', 'allergies', 'health'],
    description: 'Health preference that should be remembered for future food recommendations'
  },
  {
    id: 'personal-002',
    category: 'Personal Info',
    userInput: 'REMEMBER I prefer working in the morning, I am most productive before 11 AM',
    expectedMemoryType: 'preference',
    expectedCorrelation: ['schedule', 'productivity', 'work'],
    description: 'Work preference for scheduling optimization'
  },
  {
    id: 'personal-003',
    category: 'Personal Info',
    userInput: 'REMEMBER I drive a blue Honda Civic with license plate ABC123',
    expectedMemoryType: 'personal',
    expectedCorrelation: ['car', 'vehicle', 'parking'],
    description: 'Vehicle information for parking and location tracking'
  },

  // Location & Places
  {
    id: 'location-001',
    category: 'Location',
    userInput: 'REMEMBER I parked my car in section B, row 3, spot 15 at the mall',
    expectedMemoryType: 'location',
    expectedCorrelation: ['parking', 'car', 'mall'],
    description: 'Specific parking location that should be retrievable'
  },
  {
    id: 'location-002',
    category: 'Location',
    userInput: 'REMEMBER My office is on the 15th floor, room 1503, in the downtown building',
    expectedMemoryType: 'location',
    expectedCorrelation: ['office', 'work', 'address'],
    description: 'Work location for meeting scheduling and directions'
  },
  {
    id: 'location-003',
    category: 'Location',
    userInput: 'REMEMBER I left my laptop charger at the coffee shop on Main Street',
    expectedMemoryType: 'location',
    expectedCorrelation: ['laptop', 'charger', 'coffee shop', 'lost item'],
    description: 'Lost item location for retrieval'
  },

  // Relationships & People
  {
    id: 'relationship-001',
    category: 'Relationships',
    userInput: 'REMEMBER Sarah\'s birthday is March 15th, she loves chocolate cake',
    expectedMemoryType: 'relationship',
    expectedCorrelation: ['birthday', 'Sarah', 'gift', 'cake'],
    description: 'Personal relationship information for gift suggestions'
  },
  {
    id: 'relationship-002',
    category: 'Relationships',
    userInput: 'REMEMBER My boss John prefers meetings in the morning and hates long emails',
    expectedMemoryType: 'relationship',
    expectedCorrelation: ['boss', 'John', 'meetings', 'communication'],
    description: 'Work relationship preferences for better communication'
  },
  {
    id: 'relationship-003',
    category: 'Relationships',
    userInput: 'REMEMBER My wife\'s favorite restaurant is The Italian Place on 5th Avenue',
    expectedMemoryType: 'relationship',
    expectedCorrelation: ['wife', 'restaurant', 'date night', 'Italian'],
    description: 'Relationship preference for date planning'
  },

  // Work & Projects
  {
    id: 'work-001',
    category: 'Work',
    userInput: 'REMEMBER I am working on the Q4 marketing campaign, deadline is December 15th',
    expectedMemoryType: 'context',
    expectedCorrelation: ['Q4', 'marketing', 'campaign', 'deadline'],
    description: 'Project context for task management and reminders'
  },
  {
    id: 'work-002',
    category: 'Work',
    userInput: 'REMEMBER The client meeting with TechCorp is always on Tuesdays at 2 PM',
    expectedMemoryType: 'habit',
    expectedCorrelation: ['TechCorp', 'client', 'meeting', 'Tuesday'],
    description: 'Recurring work pattern for scheduling'
  },
  {
    id: 'work-003',
    category: 'Work',
    userInput: 'REMEMBER I need to submit my expense report every Friday before 5 PM',
    expectedMemoryType: 'habit',
    expectedCorrelation: ['expense report', 'Friday', 'deadline'],
    description: 'Work routine for automatic reminders'
  },

  // Habits & Routines
  {
    id: 'habit-001',
    category: 'Habits',
    userInput: 'REMEMBER I always go to the gym on Monday, Wednesday, and Friday at 6 AM',
    expectedMemoryType: 'habit',
    expectedCorrelation: ['gym', 'workout', 'schedule', 'fitness'],
    description: 'Fitness routine for schedule optimization'
  },
  {
    id: 'habit-002',
    category: 'Habits',
    userInput: 'REMEMBER I usually have lunch at 12:30 PM and prefer healthy options',
    expectedMemoryType: 'habit',
    expectedCorrelation: ['lunch', '12:30', 'healthy', 'food'],
    description: 'Meal routine for restaurant suggestions'
  },
  {
    id: 'habit-003',
    category: 'Habits',
    userInput: 'REMEMBER I check my emails every morning at 9 AM and respond to urgent ones first',
    expectedMemoryType: 'habit',
    expectedCorrelation: ['email', 'morning', 'urgent', 'routine'],
    description: 'Communication routine for productivity optimization'
  },

  // Complex Correlation Scenarios
  {
    id: 'correlation-001',
    category: 'Complex Correlation',
    userInput: 'What did I say about my car?',
    expectedMemoryType: 'query',
    expectedCorrelation: ['car', 'vehicle', 'parking', 'Honda Civic'],
    description: 'Should correlate with car-related memories (parking, vehicle info)'
  },
  {
    id: 'correlation-002',
    category: 'Complex Correlation',
    userInput: 'Do I have any meetings with John this week?',
    expectedMemoryType: 'query',
    expectedCorrelation: ['John', 'boss', 'meetings', 'schedule'],
    description: 'Should correlate boss preferences with calendar events'
  },
  {
    id: 'correlation-003',
    category: 'Complex Correlation',
    userInput: 'Where should I go for lunch today?',
    expectedMemoryType: 'query',
    expectedCorrelation: ['lunch', '12:30', 'healthy', 'restaurant', 'wife'],
    description: 'Should correlate lunch habits with restaurant preferences'
  },

  // Memory Retrieval Scenarios
  {
    id: 'retrieval-001',
    category: 'Memory Retrieval',
    userInput: 'What do I know about Sarah?',
    expectedMemoryType: 'query',
    expectedCorrelation: ['Sarah', 'birthday', 'chocolate cake', 'relationship'],
    description: 'Should retrieve all Sarah-related memories'
  },
  {
    id: 'retrieval-002',
    category: 'Memory Retrieval',
    userInput: 'What are my work preferences?',
    expectedMemoryType: 'query',
    expectedCorrelation: ['work', 'morning', 'productive', 'boss', 'meetings'],
    description: 'Should retrieve work-related preferences and habits'
  },
  {
    id: 'retrieval-003',
    category: 'Memory Retrieval',
    userInput: 'What do I remember about parking?',
    expectedMemoryType: 'query',
    expectedCorrelation: ['parking', 'car', 'section B', 'mall'],
    description: 'Should retrieve parking-related memories'
  },

  // Context-Aware Suggestions
  {
    id: 'context-001',
    category: 'Context Awareness',
    userInput: 'I need to schedule a meeting with John',
    expectedMemoryType: 'suggestion',
    expectedCorrelation: ['John', 'boss', 'morning', 'meetings', 'preferences'],
    description: 'Should suggest morning time based on boss preferences'
  },
  {
    id: 'context-002',
    category: 'Context Awareness',
    userInput: 'I am going to the mall',
    expectedMemoryType: 'suggestion',
    expectedCorrelation: ['mall', 'parking', 'section B', 'car'],
    description: 'Should remind about parking location'
  },
  {
    id: 'context-003',
    category: 'Context Awareness',
    userInput: 'It is almost lunch time',
    expectedMemoryType: 'suggestion',
    expectedCorrelation: ['lunch', '12:30', 'healthy', 'restaurant'],
    description: 'Should suggest lunch options based on habits and preferences'
  },

  // Cross-Reference Scenarios
  {
    id: 'crossref-001',
    category: 'Cross-Reference',
    userInput: 'REMEMBER I have a doctor appointment tomorrow at 2 PM, Dr. Smith',
    expectedMemoryType: 'context',
    expectedCorrelation: ['doctor', 'appointment', 'tomorrow', '2 PM', 'Dr. Smith'],
    description: 'Should create calendar event and remember doctor info'
  },
  {
    id: 'crossref-002',
    category: 'Cross-Reference',
    userInput: 'What do I have scheduled for tomorrow?',
    expectedMemoryType: 'query',
    expectedCorrelation: ['tomorrow', 'schedule', 'appointment', 'doctor'],
    description: 'Should correlate calendar events with memories'
  },
  {
    id: 'crossref-003',
    category: 'Cross-Reference',
    userInput: 'REMEMBER I need to buy Sarah a birthday gift, her birthday is March 15th',
    expectedMemoryType: 'context',
    expectedCorrelation: ['Sarah', 'birthday', 'March 15th', 'gift', 'chocolate cake'],
    description: 'Should create reminder and correlate with existing Sarah memories'
  }
]

// Test scenario categories for organized testing
export const testCategories = [
  'Personal Info',
  'Location',
  'Relationships', 
  'Work',
  'Habits',
  'Complex Correlation',
  'Memory Retrieval',
  'Context Awareness',
  'Cross-Reference'
]

// Helper function to get scenarios by category
export function getScenariosByCategory(category: string): TestScenario[] {
  return memoryTestScenarios.filter(scenario => scenario.category === category)
}

// Helper function to get random test scenarios
export function getRandomScenarios(count: number = 10): TestScenario[] {
  const shuffled = [...memoryTestScenarios].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// Helper function to validate memory correlation
export function validateMemoryCorrelation(
  userInput: string, 
  retrievedMemories: string[], 
  expectedCorrelation: string[]
): { score: number, feedback: string } {
  let score = 0
  const feedback: string[] = []
  
  expectedCorrelation.forEach(expected => {
    const found = retrievedMemories.some(memory => 
      memory.toLowerCase().includes(expected.toLowerCase())
    )
    if (found) {
      score += 1
      feedback.push(`✅ Found correlation: "${expected}"`)
    } else {
      feedback.push(`❌ Missing correlation: "${expected}"`)
    }
  })
  
  const percentage = (score / expectedCorrelation.length) * 100
  
  return {
    score: percentage,
    feedback: feedback.join('\n')
  }
}
