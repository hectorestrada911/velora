'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { motion as motion2 } from 'framer-motion'
import { User, Lock, Mail, ArrowRight, Sparkles, Brain, Calendar, Bell } from 'lucide-react'
import Link from 'next/link'

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<'landing' | 'signup' | 'login'>('landing')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement actual authentication
    console.log('Form submitted:', formData)
    
    // For now, redirect to chat page
    window.location.href = '/chat'
  }

  const handleSkip = () => {
    // TODO: Implement skip functionality
    console.log('Skipping authentication')
    
    // For now, redirect to chat page
    window.location.href = '/chat'
  }

  if (authMode === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-tertiary flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              Velora
            </h1>
            <p className="text-gray-400 text-lg">
              Your AI Productivity Assistant
            </p>
          </motion.div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Never Forget Another Thought Again
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              Your mind is a goldmine of ideas. Don't let them slip away. 
              Speak what you need to remember, and we'll make sure you never lose track of what matters.
            </p>
          </motion.div>

          {/* Feature Icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center space-x-8 mb-8"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-gray-400 text-sm">AI Assistant</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-gray-400 text-sm">Smart Calendar</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Bell className="w-6 h-6 text-yellow-400" />
              </div>
              <p className="text-gray-400 text-sm">Smart Reminders</p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            <button
              onClick={() => setAuthMode('signup')}
              className="w-full bg-gradient-to-r from-electric-600 to-electric-500 hover:from-electric-700 hover:to-electric-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-glow flex items-center justify-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setAuthMode('login')}
              className="w-full bg-background-elevated hover:bg-background-tertiary text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 border border-gray-700 hover:border-gray-600"
            >
              Sign In
            </button>
            
            <button
              onClick={handleSkip}
              className="w-full text-gray-400 hover:text-white font-medium py-3 px-6 transition-colors duration-200"
            >
              Skip for now
            </button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-tertiary flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => setAuthMode('landing')}
          className="text-gray-400 hover:text-white mb-6 flex items-center space-x-2 transition-colors duration-200"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>Back</span>
        </motion.button>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-background-elevated rounded-2xl p-8 border border-gray-700"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-400">
              {authMode === 'signup' 
                ? 'Start your productivity journey with Velora' 
                : 'Sign in to continue your journey'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {authMode === 'signup' && (
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-background-tertiary border border-gray-600 rounded-lg px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-background-tertiary border border-gray-600 rounded-lg px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-background-tertiary border border-gray-600 rounded-lg px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-electric-600 to-electric-500 hover:from-electric-700 hover:to-electric-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-glow"
            >
              {authMode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              {authMode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
                className="text-electric-400 hover:text-electric-300 ml-1 font-medium transition-colors duration-200"
              >
                {authMode === 'signup' ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
