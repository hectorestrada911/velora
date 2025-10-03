'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Bell, Clock, AlertCircle, CheckCircle, Filter, Search, MoreVertical, X, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { notificationService, RealNotification } from '@/lib/notificationService'

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<RealNotification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        await notificationService.loadNotifications()
      } catch (error) {
        console.error('Error loading notifications:', error)
      }
    }

    loadNotifications()

    // Subscribe to notification updates
    const unsubscribe = notificationService.onNotificationsUpdate((newNotifications) => {
      setNotifications(newNotifications)
    })

    return unsubscribe
  }, [])

  const handleNotificationAction = (id: string) => {
    notificationService.markAsRead(id)
  }

  const markAllAsRead = () => {
    notificationService.markAllAsRead()
  }

  const deleteNotification = (id: string) => {
    notificationService.deleteNotification(id)
  }

  const deleteAllNotifications = () => {
    if (confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
      notificationService.deleteAllNotifications()
    }
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
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800/50 rounded-lg"
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
          
          <div className="flex items-center space-x-4">
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Mark all as read
            </button>
            <button
              onClick={deleteAllNotifications}
              className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center space-x-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete all</span>
            </button>
          </div>
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
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-gray-400 hover:text-red-400 transition-colors p-1"
                          title="Delete notification"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">
                      {notification.description}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      {notification.action && (
                        <button
                          onClick={notification.action.onClick}
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {notification.action.label}
                        </button>
                      )}
                      {!notification.isRead && (
                        <button
                          onClick={() => handleNotificationAction(notification.id)}
                          className="text-sm text-green-400 hover:text-green-300 transition-colors flex items-center space-x-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Mark as read</span>
                        </button>
                      )}
                    </div>
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
