'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Search,
  X,
  Heart,
  Briefcase,
  Home
} from 'lucide-react'
import { memoryService } from '@/lib/memoryService'

interface MemoryDashboardProps {
  onClose: () => void
}

export default function MemoryDashboard({ onClose }: MemoryDashboardProps) {
  const [memories, setMemories] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadMemories()
  }, [])

  const loadMemories = () => {
    const allMemories = memoryService.getAllMemories()
    setMemories(allMemories)
  }

  const categories = ['all', 'personal', 'work', 'life']
  
  const filteredMemories = memories.filter(memory => {
    const matchesSearch = memory.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || memory.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'personal': return <Heart className="w-4 h-4" />
      case 'work': return <Briefcase className="w-4 h-4" />
      case 'life': return <Home className="w-4 h-4" />
      default: return <Brain className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'personal': return 'text-pink-400 bg-pink-500/20'
      case 'work': return 'text-blue-400 bg-blue-500/20'
      case 'life': return 'text-green-400 bg-green-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-electric-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Memory Bank</h2>
              <p className="text-gray-400 text-sm">Your saved information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* How to Use */}
          <div className="bg-gradient-to-r from-electric-500/10 to-purple-500/10 border border-electric-500/20 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">How to Use</h3>
            <p className="text-gray-300 text-sm">
              Simply type <span className="text-electric-400 font-mono">"REMEMBER"</span> followed by any information you want to save. 
              Velora will automatically categorize and store it.
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search your memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-electric-500"
            />
          </div>

          {/* Categories */}
          <div className="flex space-x-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-electric-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Memories List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredMemories.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  {searchQuery ? 'No memories found matching your search.' : 'No memories saved yet.'}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Try saying "REMEMBER I prefer morning meetings" in the chat.
                </p>
              </div>
            ) : (
              filteredMemories.map((memory) => (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCategoryColor(memory.category)}`}>
                      {getCategoryIcon(memory.category)}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{memory.content}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(memory.category)}`}>
                          {memory.category}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {new Date(memory.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}