'use client'
// Force deployment to use updated environment variables

import { useState } from 'react'
import { motion } from 'framer-motion'
import { motion as motion2 } from 'framer-motion'
import { User, Lock, Mail, ArrowRight, Sparkles, Brain, Calendar, Bell, CheckCircle, Clock, Mic, Zap, Target, Lightbulb, MessageSquare, Database, Shield, Rocket, Star, TrendingUp, Users, Globe, Smartphone, Laptop, Crown, FileText } from 'lucide-react'
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
              <p className="text-xl text-gray-300 mb-4 leading-relaxed">
                Your AI-powered personal assistant that remembers everything, organizes your life, and helps you find information instantly.
              </p>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                Stop drowning in information. <span className="text-electric-400">Velora AI</span> connects your emails, documents, and calendar to create your personal knowledge base.
              </p>
              
              {/* Call-to-Action Button - Desktop - Simplified to just Sign In */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setAuthMode('login')}
                  className="bg-gradient-to-r from-electric-500 to-purple-500 hover:from-electric-400 hover:to-purple-400 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2 text-lg"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Free to try</span>
                </div>
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
              className="text-gray-300 text-base md:text-lg leading-relaxed mb-4"
            >
              Your AI-powered personal assistant that remembers everything, organizes your life, and helps you find information instantly.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-gray-400 text-sm md:text-base leading-relaxed mb-8"
            >
              Stop drowning in information. <span className="text-electric-400">Velora AI</span> connects your emails, documents, and calendar to create your personal knowledge base.
            </motion.p>

            {/* CTA Buttons - Simplified to just Sign In */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col space-y-4"
            >
              <button
                onClick={() => setAuthMode('login')}
                className="w-full bg-gradient-to-r from-electric-500 to-purple-500 hover:from-electric-400 hover:to-purple-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Free to try • Secure & Private</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
        </div>

        {/* What Velora Does Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-32 w-full relative overflow-hidden"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 -z-10">
            <motion.div
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-electric-500/10 to-purple-500/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                x: [0, -100, 0],
                y: [0, 50, 0],
                rotate: [360, 180, 0],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-6xl font-bold text-white mb-8"
              >
                Just <motion.span 
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-electric-500 via-purple-500 to-electric-500 bg-[length:200%_100%]"
                >
                  talk
                </motion.span> to Velora
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
              >
                No learning curve. No complex setup. Just natural conversation.
              </motion.p>
            </div>
            
            <div className="space-y-20">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -8,
                  rotateY: 5,
                  transition: { duration: 0.3 }
                }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/60 rounded-3xl p-12 border border-electric-500/30 hover:border-electric-500/60 transition-all duration-500 backdrop-blur-sm max-w-5xl mx-auto overflow-hidden"
              >
                {/* Animated border gradient */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-electric-500/20 via-blue-500/20 to-electric-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/60" />
                
                <div className="relative z-10 flex items-center space-x-8">
                  <motion.div
                    whileHover={{ 
                      scale: 1.1,
                      rotate: [0, -10, 10, 0],
                      transition: { duration: 0.5 }
                    }}
                    className="relative w-24 h-24 bg-gradient-to-br from-electric-500/40 to-blue-500/40 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-br from-electric-500/30 to-blue-500/30 rounded-2xl blur-md"
                    />
                    <MessageSquare className="w-12 h-12 text-electric-400 relative z-10" />
                  </motion.div>
                  <div className="flex-1">
                    <motion.h4 
                      whileHover={{ x: 5 }}
                      className="text-2xl font-bold text-white mb-4"
                    >
                      You say: <motion.span 
                        whileHover={{ scale: 1.05 }}
                        className="text-electric-400 bg-gradient-to-r from-electric-400 to-blue-400 bg-clip-text text-transparent"
                      >
                        "I have a meeting with John next Tuesday"
                      </motion.span>
                    </motion.h4>
                    <motion.p 
                      whileHover={{ x: 5 }}
                      className="text-gray-300 text-lg leading-relaxed"
                    >
                      Velora creates the calendar event and sets a reminder automatically.
                    </motion.p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -8,
                  rotateY: -5,
                  transition: { duration: 0.3 }
                }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/60 rounded-3xl p-12 border border-purple-500/30 hover:border-purple-500/60 transition-all duration-500 backdrop-blur-sm max-w-5xl mx-auto overflow-hidden"
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/60" />
                
                <div className="relative z-10 flex items-center space-x-8">
                  <motion.div
                    whileHover={{ 
                      scale: 1.1,
                      rotate: [0, 10, -10, 0],
                      transition: { duration: 0.5 }
                    }}
                    className="relative w-24 h-24 bg-gradient-to-br from-purple-500/40 to-pink-500/40 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl blur-md"
                    />
                    <Brain className="w-12 h-12 text-purple-400 relative z-10" />
                  </motion.div>
                  <div className="flex-1">
                    <motion.h4 
                      whileHover={{ x: 5 }}
                      className="text-2xl font-bold text-white mb-4"
                    >
                      You ask: <motion.span 
                        whileHover={{ scale: 1.05 }}
                        className="text-purple-400 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                      >
                        "What did we decide in last week's meeting?"
                      </motion.span>
                    </motion.h4>
                    <motion.p 
                      whileHover={{ x: 5 }}
                      className="text-gray-300 text-lg leading-relaxed"
                    >
                      Velora searches your documents and emails to find the answer instantly.
                    </motion.p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -8,
                  rotateY: 5,
                  transition: { duration: 0.3 }
                }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/60 rounded-3xl p-12 border border-green-500/30 hover:border-green-500/60 transition-all duration-500 backdrop-blur-sm max-w-5xl mx-auto overflow-hidden"
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/60" />
                
                <div className="relative z-10 flex items-center space-x-8">
                  <motion.div
                    whileHover={{ 
                      scale: 1.1,
                      rotate: [0, -10, 10, 0],
                      transition: { duration: 0.5 }
                    }}
                    className="relative w-24 h-24 bg-gradient-to-br from-green-500/40 to-emerald-500/40 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-2xl blur-md"
                    />
                    <Bell className="w-12 h-12 text-green-400 relative z-10" />
                  </motion.div>
                  <div className="flex-1">
                    <motion.h4 
                      whileHover={{ x: 5 }}
                      className="text-2xl font-bold text-white mb-4"
                    >
                      You tell: <motion.span 
                        whileHover={{ scale: 1.05 }}
                        className="text-green-400 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                      >
                        "Remind me to call the client tomorrow"
                      </motion.span>
                    </motion.h4>
                    <motion.p 
                      whileHover={{ x: 5 }}
                      className="text-gray-300 text-lg leading-relaxed"
                    >
                      Velora sets a smart reminder that knows when you actually need it.
                    </motion.p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -8,
                  rotateY: -5,
                  transition: { duration: 0.3 }
                }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/60 rounded-3xl p-12 border border-yellow-500/30 hover:border-yellow-500/60 transition-all duration-500 backdrop-blur-sm max-w-5xl mx-auto overflow-hidden"
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/60" />
                
                <div className="relative z-10 flex items-center space-x-8">
                  <motion.div
                    whileHover={{ 
                      scale: 1.1,
                      rotate: [0, 10, -10, 0],
                      transition: { duration: 0.5 }
                    }}
                    className="relative w-24 h-24 bg-gradient-to-br from-yellow-500/40 to-orange-500/40 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                      className="absolute inset-0 bg-gradient-to-br from-yellow-500/30 to-orange-500/30 rounded-2xl blur-md"
                    />
                    <FileText className="w-12 h-12 text-yellow-400 relative z-10" />
                  </motion.div>
                  <div className="flex-1">
                    <motion.h4 
                      whileHover={{ x: 5 }}
                      className="text-2xl font-bold text-white mb-4"
                    >
                      You upload: <motion.span 
                        whileHover={{ scale: 1.05 }}
                        className="text-yellow-400 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"
                      >
                        A 50-page research paper
                      </motion.span>
                    </motion.h4>
                    <motion.p 
                      whileHover={{ x: 5 }}
                      className="text-gray-300 text-lg leading-relaxed"
                    >
                      Velora reads, understands, and organizes it. Ask questions anytime.
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center mt-24"
            >
              <motion.p 
                whileHover={{ scale: 1.02 }}
                className="text-2xl text-gray-300 mb-12"
              >
                That's it. No steps. No complexity. Just <motion.span 
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 via-purple-400 to-electric-400 bg-[length:200%_100%] font-semibold"
                >
                  natural conversation
                </motion.span>.
              </motion.p>
              <motion.div
                whileHover={{ 
                  scale: 1.05,
                  rotateX: 5,
                  transition: { duration: 0.3 }
                }}
                className="inline-block"
              >
                <motion.button
                  whileHover={{ 
                    boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)",
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setAuthMode('login')}
                  className="relative bg-gradient-to-r from-electric-500 to-purple-500 hover:from-electric-400 hover:to-purple-400 text-white font-semibold py-5 px-16 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-4 mx-auto text-xl overflow-hidden group"
                >
                  <motion.div
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                  <span className="relative z-10">Start Talking to Velora</span>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="relative z-10"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </motion.div>
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* MVP Value Proposition Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-32 w-full relative overflow-hidden"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 -z-10">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute top-1/2 left-1/4 w-96 h-96 bg-gradient-to-r from-electric-500/20 to-purple-500/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{ duration: 10, repeat: Infinity, delay: 2 }}
              className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            {/* MVP Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center mb-20"
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="inline-block mb-6"
              >
                <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">
                  🚀 Now in Beta - Free Access
                </span>
              </motion.div>
              
              <h3 className="text-6xl font-bold text-white mb-6">
                Be Among the <motion.span 
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-electric-500 via-purple-500 to-electric-500 bg-[length:200%_100%]"
                >
                  First
                </motion.span> to Experience the Future
              </h3>
              <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
                Join our beta and help shape the next generation of AI-powered productivity tools
              </p>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex items-center justify-center space-x-8 text-sm text-gray-400"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Free during beta</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Direct feedback to developers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Early access to new features</span>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Problem & Solution Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {/* Problem Card */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -5,
                  transition: { duration: 0.3 }
                }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="group relative bg-gradient-to-br from-red-900/20 to-red-800/10 rounded-3xl p-8 border border-red-500/30 hover:border-red-500/60 transition-all duration-500 backdrop-blur-sm overflow-hidden"
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-red-500/5 via-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/60" />
                
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mr-4 shadow-2xl"
                    >
                      <Target className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                      <h4 className="text-white font-bold text-xl">The Problem</h4>
                      <p className="text-gray-400 text-sm">Information Overload</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-gray-300 text-base leading-relaxed">
                        <span className="text-red-400 font-semibold">Drowning in documents:</span> Research papers, meeting notes, emails scattered everywhere
                      </p>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-gray-300 text-base leading-relaxed">
                        <span className="text-red-400 font-semibold">Wasting time searching:</span> Hours spent looking for that one important detail
                      </p>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-gray-300 text-base leading-relaxed">
                        <span className="text-red-400 font-semibold">Missing deadlines:</span> Important tasks buried in the chaos of information
                      </p>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-gray-300 text-base leading-relaxed">
                        <span className="text-red-400 font-semibold">Mental fatigue:</span> Constantly switching between tools and contexts
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
              
              {/* Solution Card */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -5,
                  transition: { duration: 0.3 }
                }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="group relative bg-gradient-to-br from-green-900/20 to-emerald-800/10 rounded-3xl p-8 border border-green-500/30 hover:border-green-500/60 transition-all duration-500 backdrop-blur-sm overflow-hidden"
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/60" />
                
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-4 shadow-2xl"
                    >
                      <Lightbulb className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                      <h4 className="text-white font-bold text-xl">The Solution</h4>
                      <p className="text-gray-400 text-sm">Velora AI</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-gray-300 text-base leading-relaxed">
                        <span className="text-green-400 font-semibold">Unified knowledge base:</span> All your documents, emails, and notes in one intelligent system
                      </p>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-gray-300 text-base leading-relaxed">
                        <span className="text-green-400 font-semibold">Instant answers:</span> Ask questions in natural language and get precise results
                      </p>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-gray-300 text-base leading-relaxed">
                        <span className="text-green-400 font-semibold">Smart automation:</span> Calendar events, reminders, and tasks created automatically
                      </p>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-gray-300 text-base leading-relaxed">
                        <span className="text-green-400 font-semibold">Context awareness:</span> Understands your work patterns and adapts to your needs
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Beta Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-16"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-2xl p-8 border border-electric-500/20 hover:border-electric-500/50 transition-all duration-300"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 bg-gradient-to-r from-electric-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Rocket className="w-8 h-8 text-white" />
                </motion.div>
                <h4 className="text-white font-bold text-lg mb-3">Early Access</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Be among the first to experience cutting-edge AI technology before it goes mainstream
                </p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Users className="w-8 h-8 text-white" />
                </motion.div>
                <h4 className="text-white font-bold text-lg mb-3">Shape the Product</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Your feedback directly influences new features and improvements. Help us build the perfect tool for you
                </p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-2xl p-8 border border-green-500/20 hover:border-green-500/50 transition-all duration-300"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Crown className="w-8 h-8 text-white" />
                </motion.div>
                <h4 className="text-white font-bold text-lg mb-3">Beta Perks</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Free access during beta, priority support, and special pricing when we launch publicly
                </p>
              </motion.div>
            </motion.div>

            {/* Final CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center"
            >
              <motion.p
                whileHover={{ scale: 1.02 }}
                className="text-xl text-gray-300 mb-8"
              >
                Ready to revolutionize how you manage information? Join our beta and be part of the future.
              </motion.p>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-block"
              >
                <motion.button
                  whileHover={{ 
                    boxShadow: "0 20px 40px rgba(139, 92, 246, 0.4)",
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setAuthMode('login')}
                  className="relative bg-gradient-to-r from-electric-500 to-purple-500 hover:from-electric-400 hover:to-purple-400 text-white font-bold py-4 px-12 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 mx-auto text-lg overflow-hidden group"
                >
                  <motion.div
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                  <span className="relative z-10">Join Beta Now</span>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="relative z-10"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </motion.button>
              </motion.div>
              
              <p className="text-sm text-gray-500 mt-4">
                🚀 Free during beta • Direct developer access • Help shape the future
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Feature Showcase Sections - Only visible on scroll */}

        {/* Memory Palace Section - Redesigned */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20 w-full"
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                  boxShadow: [
                    "0 0 30px rgba(59, 130, 246, 0.4)",
                    "0 0 60px rgba(59, 130, 246, 0.8)",
                    "0 0 30px rgba(59, 130, 246, 0.4)"
                  ]
                }}
                transition={{ 
                  scale: { duration: 3, repeat: Infinity },
                  rotate: { duration: 4, repeat: Infinity },
                  boxShadow: { duration: 2, repeat: Infinity }
                }}
                className="w-24 h-24 bg-gradient-to-br from-electric-500/40 to-blue-500/40 rounded-3xl flex items-center justify-center border border-electric-500/60 backdrop-blur-sm mx-auto mb-8"
              >
                <Database className="w-12 h-12 text-electric-400" />
              </motion.div>
              <h3 className="text-5xl font-bold text-white mb-6">
                Finally, <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-500 to-purple-500">everything in one place</span>
              </h3>
              <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                No more hunting through 10 different apps. <span className="text-electric-400">Velora AI</span> finds what you need instantly. 
                <span className="text-electric-400">"What did I decide in last week's meeting?"</span> - Get the answer in seconds.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-2xl p-8 border border-electric-500/20 hover:border-electric-500/50 transition-all duration-300 backdrop-blur-sm"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-16 h-16 bg-gradient-to-br from-electric-500/30 to-blue-500/30 rounded-2xl flex items-center justify-center mb-6"
                >
                  <Target className="w-8 h-8 text-electric-400" />
                </motion.div>
                <h4 className="text-xl font-bold text-white mb-4">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-500 to-purple-500">Stop</span> Searching
                </h4>
                <p className="text-gray-300 text-base leading-relaxed">
                  No more digging through folders. Ask naturally and get instant answers.
                </p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, -10, 10, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  className="w-16 h-16 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl flex items-center justify-center mb-6"
                >
                  <Shield className="w-8 h-8 text-purple-400" />
                </motion.div>
                <h4 className="text-xl font-bold text-white mb-4">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-500 to-purple-500">Save</span> Hours
                </h4>
                <p className="text-gray-300 text-base leading-relaxed">
                  Turn 30-page reports into 5 key points. Get the gist instantly.
                </p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-2xl p-8 border border-green-500/20 hover:border-green-500/50 transition-all duration-300 backdrop-blur-sm"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 15, -15, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  className="w-16 h-16 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-2xl flex items-center justify-center mb-6"
                >
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </motion.div>
                <h4 className="text-xl font-bold text-white mb-4">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-500 to-purple-500">Never</span> Forget
                </h4>
                <p className="text-gray-300 text-base leading-relaxed">
                  Everything you've read, written, and saved. Always accessible, never lost.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Voice Commands Section - Redesigned */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20 w-full"
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <motion.div
                animate={{ 
                  scale: [1, 1.08, 1],
                  boxShadow: [
                    "0 0 50px rgba(59, 130, 246, 0.4)",
                    "0 0 100px rgba(168, 85, 247, 0.6)",
                    "0 0 50px rgba(236, 72, 153, 0.4)"
                  ]
                }}
                transition={{ 
                  scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  boxShadow: { duration: 3, repeat: Infinity }
                }}
                className="w-24 h-24 bg-gradient-to-br from-cyan-400/50 via-purple-500/50 to-pink-500/50 rounded-full flex items-center justify-center border border-cyan-400/60 backdrop-blur-sm mx-auto mb-8"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                    rotate: [0, 180, 360],
                    filter: [
                      "drop-shadow(0 0 15px #06b6d4)",
                      "drop-shadow(0 0 25px #8b5cf6)",
                      "drop-shadow(0 0 15px #ec4899)"
                    ]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Mic className="w-12 h-12" />
                </motion.div>
              </motion.div>
              <h3 className="text-5xl font-bold text-white mb-6">
                Ask <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-500 to-purple-500">anything</span> about your knowledge
              </h3>
              <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Natural language queries. <span className="text-green-400">"Summarize my Q3 report"</span> gets instant insights. 
                <span className="text-green-400">"What did John say about Project Alpha?"</span> finds the exact email. It just works.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-2xl p-8 border border-green-500/20 hover:border-green-500/50 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-2xl flex items-center justify-center mb-6">
                  <Bell className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="text-xl font-bold text-white mb-4">Document Intelligence</h4>
                <p className="text-gray-300 text-base leading-relaxed italic mb-4">
                  "What are the key takeaways from my research papers?"
                </p>
                <p className="text-gray-400 text-sm">
                  AI analyzes your PDFs, emails, and documents to extract insights instantly.
                </p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-2xl p-8 border border-blue-500/20 hover:border-blue-500/50 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-2xl flex items-center justify-center mb-6">
                  <Calendar className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="text-xl font-bold text-white mb-4">Cross-Document Queries</h4>
                <p className="text-gray-300 text-base leading-relaxed italic mb-4">
                  "Gather insights from my meeting notes and project docs"
                </p>
                <p className="text-gray-400 text-sm">
                  Ask questions that span multiple documents and get coherent answers.
                </p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl flex items-center justify-center mb-6">
                  <Database className="w-8 h-8 text-purple-400" />
                </div>
                <h4 className="text-xl font-bold text-white mb-4">Personal Knowledge Base</h4>
                <p className="text-gray-300 text-base leading-relaxed italic mb-4">
                  "What did I learn about machine learning last month?"
                </p>
                <p className="text-gray-400 text-sm">
                  Your personal knowledge base that knows everything you've read, written, and saved.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Smart Organization Section - Redesigned */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20 w-full"
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <div className="flex justify-center space-x-6 mb-8">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                    boxShadow: [
                      "0 0 30px rgba(168, 85, 247, 0.4)",
                      "0 0 60px rgba(168, 85, 247, 0.8)",
                      "0 0 30px rgba(168, 85, 247, 0.4)"
                    ]
                  }}
                  transition={{ 
                    scale: { duration: 3, repeat: Infinity },
                    rotate: { duration: 4, repeat: Infinity },
                    boxShadow: { duration: 2, repeat: Infinity }
                  }}
                  className="w-20 h-20 bg-gradient-to-br from-purple-500/40 to-pink-500/40 rounded-3xl flex items-center justify-center border border-purple-500/60 backdrop-blur-sm"
                >
                  <Calendar className="w-10 h-10 text-purple-400" />
                </motion.div>
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, -10, 10, 0],
                    boxShadow: [
                      "0 0 30px rgba(251, 191, 36, 0.4)",
                      "0 0 60px rgba(251, 191, 36, 0.8)",
                      "0 0 30px rgba(251, 191, 36, 0.4)"
                    ]
                  }}
                  transition={{ 
                    scale: { duration: 3, repeat: Infinity, delay: 0.5 },
                    rotate: { duration: 4, repeat: Infinity, delay: 0.5 },
                    boxShadow: { duration: 2, repeat: Infinity, delay: 0.5 }
                  }}
                  className="w-20 h-20 bg-gradient-to-br from-yellow-500/40 to-orange-500/40 rounded-3xl flex items-center justify-center border border-yellow-500/60 backdrop-blur-sm"
                >
                  <Bell className="w-10 h-10 text-yellow-400" />
                </motion.div>
              </div>
              <h3 className="text-5xl font-bold text-white mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-500 to-purple-500">Never</span> Miss Anything
              </h3>
              <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Your life, perfectly organized. <span className="text-purple-400">Smart scheduling</span> that adapts to you. 
                <span className="text-yellow-400">Intelligent reminders</span> that actually help.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 15, -15, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-16 h-16 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl flex items-center justify-center mb-6"
                >
                  <Rocket className="w-8 h-8 text-purple-400" />
                </motion.div>
                <h4 className="text-xl font-bold text-white mb-4">Auto-Scheduling</h4>
                <p className="text-gray-300 text-base leading-relaxed italic mb-4">
                  "Meeting with John next Tuesday"
                </p>
                <p className="text-gray-400 text-sm">
                  Becomes a calendar event automatically. No forms, no clicks, just magic.
                </p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-2xl p-8 border border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300 backdrop-blur-sm"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, -15, 15, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.3 }}
                  className="w-16 h-16 bg-gradient-to-br from-yellow-500/30 to-orange-500/30 rounded-2xl flex items-center justify-center mb-6"
                >
                  <Star className="w-8 h-8 text-yellow-400" />
                </motion.div>
                <h4 className="text-xl font-bold text-white mb-4">Smart Reminders</h4>
                <p className="text-gray-300 text-base leading-relaxed italic mb-4">
                  "Remind me about the presentation"
                </p>
                <p className="text-gray-400 text-sm">
                  Context-aware reminders that know when you actually need them.
                </p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-2xl p-8 border border-blue-500/20 hover:border-blue-500/50 transition-all duration-300 backdrop-blur-sm"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 20, -20, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.6 }}
                  className="w-16 h-16 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-2xl flex items-center justify-center mb-6"
                >
                  <Smartphone className="w-8 h-8 text-blue-400" />
                </motion.div>
                <h4 className="text-xl font-bold text-white mb-4">Mobile Perfect</h4>
                <p className="text-gray-300 text-base leading-relaxed italic mb-4">
                  "Show me my week"
                </p>
                <p className="text-gray-400 text-sm">
                  Weekly and monthly views designed for mobile. Perfect on any device.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* New Interactive Demo Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20 w-full"
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    "0 0 40px rgba(59, 130, 246, 0.5)",
                    "0 0 80px rgba(59, 130, 246, 0.8)",
                    "0 0 40px rgba(59, 130, 246, 0.5)"
                  ]
                }}
                transition={{ 
                  scale: { duration: 4, repeat: Infinity },
                  boxShadow: { duration: 2, repeat: Infinity }
                }}
                className="w-32 h-32 bg-gradient-to-br from-electric-500/50 to-purple-500/50 rounded-full flex items-center justify-center border border-electric-500/70 backdrop-blur-sm mx-auto mb-8"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    scale: { duration: 2, repeat: Infinity }
                  }}
                >
                  <Users className="w-16 h-16 text-electric-400" />
                </motion.div>
              </motion.div>
              <h3 className="text-5xl font-bold text-white mb-6">
                Ready to build your <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-500 to-purple-500">AI Second Brain</span>?
              </h3>
              <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
                Join the future of personal knowledge management. <span className="text-electric-400">Your AI assistant for everything you know.</span>
              </p>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <button
                  onClick={() => setAuthMode('login')}
                  className="bg-gradient-to-r from-electric-500 to-purple-500 hover:from-electric-400 hover:to-purple-400 text-white font-bold text-xl py-4 px-12 rounded-2xl transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-3 shadow-2xl shadow-electric-500/25"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-6 h-6" />
                </button>
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
