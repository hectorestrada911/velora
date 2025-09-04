'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, MapPin, User, Plus, ChevronLeft, ChevronRight, X, Edit, Trash2 } from 'lucide-react'
import { calendarService, CalendarEvent } from '@/lib/calendarService'
import { toast } from 'react-hot-toast'

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [newEvent, setNewEvent] = useState({
    title: '',
    startTime: '',
    endTime: '',
    description: '',
    location: ''
  })

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      // Load real events from calendar service
      const storedEvents = calendarService.getStoredEvents()
      const realEvents: CalendarEvent[] = storedEvents.map(event => ({
        title: event.title,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
        description: event.description,
        location: event.location
      }))
      
      // If no real events, show some sample events
      if (realEvents.length === 0) {
        const sampleEvents: CalendarEvent[] = [
          {
            title: 'Welcome to Velora!',
            startTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
            endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
            description: 'Your AI assistant is ready to help you manage your schedule',
            location: 'Velora App'
          }
        ]
        setEvents(sampleEvents)
      } else {
        setEvents(realEvents)
      }
    } catch (error) {
      console.error('Failed to load events:', error)
      toast.error('Failed to load calendar events')
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const getWeekDates = (date: Date) => {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    
    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      weekDates.push(day)
    }
    return weekDates
  }

  const getDayEvents = (date: Date) => {
    const dayEvents = getEventsForDate(date)
    return dayEvents.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.startTime) {
      toast.error('Please fill in the required fields')
      return
    }

    try {
      const event: CalendarEvent = {
        title: newEvent.title,
        startTime: new Date(newEvent.startTime),
        endTime: new Date(newEvent.endTime || newEvent.startTime),
        description: newEvent.description,
        location: newEvent.location
      }

      const success = await calendarService.addToGoogleCalendar(event)
      if (success) {
        await loadEvents() // Reload events from storage
        setShowAddEvent(false)
        setNewEvent({ title: '', startTime: '', endTime: '', description: '', location: '' })
        toast.success('Event added successfully!')
      } else {
        toast.error('Failed to add event')
      }
    } catch (error) {
      console.error('Failed to add event:', error)
      toast.error('Failed to add event')
    }
  }

  const handleDeleteEvent = async (eventToDelete: CalendarEvent) => {
    try {
      setEvents(prev => prev.filter(event => event !== eventToDelete))
      toast.success('Event deleted successfully!')
    } catch (error) {
      console.error('Failed to delete event:', error)
      toast.error('Failed to delete event')
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 space-y-4 md:space-y-0">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-electric-400 mb-3 leading-tight"
            >
              My Calendar
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-electric-300 text-lg md:text-xl lg:text-2xl font-semibold"
            >
              Manage your schedule and events
            </motion.p>
          </div>
          
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => setShowAddEvent(true)}
            className="bg-gradient-to-r from-electric-600 via-purple-600 to-electric-500 hover:from-electric-700 hover:via-purple-700 hover:to-electric-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold transition-all duration-200 hover:scale-105 hover:shadow-glow flex items-center justify-center space-x-3 shadow-lg w-full md:w-auto"
          >
            <Plus className="w-5 h-5 md:w-6 md:h-6" />
            <span>Add Event</span>
          </motion.button>
        </div>

        {/* View Mode Toggle - Mobile Only */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex md:hidden mb-6 bg-gray-900 rounded-lg p-1 border border-gray-700"
        >
          {(['month', 'week', 'day'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === mode
                  ? 'bg-electric-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Calendar Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center mb-6 md:mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const newDate = new Date(currentDate)
              if (viewMode === 'month') {
                newDate.setMonth(newDate.getMonth() - 1)
              } else if (viewMode === 'week') {
                newDate.setDate(newDate.getDate() - 7)
              } else {
                newDate.setDate(newDate.getDate() - 1)
              }
              setCurrentDate(newDate)
            }}
            className="p-3 text-gray-400 hover:text-electric-400 transition-colors duration-200 hover:bg-gray-900 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
          
          <h2 className="text-xl md:text-3xl font-bold text-purple-400 mx-4 md:mx-8">
            {viewMode === 'month' && `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
            {viewMode === 'week' && `Week of ${getWeekDates(currentDate)[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            {viewMode === 'day' && currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const newDate = new Date(currentDate)
              if (viewMode === 'month') {
                newDate.setMonth(newDate.getMonth() + 1)
              } else if (viewMode === 'week') {
                newDate.setDate(newDate.getDate() + 7)
              } else {
                newDate.setDate(newDate.getDate() + 1)
              }
              setCurrentDate(newDate)
            }}
            className="p-3 text-gray-400 hover:text-purple-400 transition-colors duration-200 hover:bg-gray-900 rounded-lg"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
        </motion.div>

        {/* Calendar Views */}
        <AnimatePresence mode="wait">
          {viewMode === 'month' && (
            <motion.div 
              key="month"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-900 rounded-2xl p-4 md:p-8 border border-gray-700 shadow-xl"
            >
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 md:gap-2 mb-4 md:mb-6">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-electric-400 font-semibold py-2 md:py-3 text-sm md:text-lg">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1 md:gap-2">
                {days.map((day, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: day ? 1.02 : 1 }}
                    whileTap={{ scale: day ? 0.98 : 1 }}
                    className={`min-h-[80px] md:min-h-[140px] p-2 md:p-3 border rounded-lg md:rounded-xl transition-all duration-200 ${
                      day ? 'bg-gray-800 hover:bg-gray-700 cursor-pointer border-gray-600 hover:border-electric-500/50' : 'bg-transparent border-transparent'
                    } ${
                      day && day.toDateString() === new Date().toDateString() 
                        ? 'ring-2 ring-electric-500 shadow-glow' 
                        : ''
                    }`}
                    onClick={() => day && setSelectedDate(day)}
                  >
                    {day && (
                      <>
                        <div className="text-right mb-1 md:mb-2">
                          <span className={`text-xs md:text-sm font-medium ${
                            day.toDateString() === new Date().toDateString() 
                              ? 'text-electric-400' 
                              : 'text-gray-300'
                          }`}>
                            {day.getDate()}
                          </span>
                        </div>
                        
                        {/* Events for this day */}
                        <div className="space-y-1 md:space-y-2">
                          {getEventsForDate(day).slice(0, 2).map((event, eventIndex) => (
                            <motion.div
                              key={eventIndex}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: eventIndex * 0.1 }}
                              className="text-xs p-1 md:p-2 bg-gradient-to-r from-electric-600/30 to-purple-600/30 text-white rounded-md md:rounded-lg truncate border border-electric-500/20 shadow-sm"
                              title={event.title}
                            >
                              {event.title}
                            </motion.div>
                          ))}
                          {getEventsForDate(day).length > 2 && (
                            <div className="text-xs text-gray-400 text-center bg-gray-700/50 rounded-md md:rounded-lg p-1">
                              +{getEventsForDate(day).length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {viewMode === 'week' && (
            <motion.div 
              key="week"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-900 rounded-2xl p-4 md:p-8 border border-gray-700 shadow-xl"
            >
              {/* Week View - Mobile Optimized */}
              <div className="space-y-3">
                {getWeekDates(currentDate).map((day, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      day.toDateString() === new Date().toDateString()
                        ? 'bg-electric-600/20 border-electric-500/50'
                        : 'bg-gray-800 border-gray-600'
                    }`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className={`text-sm font-medium ${
                          day.toDateString() === new Date().toDateString()
                            ? 'text-electric-400'
                            : 'text-gray-300'
                        }`}>
                          {day.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className={`text-lg font-bold ${
                          day.toDateString() === new Date().toDateString()
                            ? 'text-electric-400'
                            : 'text-white'
                        }`}>
                          {day.getDate()}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {day.toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </div>
                    
                    {/* Events for this day */}
                    <div className="space-y-2">
                      {getEventsForDate(day).map((event, eventIndex) => (
                        <motion.div
                          key={eventIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: eventIndex * 0.1 }}
                          className="p-2 bg-gradient-to-r from-electric-600/30 to-purple-600/30 text-white rounded-lg border border-electric-500/20"
                        >
                          <div className="font-medium text-sm">{event.title}</div>
                          <div className="text-xs text-gray-300 mt-1">
                            {new Date(event.startTime).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </div>
                        </motion.div>
                      ))}
                      {getEventsForDate(day).length === 0 && (
                        <div className="text-gray-400 text-center py-2 text-sm">
                          No events
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {viewMode === 'day' && (
            <motion.div 
              key="day"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-900 rounded-2xl p-4 md:p-8 border border-gray-700 shadow-xl"
            >
              {/* Day View - Mobile Optimized */}
              <div className="text-center mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-electric-400 mb-2">
                  {currentDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <p className="text-gray-400 text-sm md:text-base">
                  {getDayEvents(currentDate).length} event{getDayEvents(currentDate).length !== 1 ? 's' : ''} scheduled
                </p>
              </div>
              
              <div className="space-y-3">
                {getDayEvents(currentDate).map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gradient-to-r from-electric-600/20 to-purple-600/20 rounded-lg border border-electric-500/30"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-lg mb-2">{event.title}</h4>
                        <div className="space-y-2 text-sm text-gray-300">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-electric-400" />
                            <span>
                              {new Date(event.startTime).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })} - {new Date(event.endTime).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-purple-400" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          {event.description && (
                            <div className="flex items-start space-x-2">
                              <User className="w-4 h-4 text-blue-400 mt-0.5" />
                              <span>{event.description}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button className="p-2 text-gray-400 hover:text-electric-400 transition-colors duration-200">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-400 transition-colors duration-200">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {getDayEvents(currentDate).length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-4">No events scheduled for today</p>
                    <button
                      onClick={() => setShowAddEvent(true)}
                      className="bg-electric-600 hover:bg-electric-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                    >
                      Add Your First Event
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Date Events */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-background-elevated rounded-2xl p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-purple-400">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {getEventsForDate(selectedDate).length === 0 ? (
                <p className="text-gray-400 text-center py-8">No events scheduled for this day</p>
              ) : (
                getEventsForDate(selectedDate).map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-background-tertiary rounded-xl p-4 border border-gray-600"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-electric-400 font-semibold mb-2">{event.title}</h4>
                        {event.description && (
                          <p className="text-gray-300 text-sm mb-2">{event.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors duration-200">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(event)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Add Event Modal */}
        <AnimatePresence>
          {showAddEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-background-elevated rounded-2xl p-6 w-full max-w-md border border-gray-700"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-electric-400">Add New Event</h3>
                  <button
                    onClick={() => setShowAddEvent(false)}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); handleAddEvent(); }} className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full bg-background-tertiary border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200"
                      placeholder="Enter event title"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Start Time *
                      </label>
                      <input
                        type="datetime-local"
                        value={newEvent.startTime}
                        onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                        className="w-full bg-background-tertiary border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        End Time
                      </label>
                      <input
                        type="datetime-local"
                        value={newEvent.endTime}
                        onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                        className="w-full bg-background-tertiary border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="w-full bg-background-tertiary border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200"
                      placeholder="Enter event description"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      className="w-full bg-background-tertiary border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-all duration-200"
                      placeholder="Enter event location"
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddEvent(false)}
                      className="flex-1 bg-background-tertiary hover:bg-background-secondary text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 border border-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-electric-600 via-purple-600 to-electric-500 hover:from-electric-700 hover:via-purple-700 hover:to-electric-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      Add Event
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
