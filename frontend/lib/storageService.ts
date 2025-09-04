import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  getMetadata 
} from 'firebase/storage'
import { storage } from './firebase'

export interface StoredFile {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedAt: Date
  userId: string
  content?: string
}

export class StorageService {
  private static instance: StorageService
  private currentUserId: string = 'current-user-id'

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService()
    }
    return StorageService.instance
  }

  setUserId(userId: string): void {
    this.currentUserId = userId
  }

  private getUserStorageRef() {
    if (!storage) {
      throw new Error('Firebase Storage not initialized')
    }
    return ref(storage, `users/${this.currentUserId}`)
  }

  async uploadFile(file: File, content?: string): Promise<StoredFile> {
    if (!storage) {
      throw new Error('Firebase Storage not initialized')
    }

    try {
      // Create a unique filename
      const timestamp = Date.now()
      const fileName = `${timestamp}_${file.name}`
      const fileRef = ref(this.getUserStorageRef(), fileName)

      // Upload the file
      const snapshot = await uploadBytes(fileRef, file)
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      // Get file metadata
      const metadata = await getMetadata(snapshot.ref)

      const storedFile: StoredFile = {
        id: snapshot.ref.name,
        name: file.name,
        url: downloadURL,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        userId: this.currentUserId,
        content: content
      }

      return storedFile
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  async getFiles(): Promise<StoredFile[]> {
    if (!storage) {
      throw new Error('Firebase Storage not initialized')
    }

    try {
      const userRef = this.getUserStorageRef()
      const result = await listAll(userRef)
      
      const files: StoredFile[] = []
      
      for (const itemRef of result.items) {
        try {
          const url = await getDownloadURL(itemRef)
          const metadata = await getMetadata(itemRef)
          
          files.push({
            id: itemRef.name,
            name: metadata.name || itemRef.name,
            url: url,
            size: metadata.size,
            type: metadata.contentType || 'unknown',
            uploadedAt: new Date(metadata.timeCreated),
            userId: this.currentUserId
          })
        } catch (error) {
          console.error('Error getting file metadata:', error)
        }
      }
      
      return files.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
    } catch (error) {
      console.error('Error getting files:', error)
      throw error
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    if (!storage) {
      throw new Error('Firebase Storage not initialized')
    }

    try {
      const fileRef = ref(this.getUserStorageRef(), fileId)
      await deleteObject(fileRef)
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  }

  async searchFiles(query: string): Promise<StoredFile[]> {
    const allFiles = await this.getFiles()
    const lowerQuery = query.toLowerCase()
    
    return allFiles.filter(file => 
      file.name.toLowerCase().includes(lowerQuery) ||
      (file.content && file.content.toLowerCase().includes(lowerQuery))
    )
  }

  async getFileContent(fileId: string): Promise<string> {
    if (!storage) {
      throw new Error('Firebase Storage not initialized')
    }

    try {
      const fileRef = ref(this.getUserStorageRef(), fileId)
      const url = await getDownloadURL(fileRef)
      
      // Fetch the file content
      const response = await fetch(url)
      const content = await response.text()
      
      return content
    } catch (error) {
      console.error('Error getting file content:', error)
      throw error
    }
  }
}

export const storageService = StorageService.getInstance()
