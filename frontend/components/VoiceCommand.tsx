'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react'
import { voiceService, VoiceResult } from '@/lib/voiceService'
import { toast } from 'react-hot-toast'

interface VoiceCommandProps {
  onVoiceResult?: (result: VoiceResult) => void
  onTranscript?: (transcript: string) => void
  className?: string
}

export default function VoiceCommand({ onVoiceResult, onTranscript, className = '' }: VoiceCommandProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [lastResult, setLastResult] = useState<VoiceResult | null>(null)

  useEffect(() => {
    setIsSupported(voiceService.isSupported())
  }, [])

  const handleStartListening = async () => {
    if (!isSupported) {
      toast.error('Voice recognition not supported in this browser')
      return
    }

    setIsListening(true)
    setCurrentTranscript('')
    setLastResult(null)

    const success = await voiceService.startListening(
      (result: VoiceResult) => {
        setIsListening(false)
        setIsProcessing(false)
        setCurrentTranscript('')
        setLastResult(result)
        
        if (result.success) {
          toast.success(result.message)
        } else {
          toast.error(result.message)
        }
        
        if (onVoiceResult) {
          onVoiceResult(result)
        }
      },
      (transcript: string) => {
        setCurrentTranscript(transcript)
        if (onTranscript) {
          onTranscript(transcript)
        }
      }
    )

    if (success) {
      setIsProcessing(true)
    } else {
      setIsListening(false)
    }
  }

  const handleStopListening = () => {
    voiceService.stopListening()
    setIsListening(false)
    setIsProcessing(false)
  }

  const getButtonColor = () => {
    if (isListening) return 'bg-red-600 hover:bg-red-700'
    if (isProcessing) return 'bg-yellow-600 hover:bg-yellow-700'
    return 'bg-gradient-to-r from-electric-600 via-purple-600 to-electric-500 hover:from-electric-700 hover:via-purple-700 hover:to-electric-600'
  }

  const getButtonIcon = () => {
    if (isProcessing) return <Loader2 className="w-5 h-5 animate-spin" />
    if (isListening) return <MicOff className="w-5 h-5" />
    return <Mic className="w-5 h-5" />
  }

  const getButtonText = () => {
    if (isProcessing) return 'Processing...'
    if (isListening) return 'Listening...'
    return 'Voice Command'
  }

  if (!isSupported) {
    return (
      <div className={`text-center p-4 ${className}`}>
        <div className="text-gray-400 text-sm">
          Voice commands not supported in this browser
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Voice Command Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isListening ? handleStopListening : handleStartListening}
        disabled={isProcessing}
        className={`w-full ${getButtonColor()} text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg`}
      >
        {getButtonIcon()}
        <span>{getButtonText()}</span>
      </motion.button>

      {/* Live Transcript */}
      <AnimatePresence>
        {currentTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gray-800 rounded-lg p-4 border border-gray-600"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Volume2 className="w-4 h-4 text-electric-400" />
              <span className="text-sm font-medium text-electric-400">Listening...</span>
            </div>
            <p className="text-gray-200 text-sm leading-relaxed">
              "{currentTranscript}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Result */}
      <AnimatePresence>
        {lastResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-lg p-4 border ${
              lastResult.success 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-red-500/10 border-red-500/20'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              {lastResult.success ? (
                <Volume2 className="w-4 h-4 text-green-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm font-medium ${
                lastResult.success ? 'text-green-400' : 'text-red-400'
              }`}>
                {lastResult.success ? 'Command Executed' : 'Command Failed'}
              </span>
            </div>
            <p className={`text-sm leading-relaxed ${
              lastResult.success ? 'text-green-200' : 'text-red-200'
            }`}>
              {lastResult.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Commands Help */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-electric-400 mb-3">Voice Commands</h4>
        <div className="space-y-2 text-xs text-gray-300">
          <div>
            <span className="text-electric-300 font-medium">Calendar:</span>
            <span className="ml-2">"Schedule a meeting tomorrow at 3pm"</span>
          </div>
          <div>
            <span className="text-electric-300 font-medium">Reminders:</span>
            <span className="ml-2">"Remind me to call John at 6pm"</span>
          </div>
          <div>
            <span className="text-electric-300 font-medium">Navigation:</span>
            <span className="ml-2">"Show my calendar" or "Open reminders"</span>
          </div>
          <div>
            <span className="text-electric-300 font-medium">Queries:</span>
            <span className="ml-2">"What's my next meeting?"</span>
          </div>
        </div>
      </div>
    </div>
  )
}
