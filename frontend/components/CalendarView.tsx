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
      // For now, we'll use mock data since Google Calendar integration needs API keys
      const mockEvents: CalendarEvent[] = [
        {
          title: 'Team Meeting',
          startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
          description: 'Weekly team sync meeting',
          location: 'Conference Room A'
        },
        {
          title: 'Project Deadline',
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hour later
          description: 'Q4 report submission deadline',
          location: 'Office'
        }
      ]
      setEvents(mockEvents)
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
        setEvents(prev => [...prev, event])
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
    <div className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-tertiary p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Calendar</h1>
            <p className="text-gray-400">Manage your schedule and events</p>
          </div>
          
          <button
            onClick={() => setShowAddEvent(true)}
            className="bg-gradient-to-r from-electric-600 to-electric-500 hover:from-electric-700 hover:to-electric-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-glow flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Event</span>
          </button>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <h2 className="text-2xl font-semibold text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-background-elevated rounded-2xl p-6 border border-gray-700">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-gray-400 font-medium py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <div
                key={index}
                className={`min-h-[120px] p-2 border border-gray-700 rounded-lg ${
                  day ? 'bg-background-tertiary hover:bg-background-secondary cursor-pointer' : 'bg-transparent'
                } ${
                  day && day.toDateString() === new Date().toDateString() 
                    ? 'ring-2 ring-electric-500' 
                    : ''
                }`}
                onClick={() => day && setSelectedDate(day)}
              >
                {day && (
                  <>
                    <div className="text-right mb-2">
                      <span className={`text-sm font-medium ${
                        day.toDateString() === new Date().toDateString() 
                          ? 'text-electric-400' 
                          : 'text-gray-300'
                      }`}>
                        {day.getDate()}
                      </span>
                    </div>
                    
                    {/* Events for this day */}
                    <div className="space-y-1">
                      {getEventsForDate(day).slice(0, 2).map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className="text-xs p-1 bg-electric-600/20 text-electric-300 rounded truncate"
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {getEventsForDate(day).length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{getEventsForDate(day).length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Date Events */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-background-elevated rounded-2xl p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">
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
                        <h4 className="text-white font-semibold mb-2">{event.title}</h4>
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
                  <h3 className="text-xl font-semibold text-white">Add New Event</h3>
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
                      className="flex-1 bg-gradient-to-r from-electric-600 to-electric-500 hover:from-electric-700 hover:to-electric-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105"
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
