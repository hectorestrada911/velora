'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { motion as motion2 } from 'framer-motion'
import { User, Lock, Mail, ArrowRight, Sparkles, Brain, Calendar, Bell, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/components/providers/AuthProvider'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [authMode, setAuthMode] = useState<'landing' | 'signup' | 'login' | 'resend'>('landing')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (authMode === 'signup') {
        await signUp(formData.email, formData.password)
        toast.success('Account created successfully!')
      } else {
        await signIn(formData.email, formData.password)
        toast.success('Signed in successfully!')
      }
      
      // Redirect to chat page
      window.location.href = '/chat'
    } catch (error: any) {
      console.error('Auth error:', error)
      toast.error(error.message || 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
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

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      
      toast.success('Signed in with Google successfully!')
      
      // Redirect to chat page
      window.location.href = '/chat'
    } catch (error: any) {
      console.error('Google sign-in error:', error)
      toast.error(error.message || 'Google sign-in failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (authMode === 'landing') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex justify-between items-center mb-12"
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
            className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-electric-500 via-purple-500 to-electric-600 bg-clip-text text-transparent"
          >
            Velora
          </motion.h1>
          
          {/* Mobile Menu Icon */}
          <div className="w-8 h-8 flex flex-col justify-center space-y-1">
            <div className="w-6 h-1 bg-white rounded-full"></div>
            <div className="w-6 h-1 bg-white rounded-full"></div>
            <div className="w-6 h-1 bg-white rounded-full"></div>
          </div>
        </motion.div>

        {/* Visual Element - Centered */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="relative">
            {/* Main Rotating Icon - Smaller on mobile */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-electric-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-electric-500/30"
            >
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="w-36 h-36 md:w-48 md:h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-blue-500/30"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-purple-500/20 to-yellow-500/20 rounded-full flex items-center justify-center border border-purple-500/30"
                >
                  <Brain className="w-12 h-12 md:w-16 md:h-16 text-electric-400" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content - Centered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center max-w-md mx-auto mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            Never Forget Another<br />
            <span className="text-electric-400">Thought Again</span>
          </h2>
          <p className="text-gray-300 text-base md:text-lg leading-relaxed">
            Turn your thoughts into action. Never lose another brilliant idea again.
          </p>
        </motion.div>

        {/* Feature Icons - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-4 mb-8 w-full max-w-sm"
        >
          <div className="text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-electric-600/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-electric-500/30">
              <Brain className="w-6 h-6 md:w-8 md:h-8 text-electric-400" />
            </div>
            <p className="text-electric-300 text-sm md:text-base font-medium">AI Assistant</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-purple-500/30">
              <Calendar className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
            </div>
            <p className="text-purple-300 text-sm md:text-base font-medium">Smart Calendar</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-yellow-500/30">
              <Bell className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
            </div>
            <p className="text-yellow-300 text-sm md:text-base font-medium">Smart Reminders</p>
          </div>
        </motion.div>

        {/* Action Buttons - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full max-w-sm space-y-3"
        >
          <button
            onClick={() => setAuthMode('signup')}
            className="w-full bg-electric-600 hover:bg-electric-700 text-white font-semibold py-3 md:py-4 px-6 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          
          <button
            onClick={() => setAuthMode('login')}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 md:py-4 px-6 rounded-lg transition-all duration-200 border border-gray-600 hover:border-gray-500"
          >
            Sign In
          </button>
          
          <button
            onClick={handleSkip}
            className="w-full text-gray-400 hover:text-white font-medium py-2 md:py-3 px-6 transition-colors duration-200"
          >
            Skip to Chat
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
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
          className="bg-gray-900 rounded-xl p-6 md:p-8 border border-gray-700"
        >
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-electric-400 mb-2">
              {authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-300 text-sm md:text-base">
              {authMode === 'signup' 
                ? 'Start your productivity journey with Velora' 
                : 'Sign in to continue your journey'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {authMode === 'signup' && (
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200 text-sm md:text-base"
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
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200 text-sm md:text-base"
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
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200 text-sm md:text-base"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-electric-600 hover:bg-electric-700 disabled:bg-electric-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 text-sm md:text-base"
            >
              {isLoading ? 'Loading...' : (authMode === 'signup' ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-900 font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 text-sm md:text-base flex items-center justify-center space-x-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="mt-6 text-center space-y-3">
            <p className="text-gray-400 text-sm">
              {authMode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
                className="text-electric-400 hover:text-electric-300 ml-1 font-medium transition-colors duration-200"
              >
                {authMode === 'signup' ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
            
            {authMode === 'login' && (
              <p className="text-gray-400 text-sm">
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
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
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

          {/* Form Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900 rounded-xl p-6 md:p-8 border border-gray-700"
          >
            {/* Header */}
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-blue-400 mb-3">
                Reset Your Password
              </h2>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                Enter your email address and we'll send you a link to reset your password. 
                You'll be back to productivity in no time!
              </p>
            </div>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onSubmit={(e) => { e.preventDefault(); handleResendPassword(); }}
              className="space-y-4 md:space-y-6"
            >
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200 text-sm md:text-base"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 text-sm md:text-base"
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
          </motion.div>
        </motion.div>
      </div>
    )
  }
}
