import { initializeApp, getApps } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { logger } from './logger'

// Debug environment variables (removed for security)
// console.log('Firebase API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
// console.log('Firebase Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)

// Only initialize Firebase if we have valid config
let app: any = null
if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'demo-api-key') {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }
  
  logger.log('Initializing Firebase with config:', firebaseConfig)
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
} else {
  logger.log('Firebase not initialized - API key missing or demo key')
}

// Initialize Firebase services with fallback
export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null
export const storage = app ? getStorage(app) : null

// Configure auth persistence to keep users logged in
if (auth) {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Error setting auth persistence:', error)
  })
}

// Configure Firestore with better error handling
if (db) {
  // Enable network explicitly to ensure connectivity
  enableNetwork(db).catch((error) => {
    // Non-critical - Firestore will retry automatically
    // These errors are often false positives from connectivity checks
    if (process.env.NODE_ENV === 'development') {
      console.debug('Firestore network check (non-critical):', error.message)
    }
  })

  // Note: Firestore channel errors in console are often harmless
  // They occur when Firestore checks connectivity for real-time listeners
  // The SDK automatically retries, so these can be safely ignored
  // If you see persistent errors, check:
  // 1. Firebase project is active and billing is enabled
  // 2. Firestore security rules allow authenticated users
  // 3. Network connectivity to firestore.googleapis.com
}

export default app
