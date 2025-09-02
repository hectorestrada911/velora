'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Play, Square, Clock, Search, Bell, Calendar, Download } from 'lucide-react'
import { VoiceRecorder } from '@/components/VoiceRecorder'
import { FeatureCard } from '@/components/FeatureCard'
import { PricingSection } from '@/components/PricingSection'
import { Dashboard } from '@/components/Dashboard'
import { Header } from '@/components/Header'
import FileUpload from '@/components/FileUpload'

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
              Never Forget Another{' '}
              <span className="text-gradient-primary glow-text">Thought Again</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
            >
              Your mind is a goldmine of ideas. Don't let them slip away. Speak what you need to remember, and we'll make sure you never lose track of what matters.
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
                Start Capturing Your Thoughts
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

          {/* Document Upload Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-4xl mx-auto mt-16"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-gray-100 mb-3">
                Or Upload Documents for AI Analysis
              </h3>
              <p className="text-gray-400">
                Drop PDFs, Word docs, or text files. Our AI will read, understand, and organize everything intelligently.
              </p>
            </div>
            <FileUpload onContentAnalyzed={(data) => console.log('Document analyzed:', data)} />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-100 mb-4">
              Stop Losing Your Brilliant Ideas
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Your mind works faster than your fingers. Don't let great thoughts disappear into thin air.
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
              Never Miss Another Important Thought
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Three simple steps to ensure your ideas are captured, organized, and never forgotten.
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
              <h3 className="text-xl font-semibold text-gray-100 mb-3">Capture Everything</h3>
              <p className="text-gray-400">Speak what's on your mind before it slips away. No more forgotten ideas.</p>
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
              <h3 className="text-xl font-semibold text-gray-100 mb-3">Smart Processing</h3>
              <p className="text-gray-400">AI understands what matters and turns your ramblings into actionable insights.</p>
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
              <h3 className="text-xl font-semibold text-gray-100 mb-3">Stay Organized</h3>
              <p className="text-gray-400">Everything you need, when you need it. Never lose track of what matters again.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />
    </div>
  )
}
