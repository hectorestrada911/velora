'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Clock, AlertCircle, CheckCircle, Plus, X, Edit, Trash2, Star } from 'lucide-react'
import { calendarService, Reminder } from '@/lib/calendarService'
import { toast } from 'react-hot-toast'

interface ReminderWithId extends Reminder {
  id: string
  createdAt: string
  completed?: boolean
}

export default function RemindersView() {
  const [reminders, setReminders] = useState<ReminderWithId[]>([])
  const [showAddReminder, setShowAddReminder] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [newReminder, setNewReminder] = useState({
    title: '',
    dueDate: '',
    priority: 'medium' as const,
    description: ''
  })

  useEffect(() => {
    loadReminders()
    requestNotificationPermission()
  }, [])

  const loadReminders = async () => {
    try {
      const storedReminders = calendarService.getStoredReminders()
      setReminders(storedReminders)
    } catch (error) {
      console.error('Failed to load reminders:', error)
      toast.error('Failed to load reminders')
    }
  }

  const requestNotificationPermission = async () => {
    try {
      await calendarService.requestNotificationPermission()
    } catch (error) {
      console.error('Failed to request notification permission:', error)
    }
  }

  const handleAddReminder = async () => {
    if (!newReminder.title || !newReminder.dueDate) {
      toast.error('Please fill in the required fields')
      return
    }

    try {
      const reminder: Reminder = {
        title: newReminder.title,
        dueDate: new Date(newReminder.dueDate),
        priority: newReminder.priority,
        description: newReminder.description
      }

      const success = await calendarService.createReminder(reminder)
      if (success) {
        await loadReminders() // Reload to get the new reminder with ID
        setShowAddReminder(false)
        setNewReminder({ title: '', dueDate: '', priority: 'medium', description: '' })
        toast.success('Reminder created successfully!')
      } else {
        toast.error('Failed to create reminder')
      }
    } catch (error) {
      console.error('Failed to create reminder:', error)
      toast.error('Failed to create reminder')
    }
  }

  const handleToggleComplete = async (reminderId: string) => {
    try {
      const reminder = reminders.find(r => r.id === reminderId)
      if (!reminder) return
      
      const success = await calendarService.updateReminder(reminderId, { completed: !reminder.completed })
      if (success) {
        await loadReminders()
        toast.success(reminder.completed ? 'Reminder marked as pending!' : 'Reminder completed!')
      } else {
        toast.error('Failed to update reminder')
      }
    } catch (error) {
      console.error('Failed to toggle reminder:', error)
      toast.error('Failed to update reminder')
    }
  }

  const handleSnoozeReminder = async (reminderId: string, minutes: number) => {
    try {
      const success = await calendarService.snoozeReminder(reminderId, minutes)
      if (success) {
        await loadReminders()
        toast.success(`Reminder snoozed for ${minutes} minutes`)
      } else {
        toast.error('Failed to snooze reminder')
      }
    } catch (error) {
      console.error('Failed to snooze reminder:', error)
      toast.error('Failed to snooze reminder')
    }
  }

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      const success = await calendarService.deleteReminder(reminderId)
      if (success) {
        await loadReminders() // Reload from storage
        toast.success('Reminder deleted successfully!')
      } else {
        toast.error('Failed to delete reminder')
      }
    } catch (error) {
      console.error('Failed to delete reminder:', error)
      toast.error('Failed to delete reminder')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400 bg-red-500/20'
      case 'high':
        return 'text-orange-400 bg-orange-500/20'
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20'
      case 'low':
        return 'text-green-400 bg-green-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4" />
      case 'high':
        return <Star className="w-4 h-4" />
      case 'medium':
        return <Clock className="w-4 h-4" />
      case 'low':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const isOverdue = (dueDate: Date) => {
    return new Date() > dueDate
  }

  const formatDueDate = (dueDate: Date) => {
    const now = new Date()
    const diffTime = dueDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} overdue`
    } else if (diffDays === 0) {
      return 'Due today'
    } else if (diffDays === 1) {
      return 'Due tomorrow'
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`
    } else {
      return dueDate.toLocaleDateString()
    }
  }

  const filteredReminders = reminders.filter(reminder => {
    if (filter === 'pending') return !reminder.completed
    if (filter === 'completed') return reminder.completed
    return true
  })

  const sortedReminders = filteredReminders.sort((a, b) => {
    // Overdue items first
    if (isOverdue(a.dueDate) && !isOverdue(b.dueDate)) return -1
    if (!isOverdue(a.dueDate) && isOverdue(b.dueDate)) return 1
    
    // Then by priority
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 2
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 2
    
    if (aPriority !== bPriority) return aPriority - bPriority
    
    // Then by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  // Count pending reminders
  const getPendingRemindersCount = () => {
    return reminders.filter(reminder => !reminder.completed).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-tertiary p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-4 mb-3"
            >
              <h1 className="text-5xl md:text-6xl font-extrabold text-yellow-400 leading-tight">
                My Reminders
              </h1>
              {getPendingRemindersCount() > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  className="relative"
                >
                  <Bell className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {getPendingRemindersCount()}
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-yellow-300 text-xl md:text-2xl font-semibold"
            >
              Never miss an important task or deadline
            </motion.p>
          </div>
          
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => setShowAddReminder(true)}
            className="bg-gradient-to-r from-yellow-600 via-orange-600 to-yellow-500 hover:from-yellow-700 hover:via-orange-700 hover:to-yellow-600 text-white px-8 py-4 rounded-xl font-bold transition-all duration-200 hover:scale-105 hover:shadow-glow flex items-center space-x-3 shadow-lg"
          >
            <Plus className="w-6 h-6" />
            <span>Add Reminder</span>
          </motion.button>
        </div>

        {/* Filter Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex space-x-3 mb-8"
        >
          {[
            { key: 'all', label: 'All', count: reminders.length },
            { key: 'pending', label: 'Pending', count: reminders.filter(r => !r.completed).length },
            { key: 'completed', label: 'Completed', count: reminders.filter(r => r.completed).length }
          ].map((tab) => (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(tab.key as any)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                filter === tab.key
                  ? 'bg-gradient-to-r from-electric-600 via-purple-600 to-electric-500 text-white shadow-lg'
                  : 'bg-background-elevated text-gray-400 hover:text-white hover:bg-background-tertiary border border-gray-600'
              }`}
            >
              {tab.label} ({tab.count})
            </motion.button>
          ))}
        </motion.div>

        {/* Reminders List */}
        <div className="space-y-4">
          {sortedReminders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                {filter === 'all' ? 'No reminders yet' : `No ${filter} reminders`}
              </h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? 'Create your first reminder to get started!' 
                  : `All your reminders are ${filter === 'pending' ? 'completed' : 'pending'}!`
                }
              </p>
            </motion.div>
          ) : (
            sortedReminders.map((reminder, index) => (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`bg-background-elevated rounded-2xl p-6 border transition-all duration-200 shadow-lg ${
                  reminder.completed
                    ? 'border-gray-600 opacity-60'
                    : isOverdue(reminder.dueDate)
                    ? 'border-red-500/50 bg-red-500/5'
                    : 'border-gray-700 hover:border-electric-500/30 hover:shadow-xl'
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Priority Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                    reminder.completed ? 'bg-gray-600' : 'bg-gradient-to-r from-electric-600 to-electric-500'
                  }`}>
                    {reminder.completed ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      getPriorityIcon(reminder.priority)
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-semibold ${
                        reminder.completed ? 'text-gray-500 line-through' : 'text-electric-400'
                      }`}>
                        {reminder.title}
                      </h3>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(reminder.priority)}`}>
                          {reminder.priority}
                        </span>
                        
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleToggleComplete(reminder.id)}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            reminder.completed
                              ? 'text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20'
                              : 'text-gray-400 hover:text-green-400 bg-gray-500/10 hover:bg-green-500/20'
                          }`}
                        >
                          <CheckCircle className="w-5 h-5" />
                        </motion.button>
                        
                        {!reminder.completed && (
                          <motion.button 
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleSnoozeReminder(reminder.id, 15)}
                            className="p-2 text-gray-400 hover:text-yellow-400 transition-all duration-200 bg-gray-500/10 hover:bg-yellow-500/20 rounded-lg"
                            title="Snooze 15 minutes"
                          >
                            <Clock className="w-5 h-5" />
                          </motion.button>
                        )}
                        
                        <motion.button 
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-400 hover:text-blue-400 transition-all duration-200 bg-gray-500/10 hover:bg-blue-500/20 rounded-lg">
                          <Edit className="w-5 h-5" />
                        </motion.button>
                        
                        <motion.button 
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-all duration-200 bg-gray-500/10 hover:bg-red-500/20 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                    
                    {reminder.description && (
                      <p className={`text-sm mb-2 ${
                        reminder.completed ? 'text-gray-500' : 'text-gray-300'
                      }`}>
                        {reminder.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-xs">
                      <div className={`flex items-center space-x-1 ${
                        reminder.completed ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        <Clock className="w-3 h-3" />
                        <span className={isOverdue(reminder.dueDate) && !reminder.completed ? 'text-red-400 font-medium' : ''}>
                          {formatDueDate(reminder.dueDate)}
                        </span>
                      </div>
                      
                      <div className="text-gray-500">
                        Created {new Date(reminder.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Add Reminder Modal */}
        <AnimatePresence>
          {showAddReminder && (
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
                className="bg-background-elevated rounded-2xl p-6 w-full max-w-md border border-gray-700"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-yellow-400">Add New Reminder</h3>
                  <button
                    onClick={() => setShowAddReminder(false)}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); handleAddReminder(); }} className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Reminder Title *
                    </label>
                    <input
                      type="text"
                      value={newReminder.title}
                      onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                      className="w-full bg-background-tertiary border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200"
                      placeholder="Enter reminder title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Due Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={newReminder.dueDate}
                      onChange={(e) => setNewReminder({ ...newReminder, dueDate: e.target.value })}
                      className="w-full bg-background-tertiary border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Priority
                    </label>
                    <select
                      value={newReminder.priority}
                      onChange={(e) => setNewReminder({ ...newReminder, priority: e.target.value as any })}
                      className="w-full bg-background-tertiary border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      value={newReminder.description}
                      onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                      className="w-full bg-background-tertiary border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200"
                      placeholder="Enter reminder description"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddReminder(false)}
                      className="flex-1 bg-background-tertiary hover:bg-background-secondary text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 border border-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-yellow-600 via-orange-600 to-yellow-500 hover:from-yellow-700 hover:via-orange-700 hover:to-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      Add Reminder
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
