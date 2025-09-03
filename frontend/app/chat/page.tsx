'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, MicOff, Calendar, Bell, Settings, Plus, Sparkles, Brain, Clock, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { calendarService } from '@/lib/calendarService'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  analysis?: any
}

interface Suggestion {
  id: string
  text: string
  icon: React.ReactNode
  category: 'productivity' | 'reminder' | 'calendar' | 'general'
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const suggestions: Suggestion[] = [
    {
      id: '1',
      text: 'Schedule a meeting tomorrow at 3pm',
      icon: <Calendar className="w-4 h-4" />,
      category: 'calendar'
    },
    {
      id: '2',
      text: 'Remind me to call John about the project',
      icon: <Bell className="w-4 h-4" />,
      category: 'reminder'
    },
    {
      id: '3',
      text: 'I need to finish the Q4 report by Friday',
      icon: <CheckCircle className="w-4 h-4" />,
      category: 'productivity'
    },
    {
      id: '4',
      text: 'Brainstorm ideas for the new marketing campaign',
      icon: <Brain className="w-4 h-4" />,
      category: 'general'
    }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setInputValue(suggestion.text)
    setShowSuggestions(false)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setShowSuggestions(false)

    try {
      // Simulate AI response and analysis
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `I've analyzed your request: "${inputValue}" and created the necessary items.`,
        timestamp: new Date(),
        analysis: {
          type: 'task',
          priority: 'medium',
          summary: inputValue,
          calendarEvent: {
            title: inputValue,
            startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hour later
            description: inputValue
          },
          reminder: {
            title: inputValue,
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            description: inputValue
          }
        }
      }

      setMessages(prev => [...prev, aiMessage])
      
      // Auto-create calendar event and reminder
      await autoCreateFromMessage(aiMessage.analysis)
      
    } catch (error) {
      console.error('Error processing message:', error)
      toast.error('Failed to process message')
    } finally {
      setIsLoading(false)
    }
  }

  const autoCreateFromMessage = async (analysis: any) => {
    if (!analysis) return

    let createdItems: Array<{ type: 'calendar' | 'reminder'; data: any }> = []
    
    // Try to add to calendar
    if (analysis.calendarEvent) {
      try {
        const calendarSuccess = await calendarService.addToGoogleCalendar({
          title: analysis.calendarEvent.title,
          startTime: analysis.calendarEvent.startTime,
          endTime: analysis.calendarEvent.endTime,
          description: analysis.calendarEvent.description
        })
        if (calendarSuccess) {
          createdItems.push({
            type: 'calendar',
            data: analysis.calendarEvent
          })
        }
      } catch (error) {
        console.error('Calendar error:', error)
      }
    }

    // Try to create reminder
    if (analysis.reminder) {
      try {
        const reminderSuccess = await calendarService.createReminder({
          title: analysis.reminder.title,
          dueDate: analysis.reminder.dueDate,
          priority: analysis.priority || 'medium',
          description: analysis.reminder.description
        })
        if (reminderSuccess) {
          createdItems.push({
            type: 'reminder',
            data: analysis.reminder
          })
        }
      } catch (error) {
        console.error('Reminder error:', error)
      }
    }

    // Show success message
    if (createdItems.length > 0) {
      const itemTypes = createdItems.map(item => item.type === 'calendar' ? 'calendar event' : 'reminder')
      toast.success(`✅ Created ${itemTypes.join(' and ')} automatically!`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-tertiary">
      {/* Header */}
      <header className="bg-background-elevated/50 backdrop-blur-sm border-b border-gray-700/50 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-electric-400 via-purple-400 to-electric-500 bg-clip-text text-transparent">Velora</h1>
            <div className="flex items-center space-x-2 text-sm bg-gradient-to-r from-electric-300 via-cyan-300 to-electric-400 bg-clip-text text-transparent">
              <Brain className="w-4 h-4" />
              <span>AI Assistant</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.location.href = '/calendar'}
              className="p-2 text-gray-400 hover:text-white transition-colors duration-200 hover:bg-background-tertiary rounded-lg"
              title="View Calendar"
            >
              <Calendar className="w-5 h-5" />
            </button>
            <button 
              onClick={() => window.location.href = '/reminders'}
              className="p-2 text-gray-400 hover:text-white transition-colors duration-200 hover:bg-background-tertiary rounded-lg"
              title="View Reminders"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors duration-200 hover:bg-background-tertiary rounded-lg">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        {/* Suggestions */}
        {showSuggestions && messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-electric-400 mb-4 text-center">
              What would you like me to help you with today?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.map((suggestion) => (
                <motion.button
                  key={suggestion.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="p-4 bg-background-elevated rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-electric-600 via-purple-600 to-electric-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200">
                      {suggestion.icon}
                    </div>
                    <div>
                      <p className="text-electric-300 font-medium">{suggestion.text}</p>
                      <p className="text-gray-400 text-sm capitalize">{suggestion.category}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Chat Messages */}
        <div className="space-y-6 mb-6">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl p-4 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-electric-600 text-white'
                    : 'bg-background-elevated text-gray-200 border border-gray-700'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                {message.analysis && (
                  <div className="mt-3 pt-3 border-t border-gray-600/30">
                    <div className="flex items-center space-x-2 text-xs text-electric-300 mb-2">
                      <Sparkles className="w-3 h-3" />
                      <span>AI Analysis</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                          {message.analysis.type}
                        </span>
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                          {message.analysis.priority}
                        </span>
                      </div>
                      {message.analysis.calendarEvent && (
                        <div className="flex items-center space-x-2 text-xs text-green-400">
                          <Calendar className="w-3 h-3" />
                          <span>Added to calendar</span>
                        </div>
                      )}
                      {message.analysis.reminder && (
                        <div className="flex items-center space-x-2 text-xs text-orange-400">
                          <Bell className="w-3 h-3" />
                          <span>Reminder created</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mt-2 text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-background-elevated border border-gray-700 rounded-2xl p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-electric-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-electric-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-electric-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="fixed bottom-0 left-0 right-0 bg-background-elevated/80 backdrop-blur-sm border-t border-gray-700/50 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end space-x-4">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tell me what you need to remember, schedule, or organize..."
                  className="w-full bg-background-tertiary border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200 resize-none"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-background-tertiary hover:bg-background-secondary text-gray-400 hover:text-white border border-gray-600'
                  }`}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="p-3 bg-gradient-to-r from-electric-600 via-purple-600 to-electric-500 hover:from-electric-700 hover:via-purple-700 hover:to-electric-600 text-white rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
