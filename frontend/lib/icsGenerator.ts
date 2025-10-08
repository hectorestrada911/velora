// ICS Calendar File Generator
// Creates RFC 5545 compliant calendar files with timezone support

interface ICSEvent {
  summary: string;
  description: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  uid: string;
  url?: string;
  organizer?: {
    name: string;
    email: string;
  };
  attendees?: Array<{
    name?: string;
    email: string;
    required?: boolean;
  }>;
  reminders?: Array<{
    minutes: number;
    method: 'DISPLAY' | 'EMAIL' | 'AUDIO';
  }>;
  recurrence?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    interval?: number;
    until?: Date;
    count?: number;
  };
}

class ICSGenerator {
  /**
   * Format date to ICS format (YYYYMMDDTHHMMSSZ)
   */
  private formatDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    
    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1);
    const day = pad(date.getUTCDate());
    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());
    
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  }

  /**
   * Escape special characters in ICS text fields
   */
  private escapeText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '');
  }

  /**
   * Fold lines to 75 characters (RFC 5545 requirement)
   */
  private foldLine(line: string): string {
    if (line.length <= 75) return line;
    
    const chunks: string[] = [];
    let remaining = line;
    
    while (remaining.length > 75) {
      chunks.push(remaining.substring(0, 75));
      remaining = ' ' + remaining.substring(75);
    }
    
    if (remaining.length > 1) {
      chunks.push(remaining);
    }
    
    return chunks.join('\r\n');
  }

  /**
   * Generate ICS file content for a single event
   */
  generateICS(event: ICSEvent): string {
    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Velora//Follow-Up Radar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT'
    ];

    // Required fields
    lines.push(`UID:${event.uid}`);
    lines.push(`DTSTAMP:${this.formatDate(new Date())}`);
    lines.push(`DTSTART:${this.formatDate(event.startTime)}`);
    lines.push(`DTEND:${this.formatDate(event.endTime)}`);
    lines.push(`SUMMARY:${this.escapeText(event.summary)}`);

    // Optional fields
    if (event.description) {
      lines.push(`DESCRIPTION:${this.escapeText(event.description)}`);
    }

    if (event.location) {
      lines.push(`LOCATION:${this.escapeText(event.location)}`);
    }

    if (event.url) {
      lines.push(`URL:${event.url}`);
    }

    if (event.organizer) {
      lines.push(`ORGANIZER;CN=${this.escapeText(event.organizer.name)}:mailto:${event.organizer.email}`);
    }

    // Attendees
    if (event.attendees && event.attendees.length > 0) {
      event.attendees.forEach(attendee => {
        const role = attendee.required ? 'REQ-PARTICIPANT' : 'OPT-PARTICIPANT';
        const name = attendee.name ? `CN=${this.escapeText(attendee.name)}` : '';
        lines.push(`ATTENDEE;${name};ROLE=${role}:mailto:${attendee.email}`);
      });
    }

    // Reminders
    if (event.reminders && event.reminders.length > 0) {
      event.reminders.forEach(reminder => {
        lines.push('BEGIN:VALARM');
        lines.push(`ACTION:${reminder.method}`);
        lines.push(`TRIGGER:-PT${reminder.minutes}M`);
        if (reminder.method === 'DISPLAY') {
          lines.push('DESCRIPTION:Reminder');
        }
        lines.push('END:VALARM');
      });
    }

    // Recurrence
    if (event.recurrence) {
      let rrule = `FREQ=${event.recurrence.frequency}`;
      if (event.recurrence.interval) {
        rrule += `;INTERVAL=${event.recurrence.interval}`;
      }
      if (event.recurrence.until) {
        rrule += `;UNTIL=${this.formatDate(event.recurrence.until)}`;
      }
      if (event.recurrence.count) {
        rrule += `;COUNT=${event.recurrence.count}`;
      }
      lines.push(`RRULE:${rrule}`);
    }

    lines.push('STATUS:CONFIRMED');
    lines.push('SEQUENCE:0');
    lines.push('END:VEVENT');
    lines.push('END:VCALENDAR');

    // Fold long lines and join with CRLF
    return lines.map(line => this.foldLine(line)).join('\r\n');
  }

  /**
   * Generate ICS for a followup reminder
   */
  generateFollowupICS(followup: {
    id: string;
    subject: string;
    dueAt: number;
    participants: Array<{ name?: string; email: string }>;
    source: { snippet: string };
  }): string {
    const startTime = new Date(followup.dueAt);
    const endTime = new Date(followup.dueAt + 25 * 60 * 1000); // 25 minutes

    const description = [
      `Follow-up reminder for: ${followup.subject}`,
      '',
      'Triggered by:',
      `"${followup.source.snippet}"`,
      '',
      'Use this time block to handle the follow-up.',
      '',
      `View in Velora: https://velora.cc/radar?followup=${followup.id}`
    ].join('\\n');

    return this.generateICS({
      uid: `followup-${followup.id}@velora.cc`,
      summary: `Follow-up: ${followup.subject}`,
      description,
      location: 'Email',
      startTime,
      endTime,
      url: `https://velora.cc/radar?followup=${followup.id}`,
      attendees: followup.participants.map(p => ({
        name: p.name,
        email: p.email,
        required: true
      })),
      reminders: [
        { minutes: 15, method: 'DISPLAY' },
        { minutes: 5, method: 'DISPLAY' }
      ]
    });
  }

  /**
   * Generate Google Calendar URL
   */
  generateGoogleCalendarURL(event: {
    summary: string;
    description: string;
    location?: string;
    startTime: Date;
    endTime: Date;
  }): string {
    const formatGoogleDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.summary,
      details: event.description,
      dates: `${formatGoogleDate(event.startTime)}/${formatGoogleDate(event.endTime)}`,
      location: event.location || ''
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  /**
   * Generate Outlook Calendar URL
   */
  generateOutlookCalendarURL(event: {
    summary: string;
    description: string;
    location?: string;
    startTime: Date;
    endTime: Date;
  }): string {
    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: event.summary,
      body: event.description,
      startdt: event.startTime.toISOString(),
      enddt: event.endTime.toISOString(),
      location: event.location || ''
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  }

  /**
   * Generate all calendar links for a followup
   */
  generateAllLinks(followup: {
    id: string;
    subject: string;
    dueAt: number;
    participants: Array<{ name?: string; email: string }>;
    source: { snippet: string };
  }): {
    icsDownload: string;
    googleCalendar: string;
    outlookCalendar: string;
  } {
    const startTime = new Date(followup.dueAt);
    const endTime = new Date(followup.dueAt + 25 * 60 * 1000);

    const event = {
      summary: `Follow-up: ${followup.subject}`,
      description: `Follow-up reminder triggered by: "${followup.source.snippet}"\n\nView in Velora: https://velora.cc/radar?followup=${followup.id}`,
      location: 'Email',
      startTime,
      endTime
    };

    // Generate ICS and create data URL
    const icsContent = this.generateFollowupICS(followup);
    const icsBlob = new Blob([icsContent], { type: 'text/calendar' });
    const icsDataURL = URL.createObjectURL(icsBlob);

    return {
      icsDownload: icsDataURL,
      googleCalendar: this.generateGoogleCalendarURL(event),
      outlookCalendar: this.generateOutlookCalendarURL(event)
    };
  }
}

// Export singleton instance
export const icsGenerator = new ICSGenerator();
export default icsGenerator;

// Export types for use in other files
export { ICSEvent, ICSGenerator };
