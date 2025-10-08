'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, 
  Mail, 
  CheckCircle, 
  Calendar, 
  AlertCircle,
  Sparkles,
  MoreVertical,
  Trash2
} from 'lucide-react'
import { Followup } from '@/types/radar'
import { AliasParser } from '@/lib/aliasParser'
import { toast } from 'react-hot-toast'

interface FollowupCardProps {
  followup: Followup
  onDone: (id: string) => void
  onSnooze: (id: string, until: number) => void
  onGenerateDraft: (id: string) => void
  onDelete: (id: string) => void
}

export default function FollowupCard({
  followup,
  onDone,
  onSnooze,
  onGenerateDraft,
  onDelete
}: FollowupCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false)

  const isOverdue = followup.dueAt < Date.now()
  const otherParticipant = followup.participants.find(p => p.role === 'them')

  const handleGenerateDraft = async () => {
    setIsGeneratingDraft(true)
    try {
      await onGenerateDraft(followup.id)
      toast.success('Draft generated!')
    } catch (error) {
      toast.error('Failed to generate draft')
    } finally {
      setIsGeneratingDraft(false)
    }
  }

  const handleSnooze = (hours: number) => {
    const until = Date.now() + (hours * 60 * 60 * 1000)
    onSnooze(followup.id, until)
    toast.success(`Snoozed for ${hours}h`)
    setShowActions(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="relative group"
    >
      {/* Card */}
      <div className={`
        relative overflow-hidden rounded-xl p-4
        bg-gradient-to-br from-gray-900/90 to-gray-800/90
        backdrop-blur-xl border
        ${isOverdue 
          ? 'border-red-500/30 shadow-lg shadow-red-500/10' 
          : 'border-gray-700/50'
        }
        hover:border-electric-500/50 transition-all duration-300
      `}>
        {/* Glassmorphic overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-electric-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Subject */}
              <h3 className="text-white font-medium truncate">
                {followup.subject}
              </h3>
              
              {/* Participant */}
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                <Mail className="w-3.5 h-3.5" />
                <span className="truncate">
                  {otherParticipant?.name || otherParticipant?.email || 'Unknown'}
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div className={`
              px-2 py-1 rounded-lg text-xs font-medium
              ${followup.direction === 'YOU_OWE' 
                ? 'bg-orange-500/20 text-orange-300' 
                : 'bg-blue-500/20 text-blue-300'
              }
            `}>
              {followup.direction === 'YOU_OWE' ? 'You owe' : 'They owe'}
            </div>
          </div>

          {/* Receipt (Source Quote) */}
          {followup.source.snippet && (
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-electric-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Triggered by:</p>
                  <p className="text-sm text-gray-300 italic line-clamp-2">
                    "{followup.source.snippet}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Draft Preview */}
          {followup.draft && (
            <div className="bg-electric-500/10 rounded-lg p-3 border border-electric-500/20">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-electric-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-electric-400 mb-1">Draft ready:</p>
                  <p className="text-sm text-gray-300 line-clamp-3">
                    {followup.draft}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            {/* Due Time */}
            <div className={`
              flex items-center gap-1.5 text-sm
              ${isOverdue ? 'text-red-400' : 'text-gray-400'}
            `}>
              <Clock className="w-4 h-4" />
              <span className="font-medium">
                {AliasParser.formatDueDate(followup.dueAt)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!followup.draft && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGenerateDraft}
                  disabled={isGeneratingDraft}
                  className="px-3 py-1.5 rounded-lg bg-electric-500/20 text-electric-300 text-xs font-medium hover:bg-electric-500/30 transition-colors disabled:opacity-50"
                >
                  {isGeneratingDraft ? 'Generating...' : 'Draft'}
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDone(followup.id)}
                className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-300 text-xs font-medium hover:bg-green-500/30 transition-colors"
              >
                Done
              </motion.button>

              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowActions(!showActions)}
                  className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-400 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </motion.button>

                {/* Dropdown Menu */}
                {showActions && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowActions(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="absolute right-0 top-full mt-1 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden"
                    >
                      <button
                        onClick={() => handleSnooze(2)}
                        className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Snooze 2h
                      </button>
                      <button
                        onClick={() => handleSnooze(24)}
                        className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Snooze 1d
                      </button>
                      <button
                        onClick={() => handleSnooze(48)}
                        className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Snooze 2d
                      </button>
                      <div className="h-px bg-gray-700" />
                      <button
                        onClick={() => {
                          onDelete(followup.id)
                          setShowActions(false)
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Detection Info (subtle) */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="capitalize">{followup.detection.method.toLowerCase()}</span>
            <span>•</span>
            <span>{Math.round(followup.detection.confidence * 100)}% confidence</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

