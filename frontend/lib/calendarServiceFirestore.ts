import { Timestamp } from 'firebase/firestore'
import { firestoreService, FirestoreEvent, FirestoreReminder } from './firestoreService'

export interface CalendarEvent {
  id?: string
  title: string
  startTime: Date
  endTime: Date
  description?: string
  location?: string
}

export interface Reminder {
  id?: string
  title: string
  dueDate: Date
  priority: 'low' | 'medium' | 'high' | 'urgent'
  description?: string
  completed?: boolean
}

class CalendarServiceFirestore {
  private static instance: CalendarServiceFirestore

  static getInstance(): CalendarServiceFirestore {
    if (!CalendarServiceFirestore.instance) {
      CalendarServiceFirestore.instance = new CalendarServiceFirestore()
    }
    return CalendarServiceFirestore.instance
  }

  // Convert Firestore Timestamp to Date
  private timestampToDate(timestamp: Timestamp): Date {
    return timestamp.toDate()
  }

  // Convert Date to Firestore Timestamp
  private dateToTimestamp(date: Date): Timestamp {
    return Timestamp.fromDate(date)
  }

  // Events
  async addEvent(event: CalendarEvent): Promise<boolean> {
    try {
      const firestoreEvent: Omit<FirestoreEvent, 'id' | 'userId' | 'createdAt'> = {
        title: event.title,
        startTime: this.dateToTimestamp(event.startTime),
        endTime: this.dateToTimestamp(event.endTime),
        description: event.description,
        location: event.location
      }

      await firestoreService.addEvent(firestoreEvent)
      return true
    } catch (error) {
      console.error('Error adding event:', error)
      return false
    }
  }

  async getEvents(): Promise<CalendarEvent[]> {
    try {
      const firestoreEvents = await firestoreService.getEvents()
      return firestoreEvents.map(event => ({
        id: event.id,
        title: event.title,
        startTime: this.timestampToDate(event.startTime),
        endTime: this.timestampToDate(event.endTime),
        description: event.description,
        location: event.location
      }))
    } catch (error) {
      console.error('Error getting events:', error)
      return []
    }
  }

  async updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<boolean> {
    try {
      const firestoreUpdates: Partial<FirestoreEvent> = {}
      
      if (updates.title) firestoreUpdates.title = updates.title
      if (updates.startTime) firestoreUpdates.startTime = this.dateToTimestamp(updates.startTime)
      if (updates.endTime) firestoreUpdates.endTime = this.dateToTimestamp(updates.endTime)
      if (updates.description !== undefined) firestoreUpdates.description = updates.description
      if (updates.location !== undefined) firestoreUpdates.location = updates.location

      await firestoreService.updateEvent(eventId, firestoreUpdates)
      return true
    } catch (error) {
      console.error('Error updating event:', error)
      return false
    }
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      await firestoreService.deleteEvent(eventId)
      return true
    } catch (error) {
      console.error('Error deleting event:', error)
      return false
    }
  }

  // Reminders
  async createReminder(reminder: Reminder): Promise<boolean> {
    try {
      const firestoreReminder: Omit<FirestoreReminder, 'id' | 'userId' | 'createdAt'> = {
        title: reminder.title,
        description: reminder.description,
        dueDate: this.dateToTimestamp(reminder.dueDate),
        priority: reminder.priority,
        completed: reminder.completed || false
      }

      await firestoreService.addReminder(firestoreReminder)
      return true
    } catch (error) {
      console.error('Error creating reminder:', error)
      return false
    }
  }

  async getReminders(): Promise<Reminder[]> {
    try {
      const firestoreReminders = await firestoreService.getReminders()
      return firestoreReminders.map(reminder => ({
        id: reminder.id,
        title: reminder.title,
        description: reminder.description,
        dueDate: this.timestampToDate(reminder.dueDate),
        priority: reminder.priority,
        completed: reminder.completed
      }))
    } catch (error) {
      console.error('Error getting reminders:', error)
      return []
    }
  }

  async updateReminder(reminderId: string, updates: Partial<Reminder>): Promise<boolean> {
    try {
      const firestoreUpdates: Partial<FirestoreReminder> = {}
      
      if (updates.title) firestoreUpdates.title = updates.title
      if (updates.description !== undefined) firestoreUpdates.description = updates.description
      if (updates.dueDate) firestoreUpdates.dueDate = this.dateToTimestamp(updates.dueDate)
      if (updates.priority) firestoreUpdates.priority = updates.priority
      if (updates.completed !== undefined) firestoreUpdates.completed = updates.completed

      await firestoreService.updateReminder(reminderId, firestoreUpdates)
      return true
    } catch (error) {
      console.error('Error updating reminder:', error)
      return false
    }
  }

  async deleteReminder(reminderId: string): Promise<boolean> {
    try {
      await firestoreService.deleteReminder(reminderId)
      return true
    } catch (error) {
      console.error('Error deleting reminder:', error)
      return false
    }
  }

  // Legacy methods for compatibility (now using Firestore)
  getStoredEvents(): CalendarEvent[] {
    // This will be replaced by real-time Firestore data
    return []
  }

  getStoredReminders(): Reminder[] {
    // This will be replaced by real-time Firestore data
    return []
  }

  // Notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }
}

export const calendarService = CalendarServiceFirestore.getInstance()
