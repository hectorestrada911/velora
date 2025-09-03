'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Play, Square, Clock, Save, Edit, Tag, Bell, Type, Keyboard, Calendar, CheckCircle, AlertCircle, Brain, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { analyzeContent, AnalyzedContent } from '@/lib/smartAnalyzer'
import { calendarService } from '@/lib/calendarService'

interface TranscriptionResult {
  text: string
  language: string
  confidence: number
}

interface ParsedContent {
  reminders: Array<{
    dueAt: string
    summary: string
  }>
  tags: string[]
  entities: {
    people: string[]
    topics: string[]
  }
}

export function VoiceRecorder() {
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice')
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null)
  const [parsedContent, setParsedContent] = useState<ParsedContent | null>(null)
  const [analyzedContent, setAnalyzedContent] = useState<AnalyzedContent | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [textInput, setTextInput] = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Timer effect
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording, isPaused])

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
        setIsRecording(false)
        setIsPaused(false)
        setRecordingTime(0)
        
        // Auto-start transcription
        handleTranscription(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      toast.success('Recording started')
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Failed to start recording. Please check microphone permissions.')
    }
  }, [])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [isRecording])

  // Handle mouse/touch events for press and hold
  const handleMouseDown = useCallback(() => {
    if (!isRecording) {
      startRecording()
    }
  }, [isRecording, startRecording])

  const handleMouseUp = useCallback(() => {
    if (isRecording) {
      stopRecording()
    }
  }, [isRecording, stopRecording])

  const handleMouseLeave = useCallback(() => {
    if (isRecording) {
      stopRecording()
    }
  }, [isRecording, stopRecording])

  // Pause/Resume recording
  const togglePause = useCallback(() => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
        toast.success('Recording resumed')
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
        toast.success('Recording paused')
      }
    }
  }, [isPaused])

  // Handle text input submission
  const handleTextSubmit = async () => {
    if (!textInput.trim()) {
      toast.error('Please enter some text before submitting')
      return
    }

    setIsTranscribing(true)
    try {
      // Simulate API call for text processing
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockTranscription: TranscriptionResult = {
        text: textInput,
        language: "en",
        confidence: 1.0
      }
      
      setTranscription(mockTranscription)
      setEditedText(textInput)
      
      // Use AI analysis to understand the content
      const analyzed = await analyzeWithAI(textInput)
      setAnalyzedContent(analyzed)
      
      // Convert to legacy format for backward compatibility
      const mockParsed: ParsedContent = {
        reminders: analyzed.reminder ? [{
          dueAt: analyzed.reminder.dueDate.toISOString(),
          summary: analyzed.reminder.title
        }] : [],
        tags: analyzed.suggestedTags,
        entities: {
          people: analyzed.extractedData.people || [],
          topics: analyzed.extractedData.topics || []
        }
      }
      
      setParsedContent(mockParsed)
      setShowSuggestions(true)
      setTextInput('')
      
      toast.success('Text processed successfully!')
    } catch (error) {
      console.error('Text processing error:', error)
      toast.error('Failed to process text. Please try again.')
    } finally {
      setIsTranscribing(false)
    }
  }

  // Handle transcription
  const handleTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true)
    try {
      // Simulate API call - replace with actual transcription endpoint
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockTranscription: TranscriptionResult = {
        text: "This is a sample transcription. Remember to call John tomorrow at 3pm about the project deadline. This is high priority and I need to follow up next week.",
        language: "en",
        confidence: 0.95
      }
      
      setTranscription(mockTranscription)
      setEditedText(mockTranscription.text)
      
      // Use AI analysis to understand the content
      const analyzed = await analyzeWithAI(mockTranscription.text)
      setAnalyzedContent(analyzed)
      
      // Convert to legacy format for backward compatibility
      const mockParsed: ParsedContent = {
        reminders: analyzed.reminder ? [{
          dueAt: analyzed.reminder.dueDate.toISOString(),
          summary: analyzed.reminder.title
        }] : [],
        tags: analyzed.suggestedTags,
        entities: {
          people: analyzed.extractedData.people || [],
          topics: analyzed.extractedData.topics || []
        }
      }
      
      setParsedContent(mockParsed)
      setShowSuggestions(true)
      
      toast.success('Transcription complete!')
    } catch (error) {
      console.error('Transcription error:', error)
      toast.error('Transcription failed. Please try again.')
    } finally {
      setIsTranscribing(false)
    }
  }

  // Save note
  const handleSave = async () => {
    if (!editedText.trim()) {
      toast.error('Please enter some text before saving')
      return
    }

    try {
      // Simulate API call - replace with actual save endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Note saved successfully!')
      setTranscription(null)
      setParsedContent(null)
      setEditedText('')
      setShowSuggestions(false)
      setAudioBlob(null)
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save note. Please try again.')
    }
  }



  // Handle follow-up questions
  const handleFollowUpQuestion = (question: string) => {
    // TODO: Implement follow-up question handling
    console.log('Follow-up question:', question)
    toast.success(`Processing: ${question}`)
    
    // For now, just add it to the text input for the user to respond
    setTextInput(question)
    setInputMode('text')
  }

  // Handle adding to calendar
  const handleAddToCalendar = async () => {
    if (!analyzedContent?.calendarEvent || !analyzedContent.calendarEvent.startTime || !analyzedContent.calendarEvent.endTime) {
      toast.error('No valid calendar event found to add')
      return
    }

    try {
      const success = await calendarService.addToGoogleCalendar({
        title: analyzedContent.calendarEvent.title,
        startTime: analyzedContent.calendarEvent.startTime,
        endTime: analyzedContent.calendarEvent.endTime,
        description: analyzedContent.calendarEvent.description
      })

      if (success) {
        toast.success('Added to Google Calendar!')
      } else {
        toast.error('Failed to add to calendar')
      }
    } catch (error) {
      console.error('Calendar error:', error)
      toast.error('Failed to add to calendar')
    }
  }

  // Handle creating reminder
  const handleCreateReminder = async () => {
    if (!analyzedContent?.reminder || !analyzedContent.reminder.dueDate) {
      toast.error('No valid reminder found to create')
      return
    }

    try {
      const success = await calendarService.createReminder({
        title: analyzedContent.reminder.title,
        dueDate: analyzedContent.reminder.dueDate,
        priority: analyzedContent.priority,
        description: analyzedContent.reminder.description
      })

      if (success) {
        toast.success('Reminder created successfully!')
      } else {
        toast.error('Failed to create reminder')
      }
    } catch (error) {
      console.error('Reminder error:', error)
      toast.error('Failed to create reminder')
    }
  }

  // Auto-create calendar event and reminder with user confirmation
  const handleAutoCreate = async () => {
    if (!analyzedContent) return

    const confirmMessage = `I can automatically create:
• Calendar event: ${analyzedContent.calendarEvent?.title || 'N/A'}
• Reminder: ${analyzedContent.reminder?.title || 'N/A'}

Would you like me to create these now?`

    if (window.confirm(confirmMessage)) {
      let successCount = 0
      
      // Try to add to calendar
      if (analyzedContent.calendarEvent && analyzedContent.calendarEvent.startTime && analyzedContent.calendarEvent.endTime) {
        try {
          const calendarSuccess = await calendarService.addToGoogleCalendar({
            title: analyzedContent.calendarEvent.title,
            startTime: analyzedContent.calendarEvent.startTime,
            endTime: analyzedContent.calendarEvent.endTime,
            description: analyzedContent.calendarEvent.description
          })
          if (calendarSuccess) successCount++
        } catch (error) {
          console.error('Calendar error:', error)
        }
      }

      // Try to create reminder
      if (analyzedContent.reminder && analyzedContent.reminder.dueDate) {
        try {
          const reminderSuccess = await calendarService.createReminder({
            title: analyzedContent.reminder.title,
            dueDate: analyzedContent.reminder.dueDate,
            priority: analyzedContent.priority,
            description: analyzedContent.reminder.description
          })
          if (reminderSuccess) successCount++
        } catch (error) {
          console.error('Reminder error:', error)
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully created ${successCount} item(s)!`)
      } else {
        toast.error('Failed to create items')
      }
    }
  }

  // Call backend AI analysis
  const analyzeWithAI = async (content: string) => {
    try {
      // Use environment variable for API URL, fallback to relative path
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/analyze';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('AI analysis failed');
      }

      return await response.json();
    } catch (error) {
      console.error('AI analysis error:', error);
      // Fallback to local analysis
      return analyzeContent(content);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Input Mode Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-background-elevated rounded-xl p-1 border border-gray-700">
          <button
            onClick={() => setInputMode('voice')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              inputMode === 'voice'
                ? 'bg-gradient-to-r from-electric-600 to-electric-500 text-white shadow-glow'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Mic className="w-4 h-4 inline mr-2" />
            Voice
          </button>
          <button
            onClick={() => setInputMode('text')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              inputMode === 'text'
                ? 'bg-gradient-to-r from-electric-600 to-electric-500 text-white shadow-glow'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Type className="w-4 h-4 inline mr-2" />
            Text
          </button>
        </div>
      </div>

      {/* Input Interface */}
      <div className="card-glow text-center">
        <AnimatePresence mode="wait">
          {!transcription ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              {inputMode === 'voice' ? (
                <>
                  {/* Voice Recording Interface - Press & Hold */}
                  <div className="flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onMouseDown={handleMouseDown}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseLeave}
                      onTouchStart={handleMouseDown}
                      onTouchEnd={handleMouseUp}
                      className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isRecording 
                          ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30 animate-pulse' 
                          : 'bg-gradient-to-br from-electric-600 to-electric-500 hover:from-electric-700 hover:to-electric-600 shadow-glow hover:shadow-glow-accent'
                      }`}
                    >
                      {isRecording ? (
                        <div className="relative">
                          <div className="absolute inset-0 w-8 h-8 bg-white rounded-full animate-ping opacity-75"></div>
                          <Mic className="w-8 h-8 text-white relative z-10" />
                        </div>
                      ) : (
                        <Mic className="w-8 h-8 text-white" />
                      )}
                    </motion.button>
                  </div>

                  {/* Recording Status */}
                  {isRecording && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-center space-x-2 text-gray-300">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">Recording</span>
                        <Clock className="w-4 h-4" />
                        <span className="font-mono">{formatTime(recordingTime)}</span>
                      </div>
                      
                      <div className="flex justify-center space-x-3">
                        <button
                          onClick={togglePause}
                          className="px-4 py-2 rounded-lg bg-background-elevated hover:bg-background-tertiary text-gray-300 transition-colors duration-200 border border-gray-700"
                        >
                          {isPaused ? 'Resume' : 'Pause'}
                        </button>
                        <button
                          onClick={stopRecording}
                          className="px-4 py-2 rounded-lg bg-red-900/20 hover:bg-red-900/30 text-red-400 transition-colors duration-200 border border-red-700/50"
                        >
                          Stop
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Voice Instructions */}
                  {!isRecording && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-gray-300 text-lg"
                    >
                      {isTranscribing ? 'Processing your voice...' : 'Speak what you need to remember. We\'ll never let you forget it.'}
                    </motion.p>
                  )}
                </>
              ) : (
                <>
                                           {/* Text Input Interface */}
                         <div className="text-center">
                           <div className="w-16 h-16 bg-gradient-to-br from-accent-600 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
                             <Keyboard className="w-8 h-8 text-white" />
                           </div>

                           <div className="space-y-4">
                             <textarea
                               value={textInput}
                               onChange={(e) => setTextInput(e.target.value)}
                               placeholder="Don't let this thought disappear. Type it here and we'll remember it forever..."
                               className="input-field min-h-[120px] resize-none"
                               disabled={isTranscribing}
                             />
                      
                      <button
                        onClick={handleTextSubmit}
                        disabled={!textInput.trim() || isTranscribing}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isTranscribing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Type className="w-4 h-4 mr-2" />
                            Process Text
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Transcription Loading */}
              {isTranscribing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center space-x-3 text-electric-400"
                >
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-electric-400"></div>
                  <span>{inputMode === 'voice' ? 'Transcribing...' : 'Processing...'}</span>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="transcription"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 text-left"
            >
              {/* Transcription Text */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Note
                </label>
                {isEditing ? (
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="input-field min-h-[120px] resize-none"
                    placeholder="Edit your note..."
                  />
                ) : (
                  <div className="p-4 bg-background-elevated rounded-xl border border-gray-700 min-h-[120px]">
                    <p className="text-gray-200 whitespace-pre-wrap">{editedText}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-background-elevated hover:bg-background-tertiary text-gray-300 transition-colors duration-200 border border-gray-700"
                >
                  <Edit className="w-4 h-4" />
                  <span>{isEditing ? 'Done' : 'Edit'}</span>
                </button>
                
                <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-background-elevated hover:bg-background-tertiary text-gray-300 transition-colors duration-200 border border-gray-700">
                  <Tag className="w-4 h-4" />
                  <span>Add Tags</span>
                </button>

                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-electric-600 to-electric-500 hover:from-electric-700 hover:to-electric-600 text-white transition-colors duration-200 shadow-glow"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Note</span>
                </button>
              </div>

              {/* Smart AI Analysis */}
              {showSuggestions && analyzedContent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-background-elevated rounded-xl border border-gray-700"
                >
                  <h4 className="text-lg font-semibold text-gray-100 mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 text-electric-400 mr-2" />
                    AI Analysis
                  </h4>
                  
                  {/* Content Type & Priority */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-background-tertiary rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-300">Type</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          analyzedContent.type === 'task' ? 'bg-blue-600/20 text-blue-400' :
                          analyzedContent.type === 'reminder' ? 'bg-yellow-600/20 text-yellow-400' :
                          analyzedContent.type === 'meeting' ? 'bg-purple-600/20 text-purple-400' :
                          analyzedContent.type === 'idea' ? 'bg-green-600/20 text-green-400' :
                          'bg-gray-600/20 text-gray-400'
                        }`}>
                          {analyzedContent.type.charAt(0).toUpperCase() + analyzedContent.type.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-200 text-sm">{analyzedContent.summary}</p>
                    </div>
                    
                    <div className="p-3 bg-background-tertiary rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-300">Priority</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          analyzedContent.priority === 'urgent' ? 'bg-red-600/20 text-red-400' :
                          analyzedContent.priority === 'high' ? 'bg-orange-600/20 text-orange-400' :
                          analyzedContent.priority === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                          'bg-green-600/20 text-green-400'
                        }`}>
                          {analyzedContent.priority.charAt(0).toUpperCase() + analyzedContent.priority.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-200 text-sm">Confidence: {Math.round(analyzedContent.confidence * 100)}%</p>
                    </div>
                  </div>
                  
                  {/* Calendar Event */}
                  {analyzedContent.calendarEvent && (
                    <div className="mb-4 p-3 bg-background-tertiary rounded-lg border-l-4 border-electric-500">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-medium text-gray-300 flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Calendar Event
                        </h5>
                        <button 
                          onClick={handleAddToCalendar}
                          className="px-3 py-1 bg-electric-600 hover:bg-electric-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Add to Calendar
                        </button>
                      </div>
                      <p className="text-gray-200 text-sm mb-1">{analyzedContent.calendarEvent.title}</p>
                      <p className="text-gray-400 text-xs">
                        {analyzedContent.calendarEvent.startTime.toLocaleDateString()} at {analyzedContent.calendarEvent.startTime.toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                  
                  {/* Reminder */}
                  {analyzedContent.reminder && (
                    <div className="mb-4 p-3 bg-background-tertiary rounded-lg border-l-4 border-yellow-500">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-medium text-gray-300 flex items-center">
                          <Bell className="w-4 h-4 mr-2" />
                          Reminder
                        </h5>
                        <button 
                          onClick={handleCreateReminder}
                          className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Create Reminder
                        </button>
                      </div>
                      <p className="text-gray-200 text-sm mb-1">{analyzedContent.reminder.title}</p>
                      <p className="text-gray-400 text-xs">
                        Due: {analyzedContent.reminder.dueDate.toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  
                  {/* Extracted Data */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {analyzedContent.extractedData.people && analyzedContent.extractedData.people.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-300 mb-2">People</h5>
                        <div className="flex flex-wrap gap-2">
                          {analyzedContent.extractedData.people.map((person, index) => (
                            <span key={index} className="px-2 py-1 bg-accent-600/20 text-accent-400 text-sm rounded-full">
                              {person}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {analyzedContent.suggestedTags.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-300 mb-2">Tags</h5>
                        <div className="flex flex-wrap gap-2">
                          {analyzedContent.suggestedTags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-electric-600/20 text-electric-400 text-sm rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Auto-Create Section */}
                  {(analyzedContent.calendarEvent || analyzedContent.reminder) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-purple-300 flex items-center">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Quick Actions
                        </h5>
                        <button
                          onClick={handleAutoCreate}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm rounded-lg transition-all duration-200 hover:scale-105"
                        >
                          Auto-Create All
                        </button>
                      </div>
                      <p className="text-purple-400 text-xs">
                        I can automatically create your calendar event and reminder. Click the button above to get started!
                      </p>
                    </motion.div>
                  )}

                  {/* AI Response */}
                  {analyzedContent.aiResponse && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <Brain className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-blue-100 text-sm leading-relaxed">
                            {analyzedContent.aiResponse}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Follow-up Questions */}
                  {analyzedContent.followUpQuestions && analyzedContent.followUpQuestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-t border-gray-700 pt-4"
                    >
                      <h5 className="text-sm font-medium text-gray-300 mb-3">Would you like me to:</h5>
                      <div className="space-y-2">
                        {analyzedContent.followUpQuestions.map((question, index) => (
                          <button
                            key={index}
                            onClick={() => handleFollowUpQuestion(question)}
                            className="w-full text-left p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-700 hover:border-blue-500/30 transition-all duration-200 text-sm text-gray-200 hover:text-blue-100"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
