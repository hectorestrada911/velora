'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { motion as motion2 } from 'framer-motion'
import { User, Lock, Mail, ArrowRight, Sparkles, Brain, Calendar, Bell, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<'landing' | 'signup' | 'login' | 'resend'>('landing')
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

  const handleResendPassword = () => {
    // TODO: Implement password reset functionality
    console.log('Resending password reset for:', formData.email)
    
    // For now, show success message and redirect
    toast.success('Password reset link sent! Check your email.')
    setTimeout(() => {
      window.location.href = '/chat'
    }, 2000)
  }

  if (authMode === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-tertiary flex items-center p-4">
        {/* Left Side - Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="max-w-lg">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <motion.h1 
                animate={{ 
                  scale: [1, 1.02, 1],
                  textShadow: [
                    "0 0 20px rgba(59, 130, 246, 0.5)",
                    "0 0 30px rgba(59, 130, 246, 0.8)",
                    "0 0 20px rgba(59, 130, 246, 0.5)"
                  ]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="text-6xl md:text-7xl font-black text-gradient-primary glow-text mb-4 leading-tight"
              >
                Velora
              </motion.h1>
              <p className="text-electric-300 text-xl md:text-2xl mb-8 font-semibold">
                Your AI Productivity Assistant
              </p>
            </motion.div>

            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                Never Forget Another<br />
                <span className="text-gradient-primary glow-text">Thought Again</span>
              </h2>
              <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8">
                Turn your thoughts into action. Never lose another brilliant idea again.
              </p>
            </motion.div>

            {/* Feature Icons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-6 mb-8"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Brain className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-electric-300 text-lg font-semibold">AI Assistant</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-purple-300 text-lg font-semibold">Smart Calendar</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-8 h-8 text-yellow-400" />
                </div>
                <p className="text-yellow-300 text-lg font-semibold">Smart Reminders</p>
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
          </div>
        </motion.div>

        {/* Right Side - Rotating Icon */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="relative">
            {/* Main Rotating Icon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-64 h-64 bg-gradient-to-br from-electric-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-electric-500/30"
            >
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="w-48 h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-blue-500/30"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="w-32 h-32 bg-gradient-to-br from-purple-500/20 to-yellow-500/20 rounded-full flex items-center justify-center border border-purple-500/30"
                >
                  <Brain className="w-16 h-16 text-electric-400" />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500/30 rounded-full flex items-center justify-center"
            >
              <Calendar className="w-4 h-4 text-blue-400" />
            </motion.div>

            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 w-8 h-8 bg-yellow-500/30 rounded-full flex items-center justify-center"
            >
              <Bell className="w-4 h-4 text-yellow-400" />
            </motion.div>

            <motion.div
              animate={{ y: [-15, 15, -15] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 -right-8 w-6 h-6 bg-purple-500/30 rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
            </motion.div>
          </div>
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

          <div className="mt-6 text-center space-y-3">
            <p className="text-gray-400">
              {authMode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
                className="text-electric-400 hover:text-electric-300 ml-1 font-medium transition-colors duration-200"
              >
                {authMode === 'signup' ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
            
            {authMode === 'login' && (
              <p className="text-gray-400">
                Forgot your password?{' '}
                <button
                  onClick={() => setAuthMode('resend')}
                  className="text-electric-400 hover:text-electric-300 font-medium transition-colors duration-200"
                >
                  Reset Password
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )

  // Resend Password Mode
  if (authMode === 'resend') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-tertiary flex items-center p-4">
        {/* Left Side - Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="max-w-lg">
            {/* Back Button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setAuthMode('login')}
              className="text-gray-400 hover:text-white mb-6 flex items-center space-x-2 transition-colors duration-200"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Back to Sign In</span>
            </motion.button>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-white mb-3">
                Reset Your Password
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                Enter your email address and we'll send you a link to reset your password. 
                You'll be back to productivity in no time!
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onSubmit={(e) => { e.preventDefault(); handleResendPassword(); }}
              className="space-y-6"
            >
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

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-electric-600 to-electric-500 hover:from-electric-700 hover:to-electric-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-glow"
              >
                Send Reset Link
              </button>
            </motion.form>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg"
            >
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 text-xs">ℹ️</span>
                </div>
                <div>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    Check your email inbox (and spam folder) for the reset link. 
                    The link will expire in 24 hours for security.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Moving Icon */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="relative">
            {/* Main Moving Icon */}
            <motion.div
              animate={{ 
                y: [-20, 20, -20],
                rotate: [0, 5, 0, -5, 0]
              }}
              transition={{ 
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" }
              }}
              className="w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-blue-500/30"
            >
              <motion.div
                animate={{ 
                  y: [20, -20, 20],
                  rotate: [0, -3, 0, 3, 0]
                }}
                transition={{ 
                  y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="w-48 h-48 bg-gradient-to-br from-purple-500/20 to-yellow-500/20 rounded-full flex items-center justify-center border border-purple-500/30"
              >
                <motion.div
                  animate={{ 
                    y: [-15, 15, -15],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                    scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="w-32 h-32 bg-gradient-to-br from-yellow-500/20 to-green-500/20 rounded-full flex items-center justify-center border border-yellow-500/30"
                >
                  <Mail className="w-16 h-16 text-blue-400" />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              animate={{ 
                y: [-10, 10, -10],
                x: [-5, 5, -5]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 w-8 h-8 bg-green-500/30 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-4 h-4 text-green-400" />
            </motion.div>

            <motion.div
              animate={{ 
                y: [10, -10, 10],
                x: [5, -5, 5]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
            </motion.div>

            <motion.div
              animate={{ 
                y: [-15, 15, -15],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 8, repeat: Infinity, ease: "linear" }
              }}
              className="absolute top-1/2 -right-8 w-6 h-6 bg-yellow-500/30 rounded-full flex items-center justify-center"
            >
              <Clock className="w-3 h-3 text-yellow-400" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }
}
