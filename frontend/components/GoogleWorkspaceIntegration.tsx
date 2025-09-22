'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Calendar, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface GoogleIntegrationProps {
  onIntegrationComplete?: (data: any) => void
}

interface EmailAnalysis {
  tasks: Array<{
    task: string
    deadline: string | null
    priority: 'high' | 'medium' | 'low'
    source: string
    emailId: string
  }>
  meetings: Array<{
    title: string
    date: string
    time: string
    attendees: string[]
    source: string
    emailId: string
  }>
  reminders: Array<{
    reminder: string
    priority: 'high' | 'medium' | 'low'
    source: string
    emailId: string
  }>
}

export default function GoogleWorkspaceIntegration({ onIntegrationComplete }: GoogleIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<EmailAnalysis | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')

  // Check if user is already connected
  useEffect(() => {
    checkConnectionStatus()
  }, [])

  const checkConnectionStatus = async () => {
    try {
      // Use the Railway backend URL directly for Google API calls
      const apiUrl = 'https://velora-production.up.railway.app'
      const response = await fetch(`${apiUrl}/api/google/status`)
      if (response.ok) {
        setIsConnected(true)
        setConnectionStatus('connected')
      }
    } catch (error) {
      console.error('Error checking connection status:', error)
    }
  }

  const handleConnectGoogle = async () => {
    setIsLoading(true)
    setConnectionStatus('connecting')

    try {
      // Use the Railway backend URL directly for Google API calls
      const apiUrl = 'https://velora-production.up.railway.app'
      const response = await fetch(`${apiUrl}/api/google/auth`)
      const { authUrl } = await response.json()

      // Open OAuth flow in popup
      const popup = window.open(
        authUrl,
        'google-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      )

      // Listen for popup completion
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          setIsLoading(false)
          // Check if connection was successful
          checkConnectionStatus()
        }
      }, 1000)

    } catch (error) {
      console.error('Error connecting to Google:', error)
      toast.error('Failed to connect to Google Workspace')
      setConnectionStatus('error')
      setIsLoading(false)
    }
  }

  const handleAnalyzeEmails = async () => {
    setIsAnalyzing(true)

    try {
      // Use the Railway backend URL directly for Google API calls
      const apiUrl = 'https://velora-production.up.railway.app'
      const response = await fetch(`${apiUrl}/api/google/analyze-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'current-user' // This should come from auth context
        })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze emails')
      }

      const data = await response.json()
      setAnalysis(data.analysis)
      
      toast.success(`Analyzed ${data.emails} emails and found ${data.analysis.tasks.length + data.analysis.meetings.length + data.analysis.reminders.length} actionable items`)
      
      if (onIntegrationComplete) {
        onIntegrationComplete(data.analysis)
      }

    } catch (error) {
      console.error('Error analyzing emails:', error)
      toast.error('Failed to analyze emails')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCreateTask = async (task: any) => {
    try {
      // This would integrate with your existing task creation system
      toast.success(`Created task: ${task.task}`)
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Failed to create task')
    }
  }

  const handleCreateMeeting = async (meeting: any) => {
    try {
      const response = await fetch('/api/google/create-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: {
            title: meeting.title,
            startDateTime: `${meeting.date}T${meeting.time}:00`,
            endDateTime: `${meeting.date}T${meeting.time.split(':')[0]}:${parseInt(meeting.time.split(':')[1]) + 60}:00`,
            attendees: meeting.attendees.map((email: string) => ({ email }))
          }
        })
      })

      if (response.ok) {
        toast.success(`Created meeting: ${meeting.title}`)
      } else {
        throw new Error('Failed to create meeting')
      }
    } catch (error) {
      console.error('Error creating meeting:', error)
      toast.error('Failed to create meeting')
    }
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
          <Mail className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Google Workspace Integration</h3>
          <p className="text-gray-400 text-sm">Connect your Gmail and Calendar for intelligent task management</p>
        </div>
      </div>

      {!isConnected ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-blue-100 font-medium">What this integration does:</h4>
                <ul className="text-blue-200 text-sm mt-2 space-y-1">
                  <li>• Analyzes your emails for tasks and deadlines</li>
                  <li>• Creates calendar events from meeting requests</li>
                  <li>• Extracts important information automatically</li>
                  <li>• Never miss important emails again</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleConnectGoogle}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-500 hover:to-green-500 disabled:from-blue-800 disabled:to-green-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ExternalLink className="w-5 h-5" />
            )}
            <span>{isLoading ? 'Connecting...' : 'Connect Google Workspace'}</span>
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center space-x-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Connected to Google Workspace</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleAnalyzeEmails}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-purple-800 disabled:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Mail className="w-5 h-5" />
              )}
              <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Recent Emails'}</span>
            </button>

            <button
              onClick={() => window.open('https://calendar.google.com', '_blank')}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Open Calendar</span>
            </button>
          </div>

          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h4 className="text-white font-semibold">Email Analysis Results</h4>
              
              {analysis.tasks.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h5 className="text-blue-400 font-medium mb-3">Tasks Found ({analysis.tasks.length})</h5>
                  <div className="space-y-2">
                    {analysis.tasks.map((task, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                        <div>
                          <p className="text-white text-sm">{task.task}</p>
                          <p className="text-gray-400 text-xs">From: {task.source}</p>
                          {task.deadline && (
                            <p className="text-yellow-400 text-xs">Due: {task.deadline}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleCreateTask(task)}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1 rounded transition-colors"
                        >
                          Create Task
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.meetings.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h5 className="text-green-400 font-medium mb-3">Meetings Found ({analysis.meetings.length})</h5>
                  <div className="space-y-2">
                    {analysis.meetings.map((meeting, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                        <div>
                          <p className="text-white text-sm">{meeting.title}</p>
                          <p className="text-gray-400 text-xs">{meeting.date} at {meeting.time}</p>
                          <p className="text-gray-400 text-xs">From: {meeting.source}</p>
                        </div>
                        <button
                          onClick={() => handleCreateMeeting(meeting)}
                          className="bg-green-600 hover:bg-green-500 text-white text-xs px-3 py-1 rounded transition-colors"
                        >
                          Add to Calendar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.reminders.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h5 className="text-yellow-400 font-medium mb-3">Reminders Found ({analysis.reminders.length})</h5>
                  <div className="space-y-2">
                    {analysis.reminders.map((reminder, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg p-3">
                        <p className="text-white text-sm">{reminder.reminder}</p>
                        <p className="text-gray-400 text-xs">From: {reminder.source}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}
