'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Clock, AlertCircle, CheckCircle, Plus, X, Edit, Trash2, Star, Briefcase, Heart, Dumbbell, ShoppingCart, BookOpen, Home, Car, Phone } from 'lucide-react'
import { calendarService, Reminder } from '@/lib/calendarService'
import { toast } from 'react-hot-toast'
import { ErrorHandler } from '@/lib/errorHandler'

interface ReminderWithId extends Reminder {
  id: string
  createdAt: string
  completed?: boolean
  deleted?: boolean
  completedAt?: string
  deletedAt?: string
}

export default function RemindersView() {
  const [reminders, setReminders] = useState<ReminderWithId[]>([])
  const [showAddReminder, setShowAddReminder] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'deleted'>('all')
  const [newReminder, setNewReminder] = useState({
    title: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    category: 'personal' as 'work' | 'personal' | 'health' | 'shopping' | 'learning' | 'home' | 'transport' | 'communication',
    description: ''
  })
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null)

  useEffect(() => {
    loadReminders()
    requestNotificationPermission()
  }, [])

  const loadReminders = async () => {
    try {
      const storedReminders = calendarService.getStoredReminders()
      // Ensure all dates are valid Date objects
      const validReminders = storedReminders.map(reminder => ({
        ...reminder,
        dueDate: new Date(reminder.dueDate),
        createdAt: reminder.createdAt
      })).filter(reminder => !isNaN(reminder.dueDate.getTime()))
      
      setReminders(validReminders)
    } catch (error) {
      console.error('Failed to load reminders:', error)
      if (ErrorHandler.shouldShowError(error, 'load-reminders')) {
        toast.error(ErrorHandler.getOperationErrorMessage('load-reminders', error))
      }
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
        category: newReminder.category,
        description: newReminder.description
      }

      const success = await calendarService.createReminder(reminder)
      if (success) {
        await loadReminders() // Reload to get the new reminder with ID
        setShowAddReminder(false)
        setNewReminder({ title: '', dueDate: '', priority: 'medium', category: 'personal', description: '' })
        toast.success('Reminder created successfully!')
      } else {
        toast.error('Failed to create reminder')
      }
    } catch (error) {
      console.error('Failed to create reminder:', error)
      toast.error(ErrorHandler.getOperationErrorMessage('save-reminder', error))
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
      toast.error(ErrorHandler.getOperationErrorMessage('update-reminder', error))
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
      toast.error(ErrorHandler.getOperationErrorMessage('update-reminder', error))
    }
  }

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      const reminder = reminders.find(r => r.id === reminderId)
      if (reminder) {
        const updatedReminder = {
          ...reminder,
          deleted: true,
          deletedAt: new Date().toISOString()
        }
        
        // Update in storage instead of actually deleting
        const storedReminders = calendarService.getStoredReminders()
        const updatedStored = storedReminders.map(r => 
          r.id === reminderId ? { ...r, deleted: true, deletedAt: updatedReminder.deletedAt } : r
        )
        localStorage.setItem('velora-reminders', JSON.stringify(updatedStored))
        
        await loadReminders()
        toast.success('Reminder moved to trash!')
      }
    } catch (error) {
      console.error('Failed to delete reminder:', error)
      toast.error(ErrorHandler.getOperationErrorMessage('delete-reminder', error))
    }
  }

  const handleEditReminder = (reminder: ReminderWithId) => {
    setNewReminder({
      title: reminder.title,
      dueDate: reminder.dueDate.toISOString().slice(0, 16),
      priority: reminder.priority,
      category: (reminder as any).category || 'personal',
      description: reminder.description || ''
    })
    setShowAddReminder(true)
    setEditingReminderId(reminder.id)
  }

  const handleCompleteReminder = async (id: string) => {
    try {
      const reminder = reminders.find(r => r.id === id)
      if (reminder) {
        const updatedReminder = {
          ...reminder,
          completed: true,
          completedAt: new Date().toISOString()
        }
        
        // Update in storage
        const storedReminders = calendarService.getStoredReminders()
        const updatedStored = storedReminders.map(r => 
          r.id === id ? { ...r, completed: true, completedAt: updatedReminder.completedAt } : r
        )
        localStorage.setItem('velora-reminders', JSON.stringify(updatedStored))
        
        await loadReminders()
        toast.success('Reminder completed!')
      }
    } catch (error) {
      console.error('Failed to complete reminder:', error)
      toast.error(ErrorHandler.getOperationErrorMessage('update-reminder', error))
    }
  }

  const handleRestoreReminder = async (id: string) => {
    try {
      const reminder = reminders.find(r => r.id === id)
      if (reminder) {
        const updatedReminder = {
          ...reminder,
          completed: false,
          deleted: false,
          completedAt: undefined,
          deletedAt: undefined
        }
        
        // Update in storage
        const storedReminders = calendarService.getStoredReminders()
        const updatedStored = storedReminders.map(r => 
          r.id === id ? { ...r, completed: false, deleted: false, completedAt: undefined, deletedAt: undefined } : r
        )
        localStorage.setItem('velora-reminders', JSON.stringify(updatedStored))
        
        await loadReminders()
        toast.success('Reminder restored!')
      }
    } catch (error) {
      console.error('Failed to restore reminder:', error)
      toast.error(ErrorHandler.getOperationErrorMessage('update-reminder', error))
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

  const getCategoryInfo = (category: string) => {
    const categories = {
      work: { icon: Briefcase, color: 'bg-blue-600', textColor: 'text-blue-400' },
      personal: { icon: Heart, color: 'bg-pink-600', textColor: 'text-pink-400' },
      health: { icon: Dumbbell, color: 'bg-green-600', textColor: 'text-green-400' },
      shopping: { icon: ShoppingCart, color: 'bg-orange-600', textColor: 'text-orange-400' },
      learning: { icon: BookOpen, color: 'bg-purple-600', textColor: 'text-purple-400' },
      home: { icon: Home, color: 'bg-indigo-600', textColor: 'text-indigo-400' },
      transport: { icon: Car, color: 'bg-gray-600', textColor: 'text-gray-400' },
      communication: { icon: Phone, color: 'bg-teal-600', textColor: 'text-teal-400' }
    }
    return categories[category as keyof typeof categories] || categories.personal
  }

  const isOverdue = (dueDate: Date) => {
    try {
      return new Date() > dueDate
    } catch (error) {
      console.error('Error checking if overdue:', error)
      return false
    }
  }

  const formatDueDate = (dueDate: Date) => {
    try {
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
    } catch (error) {
      console.error('Error formatting due date:', error)
      return 'Invalid date'
    }
  }

  const filteredReminders = reminders.filter(reminder => {
    if (filter === 'pending') return !reminder.completed && !reminder.deleted
    if (filter === 'completed') return reminder.completed && !reminder.deleted
    if (filter === 'deleted') return reminder.deleted
    return !reminder.deleted // 'all' shows non-deleted items
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background-tertiary p-3 md:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 space-y-4 md:space-y-0">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-3 md:space-x-4 mb-2 md:mb-3"
            >
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-electric-400 via-purple-400 to-electric-500 bg-clip-text text-transparent leading-tight">
                My Reminders
              </h1>
              {getPendingRemindersCount() > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  className="relative"
                >
                  <Bell className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-electric-400" />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center"
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
              className="text-electric-300 text-lg md:text-xl lg:text-2xl font-semibold"
            >
              Never miss an important task or deadline
            </motion.p>
          </div>
          
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => setShowAddReminder(true)}
            className="bg-gradient-to-r from-electric-600 via-purple-600 to-electric-500 hover:from-electric-700 hover:via-purple-700 hover:to-electric-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold transition-all duration-200 hover:scale-105 hover:shadow-glow flex items-center justify-center space-x-2 md:space-x-3 shadow-lg w-full md:w-auto touch-manipulation"
          >
            <Plus className="w-5 h-5 md:w-6 md:h-6" />
            <span>Add Reminder</span>
          </motion.button>
        </div>

        {/* Filter Tabs - Mobile Optimized */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-2 md:gap-3 mb-6 md:mb-8"
        >
          {[
            { key: 'all', label: 'All', count: reminders.filter(r => !r.deleted).length },
            { key: 'pending', label: 'Pending', count: reminders.filter(r => !r.completed && !r.deleted).length },
            { key: 'completed', label: 'Completed', count: reminders.filter(r => r.completed && !r.deleted).length },
            { key: 'deleted', label: 'Trash', count: reminders.filter(r => r.deleted).length }
          ].map((tab) => (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold transition-all duration-200 text-sm md:text-base touch-manipulation ${
                filter === tab.key
                  ? 'bg-gradient-to-r from-electric-600 via-purple-600 to-electric-500 text-white shadow-lg'
                  : 'bg-background-elevated text-gray-400 hover:text-white hover:bg-background-tertiary border border-gray-600'
              }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.slice(0, 3)}</span>
              <span className="ml-1">({tab.count})</span>
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
                className={`bg-background-elevated rounded-xl md:rounded-2xl p-4 md:p-6 border transition-all duration-200 shadow-lg ${
                  reminder.completed
                    ? 'border-gray-600 opacity-60'
                    : isOverdue(reminder.dueDate)
                    ? 'border-red-500/50 bg-red-500/5'
                    : 'border-gray-700 hover:border-electric-500/30 hover:shadow-xl'
                }`}
              >
                <div className="flex items-start space-x-3 md:space-x-4">
                  {/* Priority Icon */}
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                    reminder.completed ? 'bg-gray-600' : 'bg-gradient-to-r from-electric-600 via-purple-600 to-electric-500'
                  }`}>
                    {reminder.completed ? (
                      <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    ) : (
                      getPriorityIcon(reminder.priority)
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2 space-y-2 md:space-y-0">
                      <h3 className={`font-semibold text-base md:text-lg ${
                        reminder.completed ? 'text-gray-500 line-through' : 'text-electric-400'
                      }`}>
                        {reminder.title}
                      </h3>
                      
                      <div className="flex items-center space-x-2 flex-wrap">
                        {(() => {
                          const categoryInfo = getCategoryInfo((reminder as any).category || 'personal')
                          const IconComponent = categoryInfo.icon
                          return (
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${categoryInfo.color} text-white`}>
                              <IconComponent className="w-3 h-3" />
                              <span className="capitalize">{(reminder as any).category || 'personal'}</span>
                            </div>
                          )
                        })()}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(reminder.priority)}`}>
                          {reminder.priority}
                        </span>
                        
                        {filter === 'deleted' ? (
                          // Trash view - show restore button
                          <motion.button 
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRestoreReminder(reminder.id)}
                            className="p-2 md:p-2 text-gray-400 hover:text-green-400 transition-all duration-200 bg-gray-500/10 hover:bg-green-500/20 rounded-lg touch-manipulation"
                            title="Restore reminder"
                          >
                            <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                          </motion.button>
                        ) : (
                          // Normal view - show complete/snooze/edit/delete buttons
                          <>
                            <motion.button
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleToggleComplete(reminder.id)}
                              className={`p-2 md:p-2 rounded-lg transition-all duration-200 touch-manipulation ${
                                reminder.completed
                                  ? 'text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20'
                                  : 'text-gray-400 hover:text-green-400 bg-gray-500/10 hover:bg-green-500/20'
                              }`}
                            >
                              <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                            </motion.button>
                            
                            {!reminder.completed && (
                              <div className="relative group">
                                <motion.button 
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-2 md:p-2 text-gray-400 hover:text-yellow-400 transition-all duration-200 bg-gray-500/10 hover:bg-yellow-500/20 rounded-lg touch-manipulation"
                                  title="Snooze options"
                                >
                                  <Clock className="w-4 h-4 md:w-5 md:h-5" />
                                </motion.button>
                                
                                {/* Snooze Options Dropdown - Mobile Optimized */}
                                <div className="absolute right-0 top-full mt-1 w-36 md:w-32 bg-gray-800 border border-gray-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                  <div className="py-1">
                                    {[
                                      { label: '5 min', minutes: 5 },
                                      { label: '15 min', minutes: 15 },
                                      { label: '1 hour', minutes: 60 },
                                      { label: 'Tomorrow', minutes: 24 * 60 }
                                    ].map((option) => (
                                      <button
                                        key={option.label}
                                        onClick={() => handleSnoozeReminder(reminder.id, option.minutes)}
                                        className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 touch-manipulation"
                                      >
                                        {option.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <motion.button 
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEditReminder(reminder)}
                              className="p-2 md:p-2 text-gray-400 hover:text-blue-400 transition-all duration-200 bg-gray-500/10 hover:bg-blue-500/20 rounded-lg touch-manipulation">
                              <Edit className="w-4 h-4 md:w-5 md:h-5" />
                            </motion.button>
                            
                            <motion.button 
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteReminder(reminder.id)}
                              className="p-2 md:p-2 text-gray-400 hover:text-red-400 transition-all duration-200 bg-gray-500/10 hover:bg-red-500/20 rounded-lg touch-manipulation"
                            >
                              <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                            </motion.button>
                          </>
                        )}
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

        {/* Add Reminder Modal - Mobile Optimized */}
        <AnimatePresence>
          {showAddReminder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-background-elevated rounded-xl md:rounded-2xl p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-700"
              >
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h3 className="text-lg md:text-xl font-semibold text-electric-400">Add New Reminder</h3>
                  <button
                    onClick={() => setShowAddReminder(false)}
                    className="text-gray-400 hover:text-white transition-colors duration-200 p-1 touch-manipulation"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); handleAddReminder(); }} className="space-y-3 md:space-y-4">
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

                  {/* Reminder Category - Mobile Optimized */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Category
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'work', label: 'Work', icon: Briefcase, color: 'bg-blue-600' },
                        { value: 'personal', label: 'Personal', icon: Heart, color: 'bg-pink-600' },
                        { value: 'health', label: 'Health', icon: Dumbbell, color: 'bg-green-600' },
                        { value: 'shopping', label: 'Shopping', icon: ShoppingCart, color: 'bg-orange-600' },
                        { value: 'learning', label: 'Learning', icon: BookOpen, color: 'bg-purple-600' },
                        { value: 'home', label: 'Home', icon: Home, color: 'bg-indigo-600' },
                        { value: 'transport', label: 'Transport', icon: Car, color: 'bg-gray-600' },
                        { value: 'communication', label: 'Communication', icon: Phone, color: 'bg-teal-600' }
                      ].map((category) => {
                        const IconComponent = category.icon
                        return (
                          <button
                            key={category.value}
                            type="button"
                            onClick={() => setNewReminder({ ...newReminder, category: category.value as any })}
                            className={`flex items-center space-x-2 p-2 md:p-3 rounded-lg border transition-all duration-200 touch-manipulation ${
                              newReminder.category === category.value
                                ? `${category.color} text-white border-transparent`
                                : 'bg-background-tertiary text-gray-300 border-gray-600 hover:border-gray-500'
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                            <span className="text-xs md:text-sm font-medium">{category.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Quick Reminder Templates - Mobile Optimized */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Quick Templates
                    </label>
                    <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
                      {[
                        { title: 'Call mom', category: 'communication', priority: 'medium' },
                        { title: 'Buy groceries', category: 'shopping', priority: 'high' },
                        { title: 'Doctor appointment', category: 'health', priority: 'high' },
                        { title: 'Team meeting', category: 'work', priority: 'medium' },
                        { title: 'Study session', category: 'learning', priority: 'medium' },
                        { title: 'Clean house', category: 'home', priority: 'low' }
                      ].map((template) => (
                        <button
                          key={template.title}
                          type="button"
                          onClick={() => {
                            setNewReminder({
                              ...newReminder,
                              title: template.title,
                              category: template.category as any,
                              priority: template.priority as any
                            })
                          }}
                          className="px-3 py-2 bg-background-tertiary hover:bg-background-secondary text-gray-300 hover:text-white border border-gray-600 hover:border-electric-500 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 touch-manipulation text-center"
                        >
                          {template.title}
                        </button>
                      ))}
                    </div>
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
                  
                  <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddReminder(false)}
                      className="flex-1 bg-background-tertiary hover:bg-background-secondary text-white font-medium py-3 md:py-2 px-4 rounded-lg transition-colors duration-200 border border-gray-600 touch-manipulation"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-electric-600 via-purple-600 to-electric-500 hover:from-electric-700 hover:via-purple-700 hover:to-electric-600 text-white font-medium py-3 md:py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105 touch-manipulation"
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
