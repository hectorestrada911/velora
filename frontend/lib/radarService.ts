// Follow-Up Radar Service
// Manages followup CRUD operations with Firestore

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  deleteDoc,
  limit as firestoreLimit,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Followup, 
  FollowupFilter, 
  RadarStats, 
  FollowDirection, 
  FollowStatus 
} from '@/types/radar';

const FOLLOWUPS_COLLECTION = 'followups';

class RadarService {
  /**
   * Create a new followup
   */
  async createFollowup(followup: Omit<Followup, 'id'>): Promise<string> {
    if (!db) throw new Error('Firestore not initialized');
    
    try {
      const docRef = await addDoc(collection(db, FOLLOWUPS_COLLECTION), {
        ...followup,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating followup:', error);
      throw error;
    }
  }

  /**
   * Get all followups for a user with optional filtering
   */
  async getFollowups(
    userId: string, 
    filter?: FollowupFilter
  ): Promise<Followup[]> {
    if (!db) return [];
    
    try {
      const constraints: QueryConstraint[] = [
        where('userId', '==', userId),
        orderBy('dueAt', 'asc')
      ];

      // Apply filters
      if (filter?.direction) {
        constraints.push(where('direction', '==', filter.direction));
      }

      if (filter?.status) {
        constraints.push(where('status', '==', filter.status));
      } else {
        // By default, exclude DONE and CANCELLED
        constraints.push(where('status', 'in', ['PENDING', 'SNOOZED']));
      }

      const q = query(collection(db, FOLLOWUPS_COLLECTION), ...constraints);
      const snapshot = await getDocs(q);

      let followups = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Followup[];

      // Apply timeframe filter (client-side for now)
      if (filter?.timeframe) {
        followups = this.filterByTimeframe(followups, filter.timeframe);
      }

      return followups;
    } catch (error) {
      console.error('Error fetching followups:', error);
      throw error;
    }
  }

  /**
   * Get a single followup by ID
   */
  async getFollowup(followupId: string): Promise<Followup | null> {
    if (!db) return null;
    
    try {
      const docRef = doc(db, FOLLOWUPS_COLLECTION, followupId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Followup;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching followup:', error);
      throw error;
    }
  }

  /**
   * Update a followup
   */
  async updateFollowup(
    followupId: string, 
    updates: Partial<Followup>
  ): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    
    try {
      const docRef = doc(db, FOLLOWUPS_COLLECTION, followupId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Error updating followup:', error);
      throw error;
    }
  }

  /**
   * Mark followup as done
   */
  async markDone(followupId: string): Promise<void> {
    await this.updateFollowup(followupId, {
      status: 'DONE',
      updatedAt: Date.now()
    });
  }

  /**
   * Snooze a followup until a specific time
   */
  async snoozeFollowup(followupId: string, until: number): Promise<void> {
    await this.updateFollowup(followupId, {
      status: 'SNOOZED',
      snoozeUntil: until,
      dueAt: until, // Update dueAt to the snooze time
      updatedAt: Date.now()
    });
  }

  /**
   * Cancel a followup
   */
  async cancelFollowup(followupId: string): Promise<void> {
    await this.updateFollowup(followupId, {
      status: 'CANCELLED',
      updatedAt: Date.now()
    });
  }

  /**
   * Delete a followup permanently
   */
  async deleteFollowup(followupId: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    
    try {
      const docRef = doc(db, FOLLOWUPS_COLLECTION, followupId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting followup:', error);
      throw error;
    }
  }

  /**
   * Get radar statistics for a user
   */
  async getRadarStats(userId: string): Promise<RadarStats> {
    try {
      const followups = await this.getFollowups(userId);
      const now = Date.now();
      const startOfToday = new Date().setHours(0, 0, 0, 0);
      const endOfToday = new Date().setHours(23, 59, 59, 999);

      return {
        overdueCount: followups.filter(f => f.dueAt < now && f.status === 'PENDING').length,
        todayCount: followups.filter(f => 
          f.dueAt >= startOfToday && 
          f.dueAt <= endOfToday && 
          f.status === 'PENDING'
        ).length,
        upcomingCount: followups.filter(f => 
          f.dueAt > endOfToday && 
          f.status === 'PENDING'
        ).length,
        youOweCount: followups.filter(f => 
          f.direction === 'YOU_OWE' && 
          f.status === 'PENDING'
        ).length,
        theyOweCount: followups.filter(f => 
          f.direction === 'THEY_OWE' && 
          f.status === 'PENDING'
        ).length
      };
    } catch (error) {
      console.error('Error calculating radar stats:', error);
      return {
        overdueCount: 0,
        todayCount: 0,
        upcomingCount: 0,
        youOweCount: 0,
        theyOweCount: 0
      };
    }
  }

  /**
   * Check if a thread already has a followup (deduplication)
   */
  async findByThreadKey(userId: string, threadKey: string): Promise<Followup | null> {
    if (!db) return null;
    
    try {
      const q = query(
        collection(db, FOLLOWUPS_COLLECTION),
        where('userId', '==', userId),
        where('threadKey', '==', threadKey),
        where('status', 'in', ['PENDING', 'SNOOZED']),
        firestoreLimit(1)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        } as Followup;
      }
      
      return null;
    } catch (error) {
      console.error('Error finding followup by thread key:', error);
      return null;
    }
  }

  /**
   * Filter followups by timeframe (client-side)
   */
  private filterByTimeframe(
    followups: Followup[], 
    timeframe: 'overdue' | 'today' | 'upcoming'
  ): Followup[] {
    const now = Date.now();
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const endOfToday = new Date().setHours(23, 59, 59, 999);

    switch (timeframe) {
      case 'overdue':
        return followups.filter(f => f.dueAt < now);
      case 'today':
        return followups.filter(f => f.dueAt >= startOfToday && f.dueAt <= endOfToday);
      case 'upcoming':
        return followups.filter(f => f.dueAt > endOfToday);
      default:
        return followups;
    }
  }

  /**
   * Generate a thread key for deduplication
   */
  generateThreadKey(messageId: string, participants: string[]): string {
    const sortedParticipants = [...participants].sort().join(',');
    const raw = `${messageId}:${sortedParticipants}`;
    
    // Simple hash function (for production, use crypto.subtle.digest)
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `thread_${Math.abs(hash).toString(36)}`;
  }

  /**
   * Generate draft for a followup (calls backend API)
   */
  async generateDraft(
    followupId: string, 
    tone: 'polite' | 'firm' | 'casual' | 'professional' = 'polite'
  ): Promise<string> {
    try {
      const response = await fetch(`/api/followups/${followupId}/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone })
      });

      if (!response.ok) {
        throw new Error('Failed to generate draft');
      }

      const data = await response.json();
      
      // Update followup with the draft
      await this.updateFollowup(followupId, {
        draft: data.draftText,
        draftGeneratedAt: Date.now(),
        analytics: {
          draftsGenerated: (await this.getFollowup(followupId))?.analytics?.draftsGenerated || 0 + 1,
          lastDraftAt: Date.now()
        }
      });

      return data.draftText;
    } catch (error) {
      console.error('Error generating draft:', error);
      throw error;
    }
  }
}

export const radarService = new RadarService();
export default radarService;

