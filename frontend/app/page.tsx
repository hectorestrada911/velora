'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Play, Square, Clock, Search, Bell, Calendar, Download } from 'lucide-react'
import { VoiceRecorder } from '@/components/VoiceRecorder'
import { FeatureCard } from '@/components/FeatureCard'
import { PricingSection } from '@/components/PricingSection'
import { Dashboard } from '@/components/Dashboard'
import { Header } from '@/components/Header'

export default function HomePage() {
  const [isRecording, setIsRecording] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  if (showDashboard) {
    return <Dashboard />
  }

  const features = [
    {
      icon: <Mic className="w-8 h-8 text-electric-400" />,
      title: "Fastest Input",
      description: "Tap, talk, done. No typing required.",
      color: "from-electric-500 to-electric-600"
    },
    {
      icon: <Bell className="w-8 h-8 text-accent-400" />,
      title: "Smart Reminders",
      description: "Auto-detects tasks & dates from your voice.",
      color: "from-accent-500 to-accent-600"
    },
    {
      icon: <Search className="w-8 h-8 text-electric-400" />,
      title: "Searchable",
      description: "Find any thought in seconds.",
      color: "from-electric-500 to-electric-600"
    },
    {
      icon: <Download className="w-8 h-8 text-accent-400" />,
      title: "Private by Default",
      description: "Audio deleted after transcription.",
      color: "from-accent-500 to-accent-600"
    }
  ]

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background-secondary to-background-tertiary opacity-80"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold text-gray-100 mb-6"
            >
              Speak. We{' '}
              <span className="text-gradient-primary glow-text">organize.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
            >
              Capture ideas and tasks with your voice. Get searchable notes, smart reminders, and a weekly recap—automatically.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-16"
            >
              <button 
                onClick={() => setShowDashboard(true)}
                className="btn-primary text-lg px-8 py-4 animate-glow"
              >
                Try Dashboard
              </button>
            </motion.div>
          </div>

          {/* Recording Interface */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <VoiceRecorder />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-100 mb-4">
              Why Voice-First Works
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              We've learned from the failures of other voice apps. Here's what makes Velora different.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-100 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Three simple steps to turn your voice into organized, actionable content.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-electric-500 to-electric-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-3">Record</h3>
              <p className="text-gray-400">Tap and hold to record your thoughts, ideas, or tasks.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-electric-500 to-electric-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-3">Process</h3>
              <p className="text-gray-400">AI transcribes and extracts tasks, dates, and key information.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-electric-500 to-electric-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-3">Organize</h3>
              <p className="text-gray-400">Get searchable notes, smart reminders, and weekly summaries.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />
    </div>
  )
}
