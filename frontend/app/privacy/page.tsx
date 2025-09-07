'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, Settings, Mail } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
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
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
              <p className="text-gray-400 mt-1">Last updated: December 2024</p>
            </div>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed">
            Your privacy is our priority. This policy explains how we collect, use, and protect your information when you use Velora.
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
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center border border-blue-500/30 flex-shrink-0 mt-1">
                <Database className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
                <p className="text-gray-300 leading-relaxed">
                  We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This may include your name, email address, and any content you choose to store in Velora.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start space-x-4"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center border border-green-500/30 flex-shrink-0 mt-1">
                <Settings className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
                <p className="text-gray-300 leading-relaxed">
                  We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-start space-x-4"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border border-purple-500/30 flex-shrink-0 mt-1">
                <Eye className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">3. Information Sharing</h2>
                <p className="text-gray-300 leading-relaxed">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information in certain limited circumstances, such as with your consent or to comply with legal obligations.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-start space-x-4"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg flex items-center justify-center border border-red-500/30 flex-shrink-0 mt-1">
                <Lock className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
                <p className="text-gray-300 leading-relaxed">
                  We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-start space-x-4"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-lg flex items-center justify-center border border-yellow-500/30 flex-shrink-0 mt-1">
                <Database className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">5. Data Retention</h2>
                <p className="text-gray-300 leading-relaxed">
                  We retain your information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-start space-x-4"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-indigo-500/30 flex-shrink-0 mt-1">
                <UserCheck className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
                <p className="text-gray-300 leading-relaxed">
                  You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us. To exercise these rights, please contact us using the information provided below.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-start space-x-4"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-cyan-500/30 flex-shrink-0 mt-1">
                <Settings className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">7. Cookies and Tracking</h2>
                <p className="text-gray-300 leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your experience on our service. You can control cookie settings through your browser preferences.
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
                <Eye className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">8. Third-Party Services</h2>
                <p className="text-gray-300 leading-relaxed">
                  Our service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies.
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
                <h2 className="text-2xl font-bold text-white mb-4">9. Changes to This Policy</h2>
                <p className="text-gray-300 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="flex items-start space-x-4"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center border border-blue-500/30 flex-shrink-0 mt-1">
                <Mail className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">10. Contact Us</h2>
                <p className="text-gray-300 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at <a href="mailto:aincorphelp@gmail.com" className="text-electric-400 hover:text-electric-300 transition-colors">aincorphelp@gmail.com</a>.
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
            <Link href="/terms" className="hover:text-white transition-colors duration-200">Terms of Service</Link>
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