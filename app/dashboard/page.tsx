'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, Search, Bell, Calendar, Settings, Plus, Filter } from 'lucide-react'
import { VoiceRecorder } from '@/components/VoiceRecorder'

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const mockNotes = [
    {
      id: '1',
      text: 'Call John tomorrow at 3pm about the project deadline',
      tags: ['project', 'deadline', 'John'],
      createdAt: new Date(),
      hasReminder: true,
      isPinned: true
    },
    {
      id: '2',
      text: 'Review the budget proposal for Q1 next week',
      tags: ['budget', 'Q1', 'review'],
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      hasReminder: true,
      isPinned: false
    },
    {
      id: '3',
      text: 'Follow up with Sarah about the client presentation',
      tags: ['client', 'presentation', 'Sarah'],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      hasReminder: false,
      isPinned: false
    }
  ]

  const filters = [
    { id: 'all', label: 'All Notes', count: mockNotes.length },
    { id: 'pinned', label: 'Pinned', count: mockNotes.filter(n => n.isPinned).length },
    { id: 'reminders', label: 'With Reminders', count: mockNotes.filter(n => n.hasReminder).length },
    { id: 'recent', label: 'Recent', count: mockNotes.filter(n => 
      new Date().getTime() - n.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000
    ).length }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Velora</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Recording */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Capture</h2>
              <VoiceRecorder />
            </div>
          </div>

          {/* Main Content - Notes */}
          <div className="lg:col-span-2">
            {/* Search and Filters */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search your notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  New Note
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeFilter === filter.id
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {filter.label}
                    <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded-full">
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes List */}
            <div className="space-y-4">
              {mockNotes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {note.isPinned && (
                          <span className="text-primary-600">
                            📌
                          </span>
                        )}
                        {note.hasReminder && (
                          <span className="text-accent-600">
                            🔔
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {note.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-gray-800 mb-3 line-clamp-2">
                        {note.text}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                        <Bell className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {mockNotes.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No notes yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start by recording your first voice note using the recorder on the left.
                </p>
                <button className="btn-primary">
                  <Mic className="w-4 h-4 mr-2" />
                  Record Your First Note
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
