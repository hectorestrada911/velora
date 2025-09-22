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
  Timestamp,
  limit,
  startAfter
} from 'firebase/firestore'
import { db } from './firebase'
import { User } from 'firebase/auth'

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

export interface FirestoreConversation {
  id?: string
  userId: string
  title: string
  messages: FirestoreMessage[]
  createdAt: Timestamp
  updatedAt: Timestamp
  isActive: boolean
}

export interface FirestoreMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Timestamp
  metadata?: {
    suggestions?: string[]
    crossReferences?: string[]
    memoryIds?: string[]
    memoryContent?: string[]
    analysis?: any
  }
}

export interface FirestoreMemory {
  id?: string
  userId: string
  title: string
  content: string
  category: 'personal' | 'work' | 'project' | 'contact' | 'location' | 'other'
  tags: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
  accessCount: number
  lastAccessed: Timestamp
}

class FirestoreService {
  private currentUser: User | null = null

  setCurrentUser(user: User | null) {
    this.currentUser = user
  }

  private getUserId(): string {
    if (!this.currentUser) {
      throw new Error('User not authenticated')
    }
    return this.currentUser.uid
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

  // Conversations
  async createConversation(title: string): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized')
      }
      
      const conversationData: Omit<FirestoreConversation, 'id'> = {
        userId: this.getUserId(),
        title,
        messages: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isActive: true
      }
      
      const docRef = await addDoc(collection(db!, 'conversations'), conversationData)
      return docRef.id
    } catch (error) {
      console.error('Error creating conversation:', error)
      throw error
    }
  }

  async getConversations(): Promise<FirestoreConversation[]> {
    try {
      console.log('getConversations: Starting, db exists:', !!db)
      console.log('getConversations: Current user:', this.currentUser?.uid)
      
      if (!db) {
        console.error('getConversations: Firebase not initialized - db is null')
        throw new Error('Firebase not initialized')
      }
      
      const userId = this.getUserId()
      console.log('getConversations: User ID:', userId)
      
      const q = query(
        collection(db!, 'conversations'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      )
      
      console.log('getConversations: Executing query')
      const querySnapshot = await getDocs(q)
      console.log('getConversations: Query result:', querySnapshot.docs.length, 'documents')
      
      const conversations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreConversation[]
      
      console.log('getConversations: Returning', conversations.length, 'conversations')
      return conversations
    } catch (error) {
      console.error('getConversations: Error details:', {
        error,
        message: error instanceof Error ? error.message : String(error),
        code: (error as any)?.code,
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  }

  async addMessageToConversation(conversationId: string, message: Omit<FirestoreMessage, 'id' | 'timestamp'>): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized')
      }
      
      const conversationRef = doc(db!, 'conversations', conversationId)
      const conversationDoc = await getDocs(query(collection(db!, 'conversations'), where('__name__', '==', conversationId)))
      
      if (conversationDoc.empty) {
        throw new Error('Conversation not found')
      }
      
      const conversation = conversationDoc.docs[0].data() as FirestoreConversation
      const newMessage: FirestoreMessage = {
        ...message,
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Timestamp.now()
      }
      
      const updatedMessages = [...conversation.messages, newMessage]
      
      await updateDoc(conversationRef, {
        messages: updatedMessages,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error adding message to conversation:', error)
      throw error
    }
  }

  async getConversation(conversationId: string): Promise<FirestoreConversation | null> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized')
      }
      
      const q = query(
        collection(db!, 'conversations'),
        where('__name__', '==', conversationId),
        where('userId', '==', this.getUserId())
      )
      
      const querySnapshot = await getDocs(q)
      if (querySnapshot.empty) {
        return null
      }
      
      const doc = querySnapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data()
      } as FirestoreConversation
    } catch (error) {
      console.error('Error getting conversation:', error)
      throw error
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized')
      }
      
      const conversationRef = doc(db!, 'conversations', conversationId)
      await deleteDoc(conversationRef)
    } catch (error) {
      console.error('Error deleting conversation:', error)
      throw error
    }
  }

  // Memories
  async addMemory(memory: Omit<FirestoreMemory, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'accessCount' | 'lastAccessed'>): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized')
      }
      
      const now = Timestamp.now()
      const memoryData: Omit<FirestoreMemory, 'id'> = {
        ...memory,
        userId: this.getUserId(),
        createdAt: now,
        updatedAt: now,
        accessCount: 0,
        lastAccessed: now
      }
      
      const docRef = await addDoc(collection(db!, 'memories'), memoryData)
      return docRef.id
    } catch (error) {
      console.error('Error adding memory:', error)
      throw error
    }
  }

  async getMemories(): Promise<FirestoreMemory[]> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized')
      }
      
      const q = query(
        collection(db!, 'memories'),
        where('userId', '==', this.getUserId()),
        orderBy('updatedAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreMemory[]
    } catch (error) {
      console.error('Error getting memories:', error)
      throw error
    }
  }

  async searchMemories(searchQuery: string): Promise<FirestoreMemory[]> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized')
      }
      
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation - for production, consider using Algolia or similar
      const q = query(
        collection(db!, 'memories'),
        where('userId', '==', this.getUserId()),
        orderBy('updatedAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const allMemories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreMemory[]
      
      // Simple text search
      const searchTerm = searchQuery.toLowerCase()
      return allMemories.filter(memory => 
        memory.title.toLowerCase().includes(searchTerm) ||
        memory.content.toLowerCase().includes(searchTerm) ||
        memory.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    } catch (error) {
      console.error('Error searching memories:', error)
      throw error
    }
  }

  async updateMemory(memoryId: string, updates: Partial<FirestoreMemory>): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized')
      }
      
      const memoryRef = doc(db!, 'memories', memoryId)
      await updateDoc(memoryRef, {
        ...updates,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating memory:', error)
      throw error
    }
  }

  async deleteMemory(memoryId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase not initialized')
      }
      
      const memoryRef = doc(db!, 'memories', memoryId)
      await deleteDoc(memoryRef)
    } catch (error) {
      console.error('Error deleting memory:', error)
      throw error
    }
  }
}

export const firestoreService = new FirestoreService()
