'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Search,
  X,
  Heart,
  Briefcase,
  Home,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Bell
} from 'lucide-react'
import { memoryService } from '@/lib/memoryService'
import { calendarService, Reminder } from '@/lib/calendarService'
import { toast } from 'react-hot-toast'

interface MemoryViewProps {
  onClose: () => void
}

interface MemoryItem {
  id: string
  type: 'memory' | 'reminder'
  content: string
  category: 'personal' | 'work' | 'life'
  timestamp: Date
  dueDate?: Date
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  completed?: boolean
}

export default function MemoryView({ onClose }: MemoryViewProps) {
  const [items, setItems] = useState<MemoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showAddReminder, setShowAddReminder] = useState(false)
  const [newReminder, setNewReminder] = useState({
    title: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    category: 'personal' as 'work' | 'personal' | 'life',
    description: ''
  })

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = () => {
    // Load memories
    const memories = memoryService.getAllMemories().map(memory => ({
      id: memory.id,
      type: 'memory' as const,
      content: memory.content,
      category: memory.category,
      timestamp: new Date(memory.timestamp)
    }))

    // Load reminders
    const reminders = calendarService.getStoredReminders().map(reminder => ({
      id: reminder.id || Date.now().toString(),
      type: 'reminder' as const,
      content: reminder.title,
      category: reminder.category || 'personal',
      timestamp: new Date(reminder.createdAt || Date.now()),
      dueDate: new Date(reminder.dueDate),
      priority: reminder.priority,
      completed: reminder.completed
    }))

    // Combine and sort by timestamp
    const allItems = [...memories, ...reminders].sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    )
    
    setItems(allItems)
  }

  const addReminder = async () => {
    if (!newReminder.title.trim()) {
      toast.error('Please enter a reminder title')
      return
    }

    if (!newReminder.dueDate) {
      toast.error('Please select a due date')
      return
    }

    try {
      const reminder: Reminder = {
        title: newReminder.title,
        dueDate: new Date(newReminder.dueDate),
        priority: newReminder.priority,
        category: newReminder.category,
        description: newReminder.description
      }

      await calendarService.addReminder(reminder)
      toast.success('Reminder added successfully!')
      
      // Reset form
      setNewReminder({
        title: '',
        dueDate: '',
        priority: 'medium',
        category: 'personal',
        description: ''
      })
      setShowAddReminder(false)
      loadItems()
    } catch (error) {
      console.error('Error adding reminder:', error)
      toast.error('Failed to add reminder')
    }
  }

  const toggleReminderComplete = async (reminderId: string) => {
    try {
      await calendarService.toggleReminderComplete(reminderId)
      loadItems()
      toast.success('Reminder updated!')
    } catch (error) {
      console.error('Error updating reminder:', error)
      toast.error('Failed to update reminder')
    }
  }

  const categories = ['all', 'personal', 'work', 'life']
  const types = ['all', 'memory', 'reminder']
  
  const filteredItems = items.filter(item => {
    const matchesSearch = item.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesType = selectedType === 'all' || item.type === selectedType
    return matchesSearch && matchesCategory && matchesType
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/20'
      case 'high': return 'text-orange-400 bg-orange-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'low': return 'text-green-400 bg-green-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const isOverdue = (dueDate: Date) => {
    return new Date() > dueDate
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-electric-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Memory Bank</h2>
              <p className="text-gray-400 text-sm">Your memories and reminders</p>
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
              Type <span className="text-electric-400 font-mono">"REMEMBER"</span> to save information, 
              or <span className="text-purple-400 font-mono">"Create a reminder"</span> to set tasks with due dates.
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search your memories and reminders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-electric-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Type Filter */}
            <div className="flex space-x-1">
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedType === type
                      ? 'bg-electric-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {type === 'all' ? 'All' : type === 'memory' ? 'Memories' : 'Reminders'}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex space-x-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            {/* Add Reminder Button */}
            <button
              onClick={() => setShowAddReminder(true)}
              className="ml-auto px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-sm font-medium hover:from-purple-400 hover:to-blue-400 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Reminder</span>
            </button>
          </div>

          {/* Items List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  {searchQuery ? 'No items found matching your search.' : 'No memories or reminders saved yet.'}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Try saying "REMEMBER I prefer morning meetings" or "Create a reminder to call mom tomorrow"
                </p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-gray-800 rounded-lg p-4 border border-gray-700 ${
                    item.type === 'reminder' && item.completed ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCategoryColor(item.category)}`}>
                      {item.type === 'memory' ? getCategoryIcon(item.category) : <Bell className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className={`text-sm ${item.type === 'reminder' && item.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                          {item.content}
                        </p>
                        {item.type === 'reminder' && item.completed && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {item.type === 'memory' ? 'Memory' : 'Reminder'}
                        </span>
                        {item.type === 'reminder' && item.priority && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                        )}
                        {item.type === 'reminder' && item.dueDate && (
                          <span className={`text-xs flex items-center space-x-1 ${
                            isOverdue(item.dueDate) ? 'text-red-400' : 'text-gray-500'
                          }`}>
                            <Clock className="w-3 h-3" />
                            <span>{item.dueDate.toLocaleDateString()}</span>
                            {isOverdue(item.dueDate) && <AlertCircle className="w-3 h-3" />}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {item.type === 'reminder' && (
                      <button
                        onClick={() => toggleReminderComplete(item.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          item.completed 
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Add Reminder Modal */}
        {showAddReminder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-md p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Add Reminder</h3>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Reminder title"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-electric-500"
                />
                
                <input
                  type="datetime-local"
                  value={newReminder.dueDate}
                  onChange={(e) => setNewReminder({...newReminder, dueDate: e.target.value})}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-electric-500"
                />
                
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'work', label: 'Work', icon: Briefcase, color: 'bg-blue-600' },
                    { value: 'personal', label: 'Personal', icon: Heart, color: 'bg-pink-600' },
                    { value: 'life', label: 'Life', icon: Home, color: 'bg-green-600' }
                  ].map((category) => (
                    <button
                      key={category.value}
                      onClick={() => setNewReminder({...newReminder, category: category.value as any})}
                      className={`p-3 rounded-lg text-white text-sm font-medium transition-colors ${
                        newReminder.category === category.value ? category.color : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  {['low', 'medium', 'high', 'urgent'].map((priority) => (
                    <button
                      key={priority}
                      onClick={() => setNewReminder({...newReminder, priority: priority as any})}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        newReminder.priority === priority 
                          ? getPriorityColor(priority)
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={addReminder}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-400 hover:to-blue-400 transition-colors"
                >
                  Add Reminder
                </button>
                <button
                  onClick={() => setShowAddReminder(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  )
}