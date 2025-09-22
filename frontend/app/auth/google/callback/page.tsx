'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (error) {
          throw new Error(`OAuth error: ${error}`)
        }

        if (!code) {
          throw new Error('No authorization code received')
        }

        // Exchange code for tokens
        const response = await fetch('/api/google/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code })
        })

        if (!response.ok) {
          throw new Error('Failed to exchange code for tokens')
        }

        const data = await response.json()

        if (data.success) {
          // Store tokens securely (in a real app, you'd store these in a secure backend)
          localStorage.setItem('google_workspace_tokens', JSON.stringify(data.tokens))
          
          setStatus('success')
          setMessage('Successfully connected to Google Workspace!')
          toast.success('Google Workspace connected successfully!')
          
          // Redirect back to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          throw new Error('Failed to connect to Google Workspace')
        }

      } catch (error) {
        console.error('OAuth callback error:', error)
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Failed to connect to Google Workspace')
        toast.error('Failed to connect to Google Workspace')
        
        // Redirect back to dashboard after error
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      }
    }

    handleCallback()
  }, [searchParams, router])

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-400" />
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-400" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'border-blue-500/20 bg-blue-500/10'
      case 'success':
        return 'border-green-500/20 bg-green-500/10'
      case 'error':
        return 'border-red-500/20 bg-red-500/10'
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className={`bg-gray-900 rounded-xl p-8 border ${getStatusColor()}`}>
          <div className="text-center">
            <div className="flex justify-center mb-6">
              {getStatusIcon()}
            </div>
            
            <h2 className="text-xl font-semibold text-white mb-4">
              {status === 'loading' && 'Connecting to Google Workspace...'}
              {status === 'success' && 'Connection Successful!'}
              {status === 'error' && 'Connection Failed'}
            </h2>
            
            <p className="text-gray-400 mb-6">
              {message}
            </p>

            {status === 'loading' && (
              <div className="space-y-2">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, ease: 'easeInOut' }}
                  />
                </div>
                <p className="text-xs text-gray-500">Please wait while we set up your integration...</p>
              </div>
            )}

            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-gray-400"
              >
                Redirecting you back to Velora...
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <p className="text-sm text-gray-400">
                  Redirecting you back to try again...
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-blue-400 hover:text-blue-300 text-sm underline"
                >
                  Return to Dashboard
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
