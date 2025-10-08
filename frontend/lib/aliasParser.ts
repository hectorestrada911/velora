// Alias Parser for Follow-Up Radar
// Parses BCC aliases like 2d@, tomorrow8am@, follow@, etc.

import { ParsedAlias } from '@/types/radar';

export interface AliasParseResult {
  dueAt?: number;          // Computed due time (undefined for smart aliases)
  aliasType: 'absolute' | 'relative' | 'smart' | 'capture';
  matched: boolean;
  rawAlias: string;
}

export class AliasParser {
  private timezone: string;

  constructor(timezone: string = 'America/Los_Angeles') {
    this.timezone = timezone;
  }

  /**
   * Parse a BCC alias and compute due time
   * Examples: 2d@, 5m@, tomorrow8am@, nextfri@, eow@, follow@, todo@
   */
  parse(emailAddress: string): AliasParseResult {
    // Extract alias part before @
    const aliasMatch = emailAddress.match(/^([^@]+)@/);
    if (!aliasMatch) {
      return { matched: false, aliasType: 'smart', rawAlias: emailAddress };
    }

    const alias = aliasMatch[1].toLowerCase();

    // Relative time aliases: 5m@, 2h@, 3d@
    const relativeMatch = alias.match(/^(\d+)(m|h|d)$/);
    if (relativeMatch) {
      const [, amount, unit] = relativeMatch;
      const dueAt = this.parseRelativeTime(parseInt(amount), unit as 'm' | 'h' | 'd');
      return { 
        dueAt, 
        aliasType: 'relative', 
        matched: true, 
        rawAlias: alias 
      };
    }

    // Tomorrow with optional time: tomorrow@, tomorrow8am@, tomorrow2pm@
    const tomorrowMatch = alias.match(/^tomorrow(\d{1,2})?(am|pm)?$/);
    if (tomorrowMatch) {
      const [, hour, meridiem] = tomorrowMatch;
      const dueAt = this.parseTomorrow(hour, meridiem);
      return { 
        dueAt, 
        aliasType: 'absolute', 
        matched: true, 
        rawAlias: alias 
      };
    }

    // Next day of week: nextmon@, nexttue@, nextfri@
    const nextDayMatch = alias.match(/^next(mon|tue|wed|thu|fri|sat|sun)$/);
    if (nextDayMatch) {
      const [, day] = nextDayMatch;
      const dueAt = this.parseNextDay(day);
      return { 
        dueAt, 
        aliasType: 'absolute', 
        matched: true, 
        rawAlias: alias 
      };
    }

    // End of week/month: eow@, eom@
    if (alias === 'eow') {
      const dueAt = this.parseEndOfWeek();
      return { 
        dueAt, 
        aliasType: 'absolute', 
        matched: true, 
        rawAlias: alias 
      };
    }

    if (alias === 'eom') {
      const dueAt = this.parseEndOfMonth();
      return { 
        dueAt, 
        aliasType: 'absolute', 
        matched: true, 
        rawAlias: alias 
      };
    }

    // Smart aliases: follow@ (detect from content), todo@ (capture inbound)
    if (alias === 'follow') {
      return { 
        aliasType: 'smart', 
        matched: true, 
        rawAlias: alias 
      };
    }

    if (alias === 'todo') {
      return { 
        aliasType: 'capture', 
        matched: true, 
        rawAlias: alias 
      };
    }

    // No match
    return { matched: false, aliasType: 'smart', rawAlias: alias };
  }

  /**
   * Parse relative time (m, h, d)
   */
  private parseRelativeTime(amount: number, unit: 'm' | 'h' | 'd'): number {
    const now = Date.now();
    
    switch (unit) {
      case 'm':
        return now + (amount * 60 * 1000);
      case 'h':
        return now + (amount * 60 * 60 * 1000);
      case 'd':
        return now + (amount * 24 * 60 * 60 * 1000);
      default:
        return now;
    }
  }

  /**
   * Parse "tomorrow" with optional hour
   */
  private parseTomorrow(hour?: string, meridiem?: string): number {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (hour) {
      let hourNum = parseInt(hour);
      
      // Convert to 24-hour format
      if (meridiem === 'pm' && hourNum !== 12) {
        hourNum += 12;
      } else if (meridiem === 'am' && hourNum === 12) {
        hourNum = 0;
      }
      
      tomorrow.setHours(hourNum, 0, 0, 0);
    } else {
      // Default to 9am
      tomorrow.setHours(9, 0, 0, 0);
    }

    return tomorrow.getTime();
  }

  /**
   * Parse next occurrence of a day of week
   */
  private parseNextDay(dayAbbr: string): number {
    const dayMap: Record<string, number> = {
      'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3,
      'thu': 4, 'fri': 5, 'sat': 6
    };

    const targetDay = dayMap[dayAbbr];
    const today = new Date();
    const currentDay = today.getDay();

    // Calculate days until target day
    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) {
      daysUntil += 7; // Next week
    }

    const targetDate = new Date();
    targetDate.setDate(today.getDate() + daysUntil);
    targetDate.setHours(9, 0, 0, 0); // Default to 9am

    return targetDate.getTime();
  }

  /**
   * Parse end of week (Friday 5pm)
   */
  private parseEndOfWeek(): number {
    const today = new Date();
    const currentDay = today.getDay();
    
    // Days until Friday (5)
    let daysUntilFriday = 5 - currentDay;
    if (daysUntilFriday < 0) {
      daysUntilFriday += 7; // Next week
    }

    const friday = new Date();
    friday.setDate(today.getDate() + daysUntilFriday);
    friday.setHours(17, 0, 0, 0); // 5pm

    return friday.getTime();
  }

  /**
   * Parse end of month (last day at 5pm)
   */
  private parseEndOfMonth(): number {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    lastDay.setHours(17, 0, 0, 0); // 5pm

    return lastDay.getTime();
  }

  /**
   * Extract user ID from email alias
   * Examples:
   *   - hector+2d@in.velora.cc → hector
   *   - hector@in.velora.cc → hector
   */
  static extractUserId(emailAddress: string): string | null {
    // Match user part before + or @
    const match = emailAddress.match(/^([^+@]+)(?:\+[^@]*)?@/);
    return match ? match[1] : null;
  }

  /**
   * Check if email is a Velora alias
   */
  static isVeloraAlias(emailAddress: string): boolean {
    return emailAddress.includes('@in.velora.cc') || 
           emailAddress.includes('@velora.cc');
  }

  /**
   * Format due date for display
   */
  static formatDueDate(dueAt: number): string {
    const now = Date.now();
    const diff = dueAt - now;
    const date = new Date(dueAt);

    // Overdue
    if (diff < 0) {
      const absDiff = Math.abs(diff);
      const hours = Math.floor(absDiff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      
      if (days > 0) {
        return `${days}d overdue`;
      } else {
        return `${hours}h overdue`;
      }
    }

    // Today
    const isToday = date.toDateString() === new Date().toDateString();
    if (isToday) {
      return `Today at ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })}`;
    }

    // Tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    if (isTomorrow) {
      return `Tomorrow at ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })}`;
    }

    // This week
    const daysAway = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (daysAway < 7) {
      return `${date.toLocaleDateString('en-US', { weekday: 'short' })} at ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })}`;
    }

    // Future
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}

export default AliasParser;

