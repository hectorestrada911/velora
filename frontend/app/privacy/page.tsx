'use client'

import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
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
          <h2 className="text-2xl font-bold text-white mb-6">1. Information We Collect</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This may include your name, email address, and any content you choose to store in Velora.
          </p>

          <h2 className="text-2xl font-bold text-white mb-6">2. How We Use Your Information</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.
          </p>

          <h2 className="text-2xl font-bold text-white mb-6">3. Information Sharing</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information in certain limited circumstances, such as with your consent or to comply with legal obligations.
          </p>

          <h2 className="text-2xl font-bold text-white mb-6">4. Data Security</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
          </p>

          <h2 className="text-2xl font-bold text-white mb-6">5. Data Retention</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            We retain your information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time.
          </p>

          <h2 className="text-2xl font-bold text-white mb-6">6. Your Rights</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us. To exercise these rights, please contact us using the information provided below.
          </p>

          <h2 className="text-2xl font-bold text-white mb-6">7. Cookies and Tracking</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            We use cookies and similar tracking technologies to enhance your experience on our service. You can control cookie settings through your browser preferences.
          </p>

          <h2 className="text-2xl font-bold text-white mb-6">8. Third-Party Services</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Our service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies.
          </p>

          <h2 className="text-2xl font-bold text-white mb-6">9. Changes to This Policy</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>

          <h2 className="text-2xl font-bold text-white mb-6">10. Contact Us</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            If you have any questions about this Privacy Policy, please contact us at <a href="mailto:aincorphelp@gmail.com" className="text-electric-400 hover:text-electric-300 transition-colors">aincorphelp@gmail.com</a>.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
