'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Bell, FileText, MessageSquare, ExternalLink, Plus } from 'lucide-react'
import { SmartSuggestion, CrossReference } from '@/lib/crossReferenceService'

interface SmartSuggestionsProps {
  suggestions: SmartSuggestion[]
  onSuggestionClick: (suggestion: SmartSuggestion) => void
  onRelatedItemClick: (item: CrossReference) => void
}

const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  suggestions,
  onSuggestionClick,
  onRelatedItemClick
}) => {
  if (suggestions.length === 0) return null

  const getIcon = (type: string) => {
    switch (type) {
      case 'calendar':
        return <Calendar className="w-4 h-4" />
      case 'reminder':
        return <Bell className="w-4 h-4" />
      case 'document':
        return <FileText className="w-4 h-4" />
      case 'conversation':
        return <MessageSquare className="w-4 h-4" />
      default:
        return <ExternalLink className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'calendar':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      case 'reminder':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'document':
        return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'conversation':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/20'
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    }
  }

  const getSuggestionIcon = (suggestionType: string) => {
    switch (suggestionType) {
      case 'related_content':
        return <ExternalLink className="w-4 h-4" />
      case 'follow_up':
        return <Plus className="w-4 h-4" />
      case 'connection':
        return <FileText className="w-4 h-4" />
      case 'action_item':
        return <Bell className="w-4 h-4" />
      default:
        return <ExternalLink className="w-4 h-4" />
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mt-4 space-y-3"
      >
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-gradient-to-r from-electric-500 to-purple-500 rounded-full animate-pulse" />
          <span>AI Memory Palace - Smart Suggestions</span>
        </div>

        {suggestions.map((suggestion) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:border-gray-600/50 transition-all duration-200"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-electric-500/20 to-purple-500/20 rounded-lg flex items-center justify-center text-electric-400">
                {getSuggestionIcon(suggestion.type)}
              </div>
              
              <div className="flex-1">
                <h4 className="text-white font-medium text-sm mb-1">
                  {suggestion.title}
                </h4>
                <p className="text-gray-300 text-xs mb-3">
                  {suggestion.description}
                </p>

                {suggestion.action && (
                  <p className="text-electric-300 text-xs italic mb-3">
                    {suggestion.action}
                  </p>
                )}

                {suggestion.relatedItems.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-gray-400 text-xs font-medium">Related Items:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestion.relatedItems.map((item) => (
                        <motion.button
                          key={item.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onRelatedItemClick(item)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all duration-200 hover:scale-105 ${getTypeColor(item.type)}`}
                        >
                          {getIcon(item.type)}
                          <span className="truncate max-w-32">{item.title}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="mt-3 px-3 py-1.5 bg-gradient-to-r from-electric-600/20 to-purple-600/20 border border-electric-500/30 rounded-lg text-electric-300 text-xs font-medium hover:from-electric-600/30 hover:to-purple-600/30 transition-all duration-200"
                >
                  View Details
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}

export default SmartSuggestions
