'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Bell, CheckCircle, Circle } from 'lucide-react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns'

interface CalendarEvent {
  id: string
  title: string
  date: Date
  type: 'reminder' | 'task' | 'note'
  priority: 'high' | 'medium' | 'low'
  completed?: boolean
}

interface CalendarProps {
  events?: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  onDateClick?: (date: Date) => void
}

export function Calendar({ events = [], onEventClick, onDateClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Mock events for demonstration
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Call John about project',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      type: 'reminder',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Review quarterly report',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      type: 'task',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Team meeting notes',
      date: new Date(),
      type: 'note',
      priority: 'low'
    }
  ]

  const displayEvents = events.length > 0 ? events : mockEvents

  const getEventsForDate = (date: Date) => {
    return displayEvents.filter(event => isSameDay(event.date, date))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-500/10'
      case 'medium': return 'border-yellow-500 bg-yellow-500/10'
      case 'low': return 'border-green-500 bg-green-500/10'
      default: return 'border-gray-500 bg-gray-500/10'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reminder': return <Bell className="w-3 h-3" />
      case 'task': return <CheckCircle className="w-3 h-3" />
      case 'note': return <Circle className="w-3 h-3" />
      default: return <Circle className="w-3 h-3" />
    }
  }

  const renderDailyView = () => {
    const dayEvents = getEventsForDate(selectedDate)
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-100">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
        </div>
        
        <div className="space-y-3">
          {dayEvents.length > 0 ? (
            dayEvents.map(event => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-lg border-l-4 ${getPriorityColor(event.priority)} cursor-pointer hover:bg-background-elevated transition-colors`}
                onClick={() => onEventClick?.(event)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(event.type)}
                    <span className="text-gray-200 font-medium">{event.title}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {format(event.date, 'h:mm a')}
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Your day is clear. Perfect time to capture new thoughts and ideas!</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderWeeklyView = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    const end = endOfWeek(currentDate, { weekStartsOn: 1 })
    const weekDays = eachDayOfInterval({ start, end })

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(day => {
            const dayEvents = getEventsForDate(day)
            const isToday = isSameDay(day, new Date())
            const isSelected = isSameDay(day, selectedDate)
            
            return (
              <motion.button
                key={day.toISOString()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedDate(day)
                  onDateClick?.(day)
                }}
                className={`p-2 rounded-lg text-center transition-all ${
                  isToday 
                    ? 'bg-electric-600 text-white shadow-glow' 
                    : isSelected 
                    ? 'bg-background-elevated border border-electric-500' 
                    : 'hover:bg-background-elevated'
                }`}
              >
                <div className="text-xs text-gray-400 mb-1">
                  {format(day, 'EEE')}
                </div>
                <div className={`text-lg font-semibold ${
                  isToday ? 'text-white' : 'text-gray-200'
                }`}>
                  {format(day, 'd')}
                </div>
                {dayEvents.length > 0 && (
                  <div className="flex justify-center mt-1">
                    {dayEvents.slice(0, 3).map((event, index) => (
                      <div
                        key={index}
                        className={`w-1.5 h-1.5 rounded-full mx-0.5 ${
                          event.priority === 'high' ? 'bg-red-400' :
                          event.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    )
  }

  const renderMonthlyView = () => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const monthDays = eachDayOfInterval({ start, end })
    
    // Pad the start to align with Monday
    const startDay = start.getDay()
    const paddedStart = startDay === 0 ? 6 : startDay - 1
    const paddedDays = Array(paddedStart).fill(null).concat(monthDays)

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="p-2 text-center text-xs font-medium text-gray-400">
              {day}
            </div>
          ))}
          
          {paddedDays.map((day, index) => {
            if (!day) {
              return <div key={index} className="p-2" />
            }
            
            const dayEvents = getEventsForDate(day)
            const isToday = isSameDay(day, new Date())
            const isSelected = isSameDay(day, selectedDate)
            
            return (
              <motion.button
                key={day.toISOString()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedDate(day)
                  onDateClick?.(day)
                }}
                className={`p-2 rounded-lg text-center transition-all ${
                  isToday 
                    ? 'bg-electric-600 text-white shadow-glow' 
                    : isSelected 
                    ? 'bg-background-elevated border border-electric-500' 
                    : 'hover:bg-background-elevated'
                }`}
              >
                <div className={`text-sm font-medium ${
                  isToday ? 'text-white' : 'text-gray-200'
                }`}>
                  {format(day, 'd')}
                </div>
                {dayEvents.length > 0 && (
                  <div className="flex justify-center mt-1">
                    {dayEvents.slice(0, 2).map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={`w-1 h-1 rounded-full mx-0.5 ${
                          event.priority === 'high' ? 'bg-red-400' :
                          event.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background-card rounded-xl p-6 border border-gray-800/50 shadow-card-glow">
              {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <CalendarIcon className="w-6 h-6 text-electric-400" />
            <h2 className="text-xl font-semibold text-gray-100">Never Miss What Matters</h2>
          </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 rounded-lg hover:bg-background-elevated transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </button>
          
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm bg-electric-600 hover:bg-electric-700 text-white rounded-lg transition-colors"
          >
            Today
          </button>
          
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 rounded-lg hover:bg-background-elevated transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-background-elevated rounded-xl p-1 border border-gray-700">
          {(['daily', 'weekly', 'monthly'] as const).map((viewOption) => (
            <button
              key={viewOption}
              onClick={() => setView(viewOption)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                view === viewOption
                  ? 'bg-gradient-to-r from-electric-600 to-electric-500 text-white shadow-glow'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {viewOption.charAt(0).toUpperCase() + viewOption.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {view === 'daily' && renderDailyView()}
          {view === 'weekly' && renderWeeklyView()}
          {view === 'monthly' && renderMonthlyView()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
