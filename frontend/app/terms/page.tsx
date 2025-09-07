'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Shield, FileText, Users, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800/50 bg-gradient-to-r from-gray-900/80 to-gray-800/50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link 
            href="/auth" 
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Velora
          </Link>
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-electric-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-electric-500/30">
              <FileText className="w-6 h-6 text-electric-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
              <p className="text-gray-400 mt-1">Last updated: December 2024</p>
            </div>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed">
            Please read these terms carefully before using Velora. By using our service, you agree to be bound by these terms.
          </p>
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
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-start space-x-4"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-electric-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-electric-500/30 flex-shrink-0 mt-1">
                <Shield className="w-4 h-4 text-electric-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-300 leading-relaxed">
                  By accessing and using Velora ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start space-x-4"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border border-purple-500/30 flex-shrink-0 mt-1">
                <FileText className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
                <p className="text-gray-300 leading-relaxed">
                  Velora is an AI-powered memory and productivity application that helps users organize their thoughts, manage tasks, and maintain intelligent connections between their ideas and activities.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-start space-x-4"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center border border-green-500/30 flex-shrink-0 mt-1">
                <Users className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
                <p className="text-gray-300 leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password.
                </p>
              </div>
            </motion.div>
          </div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-start space-x-4"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center border border-blue-500/30 flex-shrink-0 mt-1">
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">4. Privacy and Data</h2>
                <p className="text-gray-300 leading-relaxed">
                  Your privacy is important to us. Please review our <Link href="/privacy" className="text-electric-400 hover:text-electric-300 transition-colors">Privacy Policy</Link>, which also governs your use of the Service, to understand our practices.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-start space-x-4"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg flex items-center justify-center border border-red-500/30 flex-shrink-0 mt-1">
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">5. Prohibited Uses</h2>
                <p className="text-gray-300 leading-relaxed">
                  You may not use our Service for any unlawful purpose or to solicit others to perform unlawful acts. You may not violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-start space-x-4"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-lg flex items-center justify-center border border-yellow-500/30 flex-shrink-0 mt-1">
                <FileText className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property</h2>
                <p className="text-gray-300 leading-relaxed">
                  The Service and its original content, features, and functionality are and will remain the exclusive property of Velora and its licensors. The Service is protected by copyright, trademark, and other laws.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-start space-x-4"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-indigo-500/30 flex-shrink-0 mt-1">
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">7. Termination</h2>
                <p className="text-gray-300 leading-relaxed">
                  We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-start space-x-4"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-gray-500/20 to-slate-500/20 rounded-lg flex items-center justify-center border border-gray-500/30 flex-shrink-0 mt-1">
                <AlertTriangle className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">8. Disclaimer</h2>
                <p className="text-gray-300 leading-relaxed">
                  The information on this Service is provided on an "as is" basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms relating to our Service.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="flex items-start space-x-4"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-electric-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-electric-500/30 flex-shrink-0 mt-1">
                <Shield className="w-4 h-4 text-electric-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">9. Contact Information</h2>
                <p className="text-gray-300 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at <a href="mailto:aincorphelp@gmail.com" className="text-electric-400 hover:text-electric-300 transition-colors">aincorphelp@gmail.com</a>.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900/80 border-t border-gray-700/50 py-8 mt-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link>
            <a href="mailto:aincorphelp@gmail.com" className="hover:text-white transition-colors duration-200">Contact</a>
            <span>© 2024 Velora. All rights reserved.</span>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Engineered by <a href="https://aincorp.co" target="_blank" rel="noopener noreferrer" className="text-electric-400 hover:text-electric-300 transition-colors duration-200 font-medium">Aincorp</a>, San Francisco
          </div>
        </div>
      </footer>
    </div>
  )
}
