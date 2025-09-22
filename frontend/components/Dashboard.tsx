'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Filter, Calendar, Clock, CheckCircle, Bell, FileText, TrendingUp, Circle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { VoiceRecorder } from './VoiceRecorder'
import { Calendar as CalendarComponent } from './Calendar'
import FileUpload from './FileUpload'
import GoogleWorkspaceIntegration from './GoogleWorkspaceIntegration'

interface Note {
  id: string
  title: string
  content: string
  type: 'voice' | 'text'
  createdAt: Date
  tags: string[]
  priority: 'high' | 'medium' | 'low'
}

interface Reminder {
  id: string
  title: string
  dueAt: Date
  completed: boolean
  priority: 'high' | 'medium' | 'low'
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'reminders' | 'calendar'>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'voice' | 'text'>('all')

  // Handle file content analysis
  const handleFileContentAnalyzed = (fileData: any) => {
    console.log('File analyzed:', fileData);
    // Here you can add the analyzed content to your notes, reminders, etc.
    // For now, we'll just log it
    toast.success(`Document "${fileData.fileName}" analyzed and organized!`);
  }

  // Mock data
  const mockNotes: Note[] = [
    {
      id: '1',
      title: 'Project Meeting Notes',
      content: 'Discussed Q4 goals and timeline for the new feature launch.',
      type: 'voice',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      tags: ['work', 'meeting', 'project'],
      priority: 'high'
    },
    {
      id: '2',
      title: 'Grocery List',
      content: 'Milk, bread, eggs, and vegetables for the week.',
      type: 'text',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      tags: ['personal', 'shopping'],
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Ideas for Weekend',
      content: 'Visit the new museum, try that restaurant downtown, call mom.',
      type: 'voice',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      tags: ['personal', 'weekend', 'ideas'],
      priority: 'low'
    }
  ]

  const mockReminders: Reminder[] = [
    {
      id: '1',
      title: 'Call John about project',
      dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      completed: false,
      priority: 'high'
    },
    {
      id: '2',
      title: 'Review quarterly report',
      dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      completed: false,
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Team meeting',
      dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      completed: false,
      priority: 'low'
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-500/10'
      case 'medium': return 'border-yellow-500 bg-yellow-500/10'
      case 'low': return 'border-green-500 bg-green-500/10'
      default: return 'border-gray-500 bg-gray-500/10'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <TrendingUp className="w-4 h-4 text-red-400" />
      case 'medium': return <Clock className="w-4 h-4 text-yellow-400" />
      case 'low': return <CheckCircle className="w-4 h-4 text-green-400" />
      default: return <Circle className="w-4 h-4 text-gray-400" />
    }
  }

  const filteredNotes = mockNotes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFilter = filterType === 'all' || note.type === filterType
    return matchesSearch && matchesFilter
  })

  const upcomingReminders = mockReminders
    .filter(reminder => !reminder.completed)
    .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())
    .slice(0, 5)

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background-card rounded-xl p-4 border border-gray-800/50 shadow-card-glow"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-electric-600/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-electric-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Notes</p>
              <p className="text-2xl font-bold text-gray-100">{mockNotes.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-background-card rounded-xl p-4 border border-gray-800/50 shadow-card-glow"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-100">{upcomingReminders.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-background-card rounded-xl p-4 border border-gray-800/50 shadow-card-glow"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-100">{mockReminders.filter(r => r.completed).length}</p>
            </div>
          </div>
        </motion.div>
      </div>

              {/* Quick Capture */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-background-card rounded-xl p-6 border border-gray-800/50 shadow-card-glow"
        >
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Capture Your Thoughts Before They Disappear</h3>
          <p className="text-gray-400 mb-4">Don't let that brilliant idea slip away. Speak it now and we'll remember it forever.</p>
          <VoiceRecorder />
        </motion.div>

        {/* Document Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-background-card rounded-xl p-6 border border-gray-800/50 shadow-card-glow"
        >
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Upload Documents for AI Analysis</h3>
          <p className="text-gray-400 mb-4">Drop PDFs, Word docs, or text files. Our AI will read, understand, and organize everything intelligently.</p>
          <FileUpload onContentAnalyzed={handleFileContentAnalyzed} />
        </motion.div>

        {/* Google Workspace Integration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <GoogleWorkspaceIntegration />
        </motion.div>

      {/* Upcoming Reminders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-background-card rounded-xl p-6 border border-gray-800/50 shadow-card-glow"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-100">Upcoming Reminders</h3>
          <button className="text-electric-400 hover:text-electric-300 text-sm">View All</button>
        </div>
        <div className="space-y-3">
          {upcomingReminders.map(reminder => (
            <div
              key={reminder.id}
              className={`p-3 rounded-lg border-l-4 ${getPriorityColor(reminder.priority)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getPriorityIcon(reminder.priority)}
                  <span className="text-gray-200 font-medium">{reminder.title}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {reminder.dueAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )

  const renderNotes = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Find that thought you had yesterday... or last week... or whenever..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background-elevated border border-gray-700 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-4 py-2 bg-background-elevated border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-electric-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="voice">Voice Notes</option>
          <option value="text">Text Notes</option>
        </select>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.map(note => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-background-card rounded-xl p-4 border border-gray-800/50 shadow-card-glow hover:shadow-card-glow-accent transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="text-lg font-semibold text-gray-100">{note.title}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    note.type === 'voice' 
                      ? 'bg-electric-600/20 text-electric-400' 
                      : 'bg-accent-600/20 text-accent-400'
                  }`}>
                    {note.type === 'voice' ? 'Voice' : 'Text'}
                  </span>
                </div>
                <p className="text-gray-300 mb-3">{note.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {note.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-background-elevated text-gray-400 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">
                    {note.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const renderReminders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-100">All Reminders</h3>
        <button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Reminder
        </button>
      </div>
      
      <div className="space-y-4">
        {mockReminders.map(reminder => (
          <motion.div
            key={reminder.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-4 rounded-lg border-l-4 ${getPriorityColor(reminder.priority)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={reminder.completed}
                  onChange={() => {/* Handle completion */}}
                  className="w-4 h-4 text-electric-600 bg-background-elevated border-gray-600 rounded focus:ring-electric-500 focus:ring-2"
                />
                <div>
                  <h4 className={`font-medium ${reminder.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                    {reminder.title}
                  </h4>
                  <p className="text-sm text-gray-400">
                    Due: {reminder.dueAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
              {getPriorityIcon(reminder.priority)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Your Mind, Perfectly Organized</h1>
          <p className="text-gray-400">Never lose another brilliant idea. Everything you think, captured and organized.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {([
            { id: 'overview', label: 'Your Mind at a Glance', icon: TrendingUp },
            { id: 'notes', label: 'All Your Thoughts', icon: FileText },
            { id: 'reminders', label: 'Never Forget', icon: Bell },
            { id: 'calendar', label: 'Stay on Track', icon: Calendar }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-electric-600 text-white shadow-glow'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-background-elevated'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'notes' && renderNotes()}
            {activeTab === 'reminders' && renderReminders()}
            {activeTab === 'calendar' && (
              <div className="space-y-6">
                <CalendarComponent />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
