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

  const handleFollowUpQuestion = (question: string) => {
    setInputValue(question)
    // Automatically send the follow-up question
    setTimeout(() => {
      handleSendMessage()
    }, 100)
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
      // Call real AI backend
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: inputValue }),
      })

      if (!response.ok) {
        throw new Error('AI analysis failed')
      }

      const analysis = await response.json()
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: analysis.aiResponse || `I've analyzed your request: "${inputValue}"`,
        timestamp: new Date(),
        analysis: analysis
      }

      setMessages(prev => [...prev, aiMessage])
      
      // Auto-create calendar event and reminder if AI suggests them
      if (analysis.calendarEvent || analysis.reminder) {
        await autoCreateFromMessage(analysis)
      }
      
    } catch (error) {
      console.error('Error processing message:', error)
      
      // Fallback message if AI fails
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm having trouble processing that right now, but I've saved your message. Can you try rephrasing?",
        timestamp: new Date(),
        analysis: {
          type: 'note',
          priority: 'medium',
          summary: inputValue,
          calendarEvent: null,
          reminder: null
        }
      }
      
      setMessages(prev => [...prev, fallbackMessage])
      toast.error('AI processing failed, please try again')
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
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 p-3 md:p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-electric-400 via-purple-400 to-electric-500 bg-clip-text text-transparent">Velora</h1>
            <div className="hidden md:flex items-center space-x-2 text-sm bg-gradient-to-r from-electric-300 via-cyan-300 to-electric-400 bg-clip-text text-transparent">
              <Brain className="w-4 h-4" />
              <span>AI Assistant</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <button 
              onClick={() => window.location.href = '/calendar'}
              className="p-2 md:p-2 text-gray-400 hover:text-white transition-colors duration-200 hover:bg-gray-800 rounded-lg"
              title="View Calendar"
            >
              <Calendar className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button 
              onClick={() => window.location.href = '/reminders'}
              className="p-2 md:p-2 text-gray-400 hover:text-white transition-colors duration-200 hover:bg-gray-800 rounded-lg"
              title="View Reminders"
            >
              <Bell className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button className="p-2 md:p-2 text-gray-400 hover:text-white transition-colors duration-200 hover:bg-gray-800 rounded-lg">
              <Settings className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-3 md:p-4">
        {/* Suggestions */}
        {showSuggestions && messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8"
          >
            <h2 className="text-lg md:text-xl font-semibold text-electric-400 mb-4 text-center">
              What would you like me to help you with today?
            </h2>
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              {suggestions.map((suggestion) => (
                <motion.button
                  key={suggestion.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="p-3 md:p-4 bg-gray-900 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-electric-600 via-purple-600 to-electric-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200">
                      {suggestion.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-electric-300 font-medium text-sm md:text-base">{suggestion.text}</p>
                      <p className="text-gray-400 text-xs md:text-sm capitalize">{suggestion.category}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Chat Messages */}
        <div className="space-y-4 md:space-y-6 mb-20 md:mb-6">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] md:max-w-3xl p-3 md:p-4 rounded-xl md:rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-electric-600 text-white'
                    : 'bg-gray-900 text-gray-200 border border-gray-700'
                }`}
              >
                <p className="text-sm md:text-base leading-relaxed">{message.content}</p>
                
                {message.analysis && (
                  <div className="mt-3 pt-3 border-t border-gray-600/30">
                    <div className="flex items-center space-x-2 text-xs text-electric-300 mb-2">
                      <Sparkles className="w-3 h-3" />
                      <span>AI Analysis</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
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
                    
                    {/* Follow-up Questions */}
                    {message.analysis.followUpQuestions && message.analysis.followUpQuestions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-600/30">
                        <p className="text-xs text-gray-400 mb-2">Follow-up questions:</p>
                        <div className="space-y-2">
                          {message.analysis.followUpQuestions.map((question: string, index: number) => (
                            <button
                              key={index}
                              onClick={() => handleFollowUpQuestion(question)}
                              className="block w-full text-left text-xs text-electric-300 hover:text-electric-400 p-2 rounded-lg hover:bg-electric-500/10 transition-colors duration-200"
                            >
                              {question}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
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
              <div className="bg-gray-900 border border-gray-700 rounded-xl md:rounded-2xl p-3 md:p-4">
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
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700/50 p-3 md:p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end space-x-3 md:space-x-4">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tell me what you need to remember, schedule, or organize..."
                  className="w-full bg-gray-800 border border-gray-600 rounded-xl px-3 md:px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200 resize-none text-sm md:text-base"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-2.5 md:p-3 rounded-xl transition-all duration-200 ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-600'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4 md:w-5 md:h-5" /> : <Mic className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="p-2.5 md:p-3 bg-gradient-to-r from-electric-600 via-purple-600 to-electric-500 hover:from-electric-700 hover:via-purple-700 hover:to-electric-600 text-white rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Send className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
