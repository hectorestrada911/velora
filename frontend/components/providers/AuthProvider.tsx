'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { firestoreService } from '@/lib/firestoreService'
import { ErrorHandler } from '@/lib/errorHandler'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      // Update FirestoreService with current user
      firestoreService.setCurrentUser(user)
      setLoading(false)
    })
    
    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error(ErrorHandler.getOperationErrorMessage('signin', { message: 'Firebase not initialized' }))
    }
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('Sign in error:', error)
      throw new Error(ErrorHandler.getOperationErrorMessage('signin', error))
    }
  }

  const signUp = async (email: string, password: string) => {
    if (!auth) {
      throw new Error(ErrorHandler.getOperationErrorMessage('signup', { message: 'Firebase not initialized' }))
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('Sign up error:', error)
      throw new Error(ErrorHandler.getOperationErrorMessage('signup', error))
    }
  }

  const signOut = async () => {
    if (!auth) {
      throw new Error(ErrorHandler.getOperationErrorMessage('signout', { message: 'Firebase not initialized' }))
    }
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('Sign out error:', error)
      throw new Error(ErrorHandler.getOperationErrorMessage('signout', error))
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
