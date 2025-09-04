'use client'

import { calendarService } from './calendarService'

export interface VoiceCommand {
  type: 'calendar' | 'reminder' | 'note' | 'navigation' | 'query'
  action: string
  data?: any
  confidence: number
}

export interface VoiceResult {
  success: boolean
  message: string
  data?: any
}

export class VoiceService {
  private static instance: VoiceService
  private recognition: any = null
  private isListening = false
  private onResultCallback: ((result: VoiceResult) => void) | null = null
  private onTranscriptCallback: ((transcript: string) => void) | null = null

  static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService()
    }
    return VoiceService.instance
  }

  constructor() {
    this.initializeSpeechRecognition()
  }

  private initializeSpeechRecognition() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        this.recognition.continuous = false
        this.recognition.interimResults = true
        this.recognition.lang = 'en-US'
        this.recognition.maxAlternatives = 1

        this.recognition.onstart = () => {
          this.isListening = true
          console.log('Voice recognition started')
        }

        this.recognition.onresult = (event: any) => {
          let finalTranscript = ''
          let interimTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          // Send interim results for real-time feedback
          if (interimTranscript && this.onTranscriptCallback) {
            this.onTranscriptCallback(interimTranscript)
          }

          // Process final transcript
          if (finalTranscript && this.onResultCallback) {
            this.processVoiceCommand(finalTranscript)
          }
        }

        this.recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          this.isListening = false
          if (this.onResultCallback) {
            this.onResultCallback({
              success: false,
              message: `Voice recognition error: ${event.error}`
            })
          }
        }

        this.recognition.onend = () => {
          this.isListening = false
          console.log('Voice recognition ended')
        }
      }
    }
  }

  async startListening(
    onResult: (result: VoiceResult) => void,
    onTranscript?: (transcript: string) => void
  ): Promise<boolean> {
    if (!this.recognition) {
      onResult({
        success: false,
        message: 'Speech recognition not supported in this browser'
      })
      return false
    }

    if (this.isListening) {
      onResult({
        success: false,
        message: 'Already listening'
      })
      return false
    }

    this.onResultCallback = onResult
    this.onTranscriptCallback = onTranscript

    try {
      this.recognition.start()
      return true
    } catch (error) {
      console.error('Failed to start voice recognition:', error)
      onResult({
        success: false,
        message: 'Failed to start voice recognition'
      })
      return false
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }
  }

  private async processVoiceCommand(transcript: string): Promise<void> {
    const command = this.parseVoiceCommand(transcript)
    
    try {
      let result: VoiceResult

      switch (command.type) {
        case 'calendar':
          result = await this.handleCalendarCommand(command, transcript)
          break
        case 'reminder':
          result = await this.handleReminderCommand(command, transcript)
          break
        case 'navigation':
          result = await this.handleNavigationCommand(command, transcript)
          break
        case 'query':
          result = await this.handleQueryCommand(command, transcript)
          break
        default:
          result = {
            success: false,
            message: 'I didn\'t understand that command. Try saying "schedule a meeting" or "remind me to"'
          }
      }

      if (this.onResultCallback) {
        this.onResultCallback(result)
      }
    } catch (error) {
      console.error('Error processing voice command:', error)
      if (this.onResultCallback) {
        this.onResultCallback({
          success: false,
          message: 'Sorry, I had trouble processing that command'
        })
      }
    }
  }

  private parseVoiceCommand(transcript: string): VoiceCommand {
    const text = transcript.toLowerCase().trim()
    
    // Calendar commands
    if (text.includes('schedule') || text.includes('meeting') || text.includes('appointment') || 
        text.includes('event') || text.includes('calendar')) {
      return {
        type: 'calendar',
        action: 'create',
        confidence: 0.9
      }
    }

    // Reminder commands
    if (text.includes('remind') || text.includes('reminder') || text.includes('don\'t forget')) {
      return {
        type: 'reminder',
        action: 'create',
        confidence: 0.9
      }
    }

    // Navigation commands
    if (text.includes('show') || text.includes('open') || text.includes('go to')) {
      if (text.includes('calendar')) {
        return {
          type: 'navigation',
          action: 'calendar',
          confidence: 0.8
        }
      }
      if (text.includes('reminder')) {
        return {
          type: 'navigation',
          action: 'reminders',
          confidence: 0.8
        }
      }
    }

    // Query commands
    if (text.includes('what') || text.includes('when') || text.includes('how many')) {
      return {
        type: 'query',
        action: 'info',
        confidence: 0.7
      }
    }

    // Default to note
    return {
      type: 'note',
      action: 'create',
      confidence: 0.5
    }
  }

  private async handleCalendarCommand(command: VoiceCommand, transcript: string): Promise<VoiceResult> {
    try {
      // Parse date and time from transcript
      const dateTime = this.extractDateTime(transcript)
      const title = this.extractTitle(transcript, 'calendar')
      
      if (!title) {
        return {
          success: false,
          message: 'I couldn\'t understand what event to schedule. Please try again.'
        }
      }

      const event = {
        title: title,
        startTime: dateTime.start,
        endTime: dateTime.end,
        description: `Created via voice command: "${transcript}"`,
        location: this.extractLocation(transcript)
      }

      const success = await calendarService.addToGoogleCalendar(event)
      
      if (success) {
        return {
          success: true,
          message: `✅ Scheduled "${title}" for ${dateTime.start.toLocaleDateString()} at ${dateTime.start.toLocaleTimeString()}`,
          data: event
        }
      } else {
        return {
          success: false,
          message: 'Failed to create calendar event'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error creating calendar event'
      }
    }
  }

  private async handleReminderCommand(command: VoiceCommand, transcript: string): Promise<VoiceResult> {
    try {
      const dateTime = this.extractDateTime(transcript)
      const title = this.extractTitle(transcript, 'reminder')
      
      if (!title) {
        return {
          success: false,
          message: 'I couldn\'t understand what to remind you about. Please try again.'
        }
      }

      const reminder = {
        title: title,
        dueDate: dateTime.start,
        priority: this.extractPriority(transcript),
        description: `Created via voice command: "${transcript}"`
      }

      const success = await calendarService.createReminder(reminder)
      
      if (success) {
        return {
          success: true,
          message: `🔔 Reminder set: "${title}" for ${dateTime.start.toLocaleDateString()} at ${dateTime.start.toLocaleTimeString()}`,
          data: reminder
        }
      } else {
        return {
          success: false,
          message: 'Failed to create reminder'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error creating reminder'
      }
    }
  }

  private async handleNavigationCommand(command: VoiceCommand, transcript: string): Promise<VoiceResult> {
    const action = command.action
    
    if (action === 'calendar') {
      window.location.href = '/calendar'
      return {
        success: true,
        message: 'Opening calendar...'
      }
    }
    
    if (action === 'reminders') {
      window.location.href = '/reminders'
      return {
        success: true,
        message: 'Opening reminders...'
      }
    }

    return {
      success: false,
      message: 'Navigation command not recognized'
    }
  }

  private async handleQueryCommand(command: VoiceCommand, transcript: string): Promise<VoiceResult> {
    // Get upcoming events and reminders
    const events = calendarService.getStoredEvents()
    const reminders = calendarService.getStoredReminders()
    
    const upcomingEvents = events.filter(event => 
      new Date(event.startTime) > new Date()
    ).slice(0, 3)
    
    const upcomingReminders = reminders.filter(reminder => 
      new Date(reminder.dueDate) > new Date() && !reminder.completed
    ).slice(0, 3)

    let message = ''
    
    if (upcomingEvents.length > 0) {
      message += `📅 You have ${upcomingEvents.length} upcoming events:\n`
      upcomingEvents.forEach(event => {
        message += `• ${event.title} on ${new Date(event.startTime).toLocaleDateString()}\n`
      })
    }
    
    if (upcomingReminders.length > 0) {
      message += `\n🔔 You have ${upcomingReminders.length} pending reminders:\n`
      upcomingReminders.forEach(reminder => {
        message += `• ${reminder.title} due ${new Date(reminder.dueDate).toLocaleDateString()}\n`
      })
    }
    
    if (message === '') {
      message = 'You have no upcoming events or reminders scheduled.'
    }

    return {
      success: true,
      message: message.trim()
    }
  }

  private extractDateTime(transcript: string): { start: Date; end: Date } {
    const now = new Date()
    let targetDate = new Date(now)
    
    // Parse relative dates
    if (transcript.includes('tomorrow')) {
      targetDate.setDate(now.getDate() + 1)
    } else if (transcript.includes('next week')) {
      targetDate.setDate(now.getDate() + 7)
    } else if (transcript.includes('next month')) {
      targetDate.setMonth(now.getMonth() + 1)
    }
    
    // Parse time
    const timeMatch = transcript.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i)
    if (timeMatch) {
      let hours = parseInt(timeMatch[1])
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0
      const period = timeMatch[3]?.toLowerCase()
      
      if (period === 'pm' && hours !== 12) {
        hours += 12
      } else if (period === 'am' && hours === 12) {
        hours = 0
      }
      
      targetDate.setHours(hours, minutes, 0, 0)
    } else {
      // Default to 1 hour from now
      targetDate.setHours(now.getHours() + 1, 0, 0, 0)
    }
    
    const endDate = new Date(targetDate)
    endDate.setHours(targetDate.getHours() + 1) // Default 1 hour duration
    
    return { start: targetDate, end: endDate }
  }

  private extractTitle(transcript: string, type: 'calendar' | 'reminder'): string {
    // Remove common command words
    let title = transcript
      .replace(/\b(schedule|meeting|appointment|event|remind|reminder|don't forget|to)\b/gi, '')
      .replace(/\b(tomorrow|next week|next month|at|on|for)\b/gi, '')
      .replace(/\b(\d{1,2}):?(\d{2})?\s*(am|pm)?\b/gi, '')
      .trim()
    
    // Capitalize first letter
    title = title.charAt(0).toUpperCase() + title.slice(1)
    
    return title || `${type === 'calendar' ? 'Meeting' : 'Reminder'}`
  }

  private extractLocation(transcript: string): string {
    const locationMatch = transcript.match(/(?:at|in|location)\s+([^,]+)/i)
    return locationMatch ? locationMatch[1].trim() : ''
  }

  private extractPriority(transcript: string): 'low' | 'medium' | 'high' | 'urgent' {
    if (transcript.includes('urgent') || transcript.includes('asap')) {
      return 'urgent'
    }
    if (transcript.includes('important') || transcript.includes('high')) {
      return 'high'
    }
    if (transcript.includes('low')) {
      return 'low'
    }
    return 'medium'
  }

  isSupported(): boolean {
    return this.recognition !== null
  }

  getListeningStatus(): boolean {
    return this.isListening
  }
}

// Export singleton instance
export const voiceService = VoiceService.getInstance()
