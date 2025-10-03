'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, Calendar, Bell, Navigation, Search, Volume2, Clock, MapPin } from 'lucide-react'
import VoiceCommand from '@/components/VoiceCommand'
import { VoiceResult } from '@/lib/voiceService'

export default function VoicePage() {
  const [voiceHistory, setVoiceHistory] = useState<VoiceResult[]>([])

  const handleVoiceResult = (result: VoiceResult) => {
    setVoiceHistory(prev => [result, ...prev.slice(0, 9)]) // Keep last 10 results
  }

  const voiceExamples = [
    {
      icon: <Calendar className="w-5 h-5" />,
      category: 'Calendar',
      examples: [
        'Schedule a meeting tomorrow at 3pm',
        'Book an appointment next Tuesday at 2pm',
        'Create an event for Friday at 10am',
        'Schedule a dentist appointment next week'
      ]
    },
    {
      icon: <Bell className="w-5 h-5" />,
      category: 'Reminders',
      examples: [
        'Remind me to call John at 6pm',
        'Don\'t forget to buy groceries tomorrow',
        'Set a reminder for the project deadline',
        'Remind me to take medication at 8am'
      ]
    },
    {
      icon: <Navigation className="w-5 h-5" />,
      category: 'Navigation',
      examples: [
        'Show my calendar',
        'Open reminders',
        'Go to the chat page',
        'Navigate to the demo'
      ]
    },
    {
      icon: <Search className="w-5 h-5" />,
      category: 'Queries',
      examples: [
        'What\'s my next meeting?',
        'How many reminders do I have?',
        'When is my next appointment?',
        'Show me my schedule'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 p-3 md:p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-electric-400 via-purple-400 to-electric-500 bg-clip-text text-transparent">Velora</h1>
            <div className="flex items-center space-x-2 text-sm bg-gradient-to-r from-electric-300 via-cyan-300 to-electric-400 bg-clip-text text-transparent">
              <Mic className="w-4 h-4" />
              <span>Voice Commands</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <button 
              onClick={() => window.location.href = '/chat'}
              className="p-2 md:p-2 text-gray-400 hover:text-white transition-colors duration-200 hover:bg-gray-800 rounded-lg"
              title="Back to Chat"
            >
              <span className="text-sm">Chat</span>
            </button>
            <button 
              onClick={() => window.location.href = '/calendar'}
              className="p-2 md:p-2 text-gray-400 hover:text-white transition-colors duration-200 hover:bg-gray-800 rounded-lg"
              title="View Calendar"
            >
              <Calendar className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button 
              onClick={() => window.location.href = '/notifications'}
              className="p-2 md:p-2 text-gray-400 hover:text-white transition-colors duration-200 hover:bg-gray-800 rounded-lg"
              title="View Notifications"
            >
              <Bell className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-3 md:p-4">
        {/* Main Voice Command Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Voice Commands
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Control Velora with your voice. Schedule meetings, set reminders, and navigate your productivity app hands-free.
            </p>
          </div>

          <VoiceCommand
            onVoiceResult={handleVoiceResult}
            className="max-w-2xl mx-auto"
          />
        </motion.div>

        {/* Voice Command Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-bold text-electric-400 mb-6 text-center">
            Voice Command Examples
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {voiceExamples.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-gray-900 rounded-xl p-6 border border-gray-700"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-electric-600 to-electric-500 rounded-lg flex items-center justify-center text-white">
                    {category.icon}
                  </div>
                  <h4 className="text-xl font-semibold text-electric-400">
                    {category.category}
                  </h4>
                </div>
                
                <div className="space-y-3">
                  {category.examples.map((example, exampleIndex) => (
                    <div
                      key={exampleIndex}
                      className="bg-gray-800 rounded-lg p-3 border border-gray-600"
                    >
                      <p className="text-gray-200 text-sm leading-relaxed">
                        "{example}"
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Voice History */}
        {voiceHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h3 className="text-2xl font-bold text-electric-400 mb-6 text-center">
              Recent Voice Commands
            </h3>
            
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <div className="space-y-4">
                {voiceHistory.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${
                      result.success 
                        ? 'bg-green-500/10 border-green-500/20' 
                        : 'bg-red-500/10 border-red-500/20'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        result.success ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {result.success ? (
                          <Volume2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${
                          result.success ? 'text-green-200' : 'text-red-200'
                        }`}>
                          {result.message}
                        </p>
                        {result.data && (
                          <div className="mt-2 text-xs text-gray-400">
                            {result.data.title && `Event: ${result.data.title}`}
                            {result.data.dueDate && `Due: ${new Date(result.data.dueDate).toLocaleString()}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-electric-500/10 to-purple-500/10 rounded-xl p-6 border border-electric-500/20"
        >
          <h3 className="text-lg font-semibold text-electric-400 mb-4">
            💡 Voice Command Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="flex items-start space-x-3">
              <Clock className="w-4 h-4 text-electric-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-electric-300">Time Formats</p>
                <p>Use "3pm", "3:30pm", "tomorrow at 2pm", or "next Tuesday"</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-electric-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-electric-300">Locations</p>
                <p>Add "at the office" or "in conference room A" for locations</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Mic className="w-4 h-4 text-electric-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-electric-300">Speak Clearly</p>
                <p>Speak at normal pace and volume for best recognition</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Volume2 className="w-4 h-4 text-electric-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-electric-300">Browser Support</p>
                <p>Works best in Chrome, Edge, and Safari browsers</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
