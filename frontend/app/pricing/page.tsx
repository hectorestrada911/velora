'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ArrowRight, Star, Zap, Shield, Users, Crown, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, annual: 0 },
      description: 'Perfect for getting started',
      features: [
        'Up to 20 documents',
        '5 AI queries per day',
        'Basic voice notes',
        'Gmail integration only',
        'Email support'
      ],
      limitations: [
        'Limited AI queries',
        'Basic integrations',
        'Standard response time'
      ],
      cta: 'Get Started Free',
      ctaLink: '/auth',
      popular: false,
      color: 'from-gray-500 to-gray-600'
    },
    {
      name: 'Pro',
      price: { monthly: 10, annual: 99 },
      description: 'For power users and professionals',
      features: [
        'Unlimited documents',
        'Unlimited AI queries',
        'Advanced AI summaries',
        'Unlimited voice notes',
        'All integrations (Gmail, Drive, Calendar)',
        'Advanced search',
        'Export capabilities',
        'Priority support',
        '7-day free trial'
      ],
      limitations: [],
      cta: 'Start Pro Trial',
      ctaLink: '/auth',
      popular: true,
      color: 'from-electric-500 to-purple-500'
    },
    {
      name: 'Team',
      price: { monthly: 20, annual: 199 },
      description: 'For teams and organizations',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'Shared knowledge bases',
        'Admin controls',
        'Team analytics',
        'Priority onboarding',
        'Custom integrations',
        'Dedicated support'
      ],
      limitations: [],
      cta: 'Contact Sales',
      ctaLink: '/auth',
      popular: false,
      color: 'from-purple-500 to-pink-500'
    }
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex justify-between items-center px-12 py-6"
      >
        <Link href="/auth">
          <motion.h1 
            whileHover={{ scale: 1.05 }}
            className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-electric-500 via-purple-500 to-electric-600 bg-clip-text text-transparent cursor-pointer"
          >
            Velora
          </motion.h1>
        </Link>
        
        <Link href="/auth">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-electric-400 hover:text-electric-300 font-medium transition-colors duration-200"
          >
            Back to Sign In
          </motion.button>
        </Link>
      </motion.div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-20 h-20 bg-gradient-to-br from-electric-500/40 to-purple-500/40 rounded-2xl flex items-center justify-center border border-electric-500/60 backdrop-blur-sm mx-auto mb-8"
          >
            <Crown className="w-10 h-10 text-electric-400" />
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Choose your <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-500 to-purple-500">perfect plan</span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Start free, upgrade when you're ready. No hidden fees, cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-white' : 'text-gray-400'}`}>
              Monthly
            </span>
            <motion.button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                isAnnual ? 'bg-electric-500' : 'bg-gray-600'
              }`}
            >
              <motion.div
                animate={{ x: isAnnual ? 28 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-lg"
              />
            </motion.button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-white' : 'text-gray-400'}`}>
              Annual
            </span>
            {isAnnual && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium"
              >
                Save 17%
              </motion.span>
            )}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`relative bg-gray-900/60 rounded-2xl p-8 border transition-all duration-300 ${
                plan.popular 
                  ? 'border-electric-500/50 shadow-2xl shadow-electric-500/20 scale-105' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {plan.popular && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                >
                  <div className="bg-gradient-to-r from-electric-500 to-purple-500 text-white text-sm font-medium px-4 py-2 rounded-full flex items-center space-x-2">
                    <Star className="w-4 h-4" />
                    <span>Most Popular</span>
                  </div>
                </motion.div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">
                    ${isAnnual ? plan.price.annual : plan.price.monthly}
                  </span>
                  <span className="text-gray-400 ml-2">
                    /{isAnnual ? 'year' : 'month'}
                  </span>
                </div>

                {isAnnual && plan.price.annual > 0 && (
                  <p className="text-sm text-green-400 mb-4">
                    Save ${(plan.price.monthly * 12) - plan.price.annual}/year
                  </p>
                )}
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * featureIndex }}
                    className="flex items-center space-x-3"
                  >
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center flex-shrink-0`}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={plan.ctaLink}>
                  <button
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-electric-500 to-purple-500 hover:from-electric-400 hover:to-purple-400 text-white shadow-lg shadow-electric-500/25'
                        : plan.name === 'Free'
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-4xl mx-auto mt-20"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-900/40 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-300 text-sm">
                Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div className="bg-gray-900/40 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                Is there a free trial?
              </h3>
              <p className="text-gray-300 text-sm">
                Yes! Pro plan comes with a 7-day free trial. No credit card required to start.
              </p>
            </div>
            
            <div className="bg-gray-900/40 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                What happens to my data if I cancel?
              </h3>
              <p className="text-gray-300 text-sm">
                Your data is always yours. You can export everything before canceling, and we'll keep it for 30 days.
              </p>
            </div>
            
            <div className="bg-gray-900/40 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                Do you offer refunds?
              </h3>
              <p className="text-gray-300 text-sm">
                Yes! We offer a 30-day money-back guarantee. If you're not satisfied, we'll refund your payment.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 text-sm mb-6">
            Still have questions? We're here to help.
          </p>
          <Link href="/auth">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-electric-500 to-purple-500 hover:from-electric-400 hover:to-purple-400 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 mx-auto"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900/80 border-t border-gray-700/50 py-12 mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 text-sm text-gray-400">
              <a href="/terms" className="hover:text-white transition-colors duration-200">Terms of Service</a>
              <a href="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
              <button 
                onClick={() => {
                  const email = 'aincorphelp@gmail.com';
                  const subject = 'Contact Velora Support';
                  const body = 'Hello,\n\nI would like to get in touch regarding:';
                  window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                }}
                className="hover:text-white transition-colors duration-200 cursor-pointer"
              >
                Contact
              </button>
            </div>
            
            <div className="text-sm text-gray-500 text-center">
              © 2024 Velora. All rights reserved. • Engineered by <a href="https://aincorp.co" target="_blank" rel="noopener noreferrer" className="text-electric-400 hover:text-electric-300 transition-colors duration-200 font-medium">Aincorp</a>, San Francisco
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
