'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Clock, Calendar, CheckCircle } from 'lucide-react'

interface ProactiveMessage {
  id: string
  type: 'welcome' | 'reminder' | 'suggestion' | 'urgent'
  title: string
  content: string
  actions?: {
    primary: {
      label: string
      onClick: () => void
    }
    secondary?: {
      label: string
      onClick: () => void
    }
  }
  autoHide?: boolean
  duration?: number
}

interface ProactiveMessagesProps {
  onMessageAction?: (action: string) => void
}

export default function ProactiveMessages({ onMessageAction }: ProactiveMessagesProps) {
  const [messages, setMessages] = useState<ProactiveMessage[]>([])
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Check if user is returning (this would be more sophisticated in real app)
    const lastVisit = localStorage.getItem('velora_last_visit')
    const now = Date.now()
    const timeSinceLastVisit = lastVisit ? now - parseInt(lastVisit) : 0
    
    // Show ONLY ONE subtle message if user hasn't visited in 2+ hours
    if (timeSinceLastVisit > 2 * 60 * 60 * 1000 || !lastVisit) {
      const proactiveMessages: ProactiveMessage[] = [
        {
          id: 'welcome-back',
          type: 'welcome',
          title: 'Welcome back! 👋',
          content: 'I have some updates for you. Click the bell to see your notifications.',
          actions: {
            primary: {
              label: 'View notifications',
              onClick: () => handleMessageAction('show-notifications')
            }
          },
          autoHide: true,
          duration: 5000
        }
      ]

      setMessages(proactiveMessages)
    }

    // Update last visit time
    localStorage.setItem('velora_last_visit', now.toString())
  }, [])

  const handleMessageAction = (action: string) => {
    onMessageAction?.(action)
    // Remove the message after action
    setMessages(prev => prev.slice(1))
  }

  const dismissMessage = (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId))
  }

  const dismissAll = () => {
    setMessages([])
    setIsVisible(false)
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'welcome': return <MessageCircle className="w-5 h-5 text-blue-400" />
      case 'reminder': return <Clock className="w-5 h-5 text-orange-400" />
      case 'suggestion': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'urgent': return <Calendar className="w-5 h-5 text-red-400" />
      default: return <MessageCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'welcome': return 'border-blue-500/20 bg-blue-500/5'
      case 'reminder': return 'border-orange-500/20 bg-orange-500/5'
      case 'suggestion': return 'border-green-500/20 bg-green-500/5'
      case 'urgent': return 'border-red-500/20 bg-red-500/5'
      default: return 'border-gray-500/20 bg-gray-500/5'
    }
  }

  if (!isVisible || messages.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-xs">
      <AnimatePresence>
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.1,
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className={`p-3 rounded-md border ${getMessageColor(message.type)} backdrop-blur-sm shadow-lg`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getMessageIcon(message.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-white font-medium text-xs">
                    {message.title}
                  </h4>
                  <button
                    onClick={() => dismissMessage(message.id)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-gray-300 text-xs mb-2">
                  {message.content}
                </p>
                {message.actions && (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleMessageAction(message.actions!.primary.label.toLowerCase().replace(' ', '-'))}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      {message.actions.primary.label}
                    </button>
                    {message.actions.secondary && (
                      <button
                        onClick={() => handleMessageAction(message.actions!.secondary!.label.toLowerCase().replace(' ', '-'))}
                        className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                      >
                        {message.actions.secondary.label}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {messages.length > 1 && (
        <div className="text-center">
          <button
            onClick={dismissAll}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Dismiss all ({messages.length})
          </button>
        </div>
      )}
    </div>
  )
}
