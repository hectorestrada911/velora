// Centralized error handling for user-friendly messages
export class ErrorHandler {
  // Convert Firebase/Firestore errors to user-friendly messages
  static getFirebaseErrorMessage(error: any): string {
    if (!error) return 'An unexpected error occurred'

    // Firebase Auth errors
    if (error.code) {
      switch (error.code) {
        // Authentication errors
        case 'auth/invalid-credential':
          return 'Invalid email or password. Please check your credentials and try again.'
        case 'auth/user-not-found':
          return 'No account found with this email. Please sign up first.'
        case 'auth/wrong-password':
          return 'Incorrect password. Please try again.'
        case 'auth/email-already-in-use':
          return 'An account with this email already exists. Please sign in instead.'
        case 'auth/weak-password':
          return 'Password is too weak. Please choose a stronger password.'
        case 'auth/invalid-email':
          return 'Please enter a valid email address.'
        case 'auth/too-many-requests':
          return 'Too many failed attempts. Please try again later.'
        case 'auth/network-request-failed':
          return 'Network error. Please check your connection and try again.'
        case 'auth/popup-closed-by-user':
          return 'Sign-in cancelled. Please try again if you want to continue.'
        case 'auth/popup-blocked':
          return 'Popup was blocked. Please allow popups and try again.'
        case 'auth/cancelled-popup-request':
          return 'Sign-in was cancelled. Please try again.'
        
        // Firestore errors
        case 'firestore/permission-denied':
          return 'You do not have permission to perform this action.'
        case 'firestore/unavailable':
          return 'Service temporarily unavailable. Please try again later.'
        case 'firestore/deadline-exceeded':
          return 'Request timed out. Please try again.'
        case 'firestore/resource-exhausted':
          return 'Too many requests. Please wait a moment and try again.'
        case 'firestore/unauthenticated':
          return 'Please sign in to continue.'
        case 'firestore/not-found':
          return 'The requested item was not found.'
        case 'firestore/already-exists':
          return 'This item already exists.'
        case 'firestore/failed-precondition':
          return 'Operation failed due to current state. Please try again.'
        case 'firestore/aborted':
          return 'Operation was cancelled. Please try again.'
        case 'firestore/out-of-range':
          return 'The operation is outside the valid range.'
        case 'firestore/unimplemented':
          return 'This feature is not yet available.'
        case 'firestore/internal':
          return 'Internal error. Please try again later.'
        case 'firestore/data-loss':
          return 'Data corruption detected. Please contact support.'
        
        // Storage errors
        case 'storage/unauthorized':
          return 'You do not have permission to access this file.'
        case 'storage/canceled':
          return 'Upload was cancelled.'
        case 'storage/unknown':
          return 'An unknown error occurred with file storage.'
        case 'storage/invalid-argument':
          return 'Invalid file or operation.'
        case 'storage/invalid-checksum':
          return 'File corruption detected. Please try uploading again.'
        case 'storage/invalid-event-name':
          return 'Invalid operation requested.'
        case 'storage/invalid-format':
          return 'Invalid file format.'
        case 'storage/invalid-url':
          return 'Invalid file URL.'
        case 'storage/missing-file':
          return 'File not found.'
        case 'storage/object-not-found':
          return 'File not found.'
        case 'storage/project-not-found':
          return 'Storage project not found.'
        case 'storage/quota-exceeded':
          return 'Storage quota exceeded. Please delete some files.'
        case 'storage/retry-limit-exceeded':
          return 'Upload failed after multiple attempts. Please try again.'
        case 'storage/server-file-wrong-size':
          return 'File size mismatch. Please try uploading again.'
        case 'storage/unauthenticated':
          return 'Please sign in to upload files.'
        case 'storage/upload-size-exceeded':
          return 'File is too large. Please choose a smaller file.'
        
        default:
          return error.message || 'An unexpected error occurred. Please try again.'
      }
    }

    // Handle generic errors
    if (error.message) {
      // Check for common error patterns
      if (error.message.includes('Firebase not initialized')) {
        return 'Service is not available. Please refresh the page and try again.'
      }
      if (error.message.includes('Network')) {
        return 'Network error. Please check your connection and try again.'
      }
      if (error.message.includes('Permission denied')) {
        return 'You do not have permission to perform this action.'
      }
      if (error.message.includes('Not found')) {
        return 'The requested item was not found.'
      }
      if (error.message.includes('Already exists')) {
        return 'This item already exists.'
      }
      if (error.message.includes('Invalid')) {
        return 'Invalid data provided. Please check your input and try again.'
      }
      if (error.message.includes('Timeout')) {
        return 'Request timed out. Please try again.'
      }
      if (error.message.includes('Quota exceeded')) {
        return 'Storage limit reached. Please delete some items and try again.'
      }
      
      return error.message
    }

    return 'An unexpected error occurred. Please try again.'
  }

  // Get user-friendly error message for specific operations
  static getOperationErrorMessage(operation: string, error: any): string {
    const baseMessage = this.getFirebaseErrorMessage(error)
    
    // Add operation-specific context
    switch (operation) {
      case 'signin':
        return baseMessage
      case 'signup':
        return baseMessage
      case 'signout':
        return 'Failed to sign out. Please try again.'
      case 'load-conversations':
        return 'Failed to load conversations. Please refresh and try again.'
      case 'save-conversation':
        return 'Failed to save conversation. Please try again.'
      case 'delete-conversation':
        return 'Failed to delete conversation. Please try again.'
      case 'load-documents':
        return 'Failed to load documents. Please refresh and try again.'
      case 'upload-document':
        return 'Failed to upload document. Please try again.'
      case 'delete-document':
        return 'Failed to delete document. Please try again.'
      case 'load-events':
        return 'Failed to load calendar events. Please refresh and try again.'
      case 'save-event':
        return 'Failed to save calendar event. Please try again.'
      case 'delete-event':
        return 'Failed to delete calendar event. Please try again.'
      case 'load-reminders':
        return 'Failed to load reminders. Please refresh and try again.'
      case 'save-reminder':
        return 'Failed to save reminder. Please try again.'
      case 'delete-reminder':
        return 'Failed to delete reminder. Please try again.'
      case 'load-memories':
        return 'Failed to load memories. Please refresh and try again.'
      case 'save-memory':
        return 'Failed to save memory. Please try again.'
      case 'delete-memory':
        return 'Failed to delete memory. Please try again.'
      case 'voice-recognition':
        return 'Voice recognition failed. Please try again.'
      case 'file-upload':
        return 'File upload failed. Please try again.'
      case 'ai-processing':
        return 'AI processing failed. Please try again.'
      default:
        return baseMessage
    }
  }

  // Check if error should be shown to user (some errors are expected)
  static shouldShowError(error: any, operation: string): boolean {
    // Don't show errors for expected scenarios
    if (error.message && error.message.includes('No documents')) {
      return false
    }
    if (error.message && error.message.includes('No conversations')) {
      return false
    }
    if (error.message && error.message.includes('No memories')) {
      return false
    }
    if (error.message && error.message.includes('No events')) {
      return false
    }
    if (error.message && error.message.includes('No reminders')) {
      return false
    }

    // Don't show network errors for non-critical operations
    if (operation === 'load-conversations' && error.code === 'firestore/unavailable') {
      return false
    }
    if (operation === 'load-documents' && error.code === 'firestore/unavailable') {
      return false
    }

    return true
  }
}
