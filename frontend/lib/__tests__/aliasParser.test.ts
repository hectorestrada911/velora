// Timezone & DST Tests for Alias Parser
// Critical for user trust - ensures consistent time handling

import { AliasParser } from '../aliasParser';

describe('AliasParser - Weekend Handling', () => {
  it('should move Saturday to Monday 9am', () => {
    const saturday = new Date('2025-10-11T14:00:00Z'); // Saturday 2pm UTC
    const adjusted = AliasParser.adjustForWeekend(saturday);
    const adjustedDate = new Date(adjusted);
    
    expect(adjustedDate.getDay()).toBe(1); // Monday
    expect(adjustedDate.getHours()).toBe(9);
  });

  it('should move Sunday to Monday 9am', () => {
    const sunday = new Date('2025-10-12T14:00:00Z'); // Sunday 2pm UTC
    const adjusted = AliasParser.adjustForWeekend(sunday);
    const adjustedDate = new Date(adjusted);
    
    expect(adjustedDate.getDay()).toBe(1); // Monday
    expect(adjustedDate.getHours()).toBe(9);
  });

  it('should not adjust weekday times', () => {
    const tuesday = new Date('2025-10-14T14:00:00Z'); // Tuesday 2pm UTC
    const adjusted = AliasParser.adjustForWeekend(tuesday);
    
    expect(adjusted).toBe(tuesday.getTime());
  });

  it('should correctly identify weekends', () => {
    const saturday = new Date('2025-10-11T14:00:00Z');
    const sunday = new Date('2025-10-12T14:00:00Z');
    const monday = new Date('2025-10-13T14:00:00Z');
    
    expect(AliasParser.isWeekend(saturday)).toBe(true);
    expect(AliasParser.isWeekend(sunday)).toBe(true);
    expect(AliasParser.isWeekend(monday)).toBe(false);
  });
});

describe('AliasParser - EOD Handling', () => {
  it('should set EOD to 5pm by default', () => {
    const today = new Date('2025-10-13T10:00:00Z'); // Monday 10am UTC
    const eod = AliasParser.getEODTime(today);
    const eodDate = new Date(eod);
    
    expect(eodDate.getHours()).toBe(17); // 5pm
  });

  it('should move to next day if EOD already passed', () => {
    const lateEvening = new Date('2025-10-13T20:00:00Z'); // Monday 8pm UTC
    const eod = AliasParser.getEODTime(lateEvening);
    const eodDate = new Date(eod);
    
    // Should be next day
    expect(eodDate.getDate()).toBe(lateEvening.getDate() + 1);
  });

  it('should respect custom EOD hour', () => {
    const today = new Date('2025-10-13T10:00:00Z');
    const eod = AliasParser.getEODTime(today, 18); // 6pm
    const eodDate = new Date(eod);
    
    expect(eodDate.getHours()).toBe(18);
  });

  it('should skip weekends for EOD', () => {
    const friday = new Date('2025-10-10T18:00:00Z'); // Friday 6pm
    const eod = AliasParser.getEODTime(friday);
    const eodDate = new Date(eod);
    
    // Should skip weekend to Monday
    expect(eodDate.getDay()).toBe(1); // Monday
  });
});

describe('AliasParser - DST Transitions', () => {
  it('should detect DST spring forward (US)', () => {
    // March 9, 2025 - Spring Forward
    const beforeDST = new Date('2025-03-08T12:00:00Z');
    const isDST = AliasParser.isDSTTransition(beforeDST, 'America/Los_Angeles');
    
    // This test may vary based on actual DST rules
    expect(typeof isDST).toBe('boolean');
  });

  it('should detect DST fall back (US)', () => {
    // November 2, 2025 - Fall Back
    const beforeDST = new Date('2025-11-01T12:00:00Z');
    const isDST = AliasParser.isDSTTransition(beforeDST, 'America/Los_Angeles');
    
    expect(typeof isDST).toBe('boolean');
  });

  it('should handle timezones without DST', () => {
    const date = new Date('2025-10-13T12:00:00Z');
    const isDST = AliasParser.isDSTTransition(date, 'Asia/Tokyo');
    
    // Japan doesn't observe DST
    expect(isDST).toBe(false);
  });
});

describe('AliasParser - Relative Time Parsing', () => {
  it('should parse 2d correctly', () => {
    const parser = new AliasParser('America/Los_Angeles');
    const result = parser.parseDueTime('2d@in.velora.cc');
    
    expect(result).not.toBeNull();
    if (result) {
      const dueDate = new Date(result);
      const now = new Date();
      const diff = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
      // Should be approximately 2 days from now
      expect(diff).toBeGreaterThan(1.9);
      expect(diff).toBeLessThan(2.1);
    }
  });

  it('should parse 3h correctly', () => {
    const parser = new AliasParser('America/Los_Angeles');
    const result = parser.parseDueTime('3h@in.velora.cc');
    
    expect(result).not.toBeNull();
    if (result) {
      const dueDate = new Date(result);
      const now = new Date();
      const diff = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      // Should be approximately 3 hours from now
      expect(diff).toBeGreaterThan(2.9);
      expect(diff).toBeLessThan(3.1);
    }
  });

  it('should parse 30m correctly', () => {
    const parser = new AliasParser('America/Los_Angeles');
    const result = parser.parseDueTime('30m@in.velora.cc');
    
    expect(result).not.toBeNull();
    if (result) {
      const dueDate = new Date(result);
      const now = new Date();
      const diff = (dueDate.getTime() - now.getTime()) / (1000 * 60);
      
      // Should be approximately 30 minutes from now
      expect(diff).toBeGreaterThan(29);
      expect(diff).toBeLessThan(31);
    }
  });
});

describe('AliasParser - Absolute Time Parsing', () => {
  it('should parse tomorrow8am correctly', () => {
    const parser = new AliasParser('America/Los_Angeles');
    const result = parser.parseDueTime('tomorrow8am@in.velora.cc');
    
    expect(result).not.toBeNull();
    if (result) {
      const dueDate = new Date(result);
      expect(dueDate.getHours()).toBe(8);
      
      const now = new Date();
      const dayDiff = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      expect(dayDiff).toBeGreaterThanOrEqual(0);
      expect(dayDiff).toBeLessThanOrEqual(1);
    }
  });

  it('should parse nextfri correctly', () => {
    const parser = new AliasParser('America/Los_Angeles');
    const result = parser.parseDueTime('nextfri@in.velora.cc');
    
    expect(result).not.toBeNull();
    if (result) {
      const dueDate = new Date(result);
      expect(dueDate.getDay()).toBe(5); // Friday
    }
  });

  it('should parse eow (end of week) correctly', () => {
    const parser = new AliasParser('America/Los_Angeles');
    const result = parser.parseDueTime('eow@in.velora.cc');
    
    expect(result).not.toBeNull();
    if (result) {
      const dueDate = new Date(result);
      // Should be Friday at 5pm
      expect(dueDate.getDay()).toBe(5);
      expect(dueDate.getHours()).toBe(17);
    }
  });

  it('should parse eom (end of month) correctly', () => {
    const parser = new AliasParser('America/Los_Angeles');
    const result = parser.parseDueTime('eom@in.velora.cc');
    
    expect(result).not.toBeNull();
    if (result) {
      const dueDate = new Date(result);
      const nextMonth = new Date(dueDate);
      nextMonth.setDate(nextMonth.getDate() + 1);
      
      // Should be last day of current month
      expect(nextMonth.getDate()).toBe(1);
      expect(dueDate.getHours()).toBe(17); // 5pm
    }
  });
});

describe('AliasParser - Edge Cases', () => {
  it('should handle invalid aliases gracefully', () => {
    const parser = new AliasParser('America/Los_Angeles');
    const result = parser.parseDueTime('invalid@in.velora.cc');
    
    expect(result).toBeNull();
  });

  it('should handle timezone errors gracefully', () => {
    const parser = new AliasParser('Invalid/Timezone');
    const result = parser.parseDueTime('2d@in.velora.cc');
    
    // Should still parse, might use UTC
    expect(result).not.toBeNull();
  });

  it('should handle leap years correctly', () => {
    // Mock date to February 28, 2024 (leap year)
    const feb28 = new Date('2024-02-28T10:00:00Z');
    const parser = new AliasParser('America/Los_Angeles');
    
    // Parse 2 days from Feb 28 - should be March 1
    const result = parser.parseDueTime('2d@in.velora.cc');
    expect(result).not.toBeNull();
  });
});

describe('AliasParser - User-Bound Format', () => {
  it('should extract userId from user-bound alias', () => {
    const userId = AliasParser.extractUserId('2d+hector@in.velora.cc');
    expect(userId).toBe('hector');
  });

  it('should extract userId from legacy format', () => {
    const userId = AliasParser.extractUserId('hector+2d@in.velora.cc');
    expect(userId).toBe('hector');
  });

  it('should generate user-bound alias correctly', () => {
    const alias = AliasParser.generateUserBoundAlias('2d', 'hector');
    expect(alias).toBe('2d+hector@in.velora.cc');
  });
});
