'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Plus, Search, Tag, Calendar, MapPin, Heart, Briefcase, Clock, Star, Edit, Trash2, X } from 'lucide-react'
import { memoryService, Memory } from '@/lib/memoryService'
import { toast } from 'react-hot-toast'

const categoryIcons = {
  personal: Brain,
  preference: Heart,
  location: MapPin,
  relationship: Heart,
  context: Briefcase,
  habit: Clock
}

const categoryColors = {
  personal: 'text-blue-400 bg-blue-500/20',
  preference: 'text-pink-400 bg-pink-500/20',
  location: 'text-green-400 bg-green-500/20',
  relationship: 'text-purple-400 bg-purple-500/20',
  context: 'text-orange-400 bg-orange-500/20',
  habit: 'text-cyan-400 bg-cyan-500/20'
}

const importanceColors = {
  high: 'text-red-400',
  medium: 'text-yellow-400',
  low: 'text-gray-400'
}

export default function MemoryView() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [filter, setFilter] = useState<'all' | Memory['category']>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddMemory, setShowAddMemory] = useState(false)
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null)
  const [newMemory, setNewMemory] = useState({
    content: '',
    category: 'personal' as Memory['category'],
    importance: 'medium' as Memory['importance']
  })

  useEffect(() => {
    loadMemories()
  }, [])

  const loadMemories = () => {
    const allMemories = memoryService.getAllMemories()
    setMemories(allMemories)
  }

  const handleAddMemory = () => {
    if (!newMemory.content.trim()) {
      toast.error('Please enter a memory')
      return
    }

    if (editingMemory) {
      // Update existing memory
      const success = memoryService.updateMemory(editingMemory.id, {
        content: newMemory.content,
        category: newMemory.category,
        importance: newMemory.importance
      })
      
      if (success) {
        toast.success('Memory updated!')
        setEditingMemory(null)
      } else {
        toast.error('Failed to update memory')
      }
    } else {
      // Add new memory
      memoryService.addMemory(newMemory.content, newMemory.category, newMemory.importance)
      toast.success('Memory saved!')
    }

    setNewMemory({ content: '', category: 'personal', importance: 'medium' })
    setShowAddMemory(false)
    loadMemories()
  }

  const handleDeleteMemory = (id: string) => {
    const success = memoryService.deleteMemory(id)
    if (success) {
      toast.success('Memory deleted!')
      loadMemories()
    } else {
      toast.error('Failed to delete memory')
    }
  }

  const handleEditMemory = (memory: Memory) => {
    setEditingMemory(memory)
    setNewMemory({
      content: memory.content,
      category: memory.category,
      importance: memory.importance
    })
    setShowAddMemory(true)
  }

  const filteredMemories = memories.filter(memory => {
    if (filter !== 'all' && memory.category !== filter) return false
    if (searchQuery && !memory.content.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const getMemoryStats = () => {
    const total = memories.length
    const byCategory = memories.reduce((acc, memory) => {
      acc[memory.category] = (acc[memory.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return { total, byCategory }
  }

  const stats = getMemoryStats()

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 space-y-4 md:space-y-0">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-4 mb-3"
            >
              <Brain className="w-8 h-8 md:w-10 md:h-10 text-electric-400" />
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-electric-400 leading-tight">
                Remember
              </h1>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-electric-300 text-lg md:text-xl lg:text-2xl font-semibold"
            >
              Save important details and recall them anytime
            </motion.p>
          </div>
          
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => setShowAddMemory(true)}
            className="bg-gradient-to-r from-electric-600 via-purple-600 to-electric-500 hover:from-electric-700 hover:via-purple-700 hover:to-electric-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold transition-all duration-200 hover:scale-105 hover:shadow-glow flex items-center justify-center space-x-3 shadow-lg w-full md:w-auto"
          >
            <Plus className="w-5 h-5 md:w-6 md:h-6" />
            <span>Add Memory</span>
          </motion.button>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl font-bold text-electric-400">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Memories</div>
          </div>
          {Object.entries(stats.byCategory).map(([category, count]) => {
            const Icon = categoryIcons[category as Memory['category']]
            return (
              <div key={category} className="bg-gray-900 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon className="w-4 h-4 text-electric-400" />
                  <div className="text-2xl font-bold text-electric-400">{count}</div>
                </div>
                <div className="text-sm text-gray-400 capitalize">{category}</div>
              </div>
            )
          })}
        </motion.div>

        {/* Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h3 className="text-xl font-bold text-white mb-4">How to use Remember:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
              <h4 className="text-electric-400 font-semibold mb-2">Personal Info</h4>
              <p className="text-gray-300 text-sm mb-2">"REMEMBER I'm allergic to peanuts"</p>
              <p className="text-gray-400 text-xs">Saves health information for future reference</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
              <h4 className="text-electric-400 font-semibold mb-2">Locations</h4>
              <p className="text-gray-300 text-sm mb-2">"REMEMBER I parked in section B"</p>
              <p className="text-gray-400 text-xs">Tracks where you left things</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
              <h4 className="text-electric-400 font-semibold mb-2">Preferences</h4>
              <p className="text-gray-300 text-sm mb-2">"REMEMBER I prefer morning meetings"</p>
              <p className="text-gray-400 text-xs">Saves your preferences and habits</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
              <h4 className="text-electric-400 font-semibold mb-2">Relationships</h4>
              <p className="text-gray-300 text-sm mb-2">"REMEMBER John is my project manager"</p>
              <p className="text-gray-400 text-xs">Keeps track of important people</p>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200"
            />
          </div>

          {/* Category Filter */}
          <div className="flex space-x-2 overflow-x-auto">
            {[
              { key: 'all', label: 'All', icon: Brain },
              { key: 'personal', label: 'Personal', icon: Brain },
              { key: 'preference', label: 'Preferences', icon: Heart },
              { key: 'location', label: 'Locations', icon: MapPin },
              { key: 'relationship', label: 'Relationships', icon: Heart },
              { key: 'context', label: 'Context', icon: Briefcase },
              { key: 'habit', label: 'Habits', icon: Clock }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  filter === key
                    ? 'bg-gradient-to-r from-electric-600 via-purple-600 to-electric-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Memories List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          {filteredMemories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                {searchQuery ? 'No memories found' : 'No memories yet'}
              </h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? 'Try a different search term' 
                  : 'Start building your memory bank!'
                }
              </p>
            </motion.div>
          ) : (
            filteredMemories.map((memory, index) => {
              const Icon = categoryIcons[memory.category]
              return (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900 rounded-xl p-6 border border-gray-700 hover:border-electric-500/50 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 rounded-lg ${categoryColors[memory.category]}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[memory.category]}`}>
                              {memory.category}
                            </span>
                            <Star className={`w-4 h-4 ${importanceColors[memory.importance]}`} />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(memory.createdAt).toLocaleDateString()} • 
                            Accessed {memory.accessCount} times
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-lg leading-relaxed mb-3">
                        {memory.content}
                      </p>
                      
                      {memory.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {memory.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-md"
                            >
                              <Tag className="w-3 h-3 inline mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEditMemory(memory)}
                        className="p-2 text-gray-400 hover:text-blue-400 transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMemory(memory.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </motion.div>

        {/* Add/Edit Memory Modal */}
        <AnimatePresence>
          {showAddMemory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-700 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-electric-400">
                    {editingMemory ? 'Edit Memory' : 'Add New Memory'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddMemory(false)
                      setEditingMemory(null)
                      setNewMemory({ content: '', category: 'personal', importance: 'medium' })
                    }}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Memory Content *
                    </label>
                    <textarea
                      value={newMemory.content}
                      onChange={(e) => setNewMemory({ ...newMemory, content: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200"
                      placeholder="Remember I parked in section B..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Category
                      </label>
                      <select
                        value={newMemory.category}
                        onChange={(e) => setNewMemory({ ...newMemory, category: e.target.value as Memory['category'] })}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200"
                      >
                        <option value="personal">Personal</option>
                        <option value="preference">Preference</option>
                        <option value="location">Location</option>
                        <option value="relationship">Relationship</option>
                        <option value="context">Context</option>
                        <option value="habit">Habit</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Importance
                      </label>
                      <select
                        value={newMemory.importance}
                        onChange={(e) => setNewMemory({ ...newMemory, importance: e.target.value as Memory['importance'] })}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddMemory(false)
                        setEditingMemory(null)
                        setNewMemory({ content: '', category: 'personal', importance: 'medium' })
                      }}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddMemory}
                      className="flex-1 bg-gradient-to-r from-electric-600 via-purple-600 to-electric-500 hover:from-electric-700 hover:via-purple-700 hover:to-electric-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      {editingMemory ? 'Update' : 'Save'} Memory
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
