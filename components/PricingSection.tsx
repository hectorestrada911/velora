'use client'

import { motion } from 'framer-motion'
import { Check, Star, Zap, Shield, Calendar, Download } from 'lucide-react'

export function PricingSection() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started with voice notes',
      features: [
        '30 transcriptions per month',
        '5 reminders per month',
        'Basic search & organization',
        'Export to text/markdown',
        'Mobile & web access'
      ],
      cta: 'Get Started Free',
      popular: false,
      icon: <Zap className="w-6 h-6" />
    },
    {
      name: 'Pro',
      price: '$9',
      period: 'per month',
      description: 'For power users who want unlimited productivity',
      features: [
        'Unlimited transcriptions',
        'Unlimited reminders',
        'Weekly AI recap emails',
        'Calendar integrations',
        'Advanced search & analytics',
        'Priority support',
        'Team collaboration (coming soon)'
      ],
      cta: 'Start Pro Trial',
      popular: true,
      icon: <Star className="w-6 h-6" />
    }
  ]

  return (
    <section id="pricing" className="py-20 bg-background-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-gray-100 mb-4"
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Start free, upgrade when you need more. No hidden fees, no surprises.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative ${
                plan.popular 
                  ? 'card-glow ring-2 ring-electric-500/50' 
                  : 'card hover:shadow-dark transition-shadow duration-300'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-electric-600 to-accent-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-glow">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                {/* Plan Icon */}
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-electric-500 to-accent-500 text-white shadow-glow' 
                    : 'bg-background-elevated text-gray-400 border border-gray-700'
                }`}>
                  {plan.icon}
                </div>

                {/* Plan Name & Price */}
                <h3 className="text-2xl font-bold text-gray-100 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-100">{plan.price}</span>
                  {plan.period !== 'forever' && (
                    <span className="text-gray-400 ml-1">/{plan.period}</span>
                  )}
                </div>
                <p className="text-gray-300">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-300 ${
                plan.popular
                  ? 'btn-primary'
                  : 'btn-secondary'
              }`}>
                {plan.cta}
              </button>

              {/* Additional Info */}
              {plan.name === 'Free' && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  No credit card required
                </p>
              )}
              {plan.name === 'Pro' && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  14-day free trial • Cancel anytime
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="flex flex-wrap justify-center items-center space-x-8 text-gray-500">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">256-bit encryption</span>
            </div>
            <div className="flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span className="text-sm">Export anytime</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">Calendar sync</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
