'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, MicOff, Calendar, Bell, Settings, Plus, Sparkles, Brain, Clock, CheckCircle, History, Trash2, Upload, FileText, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { calendarService } from '@/lib/calendarService'
import VoiceCommand from '@/components/VoiceCommand'
import { VoiceResult } from '@/lib/voiceService'
import { conversationService, Message, Conversation } from '@/lib/conversationService'
import { useAuth } from '@/components/providers/AuthProvider'
import { storageService } from '@/lib/storageService'
import { documentService, Document } from '@/lib/documentService'
import { voiceService } from '@/lib/voiceService'
import { crossReferenceService, SmartSuggestion, CrossReference } from '@/lib/crossReferenceService'
import SmartSuggestions from '@/components/SmartSuggestions'


interface Suggestion {
  id: string
  text: string
  icon: React.ReactNode
  category: 'productivity' | 'reminder' | 'calendar' | 'general' | 'voice'
}

export default function ChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [showVoiceCommands, setShowVoiceCommands] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [showConversationHistory, setShowConversationHistory] = useState(false)
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isVoiceListening, setIsVoiceListening] = useState(false)
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false)
  const [currentVoiceTranscript, setCurrentVoiceTranscript] = useState('')
  const [showVoiceInstructions, setShowVoiceInstructions] = useState(false)
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const voiceExamples = [
    "Schedule a meeting tomorrow at 3pm",
    "Remind me to call John about the project",
    "Help me organize my tasks for this week",
    "Set up a reminder for my dentist appointment",
    "What's on my calendar for Friday?",
    "Create a to-do list for the weekend"
  ]

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
    },
    {
      id: '5',
      text: 'Click the microphone button below to use voice input',
      icon: <Mic className="w-4 h-4" />,
      category: 'voice'
    },
    {
      id: '6',
      text: 'Upload my resume and help me analyze it',
      icon: <FileText className="w-4 h-4" />,
      category: 'general'
    },
    {
      id: '7',
      text: 'Find my resume in my uploaded documents',
      icon: <FileText className="w-4 h-4" />,
      category: 'general'
    }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize cross-reference service with sample data
  useEffect(() => {
    // Add some sample data to demonstrate cross-references
    crossReferenceService.addCrossReference(
      'calendar',
      'Meeting with John about Q4 Budget',
      'Discussing the Q4 budget planning with John Smith tomorrow at 3pm'
    )
    
    crossReferenceService.addCrossReference(
      'reminder',
      'Follow up with Sarah',
      'Call Sarah about the marketing campaign project'
    )
    
    crossReferenceService.addCrossReference(
      'document',
      'Q4 Budget Report',
      'Comprehensive budget analysis for Q4 including marketing expenses and project costs'
    )
    
    crossReferenceService.addCrossReference(
      'conversation',
      'Previous discussion about marketing',
      'We talked about the new marketing campaign and budget allocation last week'
    )
  }, [])

  // Load conversations and documents when user is authenticated
  useEffect(() => {
    if (user) {
      conversationService.setUserId(user.uid)
      documentService.setUserId(user.uid)
      loadConversations()
      loadDocuments()
    }
  }, [user])

  // Rotate voice examples when voice is listening
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isVoiceListening) {
      interval = setInterval(() => {
        setCurrentExampleIndex((prev) => (prev + 1) % voiceExamples.length)
      }, 3000) // Change every 3 seconds
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isVoiceListening, voiceExamples.length])

  const loadConversations = async () => {
    if (!user) return
    
    setIsLoadingConversations(true)
    try {
      const loadedConversations = await conversationService.getConversations()
      setConversations(loadedConversations)
    } catch (error) {
      console.error('Error loading conversations:', error)
      toast.error('Failed to load conversation history')
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const loadDocuments = async () => {
    if (!user) return
    
    try {
      const loadedDocuments = await documentService.getDocuments()
      setDocuments(loadedDocuments)
    } catch (error) {
      console.error('Error loading documents:', error)
      toast.error('Failed to load documents')
    }
  }

  const saveConversation = async (messagesToSave: Message[]) => {
    if (!user || messagesToSave.length === 0) return

    try {
      const conversationId = await conversationService.saveCurrentConversation(
        messagesToSave, 
        currentConversationId || undefined
      )
      setCurrentConversationId(conversationId)
      
      // Refresh conversations list
      await loadConversations()
    } catch (error) {
      console.error('Error saving conversation:', error)
      toast.error('Failed to save conversation')
    }
  }

  const loadConversation = async (conversationId: string) => {
    try {
      const conversation = await conversationService.getConversation(conversationId)
      if (conversation) {
        setMessages(conversation.messages)
        setCurrentConversationId(conversationId)
        setShowSuggestions(false)
        setShowConversationHistory(false)
        toast.success('Conversation loaded')
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
      toast.error('Failed to load conversation')
    }
  }

  const startNewConversation = () => {
    setMessages([])
    setCurrentConversationId(null)
    setShowSuggestions(true)
    setShowConversationHistory(false)
    toast.success('Started new conversation')
  }

  const deleteConversation = async (conversationId: string) => {
    try {
      await conversationService.deleteConversation(conversationId)
      await loadConversations()
      
      if (currentConversationId === conversationId) {
        startNewConversation()
      }
      
      toast.success('Conversation deleted')
    } catch (error) {
      console.error('Error deleting conversation:', error)
      toast.error('Failed to delete conversation')
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setIsUploading(true)
    
    try {
      // Read file content for analysis
      const content = await readFileContent(file)
      
      // Upload to Firebase Storage
      const storedFile = await storageService.uploadFile(file, content)
      
      // Save document metadata to Firestore
      const documentId = await documentService.saveDocument(storedFile, content)
      
      // Reload documents list
      await loadDocuments()
      
      // Create a message about the uploaded file
      const fileMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: `I uploaded a file: ${file.name}`,
        timestamp: new Date()
      }
      
      setMessages(prev => {
        const newMessages = [...prev, fileMessage]
        saveConversation(newMessages)
        return newMessages
      })
      
      // AI response about the file
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `I've saved your file "${file.name}" permanently! I can help you analyze it, search for it later, or answer questions about its content. What would you like me to do with it?`,
        timestamp: new Date(),
        analysis: {
          type: 'file_upload',
          priority: 'medium',
          summary: `File uploaded: ${file.name}`,
          fileName: file.name,
          fileContent: content.substring(0, 200) + '...',
          documentId: documentId
        }
      }
      
      setMessages(prev => {
        const newMessages = [...prev, aiMessage]
        saveConversation(newMessages)
        return newMessages
      })
      
      toast.success(`File "${file.name}" uploaded and saved permanently!`)
      
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Failed to upload file')
    } finally {
      setIsUploading(false)
    }
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve(e.target?.result as string || '')
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  const searchDocuments = async (query: string) => {
    try {
      const matchingDocuments = await documentService.searchDocuments(query)
      
      if (matchingDocuments.length > 0) {
        const searchMessage: Message = {
          id: Date.now().toString(),
          type: 'ai',
          content: `I found ${matchingDocuments.length} document(s) matching "${query}":\n\n${matchingDocuments.map(d => `• ${d.name} (${d.category || 'general'})`).join('\n')}\n\nYou can ask me to analyze any of these documents!`,
          timestamp: new Date(),
          analysis: {
            type: 'document_search',
            priority: 'medium',
            summary: `Found ${matchingDocuments.length} documents`,
            searchResults: matchingDocuments
          }
        }
        
        setMessages(prev => {
          const newMessages = [...prev, searchMessage]
          saveConversation(newMessages)
          return newMessages
        })
      } else {
        const noResultsMessage: Message = {
          id: Date.now().toString(),
          type: 'ai',
          content: `I couldn't find any documents matching "${query}". Try uploading some files first using the upload button!`,
          timestamp: new Date()
        }
        
        setMessages(prev => {
          const newMessages = [...prev, noResultsMessage]
          saveConversation(newMessages)
          return newMessages
        })
      }
    } catch (error) {
      console.error('Error searching documents:', error)
      toast.error('Failed to search documents')
    }
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.category === 'voice') {
      window.location.href = '/voice'
    } else {
      setInputValue(suggestion.text)
      setShowSuggestions(false)
      setHasUserInteracted(true)
    }
  }

  const handleFollowUpQuestion = (question: string) => {
    setInputValue(question)
    // Automatically send the follow-up question
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }

  const handleVoiceResult = (result: VoiceResult) => {
    if (result.success) {
      // Add a system message showing the voice command result
      const voiceMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: result.message,
        timestamp: new Date(),
        analysis: {
          type: 'voice_command',
          priority: 'medium',
          summary: 'Voice command executed successfully'
        }
      }
      setMessages(prev => [...prev, voiceMessage])
    }
  }

  const handleVoiceTranscript = (transcript: string) => {
    setCurrentTranscript(transcript)
  }

  const handleVoiceInput = async () => {
    // Check if we're on the client side
    if (typeof window === 'undefined') return
    
    if (isVoiceListening) {
      // Stop listening
      try {
        voiceService.stopListening()
      } catch (error) {
        console.error('Error stopping voice service:', error)
      }
      setIsVoiceListening(false)
      setIsVoiceProcessing(false)
      setCurrentVoiceTranscript('')
    } else {
      // Start listening directly
      try {
        if (!voiceService || !voiceService.isSupported()) {
          toast.error('Voice recognition not supported in this browser')
          return
        }

        setIsVoiceListening(true)
        setCurrentVoiceTranscript('')

        const success = await voiceService.startListening(
          (result: VoiceResult) => {
            setIsVoiceListening(false)
            setIsVoiceProcessing(false)
            
            if (result.success) {
              // Use the current transcript for the message
              const transcriptText = currentVoiceTranscript || 'Voice command executed'
              
              // Add the voice input as a user message
              const userMessage: Message = {
                id: Date.now().toString(),
                type: 'user',
                content: transcriptText,
                timestamp: new Date()
              }

              setMessages(prev => {
                const newMessages = [...prev, userMessage]
                saveConversation(newMessages)
                return newMessages
              })

              // Process the voice command
              handleSendMessage()
              toast.success('Voice input processed!')
            } else {
              toast.error(result.message)
            }
          },
          (transcript: string) => {
            setCurrentVoiceTranscript(transcript)
          }
        )

        if (!success) {
          setIsVoiceListening(false)
          toast.error('Failed to start voice recognition')
        }
      } catch (error) {
        console.error('Error with voice service:', error)
        setIsVoiceListening(false)
        toast.error('Voice service error occurred')
      }
    }
  }

  const startVoiceRecording = async () => {
    // Check if we're on the client side
    if (typeof window === 'undefined') return
    
    setShowVoiceInstructions(false)
    
    // Start listening
    try {
      if (!voiceService || !voiceService.isSupported()) {
        toast.error('Voice recognition not supported in this browser')
        return
      }

    setIsVoiceListening(true)
    setCurrentVoiceTranscript('')

    const success = await voiceService.startListening(
      (result: VoiceResult) => {
        setIsVoiceListening(false)
        setIsVoiceProcessing(false)
        
        if (result.success) {
          // Use the current transcript for the message
          const transcriptText = currentVoiceTranscript || 'Voice command executed'
          
          // Add the voice input as a user message
          const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: transcriptText,
            timestamp: new Date()
          }

          setMessages(prev => {
            const newMessages = [...prev, userMessage]
            saveConversation(newMessages)
            return newMessages
          })

          // Set the input value and process the message
          setInputValue(transcriptText)
          setTimeout(() => {
            handleSendMessage()
          }, 100)
          
          setCurrentVoiceTranscript('')
          toast.success('Voice input processed!')
        } else {
          setCurrentVoiceTranscript('')
          toast.error(result.message)
        }
      },
      (transcript: string) => {
        setCurrentVoiceTranscript(transcript)
        // Update the input field with the transcript
        setInputValue(transcript)
      }
    )

      if (success) {
        setIsVoiceProcessing(true)
        toast.success('Listening... Speak now!')
      } else {
        setIsVoiceListening(false)
        toast.error('Failed to start voice recognition')
      }
    } catch (error) {
      console.error('Error with voice service:', error)
      setIsVoiceListening(false)
      toast.error('Voice service error occurred')
    }
  }

  const generateSmartSuggestions = (content: string) => {
    // Add the user message to cross-reference system
    crossReferenceService.addCrossReference('conversation', 'User Message', content)
    
    // Generate smart suggestions
    const suggestions = crossReferenceService.generateSmartSuggestions(content)
    setSmartSuggestions(suggestions)
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
    
    // Generate smart suggestions based on user input
    generateSmartSuggestions(inputValue)
    
    setInputValue('')
    setIsLoading(true)
    setShowSuggestions(false)
    setHasUserInteracted(false)

    try {
      // Call real AI backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://velora-production.up.railway.app/api/analyze'
      console.log('API URL being used:', apiUrl)
      console.log('Environment variable:', process.env.NEXT_PUBLIC_API_URL)
      const response = await fetch(apiUrl, {
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
      
      // Check if user is asking about documents
      const lowerInput = inputValue.toLowerCase()
      if (lowerInput.includes('find') && (lowerInput.includes('resume') || lowerInput.includes('document') || lowerInput.includes('file'))) {
        const searchQuery = inputValue.replace(/find|my|the|a|an|in|documents?|files?/gi, '').trim()
        searchDocuments(searchQuery)
        return
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: analysis.aiResponse || `I've analyzed your request: "${inputValue}"`,
        timestamp: new Date(),
        analysis: analysis
      }

      setMessages(prev => {
        const newMessages = [...prev, aiMessage]
        // Save conversation after each message
        saveConversation(newMessages)
        return newMessages
      })
      
      // Show suggested items as interactive buttons instead of auto-creating
      if (analysis.calendarEvent || analysis.reminder) {
        // Add suggestion buttons to the message
        const suggestionMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: 'I can help you create these items. Would you like me to:',
          timestamp: new Date(),
          analysis: {
            type: 'suggestion',
            priority: 'medium',
            summary: 'Suggested actions',
            calendarEvent: analysis.calendarEvent,
            reminder: analysis.reminder,
            showSuggestions: true
          }
        }
        setMessages(prev => {
          const newMessages = [...prev, suggestionMessage]
          // Save conversation after suggestion message
          saveConversation(newMessages)
          return newMessages
        })
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
      {/* Header - Mobile Optimized */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 p-2 sm:p-3 md:p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-electric-400 via-purple-400 to-electric-500 bg-clip-text text-transparent">Velora</h1>
            <div className="hidden sm:flex items-center gap-1 sm:gap-2 text-xs sm:text-sm bg-gradient-to-r from-electric-300 via-cyan-300 to-electric-400 bg-clip-text text-transparent">
              <Brain className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>AI Assistant</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
            {user && (
              <button 
                onClick={() => setShowConversationHistory(!showConversationHistory)}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-white transition-colors duration-200 hover:bg-gray-800 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center"
                title="Conversation History"
              >
                <History className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
            <button 
              onClick={() => window.location.href = '/calendar'}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-white transition-colors duration-200 hover:bg-gray-800 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center"
              title="View Calendar"
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button 
              onClick={() => window.location.href = '/reminders'}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-white transition-colors duration-200 hover:bg-gray-800 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center"
              title="View Reminders"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button 
              onClick={() => window.location.href = '/demo'}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-white transition-colors duration-200 hover:bg-gray-800 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center"
              title="View Functionality Demo"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button className="p-1.5 sm:p-2 text-gray-400 hover:text-white transition-colors duration-200 hover:bg-gray-800 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-3 md:p-4">
        {/* Conversation History Sidebar */}
        {showConversationHistory && user && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed left-0 top-0 h-full w-80 bg-gray-900 border-r border-gray-700 z-50 overflow-y-auto"
          >
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Conversations</h2>
                <button
                  onClick={startNewConversation}
                  className="p-2 bg-electric-600 hover:bg-electric-700 text-white rounded-lg transition-colors duration-200"
                  title="New Conversation"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              {isLoadingConversations ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-500"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No conversations yet</p>
                  <p className="text-gray-500 text-sm">Start chatting to see your history here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        currentConversationId === conversation.id
                          ? 'bg-electric-600/20 border-electric-500'
                          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div 
                          className="flex-1 min-w-0"
                          onClick={() => loadConversation(conversation.id)}
                        >
                          <h3 className="text-sm font-medium text-white truncate">
                            {conversation.title}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">
                            {conversation.messages.length} messages
                          </p>
                          <p className="text-xs text-gray-500">
                            {conversation.updatedAt.toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteConversation(conversation.id)}
                          className="p-1 text-gray-500 hover:text-red-400 transition-colors duration-200"
                          title="Delete conversation"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Voice Commands */}
        {showVoiceCommands && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 md:mb-8"
          >
            <VoiceCommand
              onVoiceResult={handleVoiceResult}
              onTranscript={handleVoiceTranscript}
            />
          </motion.div>
        )}

        {/* Suggestions */}
        {showSuggestions && messages.length === 0 && !showVoiceCommands && (
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
          
          {/* Smart Suggestions */}
          <SmartSuggestions
            suggestions={smartSuggestions}
            onSuggestionClick={(suggestion) => {
              console.log('Suggestion clicked:', suggestion)
              // Handle suggestion click - could open related content, create reminders, etc.
            }}
            onRelatedItemClick={(item) => {
              console.log('Related item clicked:', item)
              // Handle related item click - could navigate to calendar, reminders, etc.
            }}
          />
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Mobile Optimized */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 border-t border-gray-700/50 p-2 sm:p-3 md:p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end gap-2 sm:gap-3 md:gap-4">
              <div className="flex-1 relative">
                
                <textarea
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value)
                    setHasUserInteracted(true)
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder={isVoiceListening ? "🎤 Voice recording active..." : "Tell me what you need to remember, schedule, or organize..."}
                  className={`w-full bg-gray-800 border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-gray-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200 resize-none text-sm sm:text-base ${
                    isVoiceListening 
                      ? 'border-electric-500 ring-2 ring-electric-500/30 bg-electric-500/5' 
                      : hasUserInteracted && inputValue.trim()
                      ? 'border-electric-500 ring-2 ring-electric-500/30 shadow-lg shadow-electric-500/20'
                      : 'border-gray-600'
                  }`}
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                  disabled={isVoiceListening}
                />
              </div>
              
              <div className="flex items-center gap-1.5 sm:gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.doc,.docx,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-2.5 sm:p-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-600 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] flex items-center justify-center"
                  title={isUploading ? "Uploading..." : "Upload Document"}
                >
                  {isUploading ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
                  ) : (
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
                
                <button
                  onClick={handleVoiceInput}
                  className={`p-2.5 sm:p-3 rounded-xl transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center ${
                    isVoiceListening
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : isVoiceProcessing
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-gradient-to-r from-electric-600 via-purple-600 to-electric-500 hover:from-electric-700 hover:via-purple-700 hover:to-electric-600 text-white border border-electric-500/30'
                  }`}
                  title={isVoiceListening ? "Stop listening" : isVoiceProcessing ? "Processing..." : "Start voice input"}
                >
                  {isVoiceListening ? (
                    <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : isVoiceProcessing ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className={`p-2.5 sm:p-3 bg-gradient-to-r from-electric-600 via-purple-600 to-electric-500 hover:from-electric-700 hover:via-purple-700 hover:to-electric-600 text-white rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-w-[44px] min-h-[44px] flex items-center justify-center ${
                    hasUserInteracted && inputValue.trim() && !isLoading
                      ? 'ring-2 ring-electric-500/50 shadow-lg shadow-electric-500/30'
                      : ''
                  }`}
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Voice Recording Circle with Blurred Background */}
      <AnimatePresence>
        {isVoiceListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none"
          >
            {/* Blurred Background Overlay */}
            <motion.div
              initial={{ backdropFilter: 'blur(0px)' }}
              animate={{ backdropFilter: 'blur(8px)' }}
              exit={{ backdropFilter: 'blur(0px)' }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/20"
            />
            
            {/* Main Content Container */}
            <div className="relative w-full h-full flex flex-col items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative"
              >
                {/* Outer pulsing ring - responsive sizing */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.6, 1],
                    opacity: [0.6, 0.2, 0.6]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-r from-electric-500 to-purple-500 rounded-full blur-lg"
                />
                
                {/* Middle ring - responsive sizing */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0.1, 0.4]
                  }}
                  transition={{ 
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 w-28 h-28 sm:w-36 sm:h-36 bg-gradient-to-r from-purple-500 to-electric-500 rounded-full blur-md"
                />
                
                {/* Main recording circle - responsive sizing */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative w-28 h-28 sm:w-36 sm:h-36 bg-gradient-to-r from-electric-500 via-purple-500 to-electric-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [1, 0.8, 1]
                    }}
                    transition={{ 
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <span className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-electric-600 via-purple-600 to-electric-500 bg-clip-text text-transparent">
                      V
                    </span>
                  </motion.div>
                </motion.div>
              </motion.div>
              
              {/* Instructions Container with Background */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 w-full max-w-sm sm:max-w-md"
              >
                <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 sm:p-6 shadow-xl">
                  <p className="text-white text-lg sm:text-xl font-bold mb-3 text-center">Velora is listening...</p>
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-3 text-center">Speak naturally, I'm capturing your words</p>
                  <motion.p
                    key={currentExampleIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-electric-300 text-xs sm:text-sm font-medium italic leading-relaxed text-center"
                  >
                    Try: "{voiceExamples[currentExampleIndex]}"
                  </motion.p>
                </div>
              </motion.div>

              {/* Live transcript display - mobile optimized */}
              {currentVoiceTranscript && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 w-full max-w-sm sm:max-w-md"
                >
                  <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-xl p-3 sm:p-4 shadow-lg">
                    <p className="text-gray-400 text-xs sm:text-sm font-medium mb-2">Live transcript:</p>
                    <p className="text-white text-sm sm:text-lg leading-relaxed break-words">{currentVoiceTranscript}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Instructions Modal */}
      <AnimatePresence>
        {showVoiceInstructions && (
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
              className="bg-background-elevated rounded-2xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold bg-gradient-to-r from-electric-400 via-purple-400 to-electric-500 bg-clip-text text-transparent">
                  Voice Commands
                </h3>
                <button
                  onClick={() => setShowVoiceInstructions(false)}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* How it works */}
                <div className="p-4 bg-gradient-to-r from-electric-500/10 to-purple-500/10 border border-electric-500/20 rounded-xl">
                  <h4 className="text-lg font-semibold text-electric-400 mb-3 flex items-center">
                    <Mic className="w-5 h-5 mr-2" />
                    How Voice Commands Work
                  </h4>
                  <p className="text-gray-300 leading-relaxed">
                    Simply speak naturally to me! I'll understand your requests and help you create reminders, 
                    schedule events, organize tasks, and more. Just click "Start Recording" below and speak clearly.
                  </p>
                </div>

                {/* Example commands */}
                <div>
                  <h4 className="text-lg font-semibold text-purple-400 mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Try These Voice Commands
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Schedule a meeting tomorrow at 3pm",
                      "Remind me to call John about the project",
                      "I need to finish the Q4 report by Friday",
                      "Set a reminder for my dentist appointment",
                      "Create a task to review the budget",
                      "Plan a team meeting next week"
                    ].map((command, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-800/50 border border-gray-600 rounded-lg hover:border-electric-500/30 transition-colors duration-200"
                      >
                        <p className="text-gray-200 text-sm">"{command}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <h4 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Tips for Best Results
                  </h4>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      Speak clearly and at a normal pace
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      Include specific dates and times when possible
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      Mention people's names for better context
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      Use natural language - no special commands needed
                    </li>
                  </ul>
                </div>

                {/* Action buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={() => setShowVoiceInstructions(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200"
                  >
                    Maybe Later
                  </button>
                  <button
                    onClick={startVoiceRecording}
                    className="flex-1 bg-gradient-to-r from-electric-600 via-purple-600 to-electric-500 hover:from-electric-700 hover:via-purple-700 hover:to-electric-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <Mic className="w-5 h-5" />
                    <span>Start Recording</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
