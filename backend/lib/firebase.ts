import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Initialize Firebase for backend/server-side operations
// Uses environment variables without NEXT_PUBLIC_ prefix since this is server-side only
let app: any = null

if (
  process.env.FIREBASE_API_KEY && 
  process.env.FIREBASE_API_KEY !== 'demo-api-key' &&
  process.env.FIREBASE_PROJECT_ID
) {
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  }
  
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
} else {
  console.warn('Firebase not initialized - missing required environment variables')
}

// Export Firestore database instance
export const db = app ? getFirestore(app) : null

export default app
