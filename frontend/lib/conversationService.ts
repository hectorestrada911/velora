import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore'
import { db } from './firebase'

export interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  analysis?: any
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  userId: string
}

export class ConversationService {
  private static instance: ConversationService
  private collectionName = 'conversations'

  static getInstance(): ConversationService {
    if (!ConversationService.instance) {
      ConversationService.instance = new ConversationService()
    }
    return ConversationService.instance
  }

  private getCurrentUserId(): string {
    // Return the current user ID set by the chat component
    return this.currentUserId
  }

  setUserId(userId: string): void {
    // This method allows the chat component to set the current user ID
    // We'll store it in a class property
    this.currentUserId = userId
  }

  private currentUserId: string = 'current-user-id'

  async createConversation(messages: Message[], title?: string): Promise<string> {
    if (!db) {
      throw new Error('Firebase not initialized')
    }

    const userId = this.getCurrentUserId()
    const conversationData = {
      title: title || this.generateTitle(messages),
      messages: messages.map(msg => ({
        ...msg,
        timestamp: Timestamp.fromDate(msg.timestamp)
      })),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      userId
    }

    const docRef = await addDoc(collection(db, this.collectionName), conversationData)
    return docRef.id
  }

  async updateConversation(conversationId: string, messages: Message[]): Promise<void> {
    if (!db) {
      throw new Error('Firebase not initialized')
    }

    const conversationRef = doc(db, this.collectionName, conversationId)
    await updateDoc(conversationRef, {
      messages: messages.map(msg => ({
        ...msg,
        timestamp: Timestamp.fromDate(msg.timestamp)
      })),
      updatedAt: Timestamp.now()
    })
  }

  async getConversations(limitCount: number = 50): Promise<Conversation[]> {
    if (!db) {
      console.log('Firebase not initialized, returning empty conversations')
      return []
    }

    try {
      const userId = this.getCurrentUserId()
      if (!userId || userId === 'current-user-id') {
        console.log('No valid user ID, returning empty conversations')
        return []
      }

      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      )

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          title: data.title,
          messages: data.messages.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp.toDate()
          })),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          userId: data.userId
        }
      })
    } catch (error) {
      console.error('Error in getConversations:', error)
      return []
    }
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    if (!db) {
      return null
    }

    const conversationRef = doc(db, this.collectionName, conversationId)
    const conversationDoc = await getDocs(query(collection(db, this.collectionName), where('__name__', '==', conversationId)))
    
    if (conversationDoc.empty) {
      return null
    }

    const data = conversationDoc.docs[0].data()
    return {
      id: conversationDoc.docs[0].id,
      title: data.title,
      messages: data.messages.map((msg: any) => ({
        ...msg,
        timestamp: msg.timestamp.toDate()
      })),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      userId: data.userId
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    if (!db) {
      throw new Error('Firebase not initialized')
    }

    const conversationRef = doc(db, this.collectionName, conversationId)
    await deleteDoc(conversationRef)
  }

  private generateTitle(messages: Message[]): string {
    if (messages.length === 0) return 'New Conversation'
    
    const firstUserMessage = messages.find(msg => msg.type === 'user')
    if (firstUserMessage) {
      const content = firstUserMessage.content
      return content.length > 50 ? content.substring(0, 50) + '...' : content
    }
    
    return 'New Conversation'
  }

  async saveCurrentConversation(messages: Message[], conversationId?: string): Promise<string> {
    if (conversationId) {
      await this.updateConversation(conversationId, messages)
      return conversationId
    } else {
      return await this.createConversation(messages)
    }
  }
}

export const conversationService = ConversationService.getInstance()
