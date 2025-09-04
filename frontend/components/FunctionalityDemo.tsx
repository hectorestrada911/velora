'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Bell, CheckCircle, Clock, Sparkles, ArrowRight } from 'lucide-react'
import { calendarService } from '@/lib/calendarService'
import { toast } from 'react-hot-toast'

export default function FunctionalityDemo() {
  const [isCreatingDemo, setIsCreatingDemo] = useState(false)

  const createDemoData = async () => {
    setIsCreatingDemo(true)
    
    try {
      // Create a demo calendar event
      const event = {
        title: 'Demo Meeting with AI Assistant',
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
        description: 'This is a demo event created by Velora AI',
        location: 'Virtual Meeting Room'
      }
      
      await calendarService.addToGoogleCalendar(event)
      
      // Create demo reminders
      const reminder1 = {
        title: 'Review project proposal',
        dueDate: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        priority: 'high' as const,
        description: 'Important deadline approaching'
      }
      
      const reminder2 = {
        title: 'Call team for weekly sync',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        priority: 'medium' as const,
        description: 'Weekly team check-in'
      }
      
      await calendarService.createReminder(reminder1)
      await calendarService.createReminder(reminder2)
      
      toast.success('Demo data created successfully! Check your calendar and reminders.')
      
    } catch (error) {
      console.error('Failed to create demo data:', error)
      toast.error('Failed to create demo data')
    } finally {
      setIsCreatingDemo(false)
    }
  }

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Powered Analysis",
      description: "The AI analyzes your messages and automatically creates calendar events and reminders",
      status: "✅ Working"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Calendar Integration",
      description: "Events are stored locally with Google Calendar fallback when authenticated",
      status: "✅ Working"
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Smart Reminders",
      description: "Create, complete, snooze, and delete reminders with notifications",
      status: "✅ Working"
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Real-time Updates",
      description: "All changes sync across the app instantly",
      status: "✅ Working"
    }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 rounded-2xl border border-gray-700 p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-electric-400 via-purple-400 to-electric-500 bg-clip-text text-transparent mb-4">
            Velora Functionality Demo
          </h2>
          <p className="text-gray-300 text-lg">
            Here's what's currently working in your AI productivity assistant
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-electric-600 to-electric-500 rounded-lg flex items-center justify-center text-white">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-electric-400 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 mb-3">
                    {feature.description}
                  </p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400">
                    {feature.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={createDemoData}
            disabled={isCreatingDemo}
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-electric-600 via-purple-600 to-electric-500 hover:from-electric-700 hover:via-purple-700 hover:to-electric-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingDemo ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Demo Data...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Create Demo Calendar Event & Reminders</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
          
          <p className="text-gray-400 text-sm mt-4">
            This will create sample data to demonstrate the functionality
          </p>
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-electric-500/10 to-purple-500/10 rounded-xl border border-electric-500/20">
          <h3 className="text-lg font-semibold text-electric-400 mb-3">
            How to Test the AI Integration:
          </h3>
          <ol className="text-gray-300 space-y-2">
            <li className="flex items-start space-x-3">
              <span className="w-6 h-6 bg-electric-500 text-black rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <span>Go to the chat page and send a message like "Schedule a meeting tomorrow at 3pm"</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="w-6 h-6 bg-electric-500 text-black rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <span>The AI will analyze your message and create a calendar event automatically</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="w-6 h-6 bg-electric-500 text-black rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <span>Check the Calendar and Reminders pages to see your created items</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="w-6 h-6 bg-electric-500 text-black rounded-full flex items-center justify-center text-sm font-bold">4</span>
              <span>Try managing your reminders: complete, snooze, or delete them</span>
            </li>
          </ol>
        </div>
      </motion.div>
    </div>
  )
}
