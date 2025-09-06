import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore'
import { db } from './firebase'
import { useAuth } from '@/components/providers/AuthProvider'

export interface FirestoreEvent {
  id?: string
  title: string
  startTime: Timestamp
  endTime: Timestamp
  description?: string
  location?: string
  userId: string
  createdAt: Timestamp
}

export interface FirestoreReminder {
  id?: string
  title: string
  description?: string
  dueDate: Timestamp
  priority: 'low' | 'medium' | 'high' | 'urgent'
  completed: boolean
  userId: string
  createdAt: Timestamp
}

class FirestoreService {
  private getUserId(): string {
    // This will be called from components that have access to auth context
    // For now, we'll use a placeholder - in real implementation, this should come from auth context
    return 'current-user-id'
  }

  // Events
  async addEvent(event: Omit<FirestoreEvent, 'id' | 'userId' | 'createdAt'>): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized')
      }
      
      const eventData: Omit<FirestoreEvent, 'id'> = {
        ...event,
        userId: this.getUserId(),
        createdAt: Timestamp.now()
      }
      
      const docRef = await addDoc(collection(db!, 'events'), eventData)
      return docRef.id
    } catch (error) {
      console.error('Error adding event:', error)
      throw error
    }
  }

  async getEvents(): Promise<FirestoreEvent[]> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized')
      }
      
      const q = query(
        collection(db!, 'events'),
        where('userId', '==', this.getUserId()),
        orderBy('startTime', 'asc')
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreEvent[]
    } catch (error) {
      console.error('Error getting events:', error)
      throw error
    }
  }

  async updateEvent(eventId: string, updates: Partial<FirestoreEvent>): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized')
      }
      
      const eventRef = doc(db!, 'events', eventId)
      await updateDoc(eventRef, updates)
    } catch (error) {
      console.error('Error updating event:', error)
      throw error
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized')
      }
      
      const eventRef = doc(db!, 'events', eventId)
      await deleteDoc(eventRef)
    } catch (error) {
      console.error('Error deleting event:', error)
      throw error
    }
  }

  // Reminders
  async addReminder(reminder: Omit<FirestoreReminder, 'id' | 'userId' | 'createdAt'>): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized')
      }
      
      const reminderData: Omit<FirestoreReminder, 'id'> = {
        ...reminder,
        userId: this.getUserId(),
        createdAt: Timestamp.now()
      }
      
      const docRef = await addDoc(collection(db!, 'reminders'), reminderData)
      return docRef.id
    } catch (error) {
      console.error('Error adding reminder:', error)
      throw error
    }
  }

  async getReminders(): Promise<FirestoreReminder[]> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized')
      }
      
      const q = query(
        collection(db!, 'reminders'),
        where('userId', '==', this.getUserId()),
        orderBy('dueDate', 'asc')
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreReminder[]
    } catch (error) {
      console.error('Error getting reminders:', error)
      throw error
    }
  }

  async updateReminder(reminderId: string, updates: Partial<FirestoreReminder>): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized')
      }
      
      const reminderRef = doc(db!, 'reminders', reminderId)
      await updateDoc(reminderRef, updates)
    } catch (error) {
      console.error('Error updating reminder:', error)
      throw error
    }
  }

  async deleteReminder(reminderId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized')
      }
      
      const reminderRef = doc(db!, 'reminders', reminderId)
      await deleteDoc(reminderRef)
    } catch (error) {
      console.error('Error deleting reminder:', error)
      throw error
    }
  }
}

export const firestoreService = new FirestoreService()
