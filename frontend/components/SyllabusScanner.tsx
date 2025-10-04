'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  FileText, 
  Calendar, 
  Clock, 
  BookOpen, 
  AlertCircle, 
  CheckCircle, 
  Brain,
  GraduationCap,
  Target,
  TrendingUp,
  Users,
  Lightbulb,
  Zap
} from 'lucide-react'
import { syllabusService, SyllabusAnalysis } from '../lib/syllabusService'
import { toast } from 'react-hot-toast'

interface SyllabusScannerProps {
  onClose: () => void
}

const SyllabusScanner: React.FC<SyllabusScannerProps> = ({ onClose }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<SyllabusAnalysis | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    await processFile(file)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      await processFile(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => {
    setDragActive(false)
  }

  const processFile = async (file: File) => {
    // Validate file type
    if (!file.type.includes('pdf') && !file.type.startsWith('image/')) {
      toast.error('Please upload a PDF or image file')
      return
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error(`File too large. Maximum size is 10MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`)
      return
    }

    setIsAnalyzing(true)
    try {
      const result = await syllabusService.analyzeSyllabus(file)
      setAnalysis(result)
      toast.success('Syllabus analyzed successfully!')
    } catch (error) {
      console.error('Syllabus analysis error:', error)
      toast.error('Failed to analyze syllabus. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900/95 backdrop-blur-xl border border-purple-500/20 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg"
            >
              <GraduationCap className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">Smart Syllabus Scanner</h2>
              <p className="text-sm text-gray-400">AI-powered course analysis and planning</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <AnimatePresence mode="wait">
            {!analysis ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6"
              >
                {/* Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                    dragActive 
                      ? 'border-purple-400 bg-purple-900/10' 
                      : 'border-gray-600 hover:border-purple-400 hover:bg-purple-900/5'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <motion.div
                    animate={isAnalyzing ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1, repeat: isAnalyzing ? Infinity : 0 }}
                    className="flex flex-col items-center space-y-4"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full">
                          <Brain className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Analyzing Syllabus...</h3>
                          <p className="text-sm text-gray-400">Extracting course information and creating your study plan</p>
                        </div>
                        <div className="flex space-x-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ 
                                duration: 0.6, 
                                repeat: Infinity, 
                                delay: i * 0.2 
                              }}
                              className="w-2 h-2 bg-purple-400 rounded-full"
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full">
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Upload Your Syllabus</h3>
                          <p className="text-sm text-gray-400">
                            Drag and drop your PDF or image, or click to browse
                          </p>
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 font-medium"
                        >
                          Choose File
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </>
                    )}
                  </motion.div>
                </div>

                {/* Features */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: Calendar, title: "Auto Calendar", desc: "Creates events for classes, exams, and deadlines" },
                    { icon: Clock, title: "Smart Reminders", desc: "Sets up study reminders and deadline alerts" },
                    { icon: Target, title: "Workload Analysis", desc: "Analyzes course difficulty and time requirements" },
                    { icon: Brain, title: "Study Planning", desc: "Generates personalized study recommendations" }
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50"
                    >
                      <feature.icon className="w-6 h-6 text-purple-400 mb-2" />
                      <h4 className="font-semibold text-white text-sm">{feature.title}</h4>
                      <p className="text-xs text-gray-400">{feature.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 space-y-6"
              >
                {/* Course Header */}
                <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{analysis.courseInfo.courseName}</h3>
                      <p className="text-purple-300">{analysis.courseInfo.courseCode} • {analysis.courseInfo.instructor}</p>
                      <p className="text-gray-400 text-sm mt-1">{analysis.courseInfo.semester} • {analysis.courseInfo.credits} credits</p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${syllabusService.getWorkloadColor(analysis.analysis.workloadLevel)} bg-gray-800/50`}>
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {analysis.analysis.workloadLevel.toUpperCase()} WORKLOAD
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        {analysis.analysis.recommendedStudyHours} hrs/week recommended
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-300 mt-3">{analysis.courseInfo.description}</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Exams", value: analysis.exams.length, icon: FileText, color: "text-red-400" },
                    { label: "Assignments", value: analysis.assignments.length, icon: BookOpen, color: "text-blue-400" },
                    { label: "Important Dates", value: analysis.importantDates.length, icon: Calendar, color: "text-green-400" },
                    { label: "Readings", value: analysis.readings.length, icon: BookOpen, color: "text-purple-400" }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700/50"
                    >
                      <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Important Dates */}
                {analysis.importantDates.length > 0 && (
                  <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
                      Important Dates
                    </h4>
                    <div className="space-y-3">
                      {analysis.importantDates.slice(0, 5).map((date, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                        >
                          <div>
                            <h5 className="font-medium text-white">{date.title}</h5>
                            <p className="text-sm text-gray-400">{date.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-white">{formatDate(date.date)}</div>
                            <div className={`text-xs px-2 py-1 rounded-full ${syllabusService.getPriorityColor(date.priority)}`}>
                              {date.priority}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Success Tips */}
                {analysis.analysis.successTips.length > 0 && (
                  <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-500/20">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Lightbulb className="w-5 h-5 text-yellow-400 mr-2" />
                      Success Tips
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {analysis.analysis.successTips.map((tip, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start space-x-2 p-3 bg-gray-800/30 rounded-lg"
                        >
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-300">{tip}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <button
                    onClick={() => setAnalysis(null)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Analyze Another
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default SyllabusScanner
