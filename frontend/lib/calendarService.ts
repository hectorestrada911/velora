export interface CalendarEvent {
  title: string;
  startTime: Date;
  endTime: Date;
  description?: string;
  location?: string;
}

export interface Reminder {
  title: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description?: string;
}

export class CalendarService {
  private static instance: CalendarService;
  private googleCalendarApiKey: string | null = null;

  static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  // Initialize Google Calendar API
  async initializeGoogleCalendar(): Promise<boolean> {
    try {
      // Check if Google Calendar API is available
      if (typeof window !== 'undefined' && window.gapi) {
        await window.gapi.load('client:auth2', async () => {
          if (window.gapi?.client) {
            await window.gapi.client.init({
              apiKey: process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY,
              clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
              scope: 'https://www.googleapis.com/auth/calendar.events'
            });
          }
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize Google Calendar:', error);
      return false;
    }
  }

  // Add event to Google Calendar
  async addToGoogleCalendar(event: CalendarEvent): Promise<boolean> {
    try {
      if (!window.gapi?.client?.calendar) {
        throw new Error('Google Calendar not initialized');
      }

      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: {
          summary: event.title,
          description: event.description,
          start: {
            dateTime: event.startTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: event.endTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          location: event.location
        }
      });

      return response.status === 200;
    } catch (error) {
      console.error('Failed to add to Google Calendar:', error);
      return false;
    }
  }

  // Create a local reminder (for now, just store in localStorage)
  async createReminder(reminder: Reminder): Promise<boolean> {
    try {
      const reminders = this.getStoredReminders();
      reminders.push({
        ...reminder,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      });
      
      localStorage.setItem('velora-reminders', JSON.stringify(reminders));
      
      // Schedule notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        const timeUntilReminder = reminder.dueDate.getTime() - Date.now();
        if (timeUntilReminder > 0) {
          setTimeout(() => {
            new Notification(reminder.title, {
              body: reminder.description || 'Time for your reminder!',
              icon: '/favicon.ico'
            });
          }, timeUntilReminder);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to create reminder:', error);
      return false;
    }
  }

  // Get stored reminders
  getStoredReminders(): Array<Reminder & { id: string; createdAt: string }> {
    try {
      const stored = localStorage.getItem('velora-reminders');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Delete reminder
  async deleteReminder(reminderId: string): Promise<boolean> {
    try {
      const reminders = this.getStoredReminders();
      const filtered = reminders.filter(r => r.id !== reminderId);
      localStorage.setItem('velora-reminders', JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete reminder:', error);
      return false;
    }
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
}

// Export singleton instance
export const calendarService = CalendarService.getInstance();
