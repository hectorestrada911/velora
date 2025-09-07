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
import { storageService, StoredFile } from './storageService'

export interface Document {
  id: string
  name: string
  type: string
  size: number
  storageId: string
  downloadUrl: string
  content?: string
  summary?: string
  tags: string[]
  category?: string
  userId: string
  uploadedAt: Date
  updatedAt: Date
}

export class DocumentService {
  private static instance: DocumentService
  private currentUserId: string = 'current-user-id'
  private collectionName = 'documents'

  static getInstance(): DocumentService {
    if (!DocumentService.instance) {
      DocumentService.instance = new DocumentService()
    }
    return DocumentService.instance
  }

  setUserId(userId: string): void {
    this.currentUserId = userId
    storageService.setUserId(userId)
  }

  private getCurrentUserId(): string {
    return this.currentUserId
  }

  async saveDocument(storedFile: StoredFile, content?: string, summary?: string): Promise<string> {
    if (!db) {
      throw new Error('Firebase not initialized')
    }

    try {
      const documentData = {
        name: storedFile.name,
        type: storedFile.type,
        size: storedFile.size,
        storageId: storedFile.id,
        downloadUrl: storedFile.url,
        content: content || '',
        summary: summary || '',
        tags: this.extractTags(storedFile.name, content),
        category: this.categorizeDocument(storedFile.name, content),
        userId: this.getCurrentUserId(),
        uploadedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      const docRef = await addDoc(collection(db, this.collectionName), documentData)
      return docRef.id
    } catch (error) {
      console.error('Error saving document:', error)
      throw error
    }
  }

  async getDocuments(limitCount: number = 50): Promise<Document[]> {
    if (!db) {
      console.log('Firebase not initialized, returning empty documents')
      return []
    }

    try {
      const userId = this.getCurrentUserId()
      if (!userId || userId === 'current-user-id') {
        console.log('No valid user ID, returning empty documents')
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
          name: data.name,
          type: data.type,
          size: data.size,
          storageId: data.storageId,
          downloadUrl: data.downloadUrl,
          content: data.content,
          summary: data.summary,
          tags: data.tags || [],
          category: data.category,
          userId: data.userId,
          uploadedAt: data.uploadedAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        }
      })
    } catch (error) {
      console.error('Error getting documents:', error)
      return []
    }
  }

  async searchDocuments(searchQuery: string): Promise<Document[]> {
    if (!db) {
      return []
    }

    try {
      const userId = this.getCurrentUserId()
      const lowerQuery = searchQuery.toLowerCase()
      
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId)
      )

      const querySnapshot = await getDocs(q)
      const allDocs = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.name,
          type: data.type,
          size: data.size,
          storageId: data.storageId,
          downloadUrl: data.downloadUrl,
          content: data.content,
          summary: data.summary,
          tags: data.tags || [],
          category: data.category,
          userId: data.userId,
          uploadedAt: data.uploadedAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        }
      })

      // Filter by search query
      return allDocs.filter(doc => 
        doc.name.toLowerCase().includes(lowerQuery) ||
        doc.content?.toLowerCase().includes(lowerQuery) ||
        doc.summary?.toLowerCase().includes(lowerQuery) ||
        doc.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
      )
    } catch (error) {
      console.error('Error searching documents:', error)
      throw error
    }
  }

  async deleteDocument(documentId: string): Promise<void> {
    if (!db) {
      throw new Error('Firebase not initialized')
    }

    try {
      // Get document to find storage ID
      const docRef = doc(db, this.collectionName, documentId)
      const docSnap = await getDocs(query(collection(db, this.collectionName), where('__name__', '==', documentId)))
      
      if (!docSnap.empty) {
        const documentData = docSnap.docs[0].data()
        
        // Delete from storage
        await storageService.deleteFile(documentData.storageId)
        
        // Delete from Firestore
        await deleteDoc(docRef)
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      throw error
    }
  }

  async updateDocument(documentId: string, updates: Partial<Document>): Promise<void> {
    if (!db) {
      throw new Error('Firebase not initialized')
    }

    try {
      const docRef = doc(db, this.collectionName, documentId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating document:', error)
      throw error
    }
  }

  private extractTags(fileName: string, content?: string): string[] {
    const tags: string[] = []
    
    // Extract tags from filename
    const nameLower = fileName.toLowerCase()
    if (nameLower.includes('resume') || nameLower.includes('cv')) tags.push('resume')
    if (nameLower.includes('contract')) tags.push('contract')
    if (nameLower.includes('invoice')) tags.push('invoice')
    if (nameLower.includes('receipt')) tags.push('receipt')
    if (nameLower.includes('report')) tags.push('report')
    if (nameLower.includes('proposal')) tags.push('proposal')
    
    // Extract tags from content
    if (content) {
      const contentLower = content.toLowerCase()
      if (contentLower.includes('experience') || contentLower.includes('skills')) tags.push('professional')
      if (contentLower.includes('education') || contentLower.includes('degree')) tags.push('education')
      if (contentLower.includes('project') || contentLower.includes('portfolio')) tags.push('project')
    }
    
    return Array.from(new Set(tags)) // Remove duplicates
  }

  private categorizeDocument(fileName: string, content?: string): string {
    const nameLower = fileName.toLowerCase()
    
    if (nameLower.includes('resume') || nameLower.includes('cv')) return 'resume'
    if (nameLower.includes('contract') || nameLower.includes('agreement')) return 'legal'
    if (nameLower.includes('invoice') || nameLower.includes('receipt')) return 'financial'
    if (nameLower.includes('report') || nameLower.includes('analysis')) return 'report'
    if (nameLower.includes('proposal') || nameLower.includes('presentation')) return 'business'
    
    return 'general'
  }
}

export const documentService = DocumentService.getInstance()
