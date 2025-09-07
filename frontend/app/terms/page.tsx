'use client'

import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800/50 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link 
            href="/auth" 
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Velora
          </Link>
          <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
          <p className="text-gray-400 mt-2">Last updated: December 2024</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="prose prose-invert max-w-none"
        >
          <h2 className="text-2xl font-bold text-white mb-6">1. Acceptance of Terms</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            By accessing and using Velora ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>

          <h2 className="text-2xl font-bold text-white mb-6">2. Description of Service</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Velora is an AI-powered memory and productivity application that helps users organize their thoughts, manage tasks, and maintain intelligent connections between their ideas and activities.
          </p>

          <h2 className="text-2xl font-bold text-white mb-6">3. User Accounts</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password.
          </p>

          <h2 className="text-2xl font-bold text-white mb-6">4. Privacy and Data</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
          </p>

          <h2 className="text-2xl font-bold text-white mb-6">5. Prohibited Uses</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            You may not use our Service for any unlawful purpose or to solicit others to perform unlawful acts. You may not violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances.
          </p>

          <h2 className="text-2xl font-bold text-white mb-6">6. Intellectual Property</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            The Service and its original content, features, and functionality are and will remain the exclusive property of Velora and its licensors. The Service is protected by copyright, trademark, and other laws.
          </p>

          <h2 className="text-2xl font-bold text-white mb-6">7. Termination</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>

          <h2 className="text-2xl font-bold text-white mb-6">8. Disclaimer</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            The information on this Service is provided on an "as is" basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms relating to our Service.
          </p>

          <h2 className="text-2xl font-bold text-white mb-6">9. Contact Information</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            If you have any questions about these Terms of Service, please contact us at <a href="mailto:aincorphelp@gmail.com" className="text-electric-400 hover:text-electric-300 transition-colors">aincorphelp@gmail.com</a>.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
