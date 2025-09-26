import { calendarService } from './calendarService'
import { memoryService } from './memoryService'
import { firestoreService } from './firestoreService'

export interface RealNotification {
  id: string
  type: 'reminder' | 'calendar' | 'urgent' | 'suggestion' | 'memory'
  title: string
  description: string
  time: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  isRead: boolean
  source: 'calendar' | 'reminder' | 'memory' | 'ai'
  action?: {
    label: string
    onClick: () => void
  }
  data?: any // Original data for actions
}

class NotificationService {
  private notifications: RealNotification[] = []
  private listeners: ((notifications: RealNotification[]) => void)[] = []

  // Subscribe to notification updates
  onNotificationsUpdate(callback: (notifications: RealNotification[]) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  // Notify all listeners
  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.notifications))
  }

  // Load real notifications from all sources
  async loadNotifications(): Promise<RealNotification[]> {
    const notifications: RealNotification[] = []
    
    try {
      // 1. Calendar notifications (upcoming events)
      const calendarNotifications = await this.getCalendarNotifications()
      notifications.push(...calendarNotifications)

      // 2. Reminder notifications (due/overdue tasks)
      const reminderNotifications = await this.getReminderNotifications()
      notifications.push(...reminderNotifications)

      // 3. Memory notifications (new memories, suggestions)
      const memoryNotifications = await this.getMemoryNotifications()
      notifications.push(...memoryNotifications)

      // 4. AI-generated suggestions
      const aiNotifications = await this.getAINotifications()
      notifications.push(...aiNotifications)

      this.notifications = notifications
      this.notifyListeners()
      
      return notifications
    } catch (error) {
      console.error('Error loading notifications:', error)
      return []
    }
  }

  // Get calendar-based notifications
  private async getCalendarNotifications(): Promise<RealNotification[]> {
    try {
      // Get stored events from calendar service
      const events = calendarService.getStoredEvents()
      const notifications: RealNotification[] = []
      const now = new Date()

      events.forEach(event => {
        const eventStart = new Date(event.startTime)
        const timeDiff = eventStart.getTime() - now.getTime()
        const hoursUntil = Math.floor(timeDiff / (1000 * 60 * 60))

        // Only show notifications for future events
        if (timeDiff > 0) {
          // Create notifications based on proximity to event
          if (hoursUntil <= 1 && hoursUntil > 0) {
            notifications.push({
              id: `calendar-${event.id}-urgent`,
              type: 'urgent',
              title: `⏰ ${event.title}`,
              description: `Starts in ${hoursUntil === 0 ? 'less than 1 hour' : `${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}`}`,
              time: this.getRelativeTime(eventStart),
              priority: 'urgent',
              isRead: false,
              source: 'calendar',
              action: {
                label: 'View Details',
                onClick: () => this.viewCalendarEvent(event.id)
              },
              data: event
            })
          } else if (hoursUntil <= 24 && hoursUntil > 1) {
            notifications.push({
              id: `calendar-${event.id}-upcoming`,
              type: 'calendar',
              title: `📅 ${event.title}`,
              description: `Tomorrow at ${eventStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
              time: this.getRelativeTime(eventStart),
              priority: 'high',
              isRead: false,
              source: 'calendar',
              action: {
                label: 'View Details',
                onClick: () => this.viewCalendarEvent(event.id)
              },
              data: event
            })
          }
        }
      })

      return notifications
    } catch (error) {
      console.error('Error getting calendar notifications:', error)
      return []
    }
  }

  // Get reminder-based notifications
  private async getReminderNotifications(): Promise<RealNotification[]> {
    try {
      // Get stored reminders from calendar service
      const reminders = calendarService.getStoredReminders()
      const notifications: RealNotification[] = []
      const now = new Date()

      reminders.forEach(reminder => {
        // Skip completed reminders
        if (reminder.completed) return

        const dueDate = new Date(reminder.dueDate)
        const timeDiff = dueDate.getTime() - now.getTime()
        const hoursUntil = Math.floor(timeDiff / (1000 * 60 * 60))

        // Check for overdue reminders
        if (timeDiff < 0) {
          notifications.push({
            id: `reminder-${reminder.id}-overdue`,
            type: 'urgent',
            title: `🚨 ${reminder.title}`,
            description: `Overdue by ${this.getOverdueTime(reminder.dueDate)}`,
            time: this.getRelativeTime(dueDate),
            priority: 'urgent',
            isRead: false,
            source: 'reminder',
            action: {
              label: 'Mark Complete',
              onClick: () => this.completeReminder(reminder.id)
            },
            data: reminder
          })
        }
        // Check for due reminders (due today)
        else if (hoursUntil <= 24 && hoursUntil > 0) {
          notifications.push({
            id: `reminder-${reminder.id}-due`,
            type: 'reminder',
            title: `⏰ ${reminder.title}`,
            description: `Due ${this.getDueTime(reminder.dueDate)}`,
            time: this.getRelativeTime(dueDate),
            priority: 'high',
            isRead: false,
            source: 'reminder',
            action: {
              label: 'Mark Complete',
              onClick: () => this.completeReminder(reminder.id)
            },
            data: reminder
          })
        }
      })

      return notifications
    } catch (error) {
      console.error('Error getting reminder notifications:', error)
      return []
    }
  }

  // Get memory-based notifications
  private async getMemoryNotifications(): Promise<RealNotification[]> {
    try {
      const notifications: RealNotification[] = []

      // Check for new memories that might need attention
      const recentMemories = await memoryService.getRecentMemories(7) // Last 7 days
      
      // Suggest reviewing memories if there are many new ones
      if (recentMemories.length >= 5) {
        notifications.push({
          id: 'memory-review-suggestion',
          type: 'suggestion',
          title: '🧠 Memory Review',
          description: `You've added ${recentMemories.length} new memories this week. Would you like to review them?`,
          time: '1 hour ago',
          priority: 'medium',
          isRead: false,
          source: 'memory',
          action: {
            label: 'Review Memories',
            onClick: () => this.viewMemories()
          }
        })
      }

      // Check for memory patterns that might need attention
      const memoryPatterns = await this.getMemoryPatterns()
      if (memoryPatterns.length > 0) {
        notifications.push({
          id: 'memory-pattern-suggestion',
          type: 'suggestion',
          title: '🔍 Memory Pattern Detected',
          description: `I noticed a pattern in your memories. Would you like to explore it?`,
          time: '2 hours ago',
          priority: 'low',
          isRead: false,
          source: 'memory',
          action: {
            label: 'Explore Pattern',
            onClick: () => this.exploreMemoryPatterns()
          }
        })
      }

      return notifications
    } catch (error) {
      console.error('Error getting memory notifications:', error)
      return []
    }
  }

  // Get AI-generated notifications
  private async getAINotifications(): Promise<RealNotification[]> {
    try {
      const notifications: RealNotification[] = []

      // AI suggestions based on user behavior
      const aiSuggestions = await this.getAISuggestions()
      aiSuggestions.forEach(suggestion => {
        notifications.push({
          id: `ai-${suggestion.id}`,
          type: 'suggestion',
          title: suggestion.title,
          description: suggestion.description,
          time: suggestion.time,
          priority: suggestion.priority,
          isRead: false,
          source: 'ai',
          action: suggestion.action,
          data: suggestion
        })
      })

      return notifications
    } catch (error) {
      console.error('Error getting AI notifications:', error)
      return []
    }
  }

  // Action handlers
  private viewCalendarEvent(eventId: string) {
    // Navigate to calendar or show event details
    console.log('View calendar event:', eventId)
    // TODO: Implement calendar event viewing
  }

  private async completeReminder(reminderId: string) {
    // Mark reminder as complete using calendar service
    try {
      await calendarService.markReminderComplete(reminderId)
      console.log('Reminder completed:', reminderId)
    } catch (error) {
      console.error('Error completing reminder:', error)
    }
  }

  private viewMemories() {
    // Navigate to memory section
    window.location.href = '/memory'
  }

  private exploreMemoryPatterns() {
    // Navigate to memory analytics
    window.location.href = '/memory'
  }

  // Utility methods
  private getRelativeTime(date: Date): string {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes} min ago`
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  private getOverdueTime(dueDate: string): string {
    const now = new Date()
    const due = new Date(dueDate)
    const diff = now.getTime() - due.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }

  private getDueTime(dueDate: string): string {
    const now = new Date()
    const due = new Date(dueDate)
    const diff = due.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours <= 0) return 'now'
    if (hours < 24) return `in ${hours} hour${hours > 1 ? 's' : ''}`
    return 'today'
  }

  // Mark notification as read
  markAsRead(notificationId: string) {
    this.notifications = this.notifications.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    )
    this.notifyListeners()
  }

  // Mark all as read
  markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, isRead: true }))
    this.notifyListeners()
  }

  // Get current notifications
  getNotifications(): RealNotification[] {
    return this.notifications
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length
  }
}

export const notificationService = new NotificationService()
