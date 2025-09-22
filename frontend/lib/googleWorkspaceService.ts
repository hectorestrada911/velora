import { google } from 'googleapis';

export interface GoogleCredentials {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export interface EmailData {
  id: string;
  subject: string;
  from: string;
  to: string;
  body: string;
  date: string;
  threadId: string;
}

export interface CalendarEvent {
  summary: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  description?: string;
  attendees?: Array<{ email: string; displayName?: string }>;
}

export interface ExtractedTask {
  task: string;
  deadline?: string;
  priority: 'high' | 'medium' | 'low';
  source: string; // email subject or content
}

export class GoogleWorkspaceService {
  private oauth2Client: any;
  private gmail: any;
  private calendar: any;

  constructor(credentials?: GoogleCredentials) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/google/callback`
    );

    if (credentials) {
      this.oauth2Client.setCredentials(credentials);
      this.initializeApis();
    }
  }

  private initializeApis() {
    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  // Get Google OAuth URL for authentication
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/drive.readonly'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  // Exchange authorization code for tokens
  async getTokens(code: string): Promise<GoogleCredentials> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      this.initializeApis();
      return tokens;
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw new Error('Failed to get Google tokens');
    }
  }

  // Set credentials and initialize APIs
  setCredentials(credentials: GoogleCredentials) {
    this.oauth2Client.setCredentials(credentials);
    this.initializeApis();
  }

  // Get recent emails from Gmail
  async getRecentEmails(maxResults: number = 10): Promise<EmailData[]> {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults: maxResults,
        q: 'in:inbox'
      });

      const messages = response.data.messages || [];
      const emails: EmailData[] = [];

      for (const message of messages) {
        const emailData = await this.getEmailDetails(message.id);
        if (emailData) {
          emails.push(emailData);
        }
      }

      return emails;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw new Error('Failed to fetch emails');
    }
  }

  // Get detailed email content
  private async getEmailDetails(messageId: string): Promise<EmailData | null> {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });

      const message = response.data;
      const headers = message.payload?.headers || [];
      
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const from = headers.find(h => h.name === 'From')?.value || '';
      const to = headers.find(h => h.name === 'To')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';

      // Extract email body
      let body = '';
      if (message.payload?.body?.data) {
        body = Buffer.from(message.payload.body.data, 'base64').toString();
      } else if (message.payload?.parts) {
        for (const part of message.payload.parts) {
          if (part.mimeType === 'text/plain' && part.body?.data) {
            body = Buffer.from(part.body.data, 'base64').toString();
            break;
          }
        }
      }

      return {
        id: messageId,
        subject,
        from,
        to,
        body,
        date,
        threadId: message.threadId || ''
      };
    } catch (error) {
      console.error('Error getting email details:', error);
      return null;
    }
  }

  // Search emails by query
  async searchEmails(query: string, maxResults: number = 10): Promise<EmailData[]> {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults: maxResults,
        q: query
      });

      const messages = response.data.messages || [];
      const emails: EmailData[] = [];

      for (const message of messages) {
        const emailData = await this.getEmailDetails(message.id);
        if (emailData) {
          emails.push(emailData);
        }
      }

      return emails;
    } catch (error) {
      console.error('Error searching emails:', error);
      throw new Error('Failed to search emails');
    }
  }

  // Create calendar event
  async createCalendarEvent(event: CalendarEvent): Promise<any> {
    try {
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });

      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw new Error('Failed to create calendar event');
    }
  }

  // Get calendar events
  async getCalendarEvents(timeMin?: string, timeMax?: string): Promise<any[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax,
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw new Error('Failed to fetch calendar events');
    }
  }

  // Extract tasks and deadlines from email content
  async analyzeEmailForTasks(email: EmailData): Promise<ExtractedTask[]> {
    // This will be enhanced with AI analysis
    const tasks: ExtractedTask[] = [];
    
    // Basic keyword extraction for now
    const content = `${email.subject} ${email.body}`.toLowerCase();
    
    // Look for deadline indicators
    const deadlineKeywords = ['due', 'deadline', 'by', 'before', 'until'];
    const hasDeadline = deadlineKeywords.some(keyword => content.includes(keyword));
    
    // Look for task indicators
    const taskKeywords = ['please', 'need to', 'must', 'should', 'remind', 'send', 'call', 'meeting'];
    const hasTask = taskKeywords.some(keyword => content.includes(keyword));
    
    if (hasTask || hasDeadline) {
      tasks.push({
        task: email.subject,
        priority: hasDeadline ? 'high' : 'medium',
        source: email.from
      });
    }
    
    return tasks;
  }

  // Get user's Google profile
  async getUserProfile(): Promise<any> {
    try {
      const response = await this.gmail.users.getProfile({
        userId: 'me'
      });

      return response.data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw new Error('Failed to get user profile');
    }
  }

  // Check if credentials are valid
  async validateCredentials(): Promise<boolean> {
    try {
      await this.getUserProfile();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Refresh access token if needed
  async refreshTokenIfNeeded(): Promise<void> {
    try {
      await this.oauth2Client.refreshAccessToken();
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh token');
    }
  }
}

// Export a singleton instance
export const googleWorkspaceService = new GoogleWorkspaceService();
