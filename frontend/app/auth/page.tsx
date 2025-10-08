'use client'
// Force deployment to use updated environment variables

import { useState } from 'react'
import { motion } from 'framer-motion'
import { motion as motion2 } from 'framer-motion'
import { User, Lock, Mail, ArrowRight, Sparkles, Brain, Calendar, Bell, CheckCircle, Clock, Mic, Zap, Target, Lightbulb, MessageSquare, Database, Shield, Rocket, Star, TrendingUp, Users, Globe, Smartphone, Laptop, Crown } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/components/providers/AuthProvider'
import { signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [authMode, setAuthMode] = useState<'landing' | 'signup' | 'login' | 'resend'>('landing')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setPasswordError('')
    
    // Validate password confirmation for signup
    if (authMode === 'signup' && formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match')
      setIsLoading(false)
      return
    }
    
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
      
      // Convert Firebase errors to user-friendly messages
      let userMessage = 'Authentication failed'
      
      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-credential':
            userMessage = 'Invalid email or password. Please check your credentials and try again.'
            break
          case 'auth/user-not-found':
            userMessage = 'No account found with this email. Please sign up first.'
            break
          case 'auth/wrong-password':
            userMessage = 'Incorrect password. Please try again.'
            break
          case 'auth/email-already-in-use':
            userMessage = 'An account with this email already exists. Please sign in instead.'
            break
          case 'auth/weak-password':
            userMessage = 'Password is too weak. Please choose a stronger password.'
            break
          case 'auth/invalid-email':
            userMessage = 'Please enter a valid email address.'
            break
          case 'auth/too-many-requests':
            userMessage = 'Too many failed attempts. Please try again later.'
            break
          case 'auth/network-request-failed':
            userMessage = 'Network error. Please check your connection and try again.'
            break
          default:
            userMessage = error.message || 'Authentication failed. Please try again.'
        }
      }
      
      toast.error(userMessage)
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

  const handleTryDemo = () => {
    // Redirect to chat page for demo
    window.location.href = '/chat'
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleResendPassword = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address first')
      return
    }

    try {
      if (!auth) {
        throw new Error('Firebase not initialized. Please check your environment variables.')
      }

      await sendPasswordResetEmail(auth, formData.email)
      toast.success('Password reset link sent! Check your email and spam folder.')
      
      // Redirect back to login after a delay
      setTimeout(() => {
        setAuthMode('login')
      }, 3000)
    } catch (error: any) {
      console.error('Password reset error:', error)
      
      let userMessage = 'Failed to send password reset email'
      
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            userMessage = 'No account found with this email address'
            break
          case 'auth/invalid-email':
            userMessage = 'Please enter a valid email address'
            break
          case 'auth/too-many-requests':
            userMessage = 'Too many requests. Please try again later'
            break
          case 'auth/network-request-failed':
            userMessage = 'Network error. Please check your connection and try again'
            break
          default:
            userMessage = error.message || 'Failed to send password reset email'
        }
      }
      
      toast.error(userMessage)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    
    try {
      if (!auth) {
        throw new Error('Firebase not initialized. Please check your environment variables.')
      }
      
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      
      toast.success('Signed in with Google successfully!')
      
      // Redirect to chat page
      window.location.href = '/chat'
    } catch (error: any) {
      console.error('Google sign-in error:', error)
      
      // Convert Google sign-in errors to user-friendly messages
      let userMessage = 'Google sign-in failed'
      
      if (error.code) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            userMessage = 'Sign-in cancelled. Please try again if you want to continue.'
            break
          case 'auth/popup-blocked':
            userMessage = 'Popup was blocked. Please allow popups and try again.'
            break
          case 'auth/cancelled-popup-request':
            userMessage = 'Sign-in was cancelled. Please try again.'
            break
          case 'auth/network-request-failed':
            userMessage = 'Network error. Please check your connection and try again.'
            break
          default:
            userMessage = error.message || 'Google sign-in failed. Please try again.'
        }
      }
      
      toast.error(userMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (authMode === 'landing') {
    return (
      <div className="bg-black">
        {/* Header - Fixed at top */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex justify-between items-center px-12 py-6 absolute top-0 left-0 z-10"
        >
          <motion.h1 
            animate={{ 
              scale: [1, 1.02, 1],
              textShadow: [
                "0 0 20px rgba(59, 130, 246, 0.4)",
                "0 0 30px rgba(59, 130, 246, 0.6)",
                "0 0 20px rgba(59, 130, 246, 0.4)"
              ]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-electric-500 via-purple-500 to-electric-600 bg-clip-text text-transparent"
          >
            Velora AI
          </motion.h1>
          
          {/* Enhanced Hamburger Menu */}
          <motion.div 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMenu}
            className="w-10 h-10 flex flex-col justify-center space-y-1.5 cursor-pointer group"
          >
            <motion.div 
              className="w-7 h-1 bg-gradient-to-r from-electric-400 to-purple-400 rounded-full group-hover:from-electric-300 group-hover:to-purple-300 transition-all duration-200"
              animate={{ 
                boxShadow: [
                  "0 0 5px rgba(59, 130, 246, 0.3)",
                  "0 0 15px rgba(59, 130, 246, 0.6)",
                  "0 0 5px rgba(59, 130, 246, 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div 
              className="w-7 h-1 bg-gradient-to-r from-electric-400 to-purple-400 rounded-full group-hover:from-electric-300 group-hover:to-purple-300 transition-all duration-200"
              animate={{ 
                boxShadow: [
                  "0 0 5px rgba(59, 130, 246, 0.3)",
                  "0 0 15px rgba(59, 130, 246, 0.6)",
                  "0 0 5px rgba(59, 130, 246, 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
            />
            <motion.div 
              className="w-7 h-1 bg-gradient-to-r from-electric-400 to-purple-400 rounded-full group-hover:from-electric-300 group-hover:to-purple-300 transition-all duration-200"
              animate={{ 
                boxShadow: [
                  "0 0 5px rgba(59, 130, 246, 0.3)",
                  "0 0 15px rgba(59, 130, 246, 0.6)",
                  "0 0 5px rgba(59, 130, 246, 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
            />
          </motion.div>
        </motion.div>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 right-6 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl z-20 min-w-[220px]"
          >
            <div className="p-2">
              <div className="px-4 py-2 text-xs text-gray-400 uppercase tracking-wide border-b border-gray-700 mb-2">
                Account
              </div>
              <button
                onClick={() => {
                  setAuthMode('signup')
                  setIsMenuOpen(false)
                }}
                className="w-full text-left px-4 py-3 text-white hover:bg-gray-800 rounded-md transition-colors duration-200 flex items-center space-x-3"
              >
                <User className="w-4 h-4" />
                <span>Sign Up</span>
              </button>
              <button
                onClick={() => {
                  setAuthMode('login')
                  setIsMenuOpen(false)
                }}
                className="w-full text-left px-4 py-3 text-white hover:bg-gray-800 rounded-md transition-colors duration-200 flex items-center space-x-3"
              >
                <Lock className="w-4 h-4" />
                <span>Sign In</span>
              </button>
              
              <div className="px-4 py-2 text-xs text-gray-400 uppercase tracking-wide border-b border-gray-700 mb-2 mt-4">
                Explore
              </div>
              <button
                onClick={() => {
                  window.location.href = '/pricing'
                  setIsMenuOpen(false)
                }}
                className="w-full text-left px-4 py-3 text-white hover:bg-gray-800 rounded-md transition-colors duration-200 flex items-center space-x-3"
              >
                <Crown className="w-4 h-4" />
                <span>Pricing</span>
              </button>
              <button
                onClick={() => {
                  handleTryDemo()
                  setIsMenuOpen(false)
                }}
                className="w-full text-left px-4 py-3 text-electric-400 hover:bg-gray-800 rounded-md transition-colors duration-200 flex items-center space-x-3"
              >
                <Sparkles className="w-4 h-4" />
                <span>Try Demo</span>
              </button>
              <button
                onClick={() => {
                  window.location.href = '/chat'
                  setIsMenuOpen(false)
                }}
                className="w-full text-left px-4 py-3 text-white hover:bg-gray-800 rounded-md transition-colors duration-200 flex items-center space-x-3"
              >
                <Brain className="w-4 h-4" />
                <span>Go to Chat</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Hero Section */}
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
        {/* Main Content - Responsive Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full"
        >
          {/* Desktop Layout - Side by Side */}
          <div className="hidden lg:flex items-center justify-between max-w-7xl mx-auto px-4 mb-12">
            {/* Left Side - Text Content */}
            <div className="flex-1 max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <motion.span
                  animate={{ 
                    opacity: [0.7, 1, 0.7],
                    scale: [1, 1.02, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex items-center space-x-2 text-electric-400 text-sm font-medium"
                >
                  <Zap className="w-4 h-4" />
                  <span>AI-Powered Memory</span>
                </motion.span>
              </motion.div>
              
              <h2 className="text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
                Never lose a <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-500 to-purple-500">thought</span> with <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-500 to-purple-500">Velora AI</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Stop drowning in information. <span className="text-electric-400">Velora AI</span> remembers everything so you can focus on what matters most.
              </p>
              
              {/* Call-to-Action Buttons - Desktop */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => window.location.href = '/radar'}
                  className="bg-gradient-to-r from-electric-500 to-blue-500 hover:from-electric-400 hover:to-blue-400 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2 text-lg border border-electric-500/30"
                >
                  <span>Try Radar</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setAuthMode('login')}
                  className="bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 font-semibold py-3 px-8 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2 text-lg border border-gray-700/50"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Right Side - Dynamic Visual Experience */}
            <div className="flex-1 flex justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
                className="relative"
              >
                {/* Orbiting Elements */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-electric-400 to-blue-400 rounded-full flex items-center justify-center"
                  >
                    <MessageSquare className="w-4 h-4 text-white" />
                  </motion.div>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                    className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center"
                  >
                    <Calendar className="w-4 h-4 text-white" />
                  </motion.div>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    className="absolute -bottom-4 -left-4 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center"
                  >
                    <Bell className="w-4 h-4 text-white" />
                  </motion.div>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                    className="absolute -bottom-4 -right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center"
                  >
                    <Lightbulb className="w-4 h-4 text-white" />
                  </motion.div>
                </motion.div>

                {/* Main Rotating Icon - Enhanced */}
                <motion.div
                  animate={{ 
                    rotate: 360,
                    boxShadow: [
                      "0 0 30px rgba(59, 130, 246, 0.3)",
                      "0 0 60px rgba(59, 130, 246, 0.6)",
                      "0 0 30px rgba(59, 130, 246, 0.3)"
                    ]
                  }}
                  transition={{ 
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    boxShadow: { duration: 2, repeat: Infinity }
                  }}
                  className="w-80 h-80 xl:w-96 xl:h-96 bg-gradient-to-br from-electric-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-electric-500/30 backdrop-blur-sm"
                >
                  <motion.div
                    animate={{ 
                      rotate: -360,
                      scale: [1, 1.02, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                      scale: { duration: 4, repeat: Infinity }
                    }}
                    className="w-60 h-60 xl:w-72 xl:h-72 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-blue-500/30"
                  >
                    <motion.div
                      animate={{ 
                        rotate: 360,
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity }
                      }}
                      className="w-40 h-40 xl:w-48 xl:h-48 bg-gradient-to-br from-purple-500/20 to-yellow-500/20 rounded-full flex items-center justify-center border border-purple-500/30"
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <Brain className="w-20 h-20 xl:w-24 xl:h-24 text-electric-400" />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Floating Particles - Contained to Visual Area */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -12, 0],
                      opacity: [0.4, 0.9, 0.4],
                      scale: [0.8, 1.3, 0.8]
                    }}
                    transition={{
                      duration: 2.5 + i * 0.3,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    className="absolute w-2 h-2 bg-electric-400 rounded-full"
                    style={{
                      left: `${30 + (i % 3) * 15}%`,
                      top: `${40 + Math.floor(i / 3) * 20}%`
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </div>

          {/* Mobile Layout - Resend Style */}
          <div className="lg:hidden text-center max-w-md mx-auto">
            {/* Clean Spinning Icon with Particles */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8 flex justify-center relative"
            >
              {/* Main Spinning Icon */}
              <motion.div
                animate={{ 
                  rotate: -360,
                  boxShadow: [
                    "0 0 20px rgba(59, 130, 246, 0.3)",
                    "0 0 40px rgba(59, 130, 246, 0.6)",
                    "0 0 20px rgba(59, 130, 246, 0.3)"
                  ]
                }}
                transition={{ 
                  rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                  boxShadow: { duration: 2, repeat: Infinity }
                }}
                className="w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-blue-500/30 backdrop-blur-sm"
              >
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                  className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-yellow-500/20 rounded-full flex items-center justify-center border border-purple-500/30"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Brain className="w-10 h-10 text-electric-400" />
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Floating Particles for Mobile - Contained to Visual Area */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -8, 0],
                    opacity: [0.4, 0.9, 0.4],
                    scale: [0.8, 1.3, 0.8]
                  }}
                  transition={{
                    duration: 2.5 + i * 0.3,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                  className="absolute w-1.5 h-1.5 bg-electric-400 rounded-full"
                  style={{
                    left: `${35 + (i % 2) * 20}%`,
                    top: `${45 + Math.floor(i / 2) * 15}%`
                  }}
                />
              ))}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight"
            >
              Never lose a <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-500 to-purple-500">thought</span> with <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-500 to-purple-500">Velora AI</span>
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-gray-300 text-base md:text-lg leading-relaxed mb-8"
            >
              Stop drowning in information. <span className="text-electric-400">Velora AI</span> remembers everything so you can focus on what matters most.
            </motion.p>

            {/* CTA Buttons - Mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col space-y-4"
            >
              <button
                onClick={() => window.location.href = '/radar'}
                className="w-full bg-gradient-to-r from-electric-500 to-blue-500 hover:from-electric-400 hover:to-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2 border border-electric-500/30"
              >
                <span>Try Radar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setAuthMode('login')}
                className="w-full bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2 border border-gray-700/50"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </motion.div>
        </div>

        {/* Feature Showcase Sections - Ultra Sleek */}
        
        {/* Follow-Up Radar Feature Showcase - FLAGSHIP */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-32 w-full"
        >
          <div className="max-w-7xl mx-auto px-4">
            {/* Section Header */}
            <div className="text-center mb-16">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 0 40px rgba(59, 130, 246, 0.3)",
                    "0 0 80px rgba(59, 130, 246, 0.6)",
                    "0 0 40px rgba(59, 130, 246, 0.3)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-20 h-20 bg-gradient-to-br from-electric-500/50 to-blue-500/50 rounded-3xl flex items-center justify-center border border-electric-500/60 backdrop-blur-sm mx-auto mb-8 relative"
              >
                <svg className="w-10 h-10 text-electric-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                  <line x1="12" y1="2" x2="12" y2="4" />
                  <line x1="12" y1="20" x2="12" y2="22" />
                  <line x1="22" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="12" x2="2" y2="12" />
                </svg>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-electric-500 to-blue-500 text-white text-xs font-bold rounded-full"
                >
                  NEW
                </motion.span>
              </motion.div>
              <h3 className="text-5xl font-bold text-white mb-6">
                Follow-Up <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-500 to-blue-500">Radar</span>
              </h3>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Emails that follow themselves. BCC Velora and get reminded at the right time with <span className="text-electric-400">ready-to-send drafts</span> and the exact quote that triggered it.
              </p>
              <div className="mt-6 space-y-2">
                <p className="text-sm text-gray-400">Try: <span className="text-electric-400">BCC: 2d@in.velora.cc</span></p>
                <p className="text-sm text-gray-400">Or: <span className="text-electric-400">BCC: follow@in.velora.cc</span></p>
              </div>
            </div>

            {/* Full Width Radar Showcase */}
            <motion.div
              whileHover={{ scale: 1.01, y: -10 }}
              className="bg-gradient-to-br from-gray-900/90 to-gray-800/70 rounded-3xl p-6 md:p-12 border border-electric-500/30 hover:border-electric-500/60 transition-all duration-500 backdrop-blur-sm relative overflow-hidden"
            >
              {/* Background Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-electric-500/5 via-transparent to-blue-500/5 rounded-3xl"></div>
              
              {/* Radar Interface Mockup */}
              <div className="relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                  {/* Left Side - Stats Cards */}
                  <div className="space-y-4">
                    <h4 className="text-xl md:text-2xl font-bold text-white mb-4">Your Follow-ups</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Overdue', count: 2, color: 'red' },
                        { label: 'Today', count: 3, color: 'orange' },
                        { label: 'Upcoming', count: 5, color: 'blue' },
                        { label: 'You Owe', count: 4, color: 'purple' }
                      ].map((stat, i) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50 text-center"
                        >
                          <div className={`text-2xl font-bold text-${stat.color}-400`}>{stat.count}</div>
                          <div className="text-xs text-gray-400">{stat.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Center - Follow-up Example */}
                  <div className="space-y-4">
                    <h4 className="text-xl md:text-2xl font-bold text-white mb-4">Recent Follow-up</h4>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-4 border border-electric-500/30"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h5 className="text-white font-medium">Budget follow-up</h5>
                          <p className="text-sm text-gray-400">Alex Johnson</p>
                        </div>
                        <span className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded">You owe</span>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
                        <p className="text-xs text-gray-500 mb-1">Triggered by:</p>
                        <p className="text-sm text-gray-300 italic">"Can you confirm by Thursday?"</p>
                      </div>
                      <div className="bg-electric-500/10 rounded-lg p-3 mb-3">
                        <p className="text-xs text-electric-400 mb-1">Draft ready:</p>
                        <p className="text-sm text-gray-300">"Hi Alex, following up on the budget discussion..."</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-red-400 font-medium">2h overdue</span>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-electric-500/20 text-electric-300 text-xs rounded hover:bg-electric-500/30">Send</button>
                          <button className="px-3 py-1 bg-green-500/20 text-green-300 text-xs rounded hover:bg-green-500/30">Done</button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Right Side - BCC Examples */}
                  <div className="space-y-4">
                    <h4 className="text-xl md:text-2xl font-bold text-white mb-4">BCC Aliases</h4>
                    <div className="space-y-3">
                      {[
                        { alias: '2d@in.velora.cc', desc: 'Remind in 2 days' },
                        { alias: 'follow@in.velora.cc', desc: 'Smart detect deadline' },
                        { alias: 'eow@in.velora.cc', desc: 'End of week' },
                        { alias: 'tomorrow8am@in.velora.cc', desc: 'Tomorrow at 8am' }
                      ].map((item, i) => (
                        <motion.div
                          key={item.alias}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                          className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50"
                        >
                          <div className="font-mono text-electric-400 text-sm">{item.alias}</div>
                          <div className="text-xs text-gray-400">{item.desc}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Calendar Feature Showcase - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-32 w-full"
        >
          <div className="max-w-7xl mx-auto px-4">
            {/* Section Header */}
            <div className="text-center mb-16">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 0 40px rgba(168, 85, 247, 0.3)",
                    "0 0 80px rgba(168, 85, 247, 0.6)",
                    "0 0 40px rgba(168, 85, 247, 0.3)"
                  ]
                }}
                transition={{ 
                  scale: { duration: 4, repeat: Infinity },
                  boxShadow: { duration: 3, repeat: Infinity }
                }}
                className="w-20 h-20 bg-gradient-to-br from-purple-500/50 to-pink-500/50 rounded-3xl flex items-center justify-center border border-purple-500/60 backdrop-blur-sm mx-auto mb-8"
              >
                <Calendar className="w-10 h-10 text-purple-400" />
              </motion.div>
              <h3 className="text-5xl font-bold text-white mb-6">
                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">calendar</span> that thinks ahead
              </h3>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Never miss another meeting. <span className="text-purple-400">Smart scheduling</span> that adapts to your workflow.
              </p>
              <div className="mt-6 space-y-2">
                <p className="text-sm text-gray-400">Try: <span className="text-purple-400">"Schedule a meeting with John next Tuesday"</span></p>
                <p className="text-sm text-gray-400">Or: <span className="text-purple-400">"What do I have tomorrow?"</span></p>
              </div>
            </div>

            {/* Full Width Calendar Showcase */}
            <motion.div
              whileHover={{ scale: 1.01, y: -10 }}
              className="bg-gradient-to-br from-gray-900/90 to-gray-800/70 rounded-3xl p-6 md:p-12 border border-purple-500/30 hover:border-purple-500/60 transition-all duration-500 backdrop-blur-sm relative overflow-hidden"
            >
              {/* Background Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 rounded-3xl"></div>
              
              {/* Calendar Grid - Full Width */}
              <div className="relative z-10">
                <div className="grid grid-cols-7 gap-1 md:gap-4 text-center text-xs md:text-sm text-gray-400 mb-4 md:mb-6">
                  <div className="font-semibold">MON</div>
                  <div className="font-semibold">TUE</div>
                  <div className="font-semibold">WED</div>
                  <div className="font-semibold">THU</div>
                  <div className="font-semibold">FRI</div>
                  <div className="font-semibold">SAT</div>
                  <div className="font-semibold">SUN</div>
                </div>
                
                <div className="grid grid-cols-7 gap-1 md:gap-4">
                  {[...Array(35)].map((_, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.1, rotate: 2 }}
                      animate={{ 
                        scale: [1, 1.02, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        delay: i * 0.05 
                      }}
                      className={`h-10 md:h-16 rounded-lg md:rounded-xl flex items-center justify-center text-xs md:text-sm font-medium transition-all duration-300 ${
                        i === 15 ? 'bg-gradient-to-br from-purple-500/40 to-pink-500/40 text-purple-200 border border-purple-500/50 shadow-lg shadow-purple-500/25' :
                        i === 8 || i === 22 || i === 29 ? 'bg-gradient-to-br from-blue-500/30 to-cyan-500/30 text-blue-200 border border-blue-500/40 shadow-lg shadow-blue-500/20' :
                        i === 1 || i === 16 || i === 30 ? 'bg-gradient-to-br from-green-500/30 to-emerald-500/30 text-green-200 border border-green-500/40 shadow-lg shadow-green-500/20' :
                        'text-gray-400 hover:bg-gray-800/50 hover:text-gray-300'
                      }`}
                    >
                      {i + 1}
                    </motion.div>
                  ))}
                </div>
                
                {/* Floating Metrics - Responsive */}
                <div className="absolute top-4 md:top-8 right-4 md:right-8 space-y-2 md:space-y-4">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, -2, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl md:rounded-2xl p-2 md:p-4 border border-purple-500/30"
                  >
                    <div className="text-lg md:text-2xl font-bold text-purple-400">12</div>
                    <div className="text-xs text-gray-400">UPCOMING</div>
                  </motion.div>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, -2, 2, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                    className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-xl md:rounded-2xl p-2 md:p-4 border border-blue-500/30"
                  >
                    <div className="text-lg md:text-2xl font-bold text-blue-400">3</div>
                    <div className="text-xs text-gray-400">TODAY</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Memory Feature Showcase - Ultra Sleek */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-32 w-full"
        >
          <div className="max-w-7xl mx-auto px-4">
            {/* Section Header */}
            <div className="text-center mb-16">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 0 40px rgba(59, 130, 246, 0.3)",
                    "0 0 80px rgba(59, 130, 246, 0.6)",
                    "0 0 40px rgba(59, 130, 246, 0.3)"
                  ]
                }}
                transition={{ 
                  scale: { duration: 4, repeat: Infinity },
                  boxShadow: { duration: 3, repeat: Infinity }
                }}
                className="w-20 h-20 bg-gradient-to-br from-electric-500/50 to-blue-500/50 rounded-3xl flex items-center justify-center border border-electric-500/60 backdrop-blur-sm mx-auto mb-8"
              >
                <Database className="w-10 h-10 text-electric-400" />
              </motion.div>
              <h3 className="text-5xl font-bold text-white mb-6">
                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-500 to-blue-500">memory</span> that never forgets
              </h3>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Remember everything instantly. <span className="text-electric-400">"What did I decide in last week's meeting?"</span> Get the answer in seconds.
              </p>
              <div className="mt-6 space-y-2">
                <p className="text-sm text-gray-400">Try: <span className="text-electric-400">"REMEMBER I prefer morning meetings"</span></p>
                <p className="text-sm text-gray-400">Or: <span className="text-electric-400">"What do I know about John?"</span></p>
              </div>
            </div>

            {/* Memory Visualization - Full Width */}
            <motion.div
              whileHover={{ scale: 1.01, y: -10 }}
              className="bg-gradient-to-br from-gray-900/90 to-gray-800/70 rounded-3xl p-6 md:p-12 border border-electric-500/30 hover:border-electric-500/60 transition-all duration-500 backdrop-blur-sm relative overflow-hidden"
            >
              {/* Background Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-electric-500/5 via-transparent to-blue-500/5 rounded-3xl"></div>
              
              {/* Memory Network Visualization */}
              <div className="relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                  {/* Central Memory Hub */}
                  <div className="lg:col-span-1 flex justify-center mb-6 lg:mb-0">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 360],
                        boxShadow: [
                          "0 0 30px rgba(59, 130, 246, 0.4)",
                          "0 0 60px rgba(59, 130, 246, 0.8)",
                          "0 0 30px rgba(59, 130, 246, 0.4)"
                        ]
                      }}
                      transition={{ 
                        scale: { duration: 3, repeat: Infinity },
                        rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                        boxShadow: { duration: 2, repeat: Infinity }
                      }}
                      className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-electric-500/40 to-blue-500/40 rounded-full flex items-center justify-center border border-electric-500/60 backdrop-blur-sm"
                    >
                      <Database className="w-12 h-12 md:w-16 md:h-16 text-electric-400" />
                    </motion.div>
                  </div>
                  
                  {/* Memory Nodes */}
                  <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    {[
                      { text: "REMEMBER John's birthday is March 15th", color: "electric", delay: 0 },
                      { text: "REMEMBER Project Alpha deadline: Q2", color: "blue", delay: 0.5 },
                      { text: "REMEMBER I prefer morning meetings", color: "green", delay: 1 },
                      { text: "REMEMBER Sarah's favorite coffee: Oat milk latte", color: "purple", delay: 1.5 },
                      { text: "REMEMBER I parked in section B", color: "pink", delay: 2 }
                    ].map((memory, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: memory.delay }}
                        whileHover={{ scale: 1.05, x: 10 }}
                        className={`flex items-center space-x-3 md:space-x-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-r from-${memory.color}-500/10 to-${memory.color}-500/5 border border-${memory.color}-500/20 hover:border-${memory.color}-500/40 transition-all duration-300`}
                      >
                        <motion.div
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.6, 1, 0.6]
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            delay: memory.delay 
                          }}
                          className={`w-3 h-3 md:w-4 md:h-4 bg-${memory.color}-400 rounded-full`}
                        />
                        <span className="text-gray-300 text-sm md:text-lg">"{memory.text}"</span>
                        <motion.div
                          animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity, 
                            delay: memory.delay + 0.5 
                          }}
                          className="ml-auto text-xs text-gray-500 hidden md:block"
                        >
                          ✓ Stored
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Floating Stats - Responsive */}
                <div className="absolute top-4 md:top-8 right-4 md:right-8 space-y-2 md:space-y-4">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, -2, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="bg-gradient-to-r from-electric-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl md:rounded-2xl p-2 md:p-4 border border-electric-500/30"
                  >
                    <div className="text-lg md:text-2xl font-bold text-electric-400">2,847</div>
                    <div className="text-xs text-gray-400">MEMORIES</div>
                  </motion.div>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, -2, 2, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                    className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl md:rounded-2xl p-2 md:p-4 border border-green-500/30"
                  >
                    <div className="text-lg md:text-2xl font-bold text-green-400">0.3s</div>
                    <div className="text-xs text-gray-400">RECALL</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Documents Feature Showcase - Ultra Sleek */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-32 w-full"
        >
          <div className="max-w-7xl mx-auto px-4">
            {/* Section Header */}
            <div className="text-center mb-16">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 0 40px rgba(34, 197, 94, 0.3)",
                    "0 0 80px rgba(34, 197, 94, 0.6)",
                    "0 0 40px rgba(34, 197, 94, 0.3)"
                  ]
                }}
                transition={{ 
                  scale: { duration: 4, repeat: Infinity },
                  boxShadow: { duration: 3, repeat: Infinity }
                }}
                className="w-20 h-20 bg-gradient-to-br from-green-500/50 to-emerald-500/50 rounded-3xl flex items-center justify-center border border-green-500/60 backdrop-blur-sm mx-auto mb-8"
              >
                <MessageSquare className="w-10 h-10 text-green-400" />
              </motion.div>
              <h3 className="text-5xl font-bold text-white mb-6">
                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">documents</span> come alive
              </h3>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Turn any document into insights. <span className="text-green-400">"Summarize my Q3 report"</span> gets instant analysis.
              </p>
              <div className="mt-6 space-y-2">
                <p className="text-sm text-gray-400">Try: <span className="text-green-400">"What's this resume about?"</span></p>
                <p className="text-sm text-gray-400">Or: <span className="text-green-400">"Extract key points from my contract"</span></p>
              </div>
            </div>

            {/* Document Intelligence Visualization - Full Width */}
            <motion.div
              whileHover={{ scale: 1.01, y: -10 }}
              className="bg-gradient-to-br from-gray-900/90 to-gray-800/70 rounded-3xl p-6 md:p-12 border border-green-500/30 hover:border-green-500/60 transition-all duration-500 backdrop-blur-sm relative overflow-hidden"
            >
              {/* Background Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-emerald-500/5 rounded-3xl"></div>
              
              {/* Document Processing Visualization */}
              <div className="relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                  {/* Document Input Side */}
                  <div className="space-y-4 md:space-y-6">
                    <h4 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Documents In</h4>
                    {[
                      { name: "Q3_Report.pdf", status: "Analyzed", color: "green" },
                      { name: "Meeting_Notes.docx", status: "Processed", color: "blue" },
                      { name: "Research_Paper.pdf", status: "Indexed", color: "purple" },
                      { name: "Project_Brief.pdf", status: "Analyzing", color: "yellow" }
                    ].map((doc, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 }}
                        whileHover={{ scale: 1.05, x: 10 }}
                        className="flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-r from-gray-800/50 to-gray-700/30 border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300"
                      >
                        <div className="flex items-center space-x-3 md:space-x-4">
                          <motion.div
                            animate={{ 
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{ 
                              duration: 3, 
                              repeat: Infinity, 
                              delay: index * 0.3 
                            }}
                            className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-gray-600/40 to-gray-500/40 rounded-lg flex items-center justify-center"
                          >
                            <MessageSquare className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                          </motion.div>
                          <span className="text-gray-300 text-sm md:text-lg">{doc.name}</span>
                        </div>
                        <motion.div
                          animate={{ 
                            scale: [1, 1.1, 1],
                            opacity: [0.7, 1, 0.7]
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            delay: index * 0.2 
                          }}
                          className={`text-xs md:text-sm px-2 md:px-3 py-1 rounded-full bg-${doc.color}-500/20 text-${doc.color}-400 border border-${doc.color}-500/30`}
                        >
                          ✓ {doc.status}
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Insights Output Side */}
                  <div className="space-y-4 md:space-y-6">
                    <h4 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Insights Out</h4>
                    {[
                      { insight: "Revenue increased 23% Q3", confidence: "98%", color: "green" },
                      { insight: "User engagement peaked in September", confidence: "94%", color: "blue" },
                      { insight: "Key focus: Mobile optimization", confidence: "96%", color: "purple" },
                      { insight: "Next milestone: Q4 launch", confidence: "92%", color: "yellow" }
                    ].map((insight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 }}
                        whileHover={{ scale: 1.05, x: -10 }}
                        className={`p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-r from-${insight.color}-500/10 to-${insight.color}-500/5 border border-${insight.color}-500/20 hover:border-${insight.color}-500/40 transition-all duration-300`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300 text-sm md:text-lg">"{insight.insight}"</span>
                          <span className={`text-xs px-2 py-1 rounded-full bg-${insight.color}-500/20 text-${insight.color}-400`}>
                            {insight.confidence}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700/30 rounded-full h-1.5 md:h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: insight.confidence }}
                            transition={{ delay: index * 0.2 + 0.5, duration: 1 }}
                            className={`h-1.5 md:h-2 rounded-full bg-gradient-to-r from-${insight.color}-500 to-${insight.color}-400`}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Floating Stats - Responsive */}
                <div className="absolute top-4 md:top-8 right-4 md:right-8 space-y-2 md:space-y-4">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, -2, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl md:rounded-2xl p-2 md:p-4 border border-green-500/30"
                  >
                    <div className="text-lg md:text-2xl font-bold text-green-400">1,247</div>
                    <div className="text-xs text-gray-400">DOCUMENTS</div>
                  </motion.div>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, -2, 2, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                    className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-xl md:rounded-2xl p-2 md:p-4 border border-blue-500/30"
                  >
                    <div className="text-lg md:text-2xl font-bold text-blue-400">3,891</div>
                    <div className="text-xs text-gray-400">INSIGHTS</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Final CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-32 w-full relative"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-electric-500/5 via-transparent to-purple-500/5 rounded-3xl"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
          
          {/* Floating Background Elements */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -20, 0],
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.8
              }}
              className="absolute w-2 h-2 bg-electric-400 rounded-full"
              style={{
                left: `${20 + (i * 15)}%`,
                top: `${30 + (i % 3) * 20}%`
              }}
            />
          ))}
          
          <div className="max-w-6xl mx-auto px-4 relative z-10">
            <div className="text-center">
              {/* Enhanced Icon with Particles */}
              <div className="relative mb-12">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0],
                    boxShadow: [
                      "0 0 40px rgba(59, 130, 246, 0.4)",
                      "0 0 80px rgba(59, 130, 246, 0.8)",
                      "0 0 120px rgba(168, 85, 247, 0.6)",
                      "0 0 40px rgba(59, 130, 246, 0.4)"
                    ]
                  }}
                  transition={{ 
                    scale: { duration: 4, repeat: Infinity },
                    rotate: { duration: 6, repeat: Infinity },
                    boxShadow: { duration: 3, repeat: Infinity }
                  }}
                  className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-electric-500/60 to-purple-500/60 rounded-full flex items-center justify-center border border-electric-500/70 backdrop-blur-sm mx-auto relative"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 360]
                    }}
                    transition={{ 
                      scale: { duration: 3, repeat: Infinity },
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" }
                    }}
                  >
                    <Users className="w-16 h-16 md:w-20 md:h-20 text-electric-400" />
                  </motion.div>
                  
                  {/* Orbiting Elements */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ rotate: 360 }}
                      transition={{ 
                        duration: 8 + i * 2, 
                        repeat: Infinity, 
                        ease: "linear" 
                      }}
                      className="absolute inset-0"
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.3, 1],
                          opacity: [0.6, 1, 0.6]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          delay: i * 0.5 
                        }}
                        className={`absolute w-3 h-3 rounded-full ${
                          i === 0 ? 'bg-electric-400' : 
                          i === 1 ? 'bg-purple-400' : 'bg-pink-400'
                        }`}
                        style={{
                          top: '10%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          transformOrigin: '50% 400%'
                        }}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
              
              {/* Enhanced Typography with Staggered Animation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Ready to build your{' '}
                  <motion.span
                    animate={{ 
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "linear" 
                    }}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-electric-500 via-purple-500 to-electric-500 bg-[length:200%_100%]"
                  >
                    AI Second Brain
                  </motion.span>
                  ?
                </h3>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
                  Join the future of personal knowledge management.{' '}
                  <span className="text-electric-400 font-medium">Your AI assistant for everything you know.</span>
                </p>
              </motion.div>
              
              {/* Enhanced CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                viewport={{ once: true }}
                className="flex flex-col items-center space-y-6"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group"
                >
                  {/* Button Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-electric-500 to-purple-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                  
                  <button
                    onClick={() => setAuthMode('login')}
                    className="relative bg-gradient-to-r from-electric-500 to-purple-500 hover:from-electric-400 hover:to-purple-400 text-white font-bold text-lg md:text-xl py-4 md:py-5 px-8 md:px-12 rounded-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3 shadow-2xl shadow-electric-500/25 border border-electric-400/20"
                  >
                    <span>Sign In</span>
                    <motion.div
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                    </motion.div>
                  </button>
                </motion.div>
                
                {/* Enhanced Secondary CTA */}
                <motion.button
                  onClick={handleSkip}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-gray-400 hover:text-white font-medium py-2 px-4 transition-all duration-300 text-sm md:text-base group"
                >
                  <span className="relative">
                    Try Demo First
                    <motion.div
                      className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-electric-400 to-purple-400 group-hover:w-full transition-all duration-300"
                    />
                  </span>
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Secondary CTA - Subtle option at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full flex justify-center"
        >
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-white font-medium py-2 px-4 transition-colors duration-200 text-sm"
          >
            Try Demo First
          </button>
        </motion.div>
        
        {/* Footer */}
        <footer className="bg-gray-900/80 border-t border-gray-700/50 py-12 mt-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col items-center space-y-4">
              {/* Legal Links */}
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 text-sm text-gray-400">
                <a href="/terms" className="hover:text-white transition-colors duration-200">Terms of Service</a>
                <a href="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
                <button 
                  onClick={() => {
                    const email = 'aincorphelp@gmail.com';
                    const subject = 'Contact Velora Support';
                    const body = 'Hello,\n\nI would like to get in touch regarding:';
                    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                  }}
                  className="hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  Contact
                </button>
              </div>
              
              {/* Copyright and Attribution */}
              <div className="text-sm text-gray-500 text-center">
                © 2024 Velora AI. All rights reserved. • Engineered by <a href="https://aincorp.co" target="_blank" rel="noopener noreferrer" className="text-electric-400 hover:text-electric-300 transition-colors duration-200 font-medium">Aincorp</a>, San Francisco
              </div>
            </div>
          </div>
        </footer>
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
                ? 'Start your productivity journey with Velora AI' 
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

            {/* Password Confirmation - Only show on signup */}
            {authMode === 'signup' && (
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value })
                      if (passwordError) setPasswordError('')
                    }}
                    className={`w-full bg-gray-800 border rounded-lg px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-all duration-200 text-sm md:text-base ${
                      passwordError 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-600 focus:border-electric-500 focus:ring-electric-500'
                    }`}
                    placeholder="Confirm your password"
                    required
                  />
                </div>
                {passwordError && (
                  <p className="text-red-400 text-sm mt-1">{passwordError}</p>
                )}
              </div>
            )}

            {/* Remember Me Checkbox - Only show on login */}
            {authMode === 'login' && (
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-electric-600 bg-gray-800 border-gray-600 rounded focus:ring-electric-500 focus:ring-2"
                />
                <label htmlFor="rememberMe" className="text-gray-300 text-sm">
                  Keep me signed in
                </label>
              </div>
            )}

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
        
        {/* Footer */}
        <footer className="bg-gray-900/50 border-t border-gray-800/50 py-8 mt-20">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
              <span>© 2024 Velora AI. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </div>
    )
  }
}
