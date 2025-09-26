'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  LogOut, 
  User, 
  Bell, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Palette, 
  Shield, 
  HelpCircle, 
  Info,
  Mail,
  Copy,
  Check
} from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import GoogleWorkspaceIntegration from './GoogleWorkspaceIntegration'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, signOut } = useAuth()
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [showAboutModal, setShowAboutModal] = useState(false)
  const [emailCopied, setEmailCopied] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const handleSignOut = async () => {
    try {
      await signOut()
      onClose()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText('aincorphelp@gmail.com')
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy email:', error)
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
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">Settings</h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* User Profile */}
                {user && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                      Account
                    </h3>
                    <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {user.displayName || 'User'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                    Preferences
                  </h3>
                  
                  {/* Notifications */}
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Notifications</p>
                        <p className="text-xs text-gray-400">Get notified about reminders and events</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications(!notifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Dark Mode */}
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {darkMode ? (
                        <Moon className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Sun className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">Dark Mode</p>
                        <p className="text-xs text-gray-400">Use dark theme</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        darkMode ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Sound */}
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {soundEnabled ? (
                        <Volume2 className="w-5 h-5 text-gray-400" />
                      ) : (
                        <VolumeX className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">Sound Effects</p>
                        <p className="text-xs text-gray-400">Play sounds for interactions</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        soundEnabled ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          soundEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Integrations */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                    Integrations
                  </h3>
                  <GoogleWorkspaceIntegration />
                </div>

                {/* Support */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                    Support
                  </h3>
                  
                  <button 
                    onClick={() => setShowSupportModal(true)}
                    className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <HelpCircle className="w-5 h-5" />
                    <span>Help & Support</span>
                  </button>
                  
                  <button 
                    onClick={() => setShowAboutModal(true)}
                    className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Info className="w-5 h-5" />
                    <span>About Velora</span>
                  </button>
                </div>

                {/* Sign Out */}
                <div className="pt-4 border-t border-gray-700">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-3 p-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Support Modal */}
      <AnimatePresence>
        {showSupportModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowSupportModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Help & Support</h3>
                  <button
                    onClick={() => setShowSupportModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-300">
                    Need help? We're here for you! Contact our support team:
                  </p>
                  
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Mail className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">Email Support</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="bg-gray-700 text-blue-400 px-2 py-1 rounded text-sm">
                        aincorphelp@gmail.com
                      </code>
                      <button
                        onClick={copyEmail}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        title="Copy email"
                      >
                        {emailCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-400">
                    We typically respond within 24 hours. Please include as much detail as possible about your issue.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* About Modal */}
      <AnimatePresence>
        {showAboutModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowAboutModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">About Velora</h3>
                  <button
                    onClick={() => setShowAboutModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-300">
                    Velora is your AI-powered personal assistant that helps you organize, remember, and manage your life.
                  </p>
                  
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Mail className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">Contact Us</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="bg-gray-700 text-blue-400 px-2 py-1 rounded text-sm">
                        aincorphelp@gmail.com
                      </code>
                      <button
                        onClick={copyEmail}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        title="Copy email"
                      >
                        {emailCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-400">
                    Have questions about Velora? We'd love to hear from you!
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AnimatePresence>
  )
}
