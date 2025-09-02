'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Play, Square, Clock, Save, Edit, Tag, Bell, Type, Keyboard } from 'lucide-react'
import toast from 'react-hot-toast'

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
      
      // Parse content for suggestions
      const mockParsed: ParsedContent = {
        reminders: [
          {
            dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            summary: "Text note reminder"
          }
        ],
        tags: ["text-note"],
        entities: {
          people: [],
          topics: []
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
        text: "This is a sample transcription. Remember to call John tomorrow at 3pm about the project deadline.",
        language: "en",
        confidence: 0.95
      }
      
      setTranscription(mockTranscription)
      setEditedText(mockTranscription.text)
      
      // Parse content for suggestions
      const mockParsed: ParsedContent = {
        reminders: [
          {
            dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            summary: "Call John about project deadline"
          }
        ],
        tags: ["project", "deadline", "John"],
        entities: {
          people: ["John"],
          topics: ["project", "deadline"]
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

  // Create reminder
  const handleCreateReminder = async (reminder: any) => {
    try {
      // Simulate API call - replace with actual reminder endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success(`Reminder set for ${new Date(reminder.dueAt).toLocaleDateString()}`)
      setShowSuggestions(false)
    } catch (error) {
      console.error('Reminder creation error:', error)
      toast.error('Failed to create reminder. Please try again.')
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
                  {/* Voice Recording Interface */}
                  <div className="flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isRecording 
                          ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30' 
                          : 'bg-gradient-to-br from-electric-600 to-electric-500 hover:from-electric-700 hover:to-electric-600 shadow-glow hover:shadow-glow-accent'
                      }`}
                    >
                      {isRecording ? (
                        <Square className="w-8 h-8 text-white" />
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
                      {isTranscribing ? 'Processing your voice...' : 'Tap and hold to start recording'}
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
                        placeholder="Type your thoughts, tasks, or ideas here..."
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

              {/* Smart Suggestions */}
              {showSuggestions && parsedContent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-electric-900/20 rounded-xl border border-electric-500/30"
                >
                  <h4 className="font-medium text-electric-300 mb-3">Smart Suggestions</h4>
                  
                  {parsedContent.reminders.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-electric-300 mb-2">Detected reminders:</p>
                      {parsedContent.reminders.map((reminder, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-background-card rounded-lg border border-electric-500/30">
                          <div>
                            <p className="font-medium text-gray-200">{reminder.summary}</p>
                            <p className="text-sm text-gray-400">
                              {new Date(reminder.dueAt).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleCreateReminder(reminder)}
                            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-electric-600 to-electric-500 hover:from-electric-700 hover:to-electric-600 text-white text-sm transition-colors duration-200 shadow-glow"
                          >
                            <Bell className="w-4 h-4" />
                            <span>Set</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {parsedContent.tags.length > 0 && (
                    <div>
                      <p className="text-sm text-electric-300 mb-2">Suggested tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {parsedContent.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-electric-900/30 text-electric-300 rounded-full text-sm font-medium border border-electric-500/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
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
