'use client'

import React, { useState, useEffect } from 'react'
import { Bell, X, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Notification {
  id: string
  type: 'reminder' | 'calendar' | 'urgent' | 'suggestion'
  title: string
  description: string
  time: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationBellProps {
  onNotificationClick?: () => void
}

export default function NotificationBell({ onNotificationClick }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Mock notifications - in real app, this would come from your backend
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'reminder',
        title: 'Call John about Q4 deadline',
        description: 'Due in 2 hours',
        time: '2 hours ago',
        priority: 'high',
        action: {
          label: 'Mark Complete',
          onClick: () => handleNotificationAction('1')
        }
      },
      {
        id: '2',
        type: 'calendar',
        title: 'Team Meeting',
        description: 'Starts in 30 minutes',
        time: '30 min ago',
        priority: 'urgent',
        action: {
          label: 'View Details',
          onClick: () => handleNotificationAction('2')
        }
      },
      {
        id: '3',
        type: 'suggestion',
        title: 'You have 3 pending reminders',
        description: 'Would you like to review them?',
        time: '1 hour ago',
        priority: 'medium',
        action: {
          label: 'Review All',
          onClick: () => handleNotificationAction('3')
        }
      }
    ]
    
    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.length)
  }, [])

  const handleNotificationAction = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    setUnreadCount(prev => Math.max(0, prev - 1))
    onNotificationClick?.()
  }

  const markAllAsRead = () => {
    setUnreadCount(0)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400'
      case 'high': return 'text-orange-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-4 h-4 text-red-400" />
      case 'high': return <Clock className="w-4 h-4 text-orange-400" />
      case 'medium': return <CheckCircle className="w-4 h-4 text-yellow-400" />
      case 'low': return <CheckCircle className="w-4 h-4 text-green-400" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors duration-200"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-4 border-b border-gray-800 hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getPriorityIcon(notification.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-white font-medium text-sm">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs mt-1">
                          {notification.description}
                        </p>
                        {notification.action && (
                          <button
                            onClick={notification.action.onClick}
                            className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            {notification.action.label}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-700">
                <button 
                  onClick={() => {
                    window.location.href = '/notifications'
                    setIsOpen(false)
                  }}
                  className="w-full text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
