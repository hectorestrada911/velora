'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from 'firebase/auth'

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
    // TODO: Initialize Firebase Auth
    // const unsubscribe = onAuthStateChanged(auth, (user) => {
    //   setUser(user)
    //   setLoading(false)
    // })
    
    // return unsubscribe
    
    // For now, simulate loading completion
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    // TODO: Implement Firebase sign in
    console.log('Sign in:', email, password)
  }

  const signUp = async (email: string, password: string) => {
    // TODO: Implement Firebase sign up
    console.log('Sign up:', email, password)
  }

  const signOut = async () => {
    // TODO: Implement Firebase sign out
    console.log('Sign out')
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
