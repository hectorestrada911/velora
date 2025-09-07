'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  Lightbulb, 
  Target, 
  BarChart3, 
  Search,
  Plus,
  Filter,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { memoryService } from '@/lib/memoryService'
import { memoryTestScenarios, getRandomScenarios, validateMemoryCorrelation } from '@/lib/memoryTestScenarios'
import MemoryAnalytics, { MemoryInsight } from '@/lib/memoryAnalytics'

interface MemoryDashboardProps {
  onClose: () => void
}

export default function MemoryDashboard({ onClose }: MemoryDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'test' | 'analytics' | 'insights'>('overview')
  const [memories, setMemories] = useState<any[]>([])
  const [insights, setInsights] = useState<MemoryInsight[]>([])
  const [testResults, setTestResults] = useState<any[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadMemories()
  }, [])

  const loadMemories = () => {
    const allMemories = memoryService.getMemories()
    setMemories(allMemories)
    
    // Generate insights
    const analytics = new MemoryAnalytics(allMemories)
    setInsights(analytics.generateInsights())
  }

  const runMemoryTests = async () => {
    setIsRunningTests(true)
    const results: any[] = []
    const testScenarios = getRandomScenarios(20) // Test 20 random scenarios
    
    for (const scenario of testScenarios) {
      try {
        // Simulate user input
        if (scenario.userInput.startsWith('REMEMBER')) {
          // Test memory creation
          const rememberResult = memoryService.parseRememberCommand(scenario.userInput)
          if (rememberResult) {
            const memory = memoryService.addMemory(
              rememberResult.content,
              rememberResult.category,
              rememberResult.importance
            )
            results.push({
              scenario,
              success: true,
              result: 'Memory created successfully',
              memory
            })
          }
        } else {
          // Test memory retrieval
          const recallResult = memoryService.recallInformation(scenario.userInput)
          const validation = validateMemoryCorrelation(
            scenario.userInput,
            recallResult.memories.map(m => m.content),
            scenario.expectedCorrelation
          )
          
          results.push({
            scenario,
            success: validation.score > 50,
            result: `Correlation score: ${validation.score.toFixed(1)}%`,
            validation,
            retrievedMemories: recallResult.memories
          })
        }
      } catch (error) {
        results.push({
          scenario,
          success: false,
          result: `Error: ${error}`,
          error
        })
      }
    }
    
    setTestResults(results)
    setIsRunningTests(false)
    loadMemories() // Refresh memories after tests
  }

  const filteredMemories = memories.filter(memory => {
    const matchesSearch = memory.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || memory.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['all', 'personal', 'preference', 'location', 'relationship', 'context', 'habit']

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-2xl w-full max-w-6xl h-[90vh] overflow-hidden border border-gray-700"
      >
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-electric-400" />
              <h2 className="text-2xl font-bold text-white">Memory Intelligence Dashboard</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'test', label: 'Memory Tests', icon: Target },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'insights', label: 'Insights', icon: Lightbulb }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === id
                    ? 'bg-electric-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 h-full overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-3">
                      <Brain className="w-8 h-8 text-electric-400" />
                      <div>
                        <p className="text-2xl font-bold text-white">{memories.length}</p>
                        <p className="text-gray-400 text-sm">Total Memories</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-green-400" />
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {memories.filter(m => {
                            const daysSinceCreated = (Date.now() - new Date(m.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                            return daysSinceCreated < 7
                          }).length}
                        </p>
                        <p className="text-gray-400 text-sm">Recent Memories</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-3">
                      <Target className="w-8 h-8 text-blue-400" />
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {new Set(memories.map(m => m.category)).size}
                        </p>
                        <p className="text-gray-400 text-sm">Categories</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-3">
                      <Lightbulb className="w-8 h-8 text-yellow-400" />
                      <div>
                        <p className="text-2xl font-bold text-white">{insights.length}</p>
                        <p className="text-gray-400 text-sm">Insights</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search memories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-electric-500"
                    />
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-electric-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category} className="capitalize">
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Memories List */}
                <div className="space-y-3">
                  {filteredMemories.map((memory, index) => (
                    <motion.div
                      key={memory.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-white">{memory.content}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                            <span className="capitalize">{memory.category}</span>
                            <span>•</span>
                            <span>{new Date(memory.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Accessed {memory.accessCount || 0} times</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            memory.importance === 'high' ? 'bg-red-500/20 text-red-400' :
                            memory.importance === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {memory.importance}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'test' && (
              <motion.div
                key="test"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Memory Correlation Tests</h3>
                  <button
                    onClick={runMemoryTests}
                    disabled={isRunningTests}
                    className="flex items-center gap-2 bg-electric-500 hover:bg-electric-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isRunningTests ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Target className="w-4 h-4" />
                    )}
                    {isRunningTests ? 'Running Tests...' : 'Run Tests'}
                  </button>
                </div>

                {testResults.length > 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="text-green-400 font-medium">
                            {testResults.filter(r => r.success).length} Passed
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-400" />
                          <span className="text-red-400 font-medium">
                            {testResults.filter(r => !r.success).length} Failed
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <Info className="w-5 h-5 text-blue-400" />
                          <span className="text-blue-400 font-medium">
                            {((testResults.filter(r => r.success).length / testResults.length) * 100).toFixed(1)}% Success Rate
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {testResults.map((result, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`rounded-lg p-4 border ${
                            result.success 
                              ? 'bg-green-500/10 border-green-500/30' 
                              : 'bg-red-500/10 border-red-500/30'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-white font-medium">{result.scenario.description}</p>
                              <p className="text-gray-400 text-sm mt-1">{result.scenario.userInput}</p>
                              <p className={`text-sm mt-2 ${
                                result.success ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {result.result}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {result.success ? (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-red-400" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'insights' && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-white">AI Memory Insights</h3>
                
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`rounded-lg p-4 border ${
                        insight.type === 'pattern' ? 'bg-blue-500/10 border-blue-500/30' :
                        insight.type === 'suggestion' ? 'bg-yellow-500/10 border-yellow-500/30' :
                        insight.type === 'correlation' ? 'bg-purple-500/10 border-purple-500/30' :
                        'bg-orange-500/10 border-orange-500/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          insight.type === 'pattern' ? 'bg-blue-500/20' :
                          insight.type === 'suggestion' ? 'bg-yellow-500/20' :
                          insight.type === 'correlation' ? 'bg-purple-500/20' :
                          'bg-orange-500/20'
                        }`}>
                          {insight.type === 'pattern' && <TrendingUp className="w-5 h-5 text-blue-400" />}
                          {insight.type === 'suggestion' && <Lightbulb className="w-5 h-5 text-yellow-400" />}
                          {insight.type === 'correlation' && <Target className="w-5 h-5 text-purple-400" />}
                          {insight.type === 'gap' && <AlertCircle className="w-5 h-5 text-orange-400" />}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{insight.title}</h4>
                          <p className="text-gray-400 text-sm mt-1">{insight.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">
                              Confidence: {(insight.confidence * 100).toFixed(0)}%
                            </span>
                            {insight.actionable && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                                Actionable
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
