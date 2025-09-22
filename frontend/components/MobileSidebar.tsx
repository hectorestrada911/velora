'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  MessageSquare, 
  Calendar, 
  Bell, 
  Brain, 
  Mic, 
  History, 
  Settings,
  Play,
  User,
  Plus,
  Mail,
  CheckCircle,
  ExternalLink
} from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (path: string) => void
  onToggleConversationHistory: () => void
  isGoogleConnected?: boolean
  isConnectingGoogle?: boolean
  onConnectGoogle?: () => void
  onAnalyzeEmails?: () => void
  isAnalyzingEmails?: boolean
}

export default function MobileSidebar({ 
  isOpen, 
  onClose, 
  onNavigate, 
  onToggleConversationHistory,
  isGoogleConnected = false,
  isConnectingGoogle = false,
  onConnectGoogle,
  onAnalyzeEmails,
  isAnalyzingEmails = false
}: MobileSidebarProps) {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      onClose()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-gray-900 border-r border-gray-700 z-50 overflow-y-auto"
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">V</span>
                  </div>
                  <span className="text-white font-semibold">Velora</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Google Workspace Integration */}
              <div className="mb-6">
                {!isGoogleConnected ? (
                  <button
                    onClick={() => {
                      onConnectGoogle?.()
                      onClose()
                    }}
                    disabled={isConnectingGoogle}
                    className="w-full flex items-center space-x-3 p-3 text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    {isConnectingGoogle ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        <span>Connect Google</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-medium">Google Connected</span>
                    </div>
                    <button
                      onClick={() => {
                        onAnalyzeEmails?.()
                        onClose()
                      }}
                      disabled={isAnalyzingEmails}
                      className="w-full flex items-center space-x-3 p-3 text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 disabled:opacity-50 rounded-lg transition-colors"
                    >
                      {isAnalyzingEmails ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5" />
                          <span>Analyze Emails</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* New Chat */}
              <div className="mb-6">
                <button
                  onClick={() => {
                    onNavigate('/chat')
                    onClose()
                  }}
                  className="w-full flex items-center space-x-3 p-3 text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>New Chat</span>
                </button>
              </div>

              {/* Recent */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                  Recent
                </h3>
                <button
                  onClick={() => {
                    onToggleConversationHistory()
                    onClose()
                  }}
                  className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <History className="w-5 h-5" />
                  <span>Chat History</span>
                </button>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                  Features
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onNavigate('/calendar')
                      onClose()
                    }}
                    className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Calendar</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('/reminders')
                      onClose()
                    }}
                    className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    <span>Reminders</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('/memory')
                      onClose()
                    }}
                    className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Brain className="w-5 h-5" />
                    <span>Memory</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('/voice')
                      onClose()
                    }}
                    className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Mic className="w-5 h-5" />
                    <span>Voice</span>
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onNavigate('/demo')
                      onClose()
                    }}
                    className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    <span>Try Demo</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>

              {/* User Profile */}
              {user && (
                <div className="mt-auto pt-6 border-t border-gray-700">
                  <div className="flex items-center space-x-3 p-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {user.displayName || user.email}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                      title="Sign Out"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
