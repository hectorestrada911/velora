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
  Bell,
  Trash2
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
  const [showAddReminder, setShowAddReminder] = useState(false)
  const [newReminder, setNewReminder] = useState({
    title: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    category: 'personal' as 'work' | 'personal' | 'life'
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
      timestamp: new Date(memory.createdAt)
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
        category: newReminder.category
      }

      await calendarService.createReminder(reminder)
      toast.success('Reminder added!')
      
      // Reset form
      setNewReminder({
        title: '',
        dueDate: '',
        priority: 'medium',
        category: 'personal'
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
      await calendarService.markReminderComplete(reminderId)
      loadItems()
      toast.success('Reminder updated!')
    } catch (error) {
      console.error('Error updating reminder:', error)
      toast.error('Failed to update reminder')
    }
  }

  const deleteMemory = async (memoryId: string) => {
    try {
      await memoryService.deleteMemory(memoryId)
      loadItems()
      toast.success('Memory deleted!')
    } catch (error) {
      console.error('Error deleting memory:', error)
      toast.error('Failed to delete memory')
    }
  }

  const deleteReminder = async (reminderId: string) => {
    try {
      await calendarService.deleteReminder(reminderId)
      loadItems()
      toast.success('Reminder deleted!')
    } catch (error) {
      console.error('Error deleting reminder:', error)
      toast.error('Failed to delete reminder')
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-gradient-to-br from-gray-900/95 to-gray-800/90 rounded-2xl border border-gray-700/50 backdrop-blur-sm w-full max-w-4xl max-h-[80vh] overflow-hidden relative shadow-2xl"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-electric-500/5 via-transparent to-purple-500/5 rounded-2xl"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-electric-500 to-purple-500"></div>
        
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-4">
            <motion.div 
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 0 20px rgba(59, 130, 246, 0.3)",
                  "0 0 40px rgba(168, 85, 247, 0.5)",
                  "0 0 20px rgba(59, 130, 246, 0.3)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-10 h-10 bg-gradient-to-br from-electric-500/60 to-purple-500/60 rounded-xl flex items-center justify-center border border-electric-500/30"
            >
              <Brain className="w-5 h-5 text-electric-400" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-electric-400 to-purple-400 bg-clip-text text-transparent">REMEMBER</h2>
              <p className="text-gray-400 text-sm">Your memories and reminders</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 hover:bg-gray-800/50 rounded-xl transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 space-y-6">
          {/* Search and Add Reminder */}
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search your memories and reminders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-electric-500/60 focus:bg-gray-800/70 transition-all duration-200 backdrop-blur-sm"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddReminder(true)}
              className="px-6 py-4 bg-gradient-to-r from-electric-500/80 to-purple-500/80 text-white rounded-xl hover:from-electric-500 hover:to-purple-500 transition-all duration-200 font-medium border border-electric-400/30 shadow-lg flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Reminder</span>
            </motion.button>
          </div>

          {/* Items List */}
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {filteredItems.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-16 h-16 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-600/30"
                >
                  <Brain className="w-8 h-8 text-gray-400" />
                </motion.div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {searchQuery ? 'No items found' : 'Start Building Your Memory Bank'}
                </h3>
                <p className="text-gray-400 mb-4">
                  {searchQuery ? 'Try a different search term.' : 'Save important information and set reminders.'}
                </p>
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
                  <p className="text-gray-500 text-sm">
                    <span className="text-electric-400">Try:</span> "REMEMBER I prefer morning meetings"
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    <span className="text-purple-400">Or:</span> "Create a reminder to call mom tomorrow"
                  </p>
                </div>
              </motion.div>
            ) : (
              filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={`bg-gradient-to-r from-gray-800/60 to-gray-700/40 rounded-xl p-5 border backdrop-blur-sm transition-all duration-300 ${
                    item.type === 'reminder' && item.completed 
                      ? 'opacity-60 border-gray-600/30' 
                      : 'border-gray-600/40 hover:border-electric-500/30 hover:shadow-lg hover:shadow-electric-500/10'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getCategoryColor(item.category)}`}
                    >
                      {item.type === 'memory' ? getCategoryIcon(item.category) : <Bell className="w-5 h-5" />}
                    </motion.div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <p className={`text-base font-medium ${item.type === 'reminder' && item.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                          {item.content}
                        </p>
                        {item.type === 'reminder' && item.completed && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30"
                          >
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          </motion.div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                        <span className="text-gray-400 text-xs px-2 py-1 bg-gray-700/30 rounded-full">
                          {item.type === 'memory' ? 'Memory' : 'Reminder'}
                        </span>
                        {item.type === 'reminder' && item.priority && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                        )}
                        {item.type === 'reminder' && item.dueDate && (
                          <span className={`text-xs flex items-center space-x-1 px-2 py-1 rounded-full ${
                            isOverdue(item.dueDate) 
                              ? 'text-red-400 bg-red-500/20 border border-red-500/30' 
                              : 'text-gray-400 bg-gray-700/30'
                          }`}>
                            <Clock className="w-3 h-3" />
                            <span>{item.dueDate.toLocaleDateString()}</span>
                            {isOverdue(item.dueDate) && <AlertCircle className="w-3 h-3" />}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {item.type === 'reminder' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleReminderComplete(item.id)}
                          className={`p-2 rounded-xl transition-all duration-200 border ${
                            item.completed 
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30' 
                              : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 border-gray-600/30 hover:border-gray-500/50'
                          }`}
                          title={item.completed ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </motion.button>
                      )}
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => item.type === 'memory' ? deleteMemory(item.id) : deleteReminder(item.id)}
                        className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 hover:border-red-400/50 transition-all duration-200"
                        title={`Delete ${item.type}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
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