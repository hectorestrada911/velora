'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Bell, Clock, AlertCircle, CheckCircle, Filter, Search, MoreVertical } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  type: 'reminder' | 'calendar' | 'urgent' | 'suggestion'
  title: string
  description: string
  time: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  isRead: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Mock notifications - in real app, this would come from your backend
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'reminder',
        title: 'Call John about Q4 deadline',
        description: 'Due in 2 hours',
        time: '2 hours ago',
        priority: 'high',
        isRead: false,
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
        isRead: false,
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
        isRead: true,
        action: {
          label: 'Review All',
          onClick: () => handleNotificationAction('3')
        }
      },
      {
        id: '4',
        type: 'reminder',
        title: 'Submit project proposal',
        description: 'Due tomorrow at 5 PM',
        time: '3 hours ago',
        priority: 'high',
        isRead: true,
        action: {
          label: 'Set Reminder',
          onClick: () => handleNotificationAction('4')
        }
      },
      {
        id: '5',
        type: 'calendar',
        title: 'Lunch with Sarah',
        description: 'Tomorrow at 12 PM',
        time: '5 hours ago',
        priority: 'low',
        isRead: true,
        action: {
          label: 'View Calendar',
          onClick: () => handleNotificationAction('5')
        }
      }
    ]
    
    setNotifications(mockNotifications)
  }, [])

  const handleNotificationAction = (id: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === id 
          ? { ...n, isRead: true }
          : n
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 border-red-500/20 bg-red-500/5'
      case 'high': return 'text-orange-400 border-orange-500/20 bg-orange-500/5'
      case 'medium': return 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5'
      case 'low': return 'text-green-400 border-green-500/20 bg-green-500/5'
      default: return 'text-gray-400 border-gray-500/20 bg-gray-500/5'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-5 h-5 text-red-400" />
      case 'high': return <Clock className="w-5 h-5 text-orange-400" />
      case 'medium': return <CheckCircle className="w-5 h-5 text-yellow-400" />
      case 'low': return <CheckCircle className="w-5 h-5 text-green-400" />
      default: return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.isRead) ||
      (filter === 'urgent' && notification.priority === 'urgent')
    
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-3">
              <Bell className="w-6 h-6 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-900/50 border-b border-gray-700/50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread' },
                { key: 'urgent', label: 'Urgent' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto p-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {searchQuery ? 'No notifications found' : 'No notifications'}
            </h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try adjusting your search terms' : 'You\'re all caught up!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${getPriorityColor(notification.priority)} ${
                  !notification.isRead ? 'ring-2 ring-blue-500/20' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getPriorityIcon(notification.priority)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium ${notification.isRead ? 'text-gray-300' : 'text-white'}`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {notification.time}
                        </span>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">
                      {notification.description}
                    </p>
                    {notification.action && (
                      <button
                        onClick={notification.action.onClick}
                        className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {notification.action.label}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
